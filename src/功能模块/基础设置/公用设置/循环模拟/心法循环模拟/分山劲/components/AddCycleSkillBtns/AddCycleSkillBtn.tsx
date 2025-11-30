import React, { useMemo } from 'react'
import { 循环基础技能数据类型, 技能GCD组, 模拟信息类型 } from '../../simulator/type'
import { 每秒郭氏帧 } from '@/数据/常量'
import { ERROR_ACTION } from '../../simulator/utils'
import CommonAddCycleSkillBtn from '../../../通用/通用组件/循环技能添加按钮'

interface AddCycleSkillBtnProps {
  技能: 循环基础技能数据类型
  完整循环: 循环基础技能数据类型[]
  onClick?: any
  className?: string
  模拟信息: 模拟信息类型
  style?: any
  插入技能?: boolean // 插入技能时不禁用技能
}

interface 异常信息数据 {
  是否禁用?: boolean
  角标数字?: number
  异常描述?: string
}

// 添加循环技能按钮组件
const AddCycleSkillBtn: React.FC<AddCycleSkillBtnProps> = (props) => {
  const { 技能, 模拟信息, onClick: propsClick, className, 插入技能, ...rest } = props

  const 释放等待CD = 计算可以释放时技能CD(模拟信息, 技能)
  const 技能当前层数 = 计算技能当前层数(模拟信息, 技能)

  // 在盾飞Buff未出现前且体态已经切换为擎刀时，依然可以释放盾击、盾压、盾刀
  // 偃守孤旌直接切换至擎刀
  const 飞击校验 = () => {
    if (
      ['盾击', '盾压', '盾刀']?.includes(技能?.技能名称) &&
      !模拟信息?.当前自身buff列表?.['盾飞']?.当前层数 &&
      !模拟信息?.当前自身buff列表?.['战绝']?.当前层数
    ) {
      return { 可以释放: true }
    }
  }
  // 偃守孤旌期间无法使用非苍雪刀套路招式（可以使用轻功）
  const 偃守孤旌禁用非苍雪刀技能 = () => {
    if (
      ['盾回', '血怒']?.includes(技能?.技能名称) &&
      模拟信息?.当前自身buff列表?.['战绝']?.当前层数
    ) {
      return { 可以释放: false }
    }
  }
  const 异常信息: 异常信息数据 = useMemo(() => {
    let 禁用信息 = {}
    if (!插入技能) {
      // if (技能?.技能类型 !== '其他' && 模拟信息?.角色状态信息?.体态 !== 技能?.体态 && !飞击校验()) {
      // 把血怒、阵云、业火归类为另一类，并且在擎刀、擎盾体态都能释放
      // 偃守孤旌期间无法使用非苍雪刀套路招式（可以使用轻功）
      if (
        (技能?.技能类型 !== '其他' &&
          技能?.体态 &&
          模拟信息?.角色状态信息?.体态 !== 技能?.体态 &&
          !飞击校验()) ||
        偃守孤旌禁用非苍雪刀技能()
      ) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.体态错误?.信息,
        }
      } else if (技能?.消耗怒气 && (模拟信息?.角色状态信息?.怒气 || 0) < 技能?.消耗怒气) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.怒气不足?.信息,
        }
      } else if (技能?.技能名称 === '点掉橙武' && !模拟信息?.当前自身buff列表?.['橙武']?.当前层数) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.BUFF错误?.信息,
        }
      }
    }
    if (释放等待CD > 0 && 技能?.最大充能层数 && 技能?.最大充能层数 > 1) {
      return {
        ...禁用信息,
        角标数字: 释放等待CD,
        异常描述: `当前技能处于充能中，剩余${释放等待CD}秒`,
      }
    } else if (释放等待CD > 0) {
      return {
        ...禁用信息,
        角标数字: 释放等待CD,
        异常描述: `当前技能处于冷却中，剩余${释放等待CD}秒`,
      }
    } else {
      return { ...禁用信息 }
    }
  }, [释放等待CD, 技能, 模拟信息, 插入技能])

  const onClick = (额外信息) => {
    if (异常信息?.是否禁用) {
      return
    }
    propsClick?.({
      ...技能,
      额外信息: {
        ...技能.额外信息,
        ...额外信息,
      },
    })
  }

  const 技能图标 = useMemo(() => {
    if (技能?.技能名称 === '盾飞') {
      return 'https://icon.jx3box.com/icon/6344.png'
    }
    if (技能?.技能名称 === '盾回') {
      return 'https://icon.jx3box.com/icon/6699.png'
    }
    if (技能?.技能名称 === '盾刀') {
      if (模拟信息?.当前自身buff列表?.['盾刀标记']?.当前层数 === 1) {
        return 'https://icon.jx3box.com/icon/6328.png'
      } else if (模拟信息?.当前自身buff列表?.['盾刀标记']?.当前层数 === 2) {
        return 'https://icon.jx3box.com/icon/6329.png'
      } else {
        return 'https://icon.jx3box.com/icon/6327.png'
      }
    } else {
      return 技能?.图标
    }
  }, [技能, 模拟信息])

  return (
    <CommonAddCycleSkillBtn
      {...rest}
      模拟信息={模拟信息 as any}
      技能={{ ...技能, 图标: 技能图标 }}
      技能当前层数={技能当前层数}
      onClick={onClick}
      异常信息={异常信息}
    />
  )
}

export default AddCycleSkillBtn

const 计算可以释放时技能CD = (模拟信息: 模拟信息类型, 技能: 循环基础技能数据类型) => {
  const 技能运行状态 = 模拟信息?.当前各技能运行状态?.[技能?.技能名称]
  const 待充能时间点 = 技能运行状态?.待充能时间点

  if (待充能时间点?.length) {
    const GCD = 检查GCD(技能, 模拟信息.当前GCD组)
    // 当前技能可以释放时间当前时间（为上一个技能释放结束时间）加上本技能释放前结算GCD
    const 可以释放时间 = (模拟信息?.当前时间 || 0) + (GCD || 0)
    const 下次预估释放时间 = 待充能时间点?.[0]
    if (下次预估释放时间 > 可以释放时间) {
      const 技能CD = 下次预估释放时间 - 可以释放时间
      // 把帧转成秒，保留两位小数
      const 剩余秒 = Math.round((技能CD / 每秒郭氏帧) * 100) / 100
      return 剩余秒
    } else {
      return 0
    }
  } else {
    return 0
  }
}

const 计算技能当前层数 = (模拟信息: 模拟信息类型, 技能: 循环基础技能数据类型) => {
  const 技能运行状态 = 模拟信息?.当前各技能运行状态?.[技能?.技能名称]
  return (技能?.最大充能层数 || 1) - (技能运行状态?.待充能时间点?.length || 0)
}

const 检查GCD = (技能: 循环基础技能数据类型, GCD组: 技能GCD组) => {
  let 校验GCD组: string = 技能.技能GCD组 as string
  if (技能.技能GCD组 === '自身') {
    校验GCD组 = 技能?.技能名称
  }
  if (校验GCD组) {
    // 大部分技能只检查自己的GCD
    const GCD = GCD组[校验GCD组]
    return GCD
  } else {
    return 0
  }
}
