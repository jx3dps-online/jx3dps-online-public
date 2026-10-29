/**
 * @name 业务算法函数工具
 * @description 对于剑三数据的一些业务算法工具
 */
import { 增益选项数据类型 } from '@/@types/团队增益'
import { 属性类型 } from '@/@types/属性'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取阈值 } from './加速阈值'
export { 获取实际帧数, 获取倒读条实际帧数分布 } from './加速阈值'

// 由于存在负数（贪破），使用位预算需要额外判断，这里继续使用Math.floor
// 经过测试 Math.floor / 1024 和 >>> 10 的位运算逻辑性能差距小于10% 为兼容性考虑不采用位运算
export const 获取郭氏结果值 = (原值 = 0, 郭氏值 = 0) => {
  return Math.floor((原值 * 郭氏值) / 1024)
}

export const 获取郭氏加成值 = (原值 = 0, 郭氏值 = 0) => {
  return 原值 + (郭氏值 ? 获取郭氏结果值(原值, 郭氏值) : 0)
}

export const 获取非郭氏结果值 = (原值 = 0, 郭氏值 = 0) => {
  return (原值 * 郭氏值) / 1024
}

export const 获取非郭氏加成值 = (原值 = 0, 郭氏值 = 0) => {
  return 原值 + (郭氏值 ? 获取非郭氏结果值(原值, 郭氏值) : 0)
}

export const 获取加速等级分界 = (): number[] => {
  const { 基础GCD = 1.5 } = 获取当前数据()
  return 基础GCD === 1.5 ? [10, 445, 928, 1452, 2024] : [10, 682, 1452, 2340]
}

export const 获取加速等级 = (number) => {
  const 加速值 = number || 0
  return 获取加速等级分界().filter((分界) => 加速值 >= 分界).length
}

export const 获取档位加速值 = () => {
  const { 基础GCD = 1.5 } = 获取当前数据()
  return 获取阈值(基础GCD === 1.5 ? 24 : 16, 5)
}

export const 计算增益数据中加速值 = (增益数据: 增益选项数据类型) => {
  const { 小药小吃 } = 获取当前数据()
  let number = 0
  ;(增益数据.小吃 || []).forEach((item) => {
    const 当前小药 = 小药小吃.find((a) => a.小吃名称 === item)
    if (当前小药 && 当前小药.增益集合?.length) {
      当前小药.增益集合.forEach((a) => {
        if (a.属性 === 属性类型.加速等级) {
          number = number + a.值
        }
      })
    }
  })
  return number
}
