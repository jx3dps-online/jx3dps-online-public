import React from 'react'
import { 技能释放记录结果 } from '../../simulator/type'
import 通用循环技能显示 from '../../../通用/通用组件/循环技能显示组件'
import 技能显示样式 from '../../../通用/通用组件/循环技能显示组件/index.module.less'

const 循环技能显示: React.FC<React.ComponentProps<typeof 通用循环技能显示>> = (props) => {
  const 释放记录 = props.技能.技能释放记录结果 as 技能释放记录结果
  const 标记 = 释放记录?.特殊标记
  const 日月标记 = 标记 === '日' || 标记 === '月'
  return (
    <通用循环技能显示
      {...props}
      技能={{
        ...props.技能,
        技能释放记录结果: {
          ...释放记录,
          伤害段数: undefined,
          特殊标记: typeof 标记 === 'number' ? 标记 : undefined,
          重要buff列表: 释放记录?.重要buff列表?.filter((名称) => props.原始Buff数据[名称]?.图标),
        },
      }}
      背景容器={
        日月标记
          ? (技能, index) => (
              <>
                {props.背景容器?.(技能, index)}
                <span
                  className={技能显示样式.countTip}
                  style={{ background: 标记 === '日' ? 'var(--ant-primary-color)' : '#1677ff' }}
                >
                  {标记}
                </span>
              </>
            )
          : props.背景容器
      }
    />
  )
}

export default 循环技能显示
