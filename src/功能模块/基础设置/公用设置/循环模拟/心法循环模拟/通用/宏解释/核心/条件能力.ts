import type { 宏条件, 心法说明 } from '../类型'
import { 创建名称导出 } from './名称'

export interface 增益条件能力 {
  对象: '自身' | '目标'
  名称: string
  实体: string[]
  永久: boolean
  无计时: boolean
  隐藏: boolean
  聚合: 'some'
}

export const 获取增益能力 = (说明: 心法说明, 对象: '自身' | '目标', 输入: string): 增益条件能力 => {
  const ID = /^\d+$/.test(输入) ? String(Number(输入)) : undefined
  if (ID && (!Number.isSafeInteger(Number(ID)) || Number(ID) > 4294967295))
    throw new Error('增益 ID 超出范围：' + 输入)
  const 支持 = 对象 === '自身' ? 说明.自身增益 : 说明.目标增益
  const 映射 = 对象 === '自身' ? 说明.映射.自身增益 : 说明.映射.目标增益
  const 名称 = ID && 说明.增益ID?.[ID]?.[对象] ? ID : (映射[ID || 输入] ?? 输入)
  const 同ID = /^\d+$/.test(名称) ? 说明.增益ID?.[名称]?.[对象] : undefined
  const 实体 = 同ID ?? [名称]
  if (实体.some((项) => 说明.禁用增益?.[对象]?.includes(项)))
    throw new Error('该增益已禁用宏判定：' + 输入)
  if (!实体.length || 实体.some((项) => !支持.includes(项)))
    throw new Error('未知或未映射的' + 对象 + '增益：' + 输入)
  return {
    对象,
    名称,
    实体: [...实体],
    永久: 实体.some((项) => 说明.永久增益?.[对象]?.includes(项)),
    无计时: 实体.some((项) => 说明.无计时增益?.[对象]?.includes(项)),
    隐藏: 实体.some((项) => 说明.隐藏增益?.[对象]?.includes(项)),
    聚合: 'some',
  }
}

export const 创建增益能力目录 = (说明: 心法说明, 允许数字IDBuff = false): 增益条件能力[] => {
  const 导出 = 创建名称导出(说明)
  const 目录: 增益条件能力[] = []
  for (const 对象 of ['自身', '目标'] as const) {
    const 支持 = 对象 === '自身' ? 说明.自身增益 : 说明.目标增益
    const 名称导出 = 对象 === '自身' ? 导出.自身增益 : 导出.目标增益
    const 分组实体 = new Set<string>()
    const 映射 = 说明.映射[对象 === '自身' ? '自身增益' : '目标增益']
    for (const [别名, ID] of Object.entries(映射)) {
      const 实体 = /^\d+$/.test(ID) ? 说明.增益ID?.[ID]?.[对象] : undefined
      if (
        /^\d+$/.test(别名) ||
        !实体?.length ||
        实体.some((项) => !支持.includes(项) || 说明.禁用增益?.[对象]?.includes(项))
      )
        continue
      const 能力 = 获取增益能力(说明, 对象, 别名)
      if (能力.隐藏) continue
      目录.push({ ...能力, 名称: 别名 })
      for (const 名称 of 实体) 分组实体.add(名称)
    }
    for (const 名称 of new Set(支持)) {
      if (说明.禁用增益?.[对象]?.includes(名称) || 分组实体.has(名称)) continue
      const 导出名称 = 名称导出(名称)
      if (!允许数字IDBuff && /^\d+$/.test(导出名称)) continue
      const 能力 = 获取增益能力(说明, 对象, 名称)
      if (能力.隐藏) continue
      目录.push({ ...能力, 名称: 导出名称 })
    }
    if (!允许数字IDBuff) continue
    const 数字ID = new Set([
      ...Object.keys(说明.增益ID ?? {}),
      ...Object.keys(映射).filter((名称) => /^\d+$/.test(名称)),
    ])
    for (const ID of 数字ID) {
      const 实体 = 说明.增益ID?.[ID]?.[对象] ?? (映射[ID] ? [映射[ID]] : [])
      if (
        !实体.length ||
        实体.some((项) => !支持.includes(项) || 说明.禁用增益?.[对象]?.includes(项))
      )
        continue
      const 能力 = 获取增益能力(说明, 对象, ID)
      if (!能力.隐藏 && 实体.length < 2) continue
      const 数字名称 = String(Number(ID))
      if (!目录.some((项) => 项.对象 === 对象 && 项.名称 === 数字名称))
        目录.push({ ...能力, 名称: 数字名称 })
    }
  }
  return 目录
}

export const 描述条件能力 = (条件: 宏条件, 来源: string, 说明?: 心法说明) => {
  const 叶: unknown[] = []
  const 读取 = new Set<string>()
  const 唤醒 = new Set<string>()
  const 栈 = [条件]
  while (栈.length) {
    const 项 = 栈.pop()!
    if (项.类型 === '且' || 项.类型 === '或') {
      叶.push(项.类型)
      栈.push(项.右, 项.左)
      continue
    }
    if (项.类型 === '增益') {
      const 实体 = [...new Set(项.同ID名称 ?? [项.名称])].sort()
      叶.push({ ...项, 名称: 实体, 同ID名称: undefined, 聚合: 'some' })
      for (const 名称 of 实体) {
        const 依赖 = 'buff:' + 项.对象 + ':' + 名称
        读取.add(依赖)
        if (项.时间) 唤醒.add(依赖)
      }
    } else {
      叶.push(项)
      if (项.类型 === '技能') {
        读取.add('skill:' + 项.名称 + ':' + 项.字段)
        if (项.字段 === '冷却帧') for (const 依赖 of 说明?.调息依赖?.[项.名称] ?? []) 读取.add(依赖)
      } else if (项.类型 === '数值' || 项.类型 === '充盈') {
        读取.add('value:' + 项.字段)
        if (项.类型 === '数值' && typeof 项.值 === 'string') 读取.add('value:' + 项.值)
      } else if (项.类型 === '上个技能') 读取.add('last_skill')
      else if (项.类型 === '奇穴') 读取.add('talent:' + 项.名称)
    }
  }
  return {
    atom_id: JSON.stringify(叶),
    kind:
      条件.类型 === '技能' && 条件.字段 === '冷却帧' ? 'readiness' : 唤醒.size ? 'timer' : 'state',
    entity: [...读取].sort().join('|'),
    read_dependencies: [...读取].sort(),
    wake_dependencies: [...唤醒].sort(),
    source: 来源,
    semantic_version: 'macro-conditions-v3',
  }
}
