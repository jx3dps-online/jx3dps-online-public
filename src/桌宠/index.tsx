import { use报告引导界面 } from '@/功能模块/新手引导/界面状态'
import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { App, Dropdown, Modal } from 'antd'
import { animated, useTransition } from '@react-spring/web'
import { use心法数据 } from '@/心法模块/心法上下文'
import { useAppDispatch } from '@/hooks'
import {
  切换配装器弹窗显示状态,
  更新增益面板显示状态,
  更新新手引导流程状态,
  更新当前引导步骤,
} from '@/store/system'
import { ClearLocalStorage } from '@/工具函数/tools/log'
import type { 拖拽方向, 桌宠配置, 桌宠状态, 桌宠资源, 问题行为, 懒加载组件 } from './interface'
import 气泡 from './组件/气泡'
import { use状态机 } from './hooks/use状态机'
import { use拖动 } from './hooks/use拖动'
import { 注册行为, 执行行为 as 执行注册行为, 注销行为 } from './工具/行为注册表'
import { 预加载资源组 } from './工具/资源加载'
import { 隐藏存储前缀, 桌宠切换隐藏事件名 } from './工具/隐藏'
import { 解析尺寸为像素, use屏幕宽度, use桌宠尺寸 } from './工具/尺寸'
import type { 桌宠像素尺寸 } from './工具/尺寸'
import styles from './index.module.less'

// 桌宠配置懒加载：显式登记拥有专属桌宠的心法。
// 未登记的心法回退到「默认桌宠」（考拉 DJ），仅展示全局通用问题。
// 使用静态 import()（非动态拼接路径），确保 webpack 能正确追踪 default 导出。
const 桌宠配置加载器: Record<string, () => Promise<{ default: 桌宠配置 }>> = {
  凌海诀: () => import('./心法/凌海诀/配置'),
  无方: () => import('./心法/无方/配置'),
  无方_悟: () => import('./心法/无方_悟/配置'),
  分山劲: () => import('./心法/分山劲/配置'),
  分山劲_悟: () => import('./心法/分山劲_悟/配置'),
  太玄经: () => import('./心法/太玄经/配置'),
  孤锋诀: () => import('./心法/孤锋诀/配置'),
  毒经: () => import('./心法/毒经/配置'),
}

// 默认桌宠：未配置专属桌宠的心法统一使用
const 默认桌宠配置加载器 = () => import('./默认/配置')

const 获取显示资源 = (配置: 桌宠配置, 状态: 桌宠状态, 拖拽方向: 拖拽方向): 桌宠资源 | undefined => {
  if (状态 === '拖拽中') {
    const 方向资源 = 配置.拖拽方向资源?.[拖拽方向]
    if (方向资源) {
      return 方向资源
    }
  }
  const 直接资源 = 配置.状态资源?.[状态]
  if (直接资源) {
    return 直接资源
  }
  if (状态 === '主动交互' && 配置.主动交互?.资源) {
    return 配置.主动交互.资源
  }
  if (状态 === '点击交互' && 配置.点击交互?.资源) {
    return 配置.点击交互.资源
  }
  return 配置.待机资源
}

const 序列帧图片: React.FC<{ 资源: 桌宠资源; 尺寸: 桌宠像素尺寸 }> = ({ 资源, 尺寸 }) => {
  const { 帧 = [], 间隔毫秒 = 100, 循环 = true } = 资源.序列帧 || {}
  const [当前帧, 设置当前帧] = useState(0)

  useEffect(() => {
    if (帧.length <= 1) {
      return
    }
    const 定时器 = setInterval(() => {
      设置当前帧((上一帧) => {
        if (上一帧 + 1 >= 帧.length) {
          return 循环 ? 0 : 上一帧
        }
        return 上一帧 + 1
      })
    }, 间隔毫秒)
    return () => clearInterval(定时器)
  }, [帧, 间隔毫秒, 循环])

  if (!帧.length) {
    return null
  }
  return (
    <img
      src={帧[当前帧]}
      className={styles.petImg}
      width={尺寸.宽}
      height={尺寸.高}
      draggable={false}
      alt='桌宠'
    />
  )
}

