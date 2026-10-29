import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 副本事件实例类型, 副本事件阶段类型 } from '@/@types/副本事件'
import { 帧转分秒帧, 获取实例总持续时间 } from '../utils'
import styles from './index.module.less'

export interface 时间轴行类型 {
  事件名称: string
  图标?: string
  颜色: string
  支持拖拽边缘: boolean // 是否支持拖动左右边缘调整持续时间
}

export interface 时间轴Ref类型 {
  适配: () => void
}

interface 时间轴Props {
  总时间: number
  行列表: 时间轴行类型[]
  实例列表: 副本事件实例类型[]
  选中实例id?: string
  缩放比例: number // 像素/帧
  只读?: boolean // 只读时禁止拖动/删除/右键操作，仅可选中查看
  onSelect: (id?: string) => void
  onCommitInstanceList: (列表: 副本事件实例类型[]) => void // 拖动结束一次性提交
  onDeleteInstance: (id: string) => void
  重叠实例idSet: Set<string>
  onWheelZoom?: (deltaY: number) => void
  onZoomChange?: (比例: number) => void // 直接设置缩放比例（适配用）
  事件CD映射?: { [事件名称: string]: number } // 用于拖动时提示间隔小于 CD
  同步拖动模式?: boolean // 拖动时同步移动同事件的其它实例
  onAddEventInstance?: (事件名称: string, 释放时间?: number) => void // 右键菜单：添加事件
  onClearEvent?: (事件名称: string) => void // 右键菜单：清空本事件
}

// 间隔小于 CD 的红线数据：起帧~止帧，表示以相邻滑块为基准的 CD 安全范围
interface 红线数据类型 {
  起帧: number
  止帧: number
}

interface 拖拽状态类型 {
  实例id: string
  事件名称: string
  类型: 'move' | 'resize-left' | 'resize-right' | 'resize-phase'
  阶段索引?: number // resize-phase：分割线索引（阶段 i 与 i+1 之间）
  起始clientX: number
  起始释放时间: number
  起始总持续时间: number
  起始阶段列表: 副本事件阶段类型[]
  // 同步拖动时，记录同事件所有实例的起始释放时间，用于整体平移
  同步组?: { id: string; 起始释放时间: number }[]
}

const 标签列宽 = 120
const 行高 = 40

// 吸附：默认吸附到整数秒(16帧)，取消吸附则按帧
const 吸附帧 = (帧值: number, 取消吸附: boolean) => {
  const 值 = Math.max(0, 帧值)
  if (取消吸附) {
    return Math.round(值)
  }
  return Math.round(值 / 每秒郭氏帧) * 每秒郭氏帧
}

