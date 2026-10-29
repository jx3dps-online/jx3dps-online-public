import { 获取傲血排除技能增益 } from './傲血/排除技能增益'

/** 各心法计算时需要排除的技能增益统一从这里取，心法规则见各 <心法>/排除技能增益 */
export const 获取心法排除技能增益 = (
  心法名?: string,
  启用增益?: boolean,
  特殊配置?: Record<string, any>,
): string[] => {
  if (心法名 === '傲血战意') return 获取傲血排除技能增益(启用增益, 特殊配置)
  return []
}
