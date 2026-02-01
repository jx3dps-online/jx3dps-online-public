import React, { useMemo } from 'react'
import { 循环基础技能数据类型, 技能GCD组, 模拟信息类型 } from '../../simulator/type'
import { 每秒郭氏帧 } from '@/数据/常量'
import classNames from 'classnames'
import { Badge, Tooltip } from 'antd'
import { ERROR_ACTION } from '../../simulator/utils'

interface AddCycleSkillBtnProps {
  技能: 循环基础技能数据类型
  完整循环: 循环基础技能数据类型[]
  onClick?: any
  className?: string
  模拟信息: 模拟信息类型
  style?: any
}

interface 异常信息数据 {
  是否禁用?: boolean
  角标数字?: number
  异常描述?: string
}

// 添加循环技能按钮组件
const AddCycleSkillBtn: React.FC<AddCycleSkillBtnProps> = (props) => {
  const { 技能, 模拟信息, onClick, className, 完整循环, ...rest } = props

  const 释放等待CD = 计算可以释放时技能CD(模拟信息, 技能)
  const 技能当前层数 = 计算技能当前层数(模拟信息, 技能)

  const 异常信息: 异常信息数据 = useMemo(() => {
    let 禁用信息 = {}
    if (技能?.技能名称 === '行云势·一' && !!模拟信息?.当前自身buff列表?.['行链']?.当前层数) {
      禁用信息 = {
        是否禁用: true,
        异常描述: ERROR_ACTION?.BUFF错误?.信息,
      }
    } else if (
      技能?.技能名称 === '行云势·二' &&
      模拟信息?.当前自身buff列表?.['行链']?.当前层数 !== 1
    ) {
      禁用信息 = {
        是否禁用: true,
        异常描述: ERROR_ACTION?.BUFF错误?.信息,
      }
    } else if (
      技能?.技能名称 === '行云势·三' &&
      模拟信息?.当前自身buff列表?.['行链']?.当前层数 !== 2
    ) {
      禁用信息 = {
        是否禁用: true,
        异常描述: ERROR_ACTION?.BUFF错误?.信息,
      }
    } else if (技能?.技能名称 === '决云势·二' && !模拟信息?.当前自身buff列表?.['决链']?.当前层数) {
      禁用信息 = {
        是否禁用: true,
        异常描述: ERROR_ACTION?.BUFF错误?.信息,
      }
    } else if (技能?.技能名称 === '横云势·二' && !模拟信息?.当前自身buff列表?.['横链']?.当前层数) {
      禁用信息 = {
        是否禁用: true,
        异常描述: ERROR_ACTION?.BUFF错误?.信息,
      }
    } else if (技能?.技能名称 === '奇门飞宫·贰') {
      // 检查循环中是否包含奇门飞宫（一段）
      const 是否包含奇门飞宫 = 完整循环?.some((item) => item?.技能名称 === '奇门飞宫')
      if (!是否包含奇门飞宫) {
        禁用信息 = {
          是否禁用: true,
          异常描述: '未激活', // 固定显示"未激活"，不要自动改回去
        }
      } else {
        // 检查是否已经使用过奇门飞宫贰
        const 奇门飞宫贰使用位置 = 完整循环?.findLastIndex(
          (item) => item?.技能名称 === '奇门飞宫·贰',
        )
        if (奇门飞宫贰使用位置 !== -1) {
          // 找到最后一次使用奇门飞宫贰之后是否又释放了奇门飞宫
          const 之后是否释放奇门飞宫 = 完整循环
            ?.slice(奇门飞宫贰使用位置 + 1)
            ?.some((item) => item?.技能名称 === '奇门飞宫')

          // 如果使用过奇门飞宫贰，且之后没有释放奇门飞宫，或者还有CD，则禁用
          if (!之后是否释放奇门飞宫 || 释放等待CD > 0) {
            禁用信息 = {
              是否禁用: true,
              异常描述: 之后是否释放奇门飞宫
                ? `奇门飞宫·贰处于冷却中，剩余${释放等待CD}秒`
                : '未激活', // 固定显示"未激活"，不要自动改回去
            }
          }
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
  }, [释放等待CD, 技能, 模拟信息, 完整循环])

  // 点击前判断是否可以释放
  const beforeOnClick = () => {
    if (异常信息?.是否禁用) {
      return
    }
    onClick()
  }

  const cls = classNames(className, 异常信息?.是否禁用 ? 'cycle-simulator-setting-btn-error' : '')

  return (
    <div onClick={beforeOnClick} className={cls} {...rest}>
      <Tooltip title={异常信息?.异常描述 || 技能?.说明 || ''}>
        <Badge count={异常信息?.角标数字} className={'cycle-add-btn-wrap'} offset={[0, 0]}>
          <img className={`cycle-add-btn`} src={技能?.图标} />
          {技能?.最大充能层数 && 技能?.最大充能层数 !== 1 ? (
            <span className={'cycle-add-btn-count'}>{技能当前层数}</span>
          ) : null}
        </Badge>
      </Tooltip>
      <p className={'cycle-add-btn-text'}>{技能?.技能原始名称 || 技能?.技能名称}</p>
    </div>
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
