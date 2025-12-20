/**
 * 装备选择
 */
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import 装备部位选择 from './装备部位选择'
import 精炼等级选择 from './精炼等级选择'
import 镶嵌孔选择 from './镶嵌孔选择'
import 附魔选择 from './附魔选择'
import { 装备部位枚举 } from '@/@types/枚举'
import {
  装备位置部位枚举,
  装备属性信息模型,
  装备类型枚举,
  装备选择范围类型,
  选择装备数据类型,
} from '@/@types/装备'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import './index.css'

interface 装备选择入参 {
  value?: 选择装备数据类型
  onChange?: (e: 选择装备数据类型) => void
  form: any
  部位: 装备部位枚举
  部位索引: string
  排序索引: number
  默认镶嵌宝石等级: number
  开启装备智能对比: boolean
  对比加速: boolean
  对比显示百分比: boolean
  装备选择范围: 装备选择范围类型
}

const { 装备数据, 附魔 } = 获取当前数据()

function 装备选择(props: 装备选择入参, ref) {
  const {
    value,
    onChange,
    部位,
    默认镶嵌宝石等级,
    部位索引,
    排序索引,
    form,
    开启装备智能对比,
    对比显示百分比,
    装备选择范围,
    对比加速,
  } = props

  const selectRef = useRef<any>()

  // const 当前精炼等级 = useMemo(() => {
  //   return value?.当前精炼等级 || 0
  // }, [value])

  const 当前镶嵌等级数组 = useMemo(() => {
    return value?.镶嵌孔数组?.map((item) => item.镶嵌宝石等级) || []
  }, [value])

  // const 当前精炼等级 =

  const list: 装备属性信息模型[] = useMemo(() => {
    return 装备数据[部位] || []
  }, [部位])

  // 选择装备
  const 选择装备 = (e) => {
    const obj = list.find((item) => item.id === e)
    const 装备最大精炼等级 = 获取最大精炼等级(obj)
    // const 切换后精炼等级 = 当前精炼等级 > 装备最大精炼等级 ? 装备最大精炼等级 : 当前精炼等级
    onChange &&
      onChange({
        ...value,
        镶嵌孔数组: obj?.镶嵌孔数组?.map((item, index) => {
          return {
            ...item,
            镶嵌宝石等级: 当前镶嵌等级数组?.[index] || 默认镶嵌宝石等级,
          }
        }),
        当前精炼等级: 装备最大精炼等级,
        id: e,
        装备部位: 装备位置部位枚举[部位索引],
      } as any)
  }

  // 选择精炼等级
  const 选择精炼等级 = (e) => {
    onChange &&
      onChange({
        ...value,
        当前精炼等级: e,
      } as any)
  }

  // 选择精炼等级
  const 选择镶嵌孔 = (e) => {
    onChange &&
      onChange({
        ...value,
        镶嵌孔数组: e,
      } as any)
  }

  const onFumoSelect = (e) => {
    onChange &&
      onChange({
        ...value,
        附魔: e,
      } as any)
  }

  const 当前选择装备数据: 装备属性信息模型 = useMemo(() => {
    const obj = list.find((item) => item.id === value?.id)
    return {
      ...obj,
      最大精炼等级: obj ? 获取最大精炼等级(obj) || 0 : undefined,
    } as any
  }, [value?.id])

  const 当前装备支持附魔列表 = useMemo(() => {
    return (附魔 || []).filter((item) => {
      return item?.附魔支持部位?.some((a) => a === 部位)
    })
  }, [部位, 附魔])

  useImperativeHandle(ref, () => ({
    选择最佳装备: selectRef?.current?.选择最佳装备,
  }))

  return (
    <div className={'zhuangbei-form-item'} ref={ref} id='Guide_3'>
      <div className='zhuangbei-form-item-left-1'>
        <装备部位选择
          value={value?.id}
          allValue={value}
          onChange={选择装备}
          form={form}
          装备数据列表={list}
          部位={部位}
          部位索引={部位索引}
          排序索引={排序索引}
          默认镶嵌宝石等级={默认镶嵌宝石等级}
          开启装备智能对比={开启装备智能对比}
          对比显示百分比={对比显示百分比}
          对比加速={对比加速}
          装备选择范围={装备选择范围}
          ref={selectRef}
        />
      </div>
      {当前装备支持附魔列表?.length && 当前选择装备数据?.id ? (
        <div className='zhuangbei-form-item-left-2'>
          <附魔选择
            allValue={value}
            form={form}
            部位索引={部位索引}
            排序索引={排序索引}
            开启装备智能对比={开启装备智能对比}
            对比显示百分比={对比显示百分比}
            list={当前装备支持附魔列表}
            value={value?.附魔}
            onChange={onFumoSelect}
          />
        </div>
      ) : null}
      <div className='zhuangbei-form-item-left-3'>
        <精炼等级选择
          disabled={!当前选择装备数据?.id}
          key={当前选择装备数据?.id}
          value={value?.当前精炼等级}
          defaultValue={当前选择装备数据?.最大精炼等级}
          onChange={选择精炼等级}
          装备数据={当前选择装备数据}
        />
      </div>
      <div className='zhuangbei-form-item-left-4'>
        <镶嵌孔选择
          data={当前选择装备数据 as any}
          value={value?.镶嵌孔数组}
          onChange={选择镶嵌孔}
          部位索引={部位索引}
        />
      </div>
    </div>
  )
}

export default forwardRef(装备选择)

export const 获取最大精炼等级 = (data?: 装备属性信息模型) => {
  switch (data?.装备类型) {
    case 装备类型枚举.橙武:
      return 8
    case 装备类型枚举.副本精简:
    case 装备类型枚举.特效武器:
      return 6
    case 装备类型枚举.试炼精简:
      return 6
    default:
      return 6
  }
}
