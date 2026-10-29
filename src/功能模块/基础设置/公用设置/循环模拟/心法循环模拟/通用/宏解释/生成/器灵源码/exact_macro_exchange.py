"""Contextual predicate substitution and conflict-directed priority exchanges.

Every mask belongs to ONE replay. These are bounded proposals, not equivalence
proofs: the caller must independently replay the complete program from zero.
Native chains are always evaluated right-to-left, including mixed operators.
"""
from collections import deque
from itertools import combinations
from itertools import chain
import heapq
import z3


def short_pairs(p, n, samples, *, ceiling, limit=24, clocks=None):
    """Scan the FULL atom catalog for one/two-leaf covers using bit arithmetic.

    No simulator, solver timeout, source macro B, or atom shortlist. Returned
    proposals have a finite diverse quota; no result proves runtime UNSAT.
    Different clock leaves remain distinct candidate identities.
    """
    cache = getattr(samples, '_exchange_pairs', None)
    if cache is None:
        cache = samples._exchange_pairs = {}
    query = p, n, ceiling, limit, None if clocks is None else tuple(sorted(clocks))
    if query in cache:
        return [dict(atoms=list(a),ops=list(o)) for a,o in cache[query]]
    buckets = {}
    costs, truth = samples.atom_costs, samples.truth
    fields = [a.split(':',1)[0].split('<')[0].split('>')[0].split('=')[0] for a in samples.atoms]
    def add(ids, ops):
        length = sum(costs[k] for k in ids)+len(ops)
        if length > ceiling:
            return
        bucket = (tuple(fields[k] for k in ids),ops)
        heap = buckets.setdefault(bucket,[])
        item = (-length,tuple(-k for k in ids),ids,ops)
        if len(heap) < 4:
            heapq.heappush(heap,item)
        elif item > heap[0]:
            heapq.heapreplace(heap,item)
    and_pool, or_pool = [], []
    for k,mask in enumerate(truth):
        if k % 64 == 0:
            samples.check()
        if costs[k] > ceiling:
            continue
        if clocks is not None and 'bufftime:' in samples.atoms[k] and k not in clocks:
            continue
        if not p & ~mask:
            and_pool.append(k)
            if not n & mask:
                add((k,),())
        if not n & mask:
            or_pool.append(k)
    for pool, op in ((and_pool,'&'),(or_pool,'|')):
        pool.sort(key=lambda k:(costs[k],k))
        for offset, left in enumerate(pool):
            samples.check()
            residual = (n & truth[left]) if op=='&' else (p & ~truth[left])
            for right in pool[offset+1:]:
                if costs[left]+costs[right]+1 > ceiling:
                    break
                valid = not residual & truth[right] if op=='&' else not residual & ~truth[right]
                if valid:
                    add((left,right),(op,))
    items = []
    for bucket, values in buckets.items():
        for negative_cost,_,ids,ops in values:
            items.append(((-negative_cost,len(ids),ids),bucket,(ids,ops)))
    result = list(fair(items,limit))
    if len(cache) >= 128:
        cache.pop(next(iter(cache)))
    cache[query] = result
    return [dict(atoms=list(a),ops=list(o)) for a,o in result]


def key(rules, conditions):
    return tuple((r['action'], conditions.condition_key(r)) for r in rules)


def cost(rules, samples):
    return sum(samples.rule_cost(r) for r in rules) + max(0, len(rules)-1)


def clocks_in(rules,samples,conditions):
    return {k for rule in rules for k in conditions.normalize(rule)['atoms'] if 'bufftime:' in samples.atoms[k]}


def fair(items, limit):
    queues = {}
    for rank, bucket, value in sorted(items, key=lambda item: item[0]):
        queues.setdefault(bucket, deque()).append(value)
    active = deque(queues.values())
    while active and limit > 0:
        queue = active.popleft()
        yield queue.popleft()
        limit -= 1
        if queue:
            active.append(queue)


