import { 属性类型 } from '@/@types/属性'
import { 五彩石增益类型枚举 } from '@/@types/枚举'

export const 五彩石导入函数 = (list) => {
  return list
    .map((item) => {
      const name = item.Name || '数据丢失-未知'
      const i: Array<{
        增益数值: number
        增益名称: 五彩石增益类型枚举
        增益类型: 属性类型 | '未知'
      }> = []
      if (item.Attribute1ID) {
        i.push({
          增益数值: +item.Attribute1Value1,
          增益名称: WuCaiShiGainNameMeiju[item.Attribute1ID] || '未知',
          增益类型: 属性枚举[item.Attribute1ID] || '未知',
        })
      }
      if (item.Attribute2ID) {
        i.push({
          增益数值: +item.Attribute2Value1,
          增益名称: WuCaiShiGainNameMeiju[item.Attribute2ID] || '未知',
          增益类型: 属性枚举[item.Attribute2ID] || '未知',
        })
      }
      if (item.Attribute3ID) {
        i.push({
          增益数值: +item.Attribute3Value1,
          增益名称: WuCaiShiGainNameMeiju[item.Attribute3ID] || '未知',
          增益类型: 属性枚举[item.Attribute3ID] || '未知',
        })
      }
      if (i.some((item) => item.增益类型 === '未知')) {
        return null
      } else {
        return {
          五彩石名称: name,
          五彩石等级: +item.stone_level,
          装备增益: i,
          DiamondCount1: item.DiamondCount1,
          DiamondCount2: item.DiamondCount2,
          DiamondCount3: item.DiamondCount3,
          DiamondIntensity1: item.DiamondIntensity1,
          DiamondIntensity2: item.DiamondIntensity2,
          DiamondIntensity3: item.DiamondIntensity3,
        }
      }
    })
    .filter((item) => item)
}

const WuCaiShiGainNameMeiju = {
  // atVitalityBase: 五彩石增益类型枚举.体质,
  atStrengthBase: 五彩石增益类型枚举.力道,
  atAgilityBase: 五彩石增益类型枚举.身法,
  atSpunkBase: 五彩石增益类型枚举.元气,
  atSpiritBase: 五彩石增益类型枚举.根骨,
  atHasteBase: 五彩石增益类型枚举.加速等级,
  atStrainBase: 五彩石增益类型枚举.无双等级,
  // atPVXAllRound: 五彩石增益类型枚举.全能等级,
  atMeleeWeaponDamageBase: 五彩石增益类型枚举.武器伤害,
  atPhysicsAttackPowerBase: 五彩石增益类型枚举.外功基础攻击,
  atPhysicsCriticalStrike: 五彩石增益类型枚举.会心等级,
  atPhysicsCriticalDamagePowerBase: 五彩石增益类型枚举.会心效果等级,
  atPhysicsOvercomeBase: 五彩石增益类型枚举.破防等级,

  atMagicAttackPowerBase: 五彩石增益类型枚举.内功基础攻击,
  atPoisonAttackPowerBase: 五彩石增益类型枚举.内功基础攻击,
  atSolarAttackPowerBase: 五彩石增益类型枚举.内功基础攻击,
  atNeutralAttackPowerBase: 五彩石增益类型枚举.内功基础攻击,
  atLunarAttackPowerBase: 五彩石增益类型枚举.内功基础攻击,

  atAllTypeCriticalStrike: 五彩石增益类型枚举.会心等级,
  atMagicCriticalStrike: 五彩石增益类型枚举.会心等级,
  atNeutralCriticalStrike: 五彩石增益类型枚举.会心等级,
  atSolarCriticalStrike: 五彩石增益类型枚举.会心等级,
  atPoisonCriticalStrike: 五彩石增益类型枚举.会心等级,
  atLunarCriticalStrike: 五彩石增益类型枚举.会心等级,

  atMagicCriticalDamagePowerBase: 五彩石增益类型枚举.会心效果等级,
  atAllTypeCriticalDamagePowerBase: 五彩石增益类型枚举.会心效果等级,

  atMagicOvercome: 五彩石增益类型枚举.破防等级,
  atPoisonOvercomeBase: 五彩石增益类型枚举.破防等级,
  atNeutralOvercomeBase: 五彩石增益类型枚举.破防等级,
  atSolarOvercomeBase: 五彩石增益类型枚举.破防等级,
  atLunarOvercomeBase: 五彩石增益类型枚举.破防等级,
  atSolarAndLunarOvercomeBase: 五彩石增益类型枚举.破防等级,
}

export const 属性枚举 = {
  atVitalityBase: 属性类型.体质,
  atStrengthBase: 属性类型.力道,
  atAgilityBase: 属性类型.身法,
  atSpunkBase: 属性类型.元气,
  atSpiritBase: 属性类型.根骨,
  atHasteBase: 属性类型.加速等级,
  atStrainBase: 属性类型.无双等级,
  atPVXAllRound: 属性类型.全能等级,
  atMeleeWeaponDamageBase: 属性类型.武器伤害,
  atPhysicsAttackPowerBase: 属性类型.外功基础攻击,
  atPhysicsCriticalStrike: 属性类型.外功会心等级,
  atPhysicsCriticalDamagePowerBase: 属性类型.外功会心效果等级,
  atPhysicsOvercomeBase: 属性类型.外功破防等级,

  atMagicAttackPowerBase: 属性类型.内功基础攻击,
  atPoisonAttackPowerBase: 属性类型.内功基础攻击,
  atSolarAttackPowerBase: 属性类型.内功基础攻击,
  atNeutralAttackPowerBase: 属性类型.内功基础攻击,
  atLunarAttackPowerBase: 属性类型.内功基础攻击,

  atAllTypeCriticalStrike: 属性类型.全会心等级,
  atMagicCriticalStrike: 属性类型.内功会心等级,
  atNeutralCriticalStrike: 属性类型.内功会心等级,
  atSolarCriticalStrike: 属性类型.内功会心等级,
  atPoisonCriticalStrike: 属性类型.内功会心等级,
  atLunarCriticalStrike: 属性类型.内功会心等级,

  atMagicCriticalDamagePowerBase: 属性类型.内功会心效果等级,
  atAllTypeCriticalDamagePowerBase: 属性类型.全会心效果等级,

  atMagicOvercome: 属性类型.内功破防等级,
  atPoisonOvercomeBase: 属性类型.内功破防等级,
  atNeutralOvercomeBase: 属性类型.内功破防等级,
  atSolarOvercomeBase: 属性类型.内功破防等级,
  atLunarOvercomeBase: 属性类型.内功破防等级,
  atSolarAndLunarOvercomeBase: 属性类型.内功破防等级,
}
