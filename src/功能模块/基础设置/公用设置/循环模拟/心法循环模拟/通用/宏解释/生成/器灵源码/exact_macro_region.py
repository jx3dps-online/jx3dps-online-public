"""Discover and jointly rewrite macro regions without a reference macro.

Old rule ownership finds affected events only. New conditions/actions/gaps
are jointly chosen, so a replacement may regroup releases across old lines.
Every yielded proposal still requires independent native replay from t=0.
"""
from collections import deque
import importlib.util
from itertools import combinations
from pathlib import Path
import time


_MODULES = {}


def _module(name):
    if name not in _MODULES:
        spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(name + ".py"))
        value = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(value)
        _MODULES[name] = value
    return _MODULES[name]


def _key(rules):
    conditions = _module("exact_macro_conditions")
    return tuple((rule["action"],) + conditions.condition_key(rule) for rule in rules)


def discover_regions(rules, samples, *, max_regions=8, max_region_rows=6):
    """Fair repeated-action/conflict/local seeds; no fixed new event grouping."""
    samples.check()
    selections, _ = samples.selections(rules)
    hits = [samples.hit(rule) for rule in rules]
    families, queues, seen = {}, {"family": deque(), "conflict": deque(), "local": deque()}, set()
    for index, rule in enumerate(rules):
        families.setdefault(rule["action"], []).append(index)

    def add(kind, indices):
        samples.check()
        group = tuple(sorted(set(indices)))
        if (2 <= len(group) <= max_region_rows and group not in seen
                and any(selections[index] for index in group)):
            seen.add(group)
            queues[kind].append(group)

    for positions in families.values():
        add("family", positions)
        # Includes the previously missing same-action 2 -> 2 neighbourhood.
        for left, right in combinations(positions, 2):
            add("family", (left, right))
    for left, right in combinations(range(len(rules)), 2):
        samples.check()
        if rules[left]["action"] == rules[right]["action"]:
            continue
        collision = ((hits[left] & selections[right]) | (hits[right] & selections[left])
            | (samples.executable[rules[left]["action"]] & selections[right])
            | (samples.executable[rules[right]["action"]] & selections[left]))
        if collision:
            add("conflict", (left, right))
            if right - left + 1 <= max_region_rows:
                add("conflict", range(left, right + 1))
    for width in range(2, max_region_rows + 1):
        for start in range(max(0, len(rules) - width + 1)):
            add("local", range(start, start + width))
    for kind, queue in queues.items():
        queues[kind] = deque(sorted(queue, key=lambda group:
            (-sum(samples.rule_cost(rules[index]) + 1 for index in group), len(group), group)))
    found = []
    while any(queues.values()) and len(found) < max(0, max_regions):
        for queue in queues.values():
            samples.check()
            if queue and len(found) < max_regions:
                found.append(queue.popleft())
    return found


def _event_masks(samples, selected):
    groups = getattr(samples, "groups", {})
    return tuple(mask for mask in groups.values() if mask & selected)


