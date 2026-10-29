import type { 生成进度 } from './类型'
import { 宏生成容差上限 } from './结果校验'

export interface 生成异常 {
  类型: '容差超限' | '持续无进展' | '生成失败'
  说明: string
}

export const 创建异常检测 = () => {
  let 上次进展: { 时刻: number; 匹配数: number; 字符?: number; 压缩: boolean } | undefined
  return (进度: 生成进度, 时刻: number): 生成异常 | undefined => {
    if (进度.状态 === '错误')
      return {
        类型: '生成失败',
        说明: '本次未生成可用宏，请复制异常信息提交反馈，包含当前循环、模拟参数和首次分歧。',
      }
    const 压缩 = 进度.状态 === '压缩'
    if (进度.状态 === '准备' || 进度.状态 === '成功' || 进度.状态 === '未完成') {
      上次进展 = undefined
    } else if (
      !上次进展 ||
      压缩 !== 上次进展.压缩 ||
      进度.匹配数 > 上次进展.匹配数 ||
      (压缩 && 进度.压缩 && 进度.压缩.最佳字符 < (上次进展.字符 ?? Infinity))
    ) {
      上次进展 = {
        时刻,
        匹配数: 进度.匹配数,
        字符: 进度.压缩?.最佳字符,
        压缩,
      }
    }
    const 比较 = 进度.最近回放?.比较
    const 容差 = 比较?.time_tolerance_seconds ?? 进度.容差
    const 偏差 = 比较?.max_time_error_on_order_prefix ?? 进度.最大偏差
    const 已通过 = 比较?.reproduced ?? 进度.已认证
    if (
      容差 !== undefined &&
      (容差 > 宏生成容差上限 || (已通过 && 偏差 !== undefined && 偏差 > 容差 + 1e-7))
    )
      return {
        类型: '容差超限',
        说明: `回放校验数据越界：校验容差 ${(容差 * 1000).toFixed(1)}ms${偏差 === undefined ? '' : `，回放偏差 ${(偏差 * 1000).toFixed(1)}ms`}。请提交当前信息协助排查。`,
      }
    if (上次进展 && 时刻 - 上次进展.时刻 >= 120000)
      return {
        类型: '持续无进展',
        说明: 压缩
          ? '压缩已运行 120 秒未缩短宏，可提交当前信息协助排查；这不代表无法继续压缩。'
          : '生成已运行 120 秒未增加匹配数，可提交当前信息协助排查；这不代表循环无解。',
      }
    return undefined
  }
}
