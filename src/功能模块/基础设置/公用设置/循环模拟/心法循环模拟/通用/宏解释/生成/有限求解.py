"""原生压缩器的有限 SMT 边界；不接收模拟观察、真值矩阵或候选回放。"""
import json
import time
import z3


def 求解有限窗口(text):
    request = json.loads(text)
    solver = z3.Solver()
    solver.set(timeout=request['timeout'], random_seed=0)
    solver.from_string(request['smt'])
    variables = [z3.Bool(name) for name in request['variables']]
    models, checks = [], []
    for _ in range(request['limit']):
        started = time.perf_counter()
        status = solver.check()
        info = dict(status=str(status), solve_ms=(time.perf_counter() - started) * 1000)
        checks.append(info)
        if status == z3.unknown:
            info['reason'] = solver.reason_unknown()
        if status != z3.sat:
            break
        try:
            model = solver.model()
            values = [model.eval(value, model_completion=True) for value in variables]
            solver.add(z3.Or([value != result for value, result in zip(variables, values)]))
            models.append([z3.is_true(value) for value in values])
            del model
        except z3.Z3Exception as error:
            if not any(message in str(error) for message in ('model is not available', 'max. resource limit exceeded')):
                raise
            checks.append(dict(info, status='unknown', reason=str(error)))
            break
    return json.dumps(dict(models=models, checks=checks), separators=(',', ':'))
