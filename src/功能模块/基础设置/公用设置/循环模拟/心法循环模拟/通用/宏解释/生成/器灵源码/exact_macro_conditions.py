"""Native right-associated macro conditions and bounded short-guard search.

Every emitted chain is legal macro text: ``A&B|C`` means ``A&(B|C)``.
Truth masks guide candidates on one current trajectory; they neither prove
runtime equivalence nor replace the caller's independent native replay.
"""
from functools import lru_cache
import re


@lru_cache(maxsize=8)
def _absence_catalog(atomtexts):
    """Prefer native absence predicates already present in the legal catalog.

    Keep indices stable for archived rules. Do not rewrite time comparisons or
    invent target-stack syntax (the native parser has no target-stack node).
    A rendered candidate still needs its own complete native certification.
    """
    known = set(atomtexts)
    result = []
    for text in atomtexts:
        match = re.fullmatch(r"buff:([^<>=~]+)(?:<1|=0|<=0)", text)
        alias = 'nobuff:' + match[1] if match else text
        result.append(alias if alias in known else text)
    return tuple(result)


def canonical_atomtexts(atomtexts):
    return _absence_catalog(tuple(atomtexts))


def normalize(rule):
    """Return a copied atoms/ops condition; explicit ops take precedence."""
    atoms = list(rule.get("atoms", []))
    if "ops" in rule:
        ops = list(rule["ops"])
    else:
        tail = list(rule.get("any_atoms", []))
        ops = ["&"] * max(0, len(atoms) - 1)
        if tail:
            if atoms:
                ops.append("&")
            atoms.extend(tail)
            ops.extend(["|"] * (len(tail) - 1))
    if len(ops) != max(0, len(atoms) - 1) or any(op not in ("&", "|") for op in ops):
        raise ValueError("condition ops must contain one native & or | between each leaf")
    return {"atoms": atoms, "ops": ops}


def condition_key(rule):
    condition = normalize(rule)
    return tuple(condition["atoms"]), tuple(condition["ops"])


def is_and(rule):
    return all(op == "&" for op in normalize(rule)["ops"])


def condition_mask(rule, truth, all_mask):
    condition = normalize(rule)
    atoms, ops = condition["atoms"], condition["ops"]
    if not atoms:
        return all_mask
    mask = truth[atoms[-1]] & all_mask
    for index in range(len(ops) - 1, -1, -1):
        leaf = truth[atoms[index]] & all_mask
        mask = leaf & mask if ops[index] == "&" else leaf | mask
    return mask & all_mask


def condition_cost(rule, atom_costs):
    """Additional UTF-16 characters for a rendered ``[condition] ``."""
    condition = normalize(rule)
    if not condition["atoms"]:
        return 0
    return 3 + sum(atom_costs[index] for index in condition["atoms"]) + len(condition["ops"])


def condition_text(rule, atomtexts):
    """Render the exact native chain, without invented grouping parentheses."""
    atomtexts = canonical_atomtexts(atomtexts)
    condition = normalize(rule)
    atoms, ops = condition["atoms"], condition["ops"]
    if not atoms:
        return ""
    return atomtexts[atoms[0]] + "".join(op + atomtexts[index] for op, index in zip(ops, atoms[1:]))