def _forms(rule, conditions, include_leaves):
    """Replace multiple leaves by one hole, keeping the rendered chain legal.

    Intervals in a mixed chain are proposals, NOT assumed logical subtrees.
    Pure AND/OR chains additionally consider nonadjacent two/three-leaf groups.
    """
    old = conditions.normalize(rule)
    atoms, ops = old['atoms'], old['ops']
    seen = set()
    groups = [tuple(range(a, b)) for a in range(len(atoms))
              for b in range(a + (1 if include_leaves else 2), len(atoms)+1)]
    if len(set(ops)) <= 1:
        for count in (2, 3):
            groups.extend(combinations(range(len(atoms)), count))
    for group in groups:
        if not group or group in seen:
            continue
        seen.add(group)
        # Keep each surviving leaf's original outgoing operator. The caller
        # checks the entire new chain; no conventional AND precedence assumed.
        first, removed = group[0], set(group)
        kept = [i for i in range(len(atoms)) if i not in removed or i == first]
        new_atoms = [-1 if i == first else atoms[i] for i in kept]
        new_ops = ([ops[0]] * (len(kept)-1) if len(set(ops)) <= 1 and ops else
                   [ops[group[-1] if i == first else i] for i in kept[:-1]])
        yield dict(atoms=new_atoms, ops=new_ops), tuple(atoms[i] for i in group)


def substitutions(rules, samples, clone, conditions, *, growth=0, limit=64,
                  collisions=False, minimum_delta=None):
    """Replace one or several predicates by any catalog atom in row context.

    In collision mode keep the row's positive witnesses but allow steals for
    the priority repair below. WAIT steals cannot be repaired by another cast.
    """
    selected, _ = samples.selections(rules)
    remaining, proposals, seen = samples.all, [], set()
    for index, rule in enumerate(rules):
        samples.check()
        positives = selected[index]
        action = rule['action']
        negatives = remaining & samples.executable[action] & ~samples.allowed[action]
        if not positives:
            remaining &= ~positives
            continue
        old_cost = samples.rule_cost(rule)
        for shell, removed in _forms(rule, conditions, include_leaves=growth > 0):
            samples.check()
            zero = conditions.condition_mask(shell, samples.truth + [0], samples.all)
            one = conditions.condition_mask(shell, samples.truth + [samples.all], samples.all)
            if positives & ~one or (not collisions and negatives & zero):
                continue
            required, forbidden = positives & ~zero, negatives & one
            fixed = [k for k in shell['atoms'] if k >= 0]
            shell_cost = (samples.action_costs[action] + 3 + len(shell['ops'])
                          + sum(samples.atom_costs[k] for k in fixed))
            for atom, truth in enumerate(samples.truth):
                if atom % 64 == 0:
                    samples.check()
                new_cost = shell_cost + samples.atom_costs[atom]
                if (new_cost > old_cost+growth or atom in fixed
                        or (minimum_delta is not None and new_cost-old_cost < minimum_delta)
                        or required & ~truth or (not collisions and forbidden & truth)):
                    continue
                new_rule = dict(action=action, atoms=[atom if k < 0 else k for k in shell['atoms']],
                                ops=list(shell['ops']))
                identity = (index, conditions.condition_key(new_rule))
                if identity in seen or conditions.condition_key(new_rule) == conditions.condition_key(rule):
                    continue
                seen.add(identity)
                new_mask = zero | (one & truth)
                stolen = negatives & new_mask
                if collisions:
                    if not stolen or new_cost >= old_cost:
                        continue
                elif stolen:
                    continue
                trial = clone(rules)
                trial[index] = new_rule
                if not collisions and not samples.compatible(trial):
                    continue
                old_clocks = sum('bufftime:' in samples.atoms[k] for k in removed)
                new_clock = int('bufftime:' in samples.atoms[atom])
                kind = 'exchange_combination' if len(removed) > 1 else 'exchange_alias'
                metadata = dict(row=index, removed=list(removed), replacement=atom,
                                stolen_rows=stolen.bit_count(), source_path=samples.path_id,
                                origins=list(range(len(rules))))
                rank = (new_cost-old_cost, new_clock-old_clocks, len(fixed), atom, index)
                # Keep syntactically distinct clocks. Round-robin fields/rows
                # only bounds this turn; no signature implies equivalence.
                field = samples.atoms[atom].split(':', 1)[0].split('<')[0].split('>')[0].split('=')[0]
                bucket = (index, field)
                proposals.append((rank, bucket, (kind, trial, metadata)))
        remaining &= ~positives
    yield from fair(proposals, limit)


