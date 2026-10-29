import { 创建本地存储, 生成id, 是对象 } from '@/工具函数/本地存储'
import type { 角色元数据, 角色注册表数据类型, 角色状态数据类型 } from './类型'
import { 创建角色状态存储, 读取原始角色状态, 保存角色配装, 角色状态存储键 } from './状态'
import { 创建角色计划存储, 角色计划存储键 } from './计划'

const 校验角色元数据 = (值: unknown): 值 is 角色元数据 =>
  是对象(值) &&
  typeof 值.id === 'string' &&
  !!值.id &&
  typeof 值.心法 === 'string' &&
  !!值.心法 &&
  typeof 值.名称 === 'string' &&
  !!值.名称.trim() &&
  值.名称.length <= 20 &&
  (值.区服 === undefined || typeof 值.区服 === 'string') &&
  (值.游戏角色名 === undefined || typeof 值.游戏角色名 === 'string') &&
  (值.uid === undefined || typeof 值.uid === 'string') &&
  Number.isFinite(值.创建时间) &&
  Number.isFinite(值.更新时间)

const 校验注册表 = (值: unknown): 值 is 角色注册表数据类型 =>
  是对象(值) &&
  Array.isArray(值.列表) &&
  typeof 值.当前角色id === 'string' &&
  是对象(值.按心法记忆) &&
  值.列表.every(校验角色元数据) &&
  new Set(值.列表.map((项) => 项.id)).size === 值.列表.length &&
  new Set(值.列表.map((项) => 项.心法 + ':' + 项.名称)).size === 值.列表.length

export const 角色注册表存储 = 创建本地存储<角色注册表数据类型>(
  'jx3dps:角色:v1',
  { 列表: [], 当前角色id: '', 按心法记忆: {} },
  校验注册表,
)

export const 读取角色注册表 = () => 角色注册表存储.读取()
export const 订阅角色注册表 = (通知: () => void) => 角色注册表存储.订阅(通知)

const 校验名称 = (心法: string, 名称: string, id?: string) => {
  const 结果 = 名称.trim()
  if (!心法 || !结果 || 结果.length > 20) throw new Error('角色名称请填写 1 至 20 个字符。')
  const 重名 = 角色注册表存储
    .读取()
    .列表.some((项) => 项.心法 === 心法 && 项.名称 === 结果 && 项.id !== id)
  if (重名) throw new Error('该心法下已有同名角色。')
  return 结果
}

export const 设为当前角色 = (id: string) => {
  const 旧 = 角色注册表存储.读取()
  const 角色 = 旧.列表.find((项) => 项.id === id)
  if (!角色) throw new Error('角色已不存在。')
  角色注册表存储.保存({
    ...旧,
    当前角色id: id,
    按心法记忆: { ...旧.按心法记忆, [角色.心法]: id },
  })
  return 角色
}

export const 新建角色 = (
  心法: string,
  名称: string,
  信息: { 区服?: string; 游戏角色名?: string; uid?: string } = {},
) => {
  const 现在 = Date.now()
  const 角色: 角色元数据 = {
    ...信息,
    id: 生成id(),
    心法,
    名称: 校验名称(心法, 名称),
    创建时间: 现在,
    更新时间: 现在,
  }
  const 旧 = 角色注册表存储.读取()
  角色注册表存储.保存({
    ...旧,
    列表: [...旧.列表, 角色],
    当前角色id: 角色.id,
    按心法记忆: { ...旧.按心法记忆, [心法]: 角色.id },
  })
  return 角色
}

export const 解析当前角色 = (心法: string) => {
  if (!心法) throw new Error('心法尚未加载。')
  const 旧 = 角色注册表存储.读取()
  const 角色 =
    旧.列表.find((项) => 项.id === 旧.当前角色id && 项.心法 === 心法) ||
    旧.列表.find((项) => 项.id === 旧.按心法记忆[心法] && 项.心法 === 心法) ||
    旧.列表.find((项) => 项.心法 === 心法)
  if (!角色) return 新建角色(心法, '默认角色')
  if (旧.当前角色id !== 角色.id) 设为当前角色(角色.id)
  return 角色
}

export const 更新角色资料 = (
  id: string,
  资料: { 名称: string; 区服?: string; 游戏角色名?: string; uid?: string },
) => {
  const 旧 = 角色注册表存储.读取()
  const 角色 = 旧.列表.find((项) => 项.id === id)
  if (!角色) throw new Error('角色已不存在。')
  const 新角色: 角色元数据 = {
    ...角色,
    名称: 校验名称(角色.心法, 资料.名称, id),
    区服: 资料.区服 || undefined,
    游戏角色名: 资料.游戏角色名 || undefined,
    uid: 资料.uid || undefined,
    更新时间: Date.now(),
  }
  角色注册表存储.保存({
    ...旧,
    列表: 旧.列表.map((项) => (项.id === id ? 新角色 : 项)),
  })
  return 新角色
}

export const 删除角色 = (id: string) => {
  const 旧 = 角色注册表存储.读取()
  const 角色 = 旧.列表.find((项) => 项.id === id)
  if (!角色) return
  const 列表 = 旧.列表.filter((项) => 项.id !== id)
  const 记忆 = { ...旧.按心法记忆 }
  if (记忆[角色.心法] === id) delete 记忆[角色.心法]
  角色注册表存储.保存({
    列表,
    当前角色id: 旧.当前角色id === id ? '' : 旧.当前角色id,
    按心法记忆: 记忆,
  })
  try {
    localStorage.removeItem(角色状态存储键(id))
    localStorage.removeItem(角色计划存储键(id))
  } catch {
    // 存储不可用时仅删除注册信息
  }
  if (旧.当前角色id === id) 解析当前角色(角色.心法)
}

/**
 * 复制角色：状态与成长足迹复制到新角色；传入 状态 时以该状态为准（另存为当前配装）
 * 并追加一条成长足迹。任一步失败回滚注册信息，返回新角色。
 */
export const 复制角色 = (源: 角色元数据, 名称: string, 状态?: 角色状态数据类型) => {
  const 原状态 = 状态 ? undefined : 读取原始角色状态(源.id)
  const 计划 = 创建角色计划存储(源.id).读取()
  const 旧注册表 = 读取角色注册表()
  const 新角色 = 新建角色(源.心法, 名称, {
    区服: 源.区服,
    游戏角色名: 源.游戏角色名,
    uid: 源.uid,
  })
  let 警告: string | undefined
  try {
    if (计划.绑定.length || 计划.历史.length || 计划.踏天)
      创建角色计划存储(新角色.id).覆盖计划(计划)
    if (状态) {
      警告 = 保存角色配装(新角色, 状态).警告
    } else if (原状态) {
      创建角色状态存储(新角色.id, 原状态).保存({ ...原状态, 更新时间: Date.now() })
    }
  } catch (错误) {
    角色注册表存储.保存(旧注册表)
    localStorage.removeItem(角色状态存储键(新角色.id))
    localStorage.removeItem(角色计划存储键(新角色.id))
    throw 错误
  }
  return { 角色: 新角色, 警告 }
}
