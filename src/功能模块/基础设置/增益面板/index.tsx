import { useAppDispatch, useAppSelector } from '@/hooks'
import { Button, Checkbox, Dropdown, Menu, Tooltip } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 更新角色数据, 更新团队增益, 更新增益启用 } from '@/store/data'
import { 更新增益面板显示状态 } from '@/store/system'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import type { 团队增益选项数据类型 } from '@/@types/团队增益'

import 团队增益选择 from './团队增益选择'
import 小药小吃选择 from './小药小吃选择'
import 阵眼选择 from './阵眼选择'
import 计算最佳增益 from './计算最佳增益'
import './index.css'
import styles from './index.module.less'

function 增益面板() {
  const { 默认数据 = {} } = use心法数据()
  const { 增益快捷设置数据 = [] } = 默认数据
  const dispatch = useAppDispatch()
  const 增益数据 = useAppSelector((state) => state.data.增益数据)
  const 增益启用 = useAppSelector((state) => state.data.增益启用)
  const 增益面板显示状态 = useAppSelector((state) => state.system.增益面板显示状态)
  const 智能对比默认开启 = useAppSelector(
    (state) => state?.system?.网页设置?.行为偏好?.智能对比默认开启,
  )

  const [开启智能对比, 设置开启智能对比] = useState<boolean>(智能对比默认开启 ?? false)

  useEffect(() => {
    设置开启智能对比(智能对比默认开启 ?? false)
  }, [智能对比默认开启])

  const 保存角色增益 = (阵眼: string, 小吃: string[]) => {
    dispatch(更新角色数据({ 属性: '角色增益', 数据: { 阵眼, 小吃 } }))
    if (增益启用) {
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
    }
  }

  const 保存角色增益数据 = (newData) => {
    保存角色增益(newData?.阵眼 || '', newData?.小吃 || [])
  }

  const 保存团队增益 = (团队增益: 团队增益选项数据类型[]) => {
    dispatch(更新团队增益(团队增益))
    if (增益启用) {
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
    }
  }

  const 修改阵眼数据 = (e) => {
    保存角色增益(e, 增益数据?.小吃 || [])
  }

  const 切换增益启用状态 = (checked) => {
    dispatch(更新增益启用(!!checked))
    dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
  }

  return (
    <div className='zengyi-wrapper' id='Guide_13'>
      {增益面板显示状态 && (
        <button
          type='button'
          className={styles.收起按钮}
          id='Guide_增益收起'
          aria-label='收起增益设置'
          title='收起增益设置'
          onClick={() => dispatch(更新增益面板显示状态(false))}
        >
          <LeftOutlined />
        </button>
      )}
      <h1 className='zengyi-title'>
        <div className='zengyi-title-text'>
          角色增益
          {增益快捷设置数据?.length ? (
            <Dropdown
              overlay={
                <Menu>
                  {增益快捷设置数据.map((item) => {
                    return (
                      <Menu.Item
                        key={item?.快捷名称}
                        onClick={() => 保存角色增益(item?.阵眼 || '', item?.小吃 || [])}
                      >
                        {item?.快捷名称}
                      </Menu.Item>
                    )
                  })}
                </Menu>
              }
              placement='topLeft'
            >
              <Button danger style={{ margin: '0 12px' }} size='small'>
                快捷设置
              </Button>
            </Dropdown>
          ) : null}
          <计算最佳增益 保存数据并计算={保存角色增益数据} />
        </div>
        <div className={'zengyi-operator'}>
          <Checkbox
            className='zengyi-operator-checkbox'
            checked={!!开启智能对比}
            onChange={(e) => 设置开启智能对比(e?.target?.checked)}
          >
            <Tooltip title='对阵眼、小药做智能dps对比，仅在增益效果启用情况下生效，开启将增加性能损耗'>
              对比
            </Tooltip>
          </Checkbox>
          <span id='Guide_14'>
            <Checkbox
              className='zengyi-operator-checkbox'
              checked={!!增益启用}
              onChange={(e) => 切换增益启用状态(e?.target?.checked)}
            >
              启用增益
            </Checkbox>
          </span>
        </div>
      </h1>
      <阵眼选择
        value={增益数据?.阵眼 || undefined}
        开启智能对比={开启智能对比}
        onChange={修改阵眼数据}
      />
      <小药小吃选择 保存数据并计算={保存角色增益数据} 开启智能对比={开启智能对比} />
      <团队增益选择 保存数据并计算={(newData) => 保存团队增益(newData?.团队增益 || [])} />
    </div>
  )
}

export default React.memo(增益面板)
