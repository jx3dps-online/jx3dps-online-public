import React from 'react'
import { Select, Switch } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新网页设置 } from '@/store/system'
import 设置项 from '../设置项'

function 行为偏好() {
  const dispatch = useAppDispatch()
  const 网页设置 = useAppSelector((state) => state?.system?.网页设置)
  const 行为偏好 = 网页设置?.行为偏好

  const 更新行为偏好 = (值) => dispatch(更新网页设置({ 行为偏好: 值 }))

  return (
    <>
      <设置项 标题='智能对比默认开启' 说明='配装器与增益面板「对比」开关的默认状态。'>
        <Switch
          checked={行为偏好?.智能对比默认开启}
          onChange={(checked) => 更新行为偏好({ 智能对比默认开启: checked })}
        />
      </设置项>
      <设置项 标题='对比默认显示百分比' 说明='配装器内智能对比收益默认展示为百分比。'>
        <Switch
          checked={行为偏好?.对比默认显示百分比}
          onChange={(checked) => 更新行为偏好({ 对比默认显示百分比: checked })}
        />
      </设置项>
      <设置项
        标题='智能对比跨加速对比默认'
        说明='关闭后，若该部位为加速装备，则非加速装备不会参与智能对比。'
      >
        <Switch
          checked={行为偏好?.跨加速对比默认}
          onChange={(checked) => 更新行为偏好({ 跨加速对比默认: checked })}
        />
      </设置项>
      <设置项
        标题='配装器高亮属性'
        说明='在配装器的装备候选列表中，用颜色高亮会心、会效、破防、加速四种词条。'
      >
        <Switch
          checked={行为偏好?.配装器高亮属性}
          onChange={(checked) => 更新行为偏好({ 配装器高亮属性: checked })}
        />
      </设置项>
      <设置项
        标题='点击心法图标行为'
        说明='决定点击左上角心法图标时是回到首页，还是弹出心法快速切换弹窗。'
      >
        <Select
          style={{ width: 160 }}
          value={行为偏好?.点击心法图标行为}
          onChange={(v) => 更新行为偏好({ 点击心法图标行为: v })}
        >
          <Select.Option value='回到首页'>回到首页</Select.Option>
          <Select.Option value='快速切换'>快速切换</Select.Option>
        </Select>
      </设置项>
    </>
  )
}

export default 行为偏好
