import React from 'react'
import 当前版本 from './当前版本'
import { use心法数据 } from '@/心法模块/心法上下文'
import { Tooltip } from 'antd'
import styles from './index.module.less'
import './index.css'

function 顶部说明() {
  const { 模块负责人, 数据提供 } = use心法数据()
  return (
    <>
      <h1 className={'title-tip'}>
        <span className={styles.label}>模块负责人：{模块负责人 || '-'}；</span>
        {数据提供}
        <span className='service-tip'>
          ；服务支持：
          <Tooltip
            title={
              <div>
                欢迎大家体验使用可乐开发的工具
                <p>
                  <a href='https://j3.btcsg.top/' target='_blank' rel='noreferrer'>
                    废牛库存&剑三记账本
                  </a>
                </p>
              </div>
            }
          >
            {`可乐 `}
          </Tooltip>
          蓝团
        </span>
      </h1>
      <当前版本 />
    </>
  )
}

export default 顶部说明
