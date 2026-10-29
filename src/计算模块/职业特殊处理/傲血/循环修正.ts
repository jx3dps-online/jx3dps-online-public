import { 循环技能详情 } from '@/@types/循环'

export const 傲血循环修正 = (
  循环: 循环技能详情[],
  增益启用: boolean,
  特殊配置?: Record<string, any>,
): 循环技能详情[] => {
  if (!增益启用 && 特殊配置?.['忽略撼如雷和破风']) {
    return 循环.filter((技能) => 技能.技能名称 !== '灭·自伤')
  }
  return 循环
}
