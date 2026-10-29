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
import styles from './index.module.less'
import DelaySettingModal from '../通用/通用组件/技能延迟弹窗'
import { 生成实际技能序列 } from '../通用/通用函数'
import { 战斗曲线面板 } from '../通用/通用组件/战斗曲线弹窗'
import { use战斗曲线 } from '../通用/通用组件/战斗曲线弹窗/use战斗曲线'
import { 监听增益类型 } from '../通用/通用组件/战斗曲线弹窗/增益泳道'

import 宏入口 from '../通用/宏解释/界面/入口'

// 心法监听增益：爆发 buff 作为泳道展示在战斗曲线上
const 监听增益列表: 监听增益类型[] = [{ 名称: '血怒', 颜色: '#a61e4d' }].map((item) => ({
  ...item,
  图标: 原始Buff数据?.[item.名称]?.图标,
}))

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
  // const [显示释放时援戈层数, 更新显示释放时援戈层数] = useState<boolean>(false)
  const [起手怒气, 设置起手怒气] = useState<number>(100)
  // 盾压重置方式：期望（默认，无随机）/ 概率（按游戏内35%随机）/ 手动（显示重置盾压技能）
  const [盾压重置方式, 设置盾压重置方式] = useState<'期望' | '概率' | '手动'>('期望')
  const [起手暴怒值, 设置起手暴怒值] = useState<number>(40)
  const 暴怒值上限 = 奇穴信息?.includes('积怒') ? 120 : 40
  useEffect(() => {
    // 进入模拟器/切换积怒时，起手暴怒值按当前上限初始化；
    // 初始化后仍可手动在选项范围内调整，仅在上线变化时重置
    设置起手暴怒值(暴怒值上限)
  }, [暴怒值上限])
  // const [起手体态, 设置起手体态] = useState<'擎刀' | '擎盾'>('擎盾')
  const [忽略延迟技能, 更新忽略延迟技能] = useState<string[]>([])
  // 周期免延迟：开启后每 N+1 步里的第 1 步保留延迟、其余全免，忽略延迟技能列表不生效
  const [周期性忽略延迟, 更新周期性忽略延迟] = useState<number>(0)
  // 体态不符自动切换：擎刀按到擎盾技能自动盾回后释放，擎盾按到擎刀技能自动盾飞后释放
  const [体态不符自动切换, 设置体态不符自动切换] = useState<boolean>(false)
  // 取消勾选时清除循环里物化技能的自动插入标记，回到与原先完全一致的循环数据
  useEffect(() => {
    if (!体态不符自动切换 && cycle?.some((item) => item?.自动插入)) {
      setCycle(
        cycle.map((item) => {
          if (!item?.自动插入) {
            return item
          }
          const { 自动插入, ...rest } = item
          return rest as 循环基础技能数据类型
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [体态不符自动切换])
  const [显示怒气, 设置显示怒气] = useState<boolean>(false)
  const [显示血怒覆盖, 设置显示血怒覆盖] = useState<boolean>(true)
  // 显示释放时暴怒值：深蓝，与显示怒气并排展示
  const [显示释放时暴怒值, 设置显示释放时暴怒值] = useState<boolean>(false)
  // 绝刀怒气等级角标（伤害段数=绝破等级1-5）：默认不显示，勾选才显示
  const [显示绝刀怒气等级, 设置显示绝刀怒气等级] = useState<boolean>(false)
  // 盾猛威压层数角标（特殊标记=释放时消耗前的威压层数）：默认不显示，勾选才显示
  const [显示盾猛威压层数, 设置显示盾猛威压层数] = useState<boolean>(false)
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
    副本事件实例列表,
    启用团队增益快照,
    起手Buff配置,
    起手怒气,
    起手暴怒值,
    忽略延迟技能,
    周期性忽略延迟,
    盾压重置方式,
    体态不符自动切换,
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
    const 模拟参数 = {
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
      起手怒气,
      起手暴怒值,
      忽略延迟技能,
      周期性忽略延迟,
      盾压重置方式,
      体态不符自动切换,
    }
    let 模拟结果 = 模拟循环(模拟参数)

    // 体态不符自动切换：模拟器真实释放了盾飞/盾回（切体态、充能、CD、伤害都实际结算），
    // 把它们按释放位置物化进循环，成为可编辑、可删除的普通技能格（带「自动」角标）；
    // 物化后同步重模拟并采用其结果，一次完成，避免等待重模拟期间的技能跳动
    if (体态不符自动切换) {
      let 当前循环 = cycle
      for (let 重试 = 0; 重试 < 10; 重试++) {
        const 记录列表: any[] = 模拟结果?.技能释放记录 || []
        if (!记录列表?.some((记录) => 记录?.自动插入)) {
          break
        }
        const 物化循环: 循环基础技能数据类型[] = []
        let 循环索引 = 0
        记录列表.forEach((记录) => {
          if (记录?.自动插入) {
            const 技能数据 = 模拟结果?.技能基础数据?.find((a) => a?.技能名称 === 记录?.技能名称)
            if (技能数据) {
              物化循环.push({ ...技能数据, 自动插入: true })
            }
          } else {
            const 原技能 = 当前循环?.[循环索引]
            if (原技能) {
              物化循环.push(原技能)
            }
            循环索引 += 1
          }
        })
        // 模拟异常终止时尾部未模拟的技能原样保留
        while (循环索引 < (当前循环?.length || 0)) {
          物化循环.push(当前循环?.[循环索引])
          循环索引 += 1
        }
        当前循环 = 物化循环
        模拟结果 = 模拟循环({ ...模拟参数, 测试循环: 生成实际技能序列(物化循环) })
      }
      if (当前循环 !== cycle) {
        setCycle(当前循环)
      }
    }

    const res = 模拟结果
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
          // 特殊标记仅盾猛携带（释放时威压层数）：勾选「显示盾猛威压层数」才显示，其余技能不显示
          特殊标记:
            item?.技能名称 === '盾猛' && !显示盾猛威压层数
              ? undefined
              : 找到当前技能释放记录?.技能释放记录结果?.特殊标记,
          // 绝刀怒气等级角标（伤害段数=绝破等级1-5）：勾选「显示绝刀怒气等级」才显示
          ...(item?.技能名称 === '绝刀' && !显示绝刀怒气等级 ? { 伤害段数: undefined } : {}),
        },
      }
      // if (item?.技能名称 === '绝刀') {
      //   if (显示绝刀怒气) {
      //     data.技能释放记录结果.特殊标记 = 找到当前技能释放记录?.技能释放记录结果?.特殊标记
      //   }
      // } else if (找到当前技能释放记录?.技能释放记录结果?.特殊标记) {
      //   data.技能释放记录结果.特殊标记 = 找到当前技能释放记录?.技能释放记录结果?.特殊标记
      // }

      // 苍生铸世技改：援戈已移除，注释保留
      // if (显示释放时援戈层数) {
      //   data.技能释放记录结果.特殊标记 = 找到当前技能释放记录?.技能释放记录结果?.特殊标记
      // }
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
  }, [cycle, 模拟信息, 显示绝刀怒气等级, 显示盾猛威压层数 /*, 显示释放时援戈层数 */])

  const 点击下拉菜单 = (data, index) => {
    if (data?.key === '设置延迟时间') {
      const 当前延迟 = cycle?.[index]?.额外信息?.延迟
      设置延迟弹窗设置({ open: true, index: index, 默认值: 当前延迟 })
    } else {
      更新添加设置({ 位置: data?.key, 索引: index })
      更新添加技能弹窗显示(true)
    }
  }

  // 循环技能容器写回的是「循环数据+释放记录」的合并显示项（拖拽、复制本轮、修改倒读条），
  // 写入前剥离展示层字段（段数图标、时间轴等），防止固化进循环数据导致大幅拖动后显示错乱
  const 更新循环数据 = (传入循环: any[]) => {
    setCycle(
      (传入循环 || []).map((item: any) => {
        if (!item) {
          return item
        }
        const {
          计划释放时间,
          实际释放时间,
          开始读条时间,
          是否为读条技能,
          技能释放记录结果,
          index,
          id,
          ...循环技能
        } = item
        return 循环技能 as 循环基础技能数据类型
      }),
    )
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

  // 体态不符自动切换体态的「自动」角标：借用通用技能格的背景容器渲染位注入，非物化技能不渲染
  const 自动标记函数 = (技能: any) => {
    if (!技能?.自动插入) {
      return undefined
    }
    return <span className={styles.自动标记}>自动</span>
  }

  const 背景容器函数 = (技能: 循环基础技能数据类型, index: number) => {
    const 自动标记 = 自动标记函数(技能)
    const 释放记录 = 模拟信息?.技能释放记录
    const 在血怒内 = (序号: number) => !!释放记录?.[序号]?.技能释放记录结果?.背景容器
    const 血怒覆盖 = 显示血怒覆盖 && 在血怒内(index)
    if (!血怒覆盖 && !自动标记) {
      return null
    }
    // 相邻覆盖块前后相连成长条：按前/后技能是否也在血怒内取首/中/尾/单格样式
    let 血怒覆盖段位类名 = styles.血怒覆盖单格
    if (血怒覆盖) {
      const 前格相连 = !!释放记录?.[index - 1]?.技能释放记录结果?.背景容器
      const 后格相连 = !!释放记录?.[index + 1]?.技能释放记录结果?.背景容器
      if (前格相连 && 后格相连) {
        血怒覆盖段位类名 = styles.血怒覆盖中段
      } else if (前格相连) {
        血怒覆盖段位类名 = styles.血怒覆盖尾段
      } else if (后格相连) {
        血怒覆盖段位类名 = styles.血怒覆盖首段
      }
    }
    return (
      <>
        {血怒覆盖 ? <div className={`${styles.血怒覆盖} ${血怒覆盖段位类名}`} /> : null}
        {自动标记}
      </>
    )
  }

  // 底部标识显示规则：内核仅在实际变化时记录对应标识，
  // ① 只有实际产生怒气变化的技能才显示怒气 ② 只有实际产生暴怒值变化的技能才显示暴怒值
  // ③ 两者都变化时并排显示（怒气在前留间距，暴怒值深蓝）
  const 底部标识函数 = (e: 循环基础技能数据类型, index: number) => {
    if (!显示怒气 && !显示释放时暴怒值) {
      return null
    }
    const 找到当前技能释放记录 = 模拟信息?.技能释放记录?.[index]
    const 释放记录结果 = 找到当前技能释放记录?.技能释放记录结果
    const 怒气标识 = 释放记录结果?.底部标识
    const 暴怒值标识 = 释放记录结果?.释放时暴怒值
    // 按开关与实际变化取交集：盾刀等仅怒气变化的技能在勾选暴怒值时不显示任何标识
    const 显示怒气数值 = 显示怒气 && 怒气标识 !== undefined
    const 显示暴怒值数值 = 显示释放时暴怒值 && 暴怒值标识 !== undefined
    if (!显示怒气数值 && !显示暴怒值数值) {
      return null
    }
    // 怒气用暗红，暴怒值用深蓝，并排时留间距区分
    const 怒气颜色 = '#981A1A'
    const 暴怒值颜色 = '#3456A2'
    // 仅怒气变化
    if (!显示暴怒值数值) {
      return (
        <div className='cycle-item-bottom-wrap'>
          <div className='cycle-item-bottom-text' style={{ color: 怒气颜色 }}>
            {怒气标识}
          </div>
        </div>
      )
    }
    // 仅暴怒值变化：深蓝数字
    if (!显示怒气数值) {
      return (
        <div className='cycle-item-bottom-wrap'>
          <div className='cycle-item-bottom-text' style={{ color: 暴怒值颜色 }}>
            {暴怒值标识}
          </div>
        </div>
      )
    }
    // 怒气与暴怒值都变化：怒气 暴怒值 并排留间距
    return (
      <div className='cycle-item-bottom-wrap'>
        <div className='cycle-item-bottom-text'>
          <span style={{ color: 怒气颜色 }}>{怒气标识}</span>
          <span style={{ color: 暴怒值颜色, marginLeft: 6 }}>{暴怒值标识}</span>
        </div>
      </div>
    )
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
            原始Buff数据={根据奇穴秘籍修改buff数据(奇穴信息, 秘籍信息)}
            配置区={
              <心法特殊配置
                // 显示破绽层数={显示破绽层数}
                // 更新显示破绽层数={更新显示破绽层数}
                // 显示绝刀怒气={显示绝刀怒气}
                // 更新显示绝刀怒气={更新显示绝刀怒气}
                显示怒气={显示怒气}
                设置显示怒气={设置显示怒气}
                // 苍生铸世技改：援戈已移除，注释保留
                // 显示释放时援戈层数={显示释放时援戈层数}
                // 更新释放时援戈层数={更新显示释放时援戈层数}
                起手怒气={起手怒气}
                设置起手怒气={设置起手怒气}
                起手暴怒值={起手暴怒值}
                设置起手暴怒值={设置起手暴怒值}
                暴怒值上限={暴怒值上限}
                显示暴怒值={奇穴信息?.includes('阵云结晦')}
                忽略延迟技能={忽略延迟技能}
                更新忽略延迟技能={更新忽略延迟技能}
                周期性忽略延迟={周期性忽略延迟}
                更新周期性忽略延迟={更新周期性忽略延迟}
                盾压重置方式={盾压重置方式}
                更新盾压重置方式={设置盾压重置方式}
                体态不符自动切换={体态不符自动切换}
                设置体态不符自动切换={设置体态不符自动切换}
                显示释放时暴怒值={显示释放时暴怒值}
                设置显示释放时暴怒值={设置显示释放时暴怒值}
                显示绝刀怒气等级={显示绝刀怒气等级}
                设置显示绝刀怒气等级={设置显示绝刀怒气等级}
                显示盾猛威压层数={显示盾猛威压层数}
                设置显示盾猛威压层数={设置显示盾猛威压层数}
                显示血怒覆盖={显示血怒覆盖}
                设置显示血怒覆盖={设置显示血怒覆盖}
                // 起手体态={起手体态}
                // 设置起手体态={设置起手体态}
              />
            }
          />
          {/* 角色状态栏 */}
          <StatusBar
            模拟信息={模拟信息}
            暴怒值上限={暴怒值上限}
            显示暴怒值={奇穴信息?.includes('阵云结晦')}
            完整循环={处理循环结果对象?.完整循环 as any}
            日志信息={日志信息}
            模拟DPS结果={模拟DPS结果}
            模拟函数={simulator}
            战斗曲线面板展示={战斗曲线.战斗曲线面板展示}
            切换战斗曲线面板={战斗曲线.切换战斗曲线面板}
          />
          {/* // 循环展示模块 */}
          <循环技能容器组件
            处理循环结果对象={处理循环结果对象}
            模拟信息={模拟信息}
            cycle={cycle}
            setCycle={更新循环数据}
            原始Buff数据={原始Buff数据}
            点击下拉菜单={点击下拉菜单}
            允许操作列表={['插入技能', '删除后续', '设置延迟']}
            底部标识={底部标识函数}
            背景容器={背景容器函数}
            压缩高度={战斗曲线.战斗曲线面板展示 ? 战斗曲线.压缩高度 : 0}
          />
        </div>
        {/* 添加循环按钮组 */}
        <宏入口
          心法='分山劲'
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
            起手怒气,
            起手暴怒值,
            忽略延迟技能,
            周期性忽略延迟,
            盾压重置方式,
          }}
          技能数据={循环模拟技能基础数据}
          当前循环={cycle}
          更新循环={setCycle}
        >
          <AddCycleSkillBtns
            新增循环技能={新增循环技能}
            批量新增循环={批量新增循环}
            处理循环结果对象={处理循环结果对象}
            模拟信息={模拟信息}
            奇穴信息={奇穴信息}
            大橙武模拟={大橙武模拟}
            盾压重置方式={盾压重置方式}
            体态不符自动切换={体态不符自动切换}
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
          盾压重置方式={盾压重置方式}
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
