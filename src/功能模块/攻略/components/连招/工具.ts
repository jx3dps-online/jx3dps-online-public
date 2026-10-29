import 技能图标映射数据 from './技能图标映射.json'
import 模拟器技能映射数据 from './模拟器技能映射.json'

// 模拟器技能序列中技能名与额外信息的分隔符（如 `星离雨散%{"延迟":1}`）
const 技能额外信息分隔符 = '%'

/** 换行标记：技能序列中出现「换行」即视为一次显式换行 */
export const 换行标记 = '换行'

export interface 解析后的技能 {
  技能名称: string
  额外信息: Record<string, any> | null
  是否为换行: boolean
}

export const 技能图标映射: Record<string, number> = 技能图标映射数据 as Record<string, number>
export const 模拟器技能映射: Record<string, Record<string, number>> = 模拟器技能映射数据 as Record<
  string,
  Record<string, number>
>

/** 解析单个技能序列项：`技能名%{额外信息}` */
export const 解析技能序列项 = (项: string): 解析后的技能 => {
  if (!项) {
    return { 技能名称: '', 额外信息: null, 是否为换行: false }
  }
  const 分隔符位置 = 项.indexOf(技能额外信息分隔符)
  let 技能名称 = 项
  let 额外信息: Record<string, any> | null = null
  if (分隔符位置 > 0) {
    技能名称 = 项.slice(0, 分隔符位置)
    try {
      额外信息 = JSON.parse(项.slice(分隔符位置 + 1))
    } catch {
      额外信息 = null
    }
  }
  return {
    技能名称,
    额外信息,
    是否为换行: 技能名称 === 换行标记,
  }
}

/** 从循环 JSON（或含 技能序列 的对象）中取出技能序列数组 */
export const 从循环解析技能序列 = (循环?: { 技能序列?: string[] } | null): string[] => {
  return 循环?.技能序列 || []
}

/** 图标 id -> 图标地址 */
export const 图标地址 = (图标ID: number | string): string => {
  return `https://icon.jx3box.com/icon/${图标ID}.png`
}

/**
 * 根据技能名称获取图标地址。
 * 优先取当前心法的模拟器别名映射（短名/特殊技能），其次取全服技能映射。
 */
export const 获取技能图标地址 = (技能名称: string, 心法?: string): string | undefined => {
  if (!技能名称) return undefined
  const 心法别名 = 心法 ? 模拟器技能映射[心法] : undefined
  const 图标ID = 心法别名?.[技能名称] ?? 技能图标映射[技能名称]
  return 图标ID != null ? 图标地址(图标ID) : undefined
}
