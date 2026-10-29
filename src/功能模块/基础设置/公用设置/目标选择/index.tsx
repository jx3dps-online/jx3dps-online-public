import React from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Select } from 'antd'
import { 更新当前输出计算目标名称 } from '@/store/data'
import { 目标集合 } from '@/数据/目标'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import classnames from 'classnames'
import './index.css'

function 目标选择() {
  const dispatch = useAppDispatch()
  const 当前输出计算目标名称 = useAppSelector((state) => state?.data?.当前输出计算目标名称)

  const 切换目标 = (v) => {
    dispatch(更新当前输出计算目标名称(v))
    dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
  }

  return (
    <div className='common-item'>
      <div className='common-content'>
        <Select
          style={{ width: '100%' }}
          value={当前输出计算目标名称}
          onChange={(v) => {
            切换目标(v)
          }}
        >
          {目标集合.map((item) => {
            const cls = classnames(
              'target-select-item-tag',
              item.目标类型 === '试炼' ? 'target-select-item-tag-purple' : '',
              item.目标类型 === '木桩' ? 'target-select-item-tag-orange' : '',
            )
            return (
              <Select.Option value={item?.名称} key={item.名称} label={item.名称}>
                <div className='target-select-item'>
                  {item.名称}
                  <span className={cls}>{item.目标类型}</span>
                </div>
              </Select.Option>
            )
          })}
        </Select>
      </div>
    </div>
  )
}

export default 目标选择
