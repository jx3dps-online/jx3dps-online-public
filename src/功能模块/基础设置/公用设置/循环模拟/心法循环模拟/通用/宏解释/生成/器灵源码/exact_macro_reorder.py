"""Cheap coupled priority candidates for one certified macro trajectory.

Sample masks only screen proposals. The caller must replay and certify every
whole relocate/replace/delete edit against its unchanged original contract.
"""
from typing import NamedTuple


class GuardQuery(NamedTuple):
    """Observed event windows at one insertion gap of one source path."""
    action: int
    reachable: int
    negatives: int
    windows: tuple
    events: tuple
    path_id: str


def event_query(samples, action, positives, reachable, survivors):
    # Old selections identify the affected events only. They must not restrict
    # the new witness to the old cast instant within an accepted time window.
    covered, remaining = 0, samples.all
    for rule in survivors:
        selected = remaining & samples.hit(rule)
        covered |= selected & samples.allowed[rule['action']]
        remaining &= ~selected
    windows, events = [], []
    for event, group in samples.groups.items():
        if not group & positives or group & covered:
            continue
        windows.append(group & reachable & samples.allowed[action] & samples.executable[action])
        events.append(event)
    return GuardQuery(action, reachable,
        reachable & samples.executable[action] & ~samples.allowed[action],
        tuple(windows), tuple(events), getattr(samples, 'path_id', 'unbound'))


def priority_edits(rules, samples, clone, limit=24, condition_search=None, window_search=None,
                   group_filter=None, clock_context=None, source_mask=None):
    """Yield the shortest distinct, sample-compatible global-position edits.

    Rebuild a single rule, a same-action pair, or a whole action family at any
    insertion gap. Intermediate moves and guard replacements need not pass.
    Existing guards retain optional OR tails through the caller's clone.
    """
    samples.check()
    if limit <= 0 or not rules:
        return
    source = clone(rules)
    original_cost = 0
    # Optional projected rows are alternative witnesses, not historical casts
    # owned by donor rules. They still participate in candidate checks below.
    selections, remaining = [], samples.all if source_mask is None else source_mask & samples.all
    families = {}
    for index, rule in enumerate(source):
        samples.check()
        original_cost += samples.rule_cost(rule) + 1
        selected = remaining & samples.hit(rule)
        selections.append(selected)
        remaining &= ~selected
        families.setdefault(rule["action"], []).append(index)

    def identity(program):
        key = []
        for rule in program:
            samples.check()
            key.append((rule["action"], tuple(rule["atoms"]),
                        tuple(rule.get("any_atoms", [])), tuple(rule.get('ops',[])), 'ops' in rule))
        return tuple(key)

    groups = []
    for action,positions in families.items():
        samples.check()
        groups.extend(((index,),action) for index in positions)
        for left, index in enumerate(positions):
            samples.check()
            groups.extend(((index, other),action) for other in positions[left + 1:])
        if len(positions) > 2:
            groups.append((tuple(positions),action))
    # The oracle may report several legal buttons for the same actual cast
    # (for example a context-resolved combo button). Derive replacements from
    # those allowed/executable masks, never a hand-maintained skill alias map.
    for action in range(len(samples.allowed)):
        eligible = [i for i,bits in enumerate(selections) if bits
                    and not bits & ~(samples.allowed[action] & samples.executable[action])]
        for i in eligible:
            if source[i]['action'] != action:
                groups.append(((i,),action))
        for left,i in enumerate(eligible):
            for j in eligible[left+1:]:
                if source[i]['action'] != source[j]['action']:
                    groups.append(((i,j),action))
        if len(eligible) > 2 and any(source[i]['action'] != action for i in eligible):
            groups.append((tuple(eligible),action))

    seen = {identity(source)}
    candidates = {}
    for group,action in dict.fromkeys(groups):
        samples.check()
        if group_filter is not None and not group_filter(group,action):
            continue
        removed = set(group)
        positives = 0
        survivors, survivor_cost = [], 0
        original_gaps = {}
        for index, rule in enumerate(source):
            samples.check()
            if index in removed:
                positives |= selections[index]
                original_gaps[index] = len(survivors)
            else:
                survivors.append(rule)
                survivor_cost += samples.rule_cost(rule) + 1

        # Even an unconditional replacement cannot beat this donor cost.
        # Prune before building any guard query; this is an exact cost bound.
        if survivor_cost + samples.rule_cost({'action':action, 'atoms':[]}) + 1 >= original_cost:
            continue

        # Original single/pair locations already have guard/merge generators.
        # Whole families may still benefit from an interior original gap.
        known_gaps = {original_gaps[group[0]], original_gaps[group[-1]]}
        prefix_remaining = samples.all
        for position in range(len(survivors) + 1):
            samples.check()
            if condition_search is not None or window_search is not None or position not in known_gaps:
                negatives = (prefix_remaining & samples.executable[action]
                             & ~samples.allowed[action])
                # Donor-only clocks may disappear. Restore any support reused
                # by the replacement in the whole-program check below.
                relaxed = clock_context.removable(survivors) if clock_context else 0
                negatives &= ~relaxed
                replacements = [
                    {"action": action, "atoms": list(guard)}
                    for guard in samples.covers(positives, negatives)
                ]
                if condition_search is not None:
                    replacements.extend(dict(guard, action=action) for guard in
                                        condition_search(positives & prefix_remaining, negatives, samples))
                if window_search is not None:
                    query = event_query(samples, action, positives, prefix_remaining, survivors)
                    if clock_context:
                        query = query._replace(negatives=query.negatives & ~relaxed)
                    # An empty affected window is a local query failure, not
                    # proof that the target has no native macro.
                    if all(query.windows):
                        replacements.extend(dict(guard, action=action) for guard in
                                            window_search(query, samples))
                # Keeping a guard may become sufficient at a different
                # priority, especially when other donors disappear atomically.
                replacements.extend(dict(clone([source[index]])[0],action=action) for index in group)
                for replacement in replacements:
                    samples.check()
                    cost = survivor_cost + samples.rule_cost(replacement) + 1
                    # Every proposal is nonempty, so the last newline's fixed
                    # additive unit cancels in this exact text-cost comparison.
                    if cost >= original_cost:
                        continue
                    trial = clone(survivors[:position] + [replacement]
                                  + survivors[position:])
                    key = identity(trial)
                    if key in seen:
                        continue
                    seen.add(key)
                    compatible = (getattr(samples, 'window_compatible', samples.compatible)
                                  if window_search is not None else samples.compatible)
                    if clock_context:
                        compatible = clock_context.compatible
                    if not compatible(trial):
                        continue
                    shape = "single" if len(group) == 1 else "pair" if len(group) == 2 else "family"
                    kind = ("window_guard_rebuild_" if window_search is not None else
                            "native_guard_rebuild_" if condition_search is not None else "priority_rebuild_") + shape
                    if clock_context:
                        kind = 'schedule_' + kind
                    candidates[key] = (cost, key, kind, trial)
            if position < len(survivors):
                prefix_remaining &= ~samples.hit(survivors[position])

    samples.check()
    for _, _, kind, trial in sorted(candidates.values(), key=lambda item: (item[0], item[1]))[:limit]:
        samples.check()
        yield kind, trial
