import React from 'react'
import { Checkbox, InputNumber, Tooltip } from 'antd'
import styles from './index.module.less'
interface 心法特殊配置类型 {
  显示简易能量条: boolean
  起手日灵: number
  起手月魂: number
  背后攻击: boolean
  显示灵力: boolean
  显示光明相覆盖: boolean
  更新配置: (键: string, 值: number | boolean) => void
}
function 心法特殊配置({
  显示简易能量条,
  起手日灵,
  起手月魂,
  背后攻击,
  显示灵力,
  显示光明相覆盖,
  更新配置,
}: 心法特殊配置类型) {
  return (
    <>
      <Tooltip title='勾选后使用原简易进度条；取消勾选后显示日灵、月魂的图形能量条和满值图形。底图加载中或加载失败时，临时使用简易进度条。切换不改变能量和模拟结果。'>
        <Checkbox
          checked={显示简易能量条}
          onChange={(e) => 更新配置('显示简易能量条', e.target.checked)}
        >
          显示简易能量条
        </Checkbox>
      </Tooltip>
      <span className={styles.label}>起手日灵</span>
      <InputNumber
        size='small'
        min={0}
        max={100}
        precision={0}
        value={起手日灵}
        onChange={(值) => 更新配置('起手日灵', 值 ?? 0)}
      />
      <span className={styles.label}>起手月魂</span>
      <InputNumber
        size='small'
        min={0}
        max={100}
        precision={0}
        value={起手月魂}
        onChange={(值) => 更新配置('起手月魂', 值 ?? 0)}
      />
      <Checkbox checked={背后攻击} onChange={(e) => 更新配置('背后攻击', e.target.checked)}>
        背后攻击
      </Checkbox>
      <Checkbox checked={显示灵力} onChange={(e) => 更新配置('显示灵力', e.target.checked)}>
        显示灵力
      </Checkbox>
      <Checkbox
        checked={显示光明相覆盖}
        onChange={(e) => 更新配置('显示光明相覆盖', e.target.checked)}
      >
        显示光明相覆盖
      </Checkbox>
    </>
  )
}
export default 心法特殊配置
