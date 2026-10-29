// 循环模拟器
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Modal } from 'antd'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 秒伤计算 } from '@/计算模块/计算函数'

import 循环模拟技能基础数据, { 原始Buff数据 } from './constant/skill'
import { BUFF持续最大时间 } from './constant'

import { getDpsCycle } from './utils'
import {
  循环日志数据类型,
  循环基础技能数据类型,
  ShowCycleSingleSkill,
  模拟信息类型,
  体态类型,
  资源类型,
} from './simulator/type'

import 保存自定义循环弹窗 from '../通用/通用组件/保存自定义循环弹窗'
import 循环技能容器组件 from '../通用/通用组件/循环技能容器组件'
import 心法配置 from '../通用/通用组件/心法配置'
import 宏入口 from '../通用/宏解释/界面/入口'
import 模拟器头部组件 from '../通用/通用组件/模拟器头部组件'
import 奇穴设置组件 from '../通用/通用组件/奇穴设置组件'

import 模拟循环 from './simulator/index'
import 心法特殊配置 from './components/心法特殊配置'
import 快速导入默认循环 from './constant/快速导入默认循环'
import StatusBar from './components/StatusBar'
import AddCycleSkillBtns from './components/AddCycleSkillBtns'
import AddCycleSkillModal from './components/AddCycleSkillModal'

import CycleSimulatorContext from '../../context'
import { 根据奇穴修改buff数据 } from './simulator/utils'
import './index.css'
import DelaySettingModal from '../通用/通用组件/技能延迟弹窗'
import { 生成实际技能序列 } from '../通用/通用函数'
import { 战斗曲线面板 } from '../通用/通用组件/战斗曲线弹窗'
import { use战斗曲线 } from '../通用/通用组件/战斗曲线弹窗/use战斗曲线'
import { 监听增益类型 } from '../通用/通用组件/战斗曲线弹窗/增益泳道'

// 心法监听增益：这些自身增益会作为泳道展示在战斗曲线上
const 监听增益列表: 监听增益类型[] = [
  { 名称: '斩狂枭', 颜色: '#4159b4' },
  { 名称: '临江', 颜色: '#2f9e44' },
  { 名称: '疏狂_自我', 颜色: '#ad6800' },
].map((item) => ({ ...item, 图标: 原始Buff数据?.[item.名称]?.图标 }))

