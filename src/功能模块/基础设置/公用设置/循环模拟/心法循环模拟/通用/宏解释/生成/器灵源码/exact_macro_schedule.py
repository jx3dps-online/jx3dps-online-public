"""Candidate construction across deleted macro-only WAIT observations.

Support comes from the native scheduler on ONE source path. Removing support
does not prove a candidate follows that path: it makes the old observation an
uncertain constraint. Every admitted proposal still needs full native replay.
"""


class ClockContext:
    def __init__(self, samples, conditions):
        self.samples, self.conditions = samples, conditions
        self.groups = {}
        previous = None
        for i, row in enumerate(samples.rows):
            samples.check()
            if row.get('projection_clock_atoms') is not None:
                continue
            support = previous.get('wait_clock_atoms') if previous else None
            # Only a real outgoing WAIT to this same aligned event authorizes
            # relaxation. No rounding/EPS: these are the actual serialized times.
            if (support and previous.get('cursor') == row.get('cursor')
                    and previous.get('wait_next_time') == row.get('time')
                    and previous.get('time', float('inf')) < row.get('time', 0)
                    and not row.get('allowed') and row.get('wait_allowed', False)
                    and not row.get('rejected_actions')
                    and all(isinstance(k, int) and 0 <= k < len(samples.atoms)
                            and 'bufftime:' in samples.atoms[k] for k in support)):
                key = frozenset(support)
                self.groups[key] = self.groups.get(key, 0) | (1 << i)
            previous = row

    def clocks(self, rules):
        return {k for rule in rules for k in self.conditions.normalize(rule)['atoms']
                if 'bufftime:' in self.samples.atoms[k]}

    def removable(self, rules):
        clocks = self.clocks(rules)
        mask = 0
        for support, rows in self.groups.items():
            self.samples.check()
            if not support & clocks:
                mask |= rows
        return mask

    def compatible(self, rules):
        """Proposal check after restoring support introduced by the NEW guard."""
        samples = self.samples
        ignored = self.removable(rules)
        remaining = samples.all & ~ignored
        for rule in rules:
            bits = remaining & samples.hit(rule)
            if bits & ~samples.allowed[rule['action']]:
                return False
            remaining &= ~bits
        if remaining & samples.required:
            return False
        # Relaxation never removes positive release-window observations.
        return all(group & ~remaining for group in samples.groups.values())


class WindowContext(ClockContext):
    """Existential proposal witnesses; projections are never required samples."""
    def removable(self, rules):
        ignored = super().removable(rules)
        clocks = self.clocks(rules)
        for i, row in enumerate(self.samples.rows):
            support = row.get('projection_clock_atoms')
            if support is not None and not clocks.intersection(support):
                ignored |= 1 << i
        return ignored

    def compatible(self, rules):
        samples = self.samples
        keep = samples.all & ~self.removable(rules)
        remaining, wrong = keep, 0
        for rule in rules:
            hits = remaining & samples.hit(rule)
            wrong |= hits & ~samples.allowed[rule['action']]
            remaining &= ~hits
        selected = keep & ~remaining
        for cursor, rows in samples.event_rows.items():
            choices = selected & rows
            window = samples.groups.get(cursor, 0)
            if not choices:
                if window:
                    return False
                continue
            first = choices & -choices
            if first & wrong or not first & window:
                return False
            row = samples.rows[first.bit_length()-1]
            if row.get('projection_parent') is not None:
                # A legal alternative hold changes the prefix's timing. Later
                # source snapshots are now conditional, not hard requirements
                # of this candidate. Return UNKNOWN-as-admit for real replay;
                # never continue labeling this hypothetical branch as actual.
                return True
        return True


def projected_rows(samples):
    """Only branch from each event's final real pre-cast observation.

    These are alternative holds of the same pre-cast state, not a concatenated
    trajectory. The caller may use them ONLY for existential guard proposals.
    """
    rows, count = [], 0
    for i, row in enumerate(samples.rows):
        samples.check()
        rows.append(row)
        if row.get('wait_next_time') is not None or not row.get('allowed'):
            continue
        for point in sorted(row.get('release_windows', []), key=lambda p:p['time']):
            if (point['time'] <= row['time'] or point['time'] > row['decision_latest']
                    or not point.get('allowed') or not point.get('clock_atoms')):
                continue
            count += 1
            rows.append(dict(time=point['time'],cursor=row['cursor'],truth=point['truth'],
                executable=point['executable'],allowed=point['allowed'],wait_allowed=True,
                projection_clock_atoms=point['clock_atoms'],projection_parent=i))
    return rows, count