def groups(rules, samples, clone, conditions, *, growth=0, limit=48,
           collisions=False, minimum_delta=None):
    """Learn a replacement for the UNION of same-action rule responsibilities.

    No old condition is required to be a syntactic part of the new guard.
    Position and other rules' executable protection determine negatives.
    """
    selected, _ = samples.selections(rules)
    positions, proposals, seen = {}, [], set()
    total = cost(rules, samples)
    for index, rule in enumerate(rules):
        positions.setdefault(rule['action'], []).append(index)
    for action, ids in positions.items():
        if len(ids) < 2:
            continue
        donor_sets = list(dict.fromkeys([tuple(ids)] + list(combinations(ids, 2))))[:64]
        for donors in donor_sets:
            samples.check()
            positive = 0
            for index in donors:
                positive |= selected[index]
            if not positive:
                continue
            survivors = [i for i in range(len(rules)) if i not in donors]
            for gap in range(len(survivors)+1):
                samples.check()
                prefix = [rules[i] for i in survivors[:gap]]
                _, remaining = samples.selections(prefix)
                # Donor witnesses captured incorrectly before this gap cannot
                # be repaired by a rule inserted later.
                prefix_hits, _ = samples.selections(prefix)
                if any(bits & ~samples.allowed[r['action']] for r,bits in zip(prefix,prefix_hits)):
                    continue
                p = positive & remaining
                if not p:
                    continue
                n = remaining & samples.executable[action] & ~samples.allowed[action]
                guards = [dict(atoms=[k],ops=[]) for k, mask in enumerate(samples.truth)
                          if not p & ~mask and (collisions or not n & mask)]
                if not collisions:
                    guard_ceiling = total + growth - cost([rules[i] for i in survivors],samples) - samples.action_costs[action] - 4
                    guards += short_pairs(p,n,samples,ceiling=guard_ceiling,limit=24)
                    guards += conditions.short_guards(p,n,samples,max_terms=6,
                                max_candidates=8,branch_limit=16,max_states=384)
                for guard in guards:
                    replacement = dict(guard,action=action)
                    stolen = remaining & samples.hit(replacement) & ~samples.allowed[action]
                    if collisions and not stolen:
                        continue
                    trial = clone(prefix) + [replacement] + clone([rules[i] for i in survivors[gap:]])
                    trial_cost = cost(trial,samples)
                    identity = key(trial,conditions)
                    if (identity in seen or trial_cost > total+growth
                            or (minimum_delta is not None and trial_cost-total < minimum_delta)
                            or (not collisions and not samples.compatible(trial))):
                        continue
                    seen.add(identity)
                    detail = dict(row=gap,donors=list(donors),origins=survivors[:gap]+[None]+survivors[gap:],
                                  replacement_atoms=list(guard['atoms']),stolen_rows=stolen.bit_count(),
                                  source_path=samples.path_id)
                    proposals.append(((trial_cost, len(guard['atoms'])), (action,gap),
                                      ('exchange_group',trial,detail)))
    yield from fair(proposals,limit)


