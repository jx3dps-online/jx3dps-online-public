// 循环模拟器
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Alert, Modal, message } from 'antd'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 技能伤害详情类型 } from '../../typs'

import 循环模拟技能基础数据, { 原始Buff数据 } from './constant/skill'
import { getDpsCycle } from './utils'
import {
  循环日志数据类型,
  循环基础技能数据类型,
  ShowCycleSingleSkill,
  模拟信息类型,
} from './simulator/type'
import 保存自定义循环弹窗 from '../通用/通用组件/保存自定义循环弹窗'
import 循环技能容器组件 from '../通用/通用组件/循环技能容器组件'
import 心法配置 from '../通用/通用组件/心法配置'
import 模拟器头部组件 from '../通用/通用组件/模拟器头部组件'
import 宏入口, { 宏入口属性 } from '../通用/宏解释/界面/入口'
import 奇穴设置组件 from '../通用/通用组件/奇穴设置组件'
import 模拟循环 from './simulator/index'

import StatusBar from './components/StatusBar'
import AddCycleSkillBtns from './components/AddCycleSkillBtns'
import 心法特殊配置 from './components/心法特殊配置'
import 快速导入默认循环 from './constant/快速导入默认循环'

import AddCycleSkillModal from './components/AddCycleSkillModal'
import CycleSimulatorContext from '../../context'
import { 根据奇穴修改buff数据 } from './simulator/utils'
import DelaySettingModal from '../通用/通用组件/技能延迟弹窗'
import { 生成实际技能序列 } from '../通用/通用函数'
import { 战斗曲线面板 } from '../通用/通用组件/战斗曲线弹窗'
import { use战斗曲线 } from '../通用/通用组件/战斗曲线弹窗/use战斗曲线'
import { 监听增益类型 } from '../通用/通用组件/战斗曲线弹窗/增益泳道'
import { use武器切换 } from './use武器切换'
import { 拆分循环文本, 转换技能序列 } from './循环导入'
import { 准备武器切换计算 } from './武器切换计算'
import 切换武器显示 from './components/切换武器显示'

// 心法监听增益：爆发 buff 作为泳道展示在战斗曲线上
const 监听增益列表: 监听增益类型[] = [{ 名称: '踏斗', 颜色: '#e8590c' }].map((item) => ({
  ...item,
  图标: 原始Buff数据?.[item.名称]?.图标,
}))

const 初始模拟信息: 模拟信息类型 = {
  角色状态信息: {
    星运: 0,
    星运上限: 100,
    鬼遁免费变卦次数: 0,
    鬼遁强化水坎: false,
  },
  当前时间: 0,
  当前自身buff列表: {},
  当前目标buff列表: {},
  循环执行结果: '成功',
  循环异常信息: {},
  技能基础数据: [...循环模拟技能基础数据],
  技能释放记录: [],
  当前各技能运行状态: {},
  当前DOT运行状态: {},
  当前GCD组: {},
  待生效事件队列: [],
}

const 关闭提示 = '武器切换已关闭，当前循环包含切换动作，暂不计算'

function 武器切换宏入口({ 更新循环, ...属性 }: 宏入口属性) {
  const 挂载有效 = useRef(false)
  useLayoutEffect(() => {
    挂载有效.current = true
    return () => {
      挂载有效.current = false
    }
  }, [])
  const 更新当前循环 = useCallback(
    (循环: Parameters<宏入口属性['更新循环']>[0]) => {
      if (挂载有效.current) 更新循环(循环)
    },
    [更新循环],
  )
  return <宏入口 {...属性} 更新循环={更新当前循环} />
}

