import { useEffect, useMemo, useRef, useState } from 'react'
import type { 对比数据, 对比行, 对比列, 对比结果 } from './类型'
import { 计算对比格子 } from './计算'

export default function use对比计算(数据: 对比数据, 行: 对比行[], 列: 对比列[]) {
  const [重算次数, 设置重算次数] = useState(0)
  const 输入 = useMemo(() => ({ 数据, 行, 列, 重算次数 }), [数据, 行, 列, 重算次数])
  const [报告, 设置报告] = useState<{
    输入: typeof 输入
    结果: Record<string, 对比结果>
    已处理: number
    状态: '计算中' | '已取消' | '已完成'
  }>()
  const 任务 = useRef<{ 取消: () => void }>()

  useEffect(() => {
    if (!行.length || !列.length) return
    let 有效 = true
    let 已处理 = 0
    const 结果: Record<string, 对比结果> = {}
    let 定时器: ReturnType<typeof setTimeout>
    const 本次 = {
      取消: () => {
        有效 = false
        clearTimeout(定时器)
        设置报告({ 输入, 结果: { ...结果 }, 已处理, 状态: '已取消' })
      },
    }
    任务.current = 本次
    const 执行批次 = () => {
      if (!有效) return
      const 开始时间 = performance.now()
      do {
        const 当前行 = 行[已处理 % 行.length]
        const 当前列 = 列[Math.floor(已处理 / 行.length)]
        let 格子: 对比结果
        try {
          格子 = 计算对比格子(数据.心法数据, 当前行, 当前列)
        } catch (错误) {
          格子 = { 原因: 错误 instanceof Error ? 错误.message : '计算失败' }
        }
        结果[`${当前行.id}/${当前列.id}`] = 格子
        已处理++
      } while (已处理 < 行.length * 列.length && performance.now() - 开始时间 < 8)
      const 完成 = 已处理 === 行.length * 列.length
      设置报告({ 输入, 结果: { ...结果 }, 已处理, 状态: 完成 ? '已完成' : '计算中' })
      if (!完成) 定时器 = setTimeout(执行批次, 0)
    }
    设置报告({ 输入, 结果: {}, 已处理, 状态: '计算中' })
    定时器 = setTimeout(执行批次, 0)
    return () => {
      有效 = false
      clearTimeout(定时器)
      if (任务.current === 本次) 任务.current = undefined
    }
  }, [输入, 数据, 行, 列])

  return {
    报告: 报告?.输入 === 输入 ? 报告 : undefined,
    取消: () => 任务.current?.取消(),
    重算: () => 设置重算次数((次数) => 次数 + 1),
  }
}