const 宏功能暂时屏蔽 = true

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
    秘籍信息,
    奇穴信息,
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
    增益启用,
    当前副本事件实例列表,
  } = useContext(CycleSimulatorContext)

  const [延迟弹窗设置, 设置延迟弹窗设置] = useState<{
    open: boolean
    index?: number
    默认值?: number | 'GCD'
  }>({
    open: false,
  })

  const [模拟信息, 更新模拟信息] = useState<模拟信息类型>({
    角色状态信息: {
      狂意: 100,
      刀魂: 100,
      气劲: 100,
      体态: '秀明尘身',
    },
    当前时间: 0,
    当前自身buff列表: {},
    当前目标buff列表: {},
    循环执行结果: '成功',
    循环异常信息: {},
    技能基础数据: [...循环模拟技能基础数据],
    当前DOT运行状态: {},
    技能释放记录: [],
    当前各技能运行状态: {},
    当前GCD组: {},
  })

  const [起手资源, 设置起手资源] = useState<Record<资源类型, number>>({
    狂意: 100,
    刀魂: 100,
    气劲: 100,
  })
  const [起手体态, 设置起手体态] = useState<体态类型>('秀明尘身')
  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)
  const 副本事件实例列表 = 当前副本事件实例列表

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (模拟器弹窗展示) {
      simulator({})
    }
  }, [
    模拟器弹窗展示,
    cycle,
    加速值,
    网络延迟,
    秘籍信息,
    奇穴信息,
    团队增益轴,
    启用团队增益快照,
    起手Buff配置,
    起手资源,
    起手体态,
    增益启用,

    副本事件实例列表,
  ])

  const simulator = (props?) => {
    const { 传入加速 = 加速值, 传入延迟 = 网络延迟, 更新展示 = true, 奇穴 } = props
    const res = 模拟循环({
      测试循环: 生成实际技能序列(cycle),
      加速值: 传入加速 !== undefined ? 传入加速 : 加速值,
      网络延迟: 传入延迟 !== undefined ? 传入延迟 : 网络延迟,
      奇穴: 奇穴 || 奇穴信息,
      秘籍: 秘籍信息,
      大橙武模拟,
      启用团队增益快照,
      团队增益轴,
      副本事件实例列表,
      起手Buff配置,
      起手资源,
      起手体态,
    })

    const {
      最终日志,
      当前自身buff列表: 处理后自身buff,
      当前目标buff列表: 处理后目标buff,
      角色状态信息: 处理后角色状态信息,
      ...rest
    } = res
    if (更新展示) {
      更新日志信息(最终日志 as any)
      计算dps(最终日志, rest?.当前时间)
      更新模拟信息({
        当前自身buff列表: 处理后自身buff,
        当前目标buff列表: 处理后目标buff,
        角色状态信息: 处理后角色状态信息,
        ...rest,
      })
    }

    return { 最终日志, ...rest }
  }

  // 计算DPS日志
  const 计算dps = (data: 循环日志数据类型[], 战斗时间) => {
    const 获取用于计算的技能组 = getDpsCycle(data, 战斗时间, 大橙武模拟)
    const 计算参数: any = {
      更新循环技能列表: 获取用于计算的技能组,
      更新计算时间: 战斗时间 / 每秒郭氏帧,
      更新奇穴数据: 奇穴信息,
      更新秘籍信息: 秘籍信息,
      更新增益启用: 增益启用,
    }
    const { 秒伤, 计算结果技能列表, 秒伤计算时间, 总伤 } = dispatch(秒伤计算(计算参数))
    更新模拟DPS结果({
      秒伤: 战斗时间 > 0 ? 秒伤 : 0,
      总伤: 战斗时间 > 0 ? 总伤 : 0,
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
    日志转循环: (日志, 战斗时间) => getDpsCycle(日志, 战斗时间, 大橙武模拟),
    奇穴信息,
    秘籍信息,
  })

  // 向循环内新增技能
  const 新增循环技能 = (item: 循环基础技能数据类型, extra?) => {
    let newCycle: 循环基础技能数据类型[] = []
    let newSkill: 循环基础技能数据类型 = item
    if (extra) {
      newSkill = { ...item, 额外信息: extra }
    }
    newCycle = [...(cycle || []), newSkill]
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
    const newCycle = [...(cycle || []), ...item]
    setCycle(newCycle)
  }

  // 根据循环计算更适合展示的多层数组，用于显示
  const 处理循环结果对象 = useMemo(() => {
    const res: ShowCycleSingleSkill[][] = []
    const 是否存在换行技能 = cycle?.find((item) => item?.技能名称 === '换行')

    cycle.forEach((item, index) => {
      const 找到当前技能释放记录 = 模拟信息?.技能释放记录?.[index]
      const data = {
        ...item,
        ...找到当前技能释放记录,
        技能释放记录结果: {
          ...找到当前技能释放记录?.技能释放记录结果,
        },
      }
      if (index === 0) {
        res[res?.length] = [{ ...data, index: index || 0 }]
      } else {
        res[res?.length - 1] = [...(res[res?.length - 1] || []), { ...data, index: index || 0 }]

        const 换行 = data?.技能名称 === '换行'

        if (换行) {
          res[res?.length] = []
        }
      }
      return data
    })

    return { 显示循环: res, 完整循环: cycle }
  }, [cycle, 模拟信息])

  const 点击下拉菜单 = (data, index) => {
    if (data?.key === '设置延迟时间') {
      const 当前延迟 = cycle?.[index]?.额外信息?.延迟
      设置延迟弹窗设置({ open: true, index: index, 默认值: 当前延迟 })
    } else {
      更新添加设置({ 位置: data?.key, 索引: index })
      更新添加技能弹窗显示(true)
    }
  }

  const 修改技能延迟 = (延迟, 索引) => {
    const newCycle: 循环基础技能数据类型[] = cycle?.map((item, index) => {
      let newItem: 循环基础技能数据类型 = { ...item }
      if (index === 索引) {
        if (延迟) {
          newItem = {
            ...newItem,
            额外信息: {
              延迟,
            },
          }
        } else {
          delete newItem?.额外信息
        }
      }
      return newItem
    })
    setCycle(newCycle)
  }

  const Buff数据 = 根据奇穴修改buff数据(奇穴信息, 加速值) as typeof 原始Buff数据
  const 起手Buff界面数据 = Object.fromEntries(
    Object.entries(Buff数据).map(([名称, Buff]) => [
      名称,
      !Buff.最大持续时间 || Buff.最大持续时间 === BUFF持续最大时间
        ? { ...Buff, 最大持续时间: 1 }
        : Buff,
    ]),
  )

  return (
    <>
      <Modal
        className='cycle-simulator-modal'
        maskClosable={false}
        width={'100%'}
        title={
          <模拟器头部组件
            cycle={cycle}
            设置自定义循环保存弹窗={设置自定义循环保存弹窗}
            清空循环={() => setCycle([])}
            快速导入循环={(循环, 额外信息) => {
              setCycle(循环)
              设置起手资源(额外信息?.起手资源 || { 狂意: 100, 刀魂: 100, 气劲: 100 })
              设置起手体态(额外信息?.起手体态 || '秀明尘身')
            }}
            更新奇穴信息={更新奇穴信息}
            更新奇穴弹窗展示={更新奇穴弹窗展示}
            加速值={加速值}
            更新加速值={更新加速值}
            网络延迟={网络延迟}
            更新网络延迟={更新网络延迟}
            模拟信息={模拟信息}
            启用团队增益快照={启用团队增益快照}
            更新启用团队增益快照={更新启用团队增益快照}
            大橙武模拟={大橙武模拟}
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
            原始Buff数据={起手Buff界面数据}
            配置区={
              <心法特殊配置
                起手资源={起手资源}
                设置起手资源={设置起手资源}
                起手体态={起手体态}
                设置起手体态={设置起手体态}
              />
            }
          />
          {/* 角色状态栏 */}
          <StatusBar
            模拟信息={模拟信息}
            完整循环={处理循环结果对象?.完整循环 as any}
            日志信息={日志信息}
            模拟DPS结果={模拟DPS结果}
            模拟函数={simulator}
            奇穴信息={奇穴信息}
            战斗曲线面板展示={战斗曲线.战斗曲线面板展示}
            切换战斗曲线面板={战斗曲线.切换战斗曲线面板}
          />
          {/* // 循环展示模块 */}
          <循环技能容器组件
            处理循环结果对象={处理循环结果对象}
            模拟信息={模拟信息}
            cycle={cycle}
            setCycle={setCycle}
            原始Buff数据={原始Buff数据}
            点击下拉菜单={点击下拉菜单}
            允许操作列表={['插入技能', '删除后续', '设置延迟']}
            压缩高度={战斗曲线.战斗曲线面板展示 ? 战斗曲线.压缩高度 : 0}
          />
          {/* 添加循环按钮组 */}
          {宏功能暂时屏蔽 ? (
            <AddCycleSkillBtns
              新增循环技能={新增循环技能}
              批量新增循环={批量新增循环}
              处理循环结果对象={处理循环结果对象}
              模拟信息={模拟信息}
              大橙武模拟={大橙武模拟}
              奇穴信息={奇穴信息}
            />
          ) : (
            <宏入口
              心法='北傲诀'
              参数={{
                加速值,
                网络延迟,
                奇穴: 奇穴信息,
                秘籍: 秘籍信息,
                大橙武模拟,
                启用团队增益快照,
                团队增益轴,
                副本事件实例列表,
                起手Buff配置,
                起手资源,
                起手体态,
              }}
              技能数据={循环模拟技能基础数据}
              更新循环={setCycle}
              当前循环={cycle}
            >
              <AddCycleSkillBtns
                新增循环技能={新增循环技能}
                批量新增循环={批量新增循环}
                处理循环结果对象={处理循环结果对象}
                模拟信息={模拟信息}
                大橙武模拟={大橙武模拟}
                奇穴信息={奇穴信息}
              />
            </宏入口>
          )}
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
        </div>
        {/* 保存自定义循环弹窗 */}
        <保存自定义循环弹窗
          自定义循环保存弹窗={自定义循环保存弹窗}
          设置自定义循环保存弹窗={设置自定义循环保存弹窗}
          获取计算循环数据={(日志, 战斗时间) => getDpsCycle(日志, 战斗时间, 大橙武模拟)}
          奇穴信息={奇穴信息}
          循环模拟={simulator}
          技能序列={cycle}
          启用团队增益快照={启用团队增益快照}
          额外配置信息={{ 起手资源, 起手体态 }}
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
          等待最大值={48}
          open={延迟弹窗设置?.open}
          默认值={延迟弹窗设置?.默认值}
          onCancel={() => 设置延迟弹窗设置({ open: false })}
          保存={(延迟) => 修改技能延迟(延迟, 延迟弹窗设置?.index)}
        />
      </Modal>
    </>
  )
}

export default React.memo(CycleSimulator)
