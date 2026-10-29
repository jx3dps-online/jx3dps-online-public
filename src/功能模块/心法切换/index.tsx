import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { use心法数据 } from '@/心法模块/心法上下文'
import { useAppSelector } from '@/hooks'
import 心法切换弹窗 from './心法切换弹窗'

import './index.css'

function 心法切换() {
  const navigate = useNavigate()
  const 当前数据 = use心法数据()
  const 新手引导流程状态 = useAppSelector((state) => state.system.新手引导流程状态)
  const 点击心法图标行为 = useAppSelector(
    (state) => state.system.网页设置?.行为偏好?.点击心法图标行为,
  )
  const 当前Logo = 当前数据?.系统配置?.心法图标
  const [心法切换弹窗展示, 设置心法切换弹窗展示] = useState(false)

  return (
    <div className='school-switch'>
      {/* <Dropdown overlay={menu} disabled={新手引导流程状态}> */}
      <img
        id='Guide_16'
        src={当前Logo}
        className='school-switch-img'
        onClick={() => {
          if (新手引导流程状态) {
            return
          }
          if (点击心法图标行为 === '快速切换') {
            设置心法切换弹窗展示(true)
          } else {
            // 回到首页，让用户去首页切换心法
            navigate('/')
          }
        }}
      />
      <心法切换弹窗 open={心法切换弹窗展示} onCancel={() => 设置心法切换弹窗展示(false)} />
      {/* </Dropdown> */}
      {/* {当前数据?.心法所属端 === '无界' ? <div className='school-switch-wujie-bg' /> : null} */}
    </div>
  )
}

export default 心法切换
