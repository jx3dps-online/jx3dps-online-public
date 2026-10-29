import { 循环技能详情 } from '@/@types/循环'
import { 傲血循环修正 } from './傲血/循环修正'

export const 修正心法计算循环 = (
  循环: 循环技能详情[],
  心法名称: string | undefined,
  增益启用: boolean,
  特殊配置?: Record<string, any>,
): 循环技能详情[] => {
  if (心法名称 === '傲血战意') {
    return 傲血循环修正(循环, 增益启用, 特殊配置)
  }
  return 循环
}
