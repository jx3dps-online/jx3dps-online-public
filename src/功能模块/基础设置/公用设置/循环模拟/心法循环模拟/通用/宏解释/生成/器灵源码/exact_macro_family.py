"""Bounded joint rebuilds of repeated actions on one certified trajectory.

Bitsets screen proposals, not runtime equivalence. The caller must parse and
replay every complete candidate against the unchanged frozen target. There is
no second macro, source-specific skill list, or claim of global minimality.
"""
from collections import deque
from itertools import combinations
import time


def _rule_key(rule):
    return (rule["action"], tuple(rule["atoms"]),
            tuple(rule.get("any_atoms", ())), tuple(rule.get("ops", ())),
            "ops" in rule)


def _copy_guard(rule):
    result = {"atoms": list(rule["atoms"])}
    for field in ("any_atoms", "ops"):
        if field in rule:
            result[field] = list(rule[field])
    return result


def _clock_key(rule, clock):
    terms = rule["atoms"] + (rule.get("any_atoms", []) if "ops" not in rule else [])
    return tuple(sorted({atom for atom in terms if atom in clock}))


def _donor_subsets(positions, costs, limit, check):
    """All small-family subsets; deterministic bounded large-family seeds."""
    if len(positions) < 3 or limit <= 0:
        return []
    found, seen = [], set()

    def add(group):
        check()
        group = tuple(sorted(group))
        if len(group) >= 3 and group not in seen and len(found) < limit:
            seen.add(group)
            found.append(group)

    add(positions)
    if len(positions) <= 7:
        # Alternate cardinalities so a budget does not visit only triples or
        # only near-whole families. This enumerates all >=3 subsets if allowed.
        sizes = list(range(3, len(positions)))
        queues = []
        while sizes:
            size = sizes.pop(0)
            items = list(combinations(positions, size))
            items.sort(key=lambda group: (-sum(costs[i] for i in group), group))
            queues.append(deque(items))
            if sizes:
                size = sizes.pop()
                items = list(combinations(positions, size))
                items.sort(key=lambda group: (-sum(costs[i] for i in group), group))
                queues.append(deque(items))
        while any(queues) and len(found) < limit:
            for queue in queues:
                if queue:
                    add(queue.popleft())
        return found

    n = len(positions)
    expensive = sorted(positions, key=lambda i: (-costs[i], i))
    cheap = list(reversed(expensive))
    # Nonadjacent seeds and complements accompany cyclic windows. No large
    # combinations list or 2**n allocation is constructed.
    for offset in range(n):
        check()
        add(positions[:offset] + positions[offset + 1:])
        for width in (3, 4, 5, 7, n // 2):
            if 3 <= width < n:
                add([positions[(offset + step) % n] for step in range(width)])
                add(expensive[offset:offset + width])
                add(cheap[offset:offset + width])
                for stride in (2, 3):
                    add({positions[(offset + stride * step) % n] for step in range(width)})
            if len(found) >= limit:
                return found
    return found


def family_edits(rules, samples, clone, condition_search=None, limit=36,
                 diagnostic=None, *, beam_width=6, max_expansions=384,
                 max_guard_queries=64, max_subsets=128, max_gaps=6,
                 max_targets=6, max_guards=6, max_feature_guards=96):
    """Yield shorter, sample-compatible atomic k->1/2/3 family rebuilds.

    Families are action IDs, not hard-coded skills. Families of <=7 rows have
    every >=3 donor subset scheduled when max_subsets permits; larger families
    use bounded, deterministic nonadjacent/window/complement seeds. A small
    beam jointly chooses guards and increasing insertion gaps, so incomplete
    intermediate programs need not be compatible. Crossing an already-invalid
    survivor is disallowed: a later insertion cannot undo its first match.

    Expansion/query limits control candidate construction only. `limit` limits
    proposals yielded for this pass, not macro size or the user's task time.
    Native guard search is supplied by the caller, with its own shape limits.
    Query results are cached by (P,N) within this single immutable trajectory.
    Clock alternatives remain distinct through guard, beam and result pruning.
    Results receive action/structure round-robin quotas rather than a global
    cheapest-N cutoff. All limits are heuristic; exhaustion proves no UNSAT.
    `diagnostic`, if supplied, is called as diagnostic(info, None).
    """
    started = time.perf_counter()
    samples.check()
    stats = {"kind": "family_search", "expanded_states": 0,
             "guard_lookups": 0, "guard_queries": 0, "guard_cache_hits": 0,
             "native_guard_queries": 0, "guard_budget_skips": 0,
             "subsets_enumerated": 0, "subsets_started": 0,
             "beam_width": beam_width, "max_expansions": max_expansions,
             "max_guard_queries": max_guard_queries, "max_subsets": max_subsets,
             "max_gaps": max_gaps, "max_targets": max_targets,
             "max_guards": max_guards, "max_feature_guards": max_feature_guards,
             "candidate_limit": limit,
             "scope": "one trajectory; bounded subsets, 1-3 joint replacements; full replay required"}
    action_stats = {}

    def report():
        stats["construction_ms"] = (time.perf_counter() - started) * 1000
        stats["actions"] = [dict(action_stats[action], action=action)
                            for action in sorted(action_stats)]
        if diagnostic is not None:
            diagnostic(dict(stats), None)

    if (limit <= 0 or not rules or min(beam_width, max_expansions, max_subsets,
                                     max_gaps, max_targets, max_guards) <= 0):
        report()
        return
    source = clone(rules)
    costs = [samples.rule_cost(rule) + 1 for rule in source]
    original_cost = sum(costs)
    selections, remaining, families = [], samples.all, {}
    for index, rule in enumerate(source):
        samples.check()
        chosen = remaining & samples.hit(rule)
        selections.append(chosen)
        remaining &= ~chosen
        families.setdefault(rule["action"], []).append(index)
    families = {action: positions for action, positions in families.items() if len(positions) >= 3}
    if not families:
        report()
        return

    clock = set()
    for index, text in enumerate(getattr(samples, "atoms", ())):
        samples.check()
        if "bufftime:" in text:
            clock.add(index)
    source_guards = {action: [source[i] for i in positions]
                     for action, positions in families.items()}
    # Cheap single-feature fallbacks keep later beam depths productive even
    # after the native query cap. Deduplicate truth AND clock signatures; this
    # pool does not invoke recursive short-guard search or enumerate partitions.
    for action, positions in families.items():
        samples.check()
        family_mask = 0
        for index in positions:
            family_mask |= selections[index]
        features = {}
        for atom, truth in enumerate(samples.truth):
            samples.check()
            hit = truth & samples.executable[action]
            if not hit & family_mask:
                continue
            rule = {"action": action, "atoms": [atom]}
            semantic = hit, _clock_key(rule, clock)
            entry = (samples.rule_cost(rule), atom, rule)
            if semantic not in features or entry[:2] < features[semantic][:2]:
                features[semantic] = entry
        ordered = sorted(features.values(), key=lambda entry: entry[:2])
        source_guards[action].extend(entry[2] for entry in ordered[:max(0, max_feature_guards)])
    cache, query_counts, queues = {}, {}, {}
    actions = sorted(families)
    query_quotas = {action: max(0, max_guard_queries) // len(actions)
                   + (offset < max(0, max_guard_queries) % len(actions))
                   for offset, action in enumerate(actions)}

    def synthesized(action, positives, negatives):
        samples.check()
        stats["guard_lookups"] += 1
        key = positives, negatives
        if key in cache:
            stats["guard_cache_hits"] += 1
            return cache[key]
        if query_counts.get(action, 0) >= query_quotas[action]:
            stats["guard_budget_skips"] += 1
            return ()
        query_counts[action] = query_counts.get(action, 0) + 1
        stats["guard_queries"] += 1
        candidates = [{"atoms": list(guard)} for guard in samples.covers(positives, negatives)]
        if condition_search is not None:
            samples.check()
            stats["native_guard_queries"] += 1
            candidates.extend(_copy_guard(guard) for guard in
                              condition_search(positives, negatives, samples))
        unique = {}
        for guard in candidates:
            samples.check()
            rule = dict(_copy_guard(guard), action=action)
            hit = samples.hit(rule)
            if positives & ~hit or negatives & hit:
                continue
            unique.setdefault(_rule_key(rule)[1:], _copy_guard(rule))
        cache[key] = tuple(unique.values())
        return cache[key]

    def diverse_rules(candidates, action, positives, negatives):
        unique = {}
        for rule in candidates:
            samples.check()
            hit = samples.hit(rule)
            covered = positives & hit
            if not covered or hit & negatives:
                continue
            wake = _clock_key(rule, clock)
            semantic = hit, wake
            entry = (-(covered.bit_count() / (samples.rule_cost(rule) + 1)),
                     samples.rule_cost(rule), _rule_key(rule), rule, wake)
            if semantic not in unique or entry[:3] < unique[semantic][:3]:
                unique[semantic] = entry
        ranked = sorted(unique.values(), key=lambda entry: entry[:3])
        chosen = ranked[:max_guards]
        # Preserve up to two distinct clock signatures even when cheaper
        # stable guards fill the proposal beam. They still need full replay.
        clock_representatives, seen_wakes = [], set()
        for entry in ranked:
            samples.check()
            if entry[4] and entry[4] not in seen_wakes:
                clock_representatives.append(entry)
                seen_wakes.add(entry[4])
            if len(clock_representatives) >= min(2, max_guards - 1):
                break
        for entry in clock_representatives:
            if entry not in chosen and chosen:
                replace = next((i for i in range(len(chosen) - 1, 0, -1)
                                if chosen[i] not in clock_representatives), None)
                if replace is not None:
                    chosen[replace] = entry
        return [entry[3] for entry in sorted(chosen, key=lambda entry: entry[:3])]

    for action, positions in families.items():
        samples.check()
        groups = _donor_subsets(positions, costs, max_subsets, samples.check)
        action_stats[action] = {"family_rows": len(positions), "subsets": len(groups),
                                "started": 0, "generated": 0, "selected": 0}
        stats["subsets_enumerated"] += len(groups)
        queue = deque()
        for group in groups:
            samples.check()
            removed, positives, survivors, original_gaps = set(group), 0, [], []
            for index, rule in enumerate(source):
                samples.check()
                if index in removed:
                    positives |= selections[index]
                    original_gaps.append(len(survivors))
                else:
                    survivors.append(rule)
            if not positives:
                continue
            queue.append({"action": action, "group": group, "positives": positives,
                          "survivors": survivors, "gaps": set(original_gaps),
                          "units": [selections[i] for i in group],
                          "allowance": sum(costs[i] for i in group),
                          "frontier": [(0, samples.all, (), 0)], "index": 0,
                          "next": [], "depth": 0, "started": False})
        queues[action] = queue

    def legal_gaps(task, state):
        gap, rem, _, _ = state
        opportunities = []
        survivors, action = task["survivors"], task["action"]
        for position in range(gap, len(survivors) + 1):
            samples.check()
            if rem & task["positives"]:
                opportunities.append((position, rem,
                                      rem & samples.executable[action] & ~samples.allowed[action]))
            if position < len(survivors):
                rule = survivors[position]
                hit = rem & samples.hit(rule)
                # Do not silently lose donor P when a survivor steals it. A
                # replacement at/before this gap must repair the first match.
                if hit & ~samples.allowed[rule["action"]]:
                    break
                rem &= ~hit
        if len(opportunities) <= max_gaps:
            return opportunities
        # Keep original placements, the first and last reachable gaps, then
        # round-robin distinct prefix masks. This is a placement search bound.
        preferred = [opportunities[0], opportunities[-1]]
        preferred.extend(item for item in opportunities if item[0] in task["gaps"])
        preferred.extend(opportunities)
        chosen, seen_positions, seen_masks = [], set(), set()
        for item in preferred:
            samples.check()
            if item[0] not in seen_positions and (item in preferred[:2]
                    or item[0] in task["gaps"] or item[1] not in seen_masks):
                chosen.append(item)
                seen_positions.add(item[0])
                seen_masks.add(item[1])
                if len(chosen) >= max_gaps:
                    return sorted(chosen)
        for item in opportunities:
            samples.check()
            if item[0] not in seen_positions:
                chosen.append(item)
                if len(chosen) >= max_gaps:
                    break
        return sorted(chosen)

    def targets(task, rem):
        units = list(dict.fromkeys(unit & rem for unit in task["units"] if unit & rem))
        full = task["positives"] & rem
        parts = []
        if len(units) > 1:
            for section in (units[:len(units) // 2], units[len(units) // 2:],
                            units[::2], units[1::2]):
                bits = 0
                for unit in section:
                    samples.check()
                    bits |= unit
                parts.append(bits)
        result, seen = [], set()
        for offset in range(max(len(parts), len(units)) + 1):
            samples.check()
            choices = [full] if offset == 0 else []
            if offset < len(parts):
                choices.append(parts[offset])
            if offset < len(units):
                choices.append(units[offset])
            for bits in choices:
                if bits and bits not in seen:
                    result.append(bits)
                    seen.add(bits)
                    if len(result) >= max_targets:
                        return result
        return result

    def state_key(state):
        gap, rem, insertions, cost = state
        return (gap, rem, tuple((position, _rule_key(rule)) for position, rule in insertions), cost)

    def wake_key(state):
        return tuple((position, _clock_key(rule, clock)) for position, rule in state[2]
                     if _clock_key(rule, clock))

    def prune_states(task, states):
        unique = {}
        for state in states:
            samples.check()
            key = state[0], state[1], wake_key(state)
            rank = state[3], state_key(state)
            if key not in unique or rank < (unique[key][3], state_key(unique[key])):
                unique[key] = state
        ranked = sorted(unique.values(), key=lambda state:
                        ((task["positives"] & state[1]).bit_count(), state[3], state_key(state)))
        chosen = ranked[:beam_width]
        # Distinct wake thresholds are not equivalent because they happen to
        # have equal truth on this trajectory. Reserve clock alternatives.
        if chosen and beam_width > 1:
            best_pending = (task["positives"] & chosen[0][1]).bit_count()
            representatives, wakes = [], {wake_key(chosen[0])}
            for state in ranked:
                samples.check()
                wake = wake_key(state)
                if wake and wake not in wakes and (task["positives"] & state[1]).bit_count() == best_pending:
                    representatives.append(state)
                    wakes.add(wake)
                if len(representatives) >= min(2, beam_width - 1):
                    break
            for state in representatives:
                if state not in chosen:
                    replace = next((i for i in range(len(chosen) - 1, 0, -1)
                                    if chosen[i] not in representatives), None)
                    if replace is not None:
                        chosen[replace] = state
        return chosen

    def materialize(task, state):
        insertions = state[2]
        program, cursor = [], 0
        for gap in range(len(task["survivors"]) + 1):
            samples.check()
            while cursor < len(insertions) and insertions[cursor][0] == gap:
                program.append(insertions[cursor][1])
                cursor += 1
            if gap < len(task["survivors"]):
                program.append(task["survivors"][gap])
        return clone(program)

    seen, buckets = set(), {action: {} for action in actions}
    bucket_capacity = max(2, min(limit, 8))

    def admit(task, state):
        samples.check()
        if state[3] >= task["allowance"]:
            return
        trial = materialize(task, state)
        key = tuple(_rule_key(rule) for rule in trial)
        if key in seen:
            return
        seen.add(key)
        if not samples.compatible(trial):
            return
        # Independent accounting catches accidental shape drift in a proposal.
        cost = sum(samples.rule_cost(rule) + 1 for rule in trial)
        if cost >= original_cost:
            return
        action, count = task["action"], len(state[2])
        shape = (count, len(task["group"]), bool(wake_key(state)))
        kind = "family_rebuild_{}_to_{}".format(len(task["group"]), count)
        entry = cost, key, kind, trial
        bucket = buckets[action].setdefault(shape, [])
        bucket.append(entry)
        bucket.sort(key=lambda item: item[:2])
        del bucket[bucket_capacity:]
        action_stats[action]["generated"] += 1

    # A task expands one beam state per turn. Round-robin both actions and
    # donor groups, so one family cannot consume the complete query/work cap.
    active = deque(action for action in actions if queues[action])
    while active and stats["expanded_states"] < max_expansions:
        samples.check()
        action = active.popleft()
        task = queues[action].popleft()
        if not task["started"]:
            task["started"] = True
            stats["subsets_started"] += 1
            action_stats[action]["started"] += 1
        state = task["frontier"][task["index"]]
        stats["expanded_states"] += 1
        for gap, rem, negatives in legal_gaps(task, state):
            samples.check()
            candidates = list(source_guards[action])
            for positive in targets(task, rem):
                samples.check()
                candidates.extend(dict(_copy_guard(guard), action=action)
                                  for guard in synthesized(action, positive, negatives))
            for rule in diverse_rules(candidates, action, task["positives"] & rem, negatives):
                samples.check()
                cost = state[3] + samples.rule_cost(rule) + 1
                if cost >= task["allowance"]:
                    continue
                replacement = clone([rule])[0]
                new_state = (gap, rem & ~samples.hit(rule),
                             state[2] + ((gap, replacement),), cost)
                task["next"].append(new_state)
                admit(task, new_state)
        task["index"] += 1
        if task["index"] >= len(task["frontier"]):
            task["depth"] += 1
            task["frontier"] = prune_states(task, task["next"])
            task["index"], task["next"] = 0, []
        if task["depth"] < 3 and task["frontier"]:
            queues[action].append(task)
        if queues[action]:
            active.append(action)

    stats["expansion_limit_reached"] = bool(active)
    # Within each action, alternate replacement count/donor cardinality/clock
    # structure. Across actions, alternate again; cost only orders a bucket.
    structure_queues = {}
    for action in actions:
        samples.check()
        structure_queues[action] = deque(deque(buckets[action][shape])
                                        for shape in sorted(buckets[action]))
    picked = []
    active = deque(action for action in actions if structure_queues[action])
    while active and len(picked) < limit:
        samples.check()
        action = active.popleft()
        structure = structure_queues[action].popleft()
        _, _, kind, trial = structure.popleft()
        picked.append((kind, trial))
        action_stats[action]["selected"] += 1
        if structure:
            structure_queues[action].append(structure)
        if structure_queues[action]:
            active.append(action)
    stats["selected_candidates"] = len(picked)
    report()
    for item in picked:
        samples.check()
        yield item