def suffixes(rules, samples, clone, conditions, *, growth=0, limit=48, minimum_delta=None):
    """An exact one/two-leaf catalog cover can replace an entire native subtree."""
    selected,_ = samples.selections(rules)
    remaining, items, seen = samples.all, [], set()
    old_clocks=clocks_in(rules,samples,conditions)
    for index,rule in enumerate(rules):
        samples.check()
        action = rule['action']
        p, n = selected[index], remaining & samples.executable[action] & ~samples.allowed[action]
        old = conditions.normalize(rule)
        atoms, ops = old['atoms'], old['ops']
        for start in range(max(0,len(atoms)-1)):
            shell = dict(atoms=atoms[:start]+[-1],ops=ops[:start])
            zero = conditions.condition_mask(shell,samples.truth+[0],samples.all)
            one = conditions.condition_mask(shell,samples.truth+[samples.all],samples.all)
            if not p or p & ~one or n & zero:
                continue
            required, forbidden = p & ~zero, n & one
            fixed_cost = samples.action_costs[action]+3+sum(samples.atom_costs[k]+1 for k in atoms[:start])
            ceiling = samples.rule_cost(rule)+growth-fixed_cost
            guards=short_pairs(required,forbidden,samples,ceiling=ceiling,limit=24,clocks=old_clocks)
            guards+=short_pairs(required,forbidden,samples,ceiling=ceiling,limit=24)
            for guard in guards:
                changed = dict(action=action,atoms=atoms[:start]+guard['atoms'],ops=ops[:start]+guard['ops'])
                delta = samples.rule_cost(changed)-samples.rule_cost(rule)
                identity = index,conditions.condition_key(changed)
                if identity in seen or (minimum_delta is not None and delta<minimum_delta):
                    continue
                seen.add(identity)
                trial = clone(rules)
                trial[index] = changed
                if not samples.compatible(trial):
                    continue
                info = dict(row=index,removed=atoms[start:],replacement_atoms=guard['atoms'],source_path=samples.path_id)
                clock_change=clocks_in(trial,samples,conditions)!=old_clocks
                items.append(((clock_change,delta,start),(index,tuple(guard['ops'])),('exchange_subtree',trial,info)))
        remaining &= ~selected[index]
    yield from fair(items,limit)


def gates(rules, samples, clone, conditions, *, growth=0, limit=24):
    """Longer protection/clock contexts, always screened as complete programs."""
    if growth <= 0:
        return
    selected,_ = samples.selections(rules)
    remaining,items = samples.all,[]
    for index,rule in enumerate(rules):
        guard = conditions.normalize(rule)
        if not guard['atoms'] or not selected[index]:
            remaining &= ~selected[index]
            continue
        n = remaining & samples.executable[rule['action']] & ~samples.allowed[rule['action']]
        for atom,mask in enumerate(samples.truth):
            if atom % 64 == 0:
                samples.check()
            if atom in guard['atoms'] or samples.atom_costs[atom]+1>growth:
                continue
            operators=[]
            if not selected[index] & ~mask:
                operators.append('&')
            if not n & mask:
                operators.append('|')
            for op in operators:
                trial=clone(rules)
                trial[index]=dict(action=rule['action'],atoms=[atom]+guard['atoms'],ops=[op]+guard['ops'])
                if not samples.compatible(trial):
                    continue
                info=dict(row=index,added=atom,operator=op,source_path=samples.path_id)
                bucket=(index,op,'bufftime:' in samples.atoms[atom])
                items.append(((samples.atom_costs[atom],atom),bucket,('exchange_gate',trial,info)))
        remaining &= ~selected[index]
    yield from fair(items,limit)


