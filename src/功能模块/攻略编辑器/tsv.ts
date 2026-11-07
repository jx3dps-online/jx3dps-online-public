import { 生成id } from '@/工具函数/本地存储'
import type { 内容块 } from './类型'

/** 与编辑器导入边界一致的单表限制 */
const 行上限 = 100
const 列上限 = 30
const 单元格上限 = 2000

const 转义 = (值: string) =>
  String(值).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 去掉每行尾部因 Excel 复制带出来的空单元格 */
const 去尾空 = (行: string[]) => {
  const 副本 = [...行]
  while (副本.length && !副本[副本.length - 1].trim()) 副本.pop()
  return 副本
}

/** 按空行把表格切成多张表；每张表保留原始行 */
export function 切表格(原文: string): string[][][] {
  const 文本 = String(原文 || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
  const 表列表: string[][][] = []
  let 当前表: string[][] = []
  const 收尾 = () => {
    if (当前表.length) 表列表.push(当前表)
    当前表 = []
  }
  for (const 行 of 文本.split('\n')) {
    if (!行.trim()) {
      收尾()
      continue
    }
    const 格 = 去尾空(行.split('\t')).map((项) => 项.trim().slice(0, 单元格上限))
    if (格.length) 当前表.push(格)
  }
  收尾()
  return 表列表
}

/**
 * TSV → 内容块。
 * · 单列表格（1 列、2 行以上）生成「列表」块，符合从 Excel 复制一列技能/条目的习惯
 * · 其余生成「表格」块，首行当表头
 * · 空行分隔的多张表会生成多个块
 */
export function 解析TSV(原文: string): 内容块[] {
  const 表列表 = 切表格(原文)
  if (!表列表.length) throw new Error('TSV 里没有可导入的内容')
  const 块列表: 内容块[] = []
  for (const [序号, 表] of 表列表.entries()) {
    const 列数 = Math.max(...表.map((行) => 行.length))
    if (列数 > 列上限) throw new Error(`第 ${序号 + 1} 张表有 ${列数} 列，超过 ${列上限} 列上限`)
    if (表.length > 行上限 + 1)
      throw new Error(`第 ${序号 + 1} 张表有 ${表.length - 1} 行，超过 ${行上限} 行上限`)
    if (列数 <= 1) {
      const 项 = 表.map((行) => 转义(行[0] || '')).filter((项) => 项.trim())
      if (!项.length) continue
      块列表.push({ id: 生成id(), 类型: '列表', 有序: false, 项 })
      continue
    }
    const 归一 = (行: string[]) => Array.from({ length: 列数 }, (_, i) => 转义(行[i] || ''))
    const [表头行, ...数据行] = 表
    块列表.push({
      id: 生成id(),
      类型: '表格',
      表头: 归一(表头行),
      行: (数据行.length ? 数据行 : [Array(列数).fill('')]).map(归一),
      列宽: [],
    })
  }
  if (!块列表.length) throw new Error('TSV 里没有可导入的内容')
  return 块列表
}

/** 只做统计，用于导入前的提示文案 */
export function 统计TSV(块列表: 内容块[]) {
  const 表格 = 块列表.filter((块) => 块.类型 === '表格')
  const 列表 = 块列表.filter((块) => 块.类型 === '列表')
  return {
    块数: 块列表.length,
    表格数: 表格.length,
    列表数: 列表.length,
    行数:
      表格.reduce((和, 块) => 和 + (块.行 as string[][]).length, 0) +
      列表.reduce((和, 块) => 和 + (块.项 as string[]).length, 0),
  }
}
