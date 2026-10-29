"""First-divergence repair shared by construction and compression.

Each proposal uses only ONE actually reached, aligned prefix. Native chains
are right associative: a gate is prepended as G&(old), never appended to an
OR expression. Proposals are hypotheses; only a fresh complete native replay
can certify them. No rules or matched prefix are permanently frozen.
"""
import importlib.util
from pathlib import Path
import re
from types import SimpleNamespace


_CONDITIONS = None
_TIMED = re.compile(r"((?:t?bufftime):.+)([<>])([0-9]+\.[0-9])$")


def conditions():
    global _CONDITIONS
    if _CONDITIONS is None:
        spec = importlib.util.spec_from_file_location('repair_conditions',
            Path(__file__).with_name('exact_macro_conditions.py'))
        _CONDITIONS = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_CONDITIONS)
    return _CONDITIONS


def copy_rules(rules):
    return [dict(conditions().normalize(rule), action=rule['action']) for rule in rules]


def truth(row):
    if 'truth' in row:
        return row['truth']
    count = row.get('truth_count', 0)
    packed = bytes.fromhex(row.get('truth_hex') or '')
    return [bool(packed[index//8] & (1 << (index % 8))) for index in range(count)]


def clock_gates(atoms, row, difference, tolerance):
    """False now; the native decreasing timer crosses inside the cast window."""
    expected, actual = difference.get('expected') or {}, difference.get('actual') or {}
    if (expected.get('skill_id') != actual.get('skill_id')
            or actual.get('time', 0) >= expected.get('time', 0)):
        return []
    return wake_gates(atoms, row, tolerance, expected['time'])


def wake_gates(atoms, row, tolerance, fallback_center=None):
    """Scheduling hypotheses, including a missed WAIT with no allowed action."""
    state = row.get('state') or {}
    remaining = {prefix + buff['name']:buff['remaining'] for prefix, key in
        (('bufftime:', 'buffs'), ('tbufftime:', 'target_buffs'))
        for buff in state.get(key, [])}
    values, gates = truth(row), []
    for index, atom in enumerate(atoms):
        if index >= len(values) or values[index]:
            continue
        match = _TIMED.fullmatch(atom)
        if match and match[2] == '<' and match[1] in remaining:
            wake = row['time'] + remaining[match[1]] - float(match[3]) + 1e-7
            # decision_latest includes network delay for main skills; gates
            # control the decision time, not the eventual successful cast time.
            latest = row.get('decision_latest')
            center = latest-tolerance if latest is not None else fallback_center
            if center is not None and center-tolerance <= wake <= center+tolerance:
                gates.append((abs(wake-center), index))
    return [index for _, index in sorted(gates)]


def _field(atom):
    return re.split('[<>=]', atom, maxsplit=1)[0]


def edits(rules, atoms, replay, check=lambda:None, limit=24):
    """Route an actual preemption/missed deadline to small native-safe edits.

    Earlier selections of the edited rule supply positive witnesses. They
    guide gates/splits but never freeze the program. Threshold substitutions
    keep EVERY operator and unrelated guard intact, including legacy any_atoms.
    Unobserved suffix states are neither imported nor assigned target labels.
    """
    if not rules or limit <= 0:
        return []
    difference = replay.get('comparison', {}).get('first_difference') or {}
    cursor = difference.get('index', -1)
    rows = [r for r in replay.get('rows', []) if r.get('cursor', cursor+1) <= cursor]
    if not rows or rows[-1].get('cursor') != cursor:
        return []
    values = truth(rows[-1])
    if len(values) != len(atoms):
        return []
    original = copy_rules(rules)
    actual = replay.get('actual', [])
    event = actual[cursor] if 0 <= cursor < len(actual) else {}
    line = (event.get('macro_line') or 0)-1
    if event.get('macro_page', 1) != 1:
        return []
    preempt = (0 <= line < len(rules)
               and rules[line]['action'] in rows[-1].get('rejected_actions', []))
    missing = (replay.get('probe_failure') or {}).get('kind') == 'missed_decision_time'
    proposals, seen = [], set()

    def offer(kind, trial, rank):
        check()
        key = tuple((r['action'], tuple(r['atoms']), tuple(r['ops'])) for r in trial)
        if key not in seen:
            seen.add(key)
            proposals.append((rank, kind, trial))

    def replace(index, replacement, kind, rank):
        trial = copy_rules(original)
        trial[index:index+1] = replacement
        offer(kind, trial, rank)

    later = ((difference.get('actual') or {}).get('time', 0)
             >= (difference.get('expected') or {}).get('time', 0))
    lines = [line] if preempt else []
    if missing:
        lines = [i for i, rule in enumerate(original)
                 if rule['action'] in rows[-1].get('allowed', [])
                 and rows[-1]['executable'][rule['action']]]
        later = True
    lookup = {atom:i for i, atom in enumerate(atoms)}
    for index in lines:
        rule = original[index]
        for position, leaf in enumerate(rule['atoms']):
            check()
            if missing and values[leaf]:
                continue
            match = _TIMED.fullmatch(atoms[leaf])
            if not match:
                continue
            direction = 1 if later == (match[2] == '<') else -1
            point = round(float(match[3])*10)
            for order, offset in enumerate((direction, -direction, 2*direction, -2*direction)):
                if point+offset < 0:
                    continue
                text = f'{match[1]}{match[2]}{(point+offset)/10:.1f}'
                leaf2 = lookup.get(text)
                if leaf2 is None or leaf2 in rule['atoms']:
                    continue
                replacement = copy_rules([rule])[0]
                replacement['atoms'][position] = leaf2
                replace(index, [replacement], 'repair_threshold', (0, order, len(text)))
    if missing and not lines:
        # The last reached row may still be a legal WAIT, not a cast window.
        # A later scan must happen before its deadline. Use reported native
        # wake leaves to replace existing same-field clocks without inventing
        # an allowed action or labelling any hypothetical future state.
        tolerance = replay['comparison'].get('time_tolerance_seconds', 0.125)
        wakes = list(dict.fromkeys(rows[-1].get('wake_atoms', [])
                    + wake_gates(atoms, rows[-1], tolerance)))
        for index, rule in enumerate(original):
            for position, leaf in enumerate(rule['atoms']):
                match = _TIMED.fullmatch(atoms[leaf])
                if not match:
                    continue
                for n, wake in enumerate(wakes):
                    candidate = _TIMED.fullmatch(atoms[wake])
                    if (candidate and candidate[1] == match[1] and candidate[2] == match[2]
                            and wake not in rule['atoms']):
                        replacement = copy_rules([rule])[0]
                        replacement['atoms'][position] = wake
                        replace(index, [replacement], 'repair_wait_wake', (0, n, index))
    if preempt:
        rule = original[line]
        positive = []
        for row in rows:
            check()
            position = row.get('cursor', cursor)
            if (0 <= position < min(cursor, len(actual))
                    and actual[position].get('macro_page', 1) == 1
                    and actual[position].get('macro_line') == line+1
                    and rule['action'] in row.get('allowed', [])):
                val = truth(row)
                if len(val) == len(atoms):
                    mask = conditions().condition_mask(rule,
                        [int(v) for v in val], 1)
                    if mask:
                        positive.append(val)
        clocks = clock_gates(atoms, rows[-1], difference,
            replay['comparison'].get('time_tolerance_seconds', 0.125))
        clock_rank = {leaf:i for i, leaf in enumerate(clocks)}
        used = {_field(atoms[leaf]) for leaf in rule['atoms']}
        gate_columns = []
        all_positive = (1 << len(positive))-1
        for leaf, value in enumerate(values):
            check()
            if value or (leaf in rule['atoms'] and conditions().is_and(rule)):
                continue
            covered = sum(1 << n for n, row in enumerate(positive) if row[leaf])
            if covered or (not positive and leaf in clock_rank):
                gate_columns.append((leaf, covered))
        gate_columns.sort(key=lambda pair:(pair[0] not in clock_rank,
            clock_rank.get(pair[0], 999), _field(atoms[pair[0]]) in used,
            -(pair[1].bit_count()), len(atoms[pair[0]]), pair[0]))

        def gated(leaf):
            return dict(action=rule['action'], atoms=[leaf]+rule['atoms'],
                        ops=(['&']+rule['ops']) if rule['atoms'] else [])

        singles = [(leaf, covered) for leaf, covered in gate_columns
                   if covered == all_positive]
        for n, (leaf, _) in enumerate(singles[:12]):
            replace(line, [gated(leaf)], 'repair_clock_gate' if leaf in clock_rank else 'repair_gate',
                    (1 if leaf in clock_rank else 3, n, len(atoms[leaf])))
        # When one gate cannot preserve all earlier successes, two alternatives
        # may; each contains the WHOLE old expression and its scheduler leaves.
        for n, (first, covered) in enumerate(gate_columns[:12]):
            if not positive or covered == all_positive:
                continue
            second = next((leaf for leaf, mask in gate_columns
                           if mask | covered == all_positive), None)
            if second is not None:
                replace(line, [gated(first), gated(second)], 'repair_split',
                        (4, n, len(atoms[first])+len(atoms[second])))
        if not positive:
            replace(line, [], 'repair_drop_unused', (6, 0, 0))
        # An executable allowed action can be protected by priority instead of
        # falsely forcing every later wrong-action guard to be false.
        for index in range(line+1, len(original)):
            target = original[index]
            if (target['action'] in rows[-1].get('allowed', [])
                    and rows[-1]['executable'][target['action']]
                    and conditions().condition_mask(target, [int(v) for v in values], 1)):
                trial = copy_rules(original)
                trial.insert(line, trial.pop(index))
                offer('repair_priority', trial, (2, index-line, 0))
    # A missed action can need a NEW context rather than a gate on the wrong
    # rule. Use only oracle-approved actions at this reached decision. Earlier
    # hits protect observations; only unprotected executable wrong selections
    # become negatives. This works equally for preemptions and missed deadlines.
    approved = [action for action in rows[-1].get('allowed', [])
                if rows[-1]['executable'][action]]
    if approved:
        all_mask = (1 << len(rows))-1
        cols = [0]*len(atoms)
        executable, allowed = {}, {}
        for n, row in enumerate(rows):
            check()
            bit = 1 << n
            for leaf, value in enumerate(truth(row)):
                if value:
                    cols[leaf] |= bit
            for action in approved:
                if row['executable'][action]:
                    executable[action] = executable.get(action, 0) | bit
                if action in row.get('allowed', []):
                    allowed[action] = allowed.get(action, 0) | bit
        guide = SimpleNamespace(all=all_mask, truth=cols, atoms=atoms,
            atom_costs=[len(a.encode('utf-16-le'))//2 for a in atoms], check=check)
        remaining, gaps = all_mask, []
        last_bit = 1 << (len(rows)-1)
        for gap in range(len(original)+1):
            if remaining & last_bit:
                gaps.append((gap, remaining))
            if gap < len(original):
                rule = original[gap]
                hit = conditions().condition_mask(rule, cols, all_mask)
                hit &= sum(1 << n for n, row in enumerate(rows)
                           if row['executable'][rule['action']])
                remaining &= ~hit
        # The closest legal priority gap is generally the smallest repair.
        for order, (gap, residual) in enumerate(reversed(gaps[-4:])):
            for action in approved:
                check()
                negative = residual & executable.get(action, 0) & ~allowed.get(action, 0)
                for guard in conditions().short_guards(last_bit, negative, guide,
                        max_terms=4, max_candidates=4, branch_limit=12, max_states=128):
                    trial = copy_rules(original)
                    trial.insert(gap, dict(guard, action=action))
                    offer('repair_coverage', trial,
                          (2, order, conditions().condition_cost(guard, guide.atom_costs)))
    return [(kind, trial) for _, kind, trial in sorted(proposals, key=lambda item:item[0])[:limit]]


def timing_aliases(rules, samples, replay, limit=16):
    """Explore other CERTIFIABLE trajectories near an accepted early cast.

    Truth columns bound each active timer's remaining interval. A false clock
    which may flip inside the original decision window can replace an existing
    timer leaf. Bounds rank hypotheses only: equality, ticks, expiry, GCD and
    other rules can change the actual wake. The caller must replay from zero.
    No states beyond an observed decision are created or labelled here.
    """
    if not replay.get('comparison', {}).get('reproduced') or limit <= 0:
        return []
    selected, _ = samples.selections(rules)
    actual = replay.get('actual', [])
    tolerance = replay['comparison'].get('time_tolerance_seconds', 0)
    original = copy_rules(rules)
    timed = [(i, _TIMED.fullmatch(text)) for i, text in enumerate(samples.atoms)]
    timed = [(i, match) for i, match in timed if match]
    offered = {}
    for line, rule in enumerate(original):
        old_leaves = [(n, _TIMED.fullmatch(samples.atoms[leaf]))
                      for n, leaf in enumerate(rule['atoms'])]
        old_leaves = [(n, match) for n, match in old_leaves if match]
        if not old_leaves:
            continue
        bits = selected[line]
        while bits:
            samples.check()
            bit = bits & -bits
            bits ^= bit
            row = samples.rows[bit.bit_length()-1]
            cursor = row.get('cursor', len(actual))
            if not 0 <= cursor < len(actual) or actual[cursor].get('macro_line') != line+1:
                continue
            latest = row.get('decision_latest')
            if latest is None:
                continue
            center = latest-tolerance
            if row['time'] >= center-1e-5:
                continue
            # A non-timer/absent buff has no true positive '>' comparison;
            # it cannot supply a justified future timer hypothesis.
            intervals, active = {}, set()
            for leaf, match in timed:
                field, op, value = match[1], match[2], float(match[3])
                lower, upper = intervals.get(field, (0, float('inf')))
                yes = bool(samples.truth[leaf] & bit)
                if (op == '<' and yes) or (op == '>' and not yes):
                    upper = min(upper, value)
                else:
                    lower = max(lower, value)
                if op == '>' and yes:
                    active.add(field)
                intervals[field] = lower, upper
            for leaf, match in timed:
                samples.check()
                if match[2] != '<' or samples.truth[leaf] & bit or match[1] not in active:
                    continue
                lower, upper = intervals[match[1]]
                threshold = float(match[3])
                earliest, last = row['time']+lower-threshold, row['time']+upper-threshold
                if lower > upper or last < center-tolerance or earliest > latest:
                    continue
                distance = abs((max(row['time'], earliest)+min(latest, last))/2-center)
                for position, old in old_leaves:
                    if leaf in rule['atoms'] or match[2] != old[2]:
                        continue
                    trial = copy_rules(original)
                    trial[line]['atoms'][position] = leaf
                    # Compactness remains the stage-two goal; equal-cost paths
                    # can expose a later, simpler window to subsequent search.
                    cost = samples.rule_cost(trial[line])-samples.rule_cost(rule)
                    if cost > 0:
                        continue
                    key = tuple((r['action'], tuple(r['atoms']), tuple(r['ops'])) for r in trial)
                    rank = (distance, cost, line, leaf, position)
                    if key not in offered or rank < offered[key][0]:
                        offered[key] = rank, trial, (rule['action'], line, match[1])
    # Different rules/clock fields need exploration shares. Sorting solely by
    # one closest threshold can spend every replay on the same local clock.
    buckets = {}
    for rank, trial, bucket in sorted(offered.values(), key=lambda item:item[0]):
        buckets.setdefault(bucket, []).append((rank, trial))
    by_line = {}
    for bucket, candidates in buckets.items():
        by_line.setdefault(bucket[:2], []).append(candidates)
    result, offset = [], 0
    while len(result) < limit:
        added = False
        for fields in by_line.values():
            samples.check()
            available = [queue[0] for queue in fields if queue]
            if not available:
                continue
            rank, trial = min(available, key=lambda item:item[0])
            queue = next(queue for queue in fields if queue and queue[0][0] == rank)
            queue.pop(0)
            fields.remove(queue)
            fields.append(queue)
            result.append(('beam_timing_alias', trial))
            added = True
            if len(result) >= limit:
                break
        if not added:
            break
        offset += 1
    return result
