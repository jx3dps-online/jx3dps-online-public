import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Divider } from 'antd'
import {
  五彩石满足潮生要求,
  获取潮生要求提示,
} from '@/功能模块/基础设置/公用设置/循环约束/潮生五彩石'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 延迟设定 } from '@/数据/常量'
import { 计算记录类型 } from '@/@types/计算'
import { 数据埋点 } from '@/工具函数/tools/log'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 更新增益面板显示状态 } from '@/store/system'

import { use报告引导界面 } from '@/功能模块/新手引导/界面状态'
import 结果统计 from './结果统计'
import 收益图表 from './收益图表'
import 技能统计图表 from './技能统计图表'
import 登龙长阶 from './登龙长阶'
import { 获取文案 } from './登龙长阶/文案'
import './index.css'
import useCycle from '@/hooks/use-cycle'
import { 获取攻略组件 } from '@/功能模块/攻略/注册表'
import 攻略弹窗 from '@/功能模块/攻略/攻略弹窗'
import 攻略引导弹窗 from '@/功能模块/攻略/攻略引导弹窗'
import 循环说明 from './循环说明'

// 结果区窄屏纵向展示，始终保留登龙长阶与技能统计
const 双列最小宽度 = 880

type 循环要求 = {
  加速?: string
  延迟?: string
}

type 循环要求分组 = {
  延迟: string
  加速列表: string[]
}