def cover_groups(rules,samples,clone,conditions,*,limit=24):
    """Joint minimum-cost cover by short clauses for same-action families.

    Build all one-atom/AND-pair columns arithmetically, then solve their weighted
    cover. Each clause must avoid executable wrong hits at its insertion gap.
    This finite column problem is not macro-language optimality or UNSAT.
    """
    selected,_=samples.selections(rules)
    old_clocks=clocks_in(rules,samples,conditions)
    families={}
    for i,r in enumerate(rules):
        families.setdefault(r['action'],[]).append(i)
    proposals=[]
    for action,donors in families.items():
        if len(donors)<2:
            continue
        positive=0
        for i in donors:
            positive |= selected[i]
        if not positive:
            continue
        survivors=[i for i in range(len(rules)) if i not in donors]
        needed_clocks=old_clocks-clocks_in([rules[i] for i in survivors],samples,conditions)
        donor_cost=sum(samples.rule_cost(rules[i])+1 for i in donors)
        base_cost=samples.action_costs[action]+4
        for gap in range(len(survivors)+1):
            samples.check()
            prefix=[rules[i] for i in survivors[:gap]]
            hits,remaining=samples.selections(prefix)
            if any(b & ~samples.allowed[r['action']] for r,b in zip(prefix,hits)):
                continue
            p=positive & remaining
            n=remaining & samples.executable[action] & ~samples.allowed[action]
            if not p:
                continue
            columns={}
            def add(guard,mask):
                covered=p & mask
                column_cost=samples.action_costs[action]+conditions.condition_cost(guard,samples.atom_costs)+1
                if not covered or n & mask or column_cost>=donor_cost:
                    return
                # Same observed coverage does not imply clock equivalence.
                # Retain a stable and a clock-bearing representative for this
                # finite cover turn; the full atom catalog stays untouched.
                wake=tuple(k for k in guard['atoms'] if 'bufftime:' in samples.atoms[k])
                k=covered,wake
                previous=columns.get(k)
                if previous is None or column_cost<previous[0]:
                    columns[k]=(column_cost,guard,covered)
            pool=[k for k,m in enumerate(samples.truth) if m & p and base_cost+samples.atom_costs[k]<donor_cost
                  and ('bufftime:' not in samples.atoms[k] or k in old_clocks)]
            for i,left in enumerate(pool):
                samples.check()
                mask=samples.truth[left]
                add(dict(atoms=[left],ops=[]),mask)
                for right in pool[i+1:]:
                    if base_cost+samples.atom_costs[left]+samples.atom_costs[right]+1>=donor_cost:
                        continue
                    both=mask & samples.truth[right]
                    if both & p and not both & n:
                        add(dict(atoms=[left,right],ops=['&']),both)
            for i in donors:
                guard=conditions.normalize(rules[i])
                add(guard,conditions.condition_mask(guard,samples.truth,samples.all))
            values=list(columns.values())
            union=0
            for _,_,covered in values:
                union |= covered
            if p & ~union:
                continue
            solver=z3.Optimize()
            solver.set(timeout=150)
            variables=[z3.Bool('cover_%d'%i) for i in range(len(values))]
            unique=set()
            bits=p
            while bits:
                bit=bits & -bits
                indices=tuple(i for i,(_,_,coverage) in enumerate(values) if coverage & bit)
                unique.add(indices)
                bits ^= bit
            for indices in unique:
                solver.add(z3.Or([variables[i] for i in indices]))
            for clock in needed_clocks:
                solver.add(z3.Or([variables[i] for i,(_,g,_) in enumerate(values) if clock in g['atoms']]))
            objective=z3.Sum([z3.If(v,c,0) for v,(c,_,_) in zip(variables,values)])
            solver.add(objective<donor_cost)
            solver.minimize(objective)
            for model_number in range(2):
                samples.check()
                status=solver.check()
                samples.check()
                queries=getattr(samples,'exchange_cover_queries',None)
                if queries is None:
                    queries=samples.exchange_cover_queries=[]
                queries.append(dict(action=action,gap=gap,columns=len(values),status=str(status),
                                    reason=solver.reason_unknown() if status==z3.unknown else None,
                                    required_clocks=len(needed_clocks)))
                if status!=z3.sat:
                    break
                model=solver.model()
                chosen=[i for i,v in enumerate(variables) if z3.is_true(model.eval(v))]
                inserted=[dict(values[i][1],action=action) for i in chosen]
                trial=clone(prefix)+inserted+clone([rules[i] for i in survivors[gap:]])
                if cost(trial,samples)<cost(rules,samples) and samples.compatible(trial):
                    info=dict(donors=donors,row=gap,columns=len(values),status='sat',
                              model=model_number,source_path=samples.path_id)
                    proposals.append(((cost(trial,samples),len(inserted)),action,('exchange_cover',trial,info)))
                solver.add(z3.Or([v!=model.eval(v,model_completion=True) for v in variables]))
    yield from fair(proposals,limit)


