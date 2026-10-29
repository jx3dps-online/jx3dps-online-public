import type { 心法说明 } from '../类型'

export interface 宏编辑内容 {
  模式: '单页' | '翻页'
  单页: string
  翻页: string
}

export const 包含分页声明 = (文本: string) => /^\s*#page(?:\s|$)/m.test(文本)

export const 创建宏编辑内容 = (文本: string): 宏编辑内容 =>
  包含分页声明(文本)
    ? { 模式: '翻页', 单页: '', 翻页: 文本 }
    : { 模式: '单页', 单页: 文本, 翻页: '' }

export interface 编辑分页 {
  键: string
  名称: string
  体态?: number
  开始: number
  结束: number
  文本: string
  新增页名?: string
}

// 编辑时允许半成品语法；只识别页头，不绑定命令或改写用户内容。
export const 读取编辑分页 = (文本: string, 说明: 心法说明): 编辑分页[] => {
  const 分页: 编辑分页[] = []
  let 当前页: 编辑分页 = { 键: '页-0', 名称: '通用', 开始: 0, 结束: 0, 文本: '' }
  let 位置 = 0
  for (const 行 of 文本.match(/[^\r\n]*(?:\r\n|\n|\r|$)/g) || []) {
    const 页头 = 行.trim().match(/^#page(?:\s+(\S+))?$/)
    if (页头) {
      当前页.结束 = 位置
      当前页.文本 = 文本.slice(当前页.开始, 位置)
      if (当前页.开始 || 当前页.文本.trim()) 分页.push(当前页)
      const 别名 = 页头[1]
      const 体态 = 别名 === undefined ? undefined : 说明.体态别名[别名]
      const 页名 = 说明.翻页体态 || 说明.体态名称
      const 名称 = Object.keys(页名).find((名称) => 页名[名称] === 体态)
      当前页 = {
        键: '页-' + (分页.length + 1),
        名称: 别名 === undefined ? '通用' : 名称 || 别名,
        体态,
        开始: 位置 + 行.length,
        结束: 0,
        文本: '',
      }
    }
    位置 += 行.length
  }
  当前页.结束 = 文本.length
  当前页.文本 = 文本.slice(当前页.开始)
  if (当前页.开始 || 当前页.文本.trim()) 分页.push(当前页)
  for (const [名称, 体态] of Object.entries(说明.翻页体态 || 说明.体态名称)) {
    if (分页.some((页) => 页.体态 === 体态)) continue
    分页.push({
      键: '体态-' + 体态,
      名称,
      体态,
      开始: 文本.length,
      结束: 文本.length,
      文本: '',
      新增页名: 名称,
    })
  }
  return 分页
}

export const 更新编辑分页 = (文本: string, 页: 编辑分页, 内容: string) => {
  if (页.新增页名) {
    if (!内容) return 文本
    const 分隔 = 文本 && !/[\r\n]$/.test(文本) ? '\n' : ''
    return 文本 + 分隔 + '#page ' + 页.新增页名 + '\n' + 内容
  }
  const 分隔 = 页.结束 < 文本.length && 内容 && !/[\r\n]$/.test(内容) ? '\n' : ''
  return 文本.slice(0, 页.开始) + 内容 + 分隔 + 文本.slice(页.结束)
}
