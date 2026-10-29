import type { 循环数据, 循环详情 } from '@/@types/循环'

export type 排序方式 = '延迟' | '加速'
export type 循环选择 = Record<string, number[] | undefined>

const 获取档位键 = (详情: 循环详情) => {
  const 加速档位 = 详情.循环加速值范围?.length
    ? `范围_${详情.循环加速值范围[0]}`
    : `等级_${详情.循环加速等级 ?? '无'}`
  return `${加速档位}_延迟_${详情.循环延迟要求 ?? '无'}`
}

export const 排序循环详情 = (详情列表: 循环详情[], 排序: 排序方式) =>
  详情列表
    .map((详情, 索引) => ({ 详情, 索引 }))
    .sort((前项, 后项) => {
      const 加速差 =
        Number(前项.详情.循环加速值范围?.[0] ?? 前项.详情.循环加速等级 ?? Infinity) -
        Number(后项.详情.循环加速值范围?.[0] ?? 后项.详情.循环加速等级 ?? Infinity)
      const 延迟差 =
        Number(前项.详情.循环延迟要求 ?? Infinity) - Number(后项.详情.循环延迟要求 ?? Infinity)
      return (排序 === '加速' ? 加速差 || 延迟差 : 延迟差 || 加速差) || 前项.索引 - 后项.索引
    })

export const 选择同档位高秒伤 = (循环列表: 循环数据[]) => {
  const 最高秒伤映射 = new Map<string, { 循环名称: string; 索引: number; 秒伤: number }>()
  const 选中索引: 循环选择 = Object.fromEntries(循环列表.map((循环) => [循环.名称, []]))
  let 未保存秒伤数量 = 0
  循环列表.forEach((循环) => {
    循环.循环详情.forEach((详情, 索引) => {
      const 秒伤 = 详情.模拟器快照秒伤
      if (typeof 秒伤 !== 'number' || !Number.isFinite(秒伤)) {
        未保存秒伤数量++
        return
      }
      const 档位键 = 获取档位键(详情)
      const 当前最高 = 最高秒伤映射.get(档位键)
      if (!当前最高 || 秒伤 > 当前最高.秒伤) {
        最高秒伤映射.set(档位键, { 循环名称: 循环.名称, 索引, 秒伤 })
      }
    })
  })
  最高秒伤映射.forEach(({ 循环名称, 索引 }) => 选中索引[循环名称]?.push(索引))
  return { 选中索引, 未保存秒伤数量, 匹配档位数量: 最高秒伤映射.size }
}

const 合并循环序列 = (
  循环列表: 循环数据[],
): { 错误: string } | { 多挡位序列: Record<string, string[]>; 缺少序列: string[] } => {
  const 序列映射 = new Map<string, string[]>()
  const 缺少序列: string[] = []
  for (const 循环 of 循环列表) {
    const 名称 = 循环.标题 || 循环.名称
    const 已有序列 = Object.entries(循环.多挡位序列 || {})
    const 待合并序列: [string, string[]][] = 已有序列.length
      ? 已有序列
      : 循环.技能序列?.length
        ? [[名称, 循环.技能序列]]
        : []
    if (!待合并序列.length) 缺少序列.push(名称)
    for (const [键, 序列] of 待合并序列) {
      const 已有 = 序列映射.get(键)
      if (已有 && (已有.length !== 序列.length || 已有.some((技能, 索引) => 技能 !== 序列[索引]))) {
        return { 错误: `技能序列名称“${键}”重复且内容不同，请修改循环标题或序列名称后重试` }
      }
      序列映射.set(键, 序列)
    }
  }
  return { 多挡位序列: Object.fromEntries(序列映射), 缺少序列 }
}

const 加速细化标记 = /循环加速(?:值|档位)细化为\s*[：:]?\s*/
const 数字档位列表 = /^\d+(?:\s*[｜|，,]\s*\d+)*$/

const 更新合并备注 = (备注: string | undefined, 详情列表: 循环详情[]) => {
  if (!备注) return 备注
  const 标记 = 备注.match(加速细化标记)
  if (!标记) return 备注
  const 列表起始 = 标记.index! + 标记[0].length
  const 换行位置 = 备注.indexOf('<', 列表起始)
  const 列表结束 = 换行位置 === -1 ? 备注.length : 换行位置
  const 原列表 = 备注.slice(列表起始, 列表结束).trim()
  if (!数字档位列表.test(原列表)) return 备注
  const 加速值列表: number[] = []
  for (const 详情 of 详情列表) {
    const 加速值 = 详情.循环加速值范围?.[0]
    if (加速值 === undefined) return 备注
    const 数值 = Number(加速值)
    if (!Number.isFinite(数值)) return 备注
    加速值列表.push(数值)
  }
  if (!加速值列表.length) return 备注
  const 分隔符 = 原列表.match(/\d+(\s*[｜|，,]\s*)\d+/)?.[1] || '｜'
  const 新列表 = Array.from(new Set(加速值列表))
    .sort((前项, 后项) => 前项 - 后项)
    .join(分隔符)
  return `${备注.slice(0, 列表起始)}${新列表}${备注.slice(列表结束)}`
}

export interface 加速范围调整项 {
  延迟: string
  原范围: [number, number]
  新范围: [number, number]
}

const 合并连续区间 = (区间列表: [number, number][]) => {
  const 排序列表 = [...区间列表].sort((前项, 后项) => 前项[0] - 后项[0])
  const 结果: [number, number][] = []
  for (const [下限, 上限] of 排序列表) {
    const 末项 = 结果[结果.length - 1]
    if (末项 && 下限 <= 末项[1]) {
      末项[1] = Math.max(末项[1], 上限)
    } else {
      结果.push([下限, 上限])
    }
  }
  return 结果
}

