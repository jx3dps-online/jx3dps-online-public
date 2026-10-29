import { Modal, message } from 'antd'
import { 登阶武器类型 } from '../领域/循环'
import { 安全计算登阶秒伤 } from '../领域/计算'
import { 获取文案 } from '../文案'
import { 解析踏天参考 } from './配置'
import { 合意键, 建议合意键, 获取认可签名, 可主动踏天 } from './计算'
import type { 登阶差异, 登阶建议 } from '../领域/类型'
import type { 踏天认可 } from './类型'
import type React from 'react'
import type { 创建角色计划存储 } from '@/角色/计划'
import type { use心法数据 } from '@/心法模块/心法上下文'
import type { use踏天参考 } from './配置'
import type { 角色计划, 配装快照, 配装目标, 配装循环 } from '@/角色/类型'
import type { 装备信息数据类型 } from '@/@types/装备'

interface 踏天操作上下文 {
  入境控制: React.MutableRefObject<AbortController | undefined>
  设置入境中: (值: boolean) => void
  检查最新计划: () => void
  可开启: boolean
  参考: ReturnType<typeof use踏天参考>['参考']
  推荐: ReturnType<typeof use踏天参考>
  主卡: React.RefObject<HTMLElement>
  更新踏天: ReturnType<typeof 创建角色计划存储>['更新踏天']
  计划: 角色计划
  当前: 配装快照 | undefined
  普通目标: 配装目标 | undefined
  安全操作: (操作: () => unknown, 提示: string) => void
  踏天中: boolean
  目标: 配装目标 | undefined
  不匹配原因: string | undefined
  主动完成有效: boolean
  按循环计算: (装备: 装备信息数据类型, 配置?: 配装循环) => number | undefined
  离开踏天: ReturnType<typeof 创建角色计划存储>['离开踏天']
  设置管理: (值: boolean) => void
  心法数据: ReturnType<typeof use心法数据>
}
/** 踏天写入与入境动画；提交仍校验调用方持有的计划快照。 */
export function 创建踏天操作({
  入境控制,
  设置入境中,
  检查最新计划,
  可开启,
  参考,
  推荐,
  主卡,
  更新踏天,
  计划,
  当前,
  普通目标,
  安全操作,
  踏天中,
  目标,
  不匹配原因,
  主动完成有效,
  按循环计算,
  离开踏天,
  设置管理,
  心法数据,
}: 踏天操作上下文) {
  const 文案 = 获取文案(心法数据.名称)
  const 开启踏天 = async () => {
    if (入境控制.current) return
    const 控制 = new AbortController()
    入境控制.current = 控制
    设置入境中(true)
    try {
      检查最新计划()
      if (!可开启 || !参考 || !推荐.配置) throw new Error(文案['踏天.错误.未达开启'])
      const { 播放踏天切换 } = await import('./切换特效')
      if (控制.signal.aborted) return
      await 播放踏天切换(
        主卡.current?.querySelector<HTMLElement>('[role="progressbar"]') || null,
        控制.signal,
        () => {
          // 白光铺满时切换主卡，淡出阶段直接看到踏天面板。
          // 动画期间可能有其他标签页更新计划，提交仍使用进入前快照校验。
          更新踏天(
            计划,
            {
              路线: 登阶武器类型(当前?.装备) === '橙武' ? '橙武' : '紫武',
              进入时间: Date.now(),
              配置版本: 推荐.配置.版本,
              返回目标id: 普通目标?.id,
              替代认可: {},
            },
            true,
          )
          // 提交后解除入境控制：踏天状态变化会触发计算键更新，
          // 若仍持有控制器会被清理副作用取消，导致白光淡出被掐断。
          入境控制.current = undefined
          设置入境中(false)
        },
        文案,
      )
      message.success(文案['踏天.提示.开启成功'])
    } catch (错误) {
      if (!控制.signal.aborted)
        message.error(错误 instanceof Error ? 错误.message : 文案['踏天.错误.未进入'])
    } finally {
      if (入境控制.current === 控制) {
        入境控制.current = undefined
        设置入境中(false)
      }
    }
  }
  const 标记合意 = (项: 登阶差异) =>
    安全操作(() => {
      检查最新计划()
      if (!踏天中 || !计划.踏天 || !当前 || !目标 || 不匹配原因)
        throw new Error(文案['踏天.错误.匹配路线'])
      const 键 = 合意键(项)
      const 签名 = 获取认可签名(当前.装备, 目标.装备, 键)
      if (!签名) throw new Error(文案['踏天.错误.取得装备'])
      更新踏天(计划, { ...计划.踏天, 替代认可: { ...计划.踏天.替代认可, [键]: 签名 } })
    }, 文案['踏天.提示.已认可'])
  /** 建议卡片直接提交认可：按该建议实际改动的所有部位/事项一次写入。 */
  const 坚持本心 = (项: 登阶建议) =>
    安全操作(() => {
      检查最新计划()
      if (!踏天中 || !计划.踏天 || !当前 || !目标 || 不匹配原因)
        throw new Error(文案['踏天.错误.匹配路线'])
      const 新增: Record<string, 踏天认可> = {}
      建议合意键(当前.装备, 目标.装备, 项.装备信息).forEach((键) => {
        const 签名 = 获取认可签名(当前.装备, 目标.装备, 键)
        if (签名) 新增[键] = 签名
      })
      if (!Object.keys(新增).length) throw new Error(文案['踏天.错误.无可认可'])
      更新踏天(计划, { ...计划.踏天, 替代认可: { ...计划.踏天.替代认可, ...新增 } })
    }, 文案['踏天.提示.已认可'])
  const 撤销合意 = (键: string) =>
    安全操作(() => {
      检查最新计划()
      if (!计划.踏天) throw new Error(文案['踏天.错误.不在踏天'])
      const 替代认可 = { ...计划.踏天.替代认可 }
      delete 替代认可[键]
      更新踏天(计划, { ...计划.踏天, 替代认可 })
    }, 文案['踏天.提示.已撤销'])
  const 我已踏天 = () =>
    安全操作(() => {
      检查最新计划()
      if (!踏天中 || !计划.踏天 || !参考 || !当前 || 不匹配原因)
        throw new Error(文案['踏天.错误.等待结果'])
      if (主动完成有效) return
      const 实际 = 安全计算登阶秒伤(当前.装备, (装备) => 按循环计算(装备, 参考.目标.循环))
      const 终点 = 安全计算登阶秒伤(参考.目标.装备, (装备) => 按循环计算(装备, 参考.目标.循环))
      if (!可主动踏天(实际, 终点)) throw new Error(文案['踏天.错误.DPS不足'])
      更新踏天(计划, {
        ...计划.踏天,
        主动完成: {
          时间: Date.now(),
          路线: 计划.踏天.路线,
          配置版本: 推荐.配置!.版本,
          参考签名: 参考.签名,
          配装: 当前,
        },
      })
    }, 文案['踏天.提示.我已踏天'])
  const 确认离开 = () =>
    Modal.confirm({
      title: 文案['踏天.确认离开.标题'],
      content: 文案['踏天.确认离开.内容'],
      okText: 文案['踏天.确认离开.确定'],
      cancelText: 文案['踏天.确认离开.取消'],
      onOk: () => {
        离开踏天(计划, 普通目标?.id)
        设置管理(false)
      },
    })
  const 更新踏天路线 = () =>
    安全操作(() => {
      if (!计划.踏天 || !推荐.配置 || !当前) throw new Error(文案['踏天.错误.参考未就绪'])
      const 路线 = 登阶武器类型(当前.装备) === '橙武' ? '橙武' : '紫武'
      解析踏天参考(推荐.配置, 心法数据, 路线)
      更新踏天(计划, { ...计划.踏天, 路线, 配置版本: 推荐.配置.版本, 替代认可: {} }, true)
      设置管理(false)
    }, 文案['踏天.提示.路线已更新'])

  return { 开启踏天, 标记合意, 坚持本心, 撤销合意, 我已踏天, 确认离开, 更新踏天路线 }
}
