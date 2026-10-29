"""Resumable, shared-budget native-chain proposals on one immutable guide.

This module consumes truth bits, never combat rules or a reference macro.
Different clock spellings remain candidate identities. Only full native replay
can certify a proposed macro; an unfinished queue is never UNSAT.
"""
import heapq
from itertools import combinations_with_replacement


class GuardFrontier:
    def __init__(self, windows, negative, masks, pool, costs, max_terms,
                 roots, prune, check):
        self.windows, self.negative = windows, negative
        self.masks, self.pool, self.costs = masks, tuple(pool), costs
        self.max_terms, self.roots, self.prune, self.check = max_terms, roots, prune, check
        self.heap, self.serial, self.states, self.pair_checks = [], 0, 0, 0
        self.best, self.tails = [], {}
        self._push(0, (), (), windows, negative, None, 0)

    def _push(self, discrepancy, atoms, ops, windows, negative, branches, offset):
        # A cursor lazily queues siblings: no permanent branch truncation and
        # no thousands of eagerly allocated descendants. Deep prefixes with
        # the same discrepancy get a chance to complete before new roots.
        if branches is None:
            priority, depth, cost = discrepancy, len(atoms), sum(self.costs[k]+1 for k in atoms)
        else:
            if offset >= len(branches):
                return
            index = branches[offset][1][3]
            priority, depth = discrepancy+offset, len(atoms)+1
            cost = sum(self.costs[k]+1 for k in atoms) + self.costs[index]+1
        self.serial += 1
        heapq.heappush(self.heap, (priority, -depth, cost, self.serial,
            (discrepancy, atoms, ops, windows, negative, branches, offset)))

    def tail(self, windows, negative, room, used):
        key = windows, negative, min(room, 2), frozenset(used)
        if key in self.tails:
            return self.tails[key]
        if not negative:
            return [((), ())]
        groups = {}
        for offset, index in enumerate(self.pool):
            if offset % 64 == 0:
                self.check()
            if index not in used:
                groups.setdefault(self.masks[index], []).append(index)
        result = []
        and_masks, or_masks = [], []
        full = (1 << len(windows))-1
        for mask, indices in groups.items():
            self.check()
            coverage = sum(1 << i for i, window in enumerate(windows) if window & mask)
            if coverage == full:
                and_masks.append(mask)
                if not mask & negative:
                    result.extend(((i,), ()) for i in indices)
            if not mask & negative and coverage:
                or_masks.append((mask, coverage))
        if room > 1:
            for kind, entries in (('&', and_masks), ('|', or_masks)):
                for left, right in combinations_with_replacement(entries, 2):
                    self.pair_checks += 1
                    if self.pair_checks % 128 == 0:
                        self.check()
                    if kind == '&':
                        a, b = left, right
                        mask = a & b
                        valid = not mask & negative and all(window & mask for window in windows)
                    else:
                        a, ac = left; b, bc = right
                        valid = (ac | bc) == full
                    if not valid:
                        continue
                    for i in groups[a]:
                        for j in groups[b]:
                            if i != j:
                                result.append((tuple(sorted((i, j))), (kind,)))
                        self.check()
                    if len(result) > 256:
                        result = self.prune(result)
        result = self.prune(result)
        self.tails[key] = result
        return result

    @staticmethod
    def combine(prefix, operators, suffix, suffix_ops):
        for atom, op in reversed(tuple(zip(prefix, operators))):
            if not suffix:
                if op == '&':
                    suffix = (atom,)
            else:
                suffix = (atom,) + suffix
                suffix_ops = (op,) + suffix_ops
        return suffix, suffix_ops

    def advance(self, allowance):
        start = self.states
        while self.heap and self.states-start < allowance:
            self.check()
            # Peek until all calculations succeed. A cancellation leaves this
            # queued branch available instead of converting it into failure.
            _, _, _, _, pending = self.heap[0]
            discrepancy, atoms, ops, windows, negative, branches, offset = pending
            if branches is not None:
                op, (_, _, _, index, windows, negative) = branches[offset]
                if index in atoms:
                    heapq.heappop(self.heap)
                    self._push(*pending[:-1], offset+1)
                    continue
                atoms, ops = atoms+(index,), ops+(op,)
                discrepancy += offset
            room = self.max_terms-len(atoms)
            results = [self.combine(atoms, ops, tail, tail_ops)
                       for tail, tail_ops in self.tail(windows, negative, room, atoms)]
            children = self.roots(windows, negative)[1] if room > 2 else ()
            updated = self.prune(self.best+results)
            heapq.heappop(self.heap)
            if branches is not None:
                self._push(*pending[:-1], offset+1)
            self.best = updated
            self.states += 1
            if children:
                self._push(discrepancy, atoms, ops, windows, negative, children, 0)
        return self.best

    def diagnostic(self):
        return dict(status='pending' if self.heap else 'scope_exhausted',
                    found=bool(self.best), states=self.states, pending=len(self.heap),
                    pair_checks=self.pair_checks, tail_queries=len(self.tails))
