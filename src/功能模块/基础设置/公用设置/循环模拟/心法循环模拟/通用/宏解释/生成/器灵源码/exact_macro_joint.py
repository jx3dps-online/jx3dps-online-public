"""Finite cross-action macro region rebuilds on one immutable sample guide.

Native right-associated AND/OR guards and action priority are chosen jointly.
Incomplete rebuilds are allowed to fail the whole-program sample contract;
only shorter complete programs leave this module. Samples guide proposals,
never certify runtime equivalence. The caller must replay every proposal.
"""
from collections import Counter, deque
import importlib.util
from itertools import combinations
from pathlib import Path
import time


_CONDITIONS = None
_GLOBAL = None


def _module(filename, name):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _conditions():
    global _CONDITIONS
    if _CONDITIONS is None:
        _CONDITIONS = _module("exact_macro_conditions.py", "exact_joint_conditions")
    return _CONDITIONS


def _guard(rule):
    # Normalize legacy conjunction + OR-tail and keep native association.
    return _conditions().normalize(rule)


def _key(rule):
    condition = _conditions().condition_key(rule)
    return rule["action"], condition[0], condition[1]


def _clocks(rule, clock_atoms):
    return tuple(sorted(set(_guard(rule)["atoms"]) & clock_atoms))


def _edit_distance(left, right):
    """Insertion/deletion distance through LCS, with linear workspace."""
    previous = [0] * (len(right) + 1)
    for original in left:
        current = [0]
        for index, proposed in enumerate(right):
            current.append(previous[index] + 1 if original == proposed
                           else max(previous[index + 1], current[-1]))
        previous = current
    return len(left) + len(right) - 2 * previous[-1]


def _round_robin(items, bucket, limit, check):
    """Items are already ranked; give every structural bucket a turn."""
    queues = {}
    for item in items:
        check()
        queues.setdefault(bucket(item), deque()).append(item)
    active = deque(queues.values())
    result = []
    while active and len(result) < limit:
        check()
        queue = active.popleft()
        result.append(queue.popleft())
        if queue:
            active.append(queue)
    return result


