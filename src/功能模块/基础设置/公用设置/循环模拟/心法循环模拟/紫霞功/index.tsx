// 循环模拟器
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Modal } from 'antd'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 技能伤害详情类型 } from '../../typs'

import 循环模拟技能基础数据, { 原始Buff数据 } from './constant/skill'
import 宏入口 from '../通用/宏解释/界面/入口'
import { getDpsCycle, 转换技能序列, 获取紫气覆盖技能 } from './utils'
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
import 奇穴设置组件 from '../通用/通用组件/奇穴设置组件'
import 模拟循环 from './simulator/index'

import StatusBar from './components/StatusBar'
import AddCycleSkillBtns from './components/AddCycleSkillBtns'
import 心法特殊配置 from './components/心法特殊配置'
import 紫霞技能显示, { 循环技能显示上下文 } from './components/循环技能显示'
import 快速导入默认循环 from './constant/快速导入默认循环'

import AddCycleSkillModal from './components/AddCycleSkillModal'
import styles from './index.module.less'
import CycleSimulatorContext from '../../context'
import { 根据奇穴修改buff数据, 转换起手Buff配置 } from './simulator/utils'
import DelaySettingModal from '../通用/通用组件/技能延迟弹窗'
import { 生成实际技能序列 } from '../通用/通用函数'
import { 战斗曲线面板 } from '../通用/通用组件/战斗曲线弹窗'
import { use战斗曲线 } from '../通用/通用组件/战斗曲线弹窗/use战斗曲线'
import { 监听增益类型 } from '../通用/通用组件/战斗曲线弹窗/增益泳道'

