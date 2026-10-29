/** 傲血：木桩模式（未启用增益）下忽略自身撼如雷/破风 */
export const 获取傲血排除技能增益 = (
  启用增益?: boolean,
  特殊配置?: Record<string, any>,
): string[] => {
  if (!启用增益 && 特殊配置?.['忽略撼如雷和破风']) {
    return ['撼如雷·天策', '破风·天策']
  }
  return []
}