def shorter_leaves(rule, positives, negatives, samples, *, equal_cost=False):
    """Replace a leaf inside a native chain using its surrounding context.

    A shorter predicate need not equal the old one outside reachable action
    decisions. Evaluate the surrounding monotone chain with this occurrence
    set to false/true, then derive the leaf's actual positive/negative masks.
    No whole-condition rewrite, operator reassociation, or cross-path labels
    are involved. Every suggestion still requires whole-program native replay.
    Distinct predicates, including distinct clock leaves, are not deduplicated
    by their sample truth signature. ``equal_cost`` requests same-length
    proposals for independently certified alternative paths, not a saving.
    """
    condition = normalize(rule)
    atoms, ops = condition['atoms'], condition['ops']
    if not atoms or not positives:
        return
    all_mask, truth = samples.all, samples.truth
    suffix = [0] * len(atoms)
    suffix[-1] = truth[atoms[-1]] & all_mask
    for position in range(len(atoms)-2, -1, -1):
        leaf = truth[atoms[position]]
        suffix[position] = (leaf & suffix[position+1] if ops[position] == '&'
                            else leaf | suffix[position+1]) & all_mask
    for position, old in enumerate(atoms):
        samples.check()
        zero, one = 0, all_mask
        if position < len(ops):
            if ops[position] == '&':
                one = suffix[position+1]
            else:
                zero = suffix[position+1]
        for earlier in range(position-1, -1, -1):
            leaf = truth[atoms[earlier]]
            if ops[earlier] == '&':
                zero &= leaf
                one &= leaf
            else:
                zero |= leaf
                one |= leaf
        if positives & ~one or negatives & zero:
            continue
        required = positives & ~zero
        forbidden = negatives & one
        for replacement, mask in enumerate(truth):
            samples.check()
            cost_ok = (samples.atom_costs[replacement] == samples.atom_costs[old]
                       if equal_cost else samples.atom_costs[replacement] < samples.atom_costs[old])
            if (not cost_ok
                    or replacement in atoms
                    or required & ~mask or forbidden & mask):
                continue
            copied = dict(atoms=list(atoms), ops=list(ops))
            copied['atoms'][position] = replacement
            yield copied


