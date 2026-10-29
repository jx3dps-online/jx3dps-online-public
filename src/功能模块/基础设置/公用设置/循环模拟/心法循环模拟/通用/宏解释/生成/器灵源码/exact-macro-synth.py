"""CEGIS macro synthesis: unrestricted prototype or legacy bounded Z3 search.

Conditions, rank resolution, castability and complete replay come exclusively
from the Rust execution oracle. Python only solves ordered rule selection.
"""
import argparse
import hashlib
import importlib.util
import json
import math
import os
import re
from pathlib import Path
import queue
import random
import subprocess
import sys
import threading
import time

import z3

ROOT = Path(__file__).resolve().parents[1]
CANCELLED = threading.Event()
RUNNING = threading.Event()
RUNNING.set()
ACTIVE_SOLVER = None
SOLVER_LOCK = threading.Lock()
INTERRUPTED = threading.Event()
PAUSED_SECONDS = 0.0


def interrupt_active_solver():
    # z3 Solver.interrupt is explicitly safe from another thread and affects
    # only a running check, not condition encoding or a different solver.
    with SOLVER_LOCK:
        if ACTIVE_SOLVER is not None:
            INTERRUPTED.set()
            ACTIVE_SOLVER.interrupt()


class Cancelled(Exception):
    pass


def check_cancelled():
    global PAUSED_SECONDS
    if CANCELLED.is_set():
        raise Cancelled("cancelled by user")
    if not RUNNING.is_set():
        pause_started = time.perf_counter()
        print(json.dumps({"phase": "paused"}), flush=True)
        try:
            while not RUNNING.wait(0.05):
                if CANCELLED.is_set():
                    raise Cancelled("cancelled by user")
        finally:
            PAUSED_SECONDS += time.perf_counter() - pause_started
        if not CANCELLED.is_set():
            print(json.dumps({"phase": "resumed"}), flush=True)
    if CANCELLED.is_set():
        raise Cancelled("cancelled by user")


def write(path, value):
    # Packed truth columns stay packed on disk. The expanded bytes exist only
    # in the solver; full final evidence is written directly by Rust locally.
    def packed(row):
        return {k: v for k, v in row.items() if k != "truth"} if "truth_hex" in row else row
    if isinstance(value, dict) and "rows" in value:
        value = dict(value, rows=[packed(r) for r in value["rows"]])
    elif isinstance(value, list) and value and isinstance(value[0], dict) and "truth" in value[0]:
        value = [packed(r) for r in value]
    # Thousands of truth-vector elements do not benefit from indentation.
    # Keep the identical JSON schema while avoiding hundreds of MB of spaces
    # per replay; small human-readable reports remain formatted.
    bulk = (isinstance(value, dict) and "rows" in value) or (
        isinstance(value, list) and value and isinstance(value[0], dict) and "truth" in value[0])
    path.write_text(json.dumps(value, ensure_ascii=False, indent=None if bulk else 2,
                               separators=(",", ":") if bulk else None, default=lambda x: list(x) if isinstance(x, bytes) else str(x)), encoding="utf-8")


