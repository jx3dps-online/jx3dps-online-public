// 循环模拟器
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Modal } from 'antd'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 秒伤计算 } from '@/计算模块/计算函数'

import 循环模拟技能基础数据, { 原始Buff数据 } from './constant/skill'

import { getDpsCycle } from './utils'
import {
  循环日志数据类型,
  循环基础技能数据类型,
  ShowCycleSingleSkill,
  模拟信息类型,
} from './simulator/type'
import { 技能伤害详情类型 } from '../../typs'

import 保存自定义循环弹窗 from '../通用/通用组件/保存自定义循环弹窗'
import 循环技能容器组件 from '../通用/通用组件/循环技能容器组件'
import 心法配置 from '../通用/通用组件/心法配置'
import 模拟器头部组件 from '../通用/通用组件/模拟器头部组件'
import 奇穴设置组件 from '../通用/通用组件/奇穴设置组件'

import 模拟循环 from './simulator/index'
import 心法特殊配置 from './components/心法特殊配置'
import 快速导入默认循环 from './constant/快速导入默认循环'
import StatusBar from './components/StatusBar'
import AddCycleSkillBtns from './components/AddCycleSkillBtns'
import AddCycleSkillModal from './components/AddCycleSkillModal'

import CycleSimulatorContext from '../../context'
import { 根据奇穴秘籍修改buff数据 } from './simulator/utils'
import './index.css'
import DelaySettingModal from '../通用/通用组件/技能延迟弹窗'
import { 生成实际技能序列 } from '../通用/通用函数'

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
      怒气: 0,
      体态: '擎盾',
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
  // const [显示绝刀怒气, 更新显示绝刀怒气] = useState<boolean>(false)
  const [显示释放时援戈层数, 更新显示释放时援戈层数] = useState<boolean>(false)
  const [起手怒气, 设置起手怒气] = useState<number>(0)
  // const [起手体态, 设置起手体态] = useState<'擎刀' | '擎盾'>('擎盾')
  const [忽略延迟技能, 更新忽略延迟技能] = useState<string[]>([])
  const [显示怒气, 设置显示怒气] = useState<boolean>(false)
  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)

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
    起手怒气,
    忽略延迟技能,
    增益启用,
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
      测试循环: 生成实际技能序列(cycle),
      加速值: 传入加速 !== undefined ? 传入加速 : 加速值,
      网络延迟: 传入延迟 !== undefined ? 传入延迟 : 网络延迟,
      奇穴: 奇穴 || 奇穴信息,
      秘籍: 秘籍信息,
      大橙武模拟,
      启用团队增益快照,
      团队增益轴,
      起手Buff配置,
      起手怒气,
      忽略延迟技能,
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

  // 计算DPS日志
  const 计算dps = (data: 循环日志数据类型[], 战斗时间) => {
    const 获取用于计算的技能组 = getDpsCycle(data, 战斗时间)
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
        const 找到最终技能数据 = 计算结果技能列表?.find(
          (a) => a?.技能名称 === 获取用于计算的技能组?.[0]?.技能名称,
        )
        if (找到最终技能数据) {
          技能伤害详情数据.push({
            名称: 单伤害数据?.日志,
            增益: 单伤害数据?.buff列表 || [],
            时间: 单伤害数据?.日志时间 || 0,
            伤害: 找到最终技能数据?.技能总输出 || 0,
            会心期望: 找到最终技能数据?.会心几率 || 0,
          })
        }
      }
    }
    return 技能伤害详情数据
  }

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
          特殊标记: undefined,
        },
      }
      // if (item?.技能名称 === '绝刀') {
      //   if (显示绝刀怒气) {
      //     data.技能释放记录结果.特殊标记 = 找到当前技能释放记录?.技能释放记录结果?.特殊标记
      //   }
      // } else if (找到当前技能释放记录?.技能释放记录结果?.特殊标记) {
      //   data.技能释放记录结果.特殊标记 = 找到当前技能释放记录?.技能释放记录结果?.特殊标记
      // }

      if (显示释放时援戈层数) {
        data.技能释放记录结果.特殊标记 = 找到当前技能释放记录?.技能释放记录结果?.特殊标记
      }
      if (index === 0) {
        res[res?.length] = [{ ...data, index: index || 0 }]
      } else {
        res[res?.length - 1] = [...(res[res?.length - 1] || []), { ...data, index: index || 0 }]

        const 换行 = 是否存在换行技能 ? data?.技能名称 === '换行' : data?.技能名称 === '盾回'

        if (换行) {
          res[res?.length] = []
        }
      }
      return data
    })

    //   return { 显示循环: res, 完整循环: cycle }
    // }, [cycle, 模拟信息, 显示绝刀怒气])
    return { 显示循环: res, 完整循环: cycle }
  }, [cycle, 模拟信息, 显示释放时援戈层数])

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

  const 底部标识函数 = (e: 循环基础技能数据类型, index: number) => {
    if (!显示怒气) {
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
            cycle={cycle}
            设置自定义循环保存弹窗={设置自定义循环保存弹窗}
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
            原始Buff数据={根据奇穴秘籍修改buff数据(奇穴信息, 秘籍信息)}
            配置区={
              <心法特殊配置
                // 显示破绽层数={显示破绽层数}
                // 更新显示破绽层数={更新显示破绽层数}
                // 显示绝刀怒气={显示绝刀怒气}
                // 更新显示绝刀怒气={更新显示绝刀怒气}
                显示怒气={显示怒气}
                设置显示怒气={设置显示怒气}
                显示释放时援戈层数={显示释放时援戈层数}
                更新释放时援戈层数={更新显示释放时援戈层数}
                起手怒气={起手怒气}
                设置起手怒气={设置起手怒气}
                忽略延迟技能={忽略延迟技能}
                更新忽略延迟技能={更新忽略延迟技能}
                // 起手体态={起手体态}
                // 设置起手体态={设置起手体态}
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
            底部标识={底部标识函数}
          />
        </div>
        {/* 添加循环按钮组 */}
        <AddCycleSkillBtns
          新增循环技能={新增循环技能}
          批量新增循环={批量新增循环}
          处理循环结果对象={处理循环结果对象}
          模拟信息={模拟信息}
          奇穴信息={奇穴信息}
          大橙武模拟={大橙武模拟}
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
