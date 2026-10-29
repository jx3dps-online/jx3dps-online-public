import type { 加速阈值配置, 加速阈值分组, 加速阈值结果 } from '@/@types/加速阈值'
import { 自身属性系数 } from '@/数据/常量'
import { 按数字生成数组 } from './help'

export const 获取实际帧数 = (原始帧数, 加速等级, 郭氏加速等级 = 0, 郭氏额外加速百分比 = 0) => {
  const 郭氏普通加速百分比 = Math.min(
    256,
    Math.floor((1024 * 加速等级) / 自身属性系数.急速) + 郭氏加速等级,
  )
  return Math.floor((1024 * 原始帧数) / (郭氏普通加速百分比 + 郭氏额外加速百分比 + 1024))
}

export const 获取倒读条实际帧数分布 = (
  作用总间隔,
  单次作用间隔,
  加速等级,
  郭氏加速百分比 = 0,
  郭氏额外加速百分比 = 0,
  作用次数?,
) => {
  const 加速后实际总间隔 = 获取实际帧数(作用总间隔, 加速等级, 郭氏加速百分比, 郭氏额外加速百分比)
  const 实际作用次数 = 作用次数 ? 作用次数 : Math.floor((作用总间隔 || 0) / (单次作用间隔 || 1))
  const 作用间隔基础帧数 = Math.floor(加速后实际总间隔 / 实际作用次数)
  const 作用间隔余数 = 加速后实际总间隔 - 作用间隔基础帧数 * 实际作用次数
  return 按数字生成数组(实际作用次数).map((_, index) =>
    index < 作用间隔余数 ? 作用间隔基础帧数 + 1 : 作用间隔基础帧数,
  )
}

export const 获取阈值 = (原始帧数 = 24, 计算档位 = 5, 郭氏加速等级 = 0, 郭氏不受限加速 = 0) => {
  const res: Record<number, number> = {}
  let 加速等级 = 0
  const 最多计算次数 = 52520
  while (res[计算档位] === undefined && 加速等级 < 最多计算次数) {
    const 当前帧数 = 获取实际帧数(原始帧数, 加速等级, 郭氏加速等级, 郭氏不受限加速)
    const 加速档位 = 原始帧数 - 当前帧数
    if (加速档位 >= 0 && res[加速档位] === undefined) {
      res[加速档位] = 加速等级
    }
    加速等级 = 加速等级 + 1
  }
  return res
}

const 阈值缓存 = new Map<string, 加速阈值结果[]>()

export const 解析加速阈值 = (配置: 加速阈值配置): 加速阈值结果[] => {
  const 缓存键 = JSON.stringify([配置, 自身属性系数.急速])
  const 缓存 = 阈值缓存.get(缓存键)
  if (缓存) return 缓存
  const { 原始帧数, 额外加速值 = 0, 郭氏加速等级 = 0, 郭氏不受限加速 = 0 } = 配置
  const 非负整数 = [额外加速值, 郭氏加速等级, 郭氏不受限加速]
  const 正整数 = [原始帧数, ...(配置.作用次数 === undefined ? [] : [配置.作用次数])]
  if (配置.计算方式 === '周期') 正整数.push(配置.作用次数!)
  if (配置.计算方式 === '倒读条') {
    正整数.push(配置.单次作用间隔!, 配置.作用次数 ?? Math.floor(原始帧数 / 配置.单次作用间隔!))
  }
  if (
    !配置.标识 ||
    !配置.名称 ||
    非负整数.some((值) => !Number.isSafeInteger(值) || 值 < 0) ||
    正整数.some((值) => !Number.isSafeInteger(值) || 值 <= 0)
  ) {
    throw new Error('加速阈值配置无效：' + 配置.标识)
  }
  const 结果: 加速阈值结果[] = []
  const 饱和加速 = Math.max(
    0,
    Math.ceil((自身属性系数.急速 * Math.max(0, 256 - 郭氏加速等级)) / 1024) - 额外加速值,
  )
  let 上次帧数: number | undefined
  for (let 加速值 = 0; 加速值 <= 饱和加速 + 1; 加速值++) {
    const 帧数 = 获取实际帧数(原始帧数, 加速值 + 额外加速值, 郭氏加速等级, 郭氏不受限加速)
    if (帧数 === 上次帧数) continue
    上次帧数 = 帧数
    const 加速档位 = 原始帧数 - 帧数
    const 倒读条 = 配置.计算方式 === '倒读条'
    const 周期 = 配置.计算方式 === '周期'
    结果.push({
      标识: `${配置.标识}:${加速档位}`,
      加速档位,
      加速值,
      下一加速值: Infinity,
      实际帧数: 周期 ? 帧数 * 配置.作用次数! : 帧数,
      单次帧数: 周期 ? 帧数 : undefined,
      作用分布: 倒读条
        ? 获取倒读条实际帧数分布(
            原始帧数,
            配置.单次作用间隔!,
            加速值 + 额外加速值,
            郭氏加速等级,
            郭氏不受限加速,
            配置.作用次数,
          )
        : undefined,
    })
  }
  结果.forEach((项, index) => {
    项.下一加速值 = 结果[index + 1]?.加速值 ?? Infinity
  })
  if (阈值缓存.size >= 100) 阈值缓存.delete(阈值缓存.keys().next().value!)
  阈值缓存.set(缓存键, 结果)
  return 结果
}

export const 获取阈值选择范围 = (
  分组: 加速阈值分组[],
  选中标识: string[],
  末端 = Infinity,
): [number, number][] => {
  const 数值 = Array.from(
    new Set(
      分组
        .flatMap((组) => 组.档位)
        .filter((项) => 选中标识.includes(项.标识) && 项.加速值 < 末端)
        .map((项) => 项.加速值),
    ),
  ).sort((a, b) => a - b)
  return 数值.map((下限, index) => [下限, 数值[index + 1] ?? 末端])
}

export const 解析手动加速范围 = (输入: string): [number, number][] => {
  const 分段 = 输入.split(',').map((项) => 项.trim())
  if (
    分段.some((项) => !/^\d+$/.test(项) || !Number.isSafeInteger(Number(项)) || Number(项) >= 99999)
  ) {
    throw new Error('请输入 0 至 99998 的整数加速值，多个数值用英文逗号分隔')
  }
  const 数值 = Array.from(new Set(分段.map(Number))).sort((a, b) => a - b)
  return 数值.map((下限, index) => [下限, 数值[index + 1] ?? 99999])
}
