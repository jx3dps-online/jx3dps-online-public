import React from 'react'
import { 循环基础技能数据类型 } from './心法循环模拟/通用/通用框架/类型定义/技能'
import { 循环日志数据类型 } from './心法循环模拟/通用/通用框架/类型定义/模拟'
import { 当前计算结果类型 } from '@/@types/输出'
import { 起手Buff配置 } from './心法循环模拟/通用/通用框架/类型定义/Buff'
import { 选中秘籍信息 } from '@/@types/秘籍'

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
}

const CycleSimulatorContext = React.createContext<CycleSimulatorContextProps>({} as any)

export default CycleSimulatorContext
