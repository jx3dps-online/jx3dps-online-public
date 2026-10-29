"""读取现成 TAB/TXT 与原模拟器名单，输出候选映射；不覆盖已有耦合表。"""
import argparse
import csv
import hashlib
import io
import json
from collections import defaultdict
from pathlib import Path


def 读取表(根目录, 相对路径, 必需字段):
    文件 = 根目录 / 相对路径
    if not 文件.is_file():
        目录 = 根目录
        for 段 in Path(相对路径).parts:
            候选 = [项 for 项 in 目录.iterdir() if 项.name.lower() == 段.lower()]
            if len(候选) != 1:
                raise ValueError(f'找不到表：{相对路径}')
            目录 = 候选[0]
        文件 = 目录
    原始 = 文件.read_bytes()
    for 编码 in ['utf-8-sig', 'gb18030']:
        try:
            文本 = 原始.decode(编码)
            break
        except UnicodeDecodeError:
            pass
    else:
        raise ValueError(f'表编码无法无损解读：{文件}')
    读取器 = csv.DictReader(io.StringIO(文本), delimiter='\t')
    if not set(必需字段).issubset(读取器.fieldnames or []):
        raise ValueError(f'表缺少字段：{文件}，需要 {必需字段}')
    行列表 = []
    for 行号, 行 in enumerate(读取器, 2):
        if None in 行:
            raise ValueError(f'表列数异常：{文件}:{行号}')
        行['_line'] = 行号
        行列表.append(行)
    return 行列表, {'path': str(文件.resolve()), 'encoding': 编码,
                   'sha256': hashlib.sha256(原始).hexdigest(), 'rows': len(行列表)}


def 关联名称(心法, 类别):
    名称列表 = 心法[{'技能': 'skills', '自身增益': 'self', '目标增益': 'target'}[类别]]
    对应 = defaultdict(set)
    for 名称 in 名称列表:
        对应[名称].add(名称)
    for 别名, 名称 in 心法['aliases'].get(类别, {}).items():
        if not 别名.isdigit() and 名称 in 名称列表:
            对应[别名].add(名称)
    if 类别 == '技能':
        for 技能 in 心法.get('original', []):
            if 技能.get('raw') and 技能['name'] in 名称列表:
                对应[技能['raw']].add(技能['name'])
    return 对应


