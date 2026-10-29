import React from 'react'
import { 循环基础技能数据类型 } from './心法循环模拟/通用/通用框架/类型定义/技能'
import { 循环日志数据类型 } from './心法循环模拟/通用/通用框架/类型定义/模拟'
import { 当前计算结果类型 } from '@/@types/输出'
import { 起手Buff配置 } from './心法循环模拟/通用/通用框架/类型定义/Buff'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 副本事件方案类型, 副本事件实例类型 } from '@/@types/副本事件'

interface CycleSimulatorContextProps {
  模拟DPS结果: 当前计算结果类型
  更新模拟DPS结果: (e: 当前计算结果类型) => void
  日志信息: 循环日志数据类型[]
  更新日志信息: (e: 循环日志数据类型[]) => void
  模拟器弹窗展示: boolean
  更新模拟器弹窗展示: (e: boolean) => void
  cycle: any[]
  setCycle: (e: 循环基础技能数据类型[]) => void
  大橙武模拟: boolean
  加速值: number
  更新加速值: (e: number) => void
  网络延迟: number
  更新网络延迟: (e: number) => void
  启用团队增益快照: boolean
  更新启用团队增益快照: (e: boolean) => void
  团队快照容器: HTMLDivElement | null
  设置团队快照容器: (容器: HTMLDivElement | null) => void
  奇穴信息: string[]
  更新奇穴信息: (e: string[]) => void
  奇穴弹窗展示: boolean
  更新奇穴弹窗展示: (e: boolean) => void
  自定义循环保存弹窗: boolean
  设置自定义循环保存弹窗: (e: boolean) => void
  添加技能弹窗显示: boolean
  更新添加技能弹窗显示: (e: boolean) => void
  添加设置: { 位置: string; 索引: number }
  更新添加设置: (e: { 位置: string; 索引: number }) => void
  起手Buff配置: 起手Buff配置
  更新起手Buff配置: (e: 起手Buff配置) => void
  秘籍信息: 选中秘籍信息
  更新秘籍信息: (e: 选中秘籍信息) => void
  增益启用: boolean
  更新增益启用: (e: boolean) => void
  高亮团队快照: string[]
  更新高亮团队快照: (e: string[]) => void
  截图模式: boolean
  设置截图模式: (e: boolean) => void
  // 当前选中的副本事件方案名称（模拟器内部状态，非全局持久化）
  当前副本事件方案名称: string
  更新当前副本事件方案名称: (e: string) => void
  // 当前选中的副本事件方案（由方案列表 + 名称派生）
  当前副本事件方案: 副本事件方案类型 | undefined
  // 当前选中方案的实例列表（派生值，供各模块统一读取）
  当前副本事件实例列表: 副本事件实例类型[]
  // 副本事件编辑器是否打开（用于战斗曲线在编辑器内展示时也纳入自动刷新开关）
  副本事件编辑器展示: boolean
  更新副本事件编辑器展示: (e: boolean) => void
  // 循环技能拖拽中（拖拽期间暂停曲线计算，拖拽结束后再刷新）
  循环技能拖拽中: boolean
  更新循环技能拖拽中: (e: boolean) => void
}

const CycleSimulatorContext = React.createContext<CycleSimulatorContextProps>({} as any)

export default CycleSimulatorContext

/**
 * 战斗曲线 hover 联动：在循环技能序列上 hover 某个技能时，在战斗曲线上显示对应时间的竖线 + tooltip。
 * 拆成「值」「设置」两个 context：
 * - 技能项只消费「设置」（setter 引用稳定，hover 更新不会导致技能项重渲染）
 * - 战斗曲线只消费「值」，hover 更新时仅曲线组件重渲染，避免高频 hover 触发整个模拟器子树重渲染
 */
export const 战斗曲线联动值Context = React.createContext<number | null>(null)
export const 战斗曲线联动设置Context = React.createContext<(e: number | null) => void>(() => {})

// 当前处于展示状态的战斗曲线实例数量：只有存在展示中的曲线时，才响应技能 hover 联动
export const 战斗曲线展示数量Context = React.createContext<number>(0)
export const 更新战斗曲线展示数量Context = React.createContext<(delta: number) => void>(() => {})

/**
 * 战斗曲线 hover 联动 Provider。
 * 独立成组件（状态不放在模拟器主 Provider 里），hover 更新时只有消费「值」的战斗曲线重渲染，
 * 不会触发 CycleSimulatorContext 整个子树重渲染。
 */
export const 战斗曲线联动Provider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [联动悬停时间, 更新联动悬停时间] = React.useState<number | null>(null)
  const [展示数量, 设置展示数量] = React.useState(0)
  const 更新展示数量 = React.useCallback((delta: number) => {
    设置展示数量((当前) => Math.max(0, 当前 + delta))
  }, [])
  return (
    <更新战斗曲线展示数量Context.Provider value={更新展示数量}>
      <战斗曲线展示数量Context.Provider value={展示数量}>
        <战斗曲线联动设置Context.Provider value={更新联动悬停时间}>
          <战斗曲线联动值Context.Provider value={联动悬停时间}>
            {children}
          </战斗曲线联动值Context.Provider>
        </战斗曲线联动设置Context.Provider>
      </战斗曲线展示数量Context.Provider>
    </更新战斗曲线展示数量Context.Provider>
  )
}
