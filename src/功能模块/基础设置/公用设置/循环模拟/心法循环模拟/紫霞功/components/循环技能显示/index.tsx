import React, { createContext, useContext } from 'react'
import 循环技能显示组件 from '../../../通用/通用组件/循环技能显示组件'
import styles from './index.module.less'

export const 循环技能显示上下文 = createContext({ 会心回豆: false, 隐藏角标: false })

type 紫霞技能显示入参 = React.ComponentProps<typeof 循环技能显示组件> & {
  技能: { 紫气覆盖跳数?: number; 技能释放记录结果?: { 卸除飞剑序号?: number } }
}

const 紫霞技能显示 = (props: 紫霞技能显示入参) => {
  const { 隐藏角标, 会心回豆 } = useContext(循环技能显示上下文)
  const { 技能 } = props
  if (技能.技能名称 === '回豆' && 会心回豆) {
    const 展示技能 = {
      ...技能,
      额外信息: {
        ...技能.额外信息,
        会心回豆: '已开启自动回豆，此手动动作不额外回豆',
      },
    }
    return <循环技能显示组件 {...props} 技能={展示技能} />
  }
  const 卸除飞剑序号 = 技能.技能释放记录结果?.卸除飞剑序号
  const 角标数字 =
    卸除飞剑序号 ?? (技能.技能名称 === '六合独尊' ? 技能.紫气覆盖跳数 || undefined : undefined)
  if (角标数字 === undefined) {
    return <循环技能显示组件 {...props} />
  }
  const 角标说明 =
    卸除飞剑序号 !== undefined
      ? 卸除飞剑序号 === 0
        ? '卸除前尚未出剑'
        : `卸除前已出至第${卸除飞剑序号}剑`
      : `紫气覆盖${角标数字}跳`
  const 展示技能 = {
    ...技能,
    额外信息: {
      ...技能.额外信息,
      ...(卸除飞剑序号 !== undefined ? { 卸除飞剑: 角标说明 } : { 紫气覆盖: `${角标数字}/5 跳` }),
    },
  }
  return (
    <循环技能显示组件
      {...props}
      技能={展示技能}
      底部标识={() =>
        隐藏角标 ? null : (
          <span className={styles.紫气覆盖角标} aria-label={角标说明}>
            {角标数字}
          </span>
        )
      }
    />
  )
}

export default 紫霞技能显示
