import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型 } from './type'

export const 根据奇穴修改buff数据 = (奇穴: string[]) => {
  const res = {}
  Object.keys(原始Buff数据).forEach((key) => {
    res[key] = 原始Buff数据[key]
  })
  return res
}

export const 根据奇穴秘籍修改技能数据 = (奇穴: string[]): 循环基础技能数据类型[] => {
  return 循环模拟技能基础数据.map((技能) => 技能)
}

export const ERROR_ACTION = {
  充能不足: {
    信息: '当前技能没有可释放层数',
  },
  BUFF错误: {
    信息: '当前没有对应的BUFF',
  },
}

export const 转化buff和增益名称 = (增益名称, buff列表) => {
  return buff列表?.[增益名称]
}
