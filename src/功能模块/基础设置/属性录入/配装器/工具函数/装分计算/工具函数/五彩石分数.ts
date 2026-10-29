// 参考魔盒计算装分js

import { 系数_A, 系数_C } from './系数'
import { 客户端类型 } from '../type'

/**
 * 五彩石分数
 * 公式：等级 * (系数A * 系数C) * 3.5
 * @param {*} 等级
 * @param {string} 客户端 （客户端版本）
 * @return {*}
 */
export function 获取五彩石分数(等级, 客户端: 客户端类型 = '旗舰') {
  let 分数 = 0
  if (客户端 === '旗舰') {
    分数 = ((等级 * (系数_A[客户端] * 系数_C[客户端]) * 3.5) / 27600) * 1400
  } else {
    分数 = 等级 * 123.2
  }
  return 分数
}

export function 获取五彩石名称分数(五彩石?: string) {
  if (!五彩石) {
    return 0
  }
  return 获取五彩石分数(五彩石.includes('陆') ? 6 : 5)
}
