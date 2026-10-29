"""Finite whole-program search below a certified macro's character cost.

Rule columns and bitset peeling jointly choose guards, actions and priority;
no original prefix or suffix is fixed. Observations are search guidance only.
The caller must parse and fully replay every returned complete program against
the original frozen contract. Exhausting this beam is not global UNSAT.
"""
import importlib.util
from pathlib import Path
import time


_CONDITIONS = None


def _conditions():
    global _CONDITIONS
    path = Path(__file__).with_name('exact_macro_conditions.py')
    if _CONDITIONS is None and path.is_file():
        spec = importlib.util.spec_from_file_location('exact_global_conditions', path)
        _CONDITIONS = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_CONDITIONS)
    return _CONDITIONS


def _key(rule):
    return (rule['action'], tuple(rule['atoms']),
            tuple(rule.get('ops', ())), 'ops' in rule,
            tuple(rule.get('any_atoms', ())) if 'ops' not in rule else ())


def _leaves(rule):
    return list(rule['atoms']) + (list(rule.get('any_atoms', ())) if 'ops' not in rule else [])


def _clock_ids(rule, samples):
    return tuple(sorted({k for k in _leaves(rule)
                         if samples.atoms[k].startswith(('bufftime:', 'tbufftime:'))}))


def _guards(positives, negatives, samples):
    helper = _conditions()
    if helper is not None:
        return helper.short_guards(positives, negatives, samples, max_terms=6,
                                   max_candidates=4, branch_limit=12, max_states=192)
    return [{'atoms':list(guard)} for guard in samples.covers(positives, negatives)]


def global_edits(rules, samples, clone, check_solver, diagnostic):
    """Yield shorter complete programs compatible with the named search guide.

    This implementation uses bitset beam search, so it does not issue SMT
    checks or reinterpret UNKNOWN as rejection. ``check_solver`` is retained
    in the interface for a future symbolic fallback. The success-only fallback
    is identified separately and does not claim source-WAIT compatibility.
    Search limits constrain this pass, never the legal macro language or the
    real replay certificate.
    """
    found = False
    for candidate in _search(rules, samples, clone, diagnostic):
        found = True
        yield candidate
    if not found and samples.groups:
        # An alternative runtime trajectory need not visit the source's WAIT
        # states. This separate guide drops those states, NEVER the oracle's
        # WAIT/horizon checks. Its failures must stay separate path branches.
        projected = _WitnessSamples(samples)
        if projected.all == samples.all:
            return
        for kind, trial in _search(rules, projected, clone, diagnostic):
            yield kind.replace('global_rule_peeling', 'global_witness_peeling'), trial


class _WitnessSamples:
    """Independent success-window projection; no original samples are edited."""
    guide_kind = 'success_witness_projection'

    def __init__(self, source):
        self.source = source
        self.all = 0
        for group in source.groups.values():
            self.all |= group
        # A caller can protect the reached prefix of ONE failed branch. This
        # keeps its genuine WAIT counterexamples when suffix rows are guides.
        self.all |= getattr(source, 'global_keep_mask', 0) & source.all
        self.atoms, self.actions = source.atoms, source.actions
        self.atom_costs, self.action_costs = source.atom_costs, source.action_costs
        self.truth = [mask & self.all for mask in source.truth]
        self.executable = [mask & self.all for mask in source.executable]
        self.allowed = [mask & self.all for mask in source.allowed]
        self.required = source.required & self.all
        self.groups = dict(source.groups)
        self.check = source.check
        self.rows = getattr(source, 'rows', [])
        self.global_keep_mask = getattr(source, 'global_keep_mask', 0)
        self.global_clock_carriers = getattr(source, 'global_clock_carriers', False)

    def hit(self, rule):
        return self.source.hit(rule) & self.all

    def rule_cost(self, rule):
        return self.source.rule_cost(rule)

    def covers(self, positives, negatives):
        return self.source.covers(positives, negatives)

    def selections(self, rules):
        remaining, selected = self.all, []
        for rule in rules:
            hit = remaining & self.hit(rule)
            selected.append(hit)
            remaining &= ~hit
        return selected, remaining

    def compatible(self, rules):
        remaining = self.all
        for rule in rules:
            hit = remaining & self.hit(rule)
            if hit & ~self.allowed[rule['action']]:
                return False
            remaining &= ~hit
        return not (remaining & self.required) and all(group & ~remaining for group in self.groups.values())


