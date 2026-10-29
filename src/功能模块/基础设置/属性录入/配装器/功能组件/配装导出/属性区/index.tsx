import React, { useContext } from 'react'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { use心法数据 } from '@/心法模块/心法上下文'
import styles from './index.module.less'
import ExportContext from '../context'
import { 角色基础属性类型 } from '@/@types/角色'
import { 自身属性系数 } from '@/数据/常量'
import { 获取全能加成面板 } from '@/计算模块/统一工具函数/工具函数'
import { 获取加速等级 } from '@/工具函数/data'

const 属性区 = () => {
  const { 主属性 } = use心法数据()
  const { 显示数据 } = useContext(ExportContext)

  const mapKeyList = [
    '最大气血值',
    主属性,
    '基础攻击',
    '面板攻击',
    '会心',
    '会心效果',
    '破防',
    '无双',
    '加速',
    '加速等级',
    // '全能',
    '武器伤害',
  ]

  return (
    <div className={styles.attrWrap}>
      {mapKeyList.map((key) => {
        const { title, tip } = 获取展示信息(key, 显示数据 as any)
        return (
          <div key={key} className={styles.item}>
            <h1 className={styles.name}>{key}</h1>
            <div className={styles.title}>
              {title}
              {tip ? tip : null}
            </div>
            {/* <div className={styles.number}>{number}</div> */}
          </div>
        )
      })}
    </div>
  )
}

export default 属性区

const 获取展示信息 = (key: string, 角色最终属性: 角色基础属性类型) => {
  const { 主属性 } = 获取当前数据()
  let title: any = ''
  let tip = ''
  switch (key) {
    case '装分':
      title = 角色最终属性?.[key] || undefined
      break
    case '最大气血值':
      title = 角色最终属性?.最终气血上限 || undefined
      break
    case 主属性:
      title = 角色最终属性?.[主属性] || 0
      break
    case '基础攻击':
      title = 角色最终属性?.基础攻击 || 0
      break
    case '面板攻击':
      title = 角色最终属性?.面板攻击 || 0
      break
    case '会心':
      title = Math.min((角色最终属性.会心等级 / 自身属性系数.会心) * 100, 100).toFixed(2) + `%`
      break
    case '会心效果':
      title =
        Math.min((角色最终属性.会心效果等级 / 自身属性系数.会效) * 100 + 175, 300).toFixed(2) + `%`
      break
    case '破防':
      title = ((角色最终属性.破防等级 / 自身属性系数.破防) * 100).toFixed(2) + `%`
      break
    case '无双':
      title =
        ((获取全能加成面板(角色最终属性)?.无双等级 / 自身属性系数.无双) * 100).toFixed(2) + `%`
      break
    case '武器伤害':
      title = (角色最终属性.武器伤害_最小值 + 角色最终属性.武器伤害_最大值) / 2
      break
    case '加速':
      title =
        (Math.min((角色最终属性.加速等级 || 0) / 自身属性系数.急速, 0.25) * 100).toFixed(2) + `%`
      tip = `(${获取加速等级(角色最终属性.加速等级)})`
      break
    case '加速等级':
      title = 角色最终属性?.加速等级 || 0
      break
  }
  return {
    title,
    tip,
  }
}
