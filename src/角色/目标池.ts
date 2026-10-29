import type { 装备信息数据类型 } from '@/@types/装备'
import { 创建本地存储, 生成id, 是对象 } from '@/工具函数/本地存储'
import type { 配装循环, 配装目标 } from './类型'
import { 有效循环, 有效配装装备, 快照循环, 快照装备, 创建角色计划存储 } from './计划'
import { 读取角色注册表 } from './注册表'

export interface 目标池数据类型 {
  目标: 配装目标[]
}

export const 空目标池: 目标池数据类型 = { 目标: [] }
export const 目标池存储键 = (心法: string) => 'jx3dps:目标池:v1:' + encodeURIComponent(心法)

const 有效目标 = (值: unknown): 值 is 配装目标 =>
  是对象(值) &&
  typeof 值.id === 'string' &&
  !!值.id &&
  typeof 值.名称 === 'string' &&
  !!值.名称.trim() &&
  值.名称.length <= 40 &&
  Number.isFinite(值.时间) &&
  有效循环(值.循环) &&
  有效配装装备(值.装备)

const 校验目标池 = (值: unknown): 值 is 目标池数据类型 =>
  是对象(值) &&
  Array.isArray(值.目标) &&
  值.目标.every(有效目标) &&
  new Set(值.目标.map((项) => 项.id)).size === 值.目标.length

const 校验名称 = (旧: 目标池数据类型, 名称: string, id?: string) => {
  const 结果 = 名称.trim()
  if (!结果 || 结果.length > 40) throw new Error('名称请填写 1 至 40 个字符。')
  if (旧.目标.some((项) => 项.名称 === 结果 && 项.id !== id))
    throw new Error('该心法下已有同名目标。')
  return 结果
}

const 取存储 = (心法: string) => 创建本地存储(目标池存储键(心法), 空目标池, 校验目标池)

/** 目标池按心法共享；删除目标会清理同心的所有角色绑定。 */
export const 创建目标池存储 = (心法: string) => {
  if (!心法) throw new Error('心法尚未加载。')
  const 存储 = 取存储(心法)
  const 更新 = (修改: (旧: 目标池数据类型) => 目标池数据类型) => {
    const 旧 = 存储.读取()
    存储.保存(修改(旧))
  }
  const 查找目标 = (旧: 目标池数据类型, id: string) => {
    const 目标 = 旧.目标.find((项) => 项.id === id)
    if (!目标) throw new Error('该目标已不存在，请重新选择。')
    return 目标
  }
  const 清理角色绑定 = (目标id: string) => {
    读取角色注册表()
      .列表.filter((角色) => 角色.心法 === 心法)
      .forEach((角色) => {
        try {
          创建角色计划存储(角色.id).移除目标绑定(目标id)
        } catch {
          // 某个角色的计划损坏时跳过，不阻塞目标池删除
        }
      })
  }
  return {
    读取: 存储.读取,
    读取错误: 存储.读取错误,
    订阅: 存储.订阅,
    新增目标: (装备: 装备信息数据类型, 名称: string, 循环?: 配装循环) => {
      const 旧 = 存储.读取()
      const id = 生成id()
      const 目标: 配装目标 = {
        id,
        装备: 快照装备(装备),
        名称: 校验名称(旧, 名称),
        时间: Date.now(),
        循环: 快照循环(循环),
      }
      存储.保存({ ...旧, 目标: [...旧.目标, 目标] })
      return id
    },
    更新目标: (id: string, 装备: 装备信息数据类型, 循环?: 配装循环, 预期目标?: 配装目标) => {
      const 新装备 = 快照装备(装备)
      const 新循环 = 快照循环(循环)
      更新((旧) => {
        const 最新目标 = 查找目标(旧, id)
        if (预期目标 && JSON.stringify(最新目标) !== JSON.stringify(预期目标))
          throw new Error('该目标在编辑期间已更新，本次修改未保存。请关闭并重新打开目标后再调整。')
        return {
          ...旧,
          目标: 旧.目标.map((目标) =>
            目标.id === id
              ? { ...目标, 装备: 新装备, 循环: 新循环 || 目标.循环, 时间: Date.now() }
              : 目标,
          ),
        }
      })
    },
    重命名目标: (id: string, 名称: string) => {
      const 旧 = 存储.读取()
      查找目标(旧, id)
      const 新名称 = 校验名称(旧, 名称, id)
      存储.保存({
        ...旧,
        目标: 旧.目标.map((目标) => (目标.id === id ? { ...目标, 名称: 新名称 } : 目标)),
      })
    },
    设置目标循环: (id: string, 循环: 配装循环) => {
      const 新循环 = 快照循环(循环)
      更新((旧) => {
        查找目标(旧, id)
        return {
          ...旧,
          目标: 旧.目标.map((项) =>
            项.id === id ? { ...项, 循环: 新循环, 时间: Date.now() } : 项,
          ),
        }
      })
    },
    删除目标: (id: string) => {
      更新((旧) => {
        查找目标(旧, id)
        return { ...旧, 目标: 旧.目标.filter((项) => 项.id !== id) }
      })
      清理角色绑定(id)
    },
  }
}

/** 目标被多少个同心的角色绑定（用于删除前的影响提示）。 */
export const 统计目标绑定角色数 = (心法: string, 目标id: string) =>
  读取角色注册表()
    .列表.filter((角色) => 角色.心法 === 心法)
    .filter((角色) => {
      const 计划 = 创建角色计划存储(角色.id).读取()
      return 计划.绑定.some((绑定) => 绑定.目标id === 目标id)
    }).length
