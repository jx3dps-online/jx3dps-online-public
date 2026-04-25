import { Select, SelectProps } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { 附魔数据类型 } from '@/@types/附魔'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 根据表单选项获取装备信息 from '../../../工具函数/根据表单选项获取装备信息'
import './index.css'
import classNames from 'classnames'
import { 装备位置部位枚举 } from '@/@types/装备'

interface 附魔选择入参 extends SelectProps {
  list: 附魔数据类型[]
  form: any
  开启装备智能对比: boolean
  对比显示百分比: boolean
  allValue?: any // 选择装备的全部信息包含附魔等
  部位索引: string
  排序索引: number
}

function 附魔选择(props: 附魔选择入参) {
  const { list, 开启装备智能对比, form, allValue, 部位索引, 对比显示百分比, 排序索引, ...rest } =
    props

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 当前装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const [dpsUpList, setDpsUpList] =
    useState<{ uuid: string; dpsUp: string | number; dpsPercent: string }[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const 原始附魔 = useMemo(() => {
    const 装备附魔 = 当前装备信息?.装备列表?.find(
      (a: any, index) => 装备位置部位枚举[部位索引] === a?.装备部位 && index === 排序索引,
    )?.附魔
    return 装备附魔
  }, [当前装备信息, 排序索引])

  const 是否更换附魔 = useMemo(() => {
    return allValue?.附魔 !== 原始附魔
  }, [原始附魔, allValue])

  // 获取dps提升装备列表
  const getDpsUpList = () => {
    if (开启装备智能对比) {
      setLoading(true)
      // 获取旧装备列表
      const 当前装备列表信息 = form?.getFieldsValue()
      const 当前装备信息 = 根据表单选项获取装备信息(当前装备列表信息)

      const { 秒伤: 旧秒伤 } = dispatch(
        秒伤计算({ 更新装备信息: 当前装备信息, 计算技能详情: false }),
      )

      // 传入新的装备
      const newDpsUpList = list.map((item) => {
        const 新装备数据 = {
          ...allValue,
          附魔: item?.附魔名称,
        }

        const 更新后装备信息 = 根据表单选项获取装备信息({
          ...当前装备列表信息,
          [`${部位索引}`]: 新装备数据,
        })

        const { 秒伤: 更新后秒伤 } = dispatch(
          秒伤计算({ 更新装备信息: 更新后装备信息, 计算技能详情: false }),
        )

        const 旧伤害 = 旧秒伤 || 当前计算结果?.秒伤

        const 秒伤差异 = 更新后秒伤 ? 更新后秒伤 - 旧伤害 : 旧伤害 ? '更换后加速不匹配' : ''
        const dpsPercent = 更新后秒伤 ? (旧伤害 ? ((+秒伤差异 / 旧伤害) * 100).toFixed(2) : '') : ''

        return {
          uuid: `${item?.附魔名称}${item?.附魔支持部位}` || '',
          dpsUp: 秒伤差异,
          dpsPercent: dpsPercent,
        }
      })

      if (newDpsUpList?.length) {
        setDpsUpList(newDpsUpList)
      }
      setLoading(false)
    }
  }

  const cls = classNames('fumo-select', { 'equip-diff-change': 是否更换附魔 })

  return (
    <Select
      placeholder='选择附魔'
      loading={loading}
      allowClear
      showSearch
      filterOption={(input, option) => {
        return option?.value?.toString()?.includes(input) || false
      }}
      popupMatchSelectWidth={开启装备智能对比 ? 260 : 200}
      optionFilterProp='label'
      onDropdownVisibleChange={(e) => {
        if (e) {
          getDpsUpList()
        } else {
          setDpsUpList([])
        }
      }}
      className={cls}
      {...rest}
    >
      {list.map((item) => {
        const upItem = dpsUpList?.find(
          (up) => up.uuid === `${item?.附魔名称}${item?.附魔支持部位}`,
        ) || {
          dpsUp: 0,
          dpsPercent: 0,
        }

        const 附魔名称数组 = item.附魔名称?.split('+')

        const 附魔属性 = 附魔名称数组[0]
        const 附魔值 = 附魔名称数组[1]
        const 颜色: any = item?.挑战附魔 ? '橙' : item?.附魔颜色 || '紫'

        return (
          <Select.Option key={item.附魔名称} value={item.附魔名称} label={item.附魔名称}>
            <div className='fumo-diff-wrap'>
              <span className='fumo-diff-name-wrap'>
                {附魔属性}
                {'+'}
                {附魔值}
              </span>
              <div className='fumo-diff-right'>
                {upItem?.dpsUp !== 0 && 开启装备智能对比 ? (
                  <span
                    className={`zhuangbei-diff ${
                      +upItem?.dpsUp > 0 ? 'dps-up-color' : 'dps-low-color'
                    }`}
                  >
                    {+upItem?.dpsUp > 0 ? '+' : ''}
                    {对比显示百分比 ? `${upItem?.dpsPercent}%` : `${upItem?.dpsUp}`}
                  </span>
                ) : null}
                <span className={`fumo-name-number fumo-name-${颜色枚举?.[颜色]?.样式}`}>
                  {颜色枚举?.[颜色]?.名称}
                </span>
              </div>
            </div>
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default 附魔选择

const 颜色枚举 = {
  橙: { 样式: 'orange', 名称: '挑战' },
  绿: { 样式: 'green', 名称: '阆风' },
  紫: { 样式: 'purple', 名称: '珍奇' },
  蓝: { 样式: 'blue', 名称: '卓越' },
}