class Oracle:
    def __init__(self, exe):
        self.proc = subprocess.Popen([str(exe), "--exact-macro-oracle"], cwd=ROOT / "backend",
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                     encoding="utf-8", bufsize=1,
                                     creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        self.deadline = float("inf")
        self.replay_timeout = 60.0
        self.responses = queue.Queue()
        self.legacy_protocol = False
        self.release_windows_supported = True
        self.screening_supported = True
        bit_bytes = [bytes((n >> bit) & 1 for bit in range(8)) for n in range(256)]
        def receive():
            try:
                for line in self.proc.stdout:
                    if line.startswith("EXACT_JSON "):
                        started = time.perf_counter()
                        result = json.loads(line[len("EXACT_JSON "):])
                        for row in result.get("rows", []):
                            if "truth_hex" in row:
                                row["truth"] = b"".join(map(bit_bytes.__getitem__, bytes.fromhex(row["truth_hex"])))[:row["truth_count"]]
                        result.setdefault("timings_ms", {})["python_decode"] = (time.perf_counter()-started)*1000
                        result["timings_ms"]["response_bytes"] = len(line.encode("utf-8"))
                        self.responses.put(result)
            finally:
                self.responses.put(None)
        self.reader = threading.Thread(target=receive, daemon=True)
        self.reader.start()

    def run(self, request):
        check_cancelled()
        started = time.perf_counter()
        request = dict(request)
        if not self.release_windows_supported:
            request.pop('release_windows', None)
        if not self.screening_supported:
            request.pop('screening', None)
        if self.legacy_protocol:
            for key in ("compact_result", "stop_on_divergence", "archive_path"):
                request.pop(key, None)
        else:
            request["compact_result"] = True
        self.proc.stdin.write(json.dumps(request, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        end = min(self.deadline, time.perf_counter() + self.replay_timeout)
        while True:
            check_cancelled()
            if time.perf_counter() >= end:
                self.proc.kill()
                raise TimeoutError("real simulator replay exceeded its time budget")
            try:
                result = self.responses.get(timeout=min(0.1, end-time.perf_counter()))
                break
            except queue.Empty:
                continue
        if result is None:
            raise RuntimeError(f"execution oracle exited: {self.proc.poll()}")
        if (request.get('screening') and result.get('status') == 'error'
                and 'unknown field' in result.get('error', '')
                and 'screening' in result.get('error', '')):
            self.screening_supported = False
            return self.run(request)
        if (request.get('release_windows') and result.get('status') == 'error'
                and 'unknown field' in result.get('error', '')
                and 'release_windows' in result.get('error', '')):
            # A rolling deployment can briefly launch the previous native
            # binary. Preserve its ordinary certified search until restart.
            self.release_windows_supported = False
            return self.run(request)
        if not self.legacy_protocol and result.get("status") == "error" and "unknown field" in result.get("error", "") and any(
                key in result["error"] for key in ("compact_result", "stop_on_divergence", "archive_path")):
            # Rolling deployment: an existing router can still spawn its older
            # binary while the shared Python files have already been updated.
            self.legacy_protocol = True
            return self.run(request)
        result.setdefault("timings_ms", {})["round_trip"] = (time.perf_counter()-started)*1000
        return result

    def close(self):
        # Stop must not wait for an in-flight simulator replay to complete.
        if CANCELLED.is_set() and self.proc.poll() is None:
            self.proc.kill()
        try:
            self.proc.stdin.close()
        except OSError:
            pass
        try:
            self.proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.proc.kill()
            self.proc.wait()


def row_key(row):
    return (tuple(row["truth"]), tuple(row["executable"]), tuple(row["allowed"]),
            row.get("wait_allowed", not row["allowed"]), row.get("cursor"))


def acceptance_prefix(comparison):
    if "acceptance_prefix" in comparison:
        return comparison["acceptance_prefix"]
    return min(comparison["exact_prefix"], comparison["state_prefix"])


def same_replay_acceptance(observed, screened):
    """Full counterexamples must reproduce the screening execution contract.

    State diagnostics are deliberately absent only from skills/time screening;
    all action, channel, time, completion and fingerprint checks stay mandatory.
    """
    a, b = observed['comparison'], screened['comparison']
    if b.get('state_diagnostics') is not False:
        return a == b and observed.get('actual_fingerprint') == screened.get('actual_fingerprint')
    if a.get('acceptance') != 'skills_and_time' or b.get('acceptance') != 'skills_and_time':
        return False
    keys = ('reproduced', 'target_count', 'actual_count', 'order_prefix', 'exact_prefix',
            'acceptance_prefix', 'acceptance', 'time_tolerance_seconds',
            'max_time_error_on_order_prefix', 'completed_full_replay', 'first_difference')
    return (all(k in a and k in b and a[k] == b[k] for k in keys)
            and all(k in observed and k in screened and observed[k] == screened[k]
                    for k in ('status', 'truncated', 'probe_failure', 'actual_fingerprint')))


class PathSamples:
    """Search branches, never a universal conjunction of alternative trajectories.

    A branch supplies observations for its reached prefix; the teacher supplies
    only the still-unreached suffix. Every resulting program replays from t=0.
    The frontier bound controls search memory, not legal rules or runtime.
    """
    def __init__(self, teacher):
        self.teacher = teacher
        self.paths = {}
        self.latest = None
        self.rejected = set()
        self.teacher_positive_only = False

    def add(self, text, replay):
        identity = hashlib.sha256(text.encode()).hexdigest()
        c = replay["comparison"]
        self.paths[identity] = {"text": text, "replay": replay,
            "prefix": acceptance_prefix(c),
            "rank": (acceptance_prefix(c), c["order_prefix"], -c["max_time_error_on_order_prefix"])}
        self.latest = identity
        ranked = sorted(self.paths, key=lambda k: self.paths[k]["rank"], reverse=True)
        # Keep promising paths and recent alternatives. Neither gets frozen.
        keep = set(ranked[:4] + list(self.paths)[-4:])
        self.paths = {k:v for k,v in self.paths.items() if k in keep}
        self.rejected.intersection_update(keep)
        return identity

    def select(self, variant):
        ranked = sorted((k for k in self.paths if k not in self.rejected),
                        key=lambda k: self.paths[k]["rank"], reverse=True)
        if not ranked or variant % 4 == 0:
            return None, [r for r in self.teacher if r['allowed']] if self.teacher_positive_only else self.teacher, None
        if variant % 4 == 1:
            identity = ranked[0]
        elif variant % 4 == 2 and self.latest in ranked:
            identity = self.latest
        else:
            identity = ranked[(variant // 4) % len(ranked)]
        path = self.paths[identity]
        # The teacher's timed prefix is an ALTERNATIVE, not another hard path.
        rows = path["replay"]["rows"] + [r for r in self.teacher if r["cursor"] >= path["prefix"]
                                               and (not self.teacher_positive_only or r['allowed'])]
        return identity, rows, path["replay"]


def expand_thresholds(atoms, states):
    """Legal one-decimal neighbors of the actual failure, not guessed fields."""
    known = set(atoms)
    timed = {re.split(r"[<>]", a, maxsplit=1)[0] for a in atoms
             if a.startswith(("bufftime:", "tbufftime:"))}
    fresh = set()
    for state in states:
        if not isinstance(state, dict):
            continue
        for prefix, key in (("bufftime:", "buffs"), ("tbufftime:", "target_buffs")):
            for buff in state.get(key, []):
                field = prefix + buff["name"]
                remaining = buff.get("remaining", 0)
                if field not in timed or remaining <= 0:
                    continue
                point = math.floor(remaining * 10 + 1e-8)
                for n in range(max(0, point - 2), point + 4):
                    for op in ("<", ">"):
                        text = f"{field}{op}{n / 10:.1f}"
                        if text not in known:
                            fresh.add(text)
    return atoms + sorted(fresh)


def conflict(rows):
    """Return observable indistinguishability in this FINITE atom/action language."""
    groups = {}
    for row in rows:
        check_cancelled()
        key = (tuple(row["truth"]), tuple(row["executable"]))
        allowed = set(row["allowed"])
        if row.get("wait_allowed", not allowed):
            allowed.add(-1)
        if not allowed:
            return {"kind": "finite_observable_conflict", "states": [row]}
        if key in groups:
            options, evidence = groups[key]
            options &= allowed
            if not options:
                return {"kind": "finite_observable_conflict", "states": evidence + [row]}
            evidence.append(row)
        else:
            groups[key] = (allowed, [row])
    return None


def solve(rows, atoms, actions, slots, terms, timeout_ms, blocked=(), deadline=float("inf")):
    global ACTIVE_SOLVER
    encoding_started = time.perf_counter()
    all_bits = (1 << len(rows)) - 1
    # Rebuilt on EVERY iteration: observational aliases may split after a CEX.
    groups = {}
    for i, atom in enumerate(atoms):
        check_cancelled()
        mask = sum(1 << j for j, row in enumerate(rows) if row["truth"][i])
        groups.setdefault(mask, []).append(i)
    masks, choices = [all_bits], [None]
    for mask, ids in groups.items():
        if mask not in (0, all_bits):
            masks.append(mask)
            choices.append(ids[0])
    solver = z3.Solver()
    solver.set(timeout=timeout_ms, random_seed=0)
    act, cond, variables = [], [], []
    for slot in range(slots):
        aa = [z3.Bool(f"action_{slot}_{a}") for a in range(len(actions)+1)]
        cs = [z3.Bool(f"atom_{slot}_{k}") for k in range(1,len(masks))]
        act.append(aa)
        cond.append(cs)
        variables += aa + cs
        solver.add(z3.PbEq([(a,1) for a in aa],1))
        if cs:
            solver.add(z3.PbLe([(c,1) for c in cs], terms))
        if slot:
            solver.add(z3.Implies(act[slot - 1][0], aa[0]))
        for c in cs:
            solver.add(z3.Implies(aa[0], z3.Not(c)))
    group_hits = {}
    for s, row in enumerate(rows):
        check_cancelled()
        if time.perf_counter() >= deadline:
            return ({"status": "unknown", "reason": "wall_budget_during_encoding", "solve_ms": 0.0,
                     "encoding_ms": (time.perf_counter()-encoding_started)*1000,
                     "slots": slots, "terms": terms, "sample_count": len(rows),
                     "distinct_atoms": len(masks)-1}, "; UNKNOWN: encoding budget exhausted before complete constraints\n")
        earlier = z3.BoolVal(False)
        for slot in range(slots):
            bad_terms = [c for k,c in enumerate(cond[slot],1) if not (masks[k] & (1 << s))]
            executable = z3.Or([act[slot][a+1] for a,v in enumerate(row["executable"]) if v])
            hit = z3.And(executable, z3.Not(z3.Or(bad_terms)))
            selected = z3.And(hit,z3.Not(earlier))
            solver.add(z3.Implies(selected,z3.Or([act[slot][a+1] for a in row["allowed"]])))
            earlier = z3.Or(earlier,hit)
        if row["allowed"] and not row.get("wait_allowed", False):
            solver.add(earlier)
        if row["allowed"]:
            group_hits.setdefault(row.get("cursor", s), []).append(earlier)
    for hits in group_hits.values():
        solver.add(z3.Or(hits))
    for group in {tuple(row["allowed"]) for row in rows if row["allowed"]}:
        solver.add(z3.Or([aa[i+1] for aa in act for i in group]))
    # A scheduling-only replay failure blocks that entire candidate, never a
    # matched prefix. Only models from this exact vocabulary/shape are blocked.
    for values in blocked:
        if len(values) == len(variables):
            solver.add(z3.Or([v != bool(n) for v, n in zip(variables, values)]))
    start = time.perf_counter()
    if deadline != float("inf"):
        solver.set(timeout=max(1,min(timeout_ms,int((deadline-start)*1000))))
    elapsed = 0.0
    while True:
        check_cancelled()
        with SOLVER_LOCK:
            INTERRUPTED.clear()
            ACTIVE_SOLVER = solver
        checking = time.perf_counter()
        try:
            status = solver.check()
        finally:
            elapsed += (time.perf_counter() - checking) * 1000
            with SOLVER_LOCK:
                ACTIVE_SOLVER = None
        interrupted = INTERRUPTED.is_set()
        check_cancelled()
        if status == z3.unknown and interrupted:
            # Resume the same constraints after a user pause. This is neither
            # UNSAT nor a reason to discard the current search shape.
            continue
        break
    result = {"status": str(status), "solve_ms": elapsed, "encoding_ms": (start-encoding_started)*1000, "slots": slots, "terms": terms,
              "sample_count": len(rows), "distinct_atoms": len(masks) - 1,
              "dedup_groups": [[atoms[i] for i in ids] for ids in groups.values() if len(ids) > 1]}
    smt = solver.to_smt2()
    if status == z3.sat:
        model = solver.model()
        rules = []
        for aa, cs in zip(act, cond):
            action = next(i for i,a in enumerate(aa) if z3.is_true(model.eval(a)))
            if action:
                indices = [choices[i] for i,c in enumerate(cs,1) if z3.is_true(model.eval(c))]
                rules.append({"action": action-1, "atoms": indices})
        result["rules"] = rules
        result["model_values"] = [int(z3.is_true(model.eval(v))) for v in variables]
        result["choice_ids"] = choices
    elif status == z3.unknown:
        result["reason"] = solver.reason_unknown()
    return result, smt


class SampleIndex:
    """Incremental truth/castability columns over append-only observations.

    Equivalence is still rebuilt from the complete columns on each solve, so a
    new counterexample always splits formerly identical atoms.
    """
    def __init__(self):
        self.identity = None
        self.count = 0

    def extend(self, rows, atoms, actions):
        identity = (id(rows), id(atoms), id(actions))
        if self.identity != identity or self.count > len(rows):
            self.identity, self.count = identity, 0
            self.truth = [0] * len(atoms)
            self.executable = [0] * len(actions)
            self.compatible = [0] * len(actions)
            self.positive = 0
        for i in range(self.count, len(rows)):
            check_cancelled()
            row, bit = rows[i], 1 << i
            for k, value in enumerate(row["truth"]):
                if value:
                    self.truth[k] |= bit
            for a, value in enumerate(row["executable"]):
                if value:
                    self.executable[a] |= bit
            for a in row["allowed"]:
                self.compatible[a] |= bit
            if row["allowed"]:
                self.positive |= bit
        self.count = len(rows)
        return self


def wait_witness(replay, indices):
    """A reversible cast-now branch, NOT an unconditional negative WAIT label.

    Another macro may reach this event via other states or use a different
    bufftime threshold to wake earlier. Keep the real edge and alternatives in
    evidence; failure of this branch says nothing about all legal macros.
    """
    failure = replay.get("probe_failure") or {}
    if failure.get("kind") != "missed_decision_time" or not replay.get("rows"):
        return None
    row = replay["rows"][-1]
    if row["cursor"] != failure["index"]:
        return None
    return {"row": indices[row_key(row)], "cursor": row["cursor"],
            "time": row["time"], "next_time": row.get("wait_next_time", failure["time"]),
            "latest": row.get("decision_latest"), "cast_now": bool(row["allowed"]),
            "wake_atoms": row.get("wake_atoms", [])}


def row_truth(row):
    if "truth" in row:
        return row["truth"]
    packed = bytes.fromhex(row["truth_hex"])
    return bytes((packed[i // 8] >> (i % 8)) & 1 for i in range(row["truth_count"]))


def repair_signature(replay, rules=None):
    difference = replay.get("comparison", {}).get("first_difference") or {}
    index = difference.get("index", -1)
    actual = replay.get("actual", [])
    event = actual[index] if 0 <= index < len(actual) else {}
    rows = replay.get("rows", [])
    if not rows:
        return None
    row = rows[-1]
    # Equal snapshots reached by different macros are different search branches:
    # another rule can still preempt after this one is repaired.
    program = hashlib.sha256(json.dumps(rules, sort_keys=True).encode()).digest() if rules is not None else None
    return (program, index, event.get("macro_line"), (replay.get("probe_failure") or {}).get("kind"),
            bytes(row_truth(row)), tuple(row["executable"]), tuple(row.get("rejected_actions", [])))


_REPAIR_MODULE = None


def repair_module():
    global _REPAIR_MODULE
    if _REPAIR_MODULE is None:
        spec = importlib.util.spec_from_file_location('exact_macro_repair',
            Path(__file__).with_name('exact_macro_repair.py'))
        _REPAIR_MODULE = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_REPAIR_MODULE)
    return _REPAIR_MODULE


def clock_gates(atoms, row, difference, tolerance):
    return repair_module().clock_gates(atoms, row, difference, tolerance)


def repair_trials(rules, atoms, replay):
    """Shared native-chain repair; stage one has NO character/row penalty."""
    names = {'repair_clock_gate':'early_cast_clock_gate',
             'repair_gate':'preempting_rule_gate',
             'repair_split':'preempting_rule_split',
             'repair_drop_unused':'preempting_rule_drop',
             'repair_coverage':'missing_action_guard'}
    results = []
    normalize = repair_module().conditions().normalize
    for kind, proposal in repair_module().edits(rules, atoms, replay, check_cancelled):
        # Keep the legacy AND-only representation compact, but never discard OR.
        copied = [dict(r) for r in proposal]
        for r in copied:
            if all(op == '&' for op in r.get('ops', [])):
                r.pop('ops', None)
        changed = next((i for i,(old,new) in enumerate(zip(rules,copied))
                        if old['action'] != new['action'] or normalize(old) != normalize(new)),
                       min(len(rules),len(copied)))
        value = {'rules':copied,'line':changed+1,'repair':names.get(kind,kind)}
        if kind == 'repair_threshold' and changed < min(len(rules),len(copied)):
            old = normalize(rules[changed])
            new = normalize(copied[changed])
            leaf = next((i for i,(a,b) in enumerate(zip(old['atoms'],new['atoms'])) if a != b), None)
            if leaf is not None:
                value.update({'from':atoms[old['atoms'][leaf]],'to':atoms[new['atoms'][leaf]]})
        if kind in ('repair_split','repair_drop_unused','repair_clock_gate','repair_gate'):
            value['split_count'] = len(copied)-len(rules)+1
        results.append(value)
    return results


def guard_trials(rules, atoms, replay):
    return [trial for trial in repair_trials(rules, atoms, replay)
            if trial.get('repair') not in ('repair_threshold','missing_action_guard')]


def threshold_trials(rules, atoms, replay):
    return [trial for trial in repair_trials(rules, atoms, replay)
            if trial.get('repair') == 'repair_threshold']


def coverage_trials(rules, atoms, replay):
    return [trial for trial in repair_trials(rules, atoms, replay)
            if trial.get('repair') == 'missing_action_guard']


LOCAL_REPLAYS_PER_PREFIX = 24
LOCAL_FRONTIER_LIMIT = 64


class SearchScheduler:
    """A bounded local *turn*, followed by unbounded whole-program search.

    This bounds neither legal macro size nor total search time. A new verified
    prefix resets the local turn; stale descendants cannot starve construction.
    """
    def __init__(self):
        self.frontier = []
        self.probes = 0
        self.exhausted = False

    def improved(self, trials):
        self.frontier = trials[:LOCAL_FRONTIER_LIMIT]
        self.probes = 0
        self.exhausted = False

    def extend(self, trials, urgent=False):
        if self.exhausted:
            return
        available = LOCAL_FRONTIER_LIMIT - len(self.frontier)
        if urgent:
            self.frontier = (trials + self.frontier)[:LOCAL_FRONTIER_LIMIT]
        elif available > 0:
            self.frontier.extend(trials[:available])

    def next(self, seen_text, render):
        if self.exhausted:
            return None
        while self.frontier and self.probes < LOCAL_REPLAYS_PER_PREFIX:
            trial = self.frontier.pop(0)
            if render(trial["rules"]) in seen_text:
                continue
            self.probes += 1
            return trial
        if self.probes >= LOCAL_REPLAYS_PER_PREFIX:
            self.exhausted = True
            self.frontier.clear()
        return None


def construct(rows, atoms, actions, variant=0, progress=None, seed=None, obligations=(),
              cache=None, preferred_atoms=(), repair_seed=True):
    """Unbounded ordered AND-list witness; no rule/term/character objective.

    On the remaining samples a rule may hit only compatible executable rows.
    The conjunction of ALL atoms true at an anchor is its narrowest guard in
    this finite positive-atom language. If it still hits a wrong executable
    row, no conjunction covering that anchor can be the next rule. Otherwise
    construct a separating guard, then peel its hits. Earlier correct hits
    protect later rules, including later conditions that are true there.

    Each rule removes >=1 positive sample, so rows bound the witness size,
    not a configured slot limit. Any compatible decision list stays compatible
    on the remainder: greedy safe peeling cannot destroy sample feasibility.
    Rebuilt from scratch after each counterexample; never freezes a prefix.
    """
    started = time.perf_counter()
    paused_before = PAUSED_SECONDS
    n = len(rows)
    all_bits = (1 << n) - 1
    index = (cache or SampleIndex()).extend(rows, atoms, actions)
    groups = {}
    for i, mask in enumerate(index.truth):
        check_cancelled()
        groups.setdefault(mask, []).append(i)
    masks, choices = [], []
    rng = random.Random(variant)
    for mask, ids in groups.items():
        if mask in (0, all_bits):
            continue
        ids.sort(key=lambda i: (i not in preferred_atoms, len(atoms[i]), atoms[i]))
        choices.append(ids[0] if not variant or ids[0] in preferred_atoms else rng.choice(ids))
        masks.append(mask)
    columns = list(range(len(masks)))
    if variant:
        rng.shuffle(columns)
    columns.sort(key=lambda k: choices[k] not in preferred_atoms)
    def separating_score(k, uncovered):
        # Alternate stable-state and coverage-first witnesses. This is search
        # ordering, not a bound/penalty on the emitted macro or condition count.
        timed = atoms[choices[k]].startswith(("bufftime:", "tbufftime:"))
        gain = (uncovered & ~masks[k]).bit_count()
        weight = 4 if variant % 4 in (0, 2) and timed else 1
        return (gain / weight, gain, not timed)
    anchor_columns = []
    for i in range(n):
        check_cancelled()
        bit = 1 << i
        anchor_columns.append([k for k in columns if masks[k] & bit])
    executable, compatible, positive = index.executable, index.compatible, index.positive
    required = {}
    for i, row in enumerate(rows):
        check_cancelled()
        if row["allowed"]:
            key = ("event", row["cursor"]) if "wait_allowed" in row and "cursor" in row else ("row", i)
            required[key] = required.get(key, 0) | (1 << i)
            if not row.get("wait_allowed", False):
                required[("row", i)] = 1 << i
    for i in obligations:
        if rows[i]["allowed"]:
            required[("witness", i)] = 1 << i
    requirements = list(required.values())
    unmet = dict(required)
    pending = all_bits
    rules, witnesses = [], []
    repaired_rules = 0
    last_progress = 0.0
    # Reuse only rules that remain valid on the CURRENT samples. This is a
    # search preference, never a frozen prefix. Split a conflicting rule into
    # safe guards for its still-correct observations before trying a global
    # replacement. Dropping the whole rule also drops its scheduler thresholds
    # and needlessly disrupts unrelated waits. Every emitted split is checked
    # against ALL remaining executable negatives, with no rule/term budget.
    for rule in seed or ():
        check_cancelled()
        action = rule["action"]
        hits = pending & executable[action]
        for atom in rule["atoms"]:
            hits &= index.truth[atom]
        if not hits:
            continue
        if not hits & ~compatible[action]:
            rules.append({"action": action, "atoms": list(rule["atoms"])})
            pending &= ~hits
            unmet = {k: mask for k, mask in unmet.items() if not mask & hits}
            continue
        if not repair_seed:
            continue
        remaining_good = hits & compatible[action]
        while remaining_good:
            check_cancelled()
            anchor = (remaining_good & -remaining_good).bit_length() - 1
            bad = pending & executable[action] & ~compatible[action]
            selected = list(rule["atoms"])
            uncovered = bad
            for atom in selected:
                uncovered &= index.truth[atom]
            inseparable = uncovered
            for k in anchor_columns[anchor]:
                inseparable &= masks[k]
            if inseparable:
                # This seed region cannot be repaired in place. The unrestricted
                # cover below can still change conditions, action or priority.
                remaining_good &= ~(1 << anchor)
                continue
            while uncovered:
                check_cancelled()
                k = max(anchor_columns[anchor], key=lambda c: separating_score(c, uncovered))
                selected.append(choices[k])
                uncovered &= masks[k]
            # Do not pile a weaker old bound on top of a stronger new bound.
            # Sample-level irredundancy only; runtime equivalence is NEVER
            # inferred from this deletion, and the candidate is fully replayed.
            for atom in list(reversed(selected)):
                check_cancelled()
                wrong = bad
                for other in selected:
                    if other != atom:
                        wrong &= index.truth[other]
                if not wrong:
                    selected.remove(atom)
            covered = pending & executable[action]
            for atom in selected:
                covered &= index.truth[atom]
            assert covered & (1 << anchor) and not covered & ~compatible[action]
            rules.append({"action": action, "atoms": selected})
            repaired_rules += 1
            pending &= ~covered
            remaining_good &= ~covered
            unmet = {k: mask for k, mask in unmet.items() if not mask & covered}
    while unmet:
        check_cancelled()
        indices = [i for i in range(n) if pending & positive & (1 << i)]
        if variant:
            rng.shuffle(indices)
        blockers = []
        found = False
        for anchor in indices:
            check_cancelled()
            opts = [a for a in rows[anchor]["allowed"] if rows[anchor]["executable"][a]]
            if variant:
                rng.shuffle(opts)
            for action in opts:
                bad = pending & executable[action] & ~compatible[action]
                # This is the maximal guard: decisive feasibility check with
                # every available true atom, not an arbitrary term budget.
                inseparable = bad
                for k in anchor_columns[anchor]:
                    inseparable &= masks[k]
                    if not inseparable:
                        break
                if inseparable:
                    blockers.append({"anchor": anchor, "action": action,
                                     "wrong_row": (inseparable & -inseparable).bit_length() - 1})
                    continue
                # Cover incompatible rows. No cap on terms; each chosen atom
                # must separate at least one as-yet-unseparated wrong hit.
                uncovered, selected = bad, []
                while uncovered:
                    check_cancelled()
                    k = max(anchor_columns[anchor], key=lambda c: separating_score(c, uncovered))
                    assert uncovered & ~masks[k]
                    selected.append(k)
                    uncovered &= masks[k]
                # Row-local irredundancy, NOT stage-two macro compression:
                # remove a term only if the other terms already exclude every
                # wrong hit. In particular weaker implied bounds disappear.
                for k in list(reversed(selected)):
                    check_cancelled()
                    hits = bad
                    for other in selected:
                        if other != k:
                            hits &= masks[other]
                    if not hits:
                        selected.remove(k)
                hits = pending & executable[action]
                for k in selected:
                    hits &= masks[k]
                assert hits & (1 << anchor) and not hits & ~compatible[action]
                rules.append({"action": action, "atoms": [choices[k] for k in selected]})
                witnesses.append({"anchor": anchor, "covered_samples": hits.bit_count()})
                pending &= ~hits
                unmet = {k: mask for k,mask in unmet.items() if not mask & hits}
                found = True
                break
            if found:
                break
        if not found:
            return {"status": "unsat", "method": "unbounded_ordered_cover",
                    "reason": "No next rule exists in this finite one-page positive-AND atom language; not a claim about all legal macros.",
                    "conflict": {"kind": "finite_and_priority_conflict", "blockers": blockers,
                                 "remaining_rows": [i for i in range(n) if pending & (1 << i)]},
                    "partial_rules": rules,
                    "solve_ms": (time.perf_counter()-started-PAUSED_SECONDS+paused_before)*1000, "slots": None, "terms": None,
                    "sample_count": n, "distinct_atoms": len(masks)}
        now = time.perf_counter()
        if progress and now - last_progress >= 0.5:
            progress({"phase": "constructing", "rule_count": len(rules),
                      "covered_samples": (positive & ~pending).bit_count(),
                      "positive_samples": positive.bit_count(), "sample_count": n,
                      "distinct_atoms": len(masks)})
            last_progress = now
    # Independently select each row's first executable hit, including WAIT.
    # This is a sample certificate; only the Rust replay can certify exactness.
    selected_bits = 0
    for row_index, row in enumerate(rows):
        check_cancelled()
        selected = next((r["action"] for r in rules if row["executable"][r["action"]]
                         and all(row["truth"][i] for i in r["atoms"])), None)
        assert (selected is None and row.get("wait_allowed", not row["allowed"])) or selected in row["allowed"]
        if selected is not None:
            selected_bits |= 1 << row_index
    assert all(mask & selected_bits for mask in requirements)
    return {"status": "sat", "method": "unbounded_ordered_cover", "rules": rules,
            "sample_certificate": witnesses, "solve_ms": (time.perf_counter()-started-PAUSED_SECONDS+paused_before)*1000,
            "slots": None, "terms": None, "rule_count": len(rules),
            "max_terms_used": max((len(r["atoms"]) for r in rules), default=0),
            "sample_count": n, "distinct_atoms": len(masks), "variant": variant,
            "seed_rules": len(seed or ()), "repaired_rules": repaired_rules,
            "search_obligations": list(obligations)}


def macro_text(rules, atoms, actions):
    atoms = native_conditions().canonical_atomtexts(atoms)
    lines = []
    for rule in rules:
        action = actions[rule["action"]]
        # The native grammar is equal-precedence and right-associative:
        # P&Q|R means P&(Q|R). Explicit operator chains preserve that order;
        # arbitrary DNF cannot be rendered by flattening branches with '|'.
        guard = "&".join(atoms[i] for i in rule["atoms"])
        if 'ops' in rule:
            if len(rule['ops']) != max(0,len(rule['atoms'])-1) or any(op not in ('&','|') for op in rule['ops']):
                raise ValueError('one condition operator is required between each leaf')
            guard = atoms[rule['atoms'][0]] + ''.join(op+atoms[i] for op,i in zip(rule['ops'],rule['atoms'][1:])) if rule['atoms'] else ''
        alternatives = "|".join(atoms[i] for i in rule.get("any_atoms", [])) if 'ops' not in rule else ''
        if alternatives:
            guard += ("&" if guard else "") + alternatives
        lines.append(f"/{'fcast' if action['fcast'] else 'cast'} " +
                     (f"[{guard}] " if guard else "") + action["name"])
    # A real, always-false macro is useful for empty targets in solver tests.
    return "\n".join(lines) or "/cast [rage<0] 盾刀"


def compression_module():
    spec = importlib.util.spec_from_file_location("exact_macro_compress", ROOT / "tools/exact_macro_compress.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_NATIVE_CONDITIONS = None


def native_conditions():
    global _NATIVE_CONDITIONS
    if _NATIVE_CONDITIONS is None:
        spec = importlib.util.spec_from_file_location("exact_macro_conditions", ROOT / "tools/exact_macro_conditions.py")
        _NATIVE_CONDITIONS = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_NATIVE_CONDITIONS)
    return _NATIVE_CONDITIONS


def compression_check(solver):
    """Interrupt/resume a local compression check with the existing controls."""
    global ACTIVE_SOLVER
    while True:
        check_cancelled()
        with SOLVER_LOCK:
            INTERRUPTED.clear()
            ACTIVE_SOLVER = solver
        try:
            status = solver.check()
        finally:
            with SOLVER_LOCK:
                ACTIVE_SOLVER = None
        interrupted = INTERRUPTED.is_set()
        check_cancelled()
        if status == z3.unknown and interrupted:
            continue
        return status


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scene", type=Path, help="Frozen version/mount/simulation/horizon JSON")
    parser.add_argument("--exe", type=Path, default=ROOT / "backend/target/debug/jx3-combat-sim.exe")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--record", action=argparse.BooleanOptionalAction, default=True,
                        help="retain offline test evidence; the HTTP worker defaults to no recording")
    parser.add_argument("--seconds", type=float, default=float("inf"))
    parser.add_argument("--solver-ms", type=int, default=20000)
    parser.add_argument("--iterations", type=int, default=sys.maxsize)
    parser.add_argument("--sizes", default="8:2,12:3,20:4,32:5", help="rule slots:AND terms, expanded on UNSAT/UNKNOWN")
    parser.add_argument("--compress", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--compress-frontier", action=argparse.BooleanOptionalAction, default=True,
                        help="shared-budget multi-rule search with native release-window observations")
    parser.add_argument("--compress-deep", action="store_true", help="experimental whole-program CEGIS after ordinary compression stalls")
    parser.add_argument("--compress-joint", action="store_true", help="experimental competing-action compression after ordinary compression stalls")
    parser.add_argument("--compress-region", action="store_true", help="optional bounded joint region turns after ordinary search stalls")
    parser.add_argument("--compress-exchange", action="store_true", help="experimental predicate-combination covers and certified growing bridges")
    parser.add_argument("--compress-learning", action="store_true", help="optional task-local candidate ranking")
    parser.add_argument("--compress-adaptive", action="store_true", help="optional task-local strategy ordering")
    parser.add_argument("--compress-model", type=Path, default=os.environ.get('JX3_EXACT_MACRO_MODEL'),
                        help="optional frozen offline prior; incompatible files fall back to ordinary search")
    parser.add_argument("--strategy", choices=("prototype", "bounded"), default="prototype")
    args = parser.parse_args()
    run_job(args)


def run_job(args):
    args.out.mkdir(parents=True, exist_ok=True)
    record = getattr(args, 'record', not getattr(args, 'web', False))
    args.result = {}
    best_value = None
    iteration_solve_ms = 0.0

    def record_evidence(path, value):
        if record:
            write(path, value)

    def text_evidence(path, value):
        if record:
            path.write_text(value, encoding='utf-8')

    scene = json.loads(args.scene.read_text(encoding="utf-8-sig"))
    prototype = getattr(args, "strategy", "bounded") == "prototype"
    if prototype:
        scene.setdefault("time_tolerance_seconds", 1 / 16)
        scene.setdefault("acceptance", "skills_and_time")
    tolerance = scene.get("time_tolerance_seconds", 1e-7)
    sizes = [] if prototype else [tuple(map(int, v.split(":"))) for v in args.sizes.split(",")]
    started = time.perf_counter()
    oracle = Oracle(args.exe.resolve())
    if getattr(args, "web", False):
        oracle.replay_timeout = float("inf")
        print(json.dumps({"phase": "preparing", "oracle_pid": oracle.proc.pid}), flush=True)
    oracle.deadline = started + args.seconds
    report = {"schema": "exact-macro-v1", "status": "budget_exhausted", "iterations": [],
              "language": "one unfiltered page, ordered /cast or /fcast; extraction AND clauses, compression native right-associated AND/OR chains",
              "stage1_character_objective": None,
              "stage2_character_objective": "copyable UTF-16 text length" if args.compress else None,
              "acceptance": scene.get("acceptance", "skills_and_state"),
              "acceptance_details": "identical active skills/order/count/channel ticks; absolute per-cast tolerance without cumulative drift; states reported independently for skills_and_time",
              "time_tolerance_seconds": tolerance, "maximum_auto_tolerance_seconds": 0.125 if prototype else tolerance,
              "relaxations": [],
              "solver_version": z3.get_version_string(), "sizes": sizes,
              "strategy": "unbounded_ordered_cover" if prototype else "bounded_z3",
              "rule_limit": None if prototype else sizes[-1][0],
              "terms_per_rule_limit": None if prototype else sizes[-1][1],
              "threshold_decimal_places": 1,
              "wall_time_limit_seconds": None if args.seconds == float("inf") else args.seconds,
              "solver_check_limit_ms": args.solver_ms or None,
              "endpoint": "runtime starts decisions at t <= horizon; final delayed cast also compared; all waits through horizon checked"}
    best_rank, best_rules = None, None
    print(json.dumps({"phase":"preparing", "stage":"extraction"}), flush=True)
    scheduler = SearchScheduler()
    local_seen, local_expansions = set(), 0
    def preview(text, replay, rules=None, repair_origin=None):
        nonlocal best_rank, best_rules, local_seen, local_expansions, best_value
        comparison = replay["comparison"]
        # Partial replays have no final cast count; rank only the measured prefix.
        rank = (comparison["reproduced"], acceptance_prefix(comparison), comparison["exact_prefix"],
                comparison["order_prefix"], -comparison["max_time_error_on_order_prefix"])
        if best_rank is None or rank > best_rank:
            prefix_improved = best_rank is None or rank[:4] > best_rank[:4]
            best_rank = rank
            best_rules = rules
            # A prettier divergent suffix must not continuously restart the
            # local queue at the same failing prefix and starve global search.
            if prototype and prefix_improved:
                scheduler.improved(repair_trials(rules, atoms, replay))
                local_seen = {repair_signature(replay, rules)}
                local_expansions = 0
            value = {"phase": "best", "macro": text, "comparison": comparison}
            best_value = value
            record_evidence(args.out / "best.json", value)
            record_evidence(args.out / "best-replay.json", replay)
            print(json.dumps(value, ensure_ascii=False), flush=True)
        if prototype and rules and rank[:4] == best_rank[:4]:
            signature = repair_signature(replay, rules)
            # One repair can expose a second preempting rule at the SAME cursor.
            # Explore distinct local failures without pretending the prefix has
            # improved. This finite queue then yields to unrestricted search.
            if signature is not None and signature not in local_seen and not scheduler.exhausted and local_expansions < 32:
                local_seen.add(signature)
                local_expansions += 1
                followups = repair_trials(rules, atoms, replay)
                scheduler.extend(followups, urgent=bool(repair_origin and repair_origin.get("repair") == "preempting_rule_split"))

    try:
        prepared = oracle.run(scene)
        record_evidence(args.out / "target.json", prepared)
        report["preparation_status"] = prepared["status"]
        if "comparison" in prepared:
            report["preparation_comparison"] = prepared["comparison"]
        print(json.dumps({"phase": "prepared", "status": prepared["status"],
                          "target_count": len(prepared.get("target", [])),
                          "atom_count": len(prepared.get("atoms", []))}), flush=True)
        if prepared["status"] != "ok":
            report["status"] = prepared["status"]
            report["preparation_details"] = {k: prepared[k] for k in ("skipped", "probe_failure", "error") if k in prepared}
            return
        if prototype and scene.get("acceptance") == "skills_and_time":
            # A finite cycle is validated through its last tolerated active cast,
            # not followed by an invented six-second mandatory silence period.
            end = max(e["time"] for e in prepared["target"]) + 0.125 + 1e-7
            scene["horizon"] = max(0.1, end)
            prepared = oracle.run(scene)
            if prepared["status"] != "ok":
                raise RuntimeError("target failed while establishing its active-cast endpoint")
            record_evidence(args.out / "target.json", prepared)
            report["active_cast_endpoint_seconds"] = scene["horizon"]
        # Store the simulator's fully materialized environment, preserving every
        # scene field. Its digest binds the target AND candidate to one scene.
        scene["simulation"] = prepared["simulation"]
        record_evidence(args.out / "scene.json", scene)
        report["scenario_sha256"] = hashlib.sha256(json.dumps(scene, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        if record:
            provenance = {"executable_sha256": hashlib.sha256(args.exe.read_bytes()).hexdigest(), "files": {}}
            for name in ("exact-macro-synth.py", "exact-macro-worker.py", "exact_macro_compress.py", "exact_macro_exchange.py", "exact_macro_schedule.py",
                     "exact_macro_reorder.py", "exact_macro_conditions.py", "exact_macro_frontier.py", "exact_macro_global.py", "exact_macro_family.py", "exact_macro_joint.py", "exact_macro_repair.py", "requirements-exact-macro.txt"):
                path = ROOT / "tools" / name
                provenance["files"]["tools/" + name] = hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted((ROOT / "backend/src").rglob("*.rs")):
                provenance["files"][path.relative_to(ROOT).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
            version_dir = {"CangShengZhuShiTest": "2026_10_苍生铸世测试服", "AnYingQianJi": "2026_04_暗影千机", "ShanHaiYuanLiu": "2025_10_山海源流", "AnYingQianJiTest": "2026_04_暗影千机测试服"}[scene["version"]]
            for path in sorted((ROOT / "backend/data" / version_dir).rglob("*.toml")):
                provenance["files"][path.relative_to(ROOT).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
            record_evidence(args.out / "provenance.json", provenance)
        atoms, actions = prepared["atoms"], prepared["actions"]
        record_evidence(args.out / "atoms.json", atoms)
        record_evidence(args.out / "actions.json", actions)
        rows, seen = [], set()
        for row in prepared["rows"]:
            if (prototype or row["allowed"]) and row_key(row) not in seen:
                rows.append(row)
                seen.add(row_key(row))
        indices = {row_key(row): i for i, row in enumerate(rows)}
        sample_index = SampleIndex()
        paths = PathSamples(rows)
        active_path = None
        focus = None
        restart_next = False

        def activate(identity, source, replay=None):
            nonlocal rows, seen, indices, focus, active_path
            rows, seen = [], set()
            for row in source:
                key = row_key(row)
                if key not in seen:
                    rows.append(row)
                    seen.add(key)
            indices = {row_key(row): i for i, row in enumerate(rows)}
            focus = wait_witness(replay, indices) if replay else None
            active_path = identity

        def learn(replay, text):
            nonlocal focus
            if prototype:
                identity = paths.add(text, replay)
                path = paths.paths[identity]
                source = replay["rows"] + [r for r in paths.teacher if r["cursor"] >= path["prefix"]
                                          and (not paths.teacher_positive_only or r['allowed'])]
                previous = len(rows)
                activate(identity, source, replay)
                return max(0, len(rows) - previous)
            added = 0
            for row in replay["rows"]:
                key = row_key(row)
                if key not in seen:
                    indices[key] = len(rows)
                    rows.append(row)
                    seen.add(key)
                    added += 1
            focus = wait_witness(replay, indices)
            return added
        size = 0
        blocked = []
        variant = 0
        tried_candidates = set()

        last_verification = None
        def verify(text, screening=False, archive_full=True, release_windows=False):
            nonlocal last_verification
            # Most stage-two edits need only a lite verdict. Whole-program
            # CEGIS selectively repeats failures with the complete atom
            # catalog for ONE aligned path branch.
            # Probe atoms are diagnostics: the REAL candidate's own condition
            # tree still drives selection and wake-up times. Successful edits
            # always get an independent full-catalog replay for evidence and
            # the next batch's guidance. Stage one retains every truth column.
            request = dict(scene, candidate=text, atoms=["rage<0"] if screening else atoms, stop_on_divergence=True)
            if screening and scene.get('acceptance') == 'skills_and_time':
                request['screening'] = True
            result = oracle.run(request)
            first_ms = result.get('timings_ms',{}).get('round_trip',0)
            if result["status"] != "ok":
                raise RuntimeError(f"oracle verification failed: {result['status']}")
            if result["comparison"]["reproduced"]:
                # A successful search replay always gets an independent full
                # replay. Full states never cross the browser or solver pipe.
                archive = args.out / ("full-" + hashlib.sha256(text.encode()).hexdigest()[:16] + ".json")
                request = dict(scene, candidate=text, atoms=atoms)
                if release_windows:
                    request['release_windows'] = True
                if record and archive_full:
                    request['archive_path'] = str(archive.resolve())
                screened = result
                result = oracle.run(request)
                if (result["status"] != "ok" or not result["comparison"]["reproduced"]
                        or result["comparison"].get("completed_full_replay") is not True or result.get("truncated", False)):
                    raise RuntimeError("full certification disagreed with search replay")
                if screened['comparison'].get('state_diagnostics') is False and not same_replay_acceptance(result, screened):
                    raise RuntimeError("full certification changed screening execution")
                if record and archive_full:
                    result["archive_file"] = archive.name
                result.setdefault('timings_ms',{})['verification_total'] = first_ms + result['timings_ms'].get('round_trip',0)
            else:
                result.setdefault('timings_ms',{})['verification_total'] = first_ms
            last_verification = result
            return result

        def publish(text, iteration, rules=None):
            print(json.dumps({"phase": "candidate", "iteration": iteration, "macro": text,
                              "rule_count": len(text.splitlines()), "time_tolerance_seconds": tolerance}, ensure_ascii=False), flush=True)
            check_cancelled()
            print(json.dumps({"phase": "replaying", "iteration": iteration}), flush=True)
            replay = verify(text)
            preview(text, replay, rules)
            print(json.dumps({"phase": "replayed", "iteration": iteration,
                              "comparison": replay["comparison"]}), flush=True)
            return replay

        def finish_exact(rules, text, replay, iteration):
            # This is the only stage transition, including an immediately
            # successful first draft. Freeze the original scene, endpoint and
            # final tolerance; compression never calls relax or learns labels
            # from a diverged suffix. B is neither an input nor a dependency.
            report["status"] = "exact"
            report["comparison"] = replay["comparison"]
            text_evidence((args.out / "exact.txt"), text)
            record_evidence(args.out / "verified.json", replay)
            record_evidence(args.out / "constraints.json", rows)
            if not args.compress:
                return
            module = compression_module()
            frontier = getattr(args,'compress_frontier',True)
            if frontier:
                # Add optional witnesses only after phase one is certified.
                # The scene, endpoint and acceptance contract stay unchanged.
                guided = oracle.run(dict(scene,candidate=text,atoms=atoms,release_windows=True))
                if (not module.certified(guided) or guided['comparison'] != replay['comparison']
                        or guided.get('actual_fingerprint') != replay.get('actual_fingerprint')):
                    raise RuntimeError('compression observation changed certified replay')
                replay = guided
            report['compression_options'] = dict(frontier=frontier,
                release_windows_supported=oracle.release_windows_supported)
            oracle_id = hashlib.sha256(args.exe.read_bytes()).hexdigest()
            learning = None
            model_path = getattr(args,'compress_model',None)
            if model_path or getattr(args,'compress_learning',False) or getattr(args,'compress_adaptive',False):
                lm = module.search_module('exact_macro_learning')
                scene_id = hashlib.sha256(json.dumps(scene,sort_keys=True,separators=(',',':')).encode()).hexdigest()
                if model_path:
                    try:
                        # A model is numbers and anonymous shapes only. It is
                        # never executable code or a library of macro answers.
                        if model_path.stat().st_size > 2_000_000:
                            raise ValueError('offline prior exceeds size limit')
                        model = json.loads(model_path.read_text(encoding='utf-8'))
                        learning = lm.LearningSession.from_prior(model,contract_hash=scene_id,
                            oracle_version=oracle_id,source_group='local:'+scene_id,
                            version=scene['version'],mount=scene['mount'])
                        record_evidence(args.out / 'compression-model.json',{'status':'loaded',
                            'sha256':hashlib.sha256(model_path.read_bytes()).hexdigest(),
                            'training':False,'reference_macro_input':False})
                    except (OSError,ValueError,TypeError,KeyError) as error:
                        record_evidence(args.out / 'compression-model.json',{'status':'fallback',
                            'reason':str(error),'training':False})
                elif getattr(args,'compress_learning',False) or getattr(args,'compress_adaptive',False):
                    learning = lm.LearningSession(scene_id,oracle_id,'local:'+scene_id,
                        enabled=getattr(args,'compress_learning',False),
                        bandit_enabled=getattr(args,'compress_adaptive',False))
            compression_started, compression_paused = time.perf_counter(), PAUSED_SECONDS
            frozen = json.loads(json.dumps(scene))
            record_evidence(args.out / "compression-contract.json", {"scene":frozen,
                "baseline_macro_sha256":hashlib.sha256(text.encode()).hexdigest(),
                "comparison":replay["comparison"], "baseline_archive":replay.get("archive_file"),
                "character_count":"UTF-16 code units of copyable text, including brackets/spaces/newlines"})
            text_evidence((args.out / "compact.txt"), text)
            record_evidence(args.out / "compact-verified.json", replay)
            report["compression"] = {"status":"running", "initial_chars":module.char_count(text),
                                      "best_chars":module.char_count(text), "trial_count":0}
            def progress(summary):
                report["compression"] = summary
                record_evidence(args.out / "compression-summary.json", summary)
                # Profiling, source hashes and model statistics are private
                # evidence. The UI only needs counters for the live preview.
                public = {k:summary[k] for k in ('status','initial_chars','best_chars','saved_chars',
                    'trial_count','accepted_count','method','last_batch_rules') if k in summary}
                print(json.dumps({"phase":"compressing", "stage":"compression", "compression":public}), flush=True)
            def boundary():
                check_cancelled()
                if time.perf_counter()-started-PAUSED_SECONDS >= args.seconds:
                    raise TimeoutError("compression run budget exhausted")
            def local_check(solver):
                boundary()
                status = compression_check(solver)
                boundary()
                return status
            def trial_verify(candidate, trial, kind):
                assert scene == frozen, "compression changed the acceptance contract"
                n = iteration + trial
                print(json.dumps({"phase":"candidate", "stage":"compression", "iteration":n,
                    "macro":candidate, "rule_count":len(candidate.splitlines()),
                    "time_tolerance_seconds":tolerance, "method":kind}, ensure_ascii=False), flush=True)
                text_evidence((args.out / f"compact-candidate-{trial:04d}.txt"), candidate)
                check_cancelled()
                print(json.dumps({"phase":"replaying", "iteration":n}), flush=True)
                # All successful candidates keep independent native validation
                # and their own observation path. Large archives exist only in
                # offline recording mode; production publishes the macro.
                result = verify(candidate,screening=True,
                    archive_full=module.char_count(candidate) < report['compression']['best_chars'],
                    release_windows=frontier)
                record_evidence(args.out / f"compact-replay-{trial:04d}.json", result)
                print(json.dumps({"phase":"replayed", "iteration":n,
                                  "comparison":result["comparison"]}), flush=True)
                return result
            def accepted(candidate, result, summary):
                nonlocal best_value
                value = {"phase":"best", "stage":"compression", "macro":candidate,
                         "comparison":result["comparison"], "char_count":summary["best_chars"]}
                best_value = value
                text_evidence((args.out / "compact.txt"), candidate)
                record_evidence(args.out / "compact-verified.json", result)
                record_evidence(args.out / "best.json", value)
                record_evidence(args.out / "best-replay.json", result)
                print(json.dumps(value, ensure_ascii=False), flush=True)
            def counterexample(candidate, result, trial, kind):
                boundary()
                observed = verify(candidate)
                if not same_replay_acceptance(observed, result):
                    raise RuntimeError('full counterexample observation changed native replay')
                record_evidence(args.out / f'compact-counterexample-{trial:04d}.json',observed)
                return observed
            local_constraints = []
            local_solve_ms = 0.0
            def diagnostic(info, smt):
                nonlocal local_solve_ms
                local_solve_ms += info.get('solve_ms', 0)
                if not record:
                    return
                local_constraints.append(info)
                if smt:
                    text_evidence((args.out / f"compression-{len(local_constraints):04d}.smt2"), smt)
                record_evidence(args.out / "compression-solvers.json", local_constraints)
            diagnostic.record_smt = record
            try:
                _, compact_replay, trials, summary = module.compress(rules,atoms,actions,replay,
                    lambda r:macro_text(r,atoms,actions), trial_verify, boundary,
                    local_check, accepted, progress, diagnostic,
                    lambda:time.perf_counter()-started-PAUSED_SECONDS < args.seconds,
                    feedback=counterexample,deep_search=getattr(args,'compress_deep',False),
                    joint_search=getattr(args,'compress_joint',False),
                    region_search=getattr(args,'compress_region',False),learning=learning,
                    exchange_search=getattr(args,'compress_exchange',False),
                    window_frontier=frontier,
                    contract=dict(scene=frozen,oracle_sha256=oracle_id),record_trials=record)
                report["comparison"] = compact_replay["comparison"]
                report["compression_stop"] = summary["status"]
                record_evidence(args.out / "compression.json", trials)
            finally:
                # Stop/error preserves the last certified macro in memory.
                # Offline recording additionally retains its evidence.
                record_evidence(args.out / "compression-summary.json", report["compression"])
                if learning is not None:
                    record_evidence(args.out / "compression-learning.json",learning.to_dict())
                report["compression_elapsed_ms"] = max(0, (time.perf_counter()-compression_started
                                                            -PAUSED_SECONDS+compression_paused)*1000)
                report["compression_solve_ms"] = local_solve_ms

        def relax(reason):
            nonlocal tolerance, rows, seen, variant, blocked, tried_candidates, indices, focus, best_rules, best_rank, local_expansions, paths
            if not prototype or tolerance >= 0.125:
                return False
            scheduler.improved([])
            local_seen.clear()
            local_expansions = 0
            previous = tolerance
            tolerance = 0.125
            scene["time_tolerance_seconds"] = tolerance
            report["time_tolerance_seconds"] = tolerance
            report["relaxations"].append({"from_seconds": previous, "to_seconds": tolerance, "reason": reason})
            print(json.dumps({"phase": "relaxing", "time_tolerance_seconds": tolerance}), flush=True)
            refreshed = oracle.run(dict(scene, atoms=atoms))
            if refreshed["status"] != "ok":
                raise RuntimeError("reference failed while rebuilding tolerant constraints")
            record_evidence(args.out / "target-relaxed.json", refreshed)
            rows, seen = [], set()
            for row in refreshed["rows"]:
                if row_key(row) not in seen:
                    rows.append(row); seen.add(row_key(row))
            variant, blocked, tried_candidates = 0, [], set()
            indices = {row_key(row): i for i, row in enumerate(rows)}
            paths = PathSamples(rows)
            focus = None
            # Replay/rank the saved seed under the NEW acceptance window before
            # using it. Never compare rankings from different tolerances.
            if best_rules is not None:
                saved_rules = best_rules
                best_rank = None
                saved_text = macro_text(saved_rules, atoms, actions)
                saved_replay = verify(saved_text)
                preview(saved_text, saved_replay, saved_rules)
                learn(saved_replay, saved_text)
                tried_candidates.add(saved_text)
            record_evidence(args.out / "scene.json", scene)
            report["scenario_sha256"] = hashlib.sha256(json.dumps(scene, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
            return True

        def expand(reason):
            nonlocal atoms, paths, focus
            if not prototype:
                return False
            states = [p["replay"]["rows"][-1].get("state") for p in paths.paths.values()
                      if p["replay"].get("rows")]
            extended = expand_thresholds(atoms, states)
            if len(extended) == len(atoms) or len(extended) > 30000:
                return False
            count = len(atoms)
            print(json.dumps({"phase": "expanding", "from_atoms": count,
                              "to_atoms": len(extended), "reason": reason}), flush=True)
            refreshed = oracle.run(dict(scene, atoms=extended))
            if refreshed["status"] != "ok":
                raise RuntimeError("reference failed while expanding the legal condition catalog")
            atoms = extended
            record_evidence(args.out / "atoms.json", atoms)
            paths = PathSamples(refreshed["rows"])
            activate(None, paths.teacher)
            report.setdefault("condition_expansions", []).append({"from": count, "to": len(atoms), "reason": reason})
            if best_rules is not None:
                text = macro_text(best_rules, atoms, actions)
                replay = verify(text)
                preview(text, replay, best_rules)
                learn(replay, text)
                scheduler.improved(repair_trials(best_rules, atoms, replay))
            return True

        # Always obtain an honest, replayed baseline before hard constraints
        # can reject the finite language. This is a normal macro, not a script.
        if prototype:
            draft_rows = [r for r in rows if r["allowed"]]
            draft = construct(draft_rows, atoms, actions)
            report["draft_solve_ms"] = draft["solve_ms"]
            rules = draft.get("rules", draft.get("partial_rules", []))
            if not rules:
                distinct = dict.fromkeys(r["allowed"][0] for r in draft_rows)
                rules = [{"action": a, "atoms": []} for a in distinct]
            text = macro_text(rules, atoms, actions)
            record_evidence(args.out / "draft.json", draft)
            replay = publish(text, 0, rules)
            tried_candidates.add(text)
            learn(replay, text)
            if replay["comparison"]["reproduced"]:
                finish_exact(rules,text,replay,0)
                return

        for iteration in range(1, args.iterations + 1):
            check_cancelled()
            remaining = args.seconds - (time.perf_counter() - started)
            if remaining <= 0:
                break
            print(json.dumps({"phase": "solving", "iteration": iteration}), flush=True)
            local_trial = scheduler.next(tried_candidates, lambda rules: macro_text(rules, atoms, actions))
            if prototype and not local_trial:
                if variant > 0 and variant % 16 == 0 and expand("stalled_whole_program_search"):
                    variant += 1
                    continue
                activate(*paths.select(variant))
            evidence = None if local_trial else conflict(rows)
            if evidence:
                evidence["path_id"] = active_path
                record_evidence(args.out / "conflict.json", evidence)
                if prototype and active_path is not None:
                    paths.rejected.add(active_path)
                    activate(None, paths.teacher)
                    focus = None
                    # This incoming trajectory failed; rebuild the whole macro.
                    # Its existence says nothing about another reachable path.
                    restart_next = True
                    evidence = conflict(rows)
                    if evidence is None:
                        print(json.dumps({"phase": "branching", "reason": "rejected_path_released"}), flush=True)
                if evidence is None:
                    pass
                elif relax("indistinguishable_observations"):
                    continue
                elif prototype:
                    if expand("finite_observation_conflict"):
                        variant += 1
                        continue
                    # Teacher snapshots are construction guidance, not a demand
                    # that every tolerated program visit the same wait states.
                    paths.teacher_positive_only = True
                    activate(None, [r for r in paths.teacher if r["allowed"]])
                    restart_next = True
                else:
                    report["status"] = "finite_language_conflict"
                    report["reason"] = "当前条件仍存在冲突，已保留真实回放最好的宏。"
                    break
            if local_trial:
                result = {"status": "candidate", "method": "local_guard_split" if local_trial.get("repair") else "local_threshold_repair",
                          "rules": local_trial["rules"], "solve_ms": 0.0,
                          "slots": None, "terms": None, "sample_count": len(rows),
                          "distinct_atoms": None, "rule_count": len(local_trial["rules"]),
                          "edit": {k: v for k, v in local_trial.items() if k != "rules"}}
            elif prototype:
                # A missed wait produces a reversible cast-now branch at the
                # LAST aligned state. If impossible, release that branch and
                # prefer real wake-up thresholds instead. Never turn it into
                # a permanent WAIT=false label or a global UNSAT claim.
                obligations = [focus["row"]] if focus and focus["cast_now"] else []
                preferred = focus["wake_atoms"] if focus else []
                seed = None if restart_next or iteration % 8 == 0 else best_rules
                restart_next = False
                result = construct(rows, atoms, actions, variant,
                                   lambda p: print(json.dumps(dict(p, iteration=iteration)), flush=True),
                                   seed=seed, obligations=obligations, cache=sample_index,
                                   preferred_atoms=preferred, repair_seed=variant % 2 == 0)
                if focus:
                    result["wait_refinement"] = focus
                if result["status"] != "sat" and obligations:
                    branch = result
                    result = construct(rows, atoms, actions, variant, seed=seed,
                                       cache=sample_index, preferred_atoms=preferred, repair_seed=variant % 2 == 0)
                    result["solve_ms"] += branch["solve_ms"]
                    result["wait_refinement"] = dict(focus, cast_now_branch="infeasible_released")
                variant += 1  # Never restart the same seed on every new sample.
            else:
                result, smt = solve(rows, atoms, actions, *sizes[size],
                                    args.solver_ms if remaining == float("inf") else min(args.solver_ms, max(1, int(remaining*1000))), blocked,
                                    deadline=started+args.seconds)
                text_evidence((args.out / f"iteration-{iteration:03d}.smt2"), smt)
            record_evidence(args.out / f"iteration-{iteration:03d}.json", result)
            summary = {k: result[k] for k in ("status", "solve_ms", "slots", "terms", "sample_count", "distinct_atoms")}
            for k in ("method", "rule_count", "max_terms_used", "variant", "seed_rules", "repaired_rules", "wait_refinement", "edit"):
                if k in result:
                    summary[k] = result[k]
            summary["path_id"] = active_path if prototype else None
            if "reason" in result:
                summary["reason"] = result["reason"]
            iteration_solve_ms += summary['solve_ms']
            if record:
                report["iterations"].append(summary)
            print(json.dumps({"iteration": iteration, **summary}), flush=True)
            if result["status"] not in ("sat", "candidate"):
                if prototype:
                    if relax("finite_and_conflict"):
                        continue
                    record_evidence(args.out / "conflict.json", result.get("conflict"))
                    if active_path is not None:
                        paths.rejected.add(active_path)
                    if expand("finite_and_conflict"):
                        continue
                    if active_path is None:
                        paths.teacher_positive_only = True
                    restart_next = True
                    summary["refinement"] = "release_infeasible_path_and_rebuild"
                    continue
                had_blocked = bool(blocked)
                size += 1
                blocked = []
                if size == len(sizes):
                    report["status"] = "bounded_unsat" if result["status"] == "unsat" else "unknown"
                    if had_blocked and result["status"] == "unsat":
                        report["status"] = "runtime_search_exhausted"
                    report["reason"] = result.get("reason", "Only the stated finite catalog and rule bounds are UNSAT.")
                    break
                continue
            text = macro_text(result["rules"], atoms, actions)
            if prototype and text in tried_candidates:
                restart_next = True
                if variant >= 8 and relax("repeated_witness_without_timing_progress"):
                    continue
                summary["refinement"] = "try_another_sample_witness"
                continue
            tried_candidates.add(text)
            text_evidence((args.out / f"candidate-{iteration:03d}.txt"), text)
            print(json.dumps({"phase": "candidate", "iteration": iteration, "macro": text,
                              "rule_count": len(result["rules"]), "time_tolerance_seconds": tolerance}, ensure_ascii=False), flush=True)
            check_cancelled()
            print(json.dumps({"phase": "replaying", "iteration": iteration,
                              "rule_count": len(result["rules"])}), flush=True)
            replay = verify(text)
            record_evidence(args.out / f"replay-{iteration:03d}.json", replay)
            summary["comparison"] = replay["comparison"]
            summary["timings_ms"] = replay.get("timings_ms", {})
            report["comparison"] = replay["comparison"]
            preview(text, replay, result["rules"], local_trial)
            print(json.dumps({"phase": "replayed", "iteration": iteration, **summary}), flush=True)
            if replay["comparison"]["reproduced"]:
                finish_exact(result["rules"],text,replay,iteration)
                break
            # Only rows emitted while the exact action/time prefix was aligned.
            # Include all new prefix wait states; never label the diverged suffix.
            added = learn(replay, text)
            summary["added_counterexamples"] = added
            summary["rejected_transitions"] = sum(bool(r.get("rejected_actions")) for r in replay["rows"])
            if focus:
                summary["wait_counterexample"] = focus
            if added:
                blocked = []  # atom equivalence partition will be rebuilt
            else:
                if prototype:
                    restart_next = not bool(focus)
                    if variant >= 8 and not focus:
                        relax("timing_search_stalled")
                    summary["refinement"] = "wait_edge_branch" if focus else "rebuild_whole_witness_for_runtime_scheduling"
                else:
                    blocked.append(result["model_values"])
                    summary["refinement"] = "whole_candidate_blocked_for_runtime_scheduling"
        record_evidence(args.out / "constraints.json", rows)
    except Cancelled:
        if report["status"] == "exact":
            report["compression_stop"] = "cancelled"
        else:
            report["status"] = "cancelled"
    except TimeoutError as error:
        if report["status"] == "exact":
            report["compression_stop"] = "budget_exhausted"
        else:
            report["status"] = "budget_exhausted"
        report["reason"] = str(error)
    except Exception as error:
        if report["status"] == "exact":
            report["compression_stop"] = "cancelled" if CANCELLED.is_set() else "error"
        else:
            report["status"] = "cancelled" if CANCELLED.is_set() else "error"
        report["reason"] = str(error)
        raise
    finally:
        oracle.close()
        if report.get("compression") and report.get("compression_stop"):
            report["compression"]["status"] = report["compression_stop"]
            record_evidence(args.out / "compression-summary.json", report["compression"])
        if best_value is not None:
            report["comparison"] = best_value['comparison']
        report["wall_elapsed_ms"] = (time.perf_counter() - started)*1000
        report["elapsed_ms"] = max(0, report["wall_elapsed_ms"] - PAUSED_SECONDS*1000)
        report["extraction_solve_ms"] = report.get("draft_solve_ms", 0) + iteration_solve_ms
        report["total_solve_ms"] = report["extraction_solve_ms"] + report.get("compression_solve_ms",0)
        record_evidence(args.out / "report.json", report)
        public_report = {k:report[k] for k in ('status','reason','comparison','total_solve_ms','compression_stop') if k in report}
        if report.get('compression'):
            public_report['compression'] = {k:report['compression'][k] for k in (
                'status','initial_chars','best_chars','saved_chars','trial_count','accepted_count',
                'method','last_batch_rules') if k in report['compression']}
        args.result.update(report=public_report, macro=best_value['macro'] if best_value else None)
        print(json.dumps({k:v for k,v in report.items() if k in ("status","comparison","reason","elapsed_ms","total_solve_ms")}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
