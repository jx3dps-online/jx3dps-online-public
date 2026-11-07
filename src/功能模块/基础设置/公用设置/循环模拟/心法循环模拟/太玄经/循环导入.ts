import { 技能额外信息分隔符 } from '../通用/通用函数'
import { 循环基础技能数据类型 } from './simulator/type'
import { 切换武器选项 } from './武器切换'

export { 拆分循环文本 } from '../通用/通用函数/拆分循环文本'

export const 转换技能序列 = (节点: string[], 基础技能: 循环基础技能数据类型[]) =>
  节点.map((文本) => {
    const 分隔位置 = 文本.indexOf(技能额外信息分隔符)
    const 名称 = 分隔位置 < 0 ? 文本 : 文本.slice(0, 分隔位置)
    const 技能 = 基础技能.find((项) => 项.技能名称 === 名称)
    if (!技能) throw new Error(`未知技能：${名称 || '空节点'}`)
    const 额外信息 = 分隔位置 < 0 ? undefined : JSON.parse(文本.slice(分隔位置 + 1))
    if (
      额外信息 !== undefined &&
      (!额外信息 || typeof 额外信息 !== 'object' || Array.isArray(额外信息))
    )
      throw new Error(`${名称}参数必须是JSON对象`)
    if (名称 === '切换武器' && !切换武器选项.some((项) => 项.value === 额外信息?.目标武器ID))
      throw new Error('切换武器缺少有效的目标武器ID')
    return { ...技能, 额外信息 }
  })
