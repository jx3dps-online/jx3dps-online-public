import type { 循环数据, 循环详情 } from '@/@types/循环'
import type { 加速阈值分组 } from '@/@types/加速阈值'
import type { 循环基础技能数据类型 } from '../../通用框架/类型定义/技能'
import { 获取阈值选择范围, 解析手动加速范围 } from '@/工具函数/加速阈值'
import { 生成合并循环, 选择同档位高秒伤, 排序循环详情, 更新合并备注 } from '@/工具函数/合并循环'
import { 拆分循环文本 } from '../../通用函数/拆分循环文本'
import type { 待合并序列, 模拟任务, 计算进度, 批量计算结果 } from './类型'

export const 筛选导出循环 = (循环: 循环数据, 选中索引: number[]): 循环数据 | undefined => {
  const 循环详情 = 循环.循环详情.filter((_, 索引) => 选中索引.includes(索引))
  if (!循环详情.length) return undefined
  const 序列名称 = new Set(循环详情.map((详情) => 详情.技能序列名称))
  return {
    ...循环,
    ...循环.多挡位序列配置?.[循环详情[0].技能序列名称!],
    循环详情,
    备注: 更新合并备注(循环.备注, 循环详情),
    多挡位序列: Object.fromEntries(
      Object.entries(循环.多挡位序列!).filter(([名称]) => 序列名称.has(名称)),
    ),
    多挡位序列配置: Object.fromEntries(
      Object.entries(循环.多挡位序列配置!).filter(([名称]) => 序列名称.has(名称)),
    ),
  }
}

export const 准备模拟任务 = (
  列表: 待合并序列[],
  阈值: 加速阈值分组[],
  技能数据: 循环基础技能数据类型[],
  大橙武模拟: boolean,
  校验腰坠: boolean,
  无界心法: boolean,
): 模拟任务[] => {
  if (!列表.length) throw new Error('请至少添加一条序列')
  const 名称集合 = new Set<string>()
  const 任务: 模拟任务[] = 列表.flatMap((序列) => {
    const 名称 = 序列.名称.trim()
    if (!名称 || 名称集合.has(名称)) throw new Error('序列名称不能为空或重复')
    名称集合.add(名称)
    const 文本 = 序列.文本.trim()
    const 技能序列: unknown = 文本.startsWith('[') ? JSON.parse(文本) : 拆分循环文本(文本)
    if (
      !Array.isArray(技能序列) ||
      !技能序列.length ||
      技能序列.some((项) => typeof 项 !== 'string' || !项.trim())
    ) {
      throw new Error(`${名称}：请输入以逗号分隔的技能序列或字符串 JSON 数组`)
    }
    const 技能名称 = 技能序列.map((文本: string) => {
      const 位置 = 文本.indexOf('%')
      const 技能名 = (位置 < 0 ? 文本 : 文本.slice(0, 位置)).trim()
      if (!技能数据.some((项) => 项.技能名称 === 技能名))
        throw new Error(`${名称}：未知技能“${技能名}”`)
      if (位置 >= 0) {
        const 参数 = JSON.parse(文本.slice(位置 + 1))
        if (!参数 || typeof 参数 !== 'object' || Array.isArray(参数))
          throw new Error(`${名称}：${技能名}的参数必须是 JSON 对象`)
      }
      return 技能名
    })
    if (技能名称.includes('切换武器'))
      throw new Error(`${名称}：批量合并不支持循环中切换武器，请拆为单一武器序列`)
    const 橙武序列 = 无界心法 ? 大橙武模拟 : 技能名称.includes('触发橙武')
    const 武器类型 = 橙武序列 ? ('橙武' as const) : ('紫武' as const)
    if (校验腰坠 && !技能名称.includes('特效腰坠'))
      throw new Error(`${名称}：未使用特效腰坠，请补充技能或取消腰坠校验`)
    const 范围 = 序列.按阈值选择
      ? 获取阈值选择范围(阈值, 序列.选中阈值, 99999)
      : 解析手动加速范围(序列.加速输入)
    if (!范围.length || !序列.延迟.length) throw new Error(`${名称}：请至少选择一个加速阈值和延迟`)
    return 序列.延迟.flatMap((延迟) =>
      范围.map((加速范围) => ({
        序列: { ...序列, 名称, 武器类型 },
        技能序列: 技能序列.map((项: string) => 项.trim()),
        加速范围,
        延迟,
      })),
    )
  })
  if (new Set(任务.map((项) => 项.序列.武器类型)).size > 1)
    throw new Error('橙武与紫武序列不能一起合并：请按是否包含“触发橙武”分批处理')
  const 武器类型 = 任务[0].序列.武器类型
  if ((武器类型 === '橙武') !== 大橙武模拟)
    throw new Error(`${武器类型}序列与当前装备不符，请先切换配装；紫武序列穿橙武会混入 CW·神兵伤害`)
  return 任务
}

