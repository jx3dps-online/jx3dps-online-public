import type { 装备信息数据类型 } from '@/@types/装备'
import { 装备位置部位枚举 } from '@/@types/装备'
import { 是对象 } from '@/工具函数/本地存储'
import type { 配装循环, 配装快照, 角色计划, 角色目标绑定 } from './类型'
import { 踏天目标id } from '@/功能模块/计算结果/登龙长阶/踏天/类型'
import type { 踏天状态 } from '@/功能模块/计算结果/登龙长阶/踏天/类型'

export const 空计划: 角色计划 = { 绑定: [], 历史: [] }
const 同页事件 = 'jx3dps:角色计划:更新'
const 部位顺序 = Object.values(装备位置部位枚举)
const 缓存 = new Map<string, { 原文: string | null; 计划: 角色计划; 错误?: string }>()
export const 角色计划存储键 = (角色id: string) => 'jx3dps:角色计划:v1:' + encodeURIComponent(角色id)
const 数字属性 = (值: unknown) =>
  是对象(值) &&
  Object.values(值).every(
    (项) => 项 === undefined || (typeof 项 === 'number' && Number.isFinite(项)),
  )

const 数值或件数表 = (值: unknown) =>
  值 === undefined ||
  (typeof 值 === 'number' && Number.isFinite(值)) ||
  (是对象(值) && Object.values(值).every((项) => typeof 项 === 'number' && Number.isFinite(项)))

/** 允许尚未取得的空槽；只有手录面板或全空的配装不能代表身上装备。 */
export const 有效配装装备 = (值: unknown): 值 is 装备信息数据类型 => {
  if (!是对象(值) || !Array.isArray(值.装备列表) || !值.装备列表.length || 值.装备列表.length > 12)
    return false
  if (
    !数字属性(值.装备基础属性) ||
    !数字属性(值.装备镶嵌附魔属性) ||
    !是对象(值.装备增益) ||
    !Object.values(值.装备增益).every(数值或件数表)
  )
    return false
  if (值.五彩石 !== undefined && typeof 值.五彩石 !== 'string') return false
  const 部位计数 = new Map<string, number>()
  return (
    值.装备列表.some((项) => 是对象(项) && Number.isInteger(项.id) && 项.id > 0) &&
    值.装备列表.every((项) => {
      if (!是对象(项) || !部位顺序.includes(项.装备部位)) return false
      const 数量 = (部位计数.get(项.装备部位) || 0) + 1
      部位计数.set(项.装备部位, 数量)
      if (数量 > (项.装备部位 === '戒指' ? 2 : 1)) return false
      if (项.id !== undefined && 项.id !== null && (!Number.isInteger(项.id) || 项.id < 0))
        return false
      if (
        项.当前精炼等级 !== undefined &&
        (!Number.isInteger(项.当前精炼等级) || 项.当前精炼等级 < 0 || 项.当前精炼等级 > 8)
      )
        return false
      if (项.附魔 !== undefined && (!Number.isInteger(项.附魔) || 项.附魔 <= 0)) return false
      return (
        项.镶嵌孔数组 === undefined ||
        (Array.isArray(项.镶嵌孔数组) &&
          项.镶嵌孔数组.length <= 3 &&
          项.镶嵌孔数组.every(
            (孔) =>
              是对象(孔) &&
              (孔.镶嵌类型 === undefined || typeof 孔.镶嵌类型 === 'string') &&
              (孔.镶嵌宝石等级 === undefined ||
                (Number.isInteger(孔.镶嵌宝石等级) &&
                  孔.镶嵌宝石等级 >= 0 &&
                  孔.镶嵌宝石等级 <= 8)),
          ))
      )
    })
  )
}

export const 有效循环 = (值: unknown) =>
  值 === undefined ||
  (是对象(值) &&
    typeof 值.名称 === 'string' &&
    !!值.名称 &&
    值.名称.length <= 200 &&
    Array.isArray(值.奇穴) &&
    值.奇穴.length <= 12 &&
    值.奇穴.every((项) => typeof 项 === 'string') &&
    是对象(值.秘籍) &&
    Object.values(值.秘籍).every(
      (项) => Array.isArray(项) && 项.every((秘籍) => typeof 秘籍 === 'string'),
    ))
const 有效快照 = (值: unknown): 值 is 配装快照 =>
  是对象(值) &&
  typeof 值.名称 === 'string' &&
  值.名称.length <= 40 &&
  typeof 值.时间 === 'number' &&
  Number.isFinite(值.时间) &&
  有效循环(值.循环) &&
  有效配装装备(值.装备)
