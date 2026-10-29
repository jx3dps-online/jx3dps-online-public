import { useContext, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import CycleSimulatorContext from '@/功能模块/基础设置/公用设置/循环模拟/context'
import { 循环日志数据类型 } from '../../../../typs'
import { 团队增益轴类型 } from '@/@types/团队增益'
import { 副本事件实例类型 } from '@/@types/副本事件'
import { 循环技能详情 } from '@/@types/循环'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 计算循环秒伤曲线 } from '@/计算模块/计算函数'
import {
  监听增益类型,
  增益泳道类型,
  计算副本事件泳道,
  计算团队增益轴泳道,
  计算自身增益泳道,
} from './增益泳道'

// 曲线采样间隔（帧）下限，以及采样点数量上限（防止长战斗计算过慢）
const 最小采样间隔帧 = 24
const 最大采样点数 = 120

// 面板头部 + 拖拽条等额外高度（用于计算技能容器压缩高度）
const 面板额外高度 = 48

// 曲线自动刷新防抖：拖拽结束/数据稳定后再计算，避免拖技能时反复重算
const 曲线计算防抖毫秒 = 500

// 曲线结果缓存上限（覆盖 A→B→A 来回调整）
const 曲线缓存上限 = 10

export interface 曲线数据点 {
  总伤: number
  时间: number
  秒伤: number
}

// 用日志内容做轻量哈希，作为缓存键的一部分（不能只按数组引用缓存）
const 计算日志哈希 = (日志: 循环日志数据类型[]): string => {
  const 文本 = JSON.stringify(日志)
  let hash = 0
  for (let i = 0; i < 文本.length; i++) {
    hash = (hash * 31 + 文本.charCodeAt(i)) | 0
  }
  return hash.toString(36)
}

interface use战斗曲线Props {
  允许计算?: boolean
  计算回调?: (参数: {
    日志信息: 循环日志数据类型[]
    总战斗用时帧: number
    采样间隔帧: number
  }) => 曲线数据点[]
  额外缓存标识?: string
  日志信息: 循环日志数据类型[]
  总战斗用时帧: number
  团队增益轴: 团队增益轴类型
  副本事件实例列表: 副本事件实例类型[]
  启用团队增益快照: boolean
  增益启用: boolean
  监听增益列表: 监听增益类型[]
  日志转循环: (日志: 循环日志数据类型[], 战斗时间帧: number) => 循环技能详情[]
  奇穴信息: string[]
  秘籍信息: 选中秘籍信息
}

/**
 * 战斗曲线通用逻辑：封装曲线数据计算、嵌入面板状态、增益泳道计算。
 * 曲线数据基于现有战斗日志做采样批量计算（复用同一套循环秒伤计算），
 * 与模拟器最终秒伤一致，且无需重新跑模拟。
 */
