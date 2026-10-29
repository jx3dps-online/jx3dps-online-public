"""Optional, task-local scheduling from actual native candidate feedback.

This module neither generates macro text nor certifies it. Structural features
are captured BEFORE replay; opaque provenance is never a predictive feature.
No files, user data, network services, or reference macro libraries are read.
All ordering keeps every candidate and reserves deterministic exploration.
"""
import hashlib
import json
import math
from collections import Counter, defaultdict, deque
from copy import deepcopy


FEATURE_SCHEMA_VERSION = 1
MODEL_VERSION = "online-linear-v1"
SERIALIZATION_VERSION = 1
PRIOR_VERSION = 1
NATIVE_SEMANTICS = "and_or_equal_precedence_right_associative-v1"
ATOM_ROLES = ("clock", "resource", "presence", "stack", "target", "skill", "last_skill")
FEATURE_NAMES = (
    "bias", "saving_fraction", "size_log", "rule_count_log",
    "changed_rule_fraction", "order_inversion_fraction", "duplicate_fraction",
    "leaf_count_log", "max_chain_log", "or_fraction", "and_prefix_fraction",
    "clock_fraction", "clock_change_fraction", "resource_fraction",
    "presence_fraction", "stack_fraction", "target_fraction", "skill_fraction",
    "last_skill_fraction", "window_coverage", "window_coverage_known",
    "forbidden_fraction", "wait_conflict_fraction", "priority_conflict_fraction",
    "static_compatible", "static_compatible_known", "equal_cost_path",
)
CONTEXT_NAMES = {
    "window_coverage", "forbidden_hits", "wait_conflicts", "priority_conflicts",
    "observed_rows", "static_compatible", "equal_cost_path",
}
BANDIT_FEATURE_NAMES = (
    "bias", "duplicate_fraction", "complexity_fraction", "clock_fraction",
    "recent_gain_fraction", "recent_cost_log", "previous_skill_difference",
    "previous_time_difference", "previous_wait_difference",
)
BANDIT_CONTEXT_NAMES = {
    "duplicate_fraction", "complexity_fraction", "clock_fraction",
    "recent_gain_fraction", "recent_cost_ms", "previous_difference_kind",
}
BINDING_NAMES = ("contract_hash", "path_id", "candidate_hash", "source_group", "oracle_version")