def propose_region(rules, samples, donors, *, max_atoms=32, max_actions=6,
                   max_gaps=8, structural=True, max_terms=4):
    """Learn a bounded literal pool from release-window coverage, not names.

    Old literals, legal clock distinctions and residual branch suggestions
    share the pool. Suggestions bias enumeration only; SAT may rearrange all
    these leaves and their native connectors. No template macro is consulted.
    """
    samples.check()
    conditions = _module("exact_macro_conditions")
    donors = tuple(sorted(set(donors)))
    selected, _ = samples.selections(rules)
    affected = 0
    for index in donors:
        affected |= selected[index]
    events = _event_masks(samples, affected)
    # Every action capable of a legal release in an affected window may be
    # suggested, including native cast/fcast/combo aliases reported by oracle.
    window_mask = 0
    for mask in events:
        window_mask |= mask
    if not window_mask:
        window_mask = affected
    original_actions = sorted({rules[index]["action"] for index in donors})
    extras = sorted((action for action in range(len(samples.allowed))
        if action not in original_actions
        and samples.allowed[action] & samples.executable[action] & window_mask),
        key=lambda action: (samples.rule_cost({"action": action, "atoms": []}), action))
    actions = tuple(original_actions + extras[:max(0, max_actions - len(original_actions))])
    source_atoms = tuple(dict.fromkeys(atom for index in donors
        for atom in conditions.normalize(rules[index])["atoms"]))
    # A retained prefix settles some observations regardless of local guards.
    # Use this context for ranking only; SAT still permits other insertion
    # positions and independently checks all their first-match interactions.
    prefix_remaining = samples.all
    for rule in rules[:min(donors, default=0)]:
        prefix_remaining &= ~samples.hit(rule)
    clocks = {index for index, text in enumerate(getattr(samples, "atoms", ())) if "bufftime:" in text}
    signatures = {}
    for index, truth in enumerate(samples.truth):
        samples.check()
        signature = (truth & samples.all, index if index in clocks else None)
        old = signatures.get(signature)
        if old is None or (samples.atom_costs[index], index) < (samples.atom_costs[old], old):
            signatures[signature] = index
    ranked = []
    for index in signatures.values():
        samples.check()
        mask = samples.truth[index]
        # Predicate-induced event coverage can mix releases from old rules.
        covered_events = sum(bool(mask & event) for event in events)
        good = bad = 0
        for action in actions:
            hit = mask & samples.executable[action]
            good |= hit & samples.allowed[action] & window_mask
            bad |= hit & ~samples.allowed[action] & prefix_remaining
        precision = good.bit_count() / max(1, (good | bad).bit_count())
        event_recall = covered_events / max(1, len(events))
        # Cheap predicates true almost everywhere should not bury informative
        # branch gates. This is a transparent structural-learning proposal
        # score, never a classification correctness or certification claim.
        score = (2 * precision + event_recall) / (samples.atom_costs[index] + 1)
        ranked.append((-score, bad.bit_count(), samples.atom_costs[index], index))
    ranked.sort()
    suggestions = []
    if structural and events:
        # A small existential-window learner proposes common prefixes and
        # native branches. Its bounded failure never excludes other leaves.
        for action in actions[:3]:
            samples.check()
            windows = [event & samples.allowed[action] & samples.executable[action] for event in events]
            windows = [mask for mask in windows if mask]
            negatives = samples.executable[action] & ~samples.allowed[action] & samples.all
            if not windows:
                continue
            guards = conditions.window_guards(windows, negatives, samples,
                max_terms=max_terms, max_candidates=2, branch_limit=8,
                max_states=48, max_atoms=max(8, max_atoms), preferred_atoms=source_atoms)
            suggestions.extend(atom for guard in guards for atom in guard["atoms"])
    pool = list(dict.fromkeys(source_atoms + tuple(suggestions)))
    # Retain a quota of distinct clocks even when cheap static features lead.
    timed = [entry[-1] for entry in ranked if entry[-1] in clocks]
    stable = [entry[-1] for entry in ranked if entry[-1] not in clocks]
    target = max(max_atoms, len(pool))
    clock_quota = min(len(timed), max(2, target // 4))
    for atom in timed[:clock_quota] + stable + timed[clock_quota:]:
        if atom not in pool and len(pool) < target:
            pool.append(atom)
    pool = tuple(sorted(pool, key=lambda atom: (samples.atom_costs[atom], atom)))
    removed, original_gaps, surviving = set(donors), [], 0
    for index in range(len(rules)):
        if index in removed:
            original_gaps.append(surviving)
        else:
            surviving += 1
    if surviving + 1 <= max_gaps:
        gaps = tuple(range(surviving + 1))
    else:
        prioritized = list(dict.fromkeys(original_gaps + [0, surviving]))
        for offset in range(surviving + 1):
            if offset not in prioritized and len(prioritized) < max(max_gaps, len(set(original_gaps))):
                prioritized.append(offset)
        gaps = tuple(sorted(prioritized))
    return {"donors": donors, "actions": actions, "atoms": pool, "gaps": gaps,
            "events": events, "structural_atoms": tuple(dict.fromkeys(suggestions))}


def region_edits(rules, samples, clone, check_solver, diagnostic=None,
                 limit=8, *, max_regions=2, max_region_rows=4,
                 max_slots=2, max_terms=3, max_atoms=16, max_actions=4,
                 max_gaps=6, max_models=1, timeout_ms=100,
                 cost_bound=None, allow_equal=False, structural=True,
                 regions=None, default_branches=False, region_offset=0,
                 structural_prior=None, backend="whole_guards", max_guards=96,
                 guard_beam=48, guard_expansions=12000):
    """Yield (region_* kind, complete_rules), always for real replay.

    cost_bound is EXCLUSIVE sum(rule_cost + 1), i.e. nonempty text chars + 1.
    Default admission is strictly shorter than source. All limits bound this
    operator pass only and can be increased by the caller's fair scheduler.
    diagnostic follows the existing diagnostic(info, optional_smt_text) API.
    Single-page samples are supported; caller must preserve/diagnose pages.
    """
    samples.check()
    if not rules or min(limit, max_slots, max_models) <= 0:
        return
    started = time.perf_counter()
    source = clone(rules)
    offset = max(0, region_offset)
    groups = (discover_regions(source, samples, max_regions=max_regions + offset,
        max_region_rows=max_region_rows)[offset:offset + max_regions]
        if regions is None else list(regions)[offset:offset + max_regions])
    seen, yielded, statuses = {_key(source)}, 0, []
    sat = _module("exact_macro_region_sat")
    for donors in groups:
        samples.check()
        region = propose_region(source, samples, donors, max_atoms=max_atoms,
            max_actions=max_actions, max_gaps=max_gaps, structural=structural, max_terms=max_terms)
        if not region["actions"]:
            continue
        options = dict(max_slots=min(max_slots, max(2, len(donors))), max_terms=max_terms,
            timeout_ms=timeout_ms, cost_bound=cost_bound, allow_equal=allow_equal)

        if backend not in ("whole_guards", "chain"):
            raise ValueError("region backend must be whole_guards or chain")
        if backend == "whole_guards":
            guards, guard_stats = _module("exact_macro_region_guards").guard_candidates(
                source, samples, region, max_terms=max_terms, max_candidates=max_guards,
                beam_width=guard_beam, max_expansions=guard_expansions,
                structural_prior=structural_prior)
            options["guard_library"] = guards
            if diagnostic is not None:
                diagnostic(dict(guard_stats, kind="region_guards", donors=list(donors),
                    status="finite_candidates", path_id=getattr(samples, "path_id", None)), None)

        def report(info, smt):
            statuses.append(info["status"])
            if diagnostic is not None:
                diagnostic(info, smt)

        # Baseline joint search can discover defaults itself. Separate short
        # default queries guarantee that exceptions+fallback receive a turn.
        branches = [None] + (list(region["actions"][:2]) if default_branches else [])
        for default in branches:
            samples.check()
            for trial in sat.region_models(source, samples, clone, check_solver, report,
                    region, max_models=max_models, default_action=default, **options):
                samples.check()
                key = _key(trial)
                if key in seen:
                    continue
                seen.add(key)
                kind = "region_default_rewrite" if default is not None else "region_joint_rewrite"
                yield kind, trial
                yielded += 1
                if yielded >= limit:
                    return
    if diagnostic is not None:
        diagnostic({"kind": "region_search", "status": "scope_exhausted",
            "regions": len(groups), "candidates": yielded,
            "sat_checks": statuses.count("sat"), "unsat_checks": statuses.count("unsat"),
            "unknown_checks": statuses.count("unknown"),
            "operator_wall_ms": (time.perf_counter() - started) * 1000,
            "scope": "single path; bounded region/native chains; no global UNSAT"}, None)
