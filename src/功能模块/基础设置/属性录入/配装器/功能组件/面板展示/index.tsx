// 当前装备下的属性面板
import React, { useMemo, useState } from 'react'
import { Tooltip } from 'antd'
import classnames from 'classnames'
import { 装备信息数据类型 } from '@/@types/装备'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import { useAppSelector } from '@/hooks'
import { 获取角色需要展示的面板数据 } from '@/功能模块/基础设置/面板信息/工具'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取面板显示数据数值, 获取面板显示数据 } from '@/功能模块/基础设置/面板信息'
import './index.css'

interface 面板展示入参 {
  当前装备信息: 装备信息数据类型
  /**
   * @name 对比装备信息
   * 属性涨跌的比较基准；不传则回退到页面当前装备（正常编辑模式）。
   */
  对比装备信息?: 装备信息数据类型 | null
  循环覆盖?: 计算循环覆盖类型
}

function 面板展示(props: 面板展示入参) {
  const { 主属性 } = use心法数据()
  const { 当前装备信息, 对比装备信息, 循环覆盖 } = props
  // 页面方案装备（正常模式下作为涨跌基准）
  const 页面装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 基准装备信息 = 对比装备信息 === undefined ? 页面装备信息 : 对比装备信息
  const 页面奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  // 与秒伤引擎采用同一份奇穴，避免面板和 DPS 各算各的。
  const 当前奇穴信息 = 循环覆盖?.更新奇穴数据?.length ? 循环覆盖.更新奇穴数据 : 页面奇穴信息
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const [显示增益后面板, 切换显示增益后面板] = useState<boolean>(false)

  const 获取计算后原始属性 = (计算装备信息) => {
    return 获取角色需要展示的面板数据({
      装备信息: 计算装备信息,
      当前奇穴信息,
      增益数据,
      增益启用,
      显示增益后面板,
    })
  }

  const 显示数据 = useMemo(() => {
    const 计算后的当前显示属性 = 获取计算后原始属性(当前装备信息)
    if (基准装备信息 === null) {
      return { 数据: 计算后的当前显示属性, 对比枚举: {} }
    }
    const 计算后的原始最终属性 = 获取计算后原始属性(基准装备信息)

    const 对比枚举 = {}
    Object.keys(计算后的当前显示属性).forEach((key) => {
      const 原始属性数值 = 计算后的原始最终属性[key]
      对比枚举[key] =
        原始属性数值 > 计算后的当前显示属性[key]
          ? '变低'
          : 原始属性数值 < 计算后的当前显示属性[key]
            ? '变高'
            : '-1'
    })

    return { 数据: 计算后的当前显示属性, 对比枚举 }
  }, [当前装备信息, 当前奇穴信息, 基准装备信息, 增益数据, 增益启用, 显示增益后面板])

  const mapKeyList = [
    '装分',
    '气血',
    主属性,
    '攻击',
    '会心',
    '会效',
    '破防',
    '无双',
    '全能',
    '加速',
  ]

  return (
    <div
      className={`${
        显示增益后面板 ? 'zhuangbei-character-zengyi' : 'zhuangbei-character-wuzengyi'
      } zhuangbei-character-show`}
    >
      <div className='zhuangbei-show-zengyi-tag'>
        <div className='tag-active' />
        <div
          onClick={() => 切换显示增益后面板(false)}
          className='show-zengyi-tag-item hide-zengyi-charactor'
        >
          无增益面板
        </div>
        <div
          onClick={() => 切换显示增益后面板(true)}
          className='show-zengyi-tag-item shouw-zengyi-charactor'
        >
          增益后面板
        </div>
      </div>
      {mapKeyList.map((item, index) => {
        const 对比枚举属性名 = 显示文案和实际属性枚举[item]
        const 对比枚举结果 = 显示数据?.对比枚举?.[对比枚举属性名]
        const 有变化 = 对比枚举结果 && 对比枚举结果 !== '-1'
        const cls = classnames(
          'zhuangbei-character-content-normal',
          有变化
            ? 对比枚举结果 === '变高'
              ? 'zhuangbei-character-content-upper'
              : 'zhuangbei-character-content-down'
            : '',
        )
        return (
          <div
            id={`zhuangbei-character-item_${item}`}
            className={`zhuangbei-character-item ${
              index === mapKeyList.length - 1 ? 'zhuangbei-character-item-last' : ''
            }`}
            key={item}
          >
            <h1 className='zhuangbei-character-label'>{item}</h1>
            <Tooltip
              placement='left'
              getPopupContainer={() =>
                document.getElementById(`zhuangbei-character-item_${item}`) as any
              }
              title={
                <div>
                  <p>{获取面板显示数据数值(item, 显示数据?.数据, 显示数据?.数据?.装分)}</p>
                  {有变化 ? <p>较原面板[{对比枚举结果}]</p> : null}
                </div>
              }
            >
              <div className='zhuangbei-character-content'>
                <span className={cls}>
                  {获取面板显示数据(item, 显示数据?.数据, 显示数据?.数据?.装分)}
                </span>
              </div>
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}

export default 面板展示

export const 显示文案和实际属性枚举 = {
  装分: '装分',
  体质: '体质',
  气血: '最终气血上限',
  力道: '力道',
  身法: '身法',
  元气: '元气',
  根骨: '根骨',
  攻击: '面板攻击',
  会心: '会心等级',
  会效: '会心效果等级',
  破防: '破防等级',
  无双: '无双等级',
  全能: '全能等级',
  加速: '加速等级',
}
