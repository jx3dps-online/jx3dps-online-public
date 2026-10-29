"""Finite native-chain SAT for a macro region on one immutable path guide.

This module proposes complete programs, never certifies a macro. All guards
use the original right-associated &/| grammar; fixed outside rules take part
in first-match selection. SAT/UNSAT concern this sampled, bounded problem.
"""
import time

import z3


def _or(values):
    return z3.Or(values) if values else z3.BoolVal(False)


def _choice(variable, values):
    return _or([variable == value for value in values])


def _row_cursors(samples):
    """Associate WAIT and legal rows with their event on this single path."""
    groups = getattr(samples, "groups", {})
    by_bit = {}
    for cursor, mask in groups.items():
        while mask:
            bit = mask & -mask
            mask ^= bit
            by_bit[bit] = cursor
    rows = getattr(samples, "rows", ())
    return {1 << index: (rows[index].get("cursor", index)
            if index < len(rows) and rows[index].get("cursor", index) in groups
            else by_bit.get(1 << index)) for index in range(samples.all.bit_length())}


def compatible_first_witness(rules, samples):
    """Independent screen: ignore old event snapshots after its first hit.

    This remains a sampled path projection, not a simulator. WAIT observations
    before the first witness and terminal WAIT observations remain binding.
    """
    groups = getattr(samples, "groups", {})
    cursors, done = _row_cursors(samples), set()
    bits = samples.all
    while bits:
        samples.check()
        bit = bits & -bits
        bits ^= bit
        cursor = cursors.get(bit)
        if cursor in done:
            continue
        chosen = next((rule["action"] for rule in rules if samples.hit(rule) & bit), None)
        if chosen is not None:
            if not samples.allowed[chosen] & bit:
                return False
            if cursor is not None and groups[cursor] & bit:
                done.add(cursor)
        if chosen is None and samples.required & bit:
            return False
    return all(cursor in done for cursor in groups)


