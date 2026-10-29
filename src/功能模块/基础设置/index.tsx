import React from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Checkbox, Tooltip } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 更新特殊配置 } from '@/store/data'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import classNames from 'classnames'

import 角色选择 from './公用设置/角色选择'
import 目标选择 from './公用设置/目标选择'
import 循环选择 from './公用设置/循环选择'
import 延迟选择 from './公用设置/延迟选择'
import 秘籍选择 from './公用设置/秘籍选择'
import 奇穴选择 from './公用设置/奇穴选择'
import 循环模拟 from './公用设置/循环模拟'
import 面板信息 from './面板信息'
import 属性录入 from './属性录入'
import 配装器入口 from './属性录入/配装器入口'
import 增益详情入口 from './增益详情入口'
import 增益面板 from './增益面板'

import './index.css'

function 基础设置() {
  const dispatch = useAppDispatch()
  const { 名称 } = use心法数据()
  const 特殊配置 = useAppSelector((state) => state.data.特殊配置)
  const 增益面板显示状态 = useAppSelector((state) => state?.system?.增益面板显示状态)
  const 新手引导流程状态 = useAppSelector((state) => state?.system?.新手引导流程状态)

  const cls = classNames(
    'basic-set-zengyi',
    增益面板显示状态 ? 'basic-set-zengyi-visible' : '',
    新手引导流程状态 ? 'onGuide' : '',
  )

  return (
    <div className={'basic-set'}>
      <div className={'basic-set-info'}>
        <角色选择 />

        <div className={'basic-set-panel'}>
          <面板信息 />
          <配装器入口 />
        </div>

        <div className={'basic-set-ops'}>
          <h1 className={'basic-set-section-title'}>战斗配置</h1>
          <循环选择 id='Guide_预设循环' />
          <目标选择 />
          <延迟选择 />
          <div className={'basic-set-shortcuts'}>
            <秘籍选择 />
            <奇穴选择 />
            <循环模拟 />
          </div>
          {名称 === '傲血战意' && (
            <Tooltip title='仅在木桩模式下忽略撼如雷、破风及灭自伤；开启团队增益后三者均正常计算。保存循环始终保留灭自伤记录'>
              <Checkbox
                className={'basic-set-special-switch'}
                checked={!!特殊配置['忽略撼如雷和破风']}
                onChange={(e) => {
                  dispatch(更新特殊配置({ 键: '忽略撼如雷和破风', 值: e.target.checked }))
                  dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
                }}
              >
                木桩忽略撼如雷、破风及灭自伤
              </Checkbox>
            </Tooltip>
          )}
          <div className={'basic-set-btns'}>
            <增益详情入口 />
          </div>
          {/* <a
            href='https://docs.qq.com/form/page/DZFdVeWFITkNodEJB'
            target='_blank'
            style={{ textAlign: 'center', marginRight: 12 }}
          >
            点击进行反馈
          </a> */}
          <属性录入 />
        </div>
      </div>
      <div className={cls}>{<增益面板 />}</div>
    </div>
  )
}

export default 基础设置