const 渲染资源: React.FC<{
  资源?: 桌宠资源
  尺寸: 桌宠像素尺寸
  屏宽: number
  on加载完成: (资源: 桌宠资源) => void
}> = ({ 资源, 尺寸, 屏宽, on加载完成 }) => {
  if (!资源) {
    return null
  }
  const 实际尺寸 = 解析尺寸为像素(资源?.尺寸, 屏宽, 尺寸)
  if (资源?.类型 === '序列帧') {
    return <序列帧图片 资源={资源} 尺寸={实际尺寸} />
  }
  return (
    <img
      src={资源?.资源}
      onLoad={() => on加载完成(资源)}
      className={styles.petImg}
      width={实际尺寸.宽}
      height={实际尺寸.高}
      draggable={false}
      alt='桌宠'
    />
  )
}

interface 桌宠视图参数 {
  配置: 桌宠配置
  名称: string
  主题色: string
  切换隐藏: () => void
}

const 桌宠视图 = ({ 配置, 名称, 主题色, 切换隐藏 }: 桌宠视图参数) => {
  const [弹窗数据, 设置弹窗数据] = useState<{
    标题?: string
    内容?: ReactNode
    内容组件?: 懒加载组件
  } | null>(null)

  const 屏宽 = use屏幕宽度()
  const 基础尺寸 = use桌宠尺寸(屏宽, 配置?.尺寸)
  const [当前拖拽方向, 设置当前拖拽方向] = useState<拖拽方向>('右')

  // 执行行为（弹窗/跳转/自定义）
  const on执行行为 = useCallback((行为: 问题行为) => {
    switch (行为.类型) {
      case '弹窗':
        设置弹窗数据({ 标题: 行为.标题, 内容: 行为.内容, 内容组件: 行为.内容组件 })
        break
      case '跳转':
        if (行为.新窗口) {
          window.open(行为.链接, '_blank')
        } else {
          window.location.href = 行为.链接
        }
        break
      case '自定义':
        执行注册行为(行为.名称, 行为.参数)
        break
    }
  }, [])

  const {
    当前状态,
    覆盖资源,
    动画加载完成,
    气泡数据,
    点击桌宠,
    关闭气泡,
    选择问题,
    开始拖拽,
    结束拖拽,
  } = use状态机({
    配置,
    名称,
    on执行行为,
  })

  use报告引导界面(
    '桌宠问题状态',
    气泡数据?.类型 === '问题列表' || 气泡数据?.类型 === '答案' ? 气泡数据.类型 : '关闭',
  )
  const 处理点击 = useCallback(() => {
    if (当前状态 === '点击交互') {
      关闭气泡()
    } else {
      点击桌宠()
    }
  }, [当前状态, 关闭气泡, 点击桌宠])

  const 当前资源 = 覆盖资源 || 获取显示资源(配置, 当前状态, 当前拖拽方向)
  const 尺寸 = use桌宠尺寸(屏宽, 当前资源?.尺寸, 配置?.尺寸)

  const { 位置, onPointerDown } = use拖动({
    心法: 名称,
    尺寸: 基础尺寸,
    默认位置: 配置?.默认位置,
    启用: true,
    on拖动开始: 开始拖拽,
    on拖动结束: 结束拖拽,
    on拖拽方向变化: 设置当前拖拽方向,
    on点击: 处理点击,
  })

  // 预加载常用资源
  useEffect(() => {
    预加载资源组([
      获取显示资源(配置, '待机', 当前拖拽方向)?.资源,
      获取显示资源(配置, '主动交互', 当前拖拽方向)?.资源,
      获取显示资源(配置, '点击交互', 当前拖拽方向)?.资源,
      获取显示资源(配置, '问答交互', 当前拖拽方向)?.资源,
      配置.状态资源?.拖拽中?.资源,
      配置.状态资源?.点击收尾?.资源,
      配置.拖拽方向资源?.左?.资源,
      配置.拖拽方向资源?.右?.资源,
      ...Object.values(配置.拖拽动画 || {}).flatMap((动画) =>
        Object.values(动画).map((资源) => 资源.资源),
      ),
    ])
  }, [配置, 当前拖拽方向])

  // 状态切换交叉淡入淡出
  const transitions = useTransition([{ 状态: 当前状态, 资源: 当前资源 }], {
    keys: (item) => `${item.状态}-${item.资源?.资源 ?? ''}`,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 配置.拖拽动画 && 覆盖资源 ? 0 : 220 },
  })

  const 弹窗内容组件 = useMemo(() => {
    if (!弹窗数据?.内容组件) {
      return null
    }
    return React.lazy(弹窗数据.内容组件)
  }, [弹窗数据])

  const 气泡Ref = useRef<HTMLDivElement>(null)
  const [气泡位置, 设置气泡位置] = useState<{
    朝向: '上' | '下'
    箭头偏移X: number
    样式: CSSProperties
  }>({ 朝向: '下', 箭头偏移X: 0, 样式: {} })

  // 根据桌宠位置与气泡尺寸，确保气泡完整显示在屏幕内
  useLayoutEffect(() => {
    if (!气泡数据) {
      return
    }
    const 元素 = 气泡Ref.current
    if (!元素) {
      return
    }
    const 更新气泡位置 = () => {
      const 气泡宽 = 元素.offsetWidth
      const 气泡高 = 元素.offsetHeight
      const 间距 = 12
      const 屏幕边距 = 8
      const 视口宽 = window.innerWidth

      // 上方空间不足时，改为显示在桌宠下方
      const 显示在下方 = 位置.y < 气泡高 + 间距 + 屏幕边距

      const 桌宠中心X = 位置.x + 尺寸.宽 / 2
      const 左最大 = Math.max(屏幕边距, 视口宽 - 气泡宽 - 屏幕边距)
      const 气泡左 = Math.max(屏幕边距, Math.min(桌宠中心X - 气泡宽 / 2, 左最大))
      const 箭头偏移X = 桌宠中心X - (气泡左 + 气泡宽 / 2)

      设置气泡位置({
        朝向: 显示在下方 ? '上' : '下',
        箭头偏移X,
        样式: 显示在下方
          ? { top: 尺寸.高 + 间距, left: 气泡左 - 位置.x }
          : { bottom: '100%', marginBottom: 间距, left: 气泡左 - 位置.x },
      })
    }
    更新气泡位置()
    const 观察器 = new ResizeObserver(更新气泡位置)
    观察器.observe(元素)
    return () => 观察器.disconnect()
  }, [气泡数据, 位置, 尺寸])

  return createPortal(
    <>
      <div id='Guide_桌宠' className={styles.petContainer} style={{ left: 位置.x, top: 位置.y }}>
        {气泡数据 && (
          <div className={styles.bubbleWrap} style={气泡位置.样式} ref={气泡Ref}>
            <气泡
              气泡数据={气泡数据}
              宽={配置.气泡?.宽}
              主题色={主题色}
              朝向={气泡位置.朝向}
              箭头偏移X={气泡位置.箭头偏移X}
              on选择问题={选择问题}
              on返回问题列表={点击桌宠}
              on关闭={关闭气泡}
            />
          </div>
        )}
        <Dropdown
          trigger={['contextMenu']}
          overlayStyle={{ zIndex: 1000000000 }}
          menu={{
            items: [
              {
                key: '隐藏桌宠',
                label: '隐藏桌宠',
                onClick: 切换隐藏,
              },
            ],
          }}
        >
          <div
            className={styles.petWrap}
            style={{ width: 尺寸.宽, height: 尺寸.高 }}
            onPointerDown={onPointerDown}
          >
            {transitions((弹簧, { 资源 }) => (
              <animated.div style={{ ...弹簧, position: 'absolute', inset: 0 }}>
                <渲染资源 资源={资源} 尺寸={尺寸} 屏宽={屏宽} on加载完成={动画加载完成} />
              </animated.div>
            ))}
          </div>
        </Dropdown>
      </div>

      <Modal
        open={!!弹窗数据}
        title={弹窗数据?.标题}
        footer={null}
        onCancel={() => 设置弹窗数据(null)}
      >
        {弹窗内容组件 ? (
          <Suspense fallback={null}>
            <弹窗内容组件 />
          </Suspense>
        ) : (
          弹窗数据?.内容
        )}
      </Modal>
    </>,
    document.body,
  )
}

