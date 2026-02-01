// import { 每秒郭氏帧 } from '../constant'
import 循环模拟技能基础数据, { 原始Buff数据 } from '../constant/skill'
import { 循环基础技能数据类型 } from './type'

export const 根据奇穴修改buff数据 = () => {
  // const res = {}

  // Object.keys(原始Buff数据).forEach((key) => {
  //   const obj = 原始Buff数据[key]
  //   res[key] = obj
  // })

  return 原始Buff数据
}

export const 根据奇穴秘籍修改技能数据 = (): 循环基础技能数据类型[] => {
  // const 判断奇穴 = (val) => {
  //   return 奇穴?.includes(val)
  // }

  return 循环模拟技能基础数据
}

export const ERROR_ACTION = {
  锐意不足: {
    信息: '当前锐意不足，无法释放该技能',
  },
  身形不足: {
    信息: '当前身形不足，无法释放该技能',
  },
  体态错误: {
    信息: '当前体态无法释放该技能',
  },
  BUFF错误: {
    信息: '当前没有对应的BUFF',
  },
}

export const 转化buff和增益名称 = (增益名称, buff列表, 判定增益层数) => {
  if (判定增益层数) {
    // 优先查找对应名称的BUFF
    const buff数据 = buff列表?.[增益名称]
    if (buff数据 && buff数据.当前层数 === +判定增益层数) {
      return buff数据
    }
    // 特殊处理：无界_通用增伤_5映射到堙灭BUFF
    if (增益名称 === '无界_通用增伤_5') {
      const 堙灭buff数据 = buff列表?.['堙灭']
      if (堙灭buff数据 && 堙灭buff数据.当前层数 === +判定增益层数) {
        return 堙灭buff数据
      }
    }
    return undefined
  } else {
    // 优先查找对应名称的BUFF
    let buff数据 = buff列表?.[增益名称]
    if (buff数据) {
      return buff数据
    }
    // 特殊处理：明灯·悟映射到明灯BUFF，灵灯·悟映射到灵灯BUFF
    if (增益名称 === '明灯·悟') {
      buff数据 = buff列表?.['明灯']
      if (buff数据) {
        return buff数据
      }
    }
    if (增益名称 === '灵灯·悟') {
      buff数据 = buff列表?.['灵灯']
      if (buff数据) {
        return buff数据
      }
    }
    return undefined
  }
}