def short_guards(positives, negatives, samples, max_terms=8, max_candidates=8,
                 branch_limit=24, max_states=384, max_atoms=256):
    """Find short legal chains covering P and avoiding N on current samples.

    AND prefixes must cover all remaining positives and shrink negatives.
    OR prefixes must avoid all remaining negatives and shrink positives.
    Iterative deepening, memoized residuals, balanced operator branches, and
    small beams bound work. Limits never constitute global UNSAT.
    Same truth signatures retain short stable leaves and distinct clocks;
    whole chains are deduplicated by truth AND their clock-leaf signature.
    Required sample fields: all, truth, atom_costs, check; atoms is optional.
    """
    samples.check()
    positives &= samples.all
    negatives &= samples.all
    if not positives or positives & negatives or min(max_terms, max_candidates, branch_limit, max_states, max_atoms) <= 0:
        return []
    truth, costs, all_mask = samples.truth, samples.atom_costs, samples.all
    texts = getattr(samples, "atoms", None)
    # A Samples instance owns one immutable truth matrix. New trajectories or
    # atom catalogs must create/replace their arrays, invalidating this stamp.
    stamp = (id(truth), len(truth), id(costs), len(costs), id(texts), all_mask)
    cache = getattr(samples, "_native_condition_cache", None)
    if cache is None or cache["stamp"] != stamp:
        clock = set()
        if texts is not None:
            for index, text in enumerate(texts):
                samples.check()
                if "bufftime:" in text:
                    clock.add(index)
        signatures = {}
        for index, mask in enumerate(truth):
            samples.check()
            signatures.setdefault(mask & all_mask, []).append(index)
        pool = []
        for indices in signatures.values():
            samples.check()
            ordered = sorted(indices, key=lambda index: (costs[index], index))
            stable = [index for index in ordered if index not in clock]
            timed = [index for index in ordered if index in clock]
            pool.extend(stable[:1] + timed[:2])
        cache = {"stamp": stamp, "sources": (truth, costs, texts), "clock": clock, "pool": pool, "queries": {}}
        try:
            samples._native_condition_cache = cache
        except AttributeError:
            pass
    clock, pool = cache["clock"], cache["pool"]
    query = (positives, negatives, max_terms, max_candidates, branch_limit, max_states, max_atoms)
    if query in cache["queries"]:
        return [{"atoms": list(atoms), "ops": list(ops)} for atoms, ops in cache["queries"][query]]

    if len(pool) > max_atoms:
        # Include cheap inner suffix leaves even when they cannot be the root.
        # Separating features and legal root candidates provide the remainder.
        quarter = max(1, max_atoms // 4)
        ranked = [
            sorted(pool, key=lambda index: (costs[index], index))[:quarter],
            sorted(pool, key=lambda index: (-((positives & truth[index]).bit_count()
                                             + (negatives & ~truth[index]).bit_count()) / (costs[index] + 1),
                                            costs[index], index)),
            sorted((index for index in pool if not positives & ~truth[index]),
                   key=lambda index: (-(negatives & ~truth[index]).bit_count() / (costs[index] + 1), costs[index], index)),
            sorted((index for index in pool if not negatives & truth[index]),
                   key=lambda index: (-(positives & truth[index]).bit_count() / (costs[index] + 1), costs[index], index)),
        ]
        selected = set()
        # Round-robin avoids spending the variable budget on one operator.
        for offset in range(max(len(items) for items in ranked)):
            samples.check()
            for items in ranked:
                if offset < len(items):
                    selected.add(items[offset])
                    if len(selected) >= max_atoms:
                        break
            if len(selected) >= max_atoms:
                break
        pool = sorted(selected, key=lambda index: (costs[index], index))
    else:
        pool.sort(key=lambda index: (costs[index], index))

    memo, roots_cache, states, budget_misses = {}, {}, 0, 0
    iteration_ceiling = max_states

    def prune(guards):
        unique = {}
        for atoms, ops in guards:
            samples.check()
            rule = {"atoms": atoms, "ops": ops}
            mask = condition_mask(rule, truth, all_mask)
            wake = tuple(sorted({index for index in atoms if index in clock}))
            semantic = mask, wake
            entry = (condition_cost(rule, costs), tuple(atoms), tuple(ops), mask, wake)
            if semantic not in unique or entry[:3] < unique[semantic][:3]:
                unique[semantic] = entry
        ranked = sorted(unique.values(), key=lambda entry: entry[:3])
        chosen = ranked[:max_candidates]
        # Keep a clock alternative of the cheapest semantic mask where one
        # exists, even when many cheaper stable expressions fill the beam.
        if chosen and max_candidates > 1:
            first = chosen[0]
            alternate = next((entry for entry in ranked if entry[3] == first[3]
                              and entry[4] != first[4]), None)
            if alternate is not None and alternate not in chosen:
                chosen[-1] = alternate
                chosen.sort(key=lambda entry: entry[:3])
        return [(entry[1], entry[2]) for entry in chosen]

    def roots(p, n):
        samples.check()
        key = p, n
        if key in roots_cache:
            return roots_cache[key]
        leaves = [((), ())] if not n else []
        and_roots, or_roots = [], []
        for index in pool:
            samples.check()
            mask = truth[index] & all_mask
            missing = p & ~mask
            intersecting = n & mask
            if not missing and not intersecting:
                leaves.append(((index,), ()))
            if not missing and intersecting != n:
                and_roots.append((-(n & ~mask).bit_count() / (costs[index] + 1), costs[index], index, intersecting))
            if not intersecting and missing and missing != p:
                or_roots.append((-(p & mask).bit_count() / (costs[index] + 1), costs[index], index, missing))
        ordered_and, ordered_or = sorted(and_roots), sorted(or_roots)
        branches = []
        for offset in range(max(len(ordered_and), len(ordered_or))):
            samples.check()
            for operator, options in (("&", ordered_and), ("|", ordered_or)):
                if offset < len(options):
                    branches.append((operator, options[offset]))
                    if len(branches) >= branch_limit:
                        break
            if len(branches) >= branch_limit:
                break
        result = prune(leaves), branches
        roots_cache[key] = result
        return result

    def search(p, n, depth, ceiling):
        nonlocal states, budget_misses
        samples.check()
        key = p, n, depth
        if key in memo:
            return memo[key]
        if states >= ceiling:
            budget_misses += 1
            return []
        states += 1
        misses_before = budget_misses
        leaves, branches = roots(p, n)
        guards = list(leaves)
        if depth > 1:
            # Each operator receives a share, so native A|B&C is reachable
            # even when AND branches are attractive at another residual.
            # Give distinct root choices enough cells for a short chain before
            # allowing the first subtree to consume the entire depth pass.
            fair_width = min(len(branches), max(1, (ceiling - states) // (depth - 1)))
            if fair_width < len(branches):
                budget_misses += 1
            active = branches[:fair_width]
            for position, (operator, (_, _, index, residual)) in enumerate(active):
                samples.check()
                share = max(1, (ceiling - states) // (len(active) - position))
                child_ceiling = min(ceiling, states + share)
                suffixes = (search(p, residual, depth - 1, child_ceiling) if operator == "&"
                            else search(residual, n, depth - 1, child_ceiling))
                for suffix_atoms, suffix_ops in suffixes:
                    samples.check()
                    if index in suffix_atoms:
                        continue
                    if not suffix_atoms:
                        # AND true is the root leaf; OR true is unconditional.
                        guards.append(((index,), ()) if operator == "&" else ((), ()))
                    else:
                        guards.append(((index,) + suffix_atoms, (operator,) + suffix_ops))
        result = prune(guards)
        # A depth pass may hit its reserved budget. Do not cache that partial
        # exploration as complete and block a later, better-funded pass.
        if misses_before == budget_misses:
            memo[key] = result
        return result

    result = []
    best = []
    for depth in range(1, max_terms + 1):
        samples.check()
        if states >= max_states:
            break
        # Shallow 3/4-leaf solutions are explored before long-chain guesses.
        # Unused capacity rolls forward, while later depths retain a share.
        reserve = max(1, (max_states - states) // (max_terms - depth + 1))
        iteration_ceiling = min(max_states, states + reserve)
        best = prune(best + search(positives, negatives, depth, iteration_ceiling))
    for atoms, ops in best:
        samples.check()
        rule = {"atoms": list(atoms), "ops": list(ops)}
        mask = condition_mask(rule, truth, all_mask)
        if not positives & ~mask and not negatives & mask:
            result.append(rule)
    if len(cache["queries"]) >= 256:
        cache["queries"].pop(next(iter(cache["queries"])))
    cache["queries"][query] = [condition_key(rule) for rule in result]
    return result


def window_guards(windows, negatives, samples, max_terms=6, max_candidates=8,
                  branch_limit=24, max_states=384, max_atoms=256,
                  preferred_atoms=(), frontier=False):
    """Find native chains hitting at least one state in EACH release window.

    Windows belong to ONE immutable observation path supplied by the caller.
    An AND prefix restricts each window to that prefix's true states; an OR
    prefix satisfies every window it touches and leaves the others unchanged.
    Consequently, different states cannot jointly witness an AND expression.
    Negatives are avoided throughout the final condition, not merely at the
    chosen witnesses. This is candidate guidance, never a runtime certificate.

    Unlike short_guards, the union of windows is NOT a fixed all-positive set.
    All clock aliases survive truth-signature deduplication. Finite atom and
    branch quotas still limit exploration; preferred_atoms reserves source
    leaves before feature selection and gives them early branch opportunities.
    An exhausted depth/atom/state quota is not global UNSAT. The existing
    short_guards implementation and its cache are deliberately independent.
    """
    samples.check()
    if min(max_terms, max_candidates, branch_limit, max_states, max_atoms) <= 0:
        return []
    all_mask, truth, costs = samples.all, samples.truth, samples.atom_costs
    negative = negatives & all_mask
    original = []
    for window in windows:
        samples.check()
        mask = window & all_mask
        if not mask:
            return []
        original.append(mask)
    if not original:
        return []
    # Negative states can never be final witnesses. This removal is exact for
    # this one guide; it introduces neither new states nor labels from a path.
    residual = tuple(sorted({window & ~negative for window in original}))
    if not residual or not residual[0]:
        return []
    preferred = tuple(sorted({index for index in preferred_atoms
                              if isinstance(index, int) and 0 <= index < len(truth)}))
    texts = getattr(samples, "atoms", None)
    stamp = (id(truth), len(truth), id(costs), len(costs), id(texts), all_mask)
    cache = getattr(samples, "_native_window_cache", None)
    if cache is None or cache["stamp"] != stamp:
        clock = set()
        if texts is not None:
            for index, text in enumerate(texts):
                if index % 64 == 0:
                    samples.check()
                if "bufftime:" in text:
                    clock.add(index)
        signatures = {}
        for index, mask in enumerate(truth):
            if index % 64 == 0:
                samples.check()
            signatures.setdefault(mask & all_mask, []).append(index)
        pool = []
        for offset, indices in enumerate(signatures.values()):
            if offset % 64 == 0:
                samples.check()
            ordered = sorted(indices, key=lambda index: (costs[index], index))
            stable = [index for index in ordered if index not in clock]
            # Two observed clock aliases can have arbitrary different future
            # threshold events. Do not truncate these aliases before ranking.
            pool.extend(stable[:1] + [index for index in ordered if index in clock])
        cache = {"stamp": stamp, "sources": (truth, costs, texts),
                 "clock": clock, "pool": tuple(pool), "queries": {},
                 "masks": tuple(mask & all_mask for mask in truth),
                 "denominators": tuple(cost + 1 for cost in costs)}
        try:
            samples._native_window_cache = cache
        except AttributeError:
            pass
    clock, masks, denominators = cache["clock"], cache["masks"], cache["denominators"]
    query = (residual, negative, max_terms, max_candidates, branch_limit,
             max_states, max_atoms, preferred, frontier)
    if not frontier and query in cache["queries"]:
        return [{"atoms": list(atoms), "ops": list(ops)}
                for atoms, ops in cache["queries"][query]]

    def cycle(items, key, limit):
        groups = {}
        for offset, item in enumerate(items):
            if offset % 64 == 0:
                samples.check()
            groups.setdefault(key(item), []).append(item)
        result, offset = [], 0
        while len(result) < limit:
            changed = False
            for position, group in enumerate(groups.values()):
                if position % 64 == 0:
                    samples.check()
                if offset < len(group):
                    result.append(group[offset])
                    changed = True
                    if len(result) >= limit:
                        break
            if not changed:
                break
            offset += 1
        return result

    preferred_set = set(preferred)
    pool = set(cache["pool"]) | preferred_set
    if len(pool) > max_atoms:
        ranked = []
        coverage_by_mask = {}
        for offset, index in enumerate(pool):
            if offset % 64 == 0:
                samples.check()
            mask = masks[index]
            coverage = coverage_by_mask.get(mask)
            if coverage is None:
                coverage = (sum(bool(mask & window) for window in residual)
                            + (negative & ~mask).bit_count())
                coverage_by_mask[mask] = coverage
            # Share arithmetic only: every clock alias keeps its own index,
            # cost, ordering and future native wake-up behavior.
            ranked.append((-coverage / denominators[index],
                           costs[index], index))
        ranked.sort()
        chosen = sorted(preferred, key=lambda index: (costs[index], index))[:max_atoms]
        selected = set(chosen)
        stable = [item for item in ranked if item[2] not in clock and item[2] not in selected]
        timed = [item for item in ranked if item[2] in clock and item[2] not in selected]
        room = max_atoms - len(chosen)
        # A large catalogue of timer aliases must not crowd every resource or
        # mechanism leaf out of the suffix search. Cheap inner leaves get a
        # share alongside coverage-ranked roots in both feature categories.
        for items, quota in ((stable, (room + 1) // 2), (timed, room // 2)):
            if quota <= 0:
                continue
            cheap = sorted(items, key=lambda item: (item[1], item[2]))
            priority = cycle([(0, item) for item in items] + [(1, item) for item in cheap],
                             lambda item: item[0], min(len(items) * 2, quota * 2))
            added = 0
            for offset, (_, item) in enumerate(priority):
                if offset % 64 == 0:
                    samples.check()
                if item[2] not in selected:
                    chosen.append(item[2])
                    selected.add(item[2])
                    added += 1
                    if added >= quota:
                        break
        for offset, (_, _, index) in enumerate(ranked):
            if offset % 64 == 0:
                samples.check()
            if len(chosen) >= max_atoms:
                break
            if index not in selected:
                chosen.append(index)
                selected.add(index)
        pool = chosen
    pool = sorted(pool, key=lambda index: (index not in preferred_set, costs[index], index))

    # Clock aliases deliberately remain separate candidates, but their
    # observed truth can share residual calculations. Keep signature slots
    # separate from the original leaf order so quotas and ties stay identical.
    signatures = tuple(dict.fromkeys(masks[index] for index in pool))
    signature_slot = {mask: offset for offset, mask in enumerate(signatures)}
    features = [(index, signature_slot[masks[index]], costs[index], denominators[index],
                 index not in preferred_set, index in preferred_set and index in clock)
                for index in pool]
    chain_entries = {}

    def prune(guards):
        unique = {}
        for offset, (atoms, ops) in enumerate(guards):
            if offset % 64 == 0:
                samples.check()
            key = atoms, ops
            entry = chain_entries.get(key)
            if entry is None:
                # Internally built chains already have valid native arity.
                # Avoid repeatedly normalizing and costing the same suffix.
                mask = masks[atoms[-1]] if atoms else all_mask
                for position in range(len(ops) - 1, -1, -1):
                    leaf = masks[atoms[position]]
                    mask = leaf & mask if ops[position] == "&" else leaf | mask
                wake = tuple(sorted(set(atoms) & clock))
                cost = 3 + sum(costs[index] for index in atoms) + len(ops) if atoms else 0
                entry = (cost, atoms, ops, mask, wake)
                chain_entries[key] = entry
            mask, wake = entry[3:]
            semantic = mask, wake
            if semantic not in unique or entry[:3] < unique[semantic][:3]:
                unique[semantic] = entry
        ranked = sorted(unique.values(), key=lambda entry: entry[:3])
        stable = [entry for entry in ranked if not entry[4]]
        timed = [entry for entry in ranked if entry[4]]
        chosen = stable[:(max_candidates + 1) // 2]
        chosen += cycle(timed, lambda entry: entry[4], max_candidates // 2)
        included = {(entry[1], entry[2]) for entry in chosen}
        for offset, entry in enumerate(ranked):
            if offset % 64 == 0:
                samples.check()
            if len(chosen) >= max_candidates:
                break
            if (entry[1], entry[2]) not in included:
                chosen.append(entry)
                included.add((entry[1], entry[2]))
        chosen.sort(key=lambda entry: entry[:3])
        return [(entry[1], entry[2]) for entry in chosen]

    roots_cache, memo = {}, {}
    window_features, blocked_features = {}, {}
    states, budget_misses = 0, 0

    def roots(remaining, blocked):
        samples.check()
        key = remaining, blocked
        if key in roots_cache:
            return roots_cache[key]
        # AND changes blocked states and OR changes outstanding windows.
        # Factor these two axes instead of recomputing every leaf/window
        # intersection for each pair, including aliases with equal truth.
        windows_data = window_features.get(remaining)
        if windows_data is None:
            windows_data = ([None] * len(signatures), [None] * len(signatures))
            window_features[remaining] = windows_data
        restricted_by_slot, untouched_by_slot = windows_data
        negatives_data = blocked_features.get(blocked)
        if negatives_data is None:
            negatives_data = []
            for offset, mask in enumerate(signatures):
                if offset % 64 == 0:
                    samples.check()
                intersecting = blocked & mask
                negatives_data.append((intersecting, (blocked & ~mask).bit_count()))
            blocked_features[blocked] = negatives_data
        leaves = [((), ())] if not blocked else []
        and_roots, or_roots = [], []
        for offset, (index, slot, cost, denominator, ordinary, preferred_clock) in enumerate(features):
            if offset % 64 == 0:
                samples.check()
            mask = signatures[slot]
            intersecting, excluded = negatives_data[slot]
            restricted = restricted_by_slot[slot]
            if restricted is None:
                restricted = tuple(sorted({window & mask for window in remaining}))
                restricted_by_slot[slot] = restricted
            # Every restricted window must retain a SAME-ROW witness for the
            # suffix. Empty intersections cannot be repaired by an AND tail.
            if restricted[0]:
                if not intersecting:
                    leaves.append(((index,), ()))
                progress = intersecting != blocked or restricted != remaining
                if progress or preferred_clock:
                    score = -excluded / denominator
                    and_roots.append((ordinary, score, cost,
                                      index, restricted, intersecting))
            if not intersecting:
                untouched = untouched_by_slot[slot]
                if untouched is None:
                    untouched = tuple(window for window in remaining if not window & mask)
                    untouched_by_slot[slot] = untouched
                if untouched and (untouched != remaining
                                  or preferred_clock):
                    score = -(len(remaining) - len(untouched)) / denominator
                    or_roots.append((ordinary, score, cost,
                                     index, untouched, blocked))
        ordered_and, ordered_or = sorted(and_roots), sorted(or_roots)
        if frontier:
            # Equivalent residual work shares computation, not clock identity.
            ordered_and = cycle(ordered_and, lambda item:(item[4],item[5]), len(ordered_and))
            ordered_or = cycle(ordered_or, lambda item:(item[4],item[5]), len(ordered_or))
        branches = []
        for offset in range(max(len(ordered_and), len(ordered_or))):
            samples.check()
            for operator, items in (("&", ordered_and), ("|", ordered_or)):
                if offset < len(items):
                    branches.append((operator, items[offset]))
                    if not frontier and len(branches) >= branch_limit:
                        break
            if not frontier and len(branches) >= branch_limit:
                break
        value = prune(leaves), branches
        roots_cache[key] = value
        return value

    def search(remaining, blocked, depth, ceiling):
        nonlocal states, budget_misses
        samples.check()
        key = remaining, blocked, depth
        if key in memo:
            return memo[key]
        if states >= ceiling:
            budget_misses += 1
            return []
        states += 1
        misses_before = budget_misses
        leaves, branches = roots(remaining, blocked)
        guards = list(leaves)
        if depth > 1:
            width = min(len(branches), max(1, (ceiling - states) // (depth - 1)))
            if width < len(branches):
                budget_misses += 1
            active = branches[:width]
            for position, (operator, (_, _, _, index, child_windows, child_negative)) in enumerate(active):
                samples.check()
                share = max(1, (ceiling - states) // (len(active) - position))
                child_ceiling = min(ceiling, states + share)
                suffixes = search(child_windows, child_negative, depth - 1, child_ceiling)
                for atoms, ops in suffixes:
                    samples.check()
                    if index in atoms:
                        continue
                    if not atoms:
                        guards.append(((index,), ()) if operator == "&" else ((), ()))
                    else:
                        guards.append(((index,) + atoms, (operator,) + ops))
        result = prune(guards)
        # Budgeted partial exploration must not block a better-funded pass.
        if misses_before == budget_misses:
            memo[key] = result
        return result

    if frontier:
        sessions = cache.setdefault('frontiers', {})
        if query not in sessions:
            import importlib.util
            from pathlib import Path
            spec = importlib.util.spec_from_file_location('exact_macro_frontier',
                Path(__file__).with_name('exact_macro_frontier.py'))
            engine = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(engine)
            if len(sessions) >= 64:
                sessions.pop(next(iter(sessions)))
            sessions[query] = engine.GuardFrontier(residual, negative, masks, pool,
                costs, max_terms, roots, prune, samples.check)
        session = sessions[query]
        best = session.advance(max_states)
        samples.window_search_status = session.diagnostic()
        result = []
        for atoms, ops in best:
            samples.check()
            rule = {'atoms':list(atoms), 'ops':list(ops)}
            mask = condition_mask(rule, truth, all_mask)
            if not mask & negative and all(window & mask for window in original):
                result.append(rule)
        return result

    best = []
    for depth in range(1, max_terms + 1):
        samples.check()
        if states >= max_states:
            break
        reserve = max(1, (max_states - states) // (max_terms - depth + 1))
        ceiling = min(max_states, states + reserve)
        best = prune(best + search(residual, negative, depth, ceiling))
    result = []
    for atoms, ops in best:
        samples.check()
        rule = {"atoms": list(atoms), "ops": list(ops)}
        mask = condition_mask(rule, truth, all_mask)
        if not mask & negative and all(window & mask for window in original):
            result.append(rule)
    if len(cache["queries"]) >= 256:
        cache["queries"].pop(next(iter(cache["queries"])))
    cache["queries"][query] = [condition_key(rule) for rule in result]
    return result
