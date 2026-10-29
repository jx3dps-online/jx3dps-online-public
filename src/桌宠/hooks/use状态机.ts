import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { 全局事件 } from '@/事件'
import type {
  桌宠配置,
  桌宠状态,
  主动交互消息,
  经典问题,
  问题分组,
  问题行为,
  事件响应,
  桌宠资源,
  拖拽动画资源,
} from '../interface'
import { 全局默认问题集 } from '../配置/全局默认问题集'
import { 全局默认事件响应 } from '../配置/全局默认事件响应'
import { 全局默认主动交互消息 } from '../配置/全局默认主动交互消息'

export interface 气泡数据 {
  类型: '主动消息' | '问题列表' | '答案'
  主动消息?: 主动交互消息
  问题列表?: 经典问题[]
  答案?: string
  答案内容?: Extract<问题行为, { 类型: '弹窗' }>
}

interface 状态机参数 {
  配置: 桌宠配置
  名称: string
  on执行行为: (行为: 问题行为) => void
}

const 默认主动展示时长 = 4000
const 默认问答展示时长 = 1500
const 问题分组列表: 问题分组[] = ['入门', '玩法', '配装', '排错', '进阶', '维护']

const 有完整问题元数据 = (
  问题: 经典问题,
): 问题 is 经典问题 & Required<Pick<经典问题, '分组' | '排序'>> =>
  问题分组列表.includes(问题.分组 as 问题分组) && typeof 问题.排序 === 'number'

const 随机取消息 = (消息集: 主动交互消息[]): 主动交互消息 | undefined => {
  if (!消息集?.length) {
    return undefined
  }
  const 总权重 = 消息集.reduce((累加, 消息) => 累加 + (消息.权重 ?? 1), 0)
  let 随机值 = Math.random() * 总权重
  for (const 消息 of 消息集) {
    随机值 -= 消息.权重 ?? 1
    if (随机值 <= 0) {
      return 消息
    }
  }
  return 消息集[消息集.length - 1]
}

const 解析秒 = (配置值?: number | [number, number], 默认秒 = 30): number => {
  if (Array.isArray(配置值)) {
    const [最小, 最大] = 配置值
    return (最小 || 默认秒) + Math.random() * ((最大 || 默认秒) - (最小 || 默认秒))
  }
  return 配置值 ?? 默认秒
}