def _regions(source, selections, hits, samples, costs, limit, max_region_rows, repair_priority=False):
    """Conflict-seeded contiguous/noncontiguous donor sets, with action quotas.

    A conflict is a source or primitive candidate's executable hit on another
    action's selected states. Primitive collisions are considered only when
    the same guard also covers that candidate action's selected states. This
    targets actual first-match competition rather than arbitrary action pairs.
    """
    positions, selected = {}, {}
    for index, rule in enumerate(source):
        samples.check()
        action = rule["action"]
        positions.setdefault(action, []).append(index)
        selected[action] = selected.get(action, 0) | selections[index]
    actions = sorted(action for action in positions if selected[action])
    edges = {}
    for left, right in combinations(actions, 2):
        samples.check()
        conflict = 0
        for index in positions[left]:
            conflict |= hits[index] & selected[right]
        for index in positions[right]:
            conflict |= hits[index] & selected[left]
        if conflict:
            edges[(left, right)] = (0, -conflict.bit_count())
    # A cheap guard that becomes safe only after another action is peeled is
    # also a concrete hit conflict. Do not require the old program to use it.
    for atom, truth in enumerate(samples.truth):
        samples.check()
        covered = [action for action in actions
                   if truth & samples.executable[action] & selected[action]]
        for left, right in combinations(covered, 2):
            samples.check()
            conflict = ((truth & samples.executable[left] & selected[right])
                        | (truth & samples.executable[right] & selected[left]))
            if conflict:
                edges.setdefault((left, right), (1, samples.atom_costs[atom]))
    # The library also contains the legal unconditional guard. Its executable
    # collisions matter when an alternate witness trajectory can remove WAIT
    # constraints, even if no named predicate happens to join both actions.
    for left, right in combinations(actions, 2):
        samples.check()
        conflict = ((samples.executable[left] & selected[right])
                    | (samples.executable[right] & selected[left]))
        if conflict:
            edges.setdefault((left, right), (2, 0))
    if not edges:
        return [], 0

    found = {}

    def add(group):
        samples.check()
        group = tuple(sorted(set(group)))
        action_set = tuple(sorted({source[index]["action"] for index in group}))
        if len(group) < 2 or len(group) > max_region_rows or len(action_set) < 2:
            return
        active_actions = {source[index]["action"] for index in group if selections[index]}
        if len(active_actions) < 2:
            return
        found.setdefault(group, action_set)

    adjacency = {action: set() for action in actions}
    for left, right in edges:
        adjacency[left].add(right)
        adjacency[right].add(left)
    seen_actions = set()
    for action in actions:
        if action in seen_actions:
            continue
        component, todo = set(), [action]
        while todo:
            samples.check()
            current = todo.pop()
            if current not in component:
                component.add(current)
                todo.extend(sorted(adjacency[current] - component))
        seen_actions |= component
        group = [index for member in component for index in positions[member]]
        add(group)
        if len(group) > max_region_rows:
            add(sorted(group, key=lambda index: (-costs[index], index))[:max_region_rows])
        # Overlapping triples retain 3+ competing action rebuilds even when a
        # large component cannot fit in the bounded donor neighbourhood.
        for center in sorted(component):
            neighbours = sorted(adjacency[center])
            for offset in range(len(neighbours) - 1):
                members = {center, neighbours[offset], neighbours[offset + 1]}
                add(index for member in members for index in positions[member])

    for (left, right), _ in sorted(edges.items(), key=lambda item: (item[1], item[0])):
        samples.check()
        pair = sorted(positions[left] + positions[right])
        add(pair)
        if len(pair) <= 7:
            # Enumerating these small subsets is finite; region quotas below
            # alternate cardinalities so two-row swaps cannot consume all work.
            for size in range(2, len(pair)):
                for group in combinations(pair, size):
                    add(group)
        else:
            expensive = sorted(pair, key=lambda index: (-costs[index], index))
            for width in (2, 3, 4, 6, max_region_rows):
                if width <= max_region_rows:
                    add(expensive[:width])
                    for offset in range(len(pair)):
                        add(pair[offset:offset + width])
            for drop in range(len(pair)):
                add(pair[:drop] + pair[drop + 1:])
        # Include intervening competing actions rather than silently fixing
        # their priority when the colliding pair straddles them.
        for i in positions[left]:
            for j in positions[right]:
                samples.check()
                if not (hits[i] & selections[j] or hits[j] & selections[i]):
                    continue
                begin, end = sorted((i, j))
                for halo in (0, 1):
                    add(range(max(0, begin - halo), min(len(source), end + halo + 1)))

    if repair_priority:
        ranked = sorted(found, key=lambda group: (0 if len(group) <= 4 else 1,
                                                  len(group), group))
    else:
        ranked = sorted(found, key=lambda group: (-sum(costs[index] for index in group), group))
    # Action-set quotas first; within each action set, alternate donor sizes.
    grouped = {}
    for group in ranked:
        grouped.setdefault(found[group], []).append(group)
    ordered = []
    for action_set, groups in grouped.items():
        if not repair_priority:
            groups = _round_robin(groups, len, len(groups), samples.check)
        ordered.extend((action_set, group) for group in groups)
    if repair_priority:
        # Small repairs get the first quota across all action sets. Large
        # rebuilding remains available if the small neighbourhood is exhausted.
        picked = []
        for small in (True, False):
            tier = [item for item in ordered if (len(item[1]) <= 4) == small]
            picked.extend(_round_robin(tier, lambda item: item[0], limit - len(picked), samples.check))
    else:
        picked = _round_robin(ordered, lambda item: item[0], limit, samples.check)
    return [group for _, group in picked], len(edges)