const 时间轴 = forwardRef<时间轴Ref类型, 时间轴Props>((props, ref) => {
  const {
    总时间,
    行列表,
    实例列表,
    选中实例id,
    缩放比例,
    只读 = false,
    onSelect,
    onCommitInstanceList,
    onDeleteInstance,
    重叠实例idSet,
    onWheelZoom,
    onZoomChange,
    事件CD映射,
    同步拖动模式 = false,
    onAddEventInstance,
    onClearEvent,
  } = props

  const 容器Ref = useRef<HTMLDivElement>(null)
  const [拖拽, 设置拖拽] = useState<拖拽状态类型 | null>(null)
  const [拖拽指示帧, 设置拖拽指示帧] = useState<number | null>(null)
  const [拖拽红线, 设置拖拽红线] = useState<红线数据类型[]>([])
  const [是否取消吸附, 设置是否取消吸附] = useState<boolean>(false)
  const [shift按下, 设置shift按下] = useState<boolean>(false)
  // 拖动过程中的临时实例列表（本地状态，不触发外部重渲染）
  const [拖拽临时列表, 设置拖拽临时列表] = useState<副本事件实例类型[] | null>(null)
  // 拖拽开始时的实例列表快照，用于绝对定位计算基线
  const 拖拽起始列表Ref = useRef<副本事件实例类型[] | null>(null)
  // 行右键菜单状态：事件名称 + 右击帧 + 屏幕坐标
  const [右键菜单, 设置右键菜单] = useState<{
    事件名称: string
    帧: number
    x: number
    y: number
  } | null>(null)

  // 是否启用同步拖动：开关或按住 Shift 时
  const 是否同步拖动 = 同步拖动模式 || shift按下

  // 渲染时使用的实例列表：拖动中优先使用临时列表
  const 显示实例列表 = 拖拽临时列表 || 实例列表

  const 拖拽实例名称 = 拖拽?.事件名称 || ''

  const 内容宽度 = 总时间 * 缩放比例

  // 适配：让整个时间轴（标签列 + 内容）铺满容器可视宽度
  const 适配 = useCallback(() => {
    const 容器宽 = 容器Ref.current?.clientWidth || 0
    if (容器宽 > 标签列宽 && 总时间 > 0) {
      onZoomChange?.(Math.max(0.05, (容器宽 - 标签列宽) / 总时间))
    }
  }, [总时间, onZoomChange])

  useImperativeHandle(ref, () => ({ 适配 }), [适配])

  // 首次挂载或总时间变化时自动适配（新增方案 / 打开编辑器时铺满）
  useEffect(() => {
    const timer = setTimeout(适配, 0)
    return () => clearTimeout(timer)
  }, [适配])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      设置是否取消吸附(e.altKey)
      设置shift按下(e.shiftKey)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      设置是否取消吸附(e.altKey)
      设置shift按下(e.shiftKey)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  // Alt + 滚轮缩放
  useEffect(() => {
    const el = 容器Ref.current
    if (!el) {
      return
    }
    const onWheel = (e: WheelEvent) => {
      if (e.altKey) {
        e.preventDefault()
        onWheelZoom?.(e.deltaY)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
    }
  }, [onWheelZoom])

  // 行右键菜单：点击其它区域 / 失焦 / 滚动时关闭
  useEffect(() => {
    if (!右键菜单) {
      return
    }
    const onAnyDown = () => 设置右键菜单(null)
    window.addEventListener('mousedown', onAnyDown)
    window.addEventListener('blur', onAnyDown)
    window.addEventListener('scroll', onAnyDown, true)
    return () => {
      window.removeEventListener('mousedown', onAnyDown)
      window.removeEventListener('blur', onAnyDown)
      window.removeEventListener('scroll', onAnyDown, true)
    }
  }, [右键菜单])

  useEffect(() => {
    if (!拖拽) {
      return
    }
    const onMove = (e: PointerEvent) => {
      const 快照 = 拖拽起始列表Ref.current
      if (!快照) {
        return
      }
      const deltaFrame = (e.clientX - 拖拽.起始clientX) / 缩放比例

      if (拖拽.类型 === 'move') {
        const 吸附后释放时间 = 吸附帧(拖拽.起始释放时间 + deltaFrame, 是否取消吸附)
        设置拖拽指示帧(吸附后释放时间)

        if (拖拽.同步组?.length) {
          // 同步拖动：整组按同一 delta 平移，保持 CD 间隔
          let 实际Delta = 吸附后释放时间 - 拖拽.起始释放时间
          // 边界控制：整组最左侧的实例释放时间不能小于 0
          const 最小起始释放 = Math.min(...拖拽.同步组.map((成员) => 成员.起始释放时间))
          if (最小起始释放 + 实际Delta < 0) {
            实际Delta = -最小起始释放
          }
          设置拖拽指示帧(拖拽.起始释放时间 + 实际Delta)
          const 更新映射: { [id: string]: number } = {}
          拖拽.同步组.forEach((成员) => {
            更新映射[成员.id] = 成员.起始释放时间 + 实际Delta
          })
          设置拖拽临时列表(
            快照.map((实例) =>
              更新映射[实例.id] !== undefined ? { ...实例, 释放时间: 更新映射[实例.id] } : 实例,
            ),
          )
        } else {
          设置拖拽临时列表(
            快照.map((实例) =>
              实例.id === 拖拽.实例id ? { ...实例, 释放时间: 吸附后释放时间 } : 实例,
            ),
          )
          // 自由拖动：计算与相邻实例的间隔是否小于 CD，用于红线提示
          计算拖拽红线(快照, 拖拽.实例id, 吸附后释放时间)
        }
      } else {
        // 调整阶段时长：深拷贝起始阶段列表，按拖动类型调整
        const 阶段列表 = (拖拽.起始阶段列表 || []).map((阶段) => ({ ...阶段 }))
        let 吸附后释放时间 = 拖拽.起始释放时间

        if (拖拽.类型 === 'resize-left') {
          // 拖动左边缘：平移释放时间 + 收缩/扩展第一个阶段，右边缘固定
          吸附后释放时间 = 吸附帧(拖拽.起始释放时间 + deltaFrame, 是否取消吸附)
          const 实际Delta = 吸附后释放时间 - 拖拽.起始释放时间
          if (阶段列表.length) {
            阶段列表[0] = {
              ...阶段列表[0],
              持续时间: Math.max(1, (阶段列表[0].持续时间 || 0) - 实际Delta),
            }
          }
          设置拖拽指示帧(吸附后释放时间)
        } else if (拖拽.类型 === 'resize-right') {
          // 拖动右边缘：调整最后一个阶段时长
          if (阶段列表.length) {
            const 最后 = 阶段列表.length - 1
            阶段列表[最后] = {
              ...阶段列表[最后],
              持续时间: Math.max(
                1,
                吸附帧((阶段列表[最后].持续时间 || 0) + deltaFrame, 是否取消吸附),
              ),
            }
          }
          const 新总持续时间 = 阶段列表.reduce((s, a) => s + (a.持续时间 || 0), 0)
          设置拖拽指示帧(拖拽.起始释放时间 + 新总持续时间)
        } else if (拖拽.类型 === 'resize-phase') {
          // 拖动阶段分割线：调整前后两个阶段时长，总时长不变
          const i = 拖拽.阶段索引 ?? 0
          if (阶段列表.length >= 2 && i >= 0 && i < 阶段列表.length - 1) {
            const 原始前 = 阶段列表[i].持续时间 || 0
            const 原始后 = 阶段列表[i + 1].持续时间 || 0
            const 总和 = 原始前 + 原始后
            const 新前 = 吸附帧(原始前 + deltaFrame, 是否取消吸附)
            阶段列表[i].持续时间 = Math.min(Math.max(1, 新前), 总和 - 1)
            阶段列表[i + 1].持续时间 = Math.max(1, 总和 - 阶段列表[i].持续时间)
          }
          const 分割线帧 =
            拖拽.起始释放时间 +
            阶段列表.slice(0, (拖拽.阶段索引 ?? 0) + 1).reduce((s, a) => s + (a.持续时间 || 0), 0)
          设置拖拽指示帧(分割线帧)
        }

        设置拖拽临时列表(
          快照.map((实例) =>
            实例.id === 拖拽.实例id ? { ...实例, 释放时间: 吸附后释放时间, 阶段列表 } : 实例,
          ),
        )
      }
    }
    const onUp = () => {
      // 拖动结束：一次性提交临时列表
      if (拖拽临时列表) {
        onCommitInstanceList(拖拽临时列表)
      }
      设置拖拽(null)
      设置拖拽指示帧(null)
      设置拖拽红线([])
      设置拖拽临时列表(null)
      拖拽起始列表Ref.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [拖拽, 缩放比例, 是否取消吸附, 事件CD映射, 拖拽临时列表])

  // 计算自由拖动时，与相邻实例间隔小于 CD 的红线（CD 安全范围）
  // 以相邻实例的释放时间为基准，展示 [相邻释放, 相邻释放+CD] 这段 CD 安全范围
  const 计算拖拽红线 = (快照: 副本事件实例类型[], 拖拽实例id: string, 新释放时间: number) => {
    const 实例 = 快照?.find((item) => item?.id === 拖拽实例id)
    if (!实例) {
      return
    }
    const CD = 事件CD映射?.[实例.事件名称]
    if (!CD || CD <= 0) {
      设置拖拽红线([])
      return
    }
    const 同事件其他 = (快照 || []).filter(
      (其他) => 其他.事件名称 === 实例.事件名称 && 其他.id !== 实例.id,
    )
    let 左边最近释放 = -1
    let 右边最近释放 = Infinity
    同事件其他.forEach((其他) => {
      if (其他.释放时间 <= 新释放时间 && 其他.释放时间 > 左边最近释放) {
        左边最近释放 = 其他.释放时间
      }
      if (其他.释放时间 >= 新释放时间 && 其他.释放时间 < 右边最近释放) {
        右边最近释放 = 其他.释放时间
      }
    })
    const 红线: 红线数据类型[] = []
    if (左边最近释放 >= 0) {
      const 间隔 = 新释放时间 - 左边最近释放
      if (间隔 < CD) {
        红线.push({ 起帧: 左边最近释放, 止帧: 左边最近释放 + CD })
      }
    }
    if (右边最近释放 !== Infinity) {
      const 间隔 = 右边最近释放 - 新释放时间
      if (间隔 < CD) {
        红线.push({ 起帧: 右边最近释放 - CD, 止帧: 右边最近释放 })
      }
    }

    // 前后两个 CD 范围可能重叠（相邻实例间距小于 2*CD 时），合并为一段连续范围
    const 合并后: 红线数据类型[] = []
    红线.sort((a, b) => a.起帧 - b.起帧).forEach((线) => {
      const 最后 = 合并后[合并后.length - 1]
      if (最后 && 线.起帧 <= 最后.止帧) {
        最后.止帧 = Math.max(最后.止帧, 线.止帧)
      } else {
        合并后.push({ ...线 })
      }
    })
    设置拖拽红线(合并后)
  }

  const 开始拖拽 = (
    e: React.PointerEvent,
    实例: 副本事件实例类型,
    类型: 拖拽状态类型['类型'],
    阶段索引?: number,
  ) => {
    // 只读模式仅允许选中查看
    if (只读) {
      return
    }
    // 仅响应鼠标左键；右键保留给行右键菜单
    if (e.button !== 0) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    const 总持续时间 = 获取实例总持续时间(实例)
    let 同步组: { id: string; 起始释放时间: number }[] | undefined
    if (是否同步拖动 && 类型 === 'move') {
      // 同步拖动：记录同事件所有实例的起始释放时间
      同步组 = (实例列表 || [])
        .filter((其他) => 其他.事件名称 === 实例.事件名称)
        .map((其他) => ({ id: 其他.id, 起始释放时间: 其他.释放时间 }))
    }
    // 记录起始快照（用于绝对定位计算，避免 stale closure）
    拖拽起始列表Ref.current = 实例列表
    设置拖拽临时列表(实例列表)
    设置拖拽({
      实例id: 实例.id,
      事件名称: 实例.事件名称,
      类型,
      阶段索引,
      起始clientX: e.clientX,
      起始释放时间: 实例.释放时间,
      起始总持续时间: 总持续时间,
      起始阶段列表: (实例.阶段列表 || []).map((阶段) => ({ ...阶段 })),
      同步组,
    })
    onSelect(实例.id)
  }

  // 刻度：按缩放比例自适应间隔
  const 刻度 = useMemo(() => {
    const 结果: { 帧: number; 主刻度: boolean }[] = []
    const 候选间隔 = [5, 10, 15, 30, 60, 120, 300, 600]
    const 最小像素间隔 = 60
    let 间隔秒 = 600
    for (const 候选 of 候选间隔) {
      if (候选 * 每秒郭氏帧 * 缩放比例 >= 最小像素间隔) {
        间隔秒 = 候选
        break
      }
    }
    const 间隔帧 = 间隔秒 * 每秒郭氏帧
    for (let 帧 = 0; 帧 <= 总时间; 帧 = 帧 + 间隔帧) {
      结果.push({ 帧, 主刻度: true })
    }
    return { 结果, 间隔帧 }
  }, [总时间, 缩放比例])

  const 按行分组实例 = useMemo(() => {
    const 分组: { [key: string]: 副本事件实例类型[] } = {}
    ;(显示实例列表 || []).forEach((实例) => {
      if (!分组[实例?.事件名称]) {
        分组[实例?.事件名称] = []
      }
      分组[实例?.事件名称].push(实例)
    })
    return 分组
  }, [显示实例列表])

  // 持久红线：松手后仍保留的「相邻实例间隔小于 CD」提示（基于最终实例列表）
  const 间距小于CD对 = useMemo(() => {
    const 对: { 事件名称: string; 起帧: number; 止帧: number; 中点帧: number }[] = []
    const 分组: { [key: string]: 副本事件实例类型[] } = {}
    ;(实例列表 || []).forEach((实例) => {
      if (!分组[实例.事件名称]) {
        分组[实例.事件名称] = []
      }
      分组[实例.事件名称].push(实例)
    })
    Object.keys(分组).forEach((事件名称) => {
      const CD = 事件CD映射?.[事件名称]
      if (!CD || CD <= 0) {
        return
      }
      const 组 = [...分组[事件名称]].sort((a, b) => a.释放时间 - b.释放时间)
      for (let i = 0; i < 组.length - 1; i++) {
        const 前 = 组[i]
        const 后 = 组[i + 1]
        const 间隔 = 后.释放时间 - 前.释放时间
        if (间隔 < CD) {
          // 红线连接前后两个滑块：从前一个右边缘到后一个左边缘
          const 前结束 = 前.释放时间 + 获取实例总持续时间(前)
          对.push({
            事件名称,
            起帧: 前结束,
            止帧: 后.释放时间,
            中点帧: (前结束 + 后.释放时间) / 2,
          })
        }
      }
    })
    return 对
  }, [实例列表, 事件CD映射])

  return (
    <div className={styles.wrap}>
      <div className={styles.scrollWrap} ref={容器Ref}>
        <div className={styles.content} style={{ width: 标签列宽 + 内容宽度 }}>
          {/* 顶部刻度 */}
          <div className={styles.rulerRow}>
            <div className={styles.labelCell} style={{ width: 标签列宽 }} />
            <div className={styles.ruler} style={{ width: 内容宽度, position: 'relative' }}>
              {刻度.结果.map((刻度项) => {
                const 时间 = 帧转分秒帧(刻度项.帧)
                return (
                  <div
                    key={刻度项.帧}
                    className={styles.rulerTick}
                    style={{ left: 刻度项.帧 * 缩放比例 }}
                  >
                    <span className={styles.rulerLabel}>{时间.文本}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 拖拽竖虚线（跟随拖动，显示事件名 + 当前时间） */}
          {拖拽指示帧 !== null && 拖拽 ? (
            <div className={styles.dragLine} style={{ left: 标签列宽 + 拖拽指示帧 * 缩放比例 }}>
              <span className={styles.dragLineLabel}>
                {拖拽实例名称} {帧转分秒帧(拖拽指示帧).文本}
              </span>
            </div>
          ) : null}

          {/* 间隔小于 CD 的红线提示：以相邻实例为基准的 CD 安全范围 */}
          {拖拽红线.map((线, index) => (
            <div
              key={`redline_${index}`}
              className={styles.cdWarnRange}
              style={{
                left: 标签列宽 + 线.起帧 * 缩放比例,
                width: Math.max(4, (线.止帧 - 线.起帧) * 缩放比例),
              }}
            >
              <span className={styles.cdWarnLabel}>安全范围(CD)</span>
            </div>
          ))}

          {/* 事件行 */}
          {(行列表 || []).map((行) => {
            const 该行实例 = 按行分组实例[行.事件名称] || []
            const 该行间距对 = 间距小于CD对.filter((对) => 对.事件名称 === 行.事件名称)
            return (
              <div
                className={styles.row}
                key={行.事件名称}
                style={{ height: 行高 }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  if (只读) {
                    return
                  }
                  const 行Rect = e.currentTarget.getBoundingClientRect()
                  const 帧 = Math.max(
                    0,
                    Math.round((e.clientX - 行Rect.left - 标签列宽) / 缩放比例),
                  )
                  设置右键菜单({ 事件名称: 行.事件名称, 帧, x: e.clientX, y: e.clientY })
                }}
              >
                <div
                  className={styles.labelCell}
                  style={{ width: 标签列宽, height: 行高 }}
                  onClick={() => onSelect(undefined)}
                >
                  {行.图标 ? <img className={styles.rowIcon} src={行.图标} alt='' /> : null}
                  <span className={styles.rowName}>{行.事件名称}</span>
                </div>
                <div
                  className={styles.rowTrack}
                  style={{ width: 内容宽度, height: 行高, position: 'relative' }}
                  onClick={() => onSelect(undefined)}
                >
                  {/* 间隔小于 CD 的持久红线（松手后保留，连接前后两个滑块） */}
                  {该行间距对.map((对, index) => (
                    <span
                      key={`gapwarn_${index}`}
                      className={styles.gapWarnLine}
                      style={{
                        left: 对.起帧 * 缩放比例,
                        width: Math.max(2, (对.止帧 - 对.起帧) * 缩放比例),
                      }}
                    />
                  ))}
                  {该行间距对.map((对, index) => (
                    <span
                      key={`gaplabel_${index}`}
                      className={styles.gapWarnLabel}
                      style={{ left: 对.中点帧 * 缩放比例 }}
                    >
                      小于实际CD
                    </span>
                  ))}
                  {该行实例.map((实例) => {
                    const 总持续时间 = 获取实例总持续时间(实例)
                    const 是多阶段 = (实例.阶段列表 || []).length > 1
                    const 是否重叠 = 重叠实例idSet.has(实例.id)
                    const 是否选中 = 选中实例id === 实例.id
                    let 阶段累计 = 0
                    const 结束时间 = 实例.释放时间 + 总持续时间
                    const 起止文本 = `${帧转分秒帧(实例.释放时间).文本} ~ ${帧转分秒帧(结束时间).文本}`
                    return (
                      <Tooltip
                        key={实例.id}
                        title={`${实例.事件名称}  ${起止文本}`}
                        open={拖拽 ? false : undefined}
                      >
                        <div
                          className={`${styles.block} ${是否选中 ? styles.blockActive : ''} ${
                            是否重叠 ? styles.blockOverlap : ''
                          }`}
                          style={{
                            left: 实例.释放时间 * 缩放比例,
                            width: Math.max(4, 总持续时间 * 缩放比例),
                            top: 5,
                            height: 行高 - 10,
                            background: 行.颜色,
                            position: 'absolute',
                          }}
                          onPointerDown={(e) => 开始拖拽(e, 实例, 'move')}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelect(实例.id)
                          }}
                        >
                          {行.支持拖拽边缘 && !只读 ? (
                            <>
                              <span
                                className={styles.resizeHandle}
                                style={{ left: 0 }}
                                onPointerDown={(e) => 开始拖拽(e, 实例, 'resize-left')}
                              />
                              <span
                                className={styles.resizeHandle}
                                style={{ right: 0 }}
                                onPointerDown={(e) => 开始拖拽(e, 实例, 'resize-right')}
                              />
                            </>
                          ) : null}
                          {是多阶段
                            ? // 多阶段：内部阶段分隔线（支持拖拽边缘时分割线可拖动）
                              (实例.阶段列表 || []).map((阶段, index) => {
                                阶段累计 = 阶段累计 + 阶段.持续时间
                                if (index === 实例.阶段列表.length - 1) {
                                  return null
                                }
                                const 分割线位置 = (阶段累计 / 总持续时间) * 100 + '%'
                                return (
                                  <React.Fragment key={`${实例.id}_${index}`}>
                                    <span
                                      className={styles.phaseLine}
                                      style={{ left: 分割线位置 }}
                                    />
                                    {行.支持拖拽边缘 && !只读 ? (
                                      <span
                                        className={styles.phaseHandle}
                                        style={{ left: 分割线位置 }}
                                        onPointerDown={(e) =>
                                          开始拖拽(e, 实例, 'resize-phase', index)
                                        }
                                      />
                                    ) : null}
                                  </React.Fragment>
                                )
                              })
                            : null}
                          {是多阶段 ? (
                            // 多阶段：每个阶段的文案显示在该阶段小方格的初始位置
                            (实例.阶段列表 || []).map((阶段, index) => {
                              const 阶段起始 = (实例.阶段列表 || [])
                                .slice(0, index)
                                .reduce((s, a) => s + (a.持续时间 || 0), 0)
                              return (
                                <span
                                  key={`${实例.id}_label_${index}`}
                                  className={styles.blockStageLabel}
                                  style={{
                                    left: (阶段起始 / 总持续时间) * 100 + '%',
                                    maxWidth: (阶段.持续时间 / 总持续时间) * 100 + '%',
                                  }}
                                >
                                  {阶段.阶段名称}
                                </span>
                              )
                            })
                          ) : (
                            <span className={styles.blockLabel}>
                              {实例.阶段列表?.[0]?.阶段名称 || 实例.事件名称}
                            </span>
                          )}
                          {是否重叠 ? (
                            <Tooltip title='与另一实例重叠'>
                              <span className={styles.overlapDot} />
                            </Tooltip>
                          ) : null}
                          {是否选中 && !只读 ? (
                            <span
                              className={styles.deleteBtn}
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteInstance(实例.id)
                              }}
                            >
                              <CloseOutlined />
                            </span>
                          ) : null}
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* 行右键菜单 */}
          {右键菜单 ? (
            <div
              className={styles.contextMenu}
              style={{ left: 右键菜单.x, top: 右键菜单.y }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                className={styles.contextMenuItem}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onAddEventInstance?.(右键菜单.事件名称, 右键菜单.帧)
                  设置右键菜单(null)
                }}
              >
                添加事件
              </div>
              <div
                className={styles.contextMenuItemDanger}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onClearEvent?.(右键菜单.事件名称)
                  设置右键菜单(null)
                }}
              >
                清空本事件
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
})

export default React.memo(时间轴)
