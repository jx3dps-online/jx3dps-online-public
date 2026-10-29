"""Bounded native-grammar guard proposals for region choice SAT.

Masks and public structural priors only rank proposals on ONE path. Timing
leaves remain distinct even when current truth agrees. Native replay is the
only acceptance check; finite libraries are not the complete macro language.
"""
import importlib.util
from pathlib import Path
import time


_CONDITIONS = None
_LEARNING = None


def conditions():
    global _CONDITIONS
    if _CONDITIONS is None:
        spec = importlib.util.spec_from_file_location("region_guard_conditions",
            Path(__file__).with_name("exact_macro_conditions.py"))
        _CONDITIONS = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_CONDITIONS)
    return _CONDITIONS


def atom_role(text):
    """Use the same anonymous roles as the frozen offline prior producer."""
    global _LEARNING
    if _LEARNING is None:
        spec = importlib.util.spec_from_file_location("region_guard_learning",
            Path(__file__).with_name("exact_macro_learning.py"))
        _LEARNING = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_LEARNING)
    return _LEARNING.atom_role(text)


def _prior_shapes(prior):
    # The caller already validates the model package. Independently reject
    # malformed syntax here; untrusted metadata never becomes macro text.
    if not isinstance(prior, dict) or prior.get("schema_version") != 1:
        return ()
    atom_role("")  # Load the shared pure schema/role functions.
    try:
        prior = _LEARNING.validate_structural_prior(prior)
    except (ValueError, TypeError):
        return ()
    if prior.get("native_semantics") != "and_or_equal_precedence_right_associative-v1":
        return ()
    valid_roles = {"clock", "resource", "presence", "stack", "target", "skill", "last_skill"}
    shapes = []
    for shape in prior.get("shapes", ()):
        if not isinstance(shape, dict):
            continue
        roles, ops = tuple(shape.get("roles", ())), tuple(shape.get("ops", ()))
        frequency = shape.get("frequency", 0)
        if (not roles or any(role not in valid_roles for role in roles)
                or len(ops) != len(roles) - 1 or any(op not in ("&", "|") for op in ops)
                or not isinstance(frequency, (int, float)) or not 0 <= frequency <= 1):
            continue
        shapes.append((roles, ops, frequency))
    return tuple(sorted(shapes, key=lambda value: (-value[2], len(value[0]), value[:2])))