const 桌宠 = () => {
  const dispatch = useAppDispatch()
  const { modal } = App.useApp()
  const { 名称, 系统配置 = {} as any } = use心法数据()

  const [配置, 设置配置] = useState<桌宠配置 | null>(null)
  const [是否隐藏, 设置是否隐藏] = useState(() => {
    try {
      return localStorage.getItem(`${隐藏存储前缀}${名称}`) === '1'
    } catch {
      return false
    }
  })

  use报告引导界面('桌宠挂载', true)
  use报告引导界面('桌宠可用', !!配置)
  use报告引导界面('桌宠显示', !!配置 && !是否隐藏)

  // 切心法后重新读取当前心法的隐藏状态
  useEffect(() => {
    try {
      设置是否隐藏(localStorage.getItem(`${隐藏存储前缀}${名称}`) === '1')
    } catch {
      设置是否隐藏(false)
    }
  }, [名称])

  // 懒加载当前心法桌宠配置；未配置专属桌宠的心法回退到默认桌宠
  useEffect(() => {
    const 加载器 = 桌宠配置加载器[名称] || 默认桌宠配置加载器
    let 已取消 = false
    加载器()
      .then((模块) => {
        if (!已取消) {
          设置配置(模块?.default || null)
        }
      })
      .catch(() => {
        if (!已取消) {
          设置配置(null)
        }
      })
    return () => {
      已取消 = true
    }
  }, [名称])

  // 注册内置行为
  useEffect(() => {
    注册行为('打开配装器', () => {
      dispatch(切换配装器弹窗显示状态(true))
    })
    注册行为('打开增益详情', () => {
      dispatch(更新增益面板显示状态(true))
    })
    注册行为('开启新手引导', () => {
      dispatch(更新新手引导流程状态(true))
      dispatch(更新当前引导步骤(0))
    })
    注册行为('清除缓存', () => {
      modal.confirm({
        title: '清除缓存将清空你的配装、增益等设置',
        content: '仅作为计算数据异常、页面异常时使用。',
        onOk: () => ClearLocalStorage(),
      })
    })
    return () => {
      注销行为('打开配装器')
      注销行为('打开增益详情')
      注销行为('开启新手引导')
      注销行为('清除缓存')
    }
  }, [dispatch, modal])

  const 切换隐藏 = useCallback(() => {
    设置是否隐藏((当前) => {
      const 目标 = !当前
      try {
        localStorage.setItem(`${隐藏存储前缀}${名称}`, 目标 ? '1' : '0')
      } catch {
        // 忽略
      }
      return 目标
    })
  }, [名称])

  // 响应外部（右下角工具等）触发的隐藏/显示桌宠
  useEffect(() => {
    window.addEventListener(桌宠切换隐藏事件名, 切换隐藏)
    return () => window.removeEventListener(桌宠切换隐藏事件名, 切换隐藏)
  }, [切换隐藏])

  // 配置加载失败时不展示
  if (!配置) {
    return null
  }

  if (是否隐藏) {
    return null
  }

  const 主题色 = 配置?.气泡?.主题色 || 系统配置?.主题色 || '#dca53e'

  return <桌宠视图 配置={配置} 名称={名称} 主题色={主题色} 切换隐藏={切换隐藏} />
}

export default 桌宠