function 计算结果() {
  const { 名称, 系统配置, 缓存映射, 五彩石 } = use心法数据()
  const 当前五彩石名称 = useAppSelector((state) => state.data.装备信息.五彩石)
  const 增益面板显示状态 = useAppSelector((state) => state?.system?.增益面板显示状态)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const [技能统计弹窗, 打开技能统计弹窗] = useState<boolean>(false)
  const [初始化, 设置初始化] = useState<boolean>(false)
  const [攻略弹窗打开, 设置攻略弹窗打开] = useState<boolean>(false)
  const [攻略提示弹窗打开, 设置攻略提示弹窗打开] = useState<boolean>(false)
  const [dps宽度, 设置dps宽度] = useState<number>(0)

  const [收益图显示, 设置收益图显示] = useState(false)
  use报告引导界面('技能详情打开', 技能统计弹窗 && !!当前计算结果?.秒伤)
  use报告引导界面('登阶显示', !收益图显示 || !当前计算结果?.秒伤)

  const incomeRef = useRef<any>()
  const skillRef = useRef<any>()
  const dpsRef = useRef<HTMLDivElement>(null)
  const 首次渲染 = useRef<boolean>(true)

  const dispatch = useAppDispatch()

  const { 当前循环信息 } = useCycle()
  const 潮生匹配 = 五彩石满足潮生要求(
    五彩石[5].concat(五彩石[6]).find((石头) => 石头.五彩石名称 === 当前五彩石名称),
    当前循环信息,
  )

  const 攻略key = 当前循环信息?.攻略key
  const 攻略组件 = 攻略key ? 获取攻略组件(攻略key) : undefined

  // 是否双列展示（依据真实宽度）
  const 显示双列 = dps宽度 >= 双列最小宽度

  useEffect(() => {
    dispatch(秒伤计算({ 是否更新显示计算结果: true }))
    // 依赖缓存映射：切心法后缓存映射变化，重新计算秒伤（SPA 切心法不重新挂载组件）
  }, [缓存映射])

  // 监听结果区宽度，用于自适应单双列
  useEffect(() => {
    const el = dpsRef.current
    if (!el) return
    const 观察器 = new ResizeObserver(() => {
      设置dps宽度(el.clientWidth)
    })
    观察器.observe(el)
    设置dps宽度(el.clientWidth)
    return () => 观察器.disconnect()
  }, [])

  // 切换循环后，若该循环配置了攻略且未关闭提示，则弹出引导弹窗
  useEffect(() => {
    if (首次渲染.current) {
      首次渲染.current = false
      return
    }
    if (攻略组件 && !localStorage.getItem(缓存映射.攻略提示不再提示)) {
      设置攻略提示弹窗打开(true)
    }
  }, [攻略key])

  useEffect(() => {
    if (当前计算结果?.秒伤) {
      setTimeout(() => {
        incomeRef?.current?.initChart()
        skillRef?.current?.initChart()
      }, 200)
      if (潮生匹配) 更新计算记录()
      数据埋点('秒伤计算')
    }
  }, [当前计算结果, 缓存映射])

  // 宽度变化时重新适配图表尺寸
  useEffect(() => {
    setTimeout(() => {
      incomeRef?.current?.forceFit?.()
      skillRef?.current?.forceFit?.()
    }, 200)
  }, [dps宽度])

  useEffect(() => {
    const 定时器 = window.setTimeout(() => {
      if (收益图显示) incomeRef.current?.initChart()
      skillRef.current?.initChart()
    }, 200)
    // 列宽过渡结束后按新尺寸重排图表，避免过渡中尺寸与画布不一致
    const 适配定时器 = window.setTimeout(() => {
      if (收益图显示) incomeRef.current?.forceFit?.()
      skillRef.current?.forceFit?.()
    }, 360)
    return () => {
      window.clearTimeout(定时器)
      window.clearTimeout(适配定时器)
    }
  }, [收益图显示])

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
    const 分组映射: Record<string, 循环要求分组> = {}
    const 分组顺序: string[] = []
    要求列表?.forEach((要求) => {
      const 延迟名 = 要求?.延迟 || '未标注延迟'
      if (!分组映射[延迟名]) {
        分组映射[延迟名] = { 延迟: 延迟名, 加速列表: [] }
        分组顺序.push(延迟名)
      }
      if (要求?.加速) {
        分组映射[延迟名].加速列表.push(要求.加速)
      }
    })
    return 分组顺序.map((延迟名) => 分组映射[延迟名])
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

  const 循环要求提示 = 当前循环强制要求 ? (
    <div className='dps-no-result-range'>
      {当前循环强制要求 && (
        <>
          <p className='dps-no-result-range-label'>
            当前循环支持范围（鼠标悬停循环可查看加速要求）：
          </p>
          <div className='dps-no-result-range-list'>
            {当前循环强制要求?.map((分组, index) => {
              return (
                <div className='dps-no-result-group' key={`当前循环强制要求_${index}`}>
                  <span className='dps-no-result-group-label'>{分组?.延迟}</span>
                  <div className='dps-no-result-group-tags'>
                    {分组?.加速列表?.map((加速, 加速Index) => {
                      return (
                        <span className='dps-no-result-tag' key={`${分组?.延迟}_${加速Index}`}>
                          {加速}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  ) : null

  return (
    <>
      <div
        ref={dpsRef}
        className={`dps ${增益面板显示状态 ? `dps-zengyi-visible` : ''}`}
        style={{ backgroundColor: 系统配置?.背景色 || 'rgba(0, 0, 0, 0.5)' }}
      >
        <h1 className={'dps-title'}>伤害计算</h1>
        <Divider />

        <div id='Guide_计算结果' className='dps-number-count-wrap'>
          {当前计算结果?.秒伤 ? (
            <div className='dps-number-summary'>
              <div className={'dps-number-count'}>
                <div id='Guide_8' className={'dps-number-count-text'}>
                  {当前计算结果?.秒伤}
                </div>
                <Button
                  id='Guide_技能详情'
                  className={'dps-number-count-skill-btn'}
                  type='primary'
                  size='small'
                  onClick={() => 打开技能统计弹窗(true)}
                >
                  技能详情
                </Button>
              </div>
              <p className={'dps-number-tip'}>数值仅供参考，请以实际游戏内数值为准</p>
              {循环要求提示}
            </div>
          ) : (
            <div className={'dps-number-count-no-result'}>
              <div className='dps-no-result-title'>
                <ExclamationCircleFilled />
                <span>无法计算</span>
              </div>
              <p className='dps-no-result-subtitle'>加速或延迟不对，请检查装备、循环情况</p>
              {循环要求提示}
            </div>
          )}
          <循环说明
            长阶双列={dps宽度 >= 1180 && !!当前计算结果?.秒伤}
            名称={当前循环信息?.标题 || 当前循环信息?.名称}
            备注={当前循环信息?.备注}
            显示木桩提示={!!当前计算结果?.秒伤 && !增益启用}
            潮生要求提示={潮生匹配 ? undefined : 获取潮生要求提示()}
            打开增益详情={() => dispatch(更新增益面板显示状态(true))}
            查看攻略={攻略组件 ? () => 设置攻略弹窗打开(true) : undefined}
          />
          {当前计算结果?.秒伤 ? (
            <div className='dps-number-count-time'>
              <span className={'dps-number-count-time-label'}>战斗时间：</span>
              {当前计算结果?.秒伤计算时间}秒
            </div>
          ) : null}
        </div>
        <div
          className={`dps-planning-layout ${
            (收益图显示 ? 显示双列 : dps宽度 >= 1180) && 当前计算结果?.秒伤
              ? 'dps-planning-layout-wide'
              : ''
          } ${收益图显示 && 显示双列 && 当前计算结果?.秒伤 ? 'dps-planning-layout-chart' : ''}`}
        >
          <div className='dps-planning-main'>
            <nav className='dps-planning-tabs' aria-label='结果展示方式'>
              <button
                type='button'
                id='Guide_登阶页签'
                aria-pressed={!收益图显示}
                onClick={() => 设置收益图显示(false)}
              >
                {获取文案(名称)['登阶.名称']}
              </button>
              <button
                type='button'
                aria-pressed={收益图显示}
                disabled={!当前计算结果?.秒伤}
                onClick={() => 设置收益图显示(true)}
              >
                属性收益图
              </button>
            </nav>
            {收益图显示 && 当前计算结果?.秒伤 ? (
              <收益图表 ref={incomeRef} />
            ) : (
              <登龙长阶 key={缓存映射.计算记录} />
            )}
          </div>
          {当前计算结果?.秒伤 ? (
            <div className='dps-planning-skills'>
              <技能统计图表 ref={skillRef} />
            </div>
          ) : null}
        </div>
        {当前计算结果?.秒伤 ? (
          <结果统计 visible={技能统计弹窗} onClose={() => 打开技能统计弹窗(false)} />
        ) : null}
      </div>
      <攻略弹窗
        攻略组件={攻略组件}
        打开={攻略弹窗打开}
        关闭={() => 设置攻略弹窗打开(false)}
        计算结果节点={dpsRef.current}
      />
      <攻略引导弹窗
        打开={攻略提示弹窗打开}
        关闭={() => 设置攻略提示弹窗打开(false)}
        立即查看={() => {
          设置攻略提示弹窗打开(false)
          设置攻略弹窗打开(true)
        }}
        设置不再提示={() => localStorage.setItem(缓存映射.攻略提示不再提示, '1')}
      />
    </>
  )
}

export default forwardRef(计算结果)
