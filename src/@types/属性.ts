/**
 * 剑3内置的属性名对照表
 * 参考文章：https://www.jx3box.com/tool/8137
 * 具体该技能/Buff加成类型请自行查阅对应属性名称
 * 部分命名为精简后自定义
 * 由于已经基本不存在针对某一内功属性的增伤，所以将混元｜毒性｜阳性｜阴性合并为内功XX
 */

/**
 * @description 属性说明
 *
 * 基础数值
 * - 没有加“郭氏”和“百分比”的数值，为具体数值
 *
 * 郭氏XX
 * - 郭氏XX代表 该值在实际计算时参与 郭氏计算
 * - 公式：值 / 1024
 * - 即：剑纯阵眼会心效果 郭氏值为 150，实际会心效果加成为 150 / 1024
 *
 * XX百分比
 * - XX百分比代表直接百分比计算，常见于会心加成
 * - 公式：值 / 10000
 * - 即：门派套装 外功会心百分比 400，实际加成为 400 / 10000 (4%)
 */

export enum 属性类型 {
  // 体制、气血，蓝量相关
  体质 = 'atVitalityBase',
  郭氏体质 = 'atVitalityBasePercentAdd',
  基础气血上限 = 'atMaxLifeBase',
  额外气血上限 = 'atMaxLifeAdditional',
  每秒内力恢复 = 'atManaReplenishExt',
  郭氏基础气血上限 = 'atMaxLifePercentAdd', // 郭氏
  郭氏最终气血上限 = 'atFinalMaxLifeAddPercent', // 郭氏

  // 基础属性
  全属性 = 'atBasePotentialAdd',
  力道 = 'atStrengthBase',
  元气 = 'atSpunkBase',
  身法 = 'atAgilityBase',
  根骨 = 'atSpiritBase',
  郭氏力道 = 'atStrengthBasePercentAdd',
  郭氏身法 = 'atAgilityBasePercentAdd',
  郭氏根骨 = 'atSpiritBasePercentAdd',
  郭氏元气 = 'atSpunkBasePercentAdd',
  // 会心
  全会心等级 = 'atAllTypeCriticalStrike',
  外功会心等级 = 'atPhysicsCriticalStrike',
  内功会心等级 = 'atMagicCriticalStrike',

  全会心百分比 = 'atAllCriticalStrikeBaseRate',
  外功会心百分比 = 'atPhysicsCriticalStrikeBaseRate',
  内功会心百分比 = 'atMagicCriticalStrikeBaseRate',

  // 会心效果
  全会心效果等级 = 'atAllTypeCriticalDamagePowerBase',
  外功会心效果等级 = 'atPhysicsCriticalDamagePowerBase',
  内功会心效果等级 = 'atMagicCriticalDamagePowerBase',

  郭氏突破上限会心效果等级 = 'atUnlimitCriticalDamagePowerKiloNumRate',
  郭氏全会心效果等级 = 'atAllCriticalDamagePowerBaseKiloNumRate',
  郭氏外功会心效果等级 = 'atPhysicsCriticalDamagePowerBaseKiloNumRate',
  郭氏内功会心效果等级 = 'atMagicCriticalDamagePowerBaseKiloNumRate',

  // 破防
  全破防等级 = 'atAllOvercome',
  外功破防等级 = 'atPhysicsOvercomeBase',
  内功破防等级 = 'atMagicOvercome',

  郭氏全破防等级 = 'atAllOvercomePercent',
  郭氏外功破防等级 = 'atPhysicsOvercomePercent',
  郭氏内功破防等级 = 'atMagicOvercomePercent',

  // 基础攻击
  全基础攻击 = 'allAttackPowerBase',
  外功基础攻击 = 'atPhysicsAttackPowerBase',
  内功基础攻击 = 'atMagicAttackPowerBase',

  郭氏全基础攻击 = 'allAttackPowerPercent',
  郭氏外功基础攻击 = 'atPhysicsAttackPowerPercent',
  郭氏内功基础攻击 = 'atMagicAttackPowerPercent',

  // 面板攻击
  面板攻击 = 'toPhysicsAttackPowerCof',

  // 无视防御
  郭氏外功基础防御 = 'atPhysicsShieldPercent',
  郭氏内功基础防御 = 'atMagicShieldPercent', // 合并 atPoisonMagicShieldPercent atSolarMagicShieldPercent atNeutralMagicShieldPercent atLunarMagicShieldPercent
  内功基础防御 = 'atMagicShield',
  外功基础防御 = 'atPhysicsShieldBase',
  郭氏全无视防御 = 'atAllShieldIgnorePercent',

  // 加速等级
  加速等级 = 'atHasteBase',
  郭氏加速等级 = 'atHasteBasePercentAdd',
  郭氏突破上限加速 = 'atUnlimitHasteBasePercentAdd',

  // 无双全能
  全能等级 = 'atPVXAllRound',
  无双等级 = 'atStrainBase',
  郭氏无双 = 'atStrainPercent',
  郭氏额外无双 = 'atStrainRate',

  // 武器伤害
  武器伤害 = 'atMeleeWeaponDamageBase',
  郭氏武器伤害 = 'atMeleeWeaponDamagePercent',

  // 技能增伤 同类增伤相加计算，系数增伤相乘计算。具体看计算公式
  全局伤害因子 = 'atGlobalSkillDamageFactorAdd', // Generator: global_damage_cof（旧名 global_damage_factor，全局伤害乘区）
  目标移动状增伤 = 'atSkillDamageDstMoveStateAdd', // Generator: move_state_damage_gain（移动状态乘区）
  通用增伤 = 'atSkillDamageCommonAdd', // Generator: all_damage_gain + physical_damage_gain / magical_damage_gain（通用增伤乘区）
  易伤增伤 = 'atSkillDamageFragileAdd', // Generator: {元素}_damage_cof（易伤乘区），与技能 coming_damage_cof 同乘区相加
  最终增伤 = 'atActivityDamageFinalCof', // Generator: 无 activity 独立字段，数据对应 skill_damage_gain（如仙姿）
  职业最终增伤 = 'atSkillDamageFinalCof', // Generator: skill_damage_gain（旧名 skill_damage_final_cof）
  非侠增伤 = 'atSkillDamageNPCAdd', // Generator: pve_damage_gain（旧名 pve_damage_cof）
  技能独立增伤 = 'atSkillDamageCof', // Generator: skill_damage_cof，技能自身独立乘区，同类相加
  系数增伤 = 'atSkillCoefficientAdd', // Generator: 无独立乘区，内嵌技能系数 frames / attack_power_cof
  系数置换函数 = 'atSkillCoefficientReplace', // Generator: 无对应，补丁直接改技能系数 / 自定义伤害

  // T增益
  郭氏体质转基础攻击 = 'atVitalityToAttackPower',
  郭氏体质转全会心 = 'atVitalityToCriticalStrike',
  郭氏体质转全破防 = 'atVitalityToOvercome',

  // 瞎编的便于计算的
  主属性 = 'atMainPotential', // 主属性，力道、身法、元气、根骨
}

export interface 属性加成 {
  属性: 属性类型
  值: number | any
  // 值: number | ((level: number) => number)
}
