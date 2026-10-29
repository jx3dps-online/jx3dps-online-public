import type { 心法说明 } from '../类型'
import { 解析条件 } from '../核心/解析'
import { 创建名称导出 } from '../核心/名称'
import { 创建增益能力目录, 描述条件能力, 获取增益能力 } from '../核心/条件能力'
import type { 条件原子, 观察记录, 生成动作 } from './类型'

export const 校验生成条件 = (文本: string, 说明: 心法说明, 允许数字IDBuff = false) => {
  const 分项 = 文本.replace(/\s+/g, '').split(/[&|]/)
  if (分项.some((项) => /(?:>=|<=|~=|=|>|<)[+-]?\d*\.\d{2,}$/.test(项)))
    throw new Error('生成和压缩宏的数字判断最多保留一位小数：' + 文本)
  解析条件(文本, 说明)
  for (const 项 of 分项) {
    const 增益 = 项.match(/^(bufftime|tbufftime|buff|tbuff|nobuff|tnobuff):([^<>=~]+)/)
    if (!增益) continue
    const 前缀 = 增益[1]
    const 输入 = 增益[2]
    const 数字ID = /^\d+$/.test(输入)
    if (数字ID && !允许数字IDBuff)
      throw new Error('当前生成设置不允许数字 ID Buff 条件，请启用“允许数字 ID Buff 条件”：' + 输入)
    const 能力 = 获取增益能力(说明, 前缀.startsWith('t') ? '目标' : '自身', 输入)
    if (能力.隐藏 && !数字ID)
      throw new Error(
        '隐藏增益不能使用名称生成或续算；请开启数字 ID 选项并使用已映射的数字 ID：' + 输入,
      )
  }
}

// 沿用 Rust candidate_atoms 的运算符及阈值策略，仅替换心法字段/名称目录。
export const 创建条件目录 = (
  说明: 心法说明,
  记录: 观察记录[],
  动作: 生成动作[],
  允许数字IDBuff = false,
): 条件原子[] => {
  const 文本 = new Set<string>()
  const 名称导出 = 创建名称导出(说明)
  const 增益能力 = 创建增益能力目录(说明, 允许数字IDBuff)
  const 数值 = (字段: string, 值: number) => {
    for (const 比较 of ['=', '<', '>']) 文本.add(字段 + 比较 + Number(值.toFixed(1)))
  }
  for (const 项 of 动作.filter((项) => 项.命令 === 'cast')) {
    const 名称 = 名称导出.技能(项.技能)
    文本.add('last_skill=' + 名称)
    文本.add('last_skill~=' + 名称)
    文本.add('skill_notin_cd:' + 名称)
  }
  for (const 名称 of 说明.调息查询技能 || []) 文本.add('skill_notin_cd:' + 名称)
  for (const 能力 of 增益能力) {
    const 前缀 = 能力.对象 === '目标' ? 't' : ''
    文本.add(前缀 + 'buff:' + 能力.名称)
    文本.add(前缀 + 'nobuff:' + 能力.名称)
  }
  for (const { 状态 } of 记录) {
    for (const 字段 of 说明.数值字段) {
      if (说明.未支持条件?.[字段]) continue
      const 值 = 状态.数值[字段]
      if (Number.isFinite(值)) 数值(字段, 说明.小数字段.includes(字段) ? 值 : Math.trunc(值))
    }
    for (const [技能, 数据] of Object.entries(状态.技能))
      if (说明.充能技能?.includes(技能) && Number.isFinite(数据.充能))
        数值('skill_energy:' + 名称导出.技能(技能), 数据.充能)
    for (const 能力 of 增益能力) {
      const 前缀 = 能力.对象 === '目标' ? 't' : ''
      const 列表 = 能力.对象 === '目标' ? 状态.目标增益 : 状态.自身增益
      for (const 名称 of 能力.实体) {
        const 增益 = 列表[名称]
        if (!增益 || 增益.层数 <= 0) continue
        const 导出名称 = 能力.名称
        数值(前缀 + 'buff:' + 导出名称, 增益.层数)
        if (Number.isInteger(增益.层数)) {
          if (增益.层数 < 4294967295) 文本.add(前缀 + 'buff:' + 导出名称 + '<' + (增益.层数 + 1))
          if (增益.层数 > 1) 文本.add(前缀 + 'buff:' + 导出名称 + '>' + (增益.层数 - 1))
        }
        const 剩余 = 增益.剩余帧 / 状态.每秒帧
        if (!能力.永久 && !能力.无计时 && Number.isFinite(剩余) && 剩余 > 0)
          for (const 值 of [
            Math.floor(剩余 * 10) / 10,
            Math.ceil(剩余 * 10) / 10,
            Math.floor(剩余),
          ])
            for (const 比较 of ['<', '>'])
              文本.add(前缀 + 'bufftime:' + 导出名称 + 比较 + Number(值.toFixed(1)))
      }
    }
  }
  return [...文本]
    .filter((项) => !/^t?buff:[^<>=~]+(?:<1|=0|<=0)$/.test(项))
    .sort()
    .map((文本) => {
      const 条件 = 解析条件(文本, 说明)
      return { 文本, 条件, 能力: 描述条件能力(条件, 'teacher-derived', 说明) }
    })
}
