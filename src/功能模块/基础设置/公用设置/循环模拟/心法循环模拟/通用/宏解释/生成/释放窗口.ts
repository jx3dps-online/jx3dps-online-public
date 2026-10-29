import type { 心法运行接口, 技能宏语句, 宏条件 } from '../类型'
import type { 观察记录, 目标动作 } from './类型'
import { 获取条件变化时间, 获取固有等待时间, 选择宏语句 } from '../核心/运行'
import { 判定条件 } from '../核心/判定'

// 从同一决策状态观察互斥的等待分支；窗口不是实际轨迹，也不参与最终认证。
export const 观察释放窗口 = (
  行: 观察记录,
  目标: 目标动作 | undefined,
  接口: 心法运行接口,
  动作: 技能宏语句[],
  原子: 宏条件[],
  容差: number,
  截止时间: number,
) => {
  if (!目标 || 行.状态.读条 || !接口.观察未来状态) return []
  const 边界 = 获取固有等待时间(行.状态, 接口, 截止时间)
  const 时刻 = new Map<number, number[]>()
  原子.forEach((条件, 索引) => {
    const 时间 = 获取条件变化时间(条件, 行.状态)
    if (时间 <= 行.状态.时间 || 时间 >= 边界 || 时间 > 目标.时间 + 容差) return
    const 支持 = 时刻.get(时间) || []
    支持.push(索引)
    时刻.set(时间, 支持)
  })
  return [...时刻].flatMap(([时间, 时钟条件]) =>
    接口.观察未来状态!(时间, (状态) => {
      const 可执行 = new Uint8Array(动作.length)
      // 同一隔离状态的所有动作共享只读真值，不跨时刻或回放复用。
      const 真值 = Uint8Array.from(原子, (项) => Number(判定条件(项, 状态)))
      const 允许: number[] = []
      动作.forEach((语句, 索引) => {
        const 选中 = 选择宏语句([语句], 状态, 接口)
        可执行[索引] = Number(!!选中)
        if (!选中) return
        const 计划 = 接口.获取释放计划?.(选中.技能)
        const 释放 = 计划?.释放时间 ?? 接口.获取技能释放时间?.(选中.技能)
        const 合法 =
          释放 !== undefined &&
          (计划?.实际技能 ?? 接口.获取实际技能名称?.(选中.技能) ?? 选中.技能) === 目标.技能 &&
          Math.abs(释放 - 目标.时间) <= 容差 + 1e-7 * 状态.每秒帧
        if (合法) 允许.push(索引)
        if (释放 !== undefined)
          行.决策见证.push({
            time: 时间 / 状态.每秒帧,
            release_time: 释放 / 状态.每秒帧,
            action: 索引,
            allowed: 合法 ? 'allowed' : 'forbidden',
            clock_atoms: 时钟条件,
            truth: 真值,
          })
      })
      return 允许.length
        ? [
            {
              时间: 时间 / 状态.每秒帧,
              时钟条件,
              真值,
              可执行,
              允许,
            },
          ]
        : []
    }),
  )
}
