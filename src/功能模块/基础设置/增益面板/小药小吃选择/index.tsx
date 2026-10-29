import { useAppSelector } from '@/hooks'
import React, { useMemo } from 'react'
import { 小药小吃数据类型 } from '@/@types/小药小吃'
import { use心法数据 } from '@/心法模块/心法上下文'
import 小药小吃选择框 from './小药小吃选择框'
import './index.css'

interface 小吃数据 {
  type: string
  data: 小药小吃数据类型[]
}

function XiaochiXuanze({ 保存数据并计算, 开启智能对比 }) {
  const { 小药小吃 = [] } = use心法数据()
  const 增益数据 = useAppSelector((state) => state.data.增益数据)

  const list: 小吃数据[] = useMemo(() => {
    let res: 小吃数据[] = []
    小药小吃.forEach((item) => {
      if (res?.find((a) => a.type === item?.小吃部位)) {
        res = res.map((a) => {
          return {
            ...a,
            data: a.type === item?.小吃部位 ? (a?.data || []).concat([item]) : a?.data,
          }
        })
      } else {
        res.push({
          type: item?.小吃部位,
          data: [item],
        })
      }
    })
    return res
  }, [小药小吃])

  const changeSelectedXiaochi = (e, type) => {
    let newXiaochi = [...(增益数据?.小吃 || [])]

    const existTypeXiaochi = (list.find((a) => a?.type === type)?.data || [])?.find((c) =>
      newXiaochi?.includes(c?.小吃名称),
    )

    if (existTypeXiaochi) {
      newXiaochi = newXiaochi.filter((item) => item !== existTypeXiaochi?.小吃名称)
      newXiaochi.push(e)
    } else {
      newXiaochi.push(e)
    }

    const newZengyi = { ...增益数据, 小吃: newXiaochi.filter((item) => item) }

    保存数据并计算(newZengyi)
  }

  return (
    <div className='zengyi-xiaochi-xuanze'>
      {(list || []).map((item) => {
        const selectedValue =
          item.data.find((a) => 增益数据?.小吃?.includes(a.小吃名称))?.小吃名称 || undefined

        return (
          <div className='zengyi-xiaochi-item' key={item.type}>
            <h1 className='zengyi-xiaochi-title'>{item.type}</h1>
            <小药小吃选择框
              data={item?.data}
              value={selectedValue}
              onChange={(e) => changeSelectedXiaochi(e, item?.type)}
              开启智能对比={开启智能对比}
            />
          </div>
        )
      })}
    </div>
  )
}

export default XiaochiXuanze