def guard_candidates(source, samples, region, *, max_terms=6,
                     max_candidates=96, beam_width=48, max_expansions=12000,
                     structural_prior=None):
    """Return guarded records plus construction diagnostics.

    Each record contains atoms/ops/mask/cost/clock_key. Non-time expressions
    with equal truth may retain only their cheapest native chain; expressions
    with distinct clock sets are separate. Source guards and unconditional
    fallback are retained even when they exceed the heuristic shortlist.
    Prior shapes get their own small suggestion quota. Ordinary proposals
    keep an independent quota, so an absent prior never excludes a grammar.
    """
    started = time.perf_counter()
    samples.check()
    native = conditions()
    pool = tuple(region["atoms"])
    clocks = {atom for atom, text in enumerate(samples.atoms) if "bufftime:" in text}
    costs, all_mask = samples.atom_costs, samples.all
    source_conditions = [native.normalize(source[index]) for index in region["donors"]]
    shapes = _prior_shapes(structural_prior)
    shape_weights = {(roles, ops): weight for roles, ops, weight in shapes}
    role = {atom: atom_role(text) for atom, text in enumerate(samples.atoms)}
    removed = set(region["donors"])
    prefix_remaining = all_mask
    for index, rule in enumerate(source):
        if index >= min(removed, default=0):
            break
        prefix_remaining &= ~samples.hit(rule)
    events = tuple(region.get("events", ()))
    window_mask = 0
    for event in events:
        window_mask |= event
    if not window_mask:
        window_mask = all_mask
    contexts = []
    for action in region["actions"]:
        executable = samples.executable[action]
        positives = executable & samples.allowed[action] & window_mask
        negatives = executable & ~samples.allowed[action] & prefix_remaining
        contexts.append((action, positives, negatives,
            tuple(event & positives for event in events if event & positives)))
    expanded, stopped = 0, False
    catalog, ordinary, prior_catalog = {}, set(), {}
    score_cache = {}

    def scores(mask, cost):
        key = mask, cost
        if key not in score_cache:
            per_action = []
            for action, positives, negatives, windows in contexts:
                good, bad = mask & positives, mask & negatives
                coverage = sum(bool(mask & window) for window in windows)
                # Partial safe guards can become the exceptions of a default;
                # broad guards can become cheaper after priority shielding.
                precision = good.bit_count() / max(1, (good | bad).bit_count())
                recall = coverage / max(1, len(windows))
                utility = (2 * precision + recall) / (cost + 1)
                per_action.append((-utility, bad.bit_count(), -coverage, cost))
            score_cache[key] = tuple(per_action)
        return score_cache[key]

    def guard_record(atoms, ops, mask=None):
        atoms, ops = tuple(atoms), tuple(ops)
        rule = {"atoms": atoms, "ops": ops}
        if mask is None:
            mask = native.condition_mask(rule, samples.truth, all_mask)
        return {"atoms": atoms, "ops": ops, "mask": mask,
                "cost": native.condition_cost(rule, costs),
                "clock_key": tuple(sorted(set(atoms) & clocks))}

    def expression_key(guard):
        return guard["atoms"], guard["ops"], guard["clock_key"]

    def add(atoms, ops, *, origin="ordinary", mask=None):
        nonlocal expanded, stopped
        if expanded >= max_expansions and origin not in ("source", "unconditional", "prior"):
            stopped = True
            return None
        expanded += 1
        if expanded % 64 == 0:
            samples.check()
        candidate = guard_record(atoms, ops, mask)
        atoms, ops, cost = candidate["atoms"], candidate["ops"], candidate["cost"]
        if origin == "prior":
            # Equal sampled truth is insufficient to replace an ordinary
            # expression. Preserve prior proposals in an independent quota;
            # native replay may distinguish chains sharing the same signature.
            identity = expression_key(candidate)
            prior_catalog[identity] = candidate
            return identity
        signature = candidate["mask"], candidate["clock_key"]
        old = catalog.get(signature)
        if old is None or (cost, atoms, ops) < (old["cost"], old["atoms"], old["ops"]):
            catalog[signature] = candidate
        ordinary.add(signature)
        return signature

    add((), (), origin="unconditional", mask=all_mask)
    source_records = []
    for guard in source_conditions:
        add(guard["atoms"], guard["ops"], origin="source")
        source_records.append(guard_record(guard["atoms"], guard["ops"]))
        # Removing a gate proposes a new scope without requiring that each
        # incomplete edit pass. Joint SAT chooses the complete replacements.
        for index in range(len(guard["atoms"])):
            atoms = list(guard["atoms"])
            ops = list(guard["ops"])
            atoms.pop(index)
            if ops:
                ops.pop(min(index, len(ops) - 1))
            add(atoms, ops)
    for atom in pool:
        add((atom,), (), mask=samples.truth[atom] & all_mask)

    def ranked(keys, with_prior=False, records=None):
        records = catalog if records is None else records
        def order(key):
            guard = records[key]
            priorities = scores(guard["mask"], guard["cost"])
            best = min(priorities) if priorities else (0, 0, 0, guard["cost"])
            shape = tuple(role[atom] for atom in guard["atoms"]), guard["ops"]
            bonus = shape_weights.get(shape, 0) if with_prior else 0
            return best[0] - .05 * bonus / (guard["cost"] + 1), best[1:], guard["atoms"], guard["ops"]
        return sorted(keys, key=order)

    def diverse(keys, limit):
        # Every action receives coverage and precision representatives. Keep
        # clock footprints separate and share quotas with cheap static guards.
        keys = set(keys)
        queues = [ranked(keys)]
        for position in range(len(contexts)):
            queues.append(sorted(keys, key=lambda key: scores(catalog[key]["mask"], catalog[key]["cost"])[position]
                + (catalog[key]["atoms"], catalog[key]["ops"])))
        timed = [key for key in ranked(keys) if key[1]]
        queues.append(timed)
        result, seen = [], set()
        for offset in range(max((len(items) for items in queues), default=0)):
            samples.check()
            for items in queues:
                if offset < len(items) and items[offset] not in seen:
                    result.append(items[offset])
                    seen.add(items[offset])
                    if len(result) >= limit:
                        return result
        return result

    # Library composition uses integer mask &/|; Z3 never rediscovers a
    # condition's truth on every state. Prepending is exactly native right fold.
    frontier = diverse([key for key, guard in catalog.items() if len(guard["atoms"]) == 1], beam_width)
    for depth in range(2, max(1, max_terms) + 1):
        layer = set()
        for key in frontier:
            suffix = catalog[key]
            for atom in pool:
                if atom in suffix["atoms"]:
                    continue
                for op in ("&", "|"):
                    mask = samples.truth[atom] & suffix["mask"] if op == "&" else samples.truth[atom] | suffix["mask"]
                    value = add((atom,) + suffix["atoms"], (op,) + suffix["ops"], mask=mask & all_mask)
                    if value is not None and len(catalog[value]["atoms"]) == depth:
                        layer.add(value)
                    if stopped:
                        break
                if stopped:
                    break
            if stopped:
                break
        if not layer or stopped:
            break
        frontier = diverse(layer, beam_width)

    # Freeze complete records, not just truth keys. Source syntax and cost are
    # also retained exactly, even when ordinary truth dedup chose a cheaper
    # chain. Priors are strictly additive and cannot mutate either collection.
    ordinary_selected = diverse(ordinary, max(1, max_candidates))
    frozen_ordinary = [dict(catalog[key]) for key in ordinary_selected]
    frozen_ordinary.extend(source_records)
    frozen_ordinary.append(guard_record((), (), all_mask))
    # Priors propose syntax roles only. They are applied independently from
    # ordinary expansion, preventing the ordinary budget from starving them.
    prior_expansions = 0
    for roles, ops, frequency in shapes[:8]:
        if len(roles) > max_terms:
            continue
        partial = [()]
        for desired in roles:
            choices = [atom for atom in pool if role[atom] == desired]
            choices.sort(key=lambda atom: (costs[atom], atom))
            extended = [prefix + (atom,) for prefix in partial for atom in choices[:4] if atom not in prefix]
            partial = extended[:24]
        for atoms in partial:
            # A prior proposal budget is separate from ordinary compositional
            # growth, but still finite and replayed. Never inject macro names.
            if not atoms:
                continue
            value = add(atoms, ops, origin="prior")
            prior_expansions += value is not None

    selected, identities = [], set()
    for guard in frozen_ordinary:
        identity = expression_key(guard)
        if identity not in identities:
            selected.append(guard)
            identities.add(identity)
    prior_added = 0
    for identity in ranked(prior_catalog, with_prior=True, records=prior_catalog):
        if identity not in identities:
            selected.append(prior_catalog[identity])
            identities.add(identity)
            prior_added += 1
        if prior_added >= max(1, max_candidates // 4):
            break
    output = [dict(guard, atoms=list(guard["atoms"]), ops=list(guard["ops"]))
              for guard in selected]
    stats = {"guard_candidates": len(output), "guard_expansions": expanded,
             "guard_budget_exhausted": stopped, "guard_prior_shapes": len(shapes),
             "guard_prior_proposals": prior_expansions,
             "guard_prior_added": prior_added,
             "guard_construction_ms": (time.perf_counter() - started) * 1000}
    return output, stats
