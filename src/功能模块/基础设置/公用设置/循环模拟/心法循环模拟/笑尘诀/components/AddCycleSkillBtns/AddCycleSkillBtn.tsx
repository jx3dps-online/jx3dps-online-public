import React, { useContext, useMemo } from 'react'
import { 每秒郭氏帧 } from '@/数据/常量'
import type { 循环基础技能数据类型, 模拟信息类型 } from '../../simulator/type'
import { 获取实际GCD, 获取内力消耗 } from '../../simulator/utils'
import CommonAddCycleSkillBtn from '../../../通用/通用组件/循环技能添加按钮'
import CycleSimulatorContext from '../../../../context'

interface AddCycleSkillBtnProps {
  技能: 循环基础技能数据类型
  完整循环: 循环基础技能数据类型[]
  onClick?: any
  className?: string
  模拟信息: 模拟信息类型
  style?: any
  插入技能?: boolean
  奇穴信息: string[]
}

interface 异常信息数据 {
  是否禁用?: boolean
  角标数字?: number
  异常描述?: string
}

const AddCycleSkillBtn: React.FC<AddCycleSkillBtnProps> = (props) => {
  const { 技能, 模拟信息, 插入技能, 奇穴信息, ...rest } = props
  const { 秘籍信息 } = useContext(CycleSimulatorContext)
  const 释放等待CD = 计算可以释放时技能CD(模拟信息, 技能)

  const 异常信息: 异常信息数据 = useMemo(() => {
    let 禁用信息: 异常信息数据 = {}
    const 内力消耗 = 获取内力消耗(技能, 模拟信息.当前自身buff列表, 秘籍信息)
    if (!插入技能) {
      if (技能.前置Buff && !模拟信息.当前自身buff列表[技能.前置Buff]) {
        const 前置技能 = {
          横打双獒: '拨狗朝天',
          犬牙交错: '恶狗拦路',
          狂龙乱舞: '时乘六龙',
          双龙取水: '蛟龙翻江',
          龙游天地: '双龙取水',
          龙腾五岳: '龙游天地',
        }[技能.前置Buff]
        禁用信息 = {
          是否禁用: true,
          异常描述: `${技能.技能名称}需要先施展${前置技能}，并在前置效果有效期间释放`,
        }
      } else if (模拟信息.角色状态信息.内力 < 内力消耗) {
        禁用信息 = { 是否禁用: true, 异常描述: `${技能.技能名称}内力不足` }
      } else if (技能.技能名称 === '拨狗朝天' && 模拟信息.当前自身buff列表.横打双獒) {
        禁用信息 = { 是否禁用: true, 异常描述: '请先施展横打双獒，或等待前置效果结束' }
      } else if (
        技能.技能名称 === '蛟龙翻江' &&
        ['双龙取水', '龙游天地', '龙腾五岳'].some((名称) => 模拟信息.当前自身buff列表[名称])
      ) {
        const 下一段 = ['双龙取水', '龙游天地', '龙腾五岳'].find(
          (名称) => 模拟信息.当前自身buff列表[名称],
        )
        禁用信息 = { 是否禁用: true, 异常描述: `请先施展${下一段}，或等待前置效果结束` }
      } else if (技能.技能名称 === '酒中仙' && 模拟信息.当前自身buff列表.逍遥) {
        禁用信息 = { 是否禁用: true, 异常描述: '逍遥期间不能施展酒中仙' }
      } else if (技能.技能名称 === '酒中仙' && 模拟信息.角色状态信息.醉意 >= 3) {
        禁用信息 = {
          是否禁用: true,
          异常描述: 奇穴信息.includes('祭湘君')
            ? '醉意已满，请先施展祭湘君消耗醉意'
            : '醉意已满，请施展醉逍遥',
        }
      } else if (
        技能.技能名称 === '醉逍遥' &&
        (模拟信息.当前自身buff列表.逍遥 || 模拟信息.角色状态信息.醉意 < 3)
      ) {
        禁用信息 = { 是否禁用: true, 异常描述: '醉逍遥需要三层醉意，且当前不处于逍遥' }
      } else if (技能.技能名称 === '祭湘君' && 模拟信息.角色状态信息.醉意 < 1) {
        禁用信息 = { 是否禁用: true, 异常描述: '祭湘君需要至少一层醉意' }
      } else if (技能.技能名称 === '自酌阑' && !模拟信息.当前自身buff列表.逍遥) {
        禁用信息 = { 是否禁用: true, 异常描述: '自酌阑只能在逍遥期间施展' }
      }
    }
    if (释放等待CD > 0) {
      return {
        ...禁用信息,
        角标数字: 释放等待CD,
        异常描述:
          禁用信息.异常描述 ||
          `当前技能处于${(技能.最大充能层数 || 1) > 1 ? '充能' : '冷却'}中，剩余${释放等待CD}秒，加入循环后自动等待`,
      }
    } else {
      return { ...禁用信息 }
    }
  }, [释放等待CD, 技能, 模拟信息, 插入技能, 奇穴信息, 秘籍信息])

  return <CommonAddCycleSkillBtn {...rest} 技能={技能} 模拟信息={模拟信息} 异常信息={异常信息} />
}

export default AddCycleSkillBtn

const 计算可以释放时技能CD = (模拟信息: 模拟信息类型, 技能: 循环基础技能数据类型) => {
  const 技能运行状态 = 模拟信息.当前各技能运行状态[技能.技能名称]
  const 待充能时间点 = 技能运行状态?.待充能时间点
  if (待充能时间点?.length && 待充能时间点.length >= (技能.最大充能层数 || 1)) {
    const GCD = 获取实际GCD(
      技能,
      模拟信息.当前GCD组,
      模拟信息.当前自身buff列表.逍遥,
      模拟信息.当前时间,
    )
    const 可以释放时间 = 模拟信息.当前时间 + GCD
    const 下次预估释放时间 = 待充能时间点[0]
    if (下次预估释放时间 > 可以释放时间) {
      const 技能CD = 下次预估释放时间 - 可以释放时间
      return Math.round((技能CD / 每秒郭氏帧) * 100) / 100
    } else {
      return 0
    }
  } else {
    return 0
  }
}