def exchanges(rules, samples, clone, conditions, *, growth=0, limit=48,
              max_queries=32, max_protectors=3, minimum_delta=None):
    """Cheap guard -> stolen native observations -> protecting rule(s).

    Move a victim rule or insert a narrow exception before the new cheap row.
    Protection guards are learned from executable first-hit conflicts, not
    skill names. All edits are proposed as one complete macro.
    """
    selected, _ = samples.selections(rules)
    ceiling = cost(rules, samples) + growth
    proposals, seen, queries = [], set(), 0
    seeds = chain(substitutions(rules, samples, clone, conditions,limit=48,collisions=True),
                  groups(rules,samples,clone,conditions,limit=32,collisions=True))
    for _, cheap, detail in seeds:
        samples.check()
        index = detail['row']
        _, remaining = samples.selections(cheap[:index])
        new_rule = cheap[index]
        bad = remaining & samples.hit(new_rule) & ~samples.allowed[new_rule['action']]
        origin = detail['origins']
        victims = [i for i in range(index+1, len(cheap))
                   if origin[i] is not None and selected[origin[i]] & bad]
        accounted = 0
        for i in victims:
            accounted |= selected[origin[i]]
        if bad & ~accounted or not victims or len(victims) > max_protectors:
            continue
        for move in (True, False):
            frontier = [([], remaining)]
            for victim in victims:
                expanded = []
                action = cheap[victim]['action']
                positive = selected[origin[victim]] if move else selected[origin[victim]] & bad
                for protects, available in frontier:
                    samples.check()
                    p = positive & available
                    n = available & samples.executable[action] & ~samples.allowed[action]
                    if not p:
                        expanded.append((protects, available))
                        continue
                    guards = [conditions.normalize(cheap[victim])]
                    guards += [dict(atoms=[k], ops=[]) for k, mask in enumerate(samples.truth)
                               if not p & ~mask and not n & mask]
                    if queries < max_queries:
                        queries += 1
                        guards += conditions.short_guards(p, n, samples, max_terms=3,
                                    max_candidates=3, branch_limit=8, max_states=96)
                    unique = {}
                    for guard in guards:
                        protected = dict(guard, action=action)
                        hit = samples.hit(protected)
                        if p & ~hit or n & hit:
                            continue
                        unique[conditions.condition_key(guard)] = protected
                    ordered = sorted(unique.values(), key=samples.rule_cost)
                    for protected in ordered[:4]:
                        expanded.append((protects+[protected], available & ~samples.hit(protected)))
                frontier = sorted(expanded, key=lambda item:sum(samples.rule_cost(r) for r in item[0]))[:6]
                if not frontier:
                    break
            for protects, _ in frontier:
                trial = clone(cheap[:index]) + clone(protects) + clone([new_rule])
                trial += clone([r for i, r in enumerate(cheap[index+1:], index+1)
                                if not move or i not in victims])
                trial_cost = cost(trial, samples)
                identity = key(trial, conditions)
                if (identity in seen or trial_cost > ceiling or not samples.compatible(trial)
                        or (minimum_delta is not None and trial_cost-cost(rules,samples)<minimum_delta)):
                    continue
                seen.add(identity)
                info = dict(detail, victims=victims, operation='move' if move else 'exception')
                proposals.append(((trial_cost, len(protects)), (index, move),
                                  ('exchange_priority', trial, info)))
    yield from fair(proposals, limit)


def proposals(rules, samples, clone, conditions, *, growth=0, limit=64, minimum_delta=None):
    # Cheap expression replacements are separate from conflict repair and
    # never depend on a successful priority move being available.
    sources = deque(iter(f(rules,samples,clone,conditions,growth=growth,limit=limit,minimum_delta=minimum_delta))
                    for f in (substitutions,suffixes,groups,exchanges))
    if growth:
        sources.append(iter(gates(rules,samples,clone,conditions,growth=growth,limit=limit)))
    elif minimum_delta is None:
        sources.append(iter(cover_groups(rules,samples,clone,conditions,limit=min(12,limit))))
    while sources:
        iterator=sources.popleft()
        try:
            yield next(iterator)
        except StopIteration:
            continue
        sources.append(iterator)
