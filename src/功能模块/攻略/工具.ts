import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 奇穴数据类型 } from '@/@types/奇穴'
import { 装备属性信息模型 } from '@/@types/装备'
import { 附魔数据类型 } from '@/@types/附魔'
import { 团队增益数据类型 } from '@/@types/团队增益'

/** 获取当前心法的奇穴数据映射（奇穴名称 -> 奇穴数据） */
export const 获取奇穴数据映射 = (): Record<string, 奇穴数据类型> => {
  const { 奇穴数据 = [] } = 获取当前数据()
  const 映射: Record<string, 奇穴数据类型> = {}
  奇穴数据?.forEach((重) => {
    重?.奇穴列表?.forEach((奇穴) => {
      映射[奇穴?.奇穴名称] = 奇穴
    })
  })
  return 映射
}

/** 根据装备 id 查找装备数据（跨部位） */
export const 根据装备id获取装备数据 = (id: number): 装备属性信息模型 | undefined => {
  const { 装备数据 = {} } = 获取当前数据()
  for (const 部位 of Object.keys(装备数据)) {
    const 命中 = 装备数据?.[部位]?.find((item) => String(item?.id) === String(id))
    if (命中) return 命中
  }
  return undefined
}

export { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'

/** 根据增益名称查找团队增益数据 */
export const 根据增益名称获取增益数据 = (名称: string): 团队增益数据类型 | undefined => {
  const { 团队增益 = [] } = 获取当前数据()
  return 团队增益?.find((item) => item?.增益名称 === 名称)
}

/** 属性简写映射 */
export const 属性简写枚举: Record<string, string> = {
  atBasePotentialAdd: '全属',
  atVitalityBase: '体质',
  atMaxLifeBase: '气血',
  atMaxLifeAdditional: '额外气血',
  atStrengthBase: '力道',
  atSpunkBase: '元气',
  atAgilityBase: '身法',
  atSpiritBase: '根骨',
  atPVXAllRound: '全能',
  allAttackPowerBase: '攻击',
  atPhysicsAttackPowerBase: '攻击',
  atMagicAttackPowerBase: '攻击',
  atAllTypeCriticalStrike: '会心',
  atPhysicsCriticalStrike: '会心',
  atMagicCriticalStrike: '会心',
  atAllTypeCriticalDamagePowerBase: '会效',
  atPhysicsCriticalDamagePowerBase: '会效',
  atMagicCriticalDamagePowerBase: '会效',
  atPhysicsOvercomeBase: '破防',
  atAllOvercome: '破防',
  atMagicOvercome: '破防',
  atMeleeWeaponDamageBase: '武伤',
  atStrainBase: '无双',
  atHasteBase: '加速',
}

export const 兜底图片 = 'https://icon.jx3box.com/icon/13.png'

/** 属性标签颜色映射（与配装器装备属性详情 ColorMap 保持一致） */
export const 属性颜色映射: Record<string, string> = {
  体质: 'magenta',
  攻击: 'red',
  力道: 'purple',
  身法: 'purple',
  根骨: 'purple',
  元气: 'purple',
  会心: 'orange',
  会效: 'gold',
  破防: 'lime',
  无双: 'cyan',
  加速: 'blue',
  武伤: 'geekblue',
  全能: 'purple',
}

/** 装备卡不展示的基础属性（体质、攻击、主属性） */
export const 装备不展示属性 = new Set(['体质', '攻击', '全属', '力道', '元气', '身法', '根骨'])