def joint_edits(rules, samples, clone, condition_search=None, diagnostic=None,
                limit=36, *, beam_width=8, max_expansions=384,
                max_guard_queries=80, max_regions=32, max_region_rows=12,
                max_gaps=5, max_targets=4, max_guards=6,
                max_replacements=6, max_feature_guards=128,
                max_refinements=8, witness_fallback=True, cost_bound=None,
                repair_priority=None):
    """Yield ``(joint_* kind, complete_rules)`` for independent native replay.

    Regions remove rows belonging to at least two competing action IDs. The
    beam chooses replacement actions, native guards and increasing survivor
    gaps jointly; no independently valid intermediate edit is required.
    Replacement row count may increase if the final program is shorter.
    ``cost_bound`` optionally supplies an external exclusive character-cost
    ceiling in sum(rule_cost + 1) units (rendered UTF-16 length + 1). A failed
    branch may use its own whole candidate as the seed and make intermediate
    cost increases below the unchanged certified incumbent's ceiling.
    Repair priority defaults on with an external ceiling: small regions and
    fewer LCS insertions/deletions rank before cost. Observed-unselected donor
    rows may be restored as optional compatible variants; no suffix labels or
    fixed rules are introduced, and larger rebuilds remain legal candidates.

    Limits bound candidate work in this pass, not legal macro length or the
    user's task duration. Budget exhaustion proves no UNSAT. Guard results
    are cached only within one immutable guide; executable, allowed, required
    and success-window masks retain their separate meanings. Clock leaves
    remain part of every semantic pruning key and receive structural quotas.

    If strict source-WAIT guidance yields nothing, an explicitly separate
    success-witness projection can propose alternate-clock paths. It retains
    the reached prefix of ONE failed branch via global_keep_mask. This never
    changes caller labels or its runtime WAIT/horizon certification contract.
    ``diagnostic`` is called as ``diagnostic(info, None)`` when supplied.
    """
    options = dict(beam_width=beam_width, max_expansions=max_expansions,
                   max_guard_queries=max_guard_queries, max_regions=max_regions,
                   max_region_rows=max_region_rows, max_gaps=max_gaps,
                   max_targets=max_targets, max_guards=max_guards,
                   max_replacements=max_replacements,
                   max_feature_guards=max_feature_guards,
                   max_refinements=max_refinements, cost_bound=cost_bound,
                   repair_priority=(cost_bound is not None if repair_priority is None else repair_priority))
    found = False
    for item in _search(rules, samples, clone, condition_search, diagnostic, limit, **options):
        found = True
        yield item
    if found or not witness_fallback or not getattr(samples, "groups", None) or limit <= 0:
        return
    global _GLOBAL
    if _GLOBAL is None:
        _GLOBAL = _module("exact_macro_global.py", "exact_joint_global")
    guide = _GLOBAL._WitnessSamples(samples)
    if guide.all == samples.all:
        return
    for kind, trial in _search(rules, guide, clone, condition_search, diagnostic, limit, **options):
        yield kind.replace("joint_region_", "joint_witness_region_"), trial


