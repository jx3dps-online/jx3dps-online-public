export interface 说明定位 {
  文档?: string
  章节?: string
  心法?: string
}

export type 行内内容 =
  | { 类型: '文本' | '强调' | '斜体' | '代码'; 文本: string }
  | { 类型: '链接' | '图片'; 文本: string; 地址: string }
  | { 类型: '说明链接'; 文本: string; 文档: string; 章节: string }

export type 正文块 =
  | { 类型: '段落' | '标题'; 内容: 行内内容[] }
  | { 类型: '代码块'; 语言: string; 文本: string }
  | { 类型: '列表'; 有序: boolean; 项: 行内内容[][] }
  | { 类型: '表格'; 表头: 行内内容[][]; 行: 行内内容[][][] }

export interface 章节索引 {
  标识: string
  标题: string
  关键词: string[]
  常见问法: string[]
  心法: string[]
  用途: '通用' | '配装' | '循环研究'
  简答: string
  搜索文本: string
}

export interface 文档索引 {
  标识: string
  标题: string
  模块: string
  顺序: number
  文件: string
  章节: 章节索引[]
}

export interface 说明目录 {
  格式版本: number
  内容版本: string
  模块顺序: string[]
  文档: 文档索引[]
}

export interface 说明正文 {
  格式版本: number
  内容版本: string
  文档: Omit<文档索引, '文件' | '章节'> & {
    章节: (章节索引 & { 内容: 正文块[] })[]
  }
}

export interface 检索结果 {
  文档: 文档索引
  章节: 章节索引
}
