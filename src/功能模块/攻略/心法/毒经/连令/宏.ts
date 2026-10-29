import type { 宏块数据 } from '../../../components'

const 爆发宏 = [
  '/cast 灵蛇引',
  '/cast nobuff:令怖|buff:令怖<2 灵蛊',
  '/cast bufftime:引魂<11 连缘蛊',
  '/cast 蝎心',
  '/fcast 攻击',
  '/fcast 幻击',
].join('\n')

const 循环宏 = [
  '/cast last_skill=蛇影 百足',
  '/cast bufftime:引魂<2 蛇影',
  '/cast tnobuff:蟾啸 蟾啸',
  '/cast moon=23&tbufftime:百足<4|buff:令怖>6 千丝·蛛魄',
  '/cast 蝎心',
  '/fcast 幻击',
].join('\n')

const 早千循环宏 = [
  '/cast tnobuff:蟾啸 蟾啸',
  '/cast buff:令怖>6|moon=23 千丝·蛛魄',
  '/cast last_skill=蛇影 百足',
  '/cast bufftime:引魂<2.8 蛇影',
  '/cast 蝎心',
  '/cast 凤凰蛊',
  '/fcast 幻击',
].join('\n')

/** 「连缘」两段宏（紫武通用） */
export const 连令宏列表: 宏块数据[] = [
  { 标题: '爆发宏 | 云端宏：莴苣#连缘爆发', 内容: 爆发宏 },
  { 标题: '循环宏 | 云端宏：莴苣#连缘循环', 内容: 循环宏 },
  { 标题: '早千循环宏 | 云端宏：莴苣#连缘早千循环', 内容: 早千循环宏 },
]