// 心法监听增益：爆发 buff 作为泳道展示在战斗曲线上
const 监听增益列表: 监听增益类型[] = []

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
    更新奇穴信息,
    秘籍信息,
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

  const [模拟信息, 更新模拟信息] = useState<模拟信息类型>({
    角色状态信息: {
      气点: 10,
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
  })

  const [延迟弹窗设置, 设置延迟弹窗设置] = useState<{
    open: boolean
    index?: number
    默认值?: number | 'GCD'
  }>({
    open: false,
  })

  const [起手气点, 更新起手气点] = useState<number>(5)
  const [会心回豆, 更新会心回豆] = useState(false)
  const [隐藏角标, 更新隐藏角标] = useState(false)
  const [隐藏紫气覆盖, 更新隐藏紫气覆盖] = useState(false)
  const [忽略延迟技能, 更新忽略延迟技能] = useState<string[]>([])
  const [周期性忽略延迟, 更新周期性忽略延迟] = useState<number>(0)
  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)
  const 副本事件实例列表 = 当前副本事件实例列表
  const dispatch = useAppDispatch()

  useEffect(() => {
    const 配置 = 转换起手Buff配置(起手Buff配置)
    if (配置 !== 起手Buff配置) 更新起手Buff配置(配置!)
  }, [起手Buff配置, 更新起手Buff配置])

  useEffect(() => {
    if (模拟器弹窗展示) {
      simulator({})
    }
  }, [
    模拟器弹窗展示,
    增益启用,
    cycle,
    大橙武模拟,
    网络延迟,
    秘籍信息,
    起手气点,
    会心回豆,
    忽略延迟技能,
    周期性忽略延迟,
    启用团队增益快照,
    加速值,
    奇穴信息,
    团队增益轴,
    副本事件实例列表,
    起手Buff配置,
  ])

  const simulator = (props?) => {
    const {
      传入加速 = 加速值,
      传入延迟 = 网络延迟,
      更新展示 = true,
      奇穴,
      实时计算 = false,
      传入循环 = cycle,
    } = props
    const res = 模拟循环({
      测试循环: 生成实际技能序列(传入循环),
      加速值: 传入加速 !== undefined ? 传入加速 : 加速值,
      网络延迟: 传入延迟 !== undefined ? 传入延迟 : 网络延迟,
      奇穴: 奇穴 || 奇穴信息,
      秘籍: 秘籍信息,
      大橙武模拟,
      起手气点,
      会心回豆,
      忽略延迟技能,
      周期性忽略延迟,
      启用团队增益快照,
      团队增益轴,
      副本事件实例列表,
      起手Buff配置,
    })

    const {
      最终日志,
      当前自身buff列表: 处理后自身buff,
      当前目标buff列表: 处理后目标buff,
      角色状态信息: 处理后角色状态信息,
      ...rest
    } = res
    if (更新展示) {
      更新日志信息(最终日志)
      计算dps(最终日志, rest?.当前时间)
      更新模拟信息({
        当前自身buff列表: 处理后自身buff,
        当前目标buff列表: 处理后目标buff,
        角色状态信息: 处理后角色状态信息,
        ...rest,
      })
    }
    if (实时计算) {
      const 技能伤害详情数据 = 获取单技能实时计算函数(最终日志)
      return { ...res, 技能伤害详情数据 }
    }
    return res
  }

  // 计算DPS日志
  const 计算dps = (data: 循环日志数据类型[], 当前时间) => {
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

  const 紫气覆盖技能 = useMemo(
    () => 获取紫气覆盖技能(模拟信息.技能释放记录, 日志信息),
    [模拟信息.技能释放记录, 日志信息],
  )

  const 处理循环结果对象 = useMemo(() => {
    const 显示循环: ShowCycleSingleSkill[][] = [[]]
    const 有手动换行 = cycle.some((技能) => 技能.技能名称 === '换行')
    cycle.forEach((技能, index) => {
      const 数据 = {
        ...技能,
        ...模拟信息.技能释放记录[index],
        index,
        紫气覆盖跳数: 紫气覆盖技能.get(index),
      }
      显示循环[显示循环.length - 1].push(数据)
      if (技能.技能名称 === '换行' || (!有手动换行 && 技能.技能名称 === '破苍穹')) {
        显示循环.push([])
      }
    })
    return { 显示循环, 完整循环: cycle }
  }, [cycle, 模拟信息, 紫气覆盖技能])

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
      addCycle = newCycle.slice(0, 插入索引 + 1).concat(item, newCycle.slice(插入索引 + 1))
      更新添加设置({ ...添加设置, 索引: 添加设置.索引 + item.length })
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
        const 额外信息 = { ...item.额外信息 }
        if (延迟) {
          额外信息.延迟 = 延迟
        } else {
          delete 额外信息.延迟
        }
        newItem = { ...newItem, 额外信息 }
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
        rootClassName='zxg-simulator'
        className='cycle-simulator-modal'
        maskClosable={false}
        width={'100%'}
        title={
          <模拟器头部组件
            cycle={cycle}
            大橙武模拟={大橙武模拟}
            设置自定义循环保存弹窗={设置自定义循环保存弹窗}
            清空循环={() => setCycle([])}
            快速导入循环={(循环, 配置) => {
              setCycle(循环)
              更新会心回豆(配置?.会心回豆 === true)
              if (配置?.起手气点 !== undefined) 更新起手气点(配置.起手气点)
              if (配置?.忽略延迟技能 !== undefined) 更新忽略延迟技能(配置.忽略延迟技能)
              if (配置?.周期性忽略延迟 !== undefined) 更新周期性忽略延迟(配置.周期性忽略延迟)
            }}
            转换技能序列={转换技能序列}
            更新奇穴信息={更新奇穴信息}
            更新奇穴弹窗展示={更新奇穴弹窗展示}
            加速值={加速值}
            更新加速值={更新加速值}
            网络延迟={网络延迟}
            更新网络延迟={更新网络延迟}
            模拟信息={模拟信息}
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
                会心回豆={会心回豆}
                更新会心回豆={更新会心回豆}
                隐藏角标={隐藏角标}
                更新隐藏角标={更新隐藏角标}
                隐藏紫气覆盖={隐藏紫气覆盖}
                更新隐藏紫气覆盖={更新隐藏紫气覆盖}
                起手气点={起手气点}
                更新起手气点={更新起手气点}
                忽略延迟技能={忽略延迟技能}
                更新忽略延迟技能={更新忽略延迟技能}
                周期性忽略延迟={周期性忽略延迟}
                更新周期性忽略延迟={更新周期性忽略延迟}
              />
            }
          />
          {/* 角色状态栏 */}
          <StatusBar
            模拟信息={模拟信息}
            完整循环={处理循环结果对象?.完整循环 as any}
            日志信息={日志信息}
            模拟DPS结果={模拟DPS结果}
            奇穴信息={奇穴信息}
            模拟函数={simulator}
            战斗曲线面板展示={战斗曲线.战斗曲线面板展示}
            切换战斗曲线面板={战斗曲线.切换战斗曲线面板}
          />
          {/* // 循环展示模块 */}
          <循环技能显示上下文.Provider value={{ 会心回豆, 隐藏角标 }}>
            <循环技能容器组件
              显示组件={紫霞技能显示}
              背景容器={(技能, 索引) =>
                !隐藏紫气覆盖 && 紫气覆盖技能.has(索引) ? (
                  <div
                    className={`${styles.紫气覆盖背景} ${
                      技能.技能名称 === '六合独尊' && 紫气覆盖技能.get(索引)! <= 3
                        ? styles.六合低覆盖背景
                        : ''
                    }`}
                    role='img'
                    aria-label='该技能有伤害受到紫气覆盖'
                  />
                ) : null
              }
              处理循环结果对象={处理循环结果对象}
              模拟信息={模拟信息}
              cycle={cycle}
              setCycle={setCycle}
              原始Buff数据={原始Buff数据}
              点击下拉菜单={点击下拉菜单}
              允许操作列表={['插入技能', '删除后续', '设置延迟']}
              压缩高度={战斗曲线.战斗曲线面板展示 ? 战斗曲线.压缩高度 : 0}
            />
          </循环技能显示上下文.Provider>
        </div>
        {/* 添加循环按钮组 */}
        <宏入口
          心法='紫霞功'
          参数={{
            加速值,
            网络延迟,
            奇穴: 奇穴信息,
            秘籍: 秘籍信息,
            大橙武模拟,
            起手气点,
            会心回豆,
            忽略延迟技能,
            周期性忽略延迟,
            启用团队增益快照,
            团队增益轴,
            副本事件实例列表,
            起手Buff配置,
          }}
          技能数据={循环模拟技能基础数据}
          当前循环={cycle}
          更新循环={setCycle}
        >
          <AddCycleSkillBtns
            会心回豆={会心回豆}
            新增循环技能={新增循环技能}
            批量新增循环={批量新增循环}
            处理循环结果对象={处理循环结果对象}
            模拟信息={模拟信息}
            大橙武模拟={大橙武模拟}
            奇穴信息={奇穴信息}
          />
        </宏入口>
        {/* 战斗曲线底部滑出面板 */}
        {战斗曲线.战斗曲线面板展示 ? (
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
        <保存自定义循环弹窗
          自定义循环保存弹窗={自定义循环保存弹窗}
          设置自定义循环保存弹窗={设置自定义循环保存弹窗}
          获取计算循环数据={getDpsCycle}
          奇穴信息={奇穴信息}
          循环模拟={simulator}
          额外配置信息={{ 起手气点, 会心回豆, 忽略延迟技能, 周期性忽略延迟 }}
          技能序列={cycle}
          启用团队增益快照={启用团队增益快照}
        />
        {/* 循环自定义奇穴弹窗 */}
        <奇穴设置组件
          奇穴信息={奇穴信息}
          更新奇穴信息={更新奇穴信息}
          奇穴弹窗展示={奇穴弹窗展示}
          更新奇穴弹窗展示={更新奇穴弹窗展示}
        />
        {/* 添加技能弹窗 */}
        <AddCycleSkillModal
          会心回豆={会心回豆}
          循环模拟={simulator}
          向循环内插入技能={向循环内插入技能}
          处理循环结果对象={处理循环结果对象}
          模拟信息={模拟信息}
          大橙武模拟={大橙武模拟}
          奇穴信息={奇穴信息}
          添加设置={添加设置}
          添加技能弹窗显示={添加技能弹窗显示}
          关闭弹窗={() => {
            更新添加技能弹窗显示(false)
            更新添加设置({ 位置: '', 索引: 0 })
          }}
        />
        {/* 延迟弹窗 */}
        <DelaySettingModal
          open={延迟弹窗设置?.open}
          等待最大值={每秒郭氏帧 * 3}
          默认值={延迟弹窗设置?.默认值}
          onCancel={() => 设置延迟弹窗设置({ open: false })}
          保存={(延迟) => 修改技能延迟(延迟, 延迟弹窗设置?.index)}
        />
      </Modal>
    </>
  )
}

export default React.memo(CycleSimulator)