export const use战斗曲线 = (props: use战斗曲线Props) => {
  const {
    允许计算: 传入允许计算,
    计算回调,
    额外缓存标识,
    日志信息,
    总战斗用时帧,
    团队增益轴,
    副本事件实例列表,
    启用团队增益快照,
    增益启用,
    监听增益列表,
    日志转循环,
    奇穴信息,
    秘籍信息,
  } = props
  const 允许计算 = 传入允许计算 ?? true

  const dispatch = useAppDispatch()
  const 特殊配置 = useAppSelector((state) => state.data.特殊配置)
  const { 副本事件编辑器展示, 循环技能拖拽中 } = useContext(CycleSimulatorContext)
  const [曲线数据, 设置曲线数据] = useState<曲线数据点[]>([])
  const [增益泳道列表, 设置增益泳道列表] = useState<增益泳道类型[]>([])
  const [待更新, 设置待更新] = useState<boolean>(false)
  const [战斗曲线面板展示, 设置战斗曲线面板展示] = useState<boolean>(false)
  const [面板高度, 设置面板高度] = useState<number>(400)

  // 曲线结果缓存：键由「配置 + 日志内容 + 战斗时间 + 采样间隔」构成
  const 曲线缓存 = useRef<Map<string, 曲线数据点[]>>(new Map())
  const 防抖定时器 = useRef<ReturnType<typeof setTimeout>>()

  // 采样间隔自适应：保证采样点数量不超过 最大采样点数，长战斗自动加粗间隔，避免计算过慢
  const 采样间隔帧 = Math.max(最小采样间隔帧, Math.ceil(总战斗用时帧 / 最大采样点数))

  const 计算增益泳道列表 = (): 增益泳道类型[] => {
    const 泳道: 增益泳道类型[] = []
    if (启用团队增益快照) {
      if (副本事件实例列表?.length) {
        泳道.push(...计算副本事件泳道(副本事件实例列表))
      } else {
        泳道.push(...计算团队增益轴泳道(团队增益轴))
      }
    }
    泳道.push(...计算自身增益泳道(日志信息, 监听增益列表, 总战斗用时帧))
    return 泳道
  }

  const 计算曲线数据 = () => {
    clearTimeout(防抖定时器.current)
    if (!允许计算 || !日志信息?.length) {
      if (!允许计算) 曲线缓存.current.clear()
      设置曲线数据([])
      设置增益泳道列表([])
      设置待更新(false)
      return
    }

    const 缓存 = 曲线缓存.current
    const 原缓存键 = `${总战斗用时帧}_${采样间隔帧}_${增益启用 ? 1 : 0}_${JSON.stringify(特殊配置)}_${奇穴信息?.join('|') || ''}_${JSON.stringify(秘籍信息)}_${计算日志哈希(日志信息)}`
    const 缓存键 = JSON.stringify([原缓存键, 计算回调 ? '自定义' : '默认', 额外缓存标识 ?? ''])
    let 结果 = 缓存.get(缓存键)
    if (!结果) {
      结果 = 计算回调
        ? 计算回调({ 日志信息, 总战斗用时帧, 采样间隔帧 })
        : dispatch(
            计算循环秒伤曲线({
              日志: 日志信息,
              日志转循环,
              总战斗时间帧: 总战斗用时帧,
              采样间隔帧,
              奇穴数据: 奇穴信息,
              秘籍信息,
              增益启用,
            }),
          )
      if (结果?.length) {
        if (缓存.size >= 曲线缓存上限) {
          const 最旧键 = 缓存.keys().next().value
          if (最旧键 !== undefined) {
            缓存.delete(最旧键)
          }
        }
        缓存.set(缓存键, 结果)
      }
    }

    if (结果?.length) {
      // 曲线与增益泳道一起替换，避免新旧数据混用
      设置曲线数据(结果)
      设置增益泳道列表(计算增益泳道列表())
      设置待更新(false)
    } else {
      设置曲线数据([])
      设置增益泳道列表([])
      设置待更新(false)
    }
  }

  // 面板打开、或副本事件编辑器内展示曲线时，日志/时间轴变化才自动重算曲线（防抖）；
  // 拖拽循环技能期间暂停计算，拖拽结束后数据稳定再统一刷新
  useEffect(() => {
    clearTimeout(防抖定时器.current)
    if (!允许计算 || !日志信息?.length) {
      计算曲线数据()
      return
    }
    if (!战斗曲线面板展示 && !副本事件编辑器展示) {
      return
    }
    if (循环技能拖拽中) {
      设置待更新(true)
      return
    }
    设置待更新(true)
    防抖定时器.current = setTimeout(计算曲线数据, 曲线计算防抖毫秒)
    return () => clearTimeout(防抖定时器.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    允许计算,
    计算回调,
    额外缓存标识,
    日志信息,
    总战斗用时帧,
    奇穴信息,
    秘籍信息,
    增益启用,
    战斗曲线面板展示,
    特殊配置,
    副本事件编辑器展示,
    副本事件实例列表,
    循环技能拖拽中,
    团队增益轴,
    启用团队增益快照,
    监听增益列表,
  ])

  const 切换战斗曲线面板 = (open?: boolean) => {
    const 目标 = open !== undefined ? open : !战斗曲线面板展示
    const 正在打开 = 目标 && !战斗曲线面板展示
    设置战斗曲线面板展示(目标)
    if (正在打开) {
      // 打开面板时立即计算一次，避免等待防抖
      计算曲线数据()
    }
  }

  return {
    曲线数据,
    计算曲线数据,
    战斗曲线面板展示,
    切换战斗曲线面板,
    面板高度,
    设置面板高度,
    增益泳道列表,
    待更新,
    // 面板打开时，技能容器需要压缩的高度
    压缩高度: 面板高度 + 面板额外高度,
  }
}