def candidate_hash(text):
    """Exact UTF-8 body identity, without unsafe text normalization."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _finite(value):
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("feature/model values must be finite")
    return number


def _fraction(value):
    return max(0.0, min(1.0, _finite(value)))


def _log(value, scale=1000):
    return min(1.0, math.log1p(max(0.0, _finite(value))) / math.log1p(scale))


def _shape(rule):
    atoms = tuple(rule.get("atoms", ()))
    if "ops" in rule:
        ops = tuple(rule["ops"])
    else:
        tail = tuple(rule.get("any_atoms", ()))
        ops = ("&",) * max(0, len(atoms) - 1)
        if tail:
            ops += (("&",) if atoms else ()) + ("|",) * (len(tail) - 1)
            atoms += tail
    if len(ops) != max(0, len(atoms) - 1) or any(op not in ("&", "|") for op in ops):
        raise ValueError("invalid native condition chain")
    return rule["action"], atoms, ops


def atom_role(text):
    """Predicate namespace only; identities and numeric thresholds are ignored."""
    prefix = text.split(":", 1)[0]
    if prefix in ("bufftime", "tbufftime"):
        return "clock"
    if prefix in ("tbuff", "tnobuff"):
        return "target"
    if prefix in ("buff", "nobuff"):
        return "stack" if any(op in text.split(":", 1)[-1] for op in ("<", ">", "=", "~")) else "presence"
    if prefix in ("skill_energy", "skill_notin_cd", "skill", "noskill"):
        return "skill"
    if text.startswith("last_skill"):
        return "last_skill"
    return "resource"


def validate_structural_prior(prior):
    """Validate anonymous, advisory shapes; static counts are never labels."""
    if not isinstance(prior, dict) or set(prior) != {
            "schema_version", "native_semantics", "sample_count", "rule_count", "shapes", "role_counts"}:
        raise ValueError("invalid structural prior schema")
    if prior["schema_version"] != 1 or prior["native_semantics"] != NATIVE_SEMANTICS:
        raise ValueError("incompatible native structural prior")
    for key in ("sample_count", "rule_count"):
        if type(prior[key]) is not int or prior[key] < 0:
            raise ValueError("invalid structural count")
    if not isinstance(prior["role_counts"], dict) or set(prior["role_counts"]) != set(ATOM_ROLES):
        raise ValueError("invalid predicate roles")
    if any(type(n) is not int or n < 0 for n in prior["role_counts"].values()):
        raise ValueError("invalid role count")
    if not isinstance(prior["shapes"], list) or len(prior["shapes"]) > 256:
        raise ValueError("invalid structural shape collection")
    seen = set()
    for shape in prior["shapes"]:
        if not isinstance(shape, dict) or set(shape) != {"roles", "ops", "count", "frequency"}:
            raise ValueError("invalid anonymous shape")
        roles, ops = shape["roles"], shape["ops"]
        if (not isinstance(roles, list) or not isinstance(ops, list) or len(roles) > 128
                or any(role not in ATOM_ROLES for role in roles)
                or len(ops) != max(0, len(roles)-1) or any(op not in ("&", "|") for op in ops)):
            raise ValueError("invalid native shape chain")
        key = tuple(roles), tuple(ops)
        if key in seen:
            raise ValueError("duplicate anonymous shape")
        seen.add(key)
        if type(shape["count"]) is not int or not 0 < shape["count"] <= prior["rule_count"]:
            raise ValueError("invalid shape count")
        frequency = _finite(shape["frequency"])
        if not 0 <= frequency <= 1 or abs(frequency-shape["count"]/max(1, prior["rule_count"])) > 1e-9:
            raise ValueError("invalid shape frequency")
    return deepcopy(prior)


def structural_prior(programs):
    """Count train-split macro syntax only, without asserting replay success.

    Each item is (rules, atom_catalog). No bodies, action identities, names,
    thresholds, authors or state samples survive this aggregation.
    """
    counts, roles, samples, rows = Counter(), Counter(), 0, 0
    for rules, atoms in programs:
        samples += 1
        for rule in rules:
            _, leaves, ops = _shape(rule)
            if len(leaves) > 128:
                raise ValueError("structural source chain exceeds serialization bound")
            if any(type(k) is not int or not 0 <= k < len(atoms) for k in leaves):
                raise ValueError("condition leaf outside supplied catalogue")
            kinds = tuple(atom_role(atoms[k]) for k in leaves)
            counts[kinds, ops] += 1
            roles.update(kinds)
            rows += 1
    shapes = [{"roles": list(kinds), "ops": list(ops), "count": count, "frequency": count/max(1, rows)}
              for (kinds, ops), count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:256]]
    return validate_structural_prior(dict(schema_version=1, native_semantics=NATIVE_SEMANTICS,
        sample_count=samples, rule_count=rows, shapes=shapes,
        role_counts={role: roles[role] for role in ATOM_ROLES}))


def _inversions(sequence):
    # Relative order of unchanged rows, unaffected by deletions shifting indices.
    tree = [0] * (max(sequence, default=-1) + 2)
    total = 0
    for seen, item in enumerate(sequence):
        offset, preceding = item + 1, 0
        while offset:
            preceding += tree[offset]
            offset -= offset & -offset
        total += seen - preceding
        offset = item + 1
        while offset < len(tree):
            tree[offset] += 1
            offset += offset & -offset
    return total


def features(source, trial, atoms, chars_before, chars_after, context=None):
    """Transparent, bounded pre-replay features; no skill/buff names or IDs.

    ``context`` can contain only the listed static observation measurements.
    A candidate's replay prefix, divergence or elapsed time is never accepted.
    Text length is the actual UTF-16 optimization cost supplied by the caller.
    """
    context = dict(context or {})
    if set(context) - CONTEXT_NAMES:
        raise ValueError("unknown/post-replay candidate context field")
    before, after = _finite(chars_before), _finite(chars_after)
    if min(before, after) < 0:
        raise ValueError("text costs cannot be negative")
    old, new = [_shape(rule) for rule in source], [_shape(rule) for rule in trial]
    old_counts, new_counts = Counter(old), Counter(new)
    unchanged = sum((old_counts & new_counts).values())
    positions = defaultdict(deque)
    for position, rule in enumerate(old):
        positions[rule].append(position)
    sequence = [positions[rule].popleft() for rule in new if positions[rule]]
    leaves = [leaf for _, chain, _ in new for leaf in chain]
    namespaces = Counter()
    clock_old, clock_new = Counter(), Counter()
    for target, program in ((clock_old, old), (clock_new, new)):
        for _, chain, _ in program:
            for leaf in chain:
                if not isinstance(leaf, int) or not 0 <= leaf < len(atoms):
                    raise ValueError("condition leaf outside supplied catalogue")
                if atoms[leaf].startswith(("bufftime:", "tbufftime:")):
                    target[leaf] += 1
    for leaf in leaves:
        text = atoms[leaf]
        prefix = text.split(":", 1)[0]
        if prefix in ("bufftime", "tbufftime"):
            category = "clock"
        elif prefix in ("tbuff", "tnobuff"):
            category = "target"
        elif prefix in ("buff", "nobuff"):
            category = "stack" if any(op in text.split(":", 1)[-1] for op in ("<", ">", "=", "~")) else "presence"
        elif prefix in ("skill_energy", "skill_notin_cd", "skill", "noskill"):
            category = "skill"
        elif text.startswith("last_skill"):
            category = "last_skill"
        else:
            category = "resource"
        namespaces[category] += 1
    rows = max(1.0, _finite(context.get("observed_rows", 1)))
    count = max(1, len(leaves))
    operators = [op for _, _, ops in new for op in ops]
    prefix_and = sum(next((i for i, op in enumerate(ops) if op == "|"), len(ops))
                     for _, _, ops in new)
    values = dict.fromkeys(FEATURE_NAMES, 0.0)
    values.update(
        bias=1.0, saving_fraction=max(-1.0, min(1.0, (before-after)/max(1.0, before))),
        size_log=_log(after, 10000), rule_count_log=_log(len(new), 256),
        changed_rule_fraction=(len(old)+len(new)-2*unchanged)/max(1, len(old)+len(new)),
        order_inversion_fraction=_inversions(sequence)/max(1, len(sequence)*(len(sequence)-1)/2),
        duplicate_fraction=1-len({rule[0] for rule in new})/max(1, len(new)),
        leaf_count_log=_log(len(leaves), 2048), max_chain_log=_log(max((len(rule[1]) for rule in new), default=0), 64),
        or_fraction=operators.count("|")/max(1, len(operators)),
        and_prefix_fraction=prefix_and/max(1, len(operators)),
        clock_fraction=sum(clock_new.values())/count,
        clock_change_fraction=sum((clock_old-clock_new).values())/max(1, sum(clock_old.values())+sum(clock_new.values()))
                              + sum((clock_new-clock_old).values())/max(1, sum(clock_old.values())+sum(clock_new.values())),
        window_coverage=_fraction(context.get("window_coverage", 0)),
        window_coverage_known=float("window_coverage" in context),
        forbidden_fraction=_fraction(_finite(context.get("forbidden_hits", 0))/rows),
        wait_conflict_fraction=_fraction(_finite(context.get("wait_conflicts", 0))/rows),
        priority_conflict_fraction=_fraction(_finite(context.get("priority_conflicts", 0))/rows),
        static_compatible=float(bool(context.get("static_compatible", False))),
        static_compatible_known=float("static_compatible" in context),
        equal_cost_path=float(bool(context.get("equal_cost_path", before == after))),
    )
    for category in ("resource", "presence", "stack", "target", "skill", "last_skill"):
        values[category+"_fraction"] = namespaces[category]/count
    return values


def _vector(values, names):
    if set(values) != set(names):
        raise ValueError("feature schema mismatch")
    vector = [_finite(values[name]) for name in names]
    if any(abs(value) > 1 for value in vector):
        raise ValueError("features must be normalized to [-1, 1]")
    return vector


def _dot(weights, vector):
    return sum(a*b for a, b in zip(weights, vector))


def _sigmoid(value):
    value = max(-30.0, min(30.0, value))
    return 1/(1+math.exp(-value))


def _seal(record):
    payload = {key: record[key] for key in ("id", "binding", "generator_kind", "pre_replay_features",
                                           "chars_before", "chars_after", "epoch", "feature_schema_version")}
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def classify_feedback(replay, *, native=True, cancelled=False, solver_status=None,
                      infrastructure_error=False, static_rejected=False):
    """Only full success or a proved native counterexample yields a label.

    A first native divergence proves failure even when stop-on-divergence
    avoids the remaining replay. It is distinct from arbitrary truncation.
    """
    if cancelled or replay.get("cancelled") or replay.get("status") in ("cancelled", "paused", "stopped"):
        return "cancelled", None
    if (solver_status is not None and str(solver_status).lower() in ("unknown", "timeout", "cancelled")) or replay.get("status") in ("unknown", "solver_unknown"):
        return "solver_unknown", None
    if replay.get("status") in ("timeout", "budget_exhausted", "observation_ended"):
        return "observation_unknown", None
    if static_rejected or not native:
        return "static_rejection" if static_rejected else "not_native", None
    if infrastructure_error or replay.get("status") != "ok":
        return "infrastructure_error", None
    if replay.get("truncated") is not False:
        return "truncated", None
    comparison = replay.get("comparison") or {}
    if comparison.get("reproduced") is True and comparison.get("completed_full_replay") is True:
        return "certified", 1
    if comparison.get("reproduced") is False:
        if comparison.get("completed_full_replay") is True:
            return "native_full_failure", 0
        if comparison.get("first_difference") and replay.get("probe_failure"):
            return "native_divergence", 0
    return "uncertified", None


def _bandit_vector(context):
    context = dict(context or {})
    if set(context) - BANDIT_CONTEXT_NAMES:
        raise ValueError("unknown bandit context field")
    difference = context.get("previous_difference_kind", "none")
    if difference not in ("none", "skill", "time", "wait", "extra", "unknown"):
        raise ValueError("unknown previous difference category")
    return [1.0] + [_fraction(context.get(key, 0)) for key in
                    ("duplicate_fraction", "complexity_fraction", "clock_fraction", "recent_gain_fraction")] + [
        _log(context.get("recent_cost_ms", 0), 100000), float(difference in ("skill", "extra")),
        float(difference == "time"), float(difference == "wait")]


class LearningSession:
    """Optional candidate ranker plus contextual operator scheduler.

    ``enabled=False`` preserves input order exactly. ``training=False`` or a
    held-out binding freezes both models while retaining labelled diagnostics.
    Binding.path_id identifies the source guide; feedback's actual fingerprint
    is stored separately and never substitutes for source-path provenance.
    Serialized models exclude candidate bodies, states, pending rows and logs.
    """
    def __init__(self, contract_hash, oracle_version, source_group="", *, enabled=False,
                 bandit_enabled=False, training=True, split="train", min_labels=12,
                 exploration_fraction=0.2, seed=0, heldout_contracts=(), heldout_source_groups=()):
        if contract_hash is None or oracle_version is None:
            raise ValueError("contract and oracle identities are required")
        self.contract_hash, self.oracle_version = str(contract_hash), str(oracle_version)
        if not self.contract_hash or not self.oracle_version:
            raise ValueError("contract and oracle identities are required")
        if split not in ("train", "validation", "test"):
            raise ValueError("unknown data split")
        self.source_group = str(source_group)
        self.enabled, self.bandit_enabled, self.training = bool(enabled), bool(bandit_enabled), bool(training)
        self.split, self.min_labels = split, max(1, int(min_labels))
        self.exploration_fraction = max(0.05, min(0.5, _finite(exploration_fraction)))
        self.seed = int(seed)
        self.heldout_contracts, self.heldout_source_groups = set(heldout_contracts), set(heldout_source_groups)
        self.weights, self.cost_weights = [0.0]*len(FEATURE_NAMES), [0.0]*len(FEATURE_NAMES)
        self.weights[0], self.cost_weights[0] = -0.5, math.log1p(100)
        self.labels, self.cost_labels, self.cost_log_mean = 0, 0, math.log1p(100)
        self.epoch, self.rank_round, self.strategy_round, self.prepared_count = 0, 0, 0, 0
        self._seals, self._feedback, self._seen, self._arms, self._strategy_contexts = {}, {}, set(), {}, {}
        self._strategy_visits = {}
        self.structural_prior = None
        self.prior_metadata = None

    def _can_train(self):
        return (self.training and self.split == "train" and bool(self.source_group)
                and self.contract_hash not in self.heldout_contracts
                and self.source_group not in self.heldout_source_groups)

    def _predict(self, values):
        vector = _vector(values, FEATURE_NAMES)
        learned = self.enabled and self.labels >= self.min_labels
        if learned:
            probability = _sigmoid(_dot(self.weights, vector))
        else:
            probability = _sigmoid(0.5 + 0.8*values["static_compatible"]
                - 2*values["forbidden_fraction"] - values["wait_conflict_fraction"]
                - 0.8*values["changed_rule_fraction"] - 0.5*values["order_inversion_fraction"]
                - 0.5*values["clock_change_fraction"] + 0.5*values["window_coverage"])
        log_cost = (_dot(self.cost_weights, vector) if self.enabled and self.cost_labels >= self.min_labels
                    else self.cost_log_mean)
        return probability, max(1.0, math.expm1(max(0.0, min(math.log1p(1e7), log_cost)))), learned

    def prepare(self, candidate_hash, path_id, generator_kind, features, chars_before, chars_after):
        _vector(features, FEATURE_NAMES)
        if candidate_hash is None or path_id is None:
            raise ValueError("candidate and source-path identities are required")
        binding = dict(contract_hash=self.contract_hash, path_id=str(path_id), candidate_hash=str(candidate_hash),
                       source_group=self.source_group, oracle_version=self.oracle_version)
        if not binding["candidate_hash"] or not binding["path_id"]:
            raise ValueError("candidate and source-path identities are required")
        before, after = _finite(chars_before), _finite(chars_after)
        if min(before, after) < 0:
            raise ValueError("text costs cannot be negative")
        probability, cost, learned = self._predict(features)
        self.prepared_count += 1
        record = {"id": self.prepared_count, "binding": binding, "generator_kind": str(generator_kind),
                  "pre_replay_features": dict(zip(FEATURE_NAMES, _vector(features, FEATURE_NAMES))),
                  "chars_before": before, "chars_after": after,
                  "epoch": self.epoch, "feature_schema_version": FEATURE_SCHEMA_VERSION,
                  "model_version": MODEL_VERSION, "predicted_probability": probability,
                  "predicted_cost_ms": cost, "learned_prediction": learned,
                  "predicted_score": probability*max(0, before-after)/cost, "exploration_choice": False}
        self._seals[record["id"]] = _seal(record)
        return record

    def rank(self, records):
        records = list(records)
        if not self.enabled or len(records) < 2:
            return records
        self.rank_round += 1
        ranked = sorted(records, key=lambda r: (-r["predicted_score"], r["chars_after"], r["id"]))
        # Exploration visits generator kinds fairly, independent of scores.
        groups = defaultdict(deque)
        for record in sorted(records, key=lambda r: candidate_hash(str((self.seed, self.rank_round,
                                          r["binding"]["candidate_hash"])) )):
            groups[record["generator_kind"]].append(record)
        explorers = []
        quota = max(1, math.ceil(len(records)*self.exploration_fraction))
        while groups and len(explorers) < quota:
            for kind in list(groups):
                explorers.append(groups[kind].popleft())
                if not groups[kind]:
                    del groups[kind]
                if len(explorers) >= quota:
                    break
        chosen = {record["id"] for record in explorers}
        for record in records:
            record["exploration_choice"] = record["id"] in chosen
        return explorers + [record for record in ranked if record["id"] not in chosen]

    def feedback(self, record, replay, *, binding, timing_breakdown=None, **flags):
        if self._seals.get(record.get("id")) != _seal(record):
            raise ValueError("pre-replay record changed or belongs to another session")
        if set(binding) != set(BINDING_NAMES) or any(str(binding[key]) != record["binding"][key] for key in BINDING_NAMES):
            raise ValueError("feedback provenance mismatch")
        category, label = classify_feedback(replay, **flags)
        timings = dict(timing_breakdown if timing_breakdown is not None else replay.get("timings_ms", {}))
        cost = next((_finite(timings[key]) for key in ("verification_total", "round_trip")
                     if key in timings), None)
        if cost is not None and cost < 0:
            raise ValueError("validation time cannot be negative")
        identity = tuple(record["binding"][key] for key in BINDING_NAMES)
        duplicate = identity in self._seen
        # Unknown observations do not poison a later completed native verdict.
        if label is not None and not duplicate:
            self._seen.add(identity)
            if self._can_train():
                vector = _vector(record["pre_replay_features"], FEATURE_NAMES)
                rate = 0.2/(1+sum(value*value for value in vector))
                error = label-_sigmoid(_dot(self.weights, vector))
                self.weights = [weight+rate*(error*value-0.001*weight) for weight, value in zip(self.weights, vector)]
                self.labels += 1
                if cost is not None:
                    target = math.log1p(cost)
                    error = max(-3.0, min(3.0, target-_dot(self.cost_weights, vector)))
                    self.cost_weights = [weight+rate*error*value for weight, value in zip(self.cost_weights, vector)]
                    self.cost_labels += 1
                    self.cost_log_mean += (target-self.cost_log_mean)/self.cost_labels
        comparison = replay.get("comparison") or {}
        result = {"record_id": record["id"], "binding": dict(record["binding"]), "category": category,
                  "label": label, "trained": label is not None and not duplicate and self._can_train(),
                  "duplicate": duplicate, "certified_saving": max(0, record["chars_before"]-record["chars_after"]) if label == 1 else 0,
                  "equal_cost_certified": label == 1 and record["chars_before"] == record["chars_after"],
                  "validation_cost_ms": cost, "timing_breakdown": timings,
                  "matched_prefix": comparison.get("acceptance_prefix"),
                  "first_difference_kind": (replay.get("probe_failure") or {}).get("kind")
                      if isinstance(replay.get("probe_failure"), dict) else None,
                  "chars_before": record["chars_before"], "chars_after": record["chars_after"],
                  "actual_path_id": replay.get("actual_fingerprint"), "epoch": record["epoch"]}
        self._feedback[record["id"]] = deepcopy(result)
        return result

    def strategy_order(self, names, context=None):
        names = list(dict.fromkeys(names))
        vector = _bandit_vector(context)
        for name in names:
            self._strategy_contexts[name] = self.epoch, vector
        if not self.bandit_enabled or len(names) < 2:
            return names
        self.strategy_round += 1
        total = sum(arm["count"] for arm in self._arms.values())
        def score(name):
            arm = self._arms.get(name, {"count": 0, "weights": [0.0]*len(vector)})
            return _dot(arm["weights"], vector)+0.2*math.sqrt(math.log1p(total+1)/(1+arm["count"]))
        order = sorted(names, key=lambda name: (-score(name), names.index(name)))
        untried = [name for name in names if not self._strategy_visits.get(name, 0)]
        if untried:
            explore = untried[(self.strategy_round-1) % len(untried)]
        elif self.strategy_round % max(1, math.ceil(1/self.exploration_fraction)) == 0:
            explore = names[(self.strategy_round // max(1, math.ceil(1/self.exploration_fraction))-1) % len(names)]
        else:
            explore = None
        return ([explore]+[name for name in order if name != explore]) if explore is not None else order

    def strategy_feedback(self, name, records, elapsed_ms, *, complete=True, cancelled=False, solver_status=None):
        elapsed = _finite(elapsed_ms)
        if elapsed < 0:
            raise ValueError("strategy elapsed time cannot be negative")
        observations, seen_records = [], set()
        for record in records:
            observation = self._feedback.get(record["record_id"])
            if observation != record:
                raise ValueError("strategy feedback must use this session's genuine candidate verdicts")
            if record["record_id"] not in seen_records:
                observations.append(observation)
                seen_records.add(record["record_id"])
        self._strategy_visits[name] = self._strategy_visits.get(name, 0)+1
        eligible = complete and not cancelled and str(solver_status).lower() not in ("unknown", "timeout", "cancelled")
        if observations and not any(record["label"] is not None for record in observations):
            eligible = False
        certified = [record for record in observations if record["label"] == 1 and not record["duplicate"]]
        # Several valid candidates from one incumbent are alternatives, not
        # additive improvements. Sequential improvements telescope as well.
        saving = max(0, max((record["chars_before"] for record in certified), default=0)
                        - min((record["chars_after"] for record in certified), default=0))
        alternatives = sum(record["equal_cost_certified"] for record in observations if not record["duplicate"])
        # Certified gain per normalized time, with a small equal-path reward.
        reward = min(1.0, (saving/100+0.01*alternatives)/(1+elapsed/100))-min(0.1, elapsed/100000)
        trained = eligible and self._can_train()
        if trained:
            source_epoch, vector = self._strategy_contexts.get(name, (self.epoch, _bandit_vector(None)))
            discount = 0.5**max(0, self.epoch-source_epoch)
            arm = self._arms.setdefault(name, {"count": 0.0, "weights": [0.0]*len(vector)})
            error = reward-_dot(arm["weights"], vector)
            rate = discount*0.3/(1+sum(value*value for value in vector))
            arm["weights"] = [weight+rate*error*value for weight, value in zip(arm["weights"], vector)]
            arm["count"] += discount
        return {"strategy": name, "reward": reward if eligible else None, "trained": trained,
                "elapsed_ms": elapsed, "certified_saving": saving, "epoch": self.epoch}

    def best_changed(self, path_id):
        """Decay old operator evidence when the certified incumbent changes."""
        if not str(path_id):
            raise ValueError("new certified source path is required")
        self.epoch += 1
        for arm in self._arms.values():
            arm["count"] *= 0.5
            arm["weights"] = [weight*0.5 for weight in arm["weights"]]

    def to_dict(self):
        return {"serialization_version": SERIALIZATION_VERSION, "feature_schema_version": FEATURE_SCHEMA_VERSION,
                "feature_names": list(FEATURE_NAMES), "bandit_feature_names": list(BANDIT_FEATURE_NAMES),
                "model_version": MODEL_VERSION,
                "contract_hash": self.contract_hash, "oracle_version": self.oracle_version,
                "source_group": self.source_group, "enabled": self.enabled, "bandit_enabled": self.bandit_enabled,
                "training": self.training, "split": self.split, "min_labels": self.min_labels,
                "exploration_fraction": self.exploration_fraction, "seed": self.seed,
                "heldout_contracts": sorted(self.heldout_contracts), "heldout_source_groups": sorted(self.heldout_source_groups),
                "weights": list(self.weights), "cost_weights": list(self.cost_weights), "labels": self.labels,
                "cost_labels": self.cost_labels, "cost_log_mean": self.cost_log_mean, "epoch": self.epoch,
                "rank_round": self.rank_round, "strategy_round": self.strategy_round,
                "arms": json.loads(json.dumps(self._arms)), "strategy_visits": dict(self._strategy_visits),
                "structural_prior": deepcopy(self.structural_prior), "prior_metadata": deepcopy(self.prior_metadata)}

    @classmethod
    def from_prior(cls, data, *, contract_hash, oracle_version, source_group, version, mount):
        """Freeze an anonymous offline model on a NEW task's own provenance.

        Contract/path/candidate identities and any old replay are never loaded.
        Exact native executable and version/mount applicability are required;
        changed executors must be independently revalidated before export.
        """
        keys = {"schema", "prior_version", "feature_schema_version", "feature_names", "model_version",
                "native_semantics", "oracle_versions", "applicable_contexts", "weights", "cost_weights",
                "trained_labels", "cost_labels", "cost_log_mean", "min_labels", "structural_prior",
                "training_summary"}
        if (not isinstance(data, dict) or set(data) != keys
                or data["schema"] != "exact-macro-offline-prior" or data["prior_version"] != PRIOR_VERSION
                or data["feature_schema_version"] != FEATURE_SCHEMA_VERSION
                or data["feature_names"] != list(FEATURE_NAMES) or data["model_version"] != MODEL_VERSION
                or data["native_semantics"] != NATIVE_SEMANTICS):
            raise ValueError("incompatible offline model/schema/native grammar")
        versions = data["oracle_versions"]
        contexts = data["applicable_contexts"]
        if (not isinstance(versions, list) or not versions or len(versions) > 64
                or any(not isinstance(v, str) or not v for v in versions)
                or str(oracle_version) not in versions):
            raise ValueError("offline model native executable mismatch")
        if (not isinstance(contexts, list) or not contexts or len(contexts) > 64
                or any(not isinstance(c, dict) or set(c) != {"version", "mount"}
                       or not all(isinstance(v, str) and v for v in c.values()) for c in contexts)
                or {"version": str(version), "mount": str(mount)} not in contexts):
            raise ValueError("offline model version/mount mismatch")
        for key in ("trained_labels", "cost_labels", "min_labels"):
            if type(data[key]) is not int or data[key] < (1 if key == "min_labels" else 0):
                raise ValueError("invalid offline model count")
        if data["cost_labels"] > data["trained_labels"]:
            raise ValueError("cost labels exceed real native labels")
        summary = data["training_summary"]
        if (not isinstance(summary, dict) or set(summary) != {"train_family_hashes", "train_examples", "positive_labels", "negative_labels"}
                or not isinstance(summary["train_family_hashes"], list)
                or any(not isinstance(v, str) or len(v) != 64 for v in summary["train_family_hashes"])
                or any(type(summary[k]) is not int or summary[k] < 0 for k in
                       ("train_examples", "positive_labels", "negative_labels"))
                or summary["positive_labels"] + summary["negative_labels"] != data["trained_labels"]
                or summary["train_examples"] != data["trained_labels"]):
            raise ValueError("invalid offline training provenance counts")
        if data["trained_labels"] and not (summary["positive_labels"] and summary["negative_labels"]):
            raise ValueError("trained predictor requires both real native label classes")
        identities = [str(source_group)]
        for prefix in ("train:", "validation:", "test:", "holdout:"):
            if identities[0].startswith(prefix):
                identities.append(identities[0][len(prefix):])
        if any(candidate_hash(identity) in summary["train_family_hashes"] for identity in identities):
            raise ValueError("offline evaluation source family overlaps training")
        session = cls(contract_hash, oracle_version, source_group, enabled=True, training=False,
                      split="test", min_labels=data["min_labels"])
        for key in ("weights", "cost_weights"):
            if not isinstance(data[key], list) or len(data[key]) != len(FEATURE_NAMES):
                raise ValueError("offline model weight dimension mismatch")
            setattr(session, key, [_finite(value) for value in data[key]])
        session.labels, session.cost_labels = data["trained_labels"], data["cost_labels"]
        session.cost_log_mean = _finite(data["cost_log_mean"])
        if session.cost_log_mean < 0:
            raise ValueError("invalid offline cost mean")
        session.structural_prior = validate_structural_prior(data["structural_prior"])
        session.prior_metadata = dict(prior_version=PRIOR_VERSION,
            train_family_hashes=list(summary["train_family_hashes"]), native_semantics=NATIVE_SEMANTICS)
        return session

    @classmethod
    def from_dict(cls, data, *, contract_hash, oracle_version):
        if (data.get("serialization_version") != SERIALIZATION_VERSION
                or data.get("feature_schema_version") != FEATURE_SCHEMA_VERSION
                or data.get("feature_names") != list(FEATURE_NAMES)
                or data.get("bandit_feature_names") != list(BANDIT_FEATURE_NAMES)
                or data.get("model_version") != MODEL_VERSION):
            raise ValueError("incompatible learning serialization/schema/model version")
        if str(contract_hash) != data.get("contract_hash") or str(oracle_version) != data.get("oracle_version"):
            raise ValueError("learning model contract/oracle mismatch")
        session = cls(contract_hash, oracle_version, data["source_group"], **{key: data[key] for key in
            ("enabled", "bandit_enabled", "training", "split", "min_labels", "exploration_fraction", "seed",
             "heldout_contracts", "heldout_source_groups")})
        for field in ("weights", "cost_weights"):
            weights = [_finite(value) for value in data[field]]
            if len(weights) != len(FEATURE_NAMES):
                raise ValueError("model weight dimension mismatch")
            setattr(session, field, weights)
        for field in ("labels", "cost_labels", "epoch", "rank_round", "strategy_round"):
            value = int(data[field])
            if value < 0:
                raise ValueError("model counts cannot be negative")
            setattr(session, field, value)
        session.cost_log_mean = _finite(data["cost_log_mean"])
        for name, arm in data["arms"].items():
            count, weights = _finite(arm["count"]), [_finite(value) for value in arm["weights"]]
            if count < 0 or len(weights) != len(BANDIT_FEATURE_NAMES):
                raise ValueError("invalid bandit model state")
            session._arms[name] = {"count": count, "weights": weights}
        for name, count in data.get("strategy_visits", {}).items():
            count = int(count)
            if count < 0:
                raise ValueError("strategy visit counts cannot be negative")
            session._strategy_visits[name] = count
        if data.get("structural_prior") is not None:
            session.structural_prior = validate_structural_prior(data["structural_prior"])
        session.prior_metadata = deepcopy(data.get("prior_metadata"))
        return session
