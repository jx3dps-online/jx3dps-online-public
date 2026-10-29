import 简写映射 from '@/心法模块/简写映射.json'
import { 是对象, 生成id } from '@/工具函数/本地存储'
import { 组件目录, 节点, 新建块 } from './组件定义'
import { 清洗富文本, 安全地址 } from './富文本转换'
import type { 攻略文档, 内容块, 内容节点 } from './类型'

export const 心法列表 = [...new Set(Object.values(简写映射))]
export const 新建文档 = (心法 = '凌海诀'): 攻略文档 => ({
  版本: 1,
  心法,
  攻略名: '',
  标题: '',
  模式: '计算结果',
  作者: '',
  原文: '',
  循环署名: '',
  绑定循环: [],
  预览循环: '',
  blocks: [新建块('标题'), 新建块('段落')],
})

export function 导入文档(原文: string, 允许未完成 = false): 攻略文档 {
  if (new Blob([原文]).size > 2 * 1024 * 1024) throw new Error('稿件超过 2 MiB')
  const 值 = JSON.parse(原文)
  if (!是对象(值) || (值.版本 !== undefined && 值.版本 !== 1)) throw new Error('不支持的稿件版本')
  if (!心法列表.includes(值.心法) || !Array.isArray(值.blocks) || 值.blocks.length > 500)
    throw new Error('心法无效或内容块超过 500 个')
  const 结果 = { ...新建文档(值.心法), ...值, 版本: 1 } as 攻略文档
  for (const 键 of ['攻略名', '标题', '作者', '原文', '循环署名', '预览循环'] as const) {
    if (typeof 结果[键] !== 'string') throw new Error(`${键}必须是文字`)
  }
  if (!['全屏', '计算结果'].includes(结果.模式)) throw new Error('无效的展示模式')
  if (!Array.isArray(结果.绑定循环) || !结果.绑定循环.every((项) => typeof 项 === 'string'))
    throw new Error('绑定循环格式错误')
  if (!允许未完成) 安全地址(结果.原文)
  const 已有标识 = new Set<string>()
  结果.blocks = 值.blocks.map((原块, 索引) => {
    try {
      if (
        !是对象(原块) ||
        typeof 原块.类型 !== 'string' ||
        !Object.prototype.hasOwnProperty.call(组件目录, 原块.类型)
      )
        throw new Error('未知内容块')
      const 定义 = 组件目录[原块.类型]
      const 块: 内容块 = {
        ...JSON.parse(JSON.stringify(定义.默认值)),
        ...原块,
        id: typeof 原块.id === 'string' && !已有标识.has(原块.id) ? 原块.id : 生成id(),
      }
      已有标识.add(块.id)
      for (const 字段 of 定义.字段) {
        const 内容 = 块[字段.键]
        if (字段.类型 === '开关') {
          if (typeof 内容 !== 'boolean') throw new Error(`${字段.名称}必须为开关`)
        } else if (字段.类型 === '数字') {
          if (
            !['string', 'number'].includes(typeof 内容) ||
            !Number.isFinite(Number(内容)) ||
            Number(内容) < 0
          )
            throw new Error(`${字段.名称}不是有效数字`)
        } else if (字段.类型 === '选项') {
          if (!字段.选项?.includes(String(内容))) throw new Error(`${字段.名称}选项无效`)
        } else if (字段.类型 === '条目') {
          if (!Array.isArray(内容) || !内容.every((项) => typeof 项 === 'string'))
            throw new Error('条目格式错误')
          块[字段.键] = 内容.map(清洗富文本)
        } else if (字段.类型 === '宏') {
          if (
            !Array.isArray(内容) ||
            !内容.every(
              (项) =>
                是对象(项) &&
                typeof 项.内容 === 'string' &&
                (项.标题 === undefined || typeof 项.标题 === 'string'),
            )
          )
            throw new Error('宏段落格式错误')
        } else if (字段.类型 === '表格') {
          if (
            !Array.isArray(块.表头) ||
            !块.表头.length ||
            块.表头.length > 30 ||
            !块.表头.every((项) => typeof 项 === 'string')
          )
            throw new Error('表头格式错误或超过 30 列')
          if (
            !Array.isArray(内容) ||
            内容.length > 100 ||
            !内容.every(
              (行) =>
                Array.isArray(行) && 行.length <= 30 && 行.every((项) => typeof 项 === 'string'),
            )
          )
            throw new Error('表格格式错误或超过 100 行')
          if (
            !Array.isArray(块.列宽) ||
            !块.列宽.every((项) => Number.isFinite(Number(项)) && Number(项) >= 0)
          )
            throw new Error('列宽格式错误')
          块.表头 = 块.表头.map(清洗富文本)
          块.行 = 内容.map((行) => 行.map(清洗富文本))
        } else {
          if (typeof 内容 !== 'string' && !(字段.候选 === '装备' && typeof 内容 === 'number'))
            throw new Error(`${字段.名称}必须是文字`)
          if (字段.类型 === '富文本') 块[字段.键] = 清洗富文本(String(内容))
        }
      }
      if (!允许未完成) {
        const id =
          块.类型 === '装备卡'
            ? 块.装备id
            : 块.类型 === '引用' && ['装备', '附魔'].includes(String(块.种类))
              ? 块.键
              : undefined
        if (id !== undefined && (!Number.isSafeInteger(Number(id)) || Number(id) <= 0))
          throw new Error('装备或附魔 ID 必须是正整数')
        if (块.类型 === '配装' && 块.json) 校验配装(JSON.parse(String(块.json)))
        定义.校验?.(块)
        定义.构建(块)
      }
      return 块
    } catch (错误) {
      throw new Error(`第 ${索引 + 1} 块：${(错误 as Error).message}`)
    }
  })
  return 结果
}

