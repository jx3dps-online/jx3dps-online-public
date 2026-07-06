import React, { useState } from 'react'
import { Alert, message, Tooltip } from 'antd'
import {
  PieChartOutlined,
  CalendarOutlined,
  AlignLeftOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { 技能伤害详情类型 } from '@/功能模块/基础设置/公用设置/循环模拟/typs'
import 战斗曲线弹窗 from '../../../../通用/通用组件/战斗曲线弹窗'

import { 循环日志数据类型, 模拟信息类型 } from '../../../simulator/type'
import BattleLogModal from './components/BattleLogModal'
import SkillCountModal from './components/SkillCountModal'
import BuffCountModal from './components/BuffCountModal'
import { 当前计算结果类型 } from '@/@types/输出'
import './index.css'

interface DpsResProps {
  日志信息: 循环日志数据类型[]
  模拟信息: 模拟信息类型
  模拟DPS结果: 当前计算结果类型
  模拟函数: (e: any) => any
}

function DpsRes(props: DpsResProps) {
  const { 模拟信息, 日志信息, 模拟DPS结果, 模拟函数 } = props
  // buff分析
  const [buffCountModalOpen, setBuffCountModalOpen] = useState<boolean>(false)

  // 日志log
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false)
  // 技能统计
  const [countModal, setCountModal] = useState<boolean>(false)

  // 战斗曲线弹窗
  const [战斗曲线弹窗展示, 设置战斗曲线弹窗展示] = useState<boolean>(false)
  const [技能伤害详情数据, 设置技能伤害详情数据] = useState<技能伤害详情类型[]>([])

  const 打开战斗曲线弹窗 = (open) => {
    if (open) {
      const res = 模拟函数({ 实时计算: true, 更新展示: false })
      if (res?.技能伤害详情数据?.length) {
        设置技能伤害详情数据(res?.技能伤害详情数据)
        设置战斗曲线弹窗展示(true)
      } else {
        message.error('获取战斗曲线失败')
      }
    } else {
      设置技能伤害详情数据([])
      设置战斗曲线弹窗展示(false)
    }
  }

  return (
    <div
      className={`cycle-bar-dps-res ${
        模拟信息?.循环执行结果 === '异常' ? 'cycle-bar-dps-res-error' : ''
      }`}
    >
      {模拟信息?.循环执行结果 === '异常' ? (
        <div className={'cycle-dps-res-error'}>
          <h1 className={'cycle-dps-res-error-title'}>循环异常</h1>
          <Alert
            type='error'
            showIcon
            message={`异常信息：${模拟信息?.循环异常信息?.异常信息?.信息}`}
          />
        </div>
      ) : 模拟DPS结果?.秒伤 ? (
        <div className={'cycle-dps-res-success'}>
          <div className={'cycle-dps-res-success-content'}>
            <h1 className={'cycle-dps-res-num'}>{模拟DPS结果?.秒伤}</h1>
            <div className={'cycle-dps-res-success-text-content'}>
              <div>
                <span className={'cycle-dps-res-success-text'}>战斗用时</span>
                <span className={'cycle-dps-res-success-text cycle-dps-res-success-highlight'}>
                  {模拟DPS结果?.秒伤计算时间}秒
                </span>
              </div>
              <div className={'cycle-dps-res-icons'}>
                <Tooltip title='Buff分析' placement='left'>
                  <PieChartOutlined
                    className={'cycle-dps-res-icon'}
                    onClick={() => setBuffCountModalOpen(true)}
                  />
                </Tooltip>
                <Tooltip title='战斗日志' placement='left'>
                  <CalendarOutlined
                    className={'cycle-dps-res-icon'}
                    onClick={() => setLogModalOpen(true)}
                  />
                </Tooltip>
                <Tooltip title='技能统计' placement='left'>
                  <AlignLeftOutlined
                    className={'cycle-dps-res-icon'}
                    onClick={() => setCountModal(true)}
                  />
                </Tooltip>
                <Tooltip title='战斗曲线' placement='left'>
                  <LineChartOutlined
                    className={'cycle-dps-res-icon'}
                    onClick={() => 打开战斗曲线弹窗(true)}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {/* dps结果 */}
      {/* <DpsResModal open={dpsModal} onCancel={() => setDpsModal(false)} 日志信息={日志信息} /> */}
      {/* 战斗日志 */}
      <BattleLogModal
        open={logModalOpen}
        onCancel={() => setLogModalOpen(false)}
        日志信息={日志信息}
      />
      {/* 技能统计 */}
      <SkillCountModal
        open={countModal}
        onCancel={() => setCountModal(false)}
        dpsList={模拟DPS结果?.计算结果技能列表}
        total={模拟DPS结果?.总伤}
        日志信息={日志信息}
      />
      {/* Buff分析 */}
      {buffCountModalOpen && (
        <BuffCountModal
          open={buffCountModalOpen}
          onCancel={() => setBuffCountModalOpen(false)}
          日志={日志信息}
          总战斗用时={模拟信息?.当前时间}
        />
      )}
      {/* 战斗曲线弹窗 */}
      {战斗曲线弹窗展示 && (
        <战斗曲线弹窗
          open={战斗曲线弹窗展示}
          onCancel={() => 打开战斗曲线弹窗(false)}
          技能伤害详情数据={技能伤害详情数据}
        />
      )}
    </div>
  )
}

export default DpsRes
