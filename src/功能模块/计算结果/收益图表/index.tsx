/**
 * 收益展示
 */

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import * as G2 from '@antv/g2'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { message, Popover, Radio } from 'antd'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 找到收益下降点, 收益增益属性计算, 获取当前各属性最大附魔 } from './工具'
import {
  会心收益下降点收益信息,
  渲染会心收益下降点折线图,
  获取会心收益下降点图表数据,
} from './渲染函数/收益下降点'
import {
  // 攻击破招收益信息,
  渲染攻击破招折线图,
  获取攻击破招图表数据,
  获取攻击破招最大值,
} from './渲染函数/攻击破招'
import { 渲染属性收益柱状图, 获取属性收益柱状图数据, 附魔单点收益信息 } from './渲染函数/属性收益'
import 属性置换收益, { 附魔属性置换收益信息 } from './自定义图表/属性置换'
import { 获取角色需要展示的面板数据 } from '@/功能模块/基础设置/面板信息/工具'
import './index.css'
import { QuestionCircleFilled } from '@ant-design/icons'

const 收益列表 = 获取当前各属性最大附魔()

const checkTypeList = [
  ...附魔单点收益信息,
  ...附魔属性置换收益信息,
  ...会心收益下降点收益信息,
  // ...攻击破招收益信息,
]

function 收益图表(_, ref) {
  const 增益面板显示状态 = useAppSelector((state) => state?.system?.增益面板显示状态)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)

  const [chartData, setChartData] = useState<any>()
  const [currentIncomeType, setCurrentIncomeType] = useState<string>('附魔')

  const currentIncomeList = useRef<any>(收益列表)

  const limitRef: any = useRef<any>()

  const dispatch = useAppDispatch()

  const 增益后面板 = useMemo(() => {
    return 获取角色需要展示的面板数据({
      装备信息,
      当前奇穴信息,
      增益数据,
      增益启用,
      显示增益后面板: false,
    })
  }, [装备信息, 当前奇穴信息, 增益数据, 增益启用])

  // 计算单点增益
  const 计算增加后收益 = (装备基础属性, 是否郭氏计算 = false) => {
    const 计算结果 = dispatch(
      秒伤计算({
        是否郭氏计算: 是否郭氏计算,
        更新装备信息: {
          ...装备信息,
          装备基础属性: {
            ...装备信息?.装备基础属性,
            ...装备基础属性,
          },
        },
        计算技能详情: false,
      }),
    )
    return 计算结果
  }

  const 获取图表数据 = (type) => {
    if (['附魔', '单点'].includes(type) || !type) {
      const list = currentIncomeList?.current || 收益列表
      const 是否郭氏计算 = type === '附魔' ? true : false
      const { 秒伤: 旧秒伤 } = dispatch(
        秒伤计算({
          是否郭氏计算,
          计算技能详情: false,
        }),
      )
      return 获取属性收益柱状图数据(
        list,
        旧秒伤,
        装备信息,
        收益增益属性计算,
        计算增加后收益,
        是否郭氏计算,
      )
    } else if (['会心收益下降点']?.includes(type)) {
      return 获取会心收益下降点图表数据(
        type,
        currentIncomeList?.current,
        装备信息,
        计算增加后收益,
        增益后面板,
      )
    } else if (['攻击破招']?.includes(type)) {
      return 获取攻击破招图表数据(currentIncomeList?.current, 装备信息, 计算增加后收益, 增益后面板)
    }
  }

  useImperativeHandle(ref, () => ({
    initChart: initChart,
  }))

  const handleChangeType = (e) => {
    const list = checkTypeList?.find((item) => item.label === e)?.list
    if (list) {
      currentIncomeList.current = list
      setCurrentIncomeType(e)
      initChart(e)
    } else {
      message.error('出现异常，请联系开发者')
    }
  }

  useEffect(() => {
    limitRef.current = false
    return () => {
      limitRef.current = false
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      chartData && chartData.forceFit()
    }, 200)
  }, [增益面板显示状态])

  const initChart = (type?) => {
    const currentType = type || currentIncomeType

    if (limitRef.current) {
      return
    }
    limitRef.current = true

    const chart = chartData
      ? chartData
      : new G2.Chart({
          container: 'income-chart',
          autoFit: true,
          renderer: 'canvas',
          padding: [48, 0, 50, 40],
        })

    if (!chartData) {
      setChartData(chart)
    }

    const dataSource = 获取图表数据(currentType)

    chart.clear()

    if (['附魔', '单点'].includes(currentType) || !currentType) {
      渲染属性收益柱状图(chart)
    } else if (['会心收益下降点']?.includes(currentType)) {
      const 收益下降点 = 找到收益下降点(dataSource)
      渲染会心收益下降点折线图(chart, 收益下降点)
    } else if (['攻击破招']?.includes(currentType)) {
      const 最大值 = 获取攻击破招最大值(dataSource)
      渲染攻击破招折线图(chart, 0, 最大值)
    }

    chart.data(dataSource)
    chart.render()

    setTimeout(() => {
      limitRef.current = false
    }, 10)
  }

  const 是否展示自定义图标 = ['属性置换']?.includes(currentIncomeType)

  const 获取自定义图表组件 = () => {
    if (currentIncomeType === '属性置换') {
      return <属性置换收益 />
    }
  }

  return (
    <div id='Guide_9'>
      <div className='income-wrap'>
        {是否展示自定义图标 ? <div className='income-custom'>{获取自定义图表组件()}</div> : null}
        <div
          className={`income-chart ${是否展示自定义图标 ? 'income-chart-hide' : ''}`}
          id='income-chart'
        />
      </div>
      <div className='income-type-wrapper'>
        <div className={'income-chart-title'}>收益图表</div>
        <Radio.Group
          className='income-type-select-radio'
          value={currentIncomeType}
          onChange={(e) => handleChangeType(e?.target.value)}
        >
          {checkTypeList.map((item) => {
            return (
              <Radio.Button key={item.label} value={item.label}>
                <Popover title='图表说明' content={item.tip}>
                  {item.label}
                </Popover>
              </Radio.Button>
            )
          })}
        </Radio.Group>
        <Popover
          content={
            <div>
              <p>由于本图表采用的收益策略为：额外获得一个紫色附魔对应属性后的秒伤变化</p>
              <p>
                存在部分情况添加该附魔后。导致某装备特效的判定阈值发生变化，进而导致在一个附魔提升量情况下的收益变为负数
              </p>
              <p>如：无双在90%临界值附近因附魔的影响导致特效裤子从无双增益变为会心</p>
              <p>对本收益计算策略而言属于正常情况，特此说明</p>
            </div>
          }
        >
          <div className='income-type-select-button' onClick={() => handleChangeType('属性置换')}>
            <QuestionCircleFilled style={{ marginRight: 8 }} />
            为什么会出现负数收益
          </div>
        </Popover>
      </div>
    </div>
  )
}

export default forwardRef(收益图表)
