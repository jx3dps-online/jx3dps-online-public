import { 技能额外信息分隔符 } from '../通用/通用函数'
import { 循环基础技能数据类型 } from './simulator/type'
import { 切换武器选项 } from './武器切换'

export const 拆分循环文本 = (文本: string) => {
  const 节点: string[] = []
  let 深度 = 0
  let 引号内 = false
  let 转义 = false
  let 开始 = 0
  for (let 索引 = 0; 索引 < 文本.length; 索引++) {
    const 字符 = 文本[索引]
    if (引号内) {
      if (转义) 转义 = false
      else if (字符 === '\\') 转义 = true
      else if (字符 === '"') 引号内 = false
    } else if (字符 === '"') 引号内 = true
    else if (字符 === '{' || 字符 === '[') 深度++
    else if (字符 === '}' || 字符 === ']') 深度--
    else if (字符 === ',' && 深度 === 0) {
      节点.push(文本.slice(开始, 索引).trim())
      开始 = 索引 + 1
    }
    if (深度 < 0) throw new Error('循环文本中的JSON边界无效')
  }
  if (深度 !== 0 || 引号内) throw new Error('循环文本中的JSON参数不完整')
  节点.push(文本.slice(开始).trim())
  return 节点
}

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