export const 执行批量计算 = async (选项: {
  心法: string
  名称: string
  任务: 模拟任务[]
  公共参数: Record<string, any>
  worker: Worker
  signal: AbortSignal
  计算秒伤: (详情: 循环详情) => number
  更新进度: (记录: 计算进度[]) => void
}): Promise<批量计算结果> => {
  const { 心法, 名称, 任务, 公共参数, worker, signal, 计算秒伤, 更新进度 } = 选项
  const 循环映射 = new Map<number, 循环数据>()
  const 记录: 计算进度[] = []
  let 线程异常 = false
  for (const { 序列, 技能序列, 加速范围, 延迟 } of 任务) {
    signal.throwIfAborted()
    const 当前记录: 计算进度 = { 序列名称: 序列.名称, 加速: 加速范围[0], 延迟 }
    try {
      const 结果 = await new Promise<{ 战斗时间: number; 技能详情: 循环详情['技能详情'] }>(
        (resolve, reject) => {
          const 取消 = () => {
            清理()
            reject(new Error('计算已取消'))
          }
          const 清理 = () => {
            signal.removeEventListener('abort', 取消)
            worker.onmessage = null
            worker.onerror = null
          }
          signal.addEventListener('abort', 取消, { once: true })
          worker.onmessage = ({ data }) => {
            清理()
            data.错误 ? reject(new Error(data.错误)) : resolve(data.结果)
          }
          worker.onerror = (事件) => {
            清理()
            线程异常 = true
            reject(new Error(事件.message || '模拟线程加载失败'))
          }
          worker.postMessage({
            心法,
            参数: {
              ...序列.心法配置,
              ...公共参数,
              起手Buff配置: 序列.起手Buff配置,
              测试循环: 技能序列,
              加速值: 加速范围[0],
              网络延迟: 延迟,
            },
          })
        },
      )
      signal.throwIfAborted()
      const 详情: 循环详情 = {
        ...结果,
        循环加速值范围: 加速范围,
        循环延迟要求: 延迟,
        技能序列名称: 序列.名称,
      }
      if (
        序列.武器类型 === '紫武' &&
        详情.技能详情.some((技能) => /神兵|CW·/.test(技能.技能名称))
      ) {
        throw new Error('紫武序列产生了橙武伤害，请核对装备和序列')
      }
      详情.模拟器快照秒伤 = 计算秒伤(详情)
      if (!Number.isFinite(详情.模拟器快照秒伤) || 详情.模拟器快照秒伤 <= 0)
        throw new Error('未得到有效快照 DPS，请检查当前配装和输出技能')
      当前记录.详情 = 详情
      let 循环 = 循环映射.get(序列.编号)
      if (!循环) {
        循环 = {
          名称: 序列.名称,
          标题: 序列.名称,
          类型: '自定义',
          标记: '自定义',
          提供者: '模拟',
          奇穴: 公共参数.奇穴,
          秘籍: 公共参数.秘籍,
          强制加速要求: true,
          循环详情: [],
          技能序列,
          起手Buff配置: 序列.起手Buff配置,
          模拟器配置: 序列.心法配置,
          武器类型: 序列.武器类型,
          额外配置信息: {
            ...序列.心法配置,
            ...(心法 === '无方'
              ? {
                  潮生每秒回复: 序列.心法配置.启用回蓝五彩石 ? 序列.心法配置.回蓝五彩石每秒回复 : 0,
                }
              : {}),
          },
        }
        循环映射.set(序列.编号, 循环)
      }
      循环.循环详情.push(详情)
    } catch (错误) {
      signal.throwIfAborted()
      if (线程异常) throw 错误
      当前记录.错误 = 错误 instanceof Error ? 错误.message : String(错误)
    }
    记录.push(当前记录)
    更新进度([...记录])
  }
  const 循环列表 = [...循环映射.values()]
  if (!循环列表.length) throw new Error('所有轮次均失败，未生成合并循环，请查看失败原因')
  const { 选中索引 } = 选择同档位高秒伤(循环列表)
  const 合并 = 生成合并循环(循环列表, 循环列表[0], 选中索引, true)
  if ('错误' in 合并) throw new Error(合并.错误)
  return {
    循环: {
      ...合并.数据,
      名称,
      标题: 名称,
      循环详情: 排序循环详情(合并.数据.循环详情, '延迟').map((项) => 项.详情),
      备注: `循环加速值细化为：${[...new Set(合并.数据.循环详情.map((项) => 项.循环加速值范围![0]))].sort((a, b) => Number(a) - Number(b)).join('｜')}`,
    },
    记录,
  }
}
