import React from 'react'
import { Checkbox, InputNumber, Select, Typography } from 'antd'
import type { 对比列, 对比筛选 } from './类型'
import 样式 from './index.module.less'

const 转数字 = (值: number | null) => (值 === null ? null : Number(值))

export default function 筛选设置({
  筛选,
  设置筛选,
  列,
  隐藏列,
  设置隐藏列,
}: {
  筛选: 对比筛选
  设置筛选: (值: 对比筛选) => void
  列: 对比列[]
  隐藏列: string[]
  设置隐藏列: (值: string[]) => void
}) {
  const 范围错误 =
    (筛选.最低加速 !== null && 筛选.最高加速 !== null && 筛选.最低加速 > 筛选.最高加速) ||
    (筛选.最低延迟 !== null && 筛选.最高延迟 !== null && 筛选.最低延迟 > 筛选.最高延迟)
  return (
    <div className={样式.筛选内容}>
      <div className={样式.范围设置}>
        <span>加速值</span>
        <InputNumber
          min={0}
          value={筛选.最低加速}
          placeholder='最低'
          aria-label='最低加速值'
          onChange={(值) => 设置筛选({ ...筛选, 最低加速: 转数字(值) })}
        />
        <span>至</span>
        <InputNumber
          min={0}
          value={筛选.最高加速}
          placeholder='最高（不含）'
          aria-label='最高加速值'
          onChange={(值) => 设置筛选({ ...筛选, 最高加速: 转数字(值) })}
        />
        <span>延迟</span>
        <InputNumber
          min={0}
          value={筛选.最低延迟}
          placeholder='最低'
          aria-label='最低延迟'
          onChange={(值) => 设置筛选({ ...筛选, 最低延迟: 转数字(值) })}
        />
        <span>至</span>
        <InputNumber
          min={0}
          value={筛选.最高延迟}
          placeholder='最高'
          aria-label='最高延迟'
          onChange={(值) => 设置筛选({ ...筛选, 最高延迟: 转数字(值) })}
        />
        <Checkbox
          checked={筛选.未限定延迟}
          onChange={(事件) => 设置筛选({ ...筛选, 未限定延迟: 事件.target.checked })}
        >
          包含未限定延迟
        </Checkbox>
      </div>
      <Typography.Text type='secondary' className={样式.次要文字}>
        加速范围包含下限、不含上限；上下限相同时按该加速值筛选。角色加速不匹配的格子仍显示 -
      </Typography.Text>
      {范围错误 && <Typography.Text type='danger'>范围下限不能大于上限。</Typography.Text>}
      <div className={样式.选择框}>
        <Select
          mode='multiple'
          className={样式.选择器}
          placeholder='隐藏指定列'
          aria-label='隐藏指定列'
          value={隐藏列}
          onChange={设置隐藏列}
          optionFilterProp='label'
          maxTagCount='responsive'
          getPopupContainer={(节点) => 节点.parentElement!}
          options={列.map((项) => ({
            value: 项.id,
            label: `${项.循环.标题 || 项.循环.名称} · ${项.标题}`,
          }))}
        />
      </div>
    </div>
  )
}