def 提取心法(心法, 技能行, UI技能, 增益行, UI增益):
    映射, 证据, 待核对 = {}, {}, []
    for 类别 in ['技能', '自身增益', '目标增益']:
        名称对应 = 关联名称(心法, 类别)
        已有 = 心法['aliases'].get(类别, {})
        for 数字, 名称 in 已有.items():
            if 数字.isdigit() and 名称 in 名称对应:
                for UI in (UI技能 if 类别 == '技能' else UI增益).get(数字, []):
                    if UI.get('Name'):
                        名称对应[UI['Name']].add(名称)
        候选 = defaultdict(lambda: defaultdict(list))
        for 行 in 技能行 if 类别 == '技能' else 增益行:
            数字 = 行.get('SkillID') if 类别 == '技能' else 行.get('ID')
            if not 数字 or not 数字.isdigit():
                continue
            数字 = str(int(数字))
            UI列表 = (UI技能 if 类别 == '技能' else UI增益).get(数字, [])
            原名 = (行.get('SkillName') if 类别 == '技能' else 行.get('Name')) or ''
            # 游戏输入名只取 UI；已有确认的 ID 可用于关联 UI 名与内部状态名。
            if 类别 == '技能':
                # UI 的名字/可拖动标记也可能出现在伤害子段上，不能单独作为动作依据。
                目标 = 名称对应.get(原名, set())
                if not 目标 and 原名.count('-') == 1:
                    目标 = 名称对应.get(原名.split('-', 1)[1], set())
                UI符合 = [UI for UI in UI列表 if UI.get('Name') in 名称对应 and
                        名称对应[UI['Name']] & 目标 and UI.get('CanDrag') == '1']
                if not 目标 or not UI符合:
                    命名UI = [UI for UI in UI列表 if UI.get('Name') in 名称对应 and UI.get('CanDrag') == '1']
                    if 命名UI:
                        待核对.append({'type': 类别, 'id': 数字, 'rawName': 原名,
                            'names': sorted({名 for UI in 命名UI for 名 in 名称对应[UI['Name']]}),
                            'rawLine': 行['_line'], 'uiLines': sorted({UI['_line'] for UI in 命名UI}),
                            'reason': 'UI 同名但原技能名不同；需区分动作、伤害子段及旧版动作'})
                    continue
                if 行.get('IsPassiveSkill') != '0' or 行.get('UIType') != '1' or not 行.get('CastMode'):
                    待核对.append({'type': 类别, 'id': 数字, 'rawName': 原名, 'reason': '缺少主动施展字段，或属于被动/子段'})
                    continue
            else:
                UI符合 = [UI for UI in UI列表 if UI.get('Name') in 名称对应]
                目标 = {名 for UI in UI符合 for 名 in 名称对应[UI['Name']]}
                if not 目标:
                    continue
            for 名称 in 目标:
                候选[数字][名称].append({'rawLine': 行['_line'], 'rawName': 原名,
                    'level': 行.get('Level', ''), 'uiLines': sorted({UI['_line'] for UI in UI符合}),
                    'uiNames': sorted({UI['Name'] for UI in UI符合}),
                    **({字段: 行.get(字段, '') for 字段 in ['IsPassiveSkill', 'UIType', 'CastMode', 'BelongKungfu']} if 类别 == '技能' else {})})
        映射[类别], 证据[类别] = {}, {}
        名称ID = defaultdict(set)
        for 数字, 名称集合 in 候选.items():
            for 名称 in 名称集合:
                名称ID[名称].add(数字)
        for 数字, 名称集合 in sorted(候选.items(), key=lambda 项: int(项[0])):
            if len(名称集合) != 1:
                待核对.append({'type': 类别, 'id': 数字, 'names': sorted(名称集合), 'reason': '同一 ID 对应多个原状态/动作'})
                continue
            名称 = next(iter(名称集合))
            if 数字 in 已有 and 已有[数字] != 名称:
                待核对.append({'type': 类别, 'id': 数字, 'names': [已有[数字], 名称], 'reason': '与已有映射冲突，保留原表'})
                continue
            if len(名称ID[名称]) > 1 and 已有.get(数字) != 名称:
                待核对.append({'type': 类别, 'id': 数字, 'names': [名称],
                    'ids': sorted(名称ID[名称], key=int), 'reason': '同名多 ID，不能按名字推断门派、等级或伤害子段'})
                continue
            映射[类别][数字] = 名称
            证据[类别][数字] = 名称集合[名称]
        UI别名 = defaultdict(set)
        for 数字, 名称 in 映射[类别].items():
            UI显示名 = {UI['Name'] for UI in (UI技能 if 类别 == '技能' else UI增益).get(数字, []) if UI.get('Name')}
            if len(UI显示名) > 1:
                待核对.append({'type': 类别, 'id': 数字, 'uiNames': sorted(UI显示名),
                    'reason': '同 ID 跨等级存在不同 UI 名；保留 ID，不自动开放所有等级的名称别名'})
                continue
            for 行证据 in 证据[类别][数字]:
                for UI名 in 行证据['uiNames']:
                    UI别名[UI名].add(名称)
        for UI名, 名称集合 in sorted(UI别名.items()):
            if len(名称集合) != 1 or (UI名 in 已有 and 已有[UI名] not in 名称集合):
                待核对.append({'type': 类别, 'name': UI名, 'names': sorted(名称集合), 'reason': 'UI 名称存在关联冲突'})
                continue
            名称 = next(iter(名称集合))
            if UI名 != 名称:
                映射[类别][UI名] = 名称
    未匹配 = {类别: sorted(set(心法[键]) - set(映射[类别].values()))
              for 类别, 键 in [('技能', 'skills'), ('自身增益', 'self'), ('目标增益', 'target')]}
    return {'heart': 心法['heart'], 'mappings': 映射, 'evidence': 证据,
            'review': 待核对, 'unmatched': 未匹配}


def 提取未建模增益(心法, 结果, 增益行, UI增益):
    动作名称 = set(关联名称(心法, '技能'))
    动作名称 = {名称 for 名称 in 动作名称 if len(名称) >= 2}
    已建模ID = {数字 for 类别 in ['自身增益', '目标增益']
              for 数字 in 结果['mappings'][类别] if 数字.isdigit()}
    已有ID = {数字 for 类别 in ['自身增益', '目标增益']
            for 数字 in 心法['aliases'].get(类别, {}) if 数字.isdigit()}
    候选 = defaultdict(list)
    for 行 in 增益行:
        数字 = 行['ID']
        if not 数字.isdigit() or str(int(数字)) in 已建模ID | 已有ID:
            continue
        数字 = str(int(数字))
        UI列表 = [UI for UI in UI增益.get(数字, []) if UI.get('Name')]
        if not UI列表:
            continue
        依据 = []
        命中动作 = sorted(名称 for 名称 in 动作名称 if 名称 in (行.get('Name') or '') or
                     any(UI['Name'] == 名称 for UI in UI列表))
        if 命中动作:
            依据.append('原表名含原动作名或 UI 名与动作名相同：' + '、'.join(命中动作))
        if not 依据:
            continue
        候选[数字].append({'rawLine': 行['_line'], 'rawName': 行.get('Name', ''),
            'uiLines': sorted({UI['_line'] for UI in UI列表}),
            'uiNames': sorted({UI['Name'] for UI in UI列表}), 'clues': 依据,
            **{字段: 行.get(字段, '') for 字段 in ['Level', 'BuffType', 'Hide',
                'OnKungfuID', 'Count', 'Interval', 'MaxStackNum', 'ScriptFile']}})
    return [{'id': 数字, 'rows': 行, 'status': '未绑定；需确认门派、对象和原状态来源，不能按缺席判定'}
            for 数字, 行 in sorted(候选.items(), key=lambda 项: int(项[0]))]


