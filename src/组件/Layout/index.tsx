import React, { memo, useMemo } from 'react'
import { Alert } from 'antd'
import { useAppSelector } from '@/hooks'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { hexToRgbaToDark } from '@/工具函数/help'

import { 默认系统渐变色 } from './default'
import './index.css'

const { 系统配置 = {} as any } = 获取当前数据()

const 背景色渐变 = 系统配置?.背景色渐变 || 默认系统渐变色(系统配置?.主题色)

interface LayoutProps {
  children: any
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { children } = props
  const 背景图片显示状态 = useAppSelector((state) => state?.system?.背景图片显示状态)

  const 背景图 = 系统配置.背景图

  // 丛长度为N的数组中随机取一个值
  function getRandomFromArray(arr, n) {
    const randomIndex = Math.floor(Math.random() * n)
    return arr[randomIndex]
  }

  const 允许访问 = true

  const 是否展示迁移公告 = location?.href?.includes?.('jx3.btcsg.top')

  const routerToNew = () => {
    const { 简写 } = 获取当前数据()
    window.open(`https://dps.btcsg.top?xf=${简写}`)
  }

  return 允许访问 ? (
    <>
      <div className='layout' translate='no'>
        {是否展示迁移公告 ? (
          <Alert
            className='notice-top'
            message={
              <div>
                由于对本站的DDoS攻击仍在继续，我们将启用
                <a onClick={routerToNew}>备用域名</a>。
                并将于2025年4月23日晚19:00起，暂时关闭本域名。请您及时在页面右下角“数据迁移”下载数据备份，在新域名使用“数据迁移”导入数据。
              </div>
            }
            banner
          />
        ) : null}
        <div
          className='layout-wrapper'
          style={{
            backgroundImage: 背景色渐变,
          }}
        >
          {children}
        </div>
        {背景图片显示状态 ? (
          <img className='layout-bg' src={getRandomFromArray(背景图, 背景图?.length)} alt='' />
        ) : (
          <div
            className={'layout-bg-color'}
            style={{
              backgroundColor: `${hexToRgbaToDark(系统配置.主题色, '1', 225)}`,
            }}
          />
        )}
      </div>
    </>
  ) : null
}

export default memo(Layout)
