import { useContext, useEffect, useRef } from 'react'
import {
  战斗曲线联动设置Context,
  战斗曲线展示数量Context,
} from '@/功能模块/基础设置/公用设置/循环模拟/context'

// 在技能上停留达到该时长（毫秒）才触发战斗曲线联动，避免快速扫过一排技能时高频触发
const 联动悬停延迟毫秒 = 2000

/**
 * 战斗曲线 hover 联动：进入技能后延迟触发、离开或再次进入时取消。
 * 只有「停留」达到阈值的技能才会联动显示曲线竖线 + tooltip。
 * 当没有任何战斗曲线处于展示状态时直接跳过，避免在正常使用模拟器时产生无关开销。
 */
export const use联动悬停 = (技能释放时间: number) => {
  const 更新联动悬停时间 = useContext(战斗曲线联动设置Context)
  const 展示数量 = useContext(战斗曲线展示数量Context)
  const 定时器 = useRef<ReturnType<typeof setTimeout> | null>(null)

  const 清除联动 = () => {
    if (定时器.current) {
      clearTimeout(定时器.current)
      定时器.current = null
    }
    更新联动悬停时间(null)
  }

  const 进入联动 = () => {
    if (展示数量 <= 0) {
      // 没有曲线在展示，不启动联动，避免无关开销
      return
    }
    清除联动()
    定时器.current = setTimeout(() => {
      定时器.current = null
      更新联动悬停时间(技能释放时间)
    }, 联动悬停延迟毫秒)
  }

  // 卸载时清理，避免残留定时器触发
  useEffect(() => {
    return () => {
      if (定时器.current) {
        clearTimeout(定时器.current)
        定时器.current = null
      }
    }
  }, [])

  return { 进入联动, 清除联动 }
}
