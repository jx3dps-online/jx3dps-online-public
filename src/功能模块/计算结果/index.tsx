import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Divider } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 延迟设定 } from '@/数据/常量'
import { 计算记录类型 } from '@/@types/计算'
import { 数据埋点 } from '@/工具函数/tools/log'
import { 秒伤计算 } from '@/计算模块/计算函数'

import 结果统计 from './结果统计'
import 收益图表 from './收益图表'
import 技能统计图表 from './技能统计图表'
import './index.css'
import useCycle from '@/hooks/use-cycle'

const { 系统配置, 缓存映射 } = 获取当前数据()

type 循环要求 = {
  加速?: string
  延迟?: string
}

function 计算结果() {
  const 增益面板显示状态 = useAppSelector((state) => state?.system?.增益面板显示状态)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const [技能统计弹窗, 打开技能统计弹窗] = useState<boolean>(false)
  const [初始化, 设置初始化] = useState<boolean>(false)

  const incomeRef = useRef<any>()
  const skillRef = useRef<any>()

  const dispatch = useAppDispatch()

  const { 当前循环信息 } = useCycle()

  useEffect(() => {
    dispatch(秒伤计算({ 是否更新显示计算结果: true }))
  }, [])

  useEffect(() => {
    if (当前计算结果?.秒伤) {
      setTimeout(() => {
        incomeRef?.current?.initChart()
        skillRef?.current?.initChart()
      }, 200)
      更新计算记录()
      数据埋点('秒伤计算')
    }
  }, [当前计算结果, 增益面板显示状态])

  const 当前循环强制要求 = useMemo(() => {
    if (当前计算结果?.秒伤 || !当前循环信息?.强制加速要求) {
      return null
    }
    const 要求列表: 循环要求[] = []
    当前循环信息?.循环详情?.forEach((循环) => {
      let 要求: 循环要求 = {}
      if (循环?.循环加速等级 !== undefined) {
        要求.加速 = `${循环?.循环加速等级}段加速`
      } else if (循环?.循环加速值范围?.[0] !== undefined) {
        要求.加速 = `${循环?.循环加速值范围?.[0]}加速`
      }
      if (循环?.循环延迟要求 !== undefined) {
        const 实际延迟显示值 =
          延迟设定?.find((a) => a?.value === 循环?.循环延迟要求)?.label || 循环?.循环延迟要求
        if (实际延迟显示值) {
          要求.延迟 = `${实际延迟显示值}`
        }
      }
      要求列表.push(要求)
    })
    return 要求列表
  }, [当前循环信息, 当前计算结果])

  const 更新计算记录 = () => {
    // 第一次不更新，用于新版本提示
    if (!初始化) {
      设置初始化(true)
      return
    }
    try {
      // 获取当前缓存的计算记录
      const 计算记录: 计算记录类型 = JSON.parse(localStorage.getItem(缓存映射.计算记录) || '{}')
      const 当前记录 = 计算记录?.当前记录
      const 最高记录 = 计算记录?.最高记录
      if (当前记录?.秒伤 !== 当前计算结果?.秒伤) {
        const 新记录: 计算记录类型 = {
          ...计算记录,
          当前记录: {
            计算循环: 当前计算循环名称,
            计算时间: new Date().valueOf(),
            秒伤: 当前计算结果?.秒伤,
          },
        }
        localStorage.setItem(缓存映射.计算记录, JSON.stringify(新记录))
      }
      if (!最高记录?.秒伤 || 最高记录?.秒伤 < 当前计算结果?.秒伤) {
        const 新记录: 计算记录类型 = {
          ...计算记录,
          最高记录: {
            计算循环: 当前计算循环名称,
            计算时间: new Date().valueOf(),
            秒伤: 当前计算结果?.秒伤,
          },
        }
        localStorage.setItem(缓存映射.计算记录, JSON.stringify(新记录))
      }
    } catch (e) {
      console.error('更新计算记录异常', e)
    }
  }

  return (
    <div
      className={`dps ${增益面板显示状态 ? `dps-zengyi-visible` : ''}`}
      style={{ backgroundColor: 系统配置?.背景色 || 'rgba(0, 0, 0, 0.5)' }}
    >
      <h1 className={'dps-title'}>伤害计算</h1>
      <Divider />
      <div className='dps-number-count-wrap'>
        {当前计算结果?.秒伤 ? (
          <div className={'dps-number-count'}>
            <div id='Guide_8' className={'dps-number-count-text'}>
              {当前计算结果?.秒伤}
            </div>
            <Button
              className={'dps-number-count-skill-btn'}
              style={{ marginLeft: 20 }}
              type='primary'
              size='small'
              onClick={() => 打开技能统计弹窗(true)}
            >
              技能详情
            </Button>
            {!增益启用 ? (
              <div className={'dps-number-count-gain-tip'}>
                当前为纯木桩计算，计算属性收益时建议
                <b style={{ textDecorationLine: 'underline' }}>开启增益</b>。
              </div>
            ) : null}
          </div>
        ) : (
          <div className={'dps-number-count-no-result'}>
            <h1>无法计算</h1>
            <h1>加速或延迟不对！</h1>
            <h1>请检查装备、循环情况</h1>
            <h1>鼠标放置循环上有加速要求说明</h1>
            {当前循环强制要求 ? (
              <div>
                <p>当前循环支持范围：</p>
                {当前循环强制要求?.map((要求, index) => {
                  return (
                    <p key={`当前循环强制要求_${index}`}>
                      {要求?.加速 ? 要求.加速 : ''} {要求?.延迟 ? 要求.延迟 : ''}
                    </p>
                  )
                })}
              </div>
            ) : null}
          </div>
        )}
        {当前计算结果?.秒伤 ? (
          <div className='dps-number-count-time'>
            <span className={'dps-number-count-time-label'}>战斗时间：</span>
            {当前计算结果?.秒伤计算时间}秒
          </div>
        ) : null}
      </div>
      {当前计算结果?.秒伤 ? (
        <>
          <p className={'dps-number-tip'}>数值仅供参考，请以实际游戏内数值为准</p>
          <div className={`dps-res-chart ${!增益面板显示状态 ? 'dps-chart-show-skill' : ''}`}>
            {!增益面板显示状态 ? (
              <div className={`dps-res-chart-wrap`}>
                <收益图表 ref={incomeRef} />
              </div>
            ) : null}
            <div className={`dps-res-chart-wrap`}>
              <技能统计图表 ref={skillRef} />
            </div>
          </div>
          <结果统计 visible={技能统计弹窗} onClose={() => 打开技能统计弹窗(false)} />
        </>
      ) : null}
    </div>
  )
}

export default forwardRef(计算结果)
