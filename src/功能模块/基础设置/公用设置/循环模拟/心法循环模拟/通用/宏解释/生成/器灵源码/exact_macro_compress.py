"""Stage two: shorten a certified macro against one frozen target, without B.

Sample columns guide search, never certify an edit or prove it impossible.
Every admitted program is parsed and replayed from t=0 by the real oracle.
The finite neighbourhood/beam/local SAT shapes control search breadth only.
"""
import time
import importlib.util
import hashlib
import json
from pathlib import Path

import z3

_MODULES = {}
_TRUTH_DIGITS = bytes([ord('0')] + [ord('1')] * 255)


def search_module(name):
    """One lazy module registry for all stage-two strategies."""
    if name not in _MODULES:
        spec = importlib.util.spec_from_file_location(name,
            Path(__file__).with_name(name + '.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _MODULES[name] = module
    return _MODULES[name]


def condition_module():
    return search_module('exact_macro_conditions')


def short_search(p, n, samples):
    return condition_module().short_guards(p, n, samples,
        max_terms=6, max_candidates=4, branch_limit=12, max_states=192)


def complex_guard(rule):
    return bool(rule.get('any_atoms')) or '|' in rule.get('ops', [])


def remove_chain_atom(rule, index):
    value = clone([rule])[0]
    value['atoms'].pop(index)
    if 'ops' in value:
        if value['ops']:
            value['ops'].pop(min(index, len(value['ops'])-1))
        if '|' not in value['ops']:
            value.pop('ops')
    return value


def priority_edits(rules, samples, native=False):
    yield from search_module('exact_macro_reorder').priority_edits(
        rules, samples, clone, condition_search=short_search if native else None)


def schedule_edits(rules, samples):
    """Learn without treating deleted-clock snapshots as mandatory negatives."""
    context = search_module('exact_macro_schedule').ClockContext(samples, condition_module())
    if not context.groups:
        return
    def search(p, n, guide):
        return condition_module().short_guards(p, n, guide,
            max_terms=6, max_candidates=8, branch_limit=24, max_states=512)
    yield from search_module('exact_macro_reorder').priority_edits(
        rules, samples, clone, condition_search=search, clock_context=context)


def projected_window_edits(rules, samples, frontier=False, diagnostic=None):
    engine = search_module('exact_macro_schedule')
    rows, count = engine.projected_rows(samples)
    if not count:
        return
    # Private proposal matrix; never installed as a certified/reached path and
    # never used to label a later event after a hypothetical cast.
    guide = Samples(rows,samples.atoms,samples.actions,samples.check,
                    dict(kind='alternative_wait_witnesses',parent=samples.path_id))
    context = engine.WindowContext(guide,condition_module())
    actual = sum(1 << i for i,row in enumerate(rows) if row.get('projection_parent') is None)
    def search(query, path):
        return condition_module().window_guards(query.windows,query.negatives,path,
            max_terms=6,max_candidates=8,branch_limit=24,max_states=128 if frontier else 1024,max_atoms=512,
            frontier=frontier)
    seen = set()
    # Give each multi-rule family a short first turn and replay its proposals
    # before deepening. Existing fast lanes still handle individual rules.
    # Repeated queries resume the SAME frontier, never divide child quotas.
    for turn in range(8 if frontier else 1):
        for kind,trial in search_module('exact_macro_reorder').priority_edits(
                rules,guide,clone,window_search=search,clock_context=context,
                source_mask=actual,
                group_filter=(lambda group,action:len(group)>1) if frontier else None):
            key = json.dumps(trial,sort_keys=True)
            if key not in seen:
                seen.add(key)
                yield 'projected_'+kind,trial
        if not frontier:
            break
        sessions = getattr(guide,'_native_window_cache',{}).get('frontiers',{}).values()
        stats = [session.diagnostic() for session in sessions]
        pending = sum(stat['pending'] for stat in stats)
        if diagnostic:
            diagnostic(dict(kind='window_frontier_batch',turn=turn+1,queries=len(stats),
                states=sum(stat['states'] for stat in stats),pending=pending,
                status='pending' if pending else 'scope_exhausted',source_path=samples.path_id),None)
        if not pending:
            break


def event_window_edits(rules, samples):
    # Existential windows from this ONE source path, not extra target labels.
    preferred = tuple(dict.fromkeys(k for rule in rules
        for k in condition_module().normalize(rule)['atoms']))
    selected,_ = samples.selections(rules)
    source_hits = 0
    for bits in selected:
        source_hits |= bits
    expanded_events = 0
    for group in samples.groups.values():
        if group & ~source_hits:
            expanded_events |= group
    donors = {index for index,bits in enumerate(selected) if bits & expanded_events}
    # This operator addresses expanded event witnesses. Other changes retain
    # their own broader generators; singleton windows need no duplicate query.
    if not donors:
        return
    def search(query, guide):
        return condition_module().window_guards(query.windows, query.negatives, guide,
            max_terms=6, max_candidates=4, branch_limit=16, max_states=256,
            preferred_atoms=preferred)
    for kind, trial in search_module('exact_macro_reorder').priority_edits(
            rules, samples, clone, window_search=search,
            group_filter=lambda group,action:any(index in donors for index in group)):
        yield kind.replace('window_guard_rebuild','window_event_rebuild'), trial


def window_edits(rules, samples):
    """The existing fast witness heuristic, retained as a proposal source.

    A failed restricted query never excludes the full observed-window search,
    which gets a separate turn once this cheaper neighbourhood stagnates.
    """
    preferred = tuple(dict.fromkeys(k for rule in rules
        for k in condition_module().normalize(rule)['atoms']))
    def search(p,n,guide):
        windows = [group & p for group in guide.groups.values() if group & p]
        return condition_module().window_guards(windows,n,guide,
            max_terms=6,max_candidates=4,branch_limit=16,max_states=256,
            preferred_atoms=preferred)
    for kind,trial in search_module('exact_macro_reorder').priority_edits(
            rules,samples,clone,condition_search=search):
        yield kind.replace('native_guard_rebuild','window_guard_rebuild'),trial


def global_edits(rules, samples, check_solver, diagnostic):
    yield from search_module('exact_macro_global').global_edits(
        rules, samples, clone, check_solver, diagnostic)


def family_edits(rules, samples, diagnostic):
    yield from search_module('exact_macro_family').family_edits(
        rules, samples, clone, condition_search=short_search, diagnostic=diagnostic)


def joint_edits(rules, samples, diagnostic, cost_bound=None):
    yield from search_module('exact_macro_joint').joint_edits(
        rules, samples, clone, condition_search=short_search,
        diagnostic=diagnostic, cost_bound=cost_bound)


def repair_edits(rules, atoms, replay, check):
    yield from search_module('exact_macro_repair').edits(
        rules, atoms, replay, check, limit=16)


def timing_edits(rules, samples, replay):
    yield from search_module('exact_macro_repair').timing_aliases(
        rules, samples, replay, limit=16)


def region_edits(rules, samples, check_solver, diagnostic, cost_bound=None, **options):
    yield from search_module('exact_macro_region').region_edits(
        rules, samples, clone, check_solver, diagnostic, cost_bound=cost_bound,**options)


def char_count(text):
    # Same as the macro draft's JavaScript .length: includes brackets, spaces
    # and newlines; no unsafe operator/decimal normalization after validation.
    return len(text.encode("utf-16-le")) // 2


def clone(rules):
    copied = []
    for rule in rules:
        value = {"action": rule["action"], "atoms": list(rule["atoms"])}
        if "any_atoms" in rule and 'ops' not in rule:
            value["any_atoms"] = list(rule["any_atoms"])
        if "ops" in rule:
            value["ops"] = list(rule["ops"])
        copied.append(value)
    return copied


def certified(replay):
    c = replay.get("comparison", {})
    return (replay.get("status") == "ok" and c.get("reproduced") is True
            and c.get("completed_full_replay") is True and not replay.get("truncated", False))


class Samples:
    """Columns from ONE certified trajectory, including its wait decisions."""
    def __init__(self, rows, atoms, actions, check, provenance=None):
        self.rows, self.atoms, self.actions, self.check = rows, atoms, actions, check
        self.provenance = dict(provenance or {})
        # A guide is never silently combined with another macro's path.
        path_hash = hashlib.sha256(json.dumps(self.provenance,
            sort_keys=True,separators=(',',':')).encode())
        self.all = (1 << len(rows)) - 1
        self.truth = [0] * len(atoms)
        self.executable = [0] * len(actions)
        self.allowed = [0] * len(actions)
        self.required, self.groups, self.event_rows = 0, {}, {}
        truth_rows = []
        for s, row in enumerate(rows):
            check()
            truth_row = bytes(row['truth'])
            truth_rows.append(truth_row)
            path_hash.update(truth_row)
            path_hash.update(json.dumps((row.get('cursor',s),row.get('time'),
                list(row['executable']),row['allowed'],row.get('wait_allowed',False),
                row.get('wait_next_time'),row.get('wait_clock_atoms')),
                separators=(',',':')).encode())
            bit = 1 << s
            cursor = row.get('cursor', s)
            self.event_rows[cursor] = self.event_rows.get(cursor, 0) | bit
            for a, value in enumerate(row["executable"]):
                if value:
                    self.executable[a] |= bit
            for a in row["allowed"]:
                self.allowed[a] |= bit
            if row["allowed"]:
                self.groups[row.get("cursor", s)] = self.groups.get(row.get("cursor", s), 0) | bit
                if not row.get("wait_allowed", False):
                    self.required |= bit
        if truth_rows and all(len(row) == len(atoms) for row in truth_rows):
            # Native observations are a rectangular byte matrix. Transpose
            # with C byte strides and parse binary digits in C instead of
            # doing rows * atoms Python big-int updates. Reverse row order
            # so bit s still denotes exactly row s. No path/candidate reuse.
            matrix = b''.join(reversed(truth_rows))
            for k in range(len(atoms)):
                if k % 32 == 0:
                    check()
                self.truth[k] = int(matrix[k::len(atoms)].translate(_TRUTH_DIGITS), 2)
        else:
            # Keep sparse/partial fixture behavior, including absent columns.
            for s, row in enumerate(truth_rows):
                check()
                for k, value in enumerate(row):
                    if value:
                        self.truth[k] |= 1 << s
        self.guards = {}
        self.hit_cache = {}
        self.atom_costs = [char_count(atom) for atom in condition_module().canonical_atomtexts(atoms)]
        self.action_costs = [char_count(f"/{'fcast' if a.get('fcast') else 'cast'} {a.get('name','')}")
                             for a in actions]
        self.short_features = None
        self.path_id = path_hash.hexdigest()

    def hit(self, rule):
        key = rule['action'], tuple(rule['atoms']), tuple(rule.get('any_atoms', ())), tuple(rule.get('ops', ())), 'ops' in rule
        cached = self.hit_cache.get(key)
        if cached is not None:
            return cached
        bits = self.executable[rule["action"]]
        if 'ops' in rule:
            bits &= condition_module().condition_mask(rule, self.truth, self.all)
            self.hit_cache[key] = bits
            return bits
        for k in rule["atoms"]:
            bits &= self.truth[k]
        if rule.get("any_atoms"):
            alternatives = 0
            for k in rule["any_atoms"]:
                alternatives |= self.truth[k]
            bits &= alternatives
        self.hit_cache[key] = bits
        return bits

    def rule_cost(self, rule):
        if 'ops' in rule:
            return self.action_costs[rule['action']] + condition_module().condition_cost(rule,self.atom_costs)
        terms = rule['atoms'] + rule.get('any_atoms', [])
        return self.action_costs[rule['action']] + (2 + sum(self.atom_costs[k]+1 for k in terms) if terms else 0)

    def selections(self, rules):
        remaining, selected = self.all, []
        for r in rules:
            bits = remaining & self.hit(r)
            selected.append(bits)
            remaining &= ~bits
        return selected, remaining

    def compatible(self, rules):
        remaining = self.all
        for rule in rules:
            bits = remaining & self.hit(rule)
            if bits & ~self.allowed[rule['action']]:
                return False
            remaining &= ~bits
        if remaining & self.required:
            return False
        return all(group & ~remaining for group in self.groups.values())

    def window_compatible(self, rules):
        """First observed witness per event; later old snapshots disappear.

        This is a proposal screen, not execution equivalence. A candidate
        choosing earlier within a tolerated window must not also be forced
        to cast at the source path's old deadline. Its actual new trajectory
        is always checked from time zero by the native oracle.
        """
        selections, remaining = self.selections(rules)
        selected, wrong = self.all & ~remaining, 0
        for rule, bits in zip(rules, selections):
            wrong |= bits & ~self.allowed[rule['action']]
        for cursor, rows in self.event_rows.items():
            self.check()
            choices = selected & rows
            if not choices:
                if self.groups.get(cursor, 0):
                    return False
                continue
            first = choices & -choices
            if first & wrong or not first & self.groups.get(cursor, 0):
                return False
        return True

    def learning_context(self, rules):
        """Pre-replay measurements on this guide's first observed witnesses.

        Old snapshots after a legal earlier witness are not failure labels.
        These measurements guide ranking only; no candidate is certified or
        removed here, and another candidate's trajectory is never consulted.
        """
        selections, remaining = self.selections(rules)
        selected, wrong, legal_hits = self.all & ~remaining, 0, 0
        for rule, bits in zip(rules, selections):
            self.check()
            action = rule['action']
            wrong |= bits & ~self.allowed[action]
            legal_hits |= self.hit(rule) & self.allowed[action]
        covered = forbidden = wait_conflicts = priority_conflicts = 0
        compatible = True
        for cursor, rows in self.event_rows.items():
            self.check()
            choices, window = selected & rows, self.groups.get(cursor, 0)
            if not choices:
                compatible &= not bool(window)
                continue
            first = choices & -choices
            legal = bool(first & window) and not bool(first & wrong)
            if legal:
                covered += 1
            else:
                compatible = False
                forbidden += 1
                index = first.bit_length() - 1
                wait_conflicts += bool(self.rows[index].get('wait_allowed', False))
                priority_conflicts += bool(first & wrong & legal_hits)
        return dict(window_coverage=covered/max(1, len(self.groups)),
                    forbidden_hits=forbidden, wait_conflicts=wait_conflicts,
                    priority_conflicts=priority_conflicts,
                    observed_rows=len(self.rows), static_compatible=compatible)

    def covers(self, positives, negatives):
        """Short alternative conjunctions; masks are guidance, not equivalence."""
        key = positives, negatives
        if key in self.guards:
            return self.guards[key]
        if not positives:
            return []
        if not negatives:
            return [[]]
        columns = []
        for k, truth in enumerate(self.truth):
            if k % 64 == 0:
                self.check()
            excluded = negatives & ~truth
            if positives & ~truth == 0 and excluded:
                columns.append((k, excluded))
        alternatives = [[k] for k, excluded in columns if excluded == negatives]
        # Several inexpensive covers with distinct first predicates. A new
        # feature can replace the whole guard, rather than only deleting terms.
        columns.sort(key=lambda p: (self.atom_costs[p[0]], -p[1].bit_count(), p[0]))
        for first in [None] + [k for k, _ in columns[:8]]:
            pending, guard = negatives, []
            if first is not None:
                guard.append(first)
                pending &= self.truth[first]
            while pending:
                self.check()
                viable = [(k, bits & pending) for k, bits in columns if bits & pending and k not in guard]
                if not viable:
                    break
                k, excluded = min(viable, key=lambda p: ((self.atom_costs[p[0]]+1)/p[1].bit_count(), p[0]))
                guard.append(k)
                pending &= ~excluded
            if not pending:
                # Remove sample-redundant terms within the proposed row. The
                # complete replay also checks the wake-up thresholds removed.
                for k in list(guard):
                    covered = 0
                    for other in guard:
                        if other != k:
                            covered |= negatives & ~self.truth[other]
                    if covered == negatives:
                        guard.remove(k)
                alternatives.append(sorted(guard))
        unique = {tuple(g): g for g in alternatives}
        result = sorted(unique.values(), key=lambda g: (sum(self.atom_costs[k]+1 for k in g), g))[:4]
        self.guards[key] = result
        return result


def branch_guide(replay, source, known=(), candidate_text=None):
    """Only the correctly aligned prefix of ONE reached candidate path.

    The native probe only emits correctly aligned pre-decision observations,
    including the first rejected decision. Never combine two failed paths or
    label a diverged suffix. Do not attach a teacher's unvisited suffix as
    unconditional constraints: even correct source states may be unreachable
    after a different tolerated prefix. The full frozen oracle still decides
    acceptance through the target's complete horizon.
    """
    if not replay:
        return None
    difference = replay.get('comparison', {}).get('first_difference') or {}
    if replay.get('status') != 'ok' or not replay.get('probe_failure') or 'index' not in difference:
        return None
    cursor = difference['index']
    prefix = [r for r in replay.get('rows', []) if r.get('cursor', cursor+1) <= cursor]
    if not prefix or any(len(r.get('truth', ())) != len(source.atoms) for r in prefix):
        return None
    signature = tuple((r['cursor'],round(r['time'],9),bytes(r['truth']),
                       tuple(r['executable']),tuple(r['allowed']),r.get('wait_allowed',False)) for r in prefix)
    if signature in known:
        return None
    guide = Samples(prefix,source.atoms,source.actions,source.check,
                    dict(source.provenance, candidate_fingerprint=replay.get('actual_fingerprint'),
                         macro_sha256=hashlib.sha256(candidate_text.encode()).hexdigest() if candidate_text is not None else None,
                         source_path=source.path_id, kind='aligned_failure'))
    guide.global_keep_mask = (1 << len(prefix))-1
    guide.guide_kind = 'one_aligned_candidate_prefix_only'
    return cursor,signature,guide


class BatchPlan:
    """Stable original row IDs let runtime failures split without index drift."""
    def __init__(self, rules, samples):
        self.original = clone(rules)
        self.current = {i:r for i,r in enumerate(clone(rules))}
        self.samples = samples
        self.units = sum(samples.rule_cost(r)+1 for r in rules)

    def rules(self):
        return [r for _,r in sorted(self.current.items())]

    def change(self, patches):
        self.samples.check()
        current, units = dict(self.current), self.units
        for i,replacement in patches.items():
            if i in current:
                units -= self.samples.rule_cost(current.pop(i))+1
            if replacement is not None:
                current[i] = replacement
                units += self.samples.rule_cost(replacement)+1
        if units >= self.units or not self.samples.compatible([r for _,r in sorted(current.items())]):
            return False
        self.current, self.units = current, units
        return True

    def patches(self):
        return [(i,self.current.get(i)) for i,r in enumerate(self.original) if self.current.get(i) != r]

    def groups(self):
        groups = {}
        for i,r in sorted(self.current.items()):
            groups.setdefault(r['action'],[]).append(i)
        return groups.values()


def clusters(ids):
    """Whole action region first, then smaller disjoint chunks, not all pairs."""
    if len(ids) < 2:
        return
    yield ids
    for width in (8,4,2):
        if width < len(ids):
            for start in range(0,len(ids),width):
                if len(ids[start:start+width]) > 1:
                    yield ids[start:start+width]


def basic_batch(rules, samples, actions):
    plan = BatchPlan(rules,samples)
    chosen,_ = samples.selections(rules)
    # No observed selection is not a deletion proof: these rows can supply
    # wake-up thresholds. The combined proposal still needs full replay.
    plan.change({i:None for i,bits in enumerate(chosen) if not bits})
    for i in list(plan.current):
        r = plan.current.get(i)
        if r and actions[r['action']]['fcast']:
            normal = next((a for a,v in enumerate(actions) if not v['fcast'] and v['name']==actions[r['action']]['name']),None)
            if normal is not None:
                replacement = clone([r])[0]
                replacement['action'] = normal
                plan.change({i:replacement})
    for i in sorted(plan.current,key=lambda i:-samples.rule_cost(plan.current[i])):
        plan.change({i:None})
    for i in list(plan.current):
        if '|' in plan.current[i].get('ops',[]):
            continue
        for atom in sorted(plan.current[i]['atoms'],key=lambda k:-samples.atom_costs[k]):
            r = plan.current[i]
            replacement = clone([r])[0]
            replacement['atoms'] = [k for k in r['atoms'] if k!=atom]
            replacement.pop('ops',None)
            plan.change({i:replacement})
    for ids in list(plan.groups()):
        for group in clusters(ids):
            live = [i for i in group if i in plan.current]
            if len(live) < 2 or any(complex_guard(plan.current[i]) for i in live):
                continue
            guard = set(plan.current[live[0]]['atoms'])
            for i in live[1:]:
                guard.intersection_update(plan.current[i]['atoms'])
            patches = {i:None for i in live[1:]}
            patches[live[0]] = {'action':plan.current[live[0]]['action'],'atoms':sorted(guard)}
            plan.change(patches)
    return plan.patches()


def feature_batch(rules, samples):
    plan = BatchPlan(rules,samples)
    for ids in list(plan.groups()):
        for group in clusters(ids):
            live = [i for i in group if i in plan.current]
            if len(live) < 2 or any(complex_guard(plan.current[i]) for i in live):
                continue
            keys = sorted(plan.current)
            chosen,_ = samples.selections(plan.rules())
            selected = dict(zip(keys,chosen))
            positives = 0
            for i in live:
                positives |= selected[i]
            a = plan.current[live[0]]['action']
            for position in (live[0],live[-1]):
                earlier = 0
                for i,bits in selected.items():
                    if i < position:
                        earlier |= bits
                negatives = samples.all & ~earlier & samples.executable[a] & ~samples.allowed[a]
                for guard in samples.covers(positives,negatives):
                    patches = {i:None for i in live if i!=position}
                    patches[position] = {'action':a,'atoms':guard}
                    if plan.change(patches):
                        break
                if len([i for i in live if i in plan.current]) < len(live):
                    break
    # Apply short replacements across many independent action rows in one
    # proposal. Cost checks precede the selection check and avoid rendering.
    for i in list(sorted(plan.current)):
        if complex_guard(plan.current[i]):
            continue
        keys = sorted(plan.current)
        chosen,_ = samples.selections(plan.rules())
        selected = dict(zip(keys,chosen))
        earlier = 0
        for key,bits in selected.items():
            if key < i:
                earlier |= bits
        a = plan.current[i]['action']
        negatives = samples.all & ~earlier & samples.executable[a] & ~samples.allowed[a]
        for guard in samples.covers(selected[i],negatives):
            if plan.change({i:{'action':a,'atoms':guard}}):
                break
    return plan.patches()


def simple_edits(rules, actions, check):
    for i, rule in enumerate(rules):
        check()
        yield "remove_rule", rules[:i] + rules[i+1:]
        if actions[rule["action"]]["fcast"]:
            normal = next((a for a, v in enumerate(actions) if not v["fcast"]
                           and v["name"] == actions[rule["action"]]["name"]), None)
            if normal is not None:
                trial = clone(rules)
                trial[i]["action"] = normal
                yield "fcast_to_cast", trial
        for k in range(len(rule["atoms"])):
            trial = clone(rules)
            trial[i] = remove_chain_atom(rule,k) if 'ops' in rule else clone([rule])[0]
            if 'ops' not in rule:
                trial[i]['atoms'].pop(k)
            yield "remove_atom", trial
        # Removing an OR alternative narrows this guard. The final alternative
        # is retained; deleting the line handles an always-false guard instead.
        if len(rule.get("any_atoms", [])) > 1:
            for k in range(len(rule["any_atoms"])):
                check()
                trial = clone(rules)
                trial[i]["any_atoms"].pop(k)
                if len(trial[i]["any_atoms"]) == 1:
                    trial[i]["atoms"].extend(trial[i].pop("any_atoms"))
                yield "remove_or_atom", trial
        for j in range(i+1, len(rules)):
            if (rules[j]["action"] == rule["action"]
                    and not complex_guard(rule) and not complex_guard(rules[j])):
                trial = clone(rules)
                trial[i] = {"action":rule["action"],"atoms":sorted(set(rule["atoms"]) & set(rules[j]["atoms"]))}
                trial.pop(j)
                yield "merge_same_action", trial


def feature_edits(rules, samples):
    selections, _ = samples.selections(rules)
    remaining = samples.all
    for i, rule in enumerate(rules):
        samples.check()
        a = rule["action"]
        negatives = remaining & samples.executable[a] & ~samples.allowed[a]
        if not complex_guard(rule):
            for guard in samples.covers(selections[i], negatives):
                trial = clone(rules)
                trial[i] = {'action':a,'atoms':guard}
                yield "replace_guard", trial
        remaining &= ~selections[i]
    # Joint replacement + deletion + relocation. Intermediate standalone edits
    # need not pass: the whole group is handed to the executor atomically.
    groups = {}
    for i, rule in enumerate(rules):
        groups.setdefault(rule["action"], []).append(i)
    for a, positions in groups.items():
        if any(complex_guard(rules[i]) for i in positions):
            continue
        for left, i in enumerate(positions):
            for j in positions[left+1:]:
                samples.check()
                positives = selections[i] | selections[j]
                for position in (i, j):
                    earlier = 0
                    for bits in selections[:position]:
                        earlier |= bits
                    negatives = samples.all & ~earlier & samples.executable[a] & ~samples.allowed[a]
                    for guard in samples.covers(positives, negatives):
                        trial = clone(rules)
                        trial[position] = {'action':a,'atoms':guard}
                        trial.pop(j if position == i else i)
                        yield "group_replace_and_move", trial


def chain_leaf_edits(rules, samples, *, equal_cost=False):
    """Shorten mixed chains in context, including a whole conjunction if valid."""
    selected, _ = samples.selections(rules)
    remaining = samples.all
    for index, rule in enumerate(rules):
        samples.check()
        action = rule['action']
        negatives = remaining & samples.executable[action] & ~samples.allowed[action]
        if complex_guard(rule):
            for guard in condition_module().shorter_leaves(rule, selected[index], negatives, samples,
                                                          equal_cost=equal_cost):
                trial = clone(rules)
                trial[index] = dict(guard, action=action)
                if samples.compatible(trial):
                    yield 'replace_chain_leaf', trial
            if not equal_cost and selected[index]:
                for leaves in samples.covers(selected[index],negatives):
                    replacement = dict(action=action,atoms=list(leaves))
                    if samples.rule_cost(replacement) >= samples.rule_cost(rule):
                        continue
                    trial = clone(rules)
                    trial[index] = replacement
                    if samples.compatible(trial):
                        yield 'replace_chain_guard', trial
        remaining &= ~selected[index]


def chain_leaf_bridges(rules, samples, limit=8):
    """Prefer changing clock dependencies over spelling-only alternatives.

    This orders a finite exploration turn, never certifies a clock removal.
    An equally long rule using a resource predicate can reach a different
    valid trajectory whose conditions can then be shortened.
    """
    candidates = []
    for _, trial in chain_leaf_edits(rules, samples, equal_cost=True):
        for index, (old, new) in enumerate(zip(rules, trial)):
            if old == new:
                continue
            before = condition_module().normalize(old)['atoms']
            after = condition_module().normalize(new)['atoms']
            changes = [(a, b) for a, b in zip(before, after) if a != b]
            if not changes:
                continue
            a, b = changes[0]
            old_clock, new_clock = ('bufftime:' in samples.atoms[k] for k in (a, b))
            rank = 0 if old_clock and not new_clock else 1 if old_clock else 2
            candidates.append(((rank, index, b, a), trial))
            break
    for _, trial in sorted(candidates, key=lambda item: item[0])[:limit]:
        samples.check()
        yield 'bridge_chain_leaf', trial


def or_edits(rules, samples, pair_limit=128):
    """Exact guard unions in the native right-associative macro language.

    P&A | P&B is written P&A|B, meaning P AND (A OR B). Each remainder
    must be one literal; arbitrary ORs of conjunctions need grouping the game
    grammar cannot express. The pair bound controls this search pass only.
    """
    groups = {}
    for i, rule in enumerate(rules):
        groups.setdefault(rule['action'], []).append(i)
    pairs = 0
    for action, positions in groups.items():
        for offset, i in enumerate(positions):
            for j in positions[offset+1:]:
                samples.check()
                if pairs >= pair_limit:
                    return
                pairs += 1
                left, right = rules[i], rules[j]
                if '|' in left.get('ops',[]) or '|' in right.get('ops',[]):
                    continue
                left_prefix, right_prefix = set(left['atoms']), set(right['atoms'])
                left_any, right_any = left.get('any_atoms'), right.get('any_atoms')
                if left_any or right_any:
                    prefix = left_prefix if left_any else right_prefix
                    if ((left_any and left_prefix != prefix)
                            or (right_any and right_prefix != prefix)):
                        continue
                    left_tail = list(left_any) if left_any else sorted(left_prefix - prefix)
                    right_tail = list(right_any) if right_any else sorted(right_prefix - prefix)
                    if ((not left_any and (not prefix <= left_prefix or len(left_tail) != 1))
                            or (not right_any and (not prefix <= right_prefix or len(right_tail) != 1))):
                        continue
                else:
                    prefix = left_prefix & right_prefix
                    left_tail, right_tail = sorted(left_prefix-prefix), sorted(right_prefix-prefix)
                    if len(left_tail) != 1 or len(right_tail) != 1:
                        continue
                suffix = sorted(set(left_tail) | set(right_tail))
                if len(suffix) < 2:
                    continue
                merged = {'action':action, 'atoms':sorted(prefix), 'any_atoms':suffix}
                if samples.rule_cost(merged)+1 >= samples.rule_cost(left)+samples.rule_cost(right)+2:
                    continue
                for position in (i, j):
                    samples.check()
                    trial = clone(rules)
                    trial[position] = clone([merged])[0]
                    trial.pop(j if position == i else i)
                    # Relocating an exact union can preempt an intervening skill.
                    # Check the actual ordered program, then require real replay.
                    if samples.compatible(trial):
                        yield 'merge_or_suffix', trial


def local_rewrites(rules, samples, render, check_solver, diagnostic):
    """Finite, weighted SAT over small coupled windows; never global UNSAT.

    Choose actions, guards and order jointly, minimizing copyable characters
    by tightening a cost bound. Fixed outside rules participate in selection.
    Per-check timeouts yield UNKNOWN and let other windows run.
    """
    chosen, _ = samples.selections(rules)
    for start in range(0, len(rules)-1):
        samples.check()
        window = rules[start:start+3]
        if any(complex_guard(rule) for rule in window):
            continue
        region = 0
        for bits in chosen[start:start+len(window)]:
            region |= bits
        if not region:
            continue
        action_ids = sorted({r["action"] for r in window})
        for a in list(action_ids):
            v = samples.actions[a]
            if v["fcast"]:
                action_ids.extend(k for k, other in enumerate(samples.actions)
                                  if not other["fcast"] and other["name"] == v["name"] and k not in action_ids)
        # Preserve existing literals, and add short distinguishing features.
        old = {k for r in window for k in r["atoms"]}
        if samples.short_features is None:
            signatures = {}
            for k,bits in enumerate(samples.truth):
                if bits != 0 and bits != samples.all:
                    previous = signatures.get(bits)
                    if previous is None or samples.atom_costs[k] < samples.atom_costs[previous]:
                        signatures[bits] = k
            samples.short_features = sorted(signatures.values(),key=lambda k:(samples.atom_costs[k],k))[:24]
        pool = samples.short_features
        pool = sorted(old | set(pool))
        if len(pool) > 64:
            diagnostic({"kind":"local_sat", "start":start, "status":"skipped_large_window"}, None)
            continue
        solver = z3.Solver()
        solver.set(timeout=1000, random_seed=0)
        slots, variables, weights = [], [], []
        for s in range(len(window)):
            acts = {a:z3.Bool(f"a_{s}_{a}") for a in action_ids}
            cond = {k:z3.Bool(f"c_{s}_{k}") for k in pool}
            enabled = z3.Bool(f"on_{s}")
            has_guard = z3.Bool(f"guard_{s}")
            solver.add(z3.PbEq([(v,1) for v in acts.values()],1))
            solver.add(has_guard == z3.Or(list(cond.values())))
            solver.add(z3.Implies(z3.Not(enabled), z3.Not(has_guard)))
            if s:
                solver.add(z3.Implies(enabled, slots[-1][2]))
            if cond:
                solver.add(z3.PbLe([(v,1) for v in cond.values()],3))
            for a, v in acts.items():
                weight = char_count(f"/{'fcast' if samples.actions[a]['fcast'] else 'cast'} {samples.actions[a]['name']}")+1
                weights.append((z3.And(enabled,v),weight))
            weights.extend((v,char_count(samples.atoms[k])+1) for k,v in cond.items())
            weights.append((has_guard,2))
            variables.extend([enabled] + list(acts.values()) + list(cond.values()))
            slots.append((acts,cond,enabled))
        # Each enabled line pays its newline, including the last. This additive
        # metric differs by a fixed one character for every nonempty program.
        ceiling = char_count(render(window))+1
        solver.add(z3.Or([slot[2] for slot in slots]))
        solver.add(z3.PbLe(weights, ceiling-1))
        prefix = rules[:start]
        suffix = rules[start+len(window):]
        _, prefix_remaining = samples.selections(prefix)
        suffix_chosen, _ = samples.selections(suffix)
        suffix_masks = [(r["action"],bits) for r,bits in zip(suffix,suffix_chosen) if bits]
        # Earlier fixed rules already settle these observations correctly.
        # Do not re-encode their local slots, nor repeatedly recompute guards
        # for every row/window. Keep their cursor witnesses as constants.
        satisfied = {cursor for cursor,bits in samples.groups.items() if bits & ~prefix_remaining}
        hits_by_cursor, encoded = {}, {}
        for index, row in enumerate(samples.rows):
            samples.check()
            bit = 1 << index
            if not prefix_remaining & bit:
                continue
            suffix_hit = next((a for a,bits in suffix_masks if bits&bit), None)
            key = (tuple(bool(samples.truth[k]&bit) for k in pool),
                   tuple(bool(samples.executable[a]&bit) for a in action_ids),
                   tuple(row["allowed"]), row.get("wait_allowed",not row["allowed"]), suffix_hit)
            if key not in encoded:
                earlier = z3.BoolVal(False)
                for acts,cond,on in slots:
                    executable = z3.Or([v for a,v in acts.items() if samples.executable[a]&bit])
                    false_terms = [v for k,v in cond.items() if not samples.truth[k]&bit]
                    hit = z3.And(on,executable,z3.Not(z3.Or(false_terms)))
                    selected = z3.And(hit,z3.Not(earlier))
                    solver.add(z3.Implies(selected,z3.Or([v for a,v in acts.items() if a in row["allowed"]])))
                    earlier = z3.Or(earlier,hit)
                valid_suffix = suffix_hit is not None and suffix_hit in row["allowed"]
                if suffix_hit is not None and not valid_suffix:
                    solver.add(earlier)
                if row["allowed"] and not row.get("wait_allowed",False) and not valid_suffix:
                    solver.add(earlier)
                encoded[key] = z3.Or(earlier,z3.BoolVal(valid_suffix))
            if row["allowed"] and row.get("cursor",index) not in satisfied:
                hits_by_cursor.setdefault(row.get("cursor",index),[]).append(encoded[key])
        for hits in hits_by_cursor.values():
            solver.add(z3.Or(hits))
        # A few different models form a local beam; runtime rejects models
        # which changed scheduling. Their rows never become universal labels.
        for model_index in range(3):
            started = time.perf_counter()
            status = check_solver(solver)
            info = {"kind":"local_sat", "start":start, "model":model_index,
                    "slots":len(slots), "atoms":len(pool), "status":str(status),
                    "solve_ms":(time.perf_counter()-started)*1000}
            if status == z3.unknown:
                info["reason"] = solver.reason_unknown()
            diagnostic(info, solver.to_smt2() if getattr(diagnostic, 'record_smt', True) else None)
            if status != z3.sat:
                break
            model = solver.model()
            replacement = []
            for acts,cond,on in slots:
                if z3.is_true(model.eval(on)):
                    a = next(a for a,v in acts.items() if z3.is_true(model.eval(v)))
                    replacement.append({"action":a,"atoms":[k for k,v in cond.items() if z3.is_true(model.eval(v))]})
            yield "local_sat_rewrite", clone(prefix) + replacement + clone(suffix)
            solver.add(z3.Or([v != model.eval(v,model_completion=True) for v in variables]))


def compress(rules, atoms, actions, baseline, render, verify, check,
             check_solver, accepted, progress, diagnostic, budget=lambda: True,
             feedback=None, deep_search=False, joint_search=False, region_search=False,
             learning=None, contract=None, exchange_search=False, window_frontier=False,
             record_trials=True):
    if not certified(baseline):
        raise ValueError("compression requires a full certified baseline")
    best, best_replay = clone(rules), baseline
    initial = char_count(render(best))
    seen, records = {render(best)}, []
    branches, branch_seen = [], set()
    repairs, repair_seen, repair_paths = [], set(), {}
    feedback_source = None
    binding = {k:baseline.get(k) for k in ('version','mount','horizon','target_fingerprint')}
    binding['acceptance'] = {k:baseline.get('comparison',{}).get(k)
                            for k in ('acceptance','time_tolerance_seconds')}
    binding['catalog'] = hashlib.sha256(json.dumps((atoms,actions),sort_keys=True).encode()).hexdigest()
    if contract is not None:
        binding['frozen_contract'] = contract
    contract_id = hashlib.sha256(json.dumps(binding,sort_keys=True).encode()).hexdigest()
    active_path = None
    alternatives = []
    prepared, observations = {}, []
    learning_module = search_module('exact_macro_learning') if learning is not None else None
    summary = {"status":"running", "initial_chars":initial, "best_chars":initial,
               "saved_chars":0, "trial_count":0, "accepted_count":0,
               "batch_trials":0, "max_batch_rules":0,
               "family_trials":0, "exchange_trials":0, "growing_bridges":0,
               "schedule_trials":0, "projected_window_trials":0,
               "joint_trials":0,
               "joint_branches":0,
               "repair_trials":0, "repair_expansions":0,
               "window_trials":0,
               "timing_trials":0,
               "global_branches":0,
               "region_trials":0, "certified_alternatives":0,
               "candidate_ms":0.0, "sample_ms":0.0, "verify_wall_ms":0.0, "feedback_wall_ms":0.0,
               "contract_id":contract_id, "pipeline_version":"20261007-clock-aware-frontier-v3",
               "window_frontier":window_frontier,
               "release_window_observations":any(row.get('release_windows') for row in baseline.get('rows',[])),
               "exchange_search":exchange_search,
               "region_search":region_search,
               "learning_enabled":bool(learning is not None and learning.enabled),
               "adaptive_enabled":bool(learning is not None and learning.bandit_enabled),
               "deep_search":deep_search,
               "joint_search":joint_search or deep_search,
               "scope":"single page; adaptive batches, native right-associated AND/OR guards, observed event first-witness window queries, first-divergence clock/priority repairs, same-action subset rebuilds to 2/3 rules, global insertion rebuilds (24 candidates/pass), beam width 4/depth 2, SAT windows 3x3; contextual leaf replacements and fully certified equal-length bridges" + ("; optional joint native-chain regions on separate reached/certified paths" if region_search else "") + ("; experimental competing-action rebuilds with up to 12 separate counterexample branches" if joint_search or deep_search else "") + ("; experimental whole-program beam with up to 12 separate counterexample branches" if deep_search else "")}
    progress(dict(summary))

    def guide_for(replay, program, kind='certified'):
        started = time.perf_counter()
        guide = Samples(replay['rows'],atoms,actions,check,dict(contract_id=contract_id,
            macro_sha256=hashlib.sha256(render(program).encode()).hexdigest(),kind=kind))
        guide.source_rules = clone(program)
        summary['sample_ms'] += (time.perf_counter()-started)*1000
        return guide

    def candidates(iterable):
        iterator = iter(iterable)
        while True:
            check()
            started = time.perf_counter()
            try:
                proposal = next(iterator)
            except StopIteration:
                summary['candidate_ms'] += (time.perf_counter()-started)*1000
                return
            summary['candidate_ms'] += (time.perf_counter()-started)*1000
            yield proposal

    def prepare(kind,trial,text,cost):
        if learning is None:
            return None
        path_id = getattr(active_path,'path_id',contract_id)
        key = (text,path_id,summary['best_chars'])
        if key not in prepared:
            context = active_path.learning_context(trial) if active_path is not None else None
            source = getattr(active_path, 'source_rules', best)
            values = learning_module.features(source,trial,atoms,summary['best_chars'],cost,context)
            prepared[key] = learning.prepare(hashlib.sha256(text.encode()).hexdigest(),path_id,
                                            kind,values,summary['best_chars'],cost)
        return prepared[key]

    def complete_observation(replay):
        rows = replay.get('rows', [])
        return bool(rows) and all(len(row.get('truth', ())) == len(atoms) for row in rows)

    def observe_failure(text, replay, trial, kind, force=False):
        if complete_observation(replay) and not force:
            return replay
        if feedback is None:
            return None
        started = time.perf_counter()
        reached = feedback(text, replay, trial, kind)
        summary['feedback_wall_ms'] += (time.perf_counter()-started)*1000
        return reached

    def evaluate(kind, trial, allow_equal=False, batch_rules=0, repair_depth=0,
                 exploration_ceiling=None):
        nonlocal best,best_replay
        check()
        text = render(trial)
        cost = char_count(text)
        ceiling = summary['best_chars'] if exploration_ceiling is None else exploration_ceiling
        if text in seen or cost > ceiling or (cost == summary["best_chars"] and not allow_equal):
            return None
        seen.add(text)
        if not budget():
            summary["status"] = "budget_exhausted"
            return None
        summary["trial_count"] += 1
        if kind.startswith('exchange_'):
            summary['exchange_trials'] += 1
        if kind.startswith('schedule_'):
            summary['schedule_trials'] += 1
        if kind.startswith('projected_'):
            summary['projected_window_trials'] += 1
        if kind.startswith('family_'):
            summary['family_trials'] += 1
        if kind.startswith('joint_'):
            summary['joint_trials'] += 1
        if kind.startswith('repair_'):
            summary['repair_trials'] += 1
        if kind.startswith('window_'):
            summary['window_trials'] += 1
        if kind.startswith('region_'):
            summary['region_trials'] += 1
        if kind == 'beam_timing_alias':
            summary['timing_trials'] += 1
        summary["method"] = kind
        summary['last_batch_rules'] = batch_rules
        if batch_rules:
            summary['batch_trials'] += 1
        progress(dict(summary))
        learning_record = prepare(kind,trial,text,cost)
        started_verify = time.perf_counter()
        replay = verify(text, summary["trial_count"], kind)
        summary['verify_wall_ms'] += (time.perf_counter()-started_verify)*1000
        passed = certified(replay)
        if passed and cost > summary['best_chars']:
            summary['growing_bridges'] += 1
        if learning_record is not None:
            observation = learning.feedback(learning_record,replay,binding=learning_record['binding'])
            observations.append(observation)
            # Local diagnostics can be used for offline training. No macro
            # body/state is included, and the public summary omits this event.
            diagnostic({'kind':'learning_observation', 'record':learning_record,
                        'feedback':observation},None)
            summary['learning_labels'] = learning.labels
        if record_trials:
            records.append({"trial":summary["trial_count"],"kind":kind,"chars":cost,
                            "batch_rules":batch_rules,
                            "accepted":passed and cost < summary["best_chars"],
                            "source_path":getattr(active_path,'path_id',None),
                            "comparison":replay.get("comparison"),"timings_ms":replay.get("timings_ms",{})})
        # A timing error calls for clock repair; a short, otherwise promising
        # program may need one missing priority context. Bad early structural
        # proposals go back to construction, avoiding long blind repair chains.
        comparison = replay.get('comparison', {})
        divergence = comparison.get('first_difference') or {}
        expected, actual = divergence.get('expected') or {}, divergence.get('actual') or {}
        prefix = comparison.get('acceptance_prefix', 0)
        same_skill = bool(expected.get('skill_id') is not None
                          and expected.get('skill_id') == actual.get('skill_id'))
        repairable = (not passed and replay.get('probe_failure')
                      and repair_depth < 12
                      and cost < summary['best_chars']
                      and (same_skill or prefix >= max(8, comparison.get('target_count', 0)//3)))
        search_branch = kind.startswith(('global_', 'joint_', 'region_')) and feedback_source is not None
        reached = None
        if not passed and search_branch:
            # Text deduplication already prevents repeating a full candidate.
            # A different macro must keep its own actual macro_line and states;
            # equal action fingerprints do not authorize sharing its feedback.
            reached = observe_failure(text, replay, summary['trial_count'], kind,
                                      force=feedback is not None)
            joint = kind.startswith('joint_')
            proposal = branch_guide(reached,feedback_source,() if joint else branch_seen,
                                    candidate_text=text)
            if proposal is not None:
                cursor,signature,guide = proposal
                guide.source_rules = clone(trial)
                identity = (signature,text) if joint else signature
                if identity not in branch_seen:
                    branch_seen.add(identity)
                    branches.append((cursor,identity,guide,clone(trial)))
                    branches.sort(key=lambda item:-item[0])
                    del branches[4:]
        if repairable and (reached is not None or complete_observation(replay) or feedback is not None):
            # Fingerprints diversify exploration only. They never establish
            # state equivalence, share labels, or reject a legal macro.
            observation = reached if reached is not None else replay
            fingerprint = observation.get('actual_fingerprint', text)
            repeat = repair_paths.get(fingerprint, 0)
            repair_paths[fingerprint] = repeat+1
            drift = abs(actual.get('time', 0)-expected.get('time', 0)) if same_skill else float('inf')
            # Rank and trim with the thin verdict. Fetch full truth columns only
            # if this seed is actually expanded; discarded seeds need no replay.
            repairs.append((prefix, -repeat, -drift, -cost, text, clone(trial),
                            observation, repair_depth, summary['trial_count'], kind))
            repairs.sort(key=lambda item:item[:5], reverse=True)
            del repairs[12:]
        if passed and cost == summary['best_chars'] and region_search:
            alternatives.append((clone(trial),replay))
            del alternatives[:-4]
            summary['certified_alternatives'] += 1
        if passed and cost < summary["best_chars"]:
            best,best_replay = clone(trial),replay
            summary.update(best_chars=cost,saved_chars=initial-cost,accepted_count=summary["accepted_count"]+1)
            summary['max_batch_rules'] = max(summary['max_batch_rules'],batch_rules)
            accepted(text,replay,dict(summary))
            progress(dict(summary))
            alternatives.clear()
            if learning is not None:
                learning.best_changed(hashlib.sha256(text.encode()).hexdigest())
        return replay if passed else None

    def repair_pass_inner():
        """A finite local turn, with every descendant replayed independently."""
        nonlocal active_path
        initial_cost = summary['best_chars']
        start_trials = summary['repair_trials']
        expanded = 0
        while repairs and expanded < 24 and summary['repair_trials']-start_trials < 96:
            check()
            _, _, _, _, text, seed, replay, depth, trial_number, kind = repairs.pop(0)
            if text in repair_seen:
                continue
            repair_seen.add(text)
            replay = observe_failure(text, replay, trial_number, kind)
            if replay is None:
                continue
            active_path = guide_for(replay,seed,'aligned_repair_prefix')
            expanded += 1
            summary['repair_expansions'] += 1
            diagnostic({'kind':'first_divergence_repair', 'depth':depth,
                        'cursor':replay['comparison'].get('acceptance_prefix', 0)}, None)
            for kind, trial in repair_edits(seed, atoms, replay, check):
                evaluate(kind, trial, repair_depth=depth+1)
                if summary['best_chars'] < initial_cost:
                    repairs.clear()
                    return
                if summary['repair_trials']-start_trials >= 96:
                    break

    def repair_pass():
        nonlocal active_path
        previous = active_path
        try:
            repair_pass_inner()
        finally:
            active_path = previous

    def ordered(iterable, cost_ceiling=None):
        unique = {}
        for kind,trial in candidates(iterable):
            check()
            text = render(trial)
            ceiling = summary['best_chars'] if cost_ceiling is None else cost_ceiling
            if text not in seen and char_count(text) < ceiling:
                unique.setdefault(text,(char_count(text),text,kind,trial))
        items = sorted(unique.values(),key=lambda p:(p[0],p[1]))
        if learning is not None:
            ranked = learning.rank([prepare(kind,trial,text,cost) for cost,text,kind,trial in items])
            by_text = {hashlib.sha256(text.encode()).hexdigest():(kind,trial) for _,text,kind,trial in items}
            return [by_text[record['binding']['candidate_hash']] for record in ranked]
        return [(kind,trial) for _,_,kind,trial in items]

    def ranked_stream(iterable, lookahead=16):
        """Bound model lookahead without exhausting expensive generators.

        Every generated candidate remains eligible. A new incumbent ends this
        pass as before; ranking cannot remove a candidate or reuse its verdict.
        """
        iterator = iter(candidates(iterable))
        exhausted = False
        while not exhausted:
            batch = {}
            for _ in range(lookahead):
                try:
                    kind, trial = next(iterator)
                except StopIteration:
                    exhausted = True
                    break
                text = render(trial)
                cost = char_count(text)
                if text not in seen and cost < summary['best_chars']:
                    batch.setdefault(text, (kind,trial,cost))
            if batch:
                ranked = learning.rank([prepare(kind,trial,text,cost)
                    for text,(kind,trial,cost) in batch.items()])
                lookup = {hashlib.sha256(text.encode()).hexdigest():(kind,trial)
                          for text,(kind,trial,_) in batch.items()}
                for record in ranked:
                    yield lookup[record['binding']['candidate_hash']]

    def strategy_pass(tasks,guide):
        names = list(tasks)
        if learning is not None:
            names = learning.strategy_order(names,dict(
                duplicate_fraction=1-len({r['action'] for r in best})/max(1,len(best)),
                complexity_fraction=sum(complex_guard(r) for r in best)/max(1,len(best))))
        old_cost = summary['best_chars']
        for name in names:
            check()
            started,offset = time.perf_counter(),len(observations)
            # Family generation deliberately interleaves actions/shapes.
            # Preserve that fairness unless optional ranking is enabled.
            stream = (ranked_stream(tasks[name]()) if learning is not None and learning.enabled
                      else candidates(tasks[name]()))
            for kind,trial in stream:
                evaluate(kind,trial)
                if summary['best_chars'] < old_cost:
                    break
            elapsed = (time.perf_counter()-started)*1000
            summary.setdefault('strategy_ms',{}).setdefault(name,0.0)
            summary['strategy_ms'][name] += elapsed
            if learning is not None:
                diagnostic(learning.strategy_feedback(name,observations[offset:],elapsed),None)
            if summary['best_chars'] < old_cost:
                return

    def region_pass(seed, guide):
        nonlocal feedback_source, active_path
        previous_source, previous_path = feedback_source, active_path
        feedback_source, active_path = guide, guide
        old_cost = summary['best_chars']
        old_trials = summary['region_trials']
        try:
            # Short fair turns rotate regions before increasing expression
            # size. Equal-cost certified models are bridge paths, not a new
            # user best. These are per-turn limits, never language bounds.
            for turn in range(3):
                for kind,trial in candidates(region_edits(seed,guide,check_solver,diagnostic,
                        cost_bound=old_cost+2,allow_equal=True,region_offset=2*turn,
                        timeout_ms=(100,300,500)[turn],max_terms=(3,3,4)[turn],
                        max_models=2 if turn else 1,
                        **({'structural_prior':learning.structural_prior}
                           if learning is not None and getattr(learning,'structural_prior',None) else {}))):
                    evaluate(kind,trial,allow_equal=True)
                    if summary['best_chars'] < old_cost:
                        return
            if summary['region_trials'] > old_trials:
                repair_pass()
        finally:
            feedback_source, active_path = previous_source, previous_path

    def exchange_pass():
        """Finite growth/frontier exploration; only shorter certified results publish.

        Bridge programs use their OWN full native trajectory. They never change
        the target, the best certificate, or the ordinary cost admission gate.
        """
        nonlocal active_path
        engine = search_module('exact_macro_exchange')
        initial_cost = summary['best_chars']
        source, source_replay = clone(best), best_replay
        guide = guide_for(source_replay, source, 'certified_exchange_source')
        active_path = guide
        start_trials = summary['exchange_trials']
        def proposals(seed, path, growth=0, limit=48, minimum_delta=None):
            for kind, trial, info in engine.proposals(seed, path, clone, condition_module(),
                                                    growth=growth, limit=limit,minimum_delta=minimum_delta):
                for query in getattr(path,'exchange_cover_queries',[]):
                    diagnostic(dict(kind='exchange_cover_query',source_path=path.path_id,**query),None)
                path.exchange_cover_queries=[]
                diagnostic(dict(kind=kind, **info), None)
                yield kind, trial
            for query in getattr(path,'exchange_cover_queries',[]):
                diagnostic(dict(kind='exchange_cover_query',source_path=path.path_id,**query),None)
            path.exchange_cover_queries=[]
        for kind, trial in candidates(proposals(source, guide)):
            evaluate(kind, trial)
            if summary['best_chars'] < initial_cost:
                return
        # Local exploration breadth, not a macro language or task time limit.
        growth = min(48, max(16, initial_cost // 8))
        ceiling = initial_cost + growth
        frontier, expanded = [], 0
        for kind, trial in candidates(proposals(source, guide, growth, limit=24,minimum_delta=1)):
            if char_count(render(trial)) < initial_cost:
                continue
            # Compose first using ONLY the source trajectory's bitsets. A
            # speculative seed is not a new path or a source of new labels.
            # Only finished smaller programs from this algebraic lookahead
            # need replay; no simulation is used to test individual atoms.
            for child_kind, child in candidates(proposals(trial, guide, limit=16)):
                if char_count(render(child)) < initial_cost:
                    evaluate('exchange_static_'+child_kind, child)
                    if summary['best_chars'] < initial_cost:
                        return
            # Same-clock bridges already received algebraic lookahead on the
            # existing path. Reserve additional native replays for candidates
            # which can actually change time-threshold scheduling.
            if engine.clocks_in(trial,guide,condition_module()) == engine.clocks_in(source,guide,condition_module()):
                continue
            alternate = evaluate(kind, trial, allow_equal=True, exploration_ceiling=ceiling)
            if alternate:
                frontier.append((trial, alternate, 0))
            if len(frontier) >= 4 or summary['exchange_trials']-start_trials >= 64:
                break
        while frontier and expanded < 8 and summary['exchange_trials']-start_trials < 112:
            seed, replay, depth = frontier.pop(0)
            path = guide_for(replay, seed, 'certified_growing_exchange')
            active_path = path
            seed_cost = char_count(render(seed))
            expanded += 1
            raw = list(proposals(seed, path, limit=24))
            raw += list(simple_edits(seed, actions, check))
            raw += list(feature_edits(seed, path))
            raw += list(chain_leaf_edits(seed, path))
            raw += list(or_edits(seed, path))
            for kind, trial in ordered(raw, seed_cost):
                trial_cost = char_count(render(trial))
                if trial_cost >= seed_cost or not path.compatible(trial):
                    continue
                result = evaluate('exchange_descendant_'+kind, trial, allow_equal=True,
                                  exploration_ceiling=ceiling)
                if summary['best_chars'] < initial_cost:
                    return
                if result and depth < 2 and len(frontier) < 4:
                    frontier.append((trial, result, depth+1))
                if summary['exchange_trials']-start_trials >= 112:
                    break
        active_path = guide

    def run_batch(kind, source, samples, patches):
        # Independent static edits are only a plan. Execute the whole plan
        # once; failed groups are split against the original stable row IDs.
        # Only passed subsets are retained; an unsuccessful remainder never
        # rolls back an accepted macro or borrows its certificate.
        if len(patches) < 2:
            return
        admitted, failures = {}, 0
        def visit(part):
            nonlocal failures
            check()
            if failures >= 12 or not part:
                return
            changed = dict(admitted)
            changed.update(part)
            trial = [changed.get(i,r) for i,r in enumerate(source) if changed.get(i,r) is not None]
            if not samples.compatible(trial):
                if len(part) > 1:
                    middle = len(part)//2
                    visit(part[:middle])
                    visit(part[middle:])
                return
            result = evaluate(kind,trial,batch_rules=len(part))
            if result:
                admitted.update(part)
                return
            failures += 1
            if len(part) > 1:
                middle = len(part)//2
                visit(part[:middle])
                visit(part[middle:])
        visit(patches)

    while budget():
        check()
        old_cost = summary["best_chars"]
        # This cheap first-match check routes expensive replays toward plausible
        # edits. Rejected sample shapes are not a language-level UNSAT claim.
        samples = guide_for(best_replay,best)
        active_path = samples
        run_batch('batch_basic',clone(best),samples,basic_batch(best,samples,actions))
        if summary['best_chars'] < old_cost:
            continue
        for kind,trial in ordered(simple_edits(best,actions,check)):
            if samples.compatible(trial):
                evaluate(kind,trial)
            if summary["best_chars"] < old_cost:
                break
        if summary["best_chars"] < old_cost:
            continue
        run_batch('batch_features',clone(best),samples,feature_batch(best,samples))
        if summary['best_chars'] < old_cost:
            continue
        for kind,trial in ordered(feature_edits(best,samples)):
            if samples.compatible(trial):
                evaluate(kind,trial)
                if summary["best_chars"] < old_cost:
                    break
        if summary["best_chars"] < old_cost:
            continue
        for kind,trial in ordered(or_edits(best,samples)):
            evaluate(kind,trial)
            if summary['best_chars'] < old_cost:
                break
        if summary['best_chars'] < old_cost:
            continue
        # A large extracted list benefits from family rebuilding first. Once
        # duplication drops, release-window guards have the better chance of
        # improving a compact program. This chooses ordering, not language size.
        window_first = len(best) <= 2*len({rule['action'] for rule in best})
        summary['route'] = 'compact_windows_first' if window_first else 'dense_families_first'
        tasks = {
            'family':lambda:family_edits(best,samples,diagnostic),
            'native_priority':lambda:priority_edits(best,samples,native=True),
            'priority':lambda:priority_edits(best,samples),
        }
        if window_first:
            tasks = {'window':lambda:window_edits(best,samples),**tasks}
        else:
            tasks['window'] = lambda:window_edits(best,samples)
        # A separate proposal lane keeps the cheap same-path searches intact.
        # Legacy or thin observations simply provide no removable clock points.
        if any(row.get('wait_clock_atoms') for row in samples.rows):
            tasks = {'schedule':lambda:schedule_edits(best,samples),**tasks}
        strategy_pass(tasks,samples)
        if summary['best_chars'] < old_cost:
            continue
        repair_pass()
        if summary['best_chars'] < old_cost:
            continue
        # Rebuild competing actions together, including native OR conditions.
        # Joint construction may use incomplete intermediate programs, while
        # only complete proposals reach the common native certificate gate.
        if joint_search or deep_search:
            feedback_source = samples
            branches.clear()
            for kind,trial in candidates(joint_edits(best,samples,diagnostic)):
                evaluate(kind,trial)
                if summary['best_chars'] < old_cost:
                    break
            repair_pass()
            # Reached WAIT decisions remain private to this one aligned path.
            # Do not pool failed candidates or label any unvisited suffix. A
            # finite branch neighbourhood ends without an UNSAT claim.
            for branch in range(12):
                if not branches or summary['best_chars'] < old_cost:
                    break
                cursor,_,guide,seed = branches.pop(0)
                active_path = guide
                summary['joint_branches'] += 1
                diagnostic({'kind':'joint_counterexample_branch','branch':branch+1,
                            'cursor':cursor,'guide_rows':len(guide.rows)},None)
                progress(dict(summary))
                # Repair this reached candidate, allowing it to grow while it
                # remains below the independently certified incumbent's cost.
                for kind,trial in joint_edits(seed,guide,diagnostic,
                                             cost_bound=summary['best_chars']+1):
                    evaluate(kind,trial)
                    if summary['best_chars'] < old_cost:
                        break
                repair_pass()
            feedback_source = None
            active_path = samples
        if summary['best_chars'] < old_cost:
            continue
        if region_search:
            region_pass(best,samples)
            if summary['best_chars'] < old_cost:
                continue
        for kind,trial in candidates(local_rewrites(best,samples,render,check_solver,diagnostic)):
            evaluate(kind,trial)
            if summary["best_chars"] < old_cost:
                break
        if summary["best_chars"] < old_cost:
            continue
        # An accepted source can still use an incidental early clock. Explore
        # nearby legal clocks independently, then learn from EACH newly
        # certified trajectory. No original or alternative rows are pooled.
        for kind, trial in candidates(timing_edits(best, samples, best_replay)):
            alternate = evaluate(kind, trial, allow_equal=True)
            if summary['best_chars'] < old_cost:
                break
            if alternate is None:
                continue
            guide = guide_for(alternate,trial,'certified_clock_alternative')
            active_path = guide
            for child_kind, child in candidates(window_edits(trial, guide)):
                evaluate(child_kind, child)
                if summary['best_chars'] < old_cost:
                    break
            if summary['best_chars'] < old_cost:
                break
        if summary['best_chars'] < old_cost:
            continue
        # Equal-cost priority moves can unlock deletions. Retain a small beam
        # of certified alternative orders; only strictly shorter results replace
        # the user's best. All paths keep their OWN samples, never pooled.
        frontier = [(clone(best),best_replay)]
        for depth in range(2):
            next_frontier = []
            for base,base_replay in frontier:
                guide = guide_for(base_replay,base,'certified_priority_alternative')
                active_path = guide
                for i in range(len(base)-1):
                    check()
                    trial = clone(base)
                    trial[i],trial[i+1] = trial[i+1],trial[i]
                    if guide.compatible(trial):
                        replay = evaluate("beam_priority_move",trial,allow_equal=True)
                        if replay:
                            next_frontier.append((trial,replay))
                    if len(next_frontier) >= 4:
                        break
                if len(next_frontier) >= 4:
                    break
            for base,base_replay in next_frontier:
                guide = guide_for(base_replay,base,'certified_priority_alternative')
                active_path = guide
                proposals = (list(simple_edits(base,actions,check)) + list(or_edits(base,guide))
                             + list(feature_edits(base,guide)))
                for kind,trial in ordered(proposals):
                    if guide.compatible(trial):
                        evaluate("beam_"+kind,trial)
                        if summary["best_chars"] < old_cost:
                            break
                if summary["best_chars"] < old_cost:
                    break
            if summary["best_chars"] < old_cost or not next_frontier:
                break
            frontier = next_frontier
        if summary['best_chars'] == old_cost:
            # Extend the fast search at stagnation rather than replace its
            # useful action/shape trajectory with an incidental new witness.
            active_path = samples
            for kind,trial in candidates(event_window_edits(best,samples)):
                evaluate(kind,trial)
                if summary['best_chars'] < old_cost:
                    break
        if summary['best_chars'] == old_cost and any(row.get('release_windows') for row in samples.rows):
            active_path = samples
            for kind,trial in candidates(projected_window_edits(best,samples,frontier=window_frontier,diagnostic=diagnostic)):
                evaluate(kind,trial)
                if summary['best_chars'] < old_cost:
                    break
        if summary['best_chars'] < old_cost:
            continue
        if summary['best_chars'] == old_cost and region_search:
            # Each certified alternative is independently recertified from
            # t=0, then revisited by the broader generators on its own path.
            for seed,replay in list(alternatives):
                guide = guide_for(replay,seed,'certified_alternative')
                active_path = guide
                for kind,trial in candidates(family_edits(seed,guide,diagnostic)):
                    evaluate('alternate_'+kind,trial)
                    if summary['best_chars'] < old_cost:
                        break
                if summary['best_chars'] == old_cost:
                    region_pass(seed,guide)
                if summary['best_chars'] < old_cost:
                    break
            # A reached failed path remains a separate speculative branch.
            for cursor,_,guide,seed in list(branches[:2]):
                if summary['best_chars'] < old_cost:
                    break
                diagnostic({'kind':'region_counterexample_branch','cursor':cursor,
                            'path_id':guide.path_id},None)
                region_pass(seed,guide)
        if summary['best_chars'] == old_cost:
            # Preserve the productive coarse rewrites before changing an
            # interior predicate. Even a certified three-character saving can
            # redirect a greedy search into a worse later local optimum.
            context_guide = samples
            while budget():
                context_cost = summary['best_chars']
                active_path = context_guide
                for kind,trial in ordered(chain_leaf_edits(best,context_guide)):
                    evaluate(kind,trial)
                    if summary['best_chars'] < context_cost:
                        break
                if summary['best_chars'] < context_cost:
                    context_guide = guide_for(best_replay,best,'certified_context_shortening')
                    continue
                # A same-length change is a bridge, not a new user best. Only
                # its full native replay supplies the descendant's guide.
                for kind, trial in candidates(chain_leaf_bridges(best,context_guide)):
                    alternate = evaluate(kind,trial,allow_equal=True)
                    if alternate is None:
                        continue
                    guide = guide_for(alternate,trial,'certified_leaf_alternative')
                    active_path = guide
                    children = (list(simple_edits(trial,actions,check))
                                + list(feature_edits(trial,guide))
                                + list(chain_leaf_edits(trial,guide))
                                + list(or_edits(trial,guide)))
                    for child_kind, child in ordered(children):
                        if guide.compatible(child):
                            evaluate('bridge_'+child_kind,child)
                            if summary['best_chars'] < context_cost:
                                break
                    active_path = context_guide
                    if summary['best_chars'] < context_cost:
                        break
                if summary['best_chars'] == context_cost:
                    break
                context_guide = guide_for(best_replay,best,'certified_context_shortening')
        if summary['best_chars'] < old_cost:
            continue
        if summary["best_chars"] == old_cost:
            if exchange_search:
                exchange_pass()
                if summary['best_chars'] < old_cost:
                    continue
            if not deep_search:
                break
            feedback_source = samples
            branches.clear()
            for kind,trial in candidates(global_edits(best,samples,check_solver,diagnostic)):
                evaluate(kind,trial)
                if summary['best_chars'] < old_cost:
                    break
            repair_pass()
            # Rebuild all guards/actions/priorities after each counterexample.
            # Each branch retains its own WAIT observations; a previous path
            # never becomes an unconditional constraint on the next path.
            for branch in range(12):
                if not branches or summary['best_chars'] < old_cost:
                    break
                cursor,_,guide,_ = branches.pop(0)
                active_path = guide
                summary['global_branches'] += 1
                diagnostic({'kind':'global_counterexample_branch','branch':branch+1,
                            'cursor':cursor,'guide_rows':len(guide.rows)},None)
                progress(dict(summary))
                for kind,trial in candidates(global_edits(best,guide,check_solver,diagnostic)):
                    evaluate(kind,trial)
                    if summary['best_chars'] < old_cost:
                        break
                repair_pass()
            if summary['best_chars'] == old_cost:
                break
    summary["status"] = "scope_exhausted" if budget() else "budget_exhausted"
    progress(dict(summary))
    return best,best_replay,records,summary