export const use状态机 = ({ 配置, 名称, on执行行为 }: 状态机参数) => {
  const [当前状态, 设置当前状态] = useState<桌宠状态>('待机')
  const [气泡数据, 设置气泡数据] = useState<气泡数据 | null>(null)
  const [覆盖资源, 设置覆盖资源] = useState<桌宠资源>()
  const 保持问答动作 = useRef(false)
  保持问答动作.current =
    名称 === '太玄经' && (气泡数据?.类型 === '问题列表' || 气泡数据?.类型 === '答案')
  const 拖拽记录 = useRef<{
    动画: 拖拽动画资源
    阶段: '衔接' | '提起' | '待机' | '放下'
    按住: boolean
    恢复状态: '待机' | '点击交互' | '问答交互'
    气泡: 气泡数据 | null
  } | null>(null)
  const 衔接结束时间 = useRef(0)
  const 动画播放 = useRef<{ 资源: 桌宠资源; 完成: () => void; 已开始: boolean } | null>(null)

  const 展示定时器 = useRef<any>(null)
  const 调度定时器 = useRef<any>(null)
  const 拖拽消息定时器 = useRef<ReturnType<typeof setTimeout>[]>([])
  const 冷却记录 = useRef<Record<string, number>>({})
  const 是否已进入调度 = useRef(false)

  // 全部问题集（自身 + 全局默认）。只有全部题目都提供完整元数据时才启用排序，避免改变旧配置顺序。
  const 全部问题集 = useMemo(() => {
    const 自身问题 = 配置.点击交互?.经典问题集 || []
    const 继承全局 = 配置.点击交互?.继承全局问题集 !== false
    const 合并问题集 = 继承全局 ? [...自身问题, ...全局默认问题集] : 自身问题
    if (!合并问题集.every(有完整问题元数据)) {
      return 合并问题集
    }
    return 合并问题集
      .map((问题, 原索引) => ({ 问题, 原索引 }))
      .sort((a, b) => a.问题.排序 - b.问题.排序 || a.原索引 - b.原索引)
      .map(({ 问题 }) => 问题)
  }, [配置])

  // 主动交互消息集（全局默认 + 自身，可按心法关闭全局继承）
  const 主动交互消息集 = useMemo(() => {
    const 继承全局消息 = 配置.主动交互?.继承全局消息 !== false
    return [...(继承全局消息 ? 全局默认主动交互消息 : []), ...(配置.主动交互?.消息集 || [])]
  }, [配置])

  // 事件响应列表（全局默认 + 自身，同名事件以自身配置优先）
  const 事件响应列表 = useMemo(() => {
    const 映射 = new Map<string, 事件响应>()
    ;[...全局默认事件响应, ...(配置.事件响应 || [])].forEach((响应) => {
      映射.set(响应.事件, 响应)
    })
    return [...映射.values()]
  }, [配置])

  // 可用状态：由数据驱动
  const 可用状态 = useMemo(() => {
    const 集合 = new Set<桌宠状态>(['待机', '拖拽中', '隐藏'])
    if (主动交互消息集.length) {
      集合.add('主动交互')
    }
    集合.add('点击交互')
    if (全部问题集.length > 0) {
      集合.add('问答交互')
    }
    return 集合
  }, [主动交互消息集, 全部问题集])

  const 清除展示定时器 = useCallback(() => {
    if (展示定时器.current) {
      clearTimeout(展示定时器.current)
      展示定时器.current = null
    }
  }, [])

  const 清除调度定时器 = useCallback(() => {
    if (调度定时器.current) {
      clearTimeout(调度定时器.current)
      调度定时器.current = null
    }
  }, [])

  const 清除全部定时器 = useCallback(() => {
    清除展示定时器()
    清除调度定时器()
    拖拽消息定时器.current.forEach(clearTimeout)
    拖拽消息定时器.current = []
  }, [清除展示定时器, 清除调度定时器])

  // 展示主动消息
  const 展示主动消息 = useCallback(
    (消息: 主动交互消息) => {
      if (拖拽记录.current || 保持问答动作.current) return
      设置覆盖资源(undefined)
      清除展示定时器()
      设置当前状态('主动交互')
      设置气泡数据({ 类型: '主动消息', 主动消息: 消息 })
      const 主动资源 = 配置.主动交互?.资源 || 配置.状态资源?.主动交互
      const 时长 = 主动资源?.单次时长毫秒 || 默认主动展示时长
      展示定时器.current = setTimeout(() => {
        设置当前状态('待机')
        设置气泡数据(null)
        调度下一次随机()
      }, 时长)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [配置, 清除展示定时器],
  )

  // 调度下一次定时随机主动交互
  const 调度下一次随机 = useCallback(() => {
    清除调度定时器()
    if (!可用状态.has('主动交互')) {
      return
    }
    if (!主动交互消息集.length) {
      return
    }
    const 间隔秒 = 解析秒(配置.主动交互?.定时随机间隔秒, 30)
    调度定时器.current = setTimeout(() => {
      const 消息 = 随机取消息(主动交互消息集)
      if (消息) {
        展示主动消息(消息)
      }
    }, 间隔秒 * 1000)
  }, [配置, 可用状态, 主动交互消息集, 清除调度定时器, 展示主动消息])

  // 进入后延迟（一次性）
  useEffect(() => {
    if (!可用状态.has('主动交互') || 是否已进入调度.current) {
      return
    }
    是否已进入调度.current = true

    const 延迟秒 = 解析秒(配置.主动交互?.进入后延迟秒, 8)
    调度定时器.current = setTimeout(() => {
      const 消息 = 随机取消息(主动交互消息集)
      if (消息) {
        展示主动消息(消息)
      }
    }, 延迟秒 * 1000)

    return () => 清除调度定时器()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [配置, 可用状态])

  // 事件响应订阅
  useEffect(() => {
    const 处理事件响应 = (响应: 事件响应, _载荷?: any) => {
      if (拖拽记录.current) return
      // 冷却检查
      const 现在 = Date.now()
      const 上次 = 冷却记录.current[响应.事件]
      if (上次 && 响应.冷却秒 && 现在 - 上次 < 响应.冷却秒 * 1000) {
        return
      }
      冷却记录.current[响应.事件] = 现在

      if (响应.消息) {
        展示主动消息({ 文本: 响应.消息 })
      }
      if (响应.行为) {
        on执行行为(响应.行为)
      }
    }

    const 取消函数列表 = 事件响应列表.map((响应: 事件响应) => {
      return 全局事件.on(响应.事件, (载荷) => {
        处理事件响应(响应, 载荷)
      })
    })

    return () => {
      取消函数列表.forEach((取消) => 取消())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [事件响应列表, 名称])

  // 点击桌宠 → 点击交互
  const 点击桌宠 = useCallback(() => {
    if (拖拽记录.current) return
    if (!可用状态.has('点击交互')) {
      return
    }
    清除全部定时器()
    if (!保持问答动作.current) {
      设置覆盖资源(undefined)
      衔接结束时间.current = Date.now() + (配置.状态资源?.点击交互?.序列帧?.间隔毫秒 || 0)
      设置当前状态('点击交互')
    }
    设置气泡数据({ 类型: '问题列表', 问题列表: 全部问题集 })
  }, [可用状态, 全部问题集, 清除全部定时器, 配置])

  // 收尾：若配置了「点击收尾」资源则单次播放后回待机，否则直接回待机
  // （问答列表关闭 / 答案气泡自动消失，两条路径共用）
  const 进入收尾或待机 = useCallback(() => {
    设置覆盖资源(undefined)
    设置气泡数据(null)
    const 收尾资源 = 配置.状态资源?.点击收尾
    if (收尾资源?.资源) {
      衔接结束时间.current = Date.now() + (收尾资源.单次时长毫秒 || 默认问答展示时长)
      设置当前状态('点击收尾')
      展示定时器.current = setTimeout(() => {
        设置当前状态('待机')
        调度下一次随机()
      }, 收尾资源.单次时长毫秒 || 默认问答展示时长)
    } else {
      设置当前状态('待机')
      调度下一次随机()
    }
  }, [配置, 调度下一次随机])

  // 关闭气泡 → （若配置了「点击收尾」资源则先播收尾动画）→ 待机
  const 关闭气泡 = useCallback(() => {
    if (拖拽记录.current) return
    清除展示定时器()
    进入收尾或待机()
  }, [清除展示定时器, 进入收尾或待机])

  // 选择问题 → 问答交互 + 执行行为
  const 选择问题 = useCallback(
    (问题: 经典问题) => {
      if (拖拽记录.current) return
      清除展示定时器()
      if (!保持问答动作.current) {
        设置覆盖资源(undefined)
        衔接结束时间.current = 0
        设置当前状态('问答交互')
      }
      if (问题.回答方式 === '气泡' && 问题.行为.类型 === '弹窗') {
        设置气泡数据({ 类型: '答案', 答案: 问题.标题, 答案内容: 问题.行为 })
        return
      }
      if (!保持问答动作.current) 设置气泡数据({ 类型: '答案', 答案: 问题.标题 })
      if (问题.行为) {
        on执行行为(问题.行为.类型 === '弹窗' ? { ...问题.行为, 标题: 问题.标题 } : 问题.行为)
      }
      if (保持问答动作.current) return
      // 问答交互展示时长：优先取资源上的单次时长毫秒，否则用默认 1500ms
      const 问答资源 = 配置.状态资源?.问答交互
      const 时长 = 问答资源?.单次时长毫秒 || 默认问答展示时长
      // 答案气泡自动消失后：与关闭气泡一致，若配置了「点击收尾」则先播收尾动画
      展示定时器.current = setTimeout(进入收尾或待机, 时长)
    },
    [清除展示定时器, on执行行为, 进入收尾或待机, 配置],
  )

  const 播放拖拽阶段 = useCallback(
    function 播放(阶段: '提起' | '待机' | '放下') {
      const 记录 = 拖拽记录.current!
      记录.阶段 = 阶段
      const 资源 = 记录.动画[阶段]
      设置当前状态('拖拽中')
      设置覆盖资源(资源)
      动画播放.current =
        阶段 === '待机'
          ? null
          : {
              资源,
              已开始: false,
              完成: () => {
                if (阶段 === '提起') {
                  播放(记录.按住 ? '待机' : '放下')
                } else if (记录.按住) {
                  播放('提起')
                } else {
                  拖拽记录.current = null
                  动画播放.current = null
                  设置当前状态(记录.恢复状态)
                  设置覆盖资源(记录.动画.恢复)
                  设置气泡数据(记录.气泡)
                  if (记录.恢复状态 === '问答交互' && !记录.气泡?.答案内容) {
                    展示定时器.current = setTimeout(
                      进入收尾或待机,
                      配置.状态资源?.问答交互?.单次时长毫秒 || 默认问答展示时长,
                    )
                  } else if (记录.恢复状态 === '待机') {
                    调度下一次随机()
                  }
                }
              },
            }
    },
    [配置, 进入收尾或待机, 调度下一次随机],
  )

  const 动画加载完成 = useCallback((资源: 桌宠资源) => {
    const 播放 = 动画播放.current
    if (!播放 || 播放.资源 !== 资源 || 播放.已开始) return
    播放.已开始 = true
    展示定时器.current = setTimeout(播放.完成, 资源.单次时长毫秒)
  }, [])

  const 开始拖拽 = useCallback(() => {
    拖拽消息定时器.current.forEach(clearTimeout)
    拖拽消息定时器.current = []
    if (拖拽记录.current) {
      拖拽记录.current.按住 = true
    } else if (配置.拖拽动画) {
      清除全部定时器()
      const 是问答 = 当前状态 === '点击交互' || 当前状态 === '问答交互'
      拖拽记录.current = {
        动画: 是问答 ? 配置.拖拽动画.问答 : 配置.拖拽动画.常规,
        阶段: '衔接',
        按住: true,
        恢复状态: 是问答 ? 当前状态 : '待机',
        气泡: 是问答 ? 气泡数据 : null,
      }
      const 等待毫秒 = 衔接结束时间.current - Date.now()
      if (等待毫秒 > 0) {
        展示定时器.current = setTimeout(() => 播放拖拽阶段('提起'), 等待毫秒)
      } else {
        播放拖拽阶段('提起')
      }
    } else {
      清除全部定时器()
      设置当前状态('拖拽中')
    }
    const 消息 = 拖拽记录.current?.动画.待机.消息
    设置气泡数据(消息 ? { 类型: '主动消息', 主动消息: { 文本: 消息 } } : null)
    拖拽消息定时器.current = (拖拽记录.current?.动画.待机.延迟消息 || [])
      .filter((消息) => 消息.文本.trim())
      .map((消息) =>
        setTimeout(() => {
          设置气泡数据({ 类型: '主动消息', 主动消息: { 文本: 消息.文本 } })
        }, 消息.等待毫秒),
      )
  }, [清除全部定时器, 配置, 当前状态, 气泡数据, 播放拖拽阶段])

  // 拖拽结束
  const 结束拖拽 = useCallback(() => {
    拖拽消息定时器.current.forEach(clearTimeout)
    拖拽消息定时器.current = []
    if (拖拽记录.current) {
      拖拽记录.current.按住 = false
      设置气泡数据(null)
      if (拖拽记录.current.阶段 === '待机') 播放拖拽阶段('放下')
      return
    }
    设置当前状态('待机')
    调度下一次随机()
  }, [调度下一次随机, 播放拖拽阶段])

  // 卸载清理
  useEffect(() => {
    return () => {
      清除全部定时器()
    }
  }, [清除全部定时器])

  return {
    当前状态,
    覆盖资源,
    动画加载完成,
    气泡数据,
    点击桌宠,
    关闭气泡,
    选择问题,
    开始拖拽,
    结束拖拽,
  }
}
