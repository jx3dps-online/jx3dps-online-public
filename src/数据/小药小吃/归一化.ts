import 获取当前数据 from '@/数据/数据工具/获取当前数据'

/**
 * @name 归一化小吃数组
 * @description 小吃数组去重收敛：
 *  1. 按小吃名称去重；
 *  2. 每个小吃部位仅保留一个（遍历时后者优先，即最新写入/选择的小吃生效）；
 *  3. 无法在小药小吃数据中匹配到部位的名称（如历史残留）仅按名称去重，保留不丢。
 * 用于增益数据写入与读取时统一兜底，防止重复脏数据累积。
 */
export const 归一化小吃数组 = (小吃: string[] = []): string[] => {
  if (!Array.isArray(小吃)) {
    return []
  }
  const { 小药小吃 = [] } = 获取当前数据()
  const 已见名称 = new Set<string>()
  const 已见部位 = new Set<string>()
  const 结果: string[] = []

  ;[...小吃].reverse().forEach((名称) => {
    if (!名称 || 已见名称.has(名称)) {
      return
    }
    const 部位 = 小药小吃?.find((a) => a?.小吃名称 === 名称)?.小吃部位
    if (部位 && 已见部位.has(部位)) {
      return
    }
    已见名称.add(名称)
    if (部位) {
      已见部位.add(部位)
    }
    结果.push(名称)
  })

  return 结果.reverse()
}