function 校验配装(配装: unknown) {
  if (!是对象(配装)) throw new Error('配装必须是 JSON 对象')
  const 字段列表 = Object.keys(配装)
  if (
    字段列表.length &&
    !字段列表.some((键) => /^(?:_(?:[1-9]|1[0-2])|五彩石|大附魔_伤[帽衣腰腕鞋])$/.test(键))
  )
    throw new Error('未识别到配装字段，请粘贴配装器导出的 JSON')
  for (const [部位, 装备] of Object.entries(配装)) {
    if (/^_(?:[1-9]|1[0-2])$/.test(部位)) {
      if (
        !是对象(装备) ||
        typeof 装备.id !== 'number' ||
        !Number.isSafeInteger(装备.id) ||
        装备.id <= 0
      )
        throw new Error(`配装 ${部位} 缺少有效装备 id`)
      for (const 键 of ['当前精炼等级', '附魔']) {
        if (
          装备[键] !== undefined &&
          (typeof 装备[键] !== 'number' || !Number.isFinite(装备[键]) || 装备[键] < 0)
        )
          throw new Error(`配装 ${部位} 的${键}必须为非负数`)
      }
      if (装备.装备部位 !== undefined && typeof 装备.装备部位 !== 'string')
        throw new Error(`配装 ${部位} 的装备部位必须为文字`)
      if (装备.镶嵌孔数组 !== undefined) {
        if (
          !Array.isArray(装备.镶嵌孔数组) ||
          !装备.镶嵌孔数组.every(
            (孔) =>
              是对象(孔) &&
              (孔.镶嵌类型 === undefined || typeof 孔.镶嵌类型 === 'string') &&
              (孔.镶嵌宝石等级 === undefined ||
                (typeof 孔.镶嵌宝石等级 === 'number' &&
                  Number.isFinite(孔.镶嵌宝石等级) &&
                  孔.镶嵌宝石等级 >= 0)),
          )
        )
          throw new Error(`配装 ${部位} 的镶嵌孔数组格式错误`)
      }
    } else if (部位 === '五彩石') {
      if (typeof 装备 !== 'string') throw new Error('五彩石必须为文字')
    } else if (/^大附魔_伤[帽衣腰腕鞋]$/.test(部位)) {
      if (typeof 装备 !== 'number' || !Number.isFinite(装备)) throw new Error(`${部位}必须为数字`)
    }
  }
}

export function 构建正文(文档: 攻略文档): 内容节点[] {
  const 来源: 内容节点[] = []
  if (文档.作者) 来源.push(节点('标签', { 左: '作者', 右: 文档.作者 }))
  if (文档.循环署名) 来源.push(节点('标签', { 左: '循环', 右: 文档.循环署名 }))
  if (文档.原文)
    来源.push(
      节点('a', { href: 安全地址(文档.原文), target: '_blank', rel: 'noopener noreferrer' }, [
        '查看原文',
      ]),
    )
  return [
    节点('div', { 'data-guide-kind': '来源' }, 来源),
    ...文档.blocks.map((块) =>
      组件目录[块.类型].构建(块.类型 === '连招' && !块.心法 ? { ...块, 心法: 文档.心法 } : 块),
    ),
  ]
}
