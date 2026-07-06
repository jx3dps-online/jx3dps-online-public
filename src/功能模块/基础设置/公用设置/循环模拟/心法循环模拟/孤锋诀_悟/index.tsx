// 循环模拟器
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Modal } from 'antd'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 秒伤计算 } from '@/计算模块/计算函数'

import 循环模拟技能基础数据, { 原始Buff数据 } from './constant/skill'
import 保存自定义循环弹窗 from '../通用/通用组件/保存自定义循环弹窗'
import 循环技能容器组件 from '../通用/通用组件/循环技能容器组件'
import 心法配置 from '../通用/通用组件/心法配置'
import 模拟器头部组件 from '../通用/通用组件/模拟器头部组件'

import { getDpsCycle } from './utils'
import {
  循环日志数据类型,
  循环基础技能数据类型,
  ShowCycleSingleSkill,
  模拟信息类型,
} from './simulator/type'

import 模拟循环 from './simulator/index'

import StatusBar from './components/StatusBar'
import AddCycleSkillBtns from './components/AddCycleSkillBtns'
import 心法特殊配置 from './components/心法特殊配置'

import AddCycleSkillModal from './components/AddCycleSkillModal'
import 快速导入默认循环 from './constant/快速导入默认循环'
import { 技能伤害详情类型 } from '../../typs'

