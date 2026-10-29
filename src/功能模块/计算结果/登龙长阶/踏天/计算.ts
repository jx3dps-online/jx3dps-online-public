import type { 装备信息数据类型 } from '@/@types/装备'
import { 装备相同, 配对装备 } from '../领域/计算'
import type { 登阶分析, 登阶差异 } from '../领域/类型'
import { 计算完成度 } from '../领域/完成度'
import { 填充文案 } from '../文案'
import { 踏天主动完成比例 } from './类型'
import type { 登阶文案 } from '../文案'
import type { 踏天状态, 踏天认可 } from './类型'

export const 合意键 = (项: Pick<登阶差异, '类别' | '部位'>) =>
  ['大附魔', '五彩石'].includes(项.类别) ? 项.类别 + ':' + 项.部位 : '部位:' + 项.部位
/** 合意键的展示名：部位直接显示，大附魔/五彩石带上类别，避免出现「五彩石:五彩石」。 */
export const 合意显示名 = (键: string, 文案: 登阶文案) => {
  const [类别, 部位] = 键.split(':')
  return 类别 === '部位' || 类别 === 部位
    ? 部位
    : 填充文案(文案['踏天.计算.合意显示名'], { 类别, 部位 })
}
const 大附魔位置: Record<string, string> = {
  帽子: '伤帽',
  衣服: '伤衣',
  腰带: '伤腰',
  护腕: '伤腕',
  鞋子: '伤鞋',
}
export const 装备签名 = (装备: 装备信息数据类型) =>
  JSON.stringify([
    装备.装备列表,
    装备.五彩石,
    Object.values(大附魔位置).map((位置) => 装备.装备增益?.['大附魔_' + 位置] || 0),
  ])
export function 获取认可签名(
  当前: 装备信息数据类型,
  目标: 装备信息数据类型,
  键: string,
): 踏天认可 | undefined {
  const [类别, 部位] = 键.split(':')
  if (类别 === '部位') {
    const 对 = 配对装备(当前, 目标).find((项) => 项.部位 === 部位)
    if (!对?.当前装备?.id) return undefined
    return { 当前签名: JSON.stringify(对.当前装备), 参考签名: JSON.stringify(对.目标装备) }
  }
  if (类别 === '五彩石' && 部位 === '五彩石')
    return { 当前签名: 当前.五彩石 || '', 参考签名: 目标.五彩石 || '' }
  if (类别 === '大附魔' && 大附魔位置[部位]) {
    const 装备 = 当前.装备列表.find((项) => 项.装备部位 === 部位)
    const 目标装备 = 目标.装备列表.find((项) => 项.装备部位 === 部位)
    if (!装备?.id) return undefined
    const 属性 = '大附魔_' + 大附魔位置[部位]
    return {
      当前签名: JSON.stringify([装备.id, 当前.装备增益?.[属性] || 0]),
      参考签名: JSON.stringify([目标装备?.id, 目标.装备增益?.[属性] || 0]),
    }
  }
  return undefined
}
/** 建议相对身装实际改动的部位与事项，用于从建议卡片直接提交认可。 */
export function 建议合意键(
  当前: 装备信息数据类型,
  目标: 装备信息数据类型,
  建议: 装备信息数据类型,
): string[] {
  const 键 = new Set<string>()
  配对装备(当前, 目标).forEach(({ 当前索引, 当前装备, 部位 }) => {
    if (当前索引 < 0) return
    const 建议装备 = 建议.装备列表?.[当前索引]
    if (!建议装备) return
    const 槽变化 =
      !装备相同(当前装备, 建议装备) ||
      (当前装备?.当前精炼等级 || 0) !== (建议装备.当前精炼等级 || 0) ||
      (当前装备?.附魔 || '') !== (建议装备.附魔 || '') ||
      JSON.stringify(当前装备?.镶嵌孔数组 || []) !== JSON.stringify(建议装备.镶嵌孔数组 || [])
    if (槽变化) 键.add('部位:' + 部位)
  })
  Object.entries(大附魔位置).forEach(([部位, 位置]) => {
    const 属性 = '大附魔_' + 位置
    if ((当前.装备增益?.[属性] || 0) !== (建议.装备增益?.[属性] || 0)) 键.add('大附魔:' + 部位)
  })
  if ((当前.五彩石 || '') !== (建议.五彩石 || '')) 键.add('五彩石:五彩石')
  return [...键]
}
export function 应用踏天认可(
  分析: 登阶分析,
  当前: 装备信息数据类型,
  目标: 装备信息数据类型,
  认可: 踏天状态['替代认可'] = {},
) {
  const 有效 = Object.keys(认可).filter((键) => {
    const 新 = 获取认可签名(当前, 目标, 键)
    return 新 && 新.当前签名 === 认可[键].当前签名 && 新.参考签名 === 认可[键].参考签名
  })
  const 接纳 = 分析.差异.filter((项) => 有效.includes(合意键(项)))
  const 分类进度 = 分析.分类进度.map((项) => ({
    ...项,
    完成数: 项.完成数 + 接纳.filter((差异) => 差异.类别 === 项.名称).length,
  }))
  return {
    有效,
    分析: {
      ...分析,
      分类进度,
      完成数: 分析.完成数 + 接纳.length,
      差异: 分析.差异.filter((项) => !有效.includes(合意键(项))),
      建议: 分析.建议.filter(
        (项) =>
          !有效.some(
            (键) =>
              获取认可签名(当前, 目标, 键)?.当前签名 !==
              获取认可签名(项.装备信息, 目标, 键)?.当前签名,
          ),
      ),
      部位进度: 分析.部位进度.map((项) => ({
        ...项,
        已达成: 项.已达成 || 有效.includes('部位:' + 项.部位),
      })),
    },
  }
}
export const 有效秒伤 = (值?: number): 值 is number =>
  typeof 值 === 'number' && Number.isFinite(值) && 值 > 0
export const 可主动踏天 = (当前?: number, 目标?: number) =>
  有效秒伤(当前) && 有效秒伤(目标) && 当前 >= 目标 * 踏天主动完成比例
export function 计算踏天完成度(
  输入: Parameters<typeof 计算完成度>[0],
  门槛: number | undefined,
  文案: 登阶文案,
): ReturnType<typeof 计算完成度> {
  if (!有效秒伤(门槛) || !有效秒伤(输入.目标DPS) || 输入.目标DPS <= 门槛) {
    return {
      完成度: undefined,
      待评估原因: 文案['踏天.计算.待评估'],
      部位比例: 0,
    }
  }
  return 计算完成度({ ...输入, 起点容量: undefined, 起点DPS: 门槛 }, 文案)
}
