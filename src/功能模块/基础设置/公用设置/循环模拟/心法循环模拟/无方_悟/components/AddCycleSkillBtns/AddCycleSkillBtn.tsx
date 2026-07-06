import React, { useMemo, useState } from 'react'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 循环基础技能数据类型, 技能GCD组, 模拟信息类型 } from '../../simulator/type'
import classNames from 'classnames'
import { Badge, Modal, Space, Button, Tooltip } from 'antd'
import { ERROR_ACTION } from '../../simulator/utils'

interface AddCycleSkillBtnProps {
  技能: 循环基础技能数据类型
  完整循环: 循环基础技能数据类型[]
  onClick?: any
  className?: string
  模拟信息: 模拟信息类型
  style?: any
  插入技能?: boolean
  新增循环技能?: (item: 循环基础技能数据类型) => void
}

interface 异常信息数据 {
  是否禁用?: boolean
  角标数字?: number
  异常描述?: string
}

// 添加循环技能按钮组件
const AddCycleSkillBtn: React.FC<AddCycleSkillBtnProps> = (props) => {
  const { 技能, 模拟信息, onClick, className, 插入技能, 新增循环技能, ...rest } = props

  const 释放等待CD = 计算可以释放时技能CD(模拟信息, 技能)
  const 技能当前层数 = 计算技能当前层数(模拟信息, 技能)

  const 异常信息: 异常信息数据 = useMemo(() => {
    let 禁用信息 = {}
    if (!插入技能) {
      if (
        技能?.技能名称 === '钩吻断肠·悟·追加' &&
        !模拟信息?.当前自身buff列表?.['钩吻追加']?.当前层数
      ) {
        禁用信息 = {
          是否禁用: true,
          异常描述: '需要先施展钩吻断肠·悟·普通',
        }
      } else if (
        技能?.技能名称 === '钩吻断肠·悟·普通' &&
        模拟信息?.当前自身buff列表?.['钩吻追加']?.当前层数
      ) {
        禁用信息 = {
          是否禁用: true,
          异常描述: '请先施展钩吻断肠·悟·追加',
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

  const [断川乌弹窗, 设置断川乌弹窗] = useState(false)

  // 点击前判断是否可以释放
  const beforeOnClick = () => {
    if (异常信息?.是否禁用) {
      return
    }
    // 川乌射罔·悟：弹窗选择跳数
    if (技能?.技能名称 === '川乌射罔·悟') {
      设置断川乌弹窗(true)
      return
    }
    onClick()
  }

  const 选择川乌跳数 = (跳数: number) => {
    设置断川乌弹窗(false)
    if (跳数 === 4) {
      新增循环技能?.(技能)
    } else {
      新增循环技能?.({
        ...技能,
        技能名称: '川乌射罔·悟',
        额外信息: { 作用次数: 跳数 },
      })
    }
  }

  const cls = classNames(className, 异常信息?.是否禁用 ? 'cycle-simulator-setting-btn-error' : '')

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
              <span className={'cycle-add-btn-count'}>{技能当前层数}</span>
            ) : null}
          </Badge>
        </Tooltip>
        <p className={'cycle-add-btn-text'}>
          {技能显示信息?.技能原始名称 || 技能显示信息?.技能名称}
        </p>
      </div>
      <Modal
        title='选择川乌射罔·悟跳数'
        open={断川乌弹窗}
        onCancel={() => 设置断川乌弹窗(false)}
        footer={null}
        width={280}
        centered
      >
        <Space size={8} style={{ justifyContent: 'center', width: '100%' }}>
          {[1, 2, 3, 4].map((跳数) => (
            <Button
              key={跳数}
              type={跳数 === 4 ? 'primary' : 'default'}
              onClick={() => 选择川乌跳数(跳数)}
            >
              {跳数}跳
            </Button>
          ))}
        </Space>
      </Modal>
    </>
  )
}

export default AddCycleSkillBtn

const 计算可以释放时技能CD = (模拟信息: 模拟信息类型, 技能: 循环基础技能数据类型) => {
  let 技能名称 = 技能?.技能名称
  if (技能名称 === '不打苍沾') {
    技能名称 = '沾衣未妨'
  }
  const 技能运行状态 = 模拟信息?.当前各技能运行状态?.[技能名称]
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
  let 技能名称 = 技能?.技能名称
  if (技能名称 === '不打苍沾') {
    技能名称 = '沾衣未妨'
  }
  const 技能运行状态 = 模拟信息?.当前各技能运行状态?.[技能名称]
  return (技能?.最大充能层数 || 1) - (技能运行状态?.待充能时间点?.length || 0)
}

const 检查GCD = (技能: 循环基础技能数据类型, GCD组: 技能GCD组) => {
  let 技能名称 = 技能?.技能名称
  if (技能名称 === '不打苍沾') {
    技能名称 = '沾衣未妨'
  }
  let 校验GCD组: string = 技能.技能GCD组 as string
  if (技能.技能GCD组 === '自身') {
    校验GCD组 = 技能名称
  }
  if (校验GCD组) {
    // 大部分技能只检查自己的GCD
    const GCD = GCD组[校验GCD组]
    return GCD
  } else {
    return 0
  }
}