class RegionProblem:
    """One region problem, with incremental model blocking/cost tightening."""

    def __init__(self, source, samples, clone, region, *, max_slots=3,
                 max_terms=4, timeout_ms=150, cost_bound=None,
                 allow_equal=False, default_action=None, guard_library=None):
        samples.check()
        self.samples, self.clone, self.region = samples, clone, region
        self.pool = tuple(region["atoms"])
        self.actions = tuple(region["actions"])
        self.gaps = tuple(region["gaps"])
        self.donors = tuple(region["donors"])
        self.guard_library = None if guard_library is None else tuple(guard_library)
        removed = set(self.donors)
        self.survivors = clone([rule for index, rule in enumerate(source)
                                if index not in removed])
        self.original_cost = sum(samples.rule_cost(rule) + 1 for rule in source)
        self.fixed_cost = sum(samples.rule_cost(rule) + 1 for rule in self.survivors)
        self.bound = (self.original_cost + int(allow_equal)
                      if cost_bound is None else cost_bound)
        self.max_terms, self.timeout_ms = max(0, max_terms), max(1, timeout_ms)
        self.solver = z3.Solver()
        self.solver.set(timeout=self.timeout_ms, random_seed=0)
        self.variables, self.slots, self.costs = [], [], []
        self.encoded_rows = 0
        self.construction_started = time.perf_counter()
        if not self.actions or not self.gaps or max_slots <= 0:
            self.solver.add(False)
            self.total_cost = z3.IntVal(self.fixed_cost)
            return

        for index in range(max_slots):
            samples.check()
            on = z3.Bool("region_on_%d" % index)
            action = z3.Int("region_action_%d" % index)
            gap = z3.Int("region_gap_%d" % index)
            length = z3.Int("region_length_%d" % index)
            atoms = ([] if self.guard_library is not None else
                [z3.Int("region_atom_%d_%d" % (index, term)) for term in range(self.max_terms)])
            ops = [z3.Bool("region_and_%d_%d" % (index, term))
                   for term in range(max(0, len(atoms) - 1))]
            slot = dict(on=on, action=action, gap=gap, length=length,
                        atoms=atoms, ops=ops)
            self.slots.append(slot)
            self.variables.extend([on, action, gap, length] + atoms + ops)
            self.solver.add(_choice(action, self.actions), _choice(gap, self.gaps))
            if self.guard_library is None:
                self.solver.add(length >= 0, length <= (self.max_terms if self.pool else 0))
            else:
                choices = [z3.Bool("region_guard_%d_%d" % (index, offset))
                           for offset in range(len(self.guard_library))]
                self.solver.add(z3.PbEq([(variable, 1) for variable in choices], 1)
                    if choices else z3.BoolVal(False))
                guard = z3.Sum([z3.If(variable, offset, 0) for offset, variable in enumerate(choices)])
                slot["guard"] = guard
                slot["guard_choices"] = choices
                self.variables.extend(choices)
                self.solver.add(length == z3.Sum([z3.If(variable, len(value["atoms"]), 0)
                    for variable, value in zip(choices, self.guard_library)]))
                # An inactive slot uses the unconditional library entry.
                empty = next((offset for offset, value in enumerate(self.guard_library) if not value["atoms"]), None)
                if empty is not None:
                    self.solver.add(z3.Implies(z3.Not(on), choices[empty]))
            self.solver.add(z3.Implies(z3.Not(on), z3.And(
                action == self.actions[0], gap == self.gaps[-1], length == 0)))
            if index:
                self.solver.add(z3.Implies(on, self.slots[index - 1]["on"]),
                                z3.Implies(on, gap >= self.slots[index - 1]["gap"]))
            for term, atom in enumerate(atoms):
                self.solver.add(atom >= 0, atom < max(1, len(self.pool)),
                                z3.Implies(length <= term, atom == 0))
                for prior in range(term):
                    self.solver.add(z3.Implies(length > term, atom != atoms[prior]))
            for term, op in enumerate(ops):
                self.solver.add(z3.Implies(length <= term + 1, op))
            action_cost = z3.Sum([z3.If(action == value,
                samples.rule_cost({"action": value, "atoms": []}) + 1, 0)
                for value in self.actions])
            leaf_cost = z3.Sum([z3.If(length > term, z3.Sum([
                z3.If(atom == offset, samples.atom_costs[value], 0)
                for offset, value in enumerate(self.pool)]), 0)
                for term, atom in enumerate(atoms)])
            # [guard] + following space = 3; length - 1 connectors.
            guard_cost = (z3.If(length > 0, leaf_cost + length + 2, 0)
                if self.guard_library is None else z3.Sum([z3.If(variable, value["cost"], 0)
                    for variable, value in zip(slot["guard_choices"], self.guard_library)]))
            self.costs.append(z3.If(on, action_cost + guard_cost, 0))
        self.total_cost = self.fixed_cost + z3.Sum(self.costs)
        self.solver.add(self.total_cost < self.bound)
        if not self.survivors:
            self.solver.add(_or([slot["on"] for slot in self.slots]))
        if default_action is not None:
            self.solver.add(_or([z3.And(slot["on"], slot["action"] == default_action,
                slot["length"] == 0, slot["gap"] == self.gaps[-1],
                z3.Not(_or([later["on"] for later in self.slots[index + 1:]])))
                for index, slot in enumerate(self.slots)]))
        self._encode_observations()

    def _encode_observations(self):
        samples = self.samples
        fixed_hits = [samples.hit(rule) for rule in self.survivors]
        encoded, witnesses, prior = {}, {}, {}
        groups = getattr(samples, "groups", {})
        cursors = _row_cursors(samples)
        active_bits = samples.all
        leaf_cache, condition_cache, hit_cache, action_cache = {}, {}, {}, {}
        while active_bits:
            samples.check()
            bit = active_bits & -active_bits
            active_bits ^= bit
            truth = (tuple(bool(samples.truth[atom] & bit) for atom in self.pool)
                if self.guard_library is None else tuple(bool(guard["mask"] & bit) for guard in self.guard_library))
            executable = tuple(bool(samples.executable[action] & bit) for action in self.actions)
            allowed = tuple(action for action in range(len(samples.allowed))
                            if samples.allowed[action] & bit)
            fixed = tuple(bool(hit & bit) for hit in fixed_hits)
            first_fixed = next((index for index, value in enumerate(fixed) if value), None)
            required = bool(samples.required & bit)
            # A later fixed hit can never win after the first fixed hit or an
            # intervening new hit. Its identity does not distinguish selection.
            key = truth, executable, allowed, first_fixed, required
            if key not in encoded:
                hits = []
                for index, slot in enumerate(self.slots):
                    samples.check()
                    length = slot["length"]
                    condition = z3.BoolVal(True)
                    # Inactive suffix is true; the last active atom ignores
                    # its unused connector. This directly encodes right fold.
                    for term in range(len(slot["atoms"]) - 1, -1, -1):
                        cache_key = index, term, truth
                        if cache_key not in leaf_cache:
                            leaf_cache[cache_key] = _choice(slot["atoms"][term],
                                [offset for offset, value in enumerate(truth) if value])
                        leaf = leaf_cache[cache_key]
                        if term == len(slot["atoms"]) - 1:
                            tail = leaf
                        else:
                            tail = z3.If(length == term + 1, leaf,
                                z3.If(slot["ops"][term], z3.And(leaf, condition),
                                      z3.Or(leaf, condition)))
                        condition = z3.If(length > term, tail, z3.BoolVal(True))
                    if self.guard_library is not None:
                        cache_key = index, truth
                        if cache_key not in condition_cache:
                            condition_cache[cache_key] = _or([variable for variable, value
                                in zip(slot["guard_choices"], truth) if value])
                        condition = condition_cache[cache_key]
                    action_key = index, executable
                    if action_key not in action_cache:
                        action_cache[action_key] = _choice(slot["action"],
                            [action for action, value in zip(self.actions, executable) if value])
                    hit_key = index, truth, executable
                    if hit_key not in hit_cache:
                        hit_cache[hit_key] = z3.And(slot["on"], condition, action_cache[action_key])
                    hits.append(hit_cache[hit_key])
                selected_good, invalid = [], []
                for index, (slot, hit) in enumerate(zip(self.slots, hits)):
                    prior_fixed = (z3.BoolVal(False) if first_fixed is None else slot["gap"] > first_fixed)
                    selected = z3.And(hit, z3.Not(_or(hits[:index])), z3.Not(prior_fixed))
                    good = _choice(slot["action"], allowed)
                    invalid.append(z3.And(selected, z3.Not(good)))
                    selected_good.append(z3.And(selected, good))
                if first_fixed is not None:
                    fixed_index, rule = first_fixed, self.survivors[first_fixed]
                    prior_new = _or([z3.And(slot_hit, slot["gap"] <= fixed_index)
                        for slot, slot_hit in zip(self.slots, hits)])
                    selected = z3.Not(prior_new)
                    if rule["action"] not in allowed:
                        invalid.append(selected)
                    else:
                        selected_good.append(selected)
                covered = _or(selected_good)
                encoded[key] = covered, z3.Not(_or(invalid))
                self.encoded_rows += 1
            covered, legal = encoded[key]
            cursor = cursors.get(bit)
            earlier = _or(prior.get(cursor, [])) if cursor is not None else z3.BoolVal(False)
            active = z3.Not(earlier)
            self.solver.add(z3.Implies(active, legal))
            if required:
                self.solver.add(z3.Implies(active, covered))
            if cursor is not None and groups[cursor] & bit:
                witnesses.setdefault(cursor, []).append(covered)
                prior.setdefault(cursor, []).append(covered)
        for cursor, mask in groups.items():
            samples.check()
            self.solver.add(_or(witnesses.get(cursor, [])))

    def decode(self, model):
        replacement = []
        for slot in self.slots:
            if not z3.is_true(model.eval(slot["on"], model_completion=True)):
                continue
            length = model.eval(slot["length"], model_completion=True).as_long()
            if self.guard_library is None:
                atoms = [self.pool[model.eval(variable, model_completion=True).as_long()]
                         for variable in slot["atoms"][:length]]
                ops = ["&" if z3.is_true(model.eval(variable, model_completion=True)) else "|"
                       for variable in slot["ops"][:max(0, length - 1)]]
            else:
                guard = self.guard_library[model.eval(slot["guard"], model_completion=True).as_long()]
                atoms, ops = list(guard["atoms"]), list(guard["ops"])
            rule = {"action": model.eval(slot["action"], model_completion=True).as_long(),
                    "atoms": atoms}
            if "|" in ops:
                rule["ops"] = ops
            gap = model.eval(slot["gap"], model_completion=True).as_long()
            replacement.append((gap, rule))
        output = []
        for gap in range(len(self.survivors) + 1):
            output.extend(self.clone([rule for position, rule in replacement if position == gap]))
            if gap < len(self.survivors):
                output.extend(self.clone([self.survivors[gap]]))
        return output

    def block(self, model):
        self.solver.add(_or([variable != model.eval(variable, model_completion=True)
                             for variable in self.variables]))