def _search(rules, samples, clone, condition_search, diagnostic, limit, *,
            beam_width, max_expansions, max_guard_queries, max_regions,
            max_region_rows, max_gaps, max_targets, max_guards,
            max_replacements, max_feature_guards, max_refinements, cost_bound,
            repair_priority):
    started = time.perf_counter()
    samples.check()
    stats = {"kind": "joint_search", "guide_kind": getattr(samples, "guide_kind", "full_source_trajectory"),
             "expanded_states": 0, "guard_lookups": 0, "guard_queries": 0,
             "guard_cache_hits": 0, "guard_budget_skips": 0,
             "refined_guards": 0, "complete_candidates": 0,
             "regions_enumerated": 0, "regions_started": 0,
             "beam_width": beam_width, "max_expansions": max_expansions,
             "max_guard_queries": max_guard_queries, "max_regions": max_regions,
             "max_region_rows": max_region_rows, "max_gaps": max_gaps,
             "max_targets": max_targets, "max_guards": max_guards,
             "max_replacements": max_replacements,
             "max_feature_guards": max_feature_guards,
             "max_refinements": max_refinements, "candidate_limit": limit,
             "external_cost_bound": cost_bound,
             "repair_priority": repair_priority,
             "restored_candidates": 0,
             "scope": "one guide; competing action regions; independent full replay required"}
    action_stats = {}

    def report():
        stats["construction_ms"] = (time.perf_counter() - started) * 1000
        stats["action_sets"] = [dict(action_stats[key], actions=list(key)) for key in sorted(action_stats)]
        if diagnostic is not None:
            diagnostic(dict(stats), None)

    if not rules or limit <= 0 or min(beam_width, max_expansions, max_regions,
                                    max_region_rows - 1, max_gaps, max_targets,
                                    max_guards, max_replacements) <= 0:
        report()
        return
    source = clone(rules)
    costs = [samples.rule_cost(rule) + 1 for rule in source]
    bound = sum(costs) if cost_bound is None else cost_bound
    stats["seed_chars"], stats["ceiling_chars"] = sum(costs) - 1, bound - 1
    if bound <= 0:
        report()
        return
    source_key = tuple(_key(rule) for rule in source)
    hits, selections, rem = [], [], samples.all
    for rule in source:
        samples.check()
        hit = samples.hit(rule)
        hits.append(hit)
        chosen = rem & hit
        selections.append(chosen)
        rem &= ~chosen
    # ONE newly reached branch can make the cost seed incompatible. Keep its
    # actual first forbidden hits as region obligations and expose the actions
    # allowed there even if their old rows were shadowed or had false guards.
    # These remain the caller's labels; no unvisited suffix is manufactured.
    observed_selections = list(selections)
    trouble = rem & samples.required
    for group in getattr(samples, "groups", {}).values():
        if not group & ~rem:
            trouble |= group
    for index, rule in enumerate(source):
        trouble |= selections[index] & ~samples.allowed[rule["action"]]
    if trouble:
        selections = [chosen | (trouble & samples.allowed[rule["action"]]
                                 & samples.executable[rule["action"]])
                      for chosen, rule in zip(selections, source)]
    regions, edges = _regions(source, selections, hits, samples, costs, max_regions,
                              max_region_rows, repair_priority)
    stats["regions_enumerated"], stats["conflict_action_pairs"] = len(regions), edges
    if not regions:
        report()
        return
    clock = {index for index, atom in enumerate(getattr(samples, "atoms", ())) if "bufftime:" in atom}
    library, refinement_atoms, original_guards = {}, {}, []
    seen_guards = set()
    for rule in source:
        guard = _guard(rule)
        if _conditions().condition_key(guard) not in seen_guards:
            seen_guards.add(_conditions().condition_key(guard))
            original_guards.append(guard)
        # Removing one native leaf retains the remaining right-associated
        # chain, including OR. These are columns, never certified local edits.
        for drop in range(len(guard["atoms"])):
            atoms = guard["atoms"][:drop] + guard["atoms"][drop + 1:]
            ops = list(guard["ops"])
            if ops:
                ops.pop(min(drop, len(ops) - 1))
            nearby = {"atoms": atoms, "ops": ops}
            key = _conditions().condition_key(nearby)
            if key not in seen_guards:
                seen_guards.add(key)
                original_guards.append(nearby)

    active_actions = sorted({source[index]["action"] for group in regions for index in group})
    source_leaves = {atom for guard in original_guards for atom in guard["atoms"]}
    stats["primitive_pools"] = []
    for action in active_actions:
        samples.check()
        desired = samples.allowed[action] & samples.executable[action]
        features = {}
        for atom in range(len(samples.truth)):
            samples.check()
            rule = {"action": action, "atoms": [atom], "ops": []}
            hit = samples.hit(rule)
            if hit & desired:
                cost = samples.rule_cost(rule)
                semantic = hit, _clocks(rule, clock)
                entry = (-(hit & desired).bit_count() / (cost + 1), cost, _key(rule), rule)
                if semantic not in features or entry[:3] < features[semantic][:3]:
                    features[semantic] = entry
        ranked = sorted(features.values(), key=lambda item: item[:3])
        stable = [item for item in ranked if not _clocks(item[3], clock)]
        timed = [item for item in ranked if _clocks(item[3], clock)]
        feature_budget = max(0, max_feature_guards)
        stable_quota = (feature_budget + 1) // 2
        timed_quota = feature_budget // 2
        primitives = stable[:stable_quota]
        primitives += _round_robin(timed, lambda item: _clocks(item[3], clock),
                                    timed_quota, samples.check)
        chosen = {_key(item[3]) for item in primitives}
        for item in ranked:
            if len(primitives) >= feature_budget:
                break
            if _key(item[3]) not in chosen:
                primitives.append(item)
                chosen.add(_key(item[3]))
        stats["primitive_pools"].append({"action": action, "stable_quota": stable_quota,
                                        "clock_quota": timed_quota,
                                        "stable_selected": sum(not _clocks(item[3], clock) for item in primitives),
                                        "clock_selected": sum(bool(_clocks(item[3], clock)) for item in primitives),
                                        "source_leaves_retained": len(source_leaves)})
        library[action] = [dict(_guard(guard), action=action) for guard in original_guards]
        library[action].extend(item[3] for item in primitives)
        library[action].append({"action": action, "atoms": [], "ops": []})
        refinement_atoms[action] = sorted(source_leaves | {item[3]["atoms"][0] for item in primitives})

    tasks, queues, buckets, complete_keys = [], {}, {}, set()
    for group in regions:
        samples.check()
        removed, survivors, gaps, positives, units, unseen = set(group), [], set(), 0, {}, []
        for index, rule in enumerate(source):
            if index in removed:
                gaps.add(len(survivors))
                positives |= selections[index]
                units.setdefault(rule["action"], []).append(selections[index])
                if not observed_selections[index]:
                    unseen.append((len(survivors), rule))
            else:
                survivors.append(rule)
        actions = tuple(sorted(units))
        if not positives:
            continue
        # A success window needs at least one permitted hit, not a hit at the
        # exact source timestamp. Include the other observed allowed states in
        # touched windows while preserving truly forbidden WAIT states.
        for window in getattr(samples, "groups", {}).values():
            samples.check()
            if window & positives:
                positives |= window & samples.all
        task = {"group": group, "actions": actions, "survivors": survivors,
                "gaps": gaps, "positives": positives, "units": units,
                "unseen": unseen,
                "allowance": bound - (sum(costs) - sum(costs[index] for index in group)),
                "frontier": [(0, samples.all, (), 0)], "next": [],
                "index": 0, "depth": 0, "started": False}
        tasks.append(task)
        queues.setdefault(actions, deque()).append(task)
        entry = action_stats.setdefault(actions, {"regions": 0, "started": 0,
                                                  "queries": 0, "query_quota": 0,
                                                  "generated": 0, "selected": 0,
                                                  "clock_variants_generated": 0,
                                                  "clock_variants_selected": 0})
        entry["regions"] += 1
    action_sets = sorted(queues)
    for offset, actions in enumerate(action_sets):
        action_stats[actions]["query_quota"] = (max(0, max_guard_queries) // len(action_sets)
                                               + (offset < max(0, max_guard_queries) % len(action_sets)))
    cache, refinement_cache = {}, {}

    def synthesized(actions, positive, negative):
        samples.check()
        stats["guard_lookups"] += 1
        key = positive, negative
        if key in cache:
            stats["guard_cache_hits"] += 1
            return cache[key]
        entry = action_stats[actions]
        if entry["queries"] >= entry["query_quota"]:
            stats["guard_budget_skips"] += 1
            return ()
        stats["guard_queries"] += 1
        entry["queries"] += 1
        guards = [{"atoms": list(guard)} for guard in samples.covers(positive, negative)]
        search = condition_search
        if search is None:
            search = lambda p, n, s: _conditions().short_guards(
                p, n, s, max_terms=6, max_candidates=4, branch_limit=12, max_states=192)
        guards.extend(search(positive, negative, samples))
        unique = {}
        for guard in guards:
            samples.check()
            normalized = _guard(guard)
            mask = _conditions().condition_mask(normalized, samples.truth, samples.all)
            if not positive & ~mask and not negative & mask:
                unique.setdefault(_conditions().condition_key(normalized), normalized)
        cache[key] = tuple(unique.values())
        return cache[key]

    def targets(task, action, remaining):
        allowed = task["positives"] & remaining & samples.allowed[action] & samples.executable[action]
        if not allowed:
            return []
        units = [unit & allowed for unit in task["units"].get(action, ()) if unit & allowed]
        units = list(dict.fromkeys(units))
        halves = []
        if len(units) > 1:
            for part in (units[:len(units) // 2], units[len(units) // 2:], units[::2], units[1::2]):
                mask = 0
                for unit in part:
                    mask |= unit
                halves.append(mask)
        ordered, seen = [], set()
        for mask in [allowed] + halves + units:
            samples.check()
            if mask and mask not in seen:
                ordered.append(mask)
                seen.add(mask)
        return ordered[:max_targets]

    def legal_gaps(task, state):
        gap, remaining, _, _ = state
        opportunities = []
        for position in range(gap, len(task["survivors"]) + 1):
            samples.check()
            if remaining & task["positives"]:
                opportunities.append((position, remaining))
            if position < len(task["survivors"]):
                rule = task["survivors"][position]
                hit = remaining & samples.hit(rule)
                if hit & ~samples.allowed[rule["action"]]:
                    break
                remaining &= ~hit
        ordered = ([opportunities[0], opportunities[-1]] if opportunities else [])
        ordered += [item for item in opportunities if item[0] in task["gaps"]]
        ordered += opportunities
        result, seen = [], set()
        for item in ordered:
            samples.check()
            if item[0] not in seen:
                result.append(item)
                seen.add(item[0])
                if len(result) >= max_gaps:
                    break
        return sorted(result)

    def refined(action, positive, negative):
        if max_refinements <= 0:
            return []
        query = action, positive, negative
        if query in refinement_cache:
            return refinement_cache[query]
        generated = {}
        seeds = []
        for guard in original_guards:
            samples.check()
            if not guard["atoms"]:
                continue
            base = dict(guard, action=action)
            base_hit = samples.hit(base)
            if not base_hit & positive:
                continue
            cost = samples.rule_cost(base)
            seeds.append((-(base_hit & positive).bit_count() / (cost + 1),
                          cost, _key(base), base, base_hit))
        seeds.sort(key=lambda item: item[:3])
        seeds = _round_robin(seeds, lambda item: _clocks(item[3], clock),
                             max_refinements, samples.check)
        for _, _, _, base, base_hit in seeds:
            guard = _guard(base)
            # Prefixing a leaf creates legal q&(old_chain) / q|(old_chain)
            # under native association, without fabricated parentheses.
            for atom in refinement_atoms[action]:
                samples.check()
                if atom in guard["atoms"]:
                    continue
                truth = samples.truth[atom]
                leaf_hit = truth & samples.executable[action]
                for operator, hit in (("&", base_hit & leaf_hit), ("|", base_hit | leaf_hit)):
                    covered = hit & positive
                    if not covered or hit & negative:
                        continue
                    rule = {"action": action, "atoms": [atom] + guard["atoms"],
                            "ops": [operator] + guard["ops"]}
                    cost = samples.rule_cost(rule)
                    semantic = hit, _clocks(rule, clock)
                    entry = (-(covered.bit_count() / (cost + 1)), cost, _key(rule), rule)
                    if semantic not in generated or entry[:3] < generated[semantic][:3]:
                        generated[semantic] = entry
        ranked = sorted(generated.values(), key=lambda item: item[:3])
        chosen = _round_robin(ranked, lambda item: _clocks(item[3], clock), max_refinements, samples.check)
        stats["refined_guards"] += len(chosen)
        refinement_cache[query] = [item[3] for item in chosen]
        return refinement_cache[query]

    def choices(task, action, remaining):
        positive = task["positives"] & remaining & samples.allowed[action]
        negative = remaining & samples.executable[action] & ~samples.allowed[action]
        if not positive & samples.executable[action]:
            return []
        candidates = list(library[action])
        for target in targets(task, action, remaining):
            candidates.extend(dict(_guard(guard), action=action)
                              for guard in synthesized(task["actions"], target, negative))
        candidates.extend(refined(action, positive, negative))
        unique = {}
        for rule in candidates:
            samples.check()
            hit = samples.hit(rule)
            covered = positive & hit
            if not covered or hit & negative:
                continue
            wake = _clocks(rule, clock)
            semantic = hit, wake
            cost = samples.rule_cost(rule)
            entry = (-(covered.bit_count() / (cost + 1)), cost, _key(rule), rule, wake)
            if semantic not in unique or entry[:3] < unique[semantic][:3]:
                unique[semantic] = entry
        ranked = sorted(unique.values(), key=lambda item: item[:3])
        return [item[3] for item in _round_robin(ranked, lambda item: item[4], max_guards, samples.check)]

    def program(task, state):
        inserted = {}
        for gap, rule in state[2]:
            inserted.setdefault(gap, []).append(rule)
        result = []
        for gap in range(len(task["survivors"]) + 1):
            result.extend(inserted.get(gap, ()))
            if gap < len(task["survivors"]):
                result.append(task["survivors"][gap])
        return result

    def record(task, state, restored=False):
        samples.check()
        if state[3] >= task["allowance"]:
            return
        trial = program(task, state)
        key = tuple(_key(rule) for rule in trial)
        if key == source_key or key in complete_keys or not samples.compatible(trial):
            return
        complete_keys.add(key)
        cost = sum(samples.rule_cost(rule) + 1 for rule in trial)
        if cost >= bound:
            return
        distance = _edit_distance(source_key, key) if repair_priority else 0
        wake = tuple(_clocks(rule, clock) for _, rule in state[2])
        action_order = tuple(rule["action"] for _, rule in state[2])
        shape = len(task["group"]), len(state[2]), action_order, wake
        kind = "joint_region_%d_to_%d" % (len(task["group"]), len(state[2]))
        bucket = buckets.setdefault(task["actions"], {}).setdefault(shape, [])
        bucket.append((distance, cost, key, kind, clone(trial), wake))
        bucket.sort(key=lambda item: item[:3])
        del bucket[limit:]
        stats["complete_candidates"] += 1
        action_stats[task["actions"]]["generated"] += 1
        if restored:
            stats["restored_candidates"] += 1

    def admit(task, state):
        record(task, state)
        if not repair_priority or not task["unseen"]:
            return
        # Offer a structurally close completion as well as the plain rebuild.
        # Copying rows selected nowhere on THIS guide creates no labels for
        # their future behaviour; the complete guide still checks every copy.
        available = Counter(_key(rule) for _, rule in state[2])
        copied, cost = list(state[2]), state[3]
        for gap, rule in task["unseen"]:
            samples.check()
            identity = _key(rule)
            if available[identity]:
                available[identity] -= 1
                continue
            next_cost = cost + samples.rule_cost(rule) + 1
            if next_cost >= task["allowance"]:
                continue
            copied.append((gap, rule))
            cost = next_cost
        if len(copied) > len(state[2]):
            record(task, (state[0], state[1], tuple(copied), cost), True)

    def prune(task, states):
        states.sort(key=lambda state: ((_edit_distance(source_key, tuple(_key(rule) for rule in program(task, state)))
                                       if repair_priority else 0),
                                       state[3] + task["allowance"] *
                                       (state[1] & task["positives"]).bit_count() /
                                       max(1, task["positives"].bit_count()),
                                       state[3], state[0], tuple(_key(rule) for _, rule in state[2])))
        unique, entries = set(), []
        for state in states:
            samples.check()
            wake = tuple(_clocks(rule, clock) for _, rule in state[2])
            order = tuple(rule["action"] for _, rule in state[2])
            key = state[0], state[1], order, wake
            if key not in unique:
                unique.add(key)
                entries.append(state)
        return _round_robin(entries,
                            lambda state: (tuple(rule["action"] for _, rule in state[2]),
                                           tuple(_clocks(rule, clock) for _, rule in state[2])),
                            beam_width, samples.check)

    active = deque(action_sets)
    while active and stats["expanded_states"] < max_expansions:
        samples.check()
        actions = active.popleft()
        task = queues[actions].popleft()
        if not task["started"]:
            task["started"] = True
            stats["regions_started"] += 1
            action_stats[actions]["started"] += 1
        state = task["frontier"][task["index"]]
        stats["expanded_states"] += 1
        for gap, remaining in legal_gaps(task, state):
            for action in actions:
                samples.check()
                for rule in choices(task, action, remaining):
                    samples.check()
                    cost = state[3] + samples.rule_cost(rule) + 1
                    if cost >= task["allowance"]:
                        continue
                    replacement = clone([rule])[0]
                    child = (gap, remaining & ~samples.hit(rule),
                             state[2] + ((gap, replacement),), cost)
                    task["next"].append(child)
                    admit(task, child)
        task["index"] += 1
        if task["index"] >= len(task["frontier"]):
            task["depth"] += 1
            task["frontier"] = prune(task, task["next"])
            task["index"], task["next"] = 0, []
        if task["depth"] < max_replacements and task["frontier"]:
            queues[actions].append(task)
        if queues[actions]:
            active.append(actions)

    stats["expansion_limit_reached"] = bool(active)
    structure_queues = {}
    for actions, structures in buckets.items():
        ordered = sorted(structures, key=lambda shape: (structures[shape][0][:3], shape))
        structure_queues[actions] = deque(deque(structures[shape]) for shape in ordered)
        action_stats[actions]["clock_variants_generated"] = len({item[5] for bucket in structures.values() for item in bucket})
    picked, picked_clocks = [], {}
    if repair_priority:
        entries = []
        for actions, structures in buckets.items():
            for shape, candidates in structures.items():
                entries.extend((item, actions, shape) for item in candidates)
        entries.sort(key=lambda entry: (entry[0][:3], entry[1], entry[2]))
        for distance in sorted({entry[0][0] for entry in entries}):
            tier = [entry for entry in entries if entry[0][0] == distance]
            selected = _round_robin(tier, lambda entry: (entry[1], entry[2]),
                                     limit - len(picked), samples.check)
            for item, actions, _ in selected:
                _, _, _, kind, trial, wake = item
                picked.append((kind, trial))
                action_stats[actions]["selected"] += 1
                picked_clocks.setdefault(actions, set()).add(wake)
            if len(picked) >= limit:
                break
        stats["selected_edit_distances"] = [_edit_distance(source_key, tuple(_key(rule) for rule in trial))
                                             for _, trial in picked]
    active = deque(actions for actions in action_sets if actions in structure_queues)
    while not repair_priority and active and len(picked) < limit:
        samples.check()
        actions = active.popleft()
        queue = structure_queues[actions].popleft()
        _, _, _, kind, trial, wake = queue.popleft()
        picked.append((kind, trial))
        action_stats[actions]["selected"] += 1
        picked_clocks.setdefault(actions, set()).add(wake)
        if queue:
            structure_queues[actions].append(queue)
        if structure_queues[actions]:
            active.append(actions)
    for actions, wakes in picked_clocks.items():
        action_stats[actions]["clock_variants_selected"] = len(wakes)
    stats["selected_candidates"] = len(picked)
    report()
    for kind, trial in picked:
        samples.check()
        yield kind, clone(trial)
