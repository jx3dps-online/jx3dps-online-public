import React, { useEffect, useRef, useState } from 'react'
import { Checkbox, Col, Drawer, Row, message } from 'antd'
import { 技能秘籍信息 } from '@/@types/秘籍'
import { use心法数据 } from '@/心法模块/心法上下文'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新角色数据 } from '@/store/data'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import { 获取当前职业的所有秘籍信息 } from './utils'
import './index.css'

function 秘籍选择抽屉(props?: any) {
  const { value, onChange, open, onClose, zIndex, 显示秒伤对比 } = props || {}
  const 当前职业的所有秘籍信息 = 获取当前职业的所有秘籍信息()

  const dispatch = useAppDispatch()
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 当前秒伤 = 当前计算结果?.秒伤 || 0

  // 打开抽屉时记录基准秒伤，修改秘籍后与最新秒伤做红绿对比；用 ref 取最新值避免 effect 依赖秒伤
  const [打开时秒伤, 设置打开时秒伤] = useState<number>(0)
  const 当前秒伤引用 = useRef<number>(0)
  当前秒伤引用.current = 当前秒伤
  useEffect(() => {
    if (open) {
      设置打开时秒伤(当前秒伤引用.current)
    }
  }, [open])

  const 基准秒伤 = 打开时秒伤 || 当前秒伤
  const 秒伤已变化 = !!基准秒伤 && !!当前秒伤 && 当前秒伤 !== 基准秒伤
  const 秒伤增加 = 当前秒伤 > 基准秒伤
  const 秒伤变化率 = 秒伤已变化 ? ((当前秒伤 - 基准秒伤) / 基准秒伤) * 100 : 0

  const 当前秘籍信息 = value || useAppSelector((state) => state?.data?.当前秘籍信息)

  const { 心法所属端 } = use心法数据()
  const 是否无界 = 心法所属端 === '无界'
  const 秘籍上限 = 是否无界 ? 1 : 4

  const 选择秘籍 = (新秘籍列表: string[], 技能信息: 技能秘籍信息) => {
    if (新秘籍列表?.length > 秘籍上限) {
      message.error(是否无界 ? '无界秘籍最多选择一本' : '一个技能最多选择四个秘籍')
      return
    }
    const newData = {
      ...当前秘籍信息,
      [技能信息?.技能名称]: 新秘籍列表,
    }
    if (onChange) {
      onChange(newData)
    } else {
      dispatch(更新角色数据({ 数据: newData, 属性: '当前秘籍信息' }))
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
    }
  }

  const 秘籍名称显示 = (技能名称, 秘籍) => {
    if (秘籍?.includes('减CD')) {
      const 减CD秒数 = 秘籍?.split('_')?.[1]
      return `减CD${减CD秒数}秒`
    } else if (秘籍?.includes('减读条')) {
      const 减CD秒数 = 秘籍?.split('_')?.[1]
      return `减读条${减CD秒数}秒`
    } else if (秘籍?.includes('持续时间')) {
      const 减CD秒数 = 秘籍?.split('_')?.[1]
      return `持续时间${减CD秒数}秒`
    } else if (技能名称 === '战八方') {
      return 秘籍?.replace(/_\d+$/, '')
    } else {
      return 秘籍
    }
  }

  return (
    <Drawer
      title={
        <div className={'miji-drawer-title'}>
          <span>秘籍设置</span>
          {显示秒伤对比 && 基准秒伤 ? (
            <span className={'miji-drawer-dps'}>
              <span className={'miji-drawer-dps-label'}>秒伤</span>
              <span>{基准秒伤}</span>
              {秒伤已变化 ? (
                <>
                  <span className={'miji-drawer-dps-arrow'}>→</span>
                  <span className={秒伤增加 ? 'dps-up-color' : 'dps-low-color'}>{当前秒伤}</span>
                  <span
                    className={`miji-drawer-dps-percent ${
                      秒伤增加 ? 'dps-up-color' : 'dps-low-color'
                    }`}
                  >
                    {秒伤增加 ? '+' : ''}
                    {秒伤变化率.toFixed(2)}%
                  </span>
                </>
              ) : null}
            </span>
          ) : null}
        </div>
      }
      zIndex={zIndex}
      width={500}
      open={open}
      maskClosable={true}
      placement='left'
      onClose={() => {
        onClose()
      }}
    >
      {当前职业的所有秘籍信息.map((技能) => {
        return (
          <div className={'miji-selected-item'} key={技能.技能名称}>
            <h1 className={'miji-skill-title'}>{技能.技能名称}</h1>
            <Checkbox.Group
              value={当前秘籍信息?.[技能?.技能名称] || []}
              onChange={(新秘籍列表) => 选择秘籍(新秘籍列表 as string[], 技能)}
            >
              <Row>
                {技能.技能秘籍列表.map((秘籍) => {
                  return (
                    <Col key={`${技能?.技能名称}${秘籍}`} span={8}>
                      <Checkbox value={秘籍}>{秘籍名称显示(技能.技能名称, 秘籍)}</Checkbox>
                    </Col>
                  )
                })}
              </Row>
            </Checkbox.Group>
          </div>
        )
      })}
    </Drawer>
  )
}

export default 秘籍选择抽屉
