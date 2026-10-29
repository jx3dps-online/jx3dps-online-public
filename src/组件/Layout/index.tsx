import React, { memo, useEffect, useMemo, useState } from 'react'
import { Alert } from 'antd'
import { jwtDecode } from 'jwt-decode'
import { useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import 黑名单邀请码 from '@/数据/静态数据/邀请码/黑名单.json'
import { hexToRgbaToDark } from '@/工具函数/help'
import { 使用背景图地址 } from '@/工具函数/本地背景图'
import { 校准背景图选择 } from '@/功能模块/系统工具/网页设置/背景图设置/校准背景图选择'
import useQuery from '@/hooks/use-query'

import { 默认系统渐变色 } from './default'
import './index.css'
import styles from './index.module.less'
import { createWatermark, WatermarkOptions } from './utils'

interface LayoutProps {
  children: any
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { children } = props
  const { 系统配置 = {} as any, 邀请使用, 简写 } = use心法数据()
  const 背景色渐变 = 系统配置?.背景色渐变 || 默认系统渐变色(系统配置?.主题色)
  const 背景图片显示状态 = useAppSelector((state) => state?.system?.背景图片显示状态)
  const 配装器弹窗显示状态 = useAppSelector((state) => state.system.配装器弹窗显示状态)
  const 背景图选择 = useAppSelector((state) => state?.system?.背景图选择)
  const 自定义背景图 = useAppSelector((state) => state?.system?.自定义背景图)

  const urlCode = useQuery('code')

  const 背景图 = 系统配置.背景图

  const 展示背景图 = useMemo(() => {
    const 候选列表 = 校准背景图选择(背景图选择 || [], [...背景图, ...(自定义背景图 || [])])
    return getRandomFromArray(候选列表, 候选列表?.length)
  }, [背景图选择, 自定义背景图, 背景图])

  const 展示背景图地址 = 使用背景图地址(展示背景图)

  // const [ipAddress, setIpAddress] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  // 来自旧路由跳转的收藏新地址提示
  const [显示收藏提示, set显示收藏提示] = useState(
    () => !!localStorage.getItem('旧路由跳转标记') && !localStorage.getItem('旧路由收藏提示已关闭'),
  )

  const 显示测试环境信息 = useMemo(() => {
    return false
    // return !location?.href?.includes('dps.btcsg.top')
  }, [location])

  useEffect(() => {
    if (urlCode) {
      initInviteCode()
    }
  }, [urlCode])

  // 最终水印展示
  const waterMark = useMemo(() => {
    // return inviteCode || ipAddress
    return inviteCode
  }, [inviteCode])

  const initInviteCode = () => {
    try {
      const code = urlCode || localStorage.getItem('邀请码')
      if (code) {
        const decode = jwtDecode(code) as { 心法: string; 邀请人: string }
        if (decode?.邀请人) {
          const water: WatermarkOptions = {
            text: decode?.邀请人,
            rotate: -15,
            fontSize: 12,
            opacity: 0.04,
            width: 32,
            height: 0.6,
          }
          setInviteCode(createWatermark(water))
        }
      }
    } catch {
      // 忽略错误
    }
  }

  // 获取ip地址
  // async function initIpAddress() {
  //   try {
  //     const response = await fetch('https://ipapi.co/json/')
  //     console.log('response', response)
  //     const data = await response.json()
  //     const address: WatermarkOptions = {
  //       text: data.ip,
  //       rotate: -20,
  //       fontSize: 12,
  //       opacity: 0.03,
  //       width: 50,
  //     }
  //     setIpAddress(createWatermark(address))
  //     return data.ip
  //   } catch (error) {
  //     return null
  //   }
  // }

  // 丛长度为N的数组中随机取一个值
  function getRandomFromArray(arr, n) {
    const randomIndex = Math.floor(Math.random() * n)
    return arr[randomIndex]
  }

  const 允许访问 = useMemo(() => {
    const hrefDev = location.href?.includes('localhost')
    const DEV = hrefDev
    let 允许访问 = false
    if (邀请使用) {
      允许访问 = DEV
    } else {
      允许访问 = true
    }
    if (!允许访问) {
      // 校验是否是邀请码
      const code = urlCode || localStorage.getItem('邀请码')
      if (code && !(黑名单邀请码 as string[])?.includes(code)) {
        const decode = jwtDecode(code) as { 心法: string; 邀请人: string }
        const 邀请心法列表 = decode?.心法
          ?.split(',')
          .filter((i) => i !== 'bxj')
          .map((i) => {
            if (i === 'fhs') {
              return 'bxj'
            }
            return i
          })
        if (decode?.心法 && 邀请心法列表?.includes(简写)) {
          允许访问 = true
        }
      }
    }
    return 允许访问
  }, [location, 邀请使用])

  const 是否展示迁移公告 = location?.href?.includes?.('jx3.btcsg.top')

  const routerToNew = () => {
    window.open(`https://dps.btcsg.top?xf=${简写}`)
  }

  const 关闭收藏提示 = () => {
    localStorage.removeItem('旧路由跳转标记')
    localStorage.setItem('旧路由收藏提示已关闭', '1')
    set显示收藏提示(false)
  }

  return 允许访问 ? (
    <>
      {waterMark && (
        <div className='watermark-container' style={{ background: `url(${waterMark})` }} />
      )}
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
        {显示收藏提示 ? (
          <Alert
            className='notice-top'
            banner
            closable
            onClose={关闭收藏提示}
            message='网址已升级：您访问的是旧收藏地址，请重新收藏当前浏览器地址栏中的新网址。'
          />
        ) : null}
        {显示测试环境信息 ? (
          <Alert
            className='notice-top'
            banner
            closable
            message={
              <p>
                本环境为测试环境，一切数值均不准确，一切功能均在持续开发中，无法提供配装指导。请重点围绕使用体验、使用功能Bug等问题体验。
                感谢使用和反馈
                <a
                  href='https://docs.qq.com/form/page/DZFdVeWFITkNodEJB'
                  target='_blank'
                  style={{ marginLeft: 12 }}
                >
                  点击进行反馈
                </a>
              </p>
            }
          />
        ) : null}
        <div
          className={`layout-wrapper ${配装器弹窗显示状态 ? styles.背景滚动锁定 : ''}`}
          style={{
            backgroundImage: 背景色渐变,
          }}
        >
          {children}
        </div>
        {背景图片显示状态 ? (
          <img className='layout-bg' src={展示背景图地址} alt='' />
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
