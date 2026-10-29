// 等级因子
const LevelFactor = (level: number) => {
  let res = 0
  // if (level <= 15) {
  //   res = 50
  // } else if (15 <= level && level < 90) {
  //   res = 4 * level - 10
  // } else if (90 <= level && level < 95) {
  //   res = 85 * (level - 90) + 350
  // } else if (95 <= level && level < 100) {
  //   res = 185 * (level - 95) + 775
  // } else if (100 <= level && level < 110) {
  //   res = 205 * (level - 100) + 1700
  // } else if (110 <= level && level < 130) {
  //   res = 450 * (level - 110) + 3750
  // }
  if (level <= 30) {
    return 330
  } else {
    return 33 * level - 660
  }
  // return res
}

// 计算基础常量
export const GlobalParams = (level: number) => {
  const levelFactor = LevelFactor(level)

  const 会心 = BaseGlobalParams.fCriticalStrikeParam * levelFactor
  const 会效 = BaseGlobalParams.fCriticalStrikePowerParam * levelFactor
  const 命中 = BaseGlobalParams.fHitValueParam * levelFactor
  const 无双 = BaseGlobalParams.fInsightParam * levelFactor
  const BOSS防御 = BaseGlobalParams.fPhysicsShieldParam * levelFactor
  const 破防 = BaseGlobalParams.fOvercomeParam * levelFactor
  const 加速 = BaseGlobalParams.fHasteRate * levelFactor
  const 外防 = BaseGlobalParams.fPhysicsShieldParam * levelFactor
  const 内防 = BaseGlobalParams.fMagicShieldParam * levelFactor
  const 化劲 = BaseGlobalParams.fDecriticalStrikePowerParam * levelFactor
  const 御劲 = BaseGlobalParams.fDefCriticalStrikeParam * levelFactor

  const 御劲减会效 = BaseGlobalParams.fToughnessDecirDamageCof * levelFactor

  return { 会心, 会效, 命中, 无双, BOSS防御, 破防, 加速, 外防, 内防, 化劲, 御劲, 御劲减会效 }
}

// 基础计算系数
export const BaseGlobalParams = {
  fPlayerCriticalCof: 0.75, // 会效起点
  fCriticalStrikeParam: 9.53, // 会心
  fCriticalStrikePowerParam: 3.335, // 会效
  fDefCriticalStrikeParam: 9.53, // 御劲
  fDecriticalStrikePowerParam: 1.38, // 化劲
  fHitValueParam: 6.931, // 命中
  fDodgeParam: 3.703, // 闪躲
  fParryParam: 4.345, // 招架
  fInsightParam: 9.189, // 无双
  fPhysicsShieldParam: 5.091, // 外防
  fMagicShieldParam: 5.091, // 内防
  fOvercomeParam: 9.53, // 破防
  fHasteRate: 11.695, // 加速
  fToughnessDecirDamageCof: 2.557, // 御劲减会效
  // fSurplusParam: 13.192, // 破招
  fAssistedPowerCof: 9.53, // 侠客属性
}
