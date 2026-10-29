import React from 'react'
import { 装备增益类型 } from '@/@types/装备'
import 装备增益展示信息 from './装备增益展示信息'
import './index.css'

function 装备增益展示({ 装备增益 }: { 装备增益: 装备增益类型 }) {
  const 展示增益 = Object.keys(装备增益 || {}).filter(
    (item) => !item.includes('大附魔') && !item.includes('郭氏') && !!装备增益[item],
  )
  return 展示增益.length ? (
    <div className={'zhuangbei-zengyi-wrapper'}>
      <div className='zhuangbei-zengyi-content'>
        {展示增益.map((item) => {
          return <装备增益展示信息 key={item} 增益类型={item} />
        })}
      </div>
    </div>
  ) : null
}

export default 装备增益展示