function CycleSimulator() {
  const {
    日志信息,
    更新日志信息,
    模拟DPS结果,
    更新模拟DPS结果,
    模拟器弹窗展示,
    更新模拟器弹窗展示,
    cycle,
    setCycle,
    大橙武模拟,
    加速值,
    更新加速值,
    网络延迟,
    更新网络延迟,
    启用团队增益快照,
    更新启用团队增益快照,
    奇穴信息,
    秘籍信息,
    更新奇穴信息,
    奇穴弹窗展示,
    更新奇穴弹窗展示,
    自定义循环保存弹窗,
    设置自定义循环保存弹窗,
    添加技能弹窗显示,
    更新添加技能弹窗显示,
    添加设置,
    更新添加设置,
    起手Buff配置,
    更新起手Buff配置,
    增益启用,
    当前副本事件实例列表,
  } = useContext(CycleSimulatorContext)

  const [模拟信息, 更新模拟信息] = useState<模拟信息类型>(初始模拟信息)

  const [延迟弹窗设置, 设置延迟弹窗设置] = useState<{
    open: boolean
    index?: number
    默认值?: number | 'GCD'
  }>({
    open: false,
  })

  const 星运上限 = 奇穴信息?.includes('鬼遁') ? 300 : 100
  const [起手星运, 更新起手星运] = useState<number>(星运上限)
  const [断御前星延迟, 更新断御前星延迟] = useState<number>(0)
  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)
  const 计算配置 = useAppSelector((state) => state.data)
  const 含切换武器 = cycle.some((技能) => 技能.技能名称 === '切换武器')
  const [计算异常, 设置计算异常] = useState<string>()
  const 武器切换 = use武器切换({ 含切换武器, 奇穴信息, 秘籍信息, 增益启用, 计算异常 })
  const { 武器装备, 武器切换功能启用, 武器切换可用 } = 武器切换
  const 未计算 = !武器切换功能启用 && 含切换武器
  const 展示模拟信息 = useMemo(
    () =>
      未计算
        ? {
            ...初始模拟信息,
            技能基础数据: 模拟信息.技能基础数据,
            循环执行结果: '异常' as const,
            循环异常信息: {
              异常索引: cycle.findIndex((技能) => 技能.技能名称 === '切换武器') + 1,
              异常信息: { 信息: 关闭提示 },
            },
          }
        : 模拟信息,
    [未计算, 模拟信息, cycle],
  )
  const 副本事件实例列表 = 当前副本事件实例列表
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!Object.keys(起手Buff配置).length) {
      更新起手Buff配置({
        灯魂_0: { 层数: 1, 获得时间: -1, 类型: '目标', 名称: '灯魂_0' },
        灯魂_1: { 层数: 1, 获得时间: -1, 类型: '目标', 名称: '灯魂_1' },
        灯魂_2: { 层数: 1, 获得时间: -1, 类型: '目标', 名称: '灯魂_2' },
        卦象_水坎: { 层数: 1, 获得时间: -10, 类型: '自身', 名称: '卦象_水坎' },
        鬼遁: { 层数: 1, 获得时间: -1, 类型: '自身', 名称: '鬼遁' },
        荧入白: { 层数: 1, 获得时间: -160, 类型: '自身', 名称: '荧入白' },
        镇星入舆_兵: { 层数: 1, 获得时间: -240, 类型: '自身', 名称: '镇星入舆_兵' },
        镇星入舆_斗: { 层数: 1, 获得时间: -240, 类型: '自身', 名称: '镇星入舆_斗' },
        镇星入舆_临: { 层数: 1, 获得时间: -240, 类型: '自身', 名称: '镇星入舆_临' },
        祝由释放允许: { 层数: 1, 获得时间: -160, 类型: '自身', 名称: '祝由释放允许' },
        免费变卦: { 层数: 2, 获得时间: -10, 类型: '自身', 名称: '免费变卦' },
      })
    }
  }, [])

  useEffect(() => {
    if (模拟器弹窗展示) {
      更新起手星运(星运上限)
    }
  }, [模拟器弹窗展示])

  useEffect(() => {
    if (起手星运 > 星运上限) {
      更新起手星运(星运上限)
    }
  }, [起手星运, 星运上限])

  useEffect(() => {
    if (模拟器弹窗展示) {
      simulator({})
    }
  }, [
    模拟器弹窗展示,
    增益启用,
    cycle,
    网络延迟,
    秘籍信息,
    起手星运,
    启用团队增益快照,
    加速值,
    奇穴信息,
    团队增益轴,
    副本事件实例列表,
    起手Buff配置,
    断御前星延迟,
    武器装备,
    计算配置,
    大橙武模拟,
    武器切换功能启用,
  ])

  const simulator = (props?) => {
    const {
      传入加速 = 加速值,
      传入延迟 = 网络延迟,
      更新展示 = true,
      奇穴,
      实时计算 = false,
    } = props
    if (未计算) {
      if (更新展示) {
        更新日志信息([])
        更新模拟DPS结果({ 秒伤: 0, 总伤: 0, 秒伤计算时间: 0, 计算结果技能列表: [] })
        设置计算异常(undefined)
        更新模拟信息((当前) => ({ ...展示模拟信息, 技能基础数据: 当前.技能基础数据 }))
      }
      return { ...展示模拟信息, 最终日志: [], 技能伤害详情数据: [] }
    }
    const res = 模拟循环({
      测试循环: 生成实际技能序列(cycle),
      加速值: 传入加速 !== undefined ? 传入加速 : 加速值,
      网络延迟: 传入延迟 !== undefined ? 传入延迟 : 网络延迟,
      奇穴: 奇穴 || 奇穴信息,
      秘籍: 秘籍信息,
      大橙武模拟,
      起手星运,
      启用团队增益快照,
      团队增益轴,
      副本事件实例列表,
      起手Buff配置,
      断御前星延迟,
      武器装备,
      武器切换功能启用,
    })

    const {
      最终日志,
      当前自身buff列表: 处理后自身buff,
      当前目标buff列表: 处理后目标buff,
      角色状态信息: 处理后角色状态信息,
      ...rest
    } = res
    const 武器计算 =
      含切换武器 && 武器装备
        ? dispatch(
            准备武器切换计算({
              完整日志: 最终日志,
              武器装备,
              奇穴信息: 奇穴 || 奇穴信息,
              秘籍信息,
              增益启用,
            }),
          )
        : undefined
    if (更新展示) {
      设置计算异常(武器计算?.禁止原因)
      更新日志信息(最终日志)
      计算dps(最终日志, rest?.当前时间, 武器计算)
      更新模拟信息({
        当前自身buff列表: 处理后自身buff,
        当前目标buff列表: 处理后目标buff,
        角色状态信息: 处理后角色状态信息,
        ...rest,
      })
    }
    if (实时计算) {
      const 技能伤害详情数据 = 武器计算
        ? 武器计算.获取单事件详情(rest.当前时间)
        : 获取单技能实时计算函数(最终日志)
      return { 最终日志, 技能伤害详情数据, ...rest }
    }
    return { 最终日志, ...rest }
  }

  // 计算DPS日志
  const 计算dps = (
    data: 循环日志数据类型[],
    当前时间,
    武器计算?: ReturnType<ReturnType<typeof 准备武器切换计算>>,
  ) => {
    if (武器计算) {
      更新模拟DPS结果(武器计算.计算结果(data, 当前时间))
      return
    }
    const 获取用于计算的技能组 = getDpsCycle(data)
    if (!获取用于计算的技能组?.length) {
      更新模拟DPS结果({
        秒伤: 0,
        总伤: 0,
        秒伤计算时间: 当前时间 / 每秒郭氏帧,
        计算结果技能列表: [],
      })
      return
    }
    const 计算参数: any = {
      更新循环技能列表: 获取用于计算的技能组,
      更新计算时间: 当前时间 / 每秒郭氏帧,
      更新奇穴数据: 奇穴信息,
      更新秘籍信息: 秘籍信息,
      更新增益启用: 增益启用,
    }
    const { 秒伤, 计算结果技能列表, 秒伤计算时间, 总伤 } = dispatch(秒伤计算(计算参数))
    更新模拟DPS结果({
      秒伤: 当前时间 > 0 ? 秒伤 : 0,
      总伤: 当前时间 > 0 ? 总伤 : 0,
      秒伤计算时间: 秒伤计算时间,
      计算结果技能列表: 计算结果技能列表,
    })
  }

  // 战斗曲线通用逻辑
  const 战斗曲线 = use战斗曲线({
    日志信息,
    允许计算: 武器切换.允许计算,
    计算回调: 武器切换.计算回调,
    额外缓存标识: 武器切换.额外缓存标识,
    总战斗用时帧: 模拟信息?.当前时间 || 0,
    团队增益轴,
    副本事件实例列表,
    启用团队增益快照,
    增益启用,
    监听增益列表,
    日志转循环: getDpsCycle,
    奇穴信息,
    秘籍信息,
  })

  const 获取单技能实时计算函数 = (data: 循环日志数据类型[]) => {
    const 技能伤害详情数据: 技能伤害详情类型[] = []
    for (let i = 0; i < data.length; i++) {
      const 单伤害数据 = data[i]
      if (单伤害数据.日志类型 === '造成伤害') {
        const 获取用于计算的技能组 = getDpsCycle([data[i]])
        const 计算参数: any = {
          更新循环技能列表: 获取用于计算的技能组,
          更新计算时间: 1,
          更新奇穴数据: 奇穴信息,
          更新秘籍信息: 秘籍信息,
        }
        const { 计算结果技能列表 } = dispatch(秒伤计算(计算参数))
        技能伤害详情数据.push({
          名称: 单伤害数据?.日志,
          增益: 单伤害数据?.buff列表 || [],
          时间: 单伤害数据?.日志时间 || 0,
          伤害: 计算结果技能列表?.[0]?.技能总输出 || 0,
          会心期望: 计算结果技能列表?.[0]?.会心几率 || 0,
        })
      }
    }
    return 技能伤害详情数据
  }

  // 根据循环计算更适合展示的多层数组，用于显示
  const 处理循环结果对象 = useMemo(() => {
    const res: ShowCycleSingleSkill[][] = []

    const 是否存在换行技能 = cycle?.find((item) => item?.技能名称 === '换行')
    cycle.map((item, index) => {
      const 找到当前技能释放记录 = 展示模拟信息?.技能释放记录?.[index]
      const data = {
        ...item,
        ...找到当前技能释放记录,
      }

      if (index === 0) {
        res[res?.length] = [{ ...data, index: index || 0 }]
      } else {
        if (!是否存在换行技能 && data?.技能名称 === '苍棘缚地') {
          res[res?.length] = [{ ...data, index: index || 0 }]
        } else {
          res[res?.length - 1] = [...(res[res?.length - 1] || []), { ...data, index: index || 0 }]
          if (data?.技能名称 === '换行') {
            res[res?.length] = []
          }
        }
      }
      return data
    })

    return { 显示循环: res, 完整循环: cycle }
  }, [cycle, 展示模拟信息])

  // 向循环内新增技能
  const 新增循环技能 = (item: 循环基础技能数据类型) => {
    let newCycle: 循环基础技能数据类型[] = []
    newCycle = [...(cycle || []), item]
    setCycle(newCycle)
  }

  const 向循环内插入技能 = (item: 循环基础技能数据类型[], 插入位置, 插入索引) => {
    let newCycle: 循环基础技能数据类型[] = [...(cycle || [])]
    let addCycle: 循环基础技能数据类型[] = []

    if (插入位置 === '前部插入') {
      // 在索引 2 前插入多个元素
      addCycle = newCycle.slice(0, 插入索引).concat(item, newCycle.slice(插入索引))
      更新添加设置({ ...添加设置, 索引: 添加设置.索引 + item.length })
    } else {
      // 在索引 2 后插入多个元素
      addCycle = newCycle
        .slice(0, 插入索引 + item.length)
        .concat(item, newCycle.slice(插入索引 + item.length))
    }

    newCycle = [...addCycle]
    setCycle(newCycle)
  }

  const 批量新增循环 = (item: 循环基础技能数据类型[]) => {
    const batchItem = [...item]
    const newCycle = [...(cycle || []), ...batchItem]
    setCycle(newCycle)
  }

  const 修改技能延迟 = (延迟, 索引) => {
    const newCycle: 循环基础技能数据类型[] = cycle?.map((item, index) => {
      let newItem: 循环基础技能数据类型 = { ...item }
      if (index === 索引) {
        const 额外信息 = { ...newItem.额外信息 }
        if (延迟 !== undefined) {
          额外信息.延迟 = 延迟
        } else {
          delete 额外信息.延迟
        }
        if (Object.keys(额外信息).length) {
          newItem.额外信息 = 额外信息
        } else {
          delete newItem?.额外信息
        }
      }
      return newItem
    })
    setCycle(newCycle)
  }

  const 点击下拉菜单 = (data, index) => {
    if (data?.key === '设置延迟时间') {
      const 当前延迟 = cycle?.[index]?.额外信息?.延迟
      设置延迟弹窗设置({ open: true, index: index, 默认值: 当前延迟 })
    } else {
      更新添加设置({ 位置: data?.key, 索引: index })
      更新添加技能弹窗显示(true)
    }
  }

  return (
    <>
      <Modal
        className='cycle-simulator-modal simulator-shxj'
        maskClosable={false}
        width={'100%'}
        title={
          <模拟器头部组件
            cycle={cycle}
            大橙武模拟={大橙武模拟}
            拆分循环文本={拆分循环文本}
            转换技能序列={(节点) => 转换技能序列(节点, 模拟信息.技能基础数据)}
            筛选循环={(列表) => 列表}
            保存禁止原因={
              含切换武器 ? '混合武器循环请保存为草稿，主页汇总格式尚不支持装备归属' : undefined
            }
            设置自定义循环保存弹窗={(显示) => {
              if (显示 && 含切换武器) {
                message.info('混合武器循环请保存为草稿，主页汇总格式尚不支持装备归属')
                return
              }
              设置自定义循环保存弹窗(显示)
            }}
            清空循环={() => setCycle([])}
            快速导入循环={(循环) => {
              setCycle(循环)
            }}
            更新奇穴信息={更新奇穴信息}
            更新奇穴弹窗展示={更新奇穴弹窗展示}
            加速值={加速值}
            更新加速值={更新加速值}
            网络延迟={网络延迟}
            更新网络延迟={更新网络延迟}
            模拟信息={展示模拟信息}
            启用团队增益快照={启用团队增益快照}
            更新启用团队增益快照={更新启用团队增益快照}
            快速导入默认循环={快速导入默认循环}
            战斗曲线数据={战斗曲线.曲线数据}
            on生成战斗曲线={战斗曲线.计算曲线数据}
          />
        }
        centered
        footer={null}
        open={模拟器弹窗展示}
        onCancel={() => 更新模拟器弹窗展示(false)}
        destroyOnClose
      >
        <div className={'cycle-simulator-setting'}>
          <心法配置
            原始Buff数据={根据奇穴修改buff数据(奇穴信息)}
            配置区={
              <心法特殊配置
                起手星运={起手星运}
                星运上限={星运上限}
                更新起手星运={更新起手星运}
                断御前星延迟={断御前星延迟}
                更新断御前星延迟={更新断御前星延迟}
              />
            }
          />
          {/* 角色状态栏 */}
          {未计算 ? (
            <Alert type='info' showIcon message={关闭提示} />
          ) : 计算异常 ? (
            <Alert type='error' showIcon message={计算异常} />
          ) : null}
          {!未计算 ? (
            <StatusBar
              模拟信息={展示模拟信息}
              当前装备={武器装备?.装备集合[模拟信息.当前武器ID ?? 武器装备.起手武器ID]}
              完整循环={处理循环结果对象?.完整循环 as any}
              日志信息={日志信息}
              模拟DPS结果={模拟DPS结果}
              奇穴信息={奇穴信息}
              模拟函数={simulator}
              战斗曲线面板展示={战斗曲线.战斗曲线面板展示}
              切换战斗曲线面板={战斗曲线.切换战斗曲线面板}
            />
          ) : null}
          {/* // 循环展示模块 */}
          <循环技能容器组件
            处理循环结果对象={处理循环结果对象}
            模拟信息={展示模拟信息}
            cycle={cycle}
            setCycle={setCycle}
            原始Buff数据={原始Buff数据}
            点击下拉菜单={点击下拉菜单}
            允许操作列表={['插入技能', '删除后续', '设置延迟']}
            显示组件={切换武器显示}
            压缩高度={!未计算 && 战斗曲线.战斗曲线面板展示 ? 战斗曲线.压缩高度 : 0}
          />
          {/* 添加循环按钮组 */}
          <武器切换宏入口
            key={String(武器切换功能启用)}
            心法='太玄经'
            参数={{
              加速值,
              网络延迟,
              奇穴: 奇穴信息,
              秘籍: 秘籍信息,
              大橙武模拟,
              起手星运,
              启用团队增益快照,
              团队增益轴,
              副本事件实例列表,
              起手Buff配置,
              断御前星延迟,
              武器装备,
              武器切换功能启用,
            }}
            技能数据={循环模拟技能基础数据}
            更新循环={setCycle}
            当前循环={cycle}
          >
            <AddCycleSkillBtns
              新增循环技能={新增循环技能}
              批量新增循环={批量新增循环}
              处理循环结果对象={处理循环结果对象}
              模拟信息={展示模拟信息}
              大橙武模拟={大橙武模拟}
              奇穴信息={奇穴信息}
              秘籍信息={秘籍信息}
              武器切换可用={武器切换可用}
            />
          </武器切换宏入口>
        </div>
        {/* 战斗曲线底部滑出面板 */}
        {!未计算 && 战斗曲线.战斗曲线面板展示 ? (
          <战斗曲线面板
            open={战斗曲线.战斗曲线面板展示}
            onClose={() => 战斗曲线.切换战斗曲线面板(false)}
            曲线数据={战斗曲线.曲线数据}
            增益泳道列表={战斗曲线.增益泳道列表}
            onRefresh={战斗曲线.计算曲线数据}
            高度={战斗曲线.面板高度}
            on高度变化={战斗曲线.设置面板高度}
          />
        ) : null}
        {/* 保存自定义循环弹窗 */}
        {!含切换武器 ? (
          <保存自定义循环弹窗
            自定义循环保存弹窗={自定义循环保存弹窗}
            设置自定义循环保存弹窗={设置自定义循环保存弹窗}
            获取计算循环数据={getDpsCycle}
            奇穴信息={奇穴信息}
            循环模拟={simulator}
            技能序列={cycle}
            启用团队增益快照={启用团队增益快照}
          />
        ) : null}
        {/* 循环自定义奇穴弹窗 */}
        <奇穴设置组件
          奇穴信息={奇穴信息}
          更新奇穴信息={更新奇穴信息}
          奇穴弹窗展示={奇穴弹窗展示}
          更新奇穴弹窗展示={更新奇穴弹窗展示}
        />
        {/* 添加技能弹窗 */}
        <AddCycleSkillModal
          向循环内插入技能={向循环内插入技能}
          处理循环结果对象={处理循环结果对象}
          模拟信息={展示模拟信息}
          大橙武模拟={大橙武模拟}
          奇穴信息={奇穴信息}
          添加设置={添加设置}
          秘籍信息={秘籍信息}
          武器切换可用={武器切换可用}
          添加技能弹窗显示={添加技能弹窗显示}
          关闭弹窗={() => {
            更新添加技能弹窗显示(false)
            更新添加设置({ 位置: '', 索引: 0 })
          }}
        />
        {/* 延迟弹窗 */}
        <DelaySettingModal
          open={延迟弹窗设置?.open}
          等待最大值={48}
          默认值={延迟弹窗设置?.默认值}
          onCancel={() => 设置延迟弹窗设置({ open: false })}
          保存={(延迟) => 修改技能延迟(延迟, 延迟弹窗设置?.index)}
        />
      </Modal>
    </>
  )
}

export default React.memo(CycleSimulator)
