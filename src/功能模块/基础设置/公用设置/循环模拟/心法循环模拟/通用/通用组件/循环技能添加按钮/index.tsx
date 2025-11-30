import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import { Badge, Tooltip } from 'antd'
import { 循环基础技能数据类型 } from '../../通用框架/类型定义/技能'
import { 模拟信息类型 } from '../../通用框架/类型定义/模拟'
import 多段倒读条作用次数弹窗 from '../../通用组件/多段倒读条作用次数弹窗'
import './index.css'
interface AddCycleSkillBtnProps {
  技能: 循环基础技能数据类型
  完整循环: 循环基础技能数据类型[]
  onClick?: any
  className?: string
  模拟信息: 模拟信息类型
  style?: any
  插入技能?: boolean // 插入技能时不禁用技能
  异常信息?: any
  技能当前层数?: number
}

// 添加循环技能按钮组件
const CommonAddCycleSkillBtn: React.FC<AddCycleSkillBtnProps> = (props) => {
  const { 技能, 模拟信息, onClick, className, 异常信息, 技能当前层数, ...rest } = props

  const 当前层数 = 技能当前层数 ?? 计算技能当前层数(模拟信息, 技能) ?? 1

  const [多段作用次数弹窗, 修改多段作用次数弹窗] = useState(false)

  // 点击前判断是否可以释放
  const beforeOnClick = () => {
    if (异常信息?.是否禁用) {
      return
    }
    if (技能?.可中断倒读条最大跳数) {
      // 打开选择跳数弹窗
      修改多段作用次数弹窗(true)
      return
    }
    onClick()
  }

  const submitHitCount = (countHit: number) => {
    onClick({
      作用次数: countHit || 1,
    })
  }

  const cls = classNames(
    className,
    'cycle-simulator-add-btn',
    异常信息?.是否禁用 ? 'cycle-simulator-setting-btn-error' : '',
  )

  const 技能显示信息 = useMemo(() => {
    return 技能
  }, [技能, 模拟信息])

  return (
    <>
      <div onClick={beforeOnClick} className={cls} {...rest}>
        <Tooltip title={异常信息?.异常描述 || 技能?.说明 || ''}>
          <Badge count={异常信息?.角标数字} className={'cycle-add-btn-wrap'} offset={[0, 0]}>
            <img className={`cycle-add-btn`} src={技能显示信息?.图标} />
            {技能?.最大充能层数 && 技能?.最大充能层数 !== 1 ? (
              <span className={'cycle-add-btn-count'}>{当前层数}</span>
            ) : null}
          </Badge>
        </Tooltip>
        <p className={'cycle-add-btn-text'}>
          {技能显示信息?.技能原始名称 || 技能显示信息?.技能名称}
        </p>
      </div>
      <多段倒读条作用次数弹窗
        key='in-add-cycle-modal'
        open={多段作用次数弹窗}
        onCancel={() => {
          修改多段作用次数弹窗(false)
        }}
        onSubmit={submitHitCount}
        maxHit={技能?.可中断倒读条最大跳数 || 1}
      />
    </>
  )
}

export default CommonAddCycleSkillBtn

const 计算技能当前层数 = (模拟信息: 模拟信息类型, 技能: 循环基础技能数据类型) => {
  const 技能名称 = 技能?.技能名称
  const 技能运行状态 = 模拟信息?.当前各技能运行状态?.[技能名称]
  return (技能?.最大充能层数 || 1) - (技能运行状态?.待充能时间点?.length || 0)
}