def region_models(source, samples, clone, check_solver, diagnostic, region,
                  *, max_models=3, **options):
    """Yield SAT proposals; unknown/cancel never become finite UNSAT labels."""
    samples.check()
    construction = time.perf_counter()
    problem = RegionProblem(source, samples, clone, region, **options)
    construction_ms = (time.perf_counter() - construction) * 1000
    for index in range(max(0, max_models)):
        samples.check()
        started = time.perf_counter()
        try:
            status = check_solver(problem.solver)
            samples.check()
        except BaseException as error:
            if diagnostic is not None:
                status = ("cancelled" if isinstance(error, (InterruptedError, KeyboardInterrupt))
                          or type(error).__name__ == "Cancelled" else
                          "observation_ended" if isinstance(error, TimeoutError) else "error")
                diagnostic({"kind": "region_sat", "status": status,
                    "donors": list(problem.donors), "model": index,
                    "scope": "one path; finite local native-chain projection"}, None)
            raise
        info = {"kind": "region_sat", "status": str(status), "model": index,
                "donors": list(problem.donors), "slots": len(problem.slots),
                "terms": problem.max_terms, "atoms": len(problem.pool),
                "actions": len(problem.actions), "gaps": len(problem.gaps),
                "rows": problem.encoded_rows, "cost_bound_exclusive": problem.bound,
                "construction_ms": construction_ms if index == 0 else 0,
                "solve_ms": (time.perf_counter() - started) * 1000,
                "path_id": getattr(samples, "path_id", None),
                "backend": "chain" if problem.guard_library is None else "whole_guards",
                "guard_candidates": 0 if problem.guard_library is None else len(problem.guard_library),
                "scope": "one path; finite local native-chain first-witness projection"}
        if status == z3.unknown:
            info["reason"] = problem.solver.reason_unknown()
        if diagnostic is not None:
            diagnostic(info, None)
        if status != z3.sat:
            return
        model = problem.solver.model()
        trial = problem.decode(model)
        # Independent bitset evaluation catches encoding mistakes. It is not
        # a native simulation certificate and cannot validate new wake times.
        if not compatible_first_witness(trial, samples):
            raise AssertionError("region SAT model disagrees with native sample masks")
        yield trial
        problem.block(model)