def _search(rules, samples, clone, diagnostic, beam_width=48, branch_width=12,
            column_limit=4096, shortlist_limit=24, depth_limit=48):
    samples.check()
    if not rules:
        diagnostic({'kind':'global_beam', 'status':'empty_cost_seed'}, None)
        return
    started = time.perf_counter()
    original = clone(rules)
    seed_compatible = samples.compatible(original)
    bound = sum(samples.rule_cost(rule)+1 for rule in original)
    original_key = tuple(_key(rule) for rule in original)
    groups = tuple(samples.groups.values())
    singleton_groups = 0
    multiple_groups = []
    for group in groups:
        if group.bit_count() == 1:
            singleton_groups |= group
        else:
            multiple_groups.append(group)
    columns, shape_keys = {}, set()
    guard_cache, residual_cache = {}, {}
    attempts, generated, completed = 0, 0, {}

    def add(rule, original_column=False):
        nonlocal generated
        samples.check()
        identity = _key(rule)
        if identity in shape_keys:
            return
        shape_keys.add(identity)
        hit = samples.hit(rule)
        action = rule['action']
        good = hit & samples.allowed[action]
        cost = samples.rule_cost(rule)+1
        if not good or cost >= bound:
            return
        # Static truth aliases can have different wake-up times. Keep their
        # clock footprints separate, even when their observed hit masks agree.
        key = action, hit, _clock_ids(rule, samples)
        old = columns.get(key)
        forced = original_column or (old is not None and old[4])
        if old is None or cost < old[0]:
            columns[key] = (cost, hit, clone([rule])[0], good, forced)
            generated += 1
        elif forced and not old[4]:
            columns[key] = old[:4] + (True,)

    def action_guards(guard, original_column=False):
        for action, allowed in enumerate(samples.allowed):
            if allowed:
                candidate = dict(guard, action=action)
                add(candidate, original_column)

    for rule in original:
        add(rule, True)
        guard = {key:value for key,value in rule.items() if key != 'action'}
        action_guards(guard)
        # Nearby guards become columns, not separately certified intermediate
        # edits. A completely rebuilt order can make them safe jointly.
        if not rule.get('any_atoms') and ('ops' not in rule or all(op == '&' for op in rule['ops'])):
            terms = list(rule['atoms'])
            if len(terms) <= 8:
                for drop in range(len(terms)):
                    action_guards({'atoms':terms[:drop]+terms[drop+1:]})
    action_guards({'atoms':[]})
    for atom in range(len(samples.atoms)):
        action_guards({'atoms':[atom]})

    selected, _ = samples.selections(original)
    # A newly reached negative can make a whole-action guard inseparable even
    # though two short rules can split its witnesses. Add a bounded collection
    # of local witness columns around ONE branch's failure, without fixing any
    # rule slot or mixing states from other failed runtime paths.
    focus_groups = []
    kept = getattr(samples, 'global_keep_mask', 0) & samples.all
    rows = getattr(samples, 'rows', [])
    if kept and rows:
        last_reached = kept.bit_length()-1
        if last_reached < len(rows):
            focus = rows[last_reached].get('cursor', last_reached)
            nearby = sorted(samples.groups.items(), key=lambda item:(abs(item[0]-focus), item[0]))
            focus_groups = [group for _, group in nearby[:12]]
    for action, allowed in enumerate(samples.allowed):
        samples.check()
        if not allowed:
            continue
        negatives = samples.executable[action] & ~allowed
        targets = ([allowed] + [bits & allowed for bits in selected if bits & allowed]
                   + [bits & allowed for bits in focus_groups if bits & allowed])
        for positives in dict.fromkeys(targets):
            key = positives, negatives
            if key not in guard_cache:
                guard_cache[key] = _guards(positives, negatives, samples)
            for guard in guard_cache[key]:
                # Keep separating columns in the active library. Ranking only
                # by total positive density lets thousands of unsafe primitive
                # columns crowd out the very guards that resolve a new branch.
                add(dict(guard, action=action), True)

    def library():
        values = list(columns.values())
        forced = [column for column in values if column[4]]
        optional = sorted((column for column in values if not column[4]),
                          key=lambda column:(-column[3].bit_count()/column[0], column[0], _key(column[2])))
        return forced + optional[:max(0, column_limit-len(forced))]

    def missing(remaining):
        if remaining not in residual_cache:
            if len(residual_cache) >= 32768:
                residual_cache.clear()
            residual_cache[remaining] = ((remaining & singleton_groups).bit_count()
                                        +sum(not (group & ~remaining) for group in multiple_groups),
                                        (samples.required & remaining).bit_count())
        return residual_cache[remaining]

    def add_complete(program, kind):
        samples.check()
        cost = sum(samples.rule_cost(rule)+1 for rule in program)
        key = tuple(_key(rule) for rule in program)
        if cost >= bound or key == original_key or key in completed:
            return
        if samples.compatible(program):
            completed[key] = (cost, kind, clone(program))

    # Each node stores the entire program being built and its remaining states.
    # A legal peel selects only allowed, executable actions on that residual;
    # lower-priority rules can therefore ignore states already settled above.
    frontier = [(0, samples.all, [])]
    shortest_line = min(samples.action_costs)+1 if samples.action_costs else 1
    maximum_depth = min(depth_limit, max(1, (bound-1)//shortest_line))
    for depth in range(maximum_depth):
        samples.check()
        # A few best residuals grow the finite rule library with newly short
        # whole-action guards. They need not resemble any original rule.
        for _, remaining, _ in frontier[:2]:
            for action, allowed in enumerate(samples.allowed):
                samples.check()
                positives = remaining & allowed
                if not positives:
                    continue
                negatives = remaining & samples.executable[action] & ~allowed
                key = positives, negatives
                if key not in guard_cache:
                    guard_cache[key] = _guards(positives, negatives, samples)
                for guard in guard_cache[key]:
                    add(dict(guard, action=action), True)
        active_columns = library()
        children = []
        for cost, remaining, program in frontier:
            samples.check()
            proposals = []
            for index, (line_cost, hits, rule, _, _) in enumerate(active_columns):
                if index % 64 == 0:
                    samples.check()
                hit = remaining & hits
                if not hit or hit & ~samples.allowed[rule['action']]:
                    continue
                next_cost = cost+line_cost
                if next_cost >= bound:
                    continue
                attempts += 1
                rest = remaining & ~hit
                cursor_count, required_count = missing(rest)
                # Coverage is a ranking heuristic, not a lower bound or proof.
                score = next_cost + 8*cursor_count + 4*required_count
                proposals.append((score, next_cost, rest, rule))
            proposals.sort(key=lambda item:(item[0], item[1], _key(item[3])))
            for _, next_cost, rest, rule in proposals[:branch_width]:
                candidate = program + [rule]
                if missing(rest) == (0, 0):
                    add_complete(candidate, 'global_rule_peeling')
                else:
                    children.append((next_cost, rest, candidate))
        # Retain two orders/clock footprints per residual, rather than treating
        # one observed trajectory as a unique executable program.
        children.sort(key=lambda node:(node[0]+8*missing(node[1])[0]+4*missing(node[1])[1],
                                       node[0], tuple(_key(rule) for rule in node[2])))
        counts, frontier = {}, []
        for node in children:
            samples.check()
            remaining = node[1]
            if counts.get(remaining, 0) >= 2:
                continue
            counts[remaining] = counts.get(remaining, 0)+1
            frontier.append(node)
            if len(frontier) >= beam_width:
                break
        if not frontier:
            break
        diagnostic({'kind':'global_beam_progress', 'depth':depth+1,
                    'columns':len(columns), 'frontier':len(frontier),
                    'complete_programs':len(completed),
                    'elapsed_ms':(time.perf_counter()-started)*1000}, None)

    # Preserve the source's existing time-threshold footprint as an optional
    # complete candidate. This is a legal ordinary macro line with an explicit
    # impossible resource guard; it never labels or certifies runtime behaviour.
    # The actual oracle must still confirm every action and WAIT through horizon.
    clock_ids = sorted({k for rule in original for k in _clock_ids(rule, samples)})
    false_atom = next((k for k, name in enumerate(samples.atoms) if name == 'rage<0'), None)
    if getattr(samples, 'global_clock_carriers', False) and clock_ids and false_atom is not None:
        carrier = {'action':original[0]['action'], 'atoms':[false_atom]+clock_ids}
        for _, _, program in sorted(completed.values(), key=lambda item:item[0])[:shortlist_limit]:
            add_complete(program+[carrier], 'global_rule_peeling_preserve_clocks')

    ranked = sorted(completed.values(), key=lambda item:(item[0], tuple(_key(rule) for rule in item[2])))
    # Keep both unconstrained timing and clock-preserving proposals in the
    # shortlist; static cost ranking alone could discard all timing variants.
    plain = [item for item in ranked if item[1] == 'global_rule_peeling']
    timed = [item for item in ranked if item[1] != 'global_rule_peeling']
    shortlist = sorted(plain[:shortlist_limit//2] + timed[:shortlist_limit//2], key=lambda item:item[0])
    if len(shortlist) < shortlist_limit:
        chosen = {tuple(_key(rule) for rule in item[2]) for item in shortlist}
        shortlist.extend(item for item in ranked if tuple(_key(rule) for rule in item[2]) not in chosen)
        shortlist = shortlist[:shortlist_limit]
    diagnostic({'kind':'global_beam', 'status':'sample_candidates' if shortlist else 'scope_exhausted',
                'guide_kind':getattr(samples, 'guide_kind', 'full_source_trajectory'),
                'seed_sample_compatible':seed_compatible,
                'columns':len(columns), 'generated_columns':generated, 'peels':attempts,
                'protected_columns':sum(column[4] for column in columns.values()),
                'complete_programs':len(completed), 'shortlist':len(shortlist),
                'experimental_clock_carriers':len(timed),
                'best_sample_chars':ranked[0][0]-1 if ranked else bound-1,
                'initial_chars':bound-1, 'beam_width':beam_width, 'branch_width':branch_width,
                'depth_limit':maximum_depth, 'elapsed_ms':(time.perf_counter()-started)*1000}, None)
    for _, kind, program in shortlist:
        samples.check()
        yield kind, clone(program)
