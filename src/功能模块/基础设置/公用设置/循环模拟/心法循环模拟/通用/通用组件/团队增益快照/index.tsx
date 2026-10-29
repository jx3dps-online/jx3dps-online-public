import React, { useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Divider, Dropdown, Switch, Tooltip } from 'antd'
import { DownOutlined, EditOutlined, CloseCircleFilled } from '@ant-design/icons'
import { useAppSelector } from '@/hooks'
import CycleSimulatorContext from '@/功能模块/基础设置/公用设置/循环模拟/context'
import 团队增益图标 from './团队增益图标'
import 副本事件编辑器 from '../副本事件编辑器'
import 事件定义原始 from '../副本事件编辑器/事件定义.json'
import { 副本事件定义类型 } from '@/@types/副本事件'
import { 曲线数据点 } from '../战斗曲线弹窗/use战斗曲线'
import './index.css'

const 事件定义列表 = 事件定义原始 as 副本事件定义类型[]

interface 团队增益快照类型 {
  启用: boolean
  设置是否启用: (e: boolean) => void
  当前时间: number // 当前时间 用于buff的展示
  高亮团队快照: string[]
  更新高亮团队快照: (e: string[]) => void
  默认总时间?: number // 当前循环战斗时长（帧）
  战斗曲线数据?: 曲线数据点[]
  on生成战斗曲线?: () => void
}

const 团队增益快照: React.FC<团队增益快照类型> = (props) => {
  const {
    启用,
    设置是否启用,
    当前时间,
    高亮团队快照,
    更新高亮团队快照,
    默认总时间,
    战斗曲线数据,
    on生成战斗曲线,
  } = props
  const {
    当前副本事件方案名称,
    更新当前副本事件方案名称,
    当前副本事件方案,
    副本事件编辑器展示,
    更新副本事件编辑器展示,
    团队快照容器,
  } = useContext(CycleSimulatorContext)
  const 方案列表 = useAppSelector((state) => state?.data?.副本事件方案列表)
  const [下拉展示, 设置下拉展示] = useState<boolean>(false)

  const 当前方案 = 当前副本事件方案

  // 当前方案内出现的事件名称（去重）
  const 事件名称列表 = useMemo(() => {
    const set = new Set<string>()
    ;(当前方案?.事件实例列表 || []).forEach((实例) => {
      if (实例?.事件名称) {
        set.add(实例.事件名称)
      }
    })
    return Array.from(set)
  }, [当前方案?.事件实例列表])

  const handleChangeHightlight = (事件名称) => {
    const newArray = [...高亮团队快照]
    if (newArray.includes(事件名称)) {
      const index = newArray.indexOf(事件名称)
      if (index > -1) {
        newArray.splice(index, 1)
      }
    } else {
      newArray.push(事件名称)
    }
    更新高亮团队快照(newArray)
  }

  const 设置启用 = (e) => {
    设置是否启用(e)
    if (!e) {
      更新高亮团队快照([])
    }
  }

  const 获取图标 = (事件名称) => {
    return 事件定义列表?.find((item) => item?.事件名称 === 事件名称)?.图标
  }

  const 下拉内容 = (
    <div className='cycle-simulator-event-dropdown'>
      <div className='cycle-simulator-event-dropdown-row'>
        <span>启用团队增益快照</span>
        <Switch size='small' checked={启用} onChange={设置启用} />
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div className='cycle-simulator-event-dropdown-label'>副本事件方案</div>
      {(方案列表 || []).map((方案) => (
        <div
          key={方案.方案名称}
          className={`cycle-simulator-event-dropdown-item ${
            方案.方案名称 === 当前副本事件方案名称
              ? 'cycle-simulator-event-dropdown-item-active'
              : ''
          }`}
          onClick={() => {
            更新当前副本事件方案名称(方案.方案名称)
            设置下拉展示(false)
          }}
        >
          {方案.方案名称}
        </div>
      ))}
      {(方案列表 || []).length === 0 ? (
        <div className='cycle-simulator-event-dropdown-empty'>暂无方案</div>
      ) : null}
      <Divider style={{ margin: '8px 0' }} />
      <Button
        block
        size='small'
        icon={<EditOutlined />}
        onClick={() => {
          更新副本事件编辑器展示(true)
          设置下拉展示(false)
        }}
      >
        编辑副本事件轴
      </Button>
    </div>
  )

  return (
    <div className='cycle-simulator-event-control'>
      <Dropdown
        open={下拉展示}
        onOpenChange={设置下拉展示}
        trigger={['click']}
        dropdownRender={() => 下拉内容}
      >
        <Button size='small' className='cycle-simulator-event-trigger'>
          <span
            className={`cycle-simulator-event-dot ${启用 ? 'cycle-simulator-event-dot-on' : ''}`}
          />
          副本事件{当前方案 ? `·${当前方案.方案名称}` : ''}
          <DownOutlined className='cycle-simulator-event-arrow' />
        </Button>
      </Dropdown>
      {启用 && 事件名称列表?.length && 团队快照容器 ? createPortal(
        <div className='cycle-simulator-team-buff-wrap'>
          {事件名称列表.map((事件名称) => {
            return (
              <Tooltip title={事件名称} key={`快照时间轴${事件名称}`}>
                <div
                  onClick={() => handleChangeHightlight(事件名称)}
                  className={`cycle-simulator-team-buff-img ${
                    高亮团队快照?.includes(事件名称) ? 'cycle-simulator-team-buff-highlight' : ''
                  }`}
                >
                  <团队增益图标
                    实例列表={当前方案?.事件实例列表 || []}
                    图标={获取图标(事件名称) || ''}
                    事件名称={事件名称}
                    当前时间={当前时间}
                  />
                  <div className='cycle-simulator-team-buff-highlight-border' />
                </div>
              </Tooltip>
            )
          })}
          <CloseCircleFilled
            className='cycle-simulator-team-buff-icon'
            onClick={() => 设置启用(false)}
          />
        </div>,
        团队快照容器,
      ) : null}
      <副本事件编辑器
        open={副本事件编辑器展示}
        onCancel={() => 更新副本事件编辑器展示(false)}
        默认总时间={默认总时间}
        战斗曲线数据={战斗曲线数据}
        on生成战斗曲线={on生成战斗曲线}
      />
    </div>
  )
}

export default React.memo(团队增益快照)
