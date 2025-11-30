import { useAppDispatch, useAppSelector } from '@/hooks'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 秒伤计算 } from '@/计算模块/计算函数'
import React, { useContext } from 'react'
import styles from './index.module.less'
import { 小吃类型枚举 } from '@/@types/枚举'
import ExportContext from '../context'

const { 阵眼, 小药小吃 } = 获取当前数据()

const 配装推荐 = () => {
  const { 当前装备信息 } = useContext(ExportContext)

  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const dispatch = useAppDispatch()

  // 计算阵眼收益
  const 计算更换后秒伤 = (更换后数据) => {
    const { 秒伤 } = dispatch(
      秒伤计算({
        更新增益数据: 更换后数据,
        更新装备信息: 当前装备信息,
        计算技能详情: false,
      }),
    )
    return 秒伤 || 0
  }

  const 前三阵眼数据 = () => {
    let list: any[] = [...阵眼]
    list = list.map((item) => {
      const dps = 计算更换后秒伤({ ...增益数据, 阵眼: item?.阵眼名称 })

      return {
        ...item,
        dps: dps,
      }
    })
    list.sort((a, b) => (b?.dps || 0) - (a?.dps || 0))
    list = list.slice(0, 3)
    return list.map((item) => item?.阵眼名称)
  }

  const 小药推荐数据 = () => {
    const 全部数据 = 小药小吃?.filter(
      (item) =>
        item?.小吃品级 === '紫' &&
        [小吃类型枚举.药品增强, 小吃类型枚举.食品增强]?.includes(item?.小吃部位),
    )

    const 获取全部排列组合 = () => {
      const list = groupByAttribute(全部数据)
      const res = combineDifferentGroups(list)
      return res
    }
    const 全部排列组合 = 获取全部排列组合()
    let data: any
    if (增益启用) {
      const list = 全部排列组合.map((item) => {
        const 过滤小吃数据 = 增益数据.小吃.filter(
          (item) => !全部数据?.some((a) => a.小吃名称 === item),
        )
        const 要计算的小吃数据 = item?.map((a) => a?.小吃名称) || []
        const 新小吃数据 = [...过滤小吃数据, ...要计算的小吃数据]
        const dps = 计算更换后秒伤({ ...增益数据, 小吃: 新小吃数据 })

        return {
          ...item,
          dps: dps,
          组合情况: item,
        }
      })
      list.sort((a, b) => (b?.dps || 0) - (a?.dps || 0))
      data = list?.[0]
    }
    return data?.组合情况?.map(
      (a) => a?.小吃名称?.replace('）', ')').replace('（', '(')?.split('·')?.[1],
    )
  }

  return (
    <div className={styles.tip}>
      <div className={styles.span}>
        阵眼：
        <span className={styles.text}>{前三阵眼数据?.()?.join(' > ')}</span>
      </div>
      <div className={styles.span}>
        小药推荐：
        <span className={styles.text}>{小药推荐数据?.()?.join('｜')}</span>
      </div>
    </div>
  )
}

export default 配装推荐

function groupByAttribute(arr) {
  const groups = {}

  // Group objects by their 'a' attribute
  arr.forEach((item) => {
    if (!groups[item.小吃部位]) {
      groups[item.小吃部位] = []
    }
    groups[item.小吃部位].push(item)
  })

  return Object.values(groups)
}

function combineDifferentGroups(groups) {
  const results: any = []

  function helper(groupIndex, currentCombination) {
    if (groupIndex === groups.length) {
      results.push(currentCombination)
      return
    }

    const group = groups[groupIndex]
    group.forEach((item) => {
      helper(groupIndex + 1, currentCombination.concat(item))
    })
  }

  helper(0, [])
  return results
}