const 区间覆盖一致 = (原区间: [number, number][], 新区间: [number, number][]) => {
  const 原并集 = 合并连续区间(原区间)
  const 新并集 = 合并连续区间(新区间)
  return (
    原并集.length === 新并集.length &&
    原并集.every(([下限, 上限], 索引) => 下限 === 新并集[索引][0] && 上限 === 新并集[索引][1])
  )
}

const 收窄同延迟加速范围 = (
  详情列表: 循环详情[],
): { 详情列表: 循环详情[]; 加速范围调整: 加速范围调整项[] } | { 错误: string } => {
  const 分组 = new Map<string, { 索引: number; 下限: number; 上限: number }[]>()
  详情列表.forEach((详情, 索引) => {
    if (!详情.循环加速值范围?.length) return
    const 下限 = Number(详情.循环加速值范围[0])
    const 上限 = Number(详情.循环加速值范围[1])
    if (!Number.isFinite(下限) || !Number.isFinite(上限)) return
    const 延迟键 = 详情.循环延迟要求 === undefined ? '未限定延迟' : String(详情.循环延迟要求)
    const 列表 = 分组.get(延迟键) || []
    列表.push({ 索引, 下限, 上限 })
    分组.set(延迟键, 列表)
  })

  const 新详情列表 = [...详情列表]
  const 加速范围调整: 加速范围调整项[] = []
  for (const [延迟键, 列表] of 分组) {
    if (列表.length < 2) continue
    列表.sort((前项, 后项) => 前项.下限 - 后项.下限 || 前项.索引 - 后项.索引)
    const 原区间 = 列表.map(({ 下限, 上限 }) => [下限, 上限] as [number, number])
    const 新区间 = 列表.map(({ 下限, 上限 }) => [下限, 上限] as [number, number])
    for (let i = 1; i < 新区间.length; i++) {
      const 前项 = 新区间[i - 1]
      const 后项 = 新区间[i]
      if (前项[1] > 后项[0]) {
        前项[1] = 后项[0]
      }
    }
    if (!区间覆盖一致(原区间, 新区间)) {
      const 延迟说明 = 延迟键 === '未限定延迟' ? '未限定延迟' : `延迟 ${延迟键}`
      return {
        错误: `${延迟说明}下的加速范围重叠，收窄会丢失覆盖，请取消其中一个档位后重试`,
      }
    }
    列表.forEach(({ 索引, 下限, 上限 }, 区间索引) => {
      const 新上限 = 新区间[区间索引][1]
      if (新上限 === 上限) return
      const 原范围 = 详情列表[索引].循环加速值范围!
      const 新范围: number[] | string[] = 原范围.some((值) => typeof 值 === 'string')
        ? [String(原范围[0]), String(新上限)]
        : [Number(原范围[0]), 新上限]
      新详情列表[索引] = {
        ...详情列表[索引],
        循环加速值范围: 新范围,
      }
      加速范围调整.push({
        延迟: 延迟键,
        原范围: [下限, 上限],
        新范围: [下限, 新上限],
      })
    })
  }
  return { 详情列表: 新详情列表, 加速范围调整 }
}

export const 生成合并循环 = (
  循环列表: 循环数据[],
  基底循环: 循环数据,
  选中索引: 循环选择,
  合并技能序列: boolean,
): { 错误: string } | { 数据: 循环数据; 缺少序列: string[]; 加速范围调整: 加速范围调整项[] } => {
  const 参与循环 = 循环列表.filter((循环) => 选中索引[循环.名称]?.length)
  const 最终详情: 循环详情[] = []
  const 已有档位 = new Set<string>()
  for (const 循环 of 参与循环) {
    for (const 索引 of 选中索引[循环.名称]!) {
      const 详情 = 循环.循环详情[索引]
      const 档位键 = 获取档位键(详情)
      if (已有档位.has(档位键)) {
        const 加速说明 = 详情.循环加速值范围?.length
          ? `加速范围 ${详情.循环加速值范围.join(' ~ ')}`
          : `加速等级 ${详情.循环加速等级 ?? '无'}`
        return {
          错误: `存在重复档位：${循环.标题 || 循环.名称}，${加速说明}，延迟 ${详情.循环延迟要求 ?? '无'}，请检查选择`,
        }
      }
      已有档位.add(档位键)
      最终详情.push(详情)
    }
  }
  if (!最终详情.length) return { 错误: '请至少选择一个循环详细档位' }
  const 范围结果 = 收窄同延迟加速范围(最终详情)
  if ('错误' in 范围结果) return 范围结果
  const 数据: 循环数据 = {
    ...基底循环,
    名称: `${基底循环.名称}_${Date.now()}_合并`,
    标题: `${基底循环.标题 || 基底循环.名称}_合并`,
    备注: 更新合并备注(基底循环.备注, 范围结果.详情列表),
    循环详情: 范围结果.详情列表,
  }
  if (合并技能序列) {
    const 结果 = 合并循环序列(参与循环)
    if ('错误' in 结果) return 结果
    delete 数据.技能序列
    delete 数据.多挡位序列
    if (Object.keys(结果.多挡位序列).length) 数据.多挡位序列 = 结果.多挡位序列
    return { 数据, 缺少序列: 结果.缺少序列, 加速范围调整: 范围结果.加速范围调整 }
  }
  return { 数据, 缺少序列: [], 加速范围调整: 范围结果.加速范围调整 }
}