import './index.css'
import CycleSimulatorContext from '../../context'

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
    自定义循环保存弹窗,
    设置自定义循环保存弹窗,
    添加技能弹窗显示,
    更新添加技能弹窗显示,
    添加设置,
    更新添加设置,
    起手Buff配置,
    增益启用,
  } = useContext(CycleSimulatorContext)

  const [模拟信息, 更新模拟信息] = useState<模拟信息类型>({
    角色状态信息: {
      锐意: 60,
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
  })

  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)
  // 是否开启武学助手
  const [开启武学助手, 设置开启武学助手] = useState<boolean>(false)
  const [显示锐意, 设置显示锐意] = useState<boolean>(false)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (模拟器弹窗展示) {
      simulator({})
    }
  }, [
    模拟器弹窗展示,
    增益启用,
    cycle,
    网络延迟,
    加速值,
    奇穴信息,
    开启武学助手,
    启用团队增益快照,
    团队增益轴,
    起手Buff配置,
  ])

  const simulator = (props?) => {
    const {
      传入加速 = 加速值,
      传入延迟 = 网络延迟,
      更新展示 = true,
      奇穴,
      实时计算 = false,
    } = props
    const res = 模拟循环({
      测试循环: cycle.map((item) => item?.技能名称) || [],
      加速值: 传入加速 !== undefined ? 传入加速 : 加速值,
      网络延迟: 传入延迟 !== undefined ? 传入延迟 : 网络延迟,
      奇穴: 奇穴 || 奇穴信息,
      大橙武模拟,
      开启武学助手,
      启用团队增益快照,
      团队增益轴,
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
      更新日志信息(最终日志 as any)
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
      return { 最终日志, 技能伤害详情数据, ...rest }
    }
    return { 最终日志, ...rest }
  }

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

  // 计算DPS日志
  const 计算dps = (data: 循环日志数据类型[], 战斗时间) => {
    const 获取用于计算的技能组 = getDpsCycle(data)
    const 计算参数: any = {
      更新循环技能列表: 获取用于计算的技能组,
      更新计算时间: 战斗时间 / 每秒郭氏帧,
      更新奇穴数据: 奇穴信息,
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

  // 向循环内新增技能
  const 新增循环技能 = (item: 循环基础技能数据类型) => {
    const newCycle = [...(cycle || []), item]
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

    cycle.map((item, index) => {
      const 找到当前技能释放记录 = 模拟信息?.技能释放记录?.[index]
      const data = {
        ...item,
        ...找到当前技能释放记录,
      }
      if (index === 0) {
        res[res?.length] = [{ ...data, index: index || 0 }]
      } else {
        res[res?.length - 1] = [...(res[res?.length - 1] || []), { ...data, index: index || 0 }]

        const 打完本技能换行 = 是否存在换行技能
          ? data?.技能名称 === '换行'
          : data?.技能名称 === '横云势·二'

        // const 打完本技能换行 = data?.技能名称 === '横云势二'

        if (打完本技能换行) {
          res[res?.length] = []
        }
      }
      return data
    })

    return { 显示循环: res, 完整循环: cycle }
  }, [cycle, 模拟信息])

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
    setCycle(newCycle as any)
  }

  const 点击下拉菜单 = (data, index) => {
    更新添加设置({ 位置: data?.key, 索引: index })
    更新添加技能弹窗显示(true)
  }

  const 底部标识函数 = (e: 循环基础技能数据类型, index: number) => {
    if (!显示锐意) {
      return null
    }
    const 找到当前技能释放记录 = 模拟信息?.技能释放记录?.[index]
    if (找到当前技能释放记录?.技能释放记录结果?.底部标识 !== undefined) {
      return (
        // 这个classname是通用样式名，也可以在自己这个文件夹下写自己职业的自定义样式（就可以自己掌控样子了）
        <div className='cycle-item-bottom-wrap'>
          {/* 自动判断底部标识的类型显示，你也可以不自动判断用下面的两个注释写法的其中一种 */}
          {typeof 找到当前技能释放记录?.技能释放记录结果?.底部标识 === 'boolean' ? (
            <div className='cycle-item-bottom-line'></div>
          ) : (
            <div className='cycle-item-bottom-text'>
              {找到当前技能释放记录?.技能释放记录结果?.底部标识}
            </div>
          )}
          {/* 写法1：这个是横线红色的写法，用来强调标记一些buff覆盖 */}
          {/* <div className='cycle-item-bottom-line'></div> */}
          {/* 写法2：这个是如果你的底部标识传入过来的是一个数字/文案，直接展示具体内容 */}
          {/* <div className='cycle-item-bottom-text'>
            {找到当前技能释放记录?.技能释放记录结果?.底部标识}
          </div> */}
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Modal
        className='cycle-simulator-modal'
        maskClosable={false}
        width={'100%'}
        title={
          <模拟器头部组件
            cycle={cycle as any}
            设置自定义循环保存弹窗={设置自定义循环保存弹窗}
            清空循环={() => setCycle([])}
            快速导入循环={(循环) => {
              setCycle(循环)
              // 设置开启武学助手(循环标记 === '助手')
            }}
            网络延迟={网络延迟}
            更新网络延迟={更新网络延迟}
            加速值={加速值}
            更新加速值={更新加速值}
            模拟信息={模拟信息}
            启用团队增益快照={启用团队增益快照}
            更新启用团队增益快照={更新启用团队增益快照}
            大橙武模拟={大橙武模拟}
            快速导入默认循环={快速导入默认循环}
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
            原始Buff数据={原始Buff数据}
            配置区={<心法特殊配置 显示锐意={显示锐意} 设置显示锐意={设置显示锐意} />}
          />
          {/* 角色状态栏 */}
          <StatusBar
            模拟信息={模拟信息}
            完整循环={处理循环结果对象?.完整循环 as any}
            日志信息={日志信息}
            模拟DPS结果={模拟DPS结果}
            模拟函数={simulator}
          />
          {/* // 循环展示模块 */}
          <循环技能容器组件
            处理循环结果对象={处理循环结果对象 as any}
            模拟信息={模拟信息}
            cycle={cycle as any}
            setCycle={setCycle}
            原始Buff数据={原始Buff数据}
            点击下拉菜单={点击下拉菜单}
            底部标识={底部标识函数}
          />
        </div>
        {/* 添加循环按钮组 */}
        <AddCycleSkillBtns
          新增循环技能={新增循环技能}
          批量新增循环={批量新增循环}
          处理循环结果对象={处理循环结果对象}
          模拟信息={模拟信息}
          大橙武模拟={大橙武模拟}
          开启武学助手={开启武学助手}
          设置开启武学助手={设置开启武学助手}
        />
        {/* 保存自定义循环弹窗 */}
        <保存自定义循环弹窗
          自定义循环保存弹窗={自定义循环保存弹窗}
          设置自定义循环保存弹窗={设置自定义循环保存弹窗}
          获取计算循环数据={getDpsCycle}
          奇穴信息={奇穴信息}
          循环模拟={simulator}
          技能序列={cycle}
          启用团队增益快照={启用团队增益快照}
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
      </Modal>
    </>
  )
}

export default React.memo(CycleSimulator)