const 有效踏天 = (值: unknown): 值 is 踏天状态 => {
  if (
    !是对象(值) ||
    !['紫武', '橙武'].includes(值.路线) ||
    !Number.isFinite(值.进入时间) ||
    typeof 值.配置版本 !== 'string' ||
    (值.返回目标id !== undefined && typeof 值.返回目标id !== 'string') ||
    !是对象(值.替代认可)
  )
    return false
  if (
    !Object.entries(值.替代认可).every(
      ([键, 项]) =>
        键.length < 100 &&
        是对象(项) &&
        typeof 项.当前签名 === 'string' &&
        typeof 项.参考签名 === 'string',
    )
  )
    return false
  const 完成 = 值.主动完成
  return (
    完成 === undefined ||
    (是对象(完成) &&
      Number.isFinite(完成.时间) &&
      ['紫武', '橙武'].includes(完成.路线) &&
      typeof 完成.配置版本 === 'string' &&
      typeof 完成.参考签名 === 'string' &&
      有效快照(完成.配装))
  )
}
const 有效绑定 = (值: unknown): 值 is 角色目标绑定 =>
  是对象(值) &&
  typeof 值.目标id === 'string' &&
  !!值.目标id &&
  (值.起点 === undefined || 有效配装装备(值.起点)) &&
  有效循环(值.起点循环)
const 有效计划 = (值: unknown): 值 is 角色计划 => {
  if (!是对象(值) || !Array.isArray(值.绑定) || !Array.isArray(值.历史)) return false
  if (值.踏天 !== undefined && !有效踏天(值.踏天)) return false
  const ids = new Set<string>()
  return (
    值.绑定.every((绑定) => {
      if (!有效绑定(绑定) || ids.has(绑定.目标id)) return false
      ids.add(绑定.目标id)
      return true
    }) &&
    值.历史.every(有效快照) &&
    (值.聚焦id === undefined || typeof 值.聚焦id === 'string')
  )
}

const 读取缓存 = (角色id: string) => {
  const key = 角色计划存储键(角色id)
  let 原文: string | null
  try {
    原文 = window.localStorage.getItem(key)
  } catch {
    return { 原文: null, 计划: 空计划, 错误: '浏览器暂时无法读取角色计划，请检查本地存储权限。' }
  }
  const 已缓存 = 缓存.get(key)
  if (已缓存?.原文 === 原文) return 已缓存
  let 计划 = 空计划
  let 错误: string | undefined
  if (原文 !== null) {
    try {
      const 数据 = JSON.parse(原文)
      if (!有效计划(数据)) throw new Error('invalid')
      计划 = 数据
    } catch {
      错误 = '角色计划缓存无法读取，原始数据已保留；再次保存时会先备份原始数据。'
    }
  }
  const 结果 = { 原文, 计划, 错误 }
  缓存.set(key, 结果)
  return 结果
}

export const 复制 = <T>(值: T): T => JSON.parse(JSON.stringify(值))
export const 快照循环 = (循环?: 配装循环) => {
  if (!有效循环(循环)) throw new Error('循环设置不完整，请重新选择循环后保存。')
  return 循环 ? 复制(循环) : undefined
}
export const 快照装备 = (装备: 装备信息数据类型) => {
  const 副本 = 复制(装备)
  // 旧版精炼选项只设置 key，手动选择后可能返回数字字符串。
  if (Array.isArray(副本?.装备列表)) {
    副本.装备列表 = 副本.装备列表.map((项) => ({
      ...项,
      当前精炼等级:
        typeof 项?.当前精炼等级 === 'string' && /^\d+$/.test(项.当前精炼等级)
          ? Number(项.当前精炼等级)
          : 项?.当前精炼等级,
    }))
  }
  if (!有效配装装备(副本)) throw new Error('请先在配装器选择或导入有效装备，再保存角色或目标。')
  // 将稀疏配装补全为固定部位，戒指按原顺序保留，避免后续按槽位对比错位。
  const 待分配 = [...副本.装备列表]
  副本.装备列表 = 部位顺序.map((装备部位) => {
    const index = 待分配.findIndex((项) => 项.装备部位 === 装备部位)
    if (index < 0) return { 装备部位, id: undefined, 当前精炼等级: 0, 镶嵌孔数组: [] }
    const [项] = 待分配.splice(index, 1)
    return { ...项, 当前精炼等级: 项.当前精炼等级 || 0, 镶嵌孔数组: 项.镶嵌孔数组 || [] }
  })
  副本.五彩石 = 副本.五彩石 || ''
  return 副本
}
const 校验名称 = (名称: string) => {
  const 结果 = 名称.trim()
  if (!结果 || 结果.length > 40) throw new Error('名称请填写 1 至 40 个字符。')
  return 结果
}

