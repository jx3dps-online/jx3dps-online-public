import { 属性类型 } from '@/@types/属性'
import { 技能增益列表类型 } from '@/@types/技能'

const 日月连璧: 技能增益列表类型[] = [
  {
    BuffId: 33107,
    增益名称: '日月连璧',
    增益所在位置: '技能',
    增益类型: '部分启用',
    增益集合: [{ 属性: 属性类型.易伤增伤, 值: Math.ceil(-921.6) / 1024 }],
  },
]

export default 日月连璧
