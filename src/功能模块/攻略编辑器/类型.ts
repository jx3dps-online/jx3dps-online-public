export interface 内容节点 {
  标签: string
  属性?: Record<string, unknown>
  子?: (内容节点 | string)[]
}
export interface 内容块 {
  id: string
  类型: string
  [字段: string]: unknown
}
export interface 攻略文档 {
  版本: 1
  心法: string
  攻略名: string
  标题: string
  模式: '全屏' | '计算结果'
  作者: string
  原文: string
  循环署名: string
  绑定循环: string[]
  预览循环: string
  blocks: 内容块[]
}
export interface 编辑字段 {
  键: string
  名称: string
  类型?: '富文本' | '多行' | '数字' | '开关' | '选项' | '条目' | '宏' | '表格'
  选项?: string[]
  候选?: '奇穴' | '增益' | '装备' | '附魔' | '技能'
}
export interface 组件定义 {
  名称: string
  分类: string
  默认值: Record<string, unknown>
  字段: 编辑字段[]
  校验?: (块: 内容块) => void
  构建: (块: 内容块) => 内容节点
}