export const 创建角色计划存储 = (角色id: string) => {
  const 更新 = (修改: (旧: 角色计划) => 角色计划) => {
    if (!角色id) throw new Error('角色数据尚未就绪，请稍后再保存。')
    const 原始 = 读取缓存(角色id)
    const 新计划 = 修改(原始.计划)
    const key = 角色计划存储键(角色id)
    try {
      if (原始.错误 && 原始.原文 !== null) {
        window.localStorage.setItem(key + ':recovery:' + Date.now(), 原始.原文)
      }
      window.localStorage.setItem(key, JSON.stringify(新计划))
    } catch {
      throw new Error('角色计划未保存：浏览器存储不可用或空间不足，请检查后重试。')
    }
    缓存.delete(key)
    window.dispatchEvent(new CustomEvent(同页事件, { detail: key }))
  }
  return {
    读取: () => 读取缓存(角色id).计划,
    /** 整份覆盖角色计划（用于复制角色）。 */
    覆盖计划: (计划: 角色计划) => {
      if (!有效计划(计划)) throw new Error('角色计划数据不完整，未复制。')
      更新(() => 复制(计划))
    },
    /** 踏天操作携带渲染时的计划，跨窗口更新后拒绝覆盖。 */
    更新踏天: (预期: 角色计划, 踏天: 踏天状态, 聚焦 = false) =>
      更新((旧) => {
        if (JSON.stringify(旧) !== JSON.stringify(预期))
          throw new Error('配装或目标已更新，请按最新结果操作。')
        if (!有效踏天(踏天)) throw new Error('踏天记录不完整，未保存。')
        return { ...旧, 踏天: 复制(踏天), 聚焦id: 聚焦 ? 踏天目标id(踏天.路线) : 旧.聚焦id }
      }),
    离开踏天: (预期: 角色计划, 返回目标id?: string) =>
      更新((旧) => {
        if (JSON.stringify(旧) !== JSON.stringify(预期)) throw new Error('计划已更新，请重新操作。')
        const 返回 = 返回目标id || 旧.绑定[0]?.目标id
        return { ...旧, 踏天: undefined, 聚焦id: 返回 }
      }),
    读取错误: () => 读取缓存(角色id).错误,
    订阅: (通知: () => void) => {
      const key = 角色计划存储键(角色id)
      const 同页更新 = (事件: Event) => {
        if ((事件 as CustomEvent).detail === key) 通知()
      }
      const 跨页更新 = (事件: StorageEvent) => {
        if (事件.key === key || 事件.key === null) 通知()
      }
      window.addEventListener(同页事件, 同页更新)
      window.addEventListener('storage', 跨页更新)
      return () => {
        window.removeEventListener(同页事件, 同页更新)
        window.removeEventListener('storage', 跨页更新)
      }
    },
    /** 保存角色后的足迹记录：追加历史，并给尚未记录起点的绑定补上起点。 */
    记录配装: (装备: 装备信息数据类型, 名称: string, 循环?: 配装循环) => {
      const 快照: 配装快照 = {
        装备: 快照装备(装备),
        名称: 校验名称(名称),
        时间: Date.now(),
        循环: 快照循环(循环),
      }
      更新((旧) => ({
        ...旧,
        绑定: 旧.绑定.map((绑定) =>
          绑定.起点 ? 绑定 : { ...绑定, 起点: 复制(快照.装备), 起点循环: 快照.循环 },
        ),
        历史: [...旧.历史, 复制(快照)].slice(-30),
      }))
    },
    /** 聚焦目标：建立或复用绑定；首次绑定时记录起点，缺起点的旧绑定顺带补一次。 */
    聚焦目标: (id: string, 起点?: { 装备: 装备信息数据类型; 循环?: 配装循环 }) => {
      const 起点装备 = 起点 ? 快照装备(起点.装备) : undefined
      const 起点循环 = 起点 ? 快照循环(起点.循环) : undefined
      更新((旧) => {
        const 已有 = 旧.绑定.find((绑定) => 绑定.目标id === id)
        const 绑定: 角色目标绑定 = 已有
          ? 已有.起点 || !起点
            ? 已有
            : { ...已有, 起点: 起点装备, 起点循环 }
          : { 目标id: id, 起点: 起点装备, 起点循环 }
        return {
          ...旧,
          绑定: 已有 ? 旧.绑定.map((项) => (项.目标id === id ? 绑定 : 项)) : [...旧.绑定, 绑定],
          聚焦id: id,
        }
      })
    },
    /** 目标池删除目标时清理本角色的绑定与聚焦；不删除池内数据。 */
    移除目标绑定: (id: string) =>
      更新((旧) => {
        const 绑定 = 旧.绑定.filter((项) => 项.目标id !== id)
        return { ...旧, 绑定, 聚焦id: 旧.聚焦id === id ? 绑定[0]?.目标id : 旧.聚焦id }
      }),
  }
}
