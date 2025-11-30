/**
 * @name 装备部位
 */
export enum 装备部位枚举 {
  帽子 = '帽子',
  衣服 = '衣服',
  腰带 = '腰带',
  护腕 = '护腕',
  下装 = '下装',
  鞋子 = '鞋子',
  项链 = '项链',
  腰坠 = '腰坠',
  戒指 = '戒指',
  暗器 = '暗器',
  武器 = '武器',
}

export enum 小吃类型枚举 {
  药品辅助 = '药品辅助',
  药品增强 = '药品增强',
  食品辅助 = '食品辅助',
  食品增强 = '食品增强',
  武器磨石 = '武器磨石',
  家园菜品 = '家园菜品',
  家园酒品 = '家园酒品',
  家园香水 = '家园香水',
  团队宴席 = '团队宴席',
}

export enum 五彩石增益类型枚举 {
  全属性 = '全属',
  力道 = '力道',
  身法 = '身法',
  元气 = '元气',
  根骨 = '根骨',
  体质 = '体质',
  外功基础攻击 = '外攻',
  内功基础攻击 = '内攻',
  破防等级 = '破防',
  会心效果等级 = '会效',
  武器伤害 = '武伤',
  加速等级 = '加速',
  会心等级 = '会心',
  无双等级 = '无双',
  破招值 = '破招',
  力道百分比 = '力道百分比',
  身法百分比 = '身法百分比',
  元气百分比 = '元气百分比',
  根骨百分比 = '根骨百分比',
  体质百分比 = '体质百分比',
}

export const 属性简写枚举 = {
  atBasePotentialAdd: '全属',
  atVitalityBase: '体质',
  atMaxLifeBase: '气血',
  atMaxLifeAdditional: '额外气血',
  atStrengthBase: '力道',
  atSpunkBase: '元气',
  atAgilityBase: '身法',
  atSpiritBase: '根骨',
  atPVXAllRound: '全能',

  atSurplusValueBase: '破招',
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
