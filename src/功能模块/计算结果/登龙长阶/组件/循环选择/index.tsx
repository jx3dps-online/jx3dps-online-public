import React from 'react'
import { Select } from 'antd'
import { useAppSelector } from '@/hooks/index'
import 获取循环信息 from '@/hooks/use-cycle'
import { use心法数据 } from '@/心法模块/心法上下文'
import type { 装备信息数据类型 } from '@/@types/装备'
import type { 配装循环 } from '@/角色/类型'
import { 登阶循环限制 } from '../../领域/循环'
import { 重建登阶装备 } from '../../领域/计算'
import { 获取文案, 填充文案, 武器类型显示 } from '../../文案'

export default function 登阶循环选择({
  装备,
  value,
  onChange,
  标签: 传入标签,
}: {
  装备?: 装备信息数据类型
  value?: 配装循环
  onChange: (循环: 配装循环) => void
  标签?: string
}) {
  const 数据 = useAppSelector((state) => state.data)
  const { 名称: 心法, 计算循环 } = use心法数据()
  const 文案 = 获取文案(心法)
  const 标签 = 传入标签 || 文案['循环.标签']
  const 全部 = [...(计算循环 || []), ...(数据.自定义循环列表 || [])]
  return (
    <div className='dragon-route-picker'>
      <label>{标签}</label>
      <Select
        aria-label={标签}
        value={value?.名称}
        style={{ width: '100%' }}
        showSearch
        optionFilterProp='label'
        options={全部.map((项) => ({
          value: 项.名称,
          label: 填充文案(文案[项.标记 ? '循环.选项.有标记' : '循环.选项.无标记'], {
            名称: 项.标题 || 项.名称,
            标记: 武器类型显示(文案, 项.标记),
          }),
          disabled: !装备 || !!登阶循环限制(装备, 项, 文案),
        }))}
        onChange={(名称) => {
          const 选择 = 全部.find((项) => 项.名称 === 名称)!
          if (!装备) return
          let 配装 = 装备
          try {
            配装 = 重建登阶装备(装备)
          } catch {
            /* 保存时再校验装备 */
          }
          const { 计算循环详情 } = 获取循环信息({
            使用内存数据: false,
            覆盖数据: {
              装备信息: 配装,
              增益数据: 数据.增益数据,
              增益启用: 数据.增益启用,
              网络延迟: 数据.网络延迟,
              当前计算循环名称: 名称,
              自定义循环列表: 数据.自定义循环列表,
            },
          })
          onChange({
            名称,
            奇穴: [...选择.奇穴],
            秘籍: { ...(计算循环详情?.秘籍 || 选择.秘籍 || 数据.当前秘籍信息) },
          })
        }}
      />
    </div>
  )
}
