import { 装备增益数据类型, 装备增益可选类型类型 } from '@/@types/装备'
import 装备特效数据 from './装备特效数据'

/** 从装备特效数据派生常驻增益表，供计算链路按原结构读取 */
const 装备增益数据: 装备增益数据类型 = {}

Object.keys(装备特效数据).forEach((键) => {
  const 特效键 = 键 as 装备增益可选类型类型
  const 常驻数值 = 装备特效数据[特效键]?.常驻数值
  if (常驻数值?.length) {
    装备增益数据[特效键] = 常驻数值
  }
})

export default 装备增益数据