def 主流程():
    参数 = argparse.ArgumentParser(description=__doc__)
    参数.add_argument('--tables', required=True, type=Path, help='包含 settings/skill、ui/scheme/case 的表目录')
    参数.add_argument('--runtime', required=True, type=Path, help='导出原模拟器名单.cjs 输出的 JSON')
    参数.add_argument('--output', required=True, type=Path, help='仓库外的产物目录')
    参数.add_argument('--version', required=True, help='数据版本标签；未知时明确填写未知')
    选项 = 参数.parse_args()
    项目目录 = next((目录 for 目录 in Path(__file__).resolve().parents if (目录 / 'package.json').is_file()), None)
    if 项目目录 and 选项.output.resolve().is_relative_to(项目目录):
        raise ValueError('输出必须放在项目目录外')
    原名单字节 = 选项.runtime.read_bytes()
    原名单 = json.loads(原名单字节.decode('utf-8-sig'))
    if not isinstance(原名单, dict) or 原名单.get('schema') != 1 or not isinstance(原名单.get('hearts'), list):
        raise ValueError('原名单格式不正确，需要 schema=1 与 hearts 数组')
    表定义 = [('settings/skill/Skills.tab', ['SkillID', 'SkillName', 'IsPassiveSkill', 'UIType', 'CastMode']),
             ('ui/scheme/case/skill.txt', ['SkillID', 'Name', 'CanDrag']),
             ('settings/skill/Buff.tab', ['ID', 'Name', 'Level']),
             ('ui/scheme/case/buff.txt', ['BuffID', 'Name'])]
    已读 = [读取表(选项.tables, 路径, 字段) for 路径, 字段 in 表定义]
    UI技能, UI增益 = defaultdict(list), defaultdict(list)
    for 字段, 索引, 行列表 in [('SkillID', UI技能, 已读[1][0]), ('BuffID', UI增益, 已读[3][0])]:
        for 行 in 行列表:
            if 行[字段] and 行[字段].isdigit():
                索引[str(int(行[字段]))].append(行)
    心法结果 = [提取心法(心法, 已读[0][0], UI技能, 已读[2][0], UI增益) for 心法 in 原名单['hearts']]
    for 心法, 结果 in zip(原名单['hearts'], 心法结果):
        结果['unmodeledBuffCandidates'] = 提取未建模增益(心法, 结果, 已读[2][0], UI增益)
    选项.output.mkdir(parents=True, exist_ok=True)
    报告 = {'schema': 1, 'version': 选项.version, 'sources': [项[1] for 项 in 已读],
            'runtimeSha256': hashlib.sha256(原名单字节).hexdigest(),
            'runtimeSources': {心法['heart']: 心法.get('sources', []) for 心法 in 原名单['hearts']},
            'status': '候选，尚未合并；表内存在不证明当前会调用，须核对版本、有效入口、等级和对象；未建模状态不能按缺席判定', 'hearts': 心法结果}
    (选项.output / '映射核对.json').write_text(json.dumps(报告, ensure_ascii=False, indent=2), encoding='utf-8')
    for 心法 in 心法结果:
        if Path(心法['heart']).name != 心法['heart'] or 心法['heart'] in ['.', '..']:
            raise ValueError('非法心法名称')
        草稿 = '// 表数据候选；核对后只合并需要的字段，不替换既有体态、资源和特殊规则。\n'
        草稿 += 'export const 解包映射候选 = ' + json.dumps(心法['mappings'], ensure_ascii=False, indent=2) + '\n'
        (选项.output / (心法['heart'] + '.候选.ts')).write_text(草稿, encoding='utf-8')
    print(json.dumps({'hearts': len(心法结果), 'counts': {心法['heart']: {类别: len(映射) for 类别, 映射 in 心法['mappings'].items()} for 心法 in 心法结果}}, ensure_ascii=True))


if __name__ == '__main__':
    主流程()
