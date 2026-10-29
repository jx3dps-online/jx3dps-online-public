import React, { useEffect, useRef, useState } from 'react'
import { Dropdown } from 'antd'
import use移动端 from '@/hooks/use移动端'
import generateSimpleFingerprint from '@/工具函数/fingerprint'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './index.module.less'
import PixelHover from './PixelHover'
import type { PixelHoverHandle } from './PixelHover'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import { 读取收藏门派, 写入收藏门派 } from '@/工具函数/收藏心法'
import { 简写转心法名 } from '@/心法模块/模块工具/获取心法数据'

const logo = 'https://cdn.arkwish.com/jx3dps/home/logo_20260906_074.png'

const App: React.FC = () => {
  const navigate = useNavigate()
  const 移动端 = use移动端()
  const [searchParams] = useSearchParams()
  const urlXf = searchParams.get('xf')
  const pixelHoverRef = useRef<PixelHoverHandle>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const [入场已开始, 设置入场已开始] = useState(false)
  const [入场已结束, 设置入场已结束] = useState(false)
  const [切出中, 设置切出中] = useState(false)
  const 切出锁 = useRef(false)

  const 开始入场动画 = () => {
    设置入场已开始(true)
  }

  useEffect(() => {
    if (logoRef.current?.complete) {
      开始入场动画()
    }
  }, [])

  // 顶部心法横条：默认展开，5 秒后自动收起，hover 时展开
  const [横条展开, 设置横条展开] = useState(true)
  const [菜单打开, 设置菜单打开] = useState(false)
  const [收藏门派, 设置收藏门派] = useState<string[]>(读取收藏门派)
  const 横条悬停中 = useRef(false)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!横条悬停中.current) 设置横条展开(false)
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [])

  // 心法图标列表：仅展示非邀请使用心法
  const 所有心法 = Object.values(心法数据).filter((心法: any) => !心法?.邀请使用)
  const 收藏列表 = 收藏门派
    .map((简写) => 所有心法.find((心法: any) => 心法?.简写 === 简写))
    .filter(Boolean)
  const 常规列表 = 所有心法.filter((心法: any) => !收藏门派.includes(心法?.简写))

  const 切换收藏 = (简写: string) => {
    设置收藏门派((当前) => {
      const 下一份 = 当前.includes(简写) ? 当前.filter((项) => 项 !== 简写) : [简写, ...当前]
      写入收藏门派(下一份)
      return 下一份
    })
  }

  // 跳转至计算器内容
  const navigatorDps = (_fingerKey, 指定心法?: string) => {
    if (切出锁.current) return
    const 跳转心法 = 指定心法 || urlXf || localStorage.getItem('最后访问心法') || ''
    const 心法名 = 简写转心法名(跳转心法)
    if (!心法名) return

    切出锁.current = true
    // 保留 code/server/name 等其它 query 参数（xf 已转为 path 参数）
    const params = new URLSearchParams()
    searchParams.forEach((value, key) => {
      if (key !== 'xf') {
        params.set(key, value)
      }
    })
    const queryStr = params.toString()
    设置切出中(true)

    const 加载任务 = import('@/页面/计算器/预加载')
      .then((模块) => 模块.预加载计算器页(心法名))
      .catch((错误) => {
        console.error('预加载计算器页失败', 错误)
      })
    const 过渡任务 =
      pixelHoverRef.current?.切入过渡(跳转心法, logoRef.current?.getBoundingClientRect()) ||
      Promise.resolve()

    void Promise.all([过渡任务, 加载任务]).finally(() => {
      navigate(`/dps/${跳转心法}${queryStr ? `?${queryStr}` : ''}`)
    })
  }

  const 渲染图标 = (心法: any) => {
    const 已收藏 = 收藏门派.includes(心法?.简写)
    if (移动端) {
      return (
        <button
          key={心法.简写}
          className={styles.移动心法}
          onClick={() => navigatorDps(generateSimpleFingerprint(), 心法.简写)}
          disabled={切出中}
          type='button'
        >
          <img src={心法.系统配置.心法图标} alt='' />
          <span>{心法.名称.replace('_悟', '·悟')}</span>
        </button>
      )
    }
    return (
      <span key={心法?.简写} className={styles.iconMenuIconWrap}>
        <Dropdown
          trigger={['contextMenu']}
          overlayStyle={{ zIndex: 20 }}
          onOpenChange={(open) => {
            设置菜单打开(open)
            if (open) 设置横条展开(true)
          }}
          menu={{
            items: [
              {
                key: '收藏',
                label: 已收藏 ? '取消收藏' : '收藏',
                onClick: () => 切换收藏(心法?.简写),
              },
            ],
          }}
        >
          <img
            className={styles.iconMenuIcon}
            src={心法?.系统配置?.心法图标}
            alt={心法?.名称?.replace('_悟', '')}
            title={心法?.名称?.replace('_悟', '')}
            onMouseEnter={() => pixelHoverRef.current?.联动高亮(心法?.简写)}
            onMouseLeave={() => pixelHoverRef.current?.联动清除()}
            onClick={() => navigatorDps(generateSimpleFingerprint(), 心法?.简写)}
          />
        </Dropdown>
      </span>
    )
  }

  return (
    <div className={`${styles.wrapper} ${切出中 ? styles.leaving : ''}`}>
      <div
        className={`${styles.introMask} ${入场已开始 ? styles.introMaskFade : ''} ${
          入场已结束 ? styles.introMaskGone : ''
        }`}
        onAnimationEnd={() => 设置入场已结束(true)}
      />
      <img
        ref={logoRef}
        src={logo}
        className={`${styles.logo} ${入场已开始 ? styles.logoIntro : ''} ${
          入场已结束 ? styles.logoSettled : ''
        }`}
        onLoad={开始入场动画}
      />
      {/* <div className={styles.hint}>点击门派立绘也可进入</div> */}
      <div
        className={`${styles.iconMenu} ${横条展开 ? styles.iconMenuOpen : ''}`}
        data-心法图标栏=''
        onMouseEnter={() => {
          横条悬停中.current = true
          设置横条展开(true)
        }}
        onMouseLeave={() => {
          横条悬停中.current = false
          if (!菜单打开) 设置横条展开(false)
        }}
      >
        <div className={styles.iconMenuArrow} />
        <div className={styles.iconMenuPanel}>
          <div className={styles.iconMenuBar}>
            {收藏列表.map((心法: any) => 渲染图标(心法))}
            {!移动端 && 收藏列表.length > 0 && 常规列表.length > 0 ? (
              <div className={styles.iconMenuDivider} />
            ) : null}
            {常规列表.map((心法: any) => 渲染图标(心法))}
          </div>
        </div>
      </div>
      <PixelHover
        ref={pixelHoverRef}
        onNavigate={(目标心法) => navigatorDps(generateSimpleFingerprint(), 目标心法)}
        logoUrl={logo}
      />
    </div>
  )
}

export default App
