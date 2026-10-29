import React, { useMemo, useState } from 'react'
import { Form, Modal, Select } from 'antd'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 循环基础技能数据类型, 技能GCD组, 模拟信息类型 } from '../../simulator/type'
import { ERROR_ACTION } from '../../simulator/utils'
import CommonAddCycleSkillBtn from '../../../通用/通用组件/循环技能添加按钮'
import { 切换武器选项 } from '../../武器切换'

interface AddCycleSkillBtnProps {
  技能: 循环基础技能数据类型
  完整循环: 循环基础技能数据类型[]
  onClick?: any
  className?: string
  模拟信息: 模拟信息类型
  style?: any
  插入技能?: boolean // 插入技能时不禁用技能
  武器切换可用?: boolean
}

interface 异常信息数据 {
  是否禁用?: boolean
  角标数字?: number
  异常描述?: string
}

// 添加循环技能按钮组件
const AddCycleSkillBtn: React.FC<AddCycleSkillBtnProps> = (props) => {
  const { 技能, 模拟信息, 完整循环, onClick: propsClick, 插入技能, 武器切换可用, ...rest } = props
  const [武器弹窗显示, 设置武器弹窗显示] = useState(false)
  const [目标武器ID, 设置目标武器ID] = useState(46733)

  const 释放等待CD = 计算可以释放时技能CD(模拟信息, 技能)
  const 技能当前层数 = 计算技能当前层数(模拟信息, 技能)

  const 异常信息: 异常信息数据 = useMemo(() => {
    let 禁用信息 = {}
    const 起符召唤物 = 技能.额外信息?.召唤物 ?? '麒麟'
    const 起符召唤物已施符 =
      起符召唤物 === '麒麟' ? 模拟信息.角色状态信息.麒麟已施符 : 模拟信息.角色状态信息.凤凰已施符
    if (技能.技能名称 === '切换武器' && !武器切换可用) {
      return { 是否禁用: true, 异常描述: '当前无法添加切换武器，请检查开关和配装' }
    }
    if (!插入技能) {
      if (技能?.技能名称 === '点掉橙武' && !模拟信息?.当前自身buff列表?.['橙武']?.当前层数) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.BUFF错误?.信息,
        }
      } else if (技能?.技能名称 === '御前星' && (模拟信息?.角色状态信息?.星运 || 0) < 10) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.星运不足?.信息,
        }
      } else if (
        技能?.技能名称 === '起符' &&
        (!模拟信息?.当前自身buff列表?.[起符召唤物]?.当前层数 || 起符召唤物已施符)
      ) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.BUFF错误?.信息,
        }
      } else if (
        技能?.技能名称 === '化卦坠符' &&
        (!模拟信息?.当前自身buff列表?.['起符']?.当前层数 ||
          !模拟信息?.当前自身buff列表?.['麒麟']?.当前层数 ||
          模拟信息?.角色状态信息?.麒麟已施符 ||
          模拟信息?.当前自身buff列表?.['应卦震符']?.当前层数 ||
          模拟信息?.当前自身buff列表?.['化卦坠符']?.当前层数)
      ) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.BUFF错误?.信息,
        }
      } else if (
        技能?.技能名称 === '应卦震符' &&
        (!模拟信息?.当前自身buff列表?.['起符']?.当前层数 ||
          !模拟信息?.当前自身buff列表?.['麒麟']?.当前层数 ||
          模拟信息?.角色状态信息?.麒麟已施符 ||
          模拟信息?.当前自身buff列表?.['化卦坠符']?.当前层数 ||
          模拟信息?.当前自身buff列表?.['应卦震符']?.当前层数)
      ) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.BUFF错误?.信息,
        }
      } else if (
        技能?.技能名称 === '附灵·煌符' &&
        (!模拟信息?.当前自身buff列表?.['凤凰起符']?.当前层数 ||
          !模拟信息?.当前自身buff列表?.['凤凰']?.当前层数 ||
          模拟信息?.角色状态信息?.凤凰已施符 ||
          模拟信息?.当前自身buff列表?.['附灵·煌符']?.当前层数)
      ) {
        禁用信息 = {
          是否禁用: true,
          异常描述: ERROR_ACTION?.BUFF错误?.信息,
        }
      } else if (
        ['变卦', '变水卦', '变山卦', '变火卦'].includes(技能?.技能名称) &&
        !(模拟信息?.角色状态信息?.鬼遁免费变卦次数 || 0) &&
        (模拟信息?.角色状态信息?.星运 || 0) < (技能?.技能名称 === '变卦' ? 50 : 40)
      ) {
        const 所需星运 = 技能?.技能名称 === '变卦' ? 50 : 40
        禁用信息 = {
          是否禁用: true,
          异常描述: `${ERROR_ACTION?.星运不足?.信息}（需要${50}点）`,
        }
        // } else if (技能?.技能名称 === '镇星二段' && !模拟信息?.当前自身buff列表?.['入舆']?.当前层数) {
        // 禁用信息 = {
        // 是否禁用: true,
        // 异常描述: ERROR_ACTION?.BUFF错误?.信息,
        // }
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
  }, [释放等待CD, 技能, 模拟信息, 插入技能, 完整循环, 武器切换可用])

  const onClick = (额外信息) => {
    if (技能.技能名称 === '切换武器') {
      if (!武器切换可用) return
      设置目标武器ID(切换武器选项.find((项) => 插入技能 || 项.value !== 模拟信息.当前武器ID)!.value)
      设置武器弹窗显示(true)
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

  return (
    <>
      <CommonAddCycleSkillBtn
        {...rest}
        模拟信息={模拟信息 as any}
        技能={技能}
        技能当前层数={技能当前层数}
        onClick={onClick}
        异常信息={异常信息}
        完整循环={完整循环}
      />
      {技能.技能名称 === '切换武器' ? (
        <Modal
          open={武器弹窗显示}
          title='选择切换武器'
          onCancel={() => 设置武器弹窗显示(false)}
          okButtonProps={{
            disabled: !武器切换可用 || (!插入技能 && 目标武器ID === 模拟信息.当前武器ID),
          }}
          onOk={() => {
            if (!武器切换可用 || (!插入技能 && 目标武器ID === 模拟信息.当前武器ID)) return
            propsClick?.({ ...技能, 额外信息: { ...技能.额外信息, 目标武器ID } })
            设置武器弹窗显示(false)
          }}
        >
          <Form style={{ paddingTop: 24 }}>
            <Form.Item label='目标武器' required>
              <Select
                aria-label='添加切换目标武器'
                value={目标武器ID}
                onChange={设置目标武器ID}
                options={切换武器选项.map((项) => ({
                  ...项,
                  disabled: !插入技能 && 项.value === 模拟信息.当前武器ID,
                }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}
    </>
  )
}

export default AddCycleSkillBtn

const 计算可以释放时技能CD = (模拟信息: 模拟信息类型, 技能: 循环基础技能数据类型) => {
  let 技能名称 = 技能?.技能名称
  if (['起火卦', '起水卦', '起山卦']?.includes(技能名称)) {
    技能名称 = '起卦'
  }
  if (['变火卦', '变水卦', '变山卦']?.includes(技能名称)) {
    技能名称 = '变卦'
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
  if (['起火卦', '起水卦', '起山卦']?.includes(技能名称)) {
    技能名称 = '起卦'
  }
  if (['变火卦', '变水卦', '变山卦']?.includes(技能名称)) {
    技能名称 = '变卦'
  }
  const 技能运行状态 = 模拟信息?.当前各技能运行状态?.[技能名称]
  return (技能?.最大充能层数 || 1) - (技能运行状态?.待充能时间点?.length || 0)
}

const 检查GCD = (技能: 循环基础技能数据类型, GCD组: 技能GCD组) => {
  let 技能名称 = 技能?.技能名称
  if (['起火卦', '起水卦', '起山卦']?.includes(技能名称)) {
    技能名称 = '起卦'
  }
  if (['变火卦', '变水卦', '变山卦']?.includes(技能名称)) {
    技能名称 = '变卦'
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
