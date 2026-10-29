import type { 心法说明 } from '../类型'
import { 解析宏, 解析条件 } from '../核心/解析'
import { 校验生成条件 } from './条件目录'
import type { 生成动作 } from './类型'

export const 解析续算宏 = (
  文本: string,
  说明: 心法说明,
  动作: 生成动作[],
  阶段: '生成' | '压缩' = '生成',
  允许数字IDBuff = false,
) => {
  const 配置 = 解析宏(文本, 说明)
  if (配置.页.length !== 1 || 配置.页[0].体态 !== undefined)
    throw new Error('续算仅支持生成阶段的一页宏')
  const 行文本 = 文本.split(/\r\n|\n|\r/)
  return 配置.页[0].语句.map((行) => {
    if (行.命令 === 'mcast') throw new Error('续算不支持超级宏调用')
    const 索引 = 动作.findIndex((项) => 项.技能 === 行.技能 && 项.命令 === 行.命令)
    if (索引 < 0) throw new Error('续算宏包含当前目标循环没有的动作：' + 行.技能)
    const 内容 = 行文本[行.行号 - 1].trim().replace(/^\/(?:cast|fcast)\s+/, '')
    const 条件 = 内容.startsWith('[')
      ? 内容.slice(1, 内容.indexOf(']'))
      : /\s/.test(内容)
        ? 内容.slice(0, 内容.search(/\s+\S+$/))
        : ''
    if (阶段 === '生成' && 条件.includes('|'))
      throw new Error('含 OR 的宏需要按压缩阶段恢复并重新认证')
    校验生成条件(条件, 说明, 允许数字IDBuff)
    const 分段 = 条件 ? 条件.split(/([&|])/).map((项) => 项.trim()) : []
    return {
      action: 索引,
      atoms: 分段
        .filter((_, 位置) => 位置 % 2 === 0)
        .map((文本) => {
          const 原子 = 解析条件(文本, 说明)
          if (!('值' in 原子) || typeof 原子.值 !== 'number') return 文本
          const 数值 = String(原子.值)
          return 文本.replace(
            /([<>=~])([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/,
            (_, 符, 原文) =>
              符 +
              (Number.isFinite(原子.值) && !/[eE]/.test(数值) ? 数值 : 原文.replace(/\.0$/, '')),
          )
        }),
      ops: 分段.filter((_, 位置) => 位置 % 2 === 1),
    }
  })
}
