/**
 * Buff属性key → 中文名称映射
 * 基于 Generator/tools/lua/enums.py 的 ATTRIBUTE_TYPE
 * 和 src/@types/属性.ts 的属性类型定义
 */

import { 属性类型 } from '@/@types/属性'
import type { GainType } from './类型定义'

interface AttributeDisplayInfo {
  key: string
  label: string
  属性类型值?: 属性类型
  gainType: GainType
}

const map: Record<string, AttributeDisplayInfo> = {
  // 主属性
  vitality_base: {
    key: 'vitality_base',
    label: '体质',
    属性类型值: 属性类型.体质,
    gainType: '属性增益',
  },
  agility_base: {
    key: 'agility_base',
    label: '身法',
    属性类型值: 属性类型.身法,
    gainType: '属性增益',
  },
  strength_base: {
    key: 'strength_base',
    label: '力道',
    属性类型值: 属性类型.力道,
    gainType: '属性增益',
  },
  spirit_base: {
    key: 'spirit_base',
    label: '根骨',
    属性类型值: 属性类型.根骨,
    gainType: '属性增益',
  },
  spunk_base: { key: 'spunk_base', label: '元气', 属性类型值: 属性类型.元气, gainType: '属性增益' },
  all_major_base: {
    key: 'all_major_base',
    label: '全属性',
    属性类型值: 属性类型.全属性,
    gainType: '属性增益',
  },

  // 基础攻击
  physical_attack_power_base: {
    key: 'physical_attack_power_base',
    label: '外功基础攻击',
    属性类型值: 属性类型.外功基础攻击,
    gainType: '属性增益',
  },
  solar_attack_power_base: {
    key: 'solar_attack_power_base',
    label: '阳性基础攻击',
    gainType: '属性增益',
  },
  lunar_attack_power_base: {
    key: 'lunar_attack_power_base',
    label: '阴性基础攻击',
    gainType: '属性增益',
  },
  solar_and_lunar_attack_power_base: {
    key: 'solar_and_lunar_attack_power_base',
    label: '阴阳基础攻击',
    gainType: '属性增益',
  },
  neutral_attack_power_base: {
    key: 'neutral_attack_power_base',
    label: '混元基础攻击',
    gainType: '属性增益',
  },
  poison_attack_power_base: {
    key: 'poison_attack_power_base',
    label: '毒性基础攻击',
    gainType: '属性增益',
  },
  magical_attack_power_base: {
    key: 'magical_attack_power_base',
    label: '内功基础攻击',
    属性类型值: 属性类型.内功基础攻击,
    gainType: '属性增益',
  },
  all_attack_power_base: {
    key: 'all_attack_power_base',
    label: '全基础攻击',
    属性类型值: 属性类型.全基础攻击,
    gainType: '属性增益',
  },

  // 破防
  physical_overcome_base: {
    key: 'physical_overcome_base',
    label: '外功破防等级',
    属性类型值: 属性类型.外功破防等级,
    gainType: '属性增益',
  },
  solar_overcome_base: { key: 'solar_overcome_base', label: '阳性破防等级', gainType: '属性增益' },
  lunar_overcome_base: { key: 'lunar_overcome_base', label: '阴性破防等级', gainType: '属性增益' },
  solar_and_lunar_overcome_base: {
    key: 'solar_and_lunar_overcome_base',
    label: '阴阳破防等级',
    gainType: '属性增益',
  },
  neutral_overcome_base: {
    key: 'neutral_overcome_base',
    label: '混元破防等级',
    gainType: '属性增益',
  },
  poison_overcome_base: {
    key: 'poison_overcome_base',
    label: '毒性破防等级',
    gainType: '属性增益',
  },
  magical_overcome_base: {
    key: 'magical_overcome_base',
    label: '内功破防等级',
    属性类型值: 属性类型.内功破防等级,
    gainType: '属性增益',
  },
  all_overcome_base: {
    key: 'all_overcome_base',
    label: '全破防等级',
    属性类型值: 属性类型.全破防等级,
    gainType: '属性增益',
  },

  // 会心
  physical_critical_strike_base: {
    key: 'physical_critical_strike_base',
    label: '外功会心等级',
    属性类型值: 属性类型.外功会心等级,
    gainType: '会心会效',
  },
  solar_critical_strike_base: {
    key: 'solar_critical_strike_base',
    label: '阳性会心等级',
    gainType: '会心会效',
  },
  lunar_critical_strike_base: {
    key: 'lunar_critical_strike_base',
    label: '阴性会心等级',
    gainType: '会心会效',
  },
  solar_and_lunar_critical_strike_base: {
    key: 'solar_and_lunar_critical_strike_base',
    label: '阴阳会心等级',
    gainType: '会心会效',
  },
  neutral_critical_strike_base: {
    key: 'neutral_critical_strike_base',
    label: '混元会心等级',
    gainType: '会心会效',
  },
  poison_critical_strike_base: {
    key: 'poison_critical_strike_base',
    label: '毒性会心等级',
    gainType: '会心会效',
  },
  magical_critical_strike_base: {
    key: 'magical_critical_strike_base',
    label: '内功会心等级',
    属性类型值: 属性类型.内功会心等级,
    gainType: '会心会效',
  },
  all_critical_strike_base: {
    key: 'all_critical_strike_base',
    label: '全会心等级',
    属性类型值: 属性类型.全会心等级,
    gainType: '会心会效',
  },

  // 会心效果
  physical_critical_power_base: {
    key: 'physical_critical_power_base',
    label: '外功会心效果等级',
    属性类型值: 属性类型.外功会心效果等级,
    gainType: '会心会效',
  },
  solar_critical_power_base: {
    key: 'solar_critical_power_base',
    label: '阳性会心效果等级',
    gainType: '会心会效',
  },
  lunar_critical_power_base: {
    key: 'lunar_critical_power_base',
    label: '阴性会心效果等级',
    gainType: '会心会效',
  },
  solar_and_lunar_critical_power_base: {
    key: 'solar_and_lunar_critical_power_base',
    label: '阴阳会心效果等级',
    gainType: '会心会效',
  },
  neutral_critical_power_base: {
    key: 'neutral_critical_power_base',
    label: '混元会心效果等级',
    gainType: '会心会效',
  },
  poison_critical_power_base: {
    key: 'poison_critical_power_base',
    label: '毒性会心效果等级',
    gainType: '会心会效',
  },
  magical_critical_power_base: {
    key: 'magical_critical_power_base',
    label: '内功会心效果等级',
    属性类型值: 属性类型.内功会心效果等级,
    gainType: '会心会效',
  },
  all_critical_power_base: {
    key: 'all_critical_power_base',
    label: '全会心效果等级',
    属性类型值: 属性类型.全会心效果等级,
    gainType: '会心会效',
  },

  // 无双
  strain_base: {
    key: 'strain_base',
    label: '无双等级',
    属性类型值: 属性类型.无双等级,
    gainType: '属性增益',
  },

  // 加速
  haste_base: {
    key: 'haste_base',
    label: '加速等级',
    属性类型值: 属性类型.加速等级,
    gainType: '属性增益',
  },

  // 武器伤害
  weapon_damage_base: {
    key: 'weapon_damage_base',
    label: '武器伤害',
    属性类型值: 属性类型.武器伤害,
    gainType: '属性增益',
  },

  // 全能
  pvx_round_base: {
    key: 'pvx_round_base',
    label: '全能等级',
    属性类型值: 属性类型.全能等级,
    gainType: '属性增益',
  },

  // 气血
  max_life_base: {
    key: 'max_life_base',
    label: '基础气血上限',
    属性类型值: 属性类型.基础气血上限,
    gainType: '属性增益',
  },
  max_life_add: {
    key: 'max_life_add',
    label: '额外气血上限',
    属性类型值: 属性类型.额外气血上限,
    gainType: '属性增益',
  },

  // 防御
  physical_shield_base: {
    key: 'physical_shield_base',
    label: '外功基础防御',
    属性类型值: 属性类型.外功基础防御,
    gainType: '属性增益',
  },
  magical_shield_base: {
    key: 'magical_shield_base',
    label: '内功基础防御',
    属性类型值: 属性类型.内功基础防御,
    gainType: '属性增益',
  },

  // 治疗
  therapy_power_base: { key: 'therapy_power_base', label: '基础治疗量', gainType: '特殊效果' },

  // 百分比增益 (后缀 _gain)
  vitality_gain: { key: 'vitality_gain', label: '体质提高%', gainType: '百分比增益' },
  agility_gain: { key: 'agility_gain', label: '身法提高%', gainType: '百分比增益' },
  strength_gain: { key: 'strength_gain', label: '力道提高%', gainType: '百分比增益' },
  spirit_gain: { key: 'spirit_gain', label: '根骨提高%', gainType: '百分比增益' },
  spunk_gain: { key: 'spunk_gain', label: '元气提高%', gainType: '百分比增益' },
  physical_attack_power_gain: {
    key: 'physical_attack_power_gain',
    label: '外功攻击提高%',
    属性类型值: 属性类型.郭氏外功基础攻击,
    gainType: '百分比增益',
  },
  magical_attack_power_gain: {
    key: 'magical_attack_power_gain',
    label: '内功攻击提高%',
    gainType: '百分比增益',
  },
  strain_gain: {
    key: 'strain_gain',
    label: '无双提高%',
    属性类型值: 属性类型.郭氏无双,
    gainType: '百分比增益',
  },
  weapon_damage_gain: {
    key: 'weapon_damage_gain',
    label: '武器伤害提高%',
    属性类型值: 属性类型.郭氏武器伤害,
    gainType: '百分比增益',
  },
  physical_overcome_gain: {
    key: 'physical_overcome_gain',
    label: '外功破防提高%',
    属性类型值: 属性类型.郭氏外功破防等级,
    gainType: '百分比增益',
  },
  solar_overcome_gain: {
    key: 'solar_overcome_gain',
    label: '阳性破防提高%',
    gainType: '百分比增益',
  },
  lunar_overcome_gain: {
    key: 'lunar_overcome_gain',
    label: '阴性破防提高%',
    gainType: '百分比增益',
  },
  neutral_overcome_gain: {
    key: 'neutral_overcome_gain',
    label: '混元破防提高%',
    gainType: '百分比增益',
  },
  poison_overcome_gain: {
    key: 'poison_overcome_gain',
    label: '毒性破防提高%',
    gainType: '百分比增益',
  },
  max_life_gain: {
    key: 'max_life_gain',
    label: '气血上限提高%',
    属性类型值: 属性类型.郭氏基础气血上限,
    gainType: '百分比增益',
  },
  max_life_final_gain: {
    key: 'max_life_final_gain',
    label: '最终气血提高%',
    属性类型值: 属性类型.郭氏最终气血上限,
    gainType: '百分比增益',
  },
  therapy_power_gain: { key: 'therapy_power_gain', label: '治疗量提高%', gainType: '百分比增益' },
  physical_shield_gain: {
    key: 'physical_shield_gain',
    label: '外功防御提高%',
    属性类型值: 属性类型.郭氏外功基础防御,
    gainType: '百分比增益',
  },
  magical_shield_gain: {
    key: 'magical_shield_gain',
    label: '内功防御提高%',
    gainType: '百分比增益',
  },

  // 防御相关
  solar_shield_gain: { key: 'solar_shield_gain', label: '阳性防御提高%', gainType: '百分比增益' },
  lunar_shield_gain: { key: 'lunar_shield_gain', label: '阴性防御提高%', gainType: '百分比增益' },
  neutral_shield_gain: {
    key: 'neutral_shield_gain',
    label: '混元防御提高%',
    gainType: '百分比增益',
  },
  poison_shield_gain: { key: 'poison_shield_gain', label: '毒性防御提高%', gainType: '百分比增益' },
  physical_shield_add: { key: 'physical_shield_add', label: '额外外功防御', gainType: '属性增益' },

  // 无视防御
  all_shield_ignore: {
    key: 'all_shield_ignore',
    label: '无视防御',
    属性类型值: 属性类型.郭氏全无视防御,
    gainType: '百分比增益',
  },

  // 增伤
  all_damage_gain: {
    key: 'all_damage_gain',
    label: '通用增伤%',
    属性类型值: 属性类型.通用增伤,
    gainType: '百分比增益',
  },
  physical_damage_gain: { key: 'physical_damage_gain', label: '外功增伤%', gainType: '百分比增益' },
  magical_damage_gain: { key: 'magical_damage_gain', label: '内功增伤%', gainType: '百分比增益' },
  move_state_damage_gain: {
    key: 'move_state_damage_gain',
    label: '目标移动状增伤%',
    属性类型值: 属性类型.目标移动状增伤,
    gainType: '百分比增益',
  },
  pve_damage_cof: { key: 'pve_damage_cof', label: '非侠增伤系数', gainType: '百分比增益' },
  global_damage_factor: {
    key: 'global_damage_factor',
    label: '全局伤害因子',
    属性类型值: 属性类型.全局伤害因子,
    gainType: '百分比增益',
  },
  skill_damage_final_cof: {
    key: 'skill_damage_final_cof',
    label: '职业最终增伤系数',
    属性类型值: 属性类型.职业最终增伤,
    gainType: '百分比增益',
  },
  skill_damage_cof: {
    key: 'skill_damage_cof',
    label: '技能独立增伤',
    属性类型值: 属性类型.技能独立增伤,
    gainType: '百分比增益',
  },

  // 转换系数
  vitality_to_physical_attack_power: {
    key: 'vitality_to_physical_attack_power',
    label: '体质转外功攻击',
    属性类型值: 属性类型.郭氏体质转基础攻击,
    gainType: '特殊效果',
  },
  vitality_to_physical_overcome: {
    key: 'vitality_to_physical_overcome',
    label: '体质转外功破防',
    属性类型值: 属性类型.郭氏体质转全破防,
    gainType: '特殊效果',
  },
  vitality_to_magical_overcome: {
    key: 'vitality_to_magical_overcome',
    label: '体质转内功破防',
    gainType: '特殊效果',
  },
  vitality_to_solar_attack_power: {
    key: 'vitality_to_solar_attack_power',
    label: '体质转阳性攻击',
    gainType: '特殊效果',
  },
  vitality_to_lunar_attack_power: {
    key: 'vitality_to_lunar_attack_power',
    label: '体质转阴性攻击',
    gainType: '特殊效果',
  },
  vitality_to_magical_critical_strike: {
    key: 'vitality_to_magical_critical_strike',
    label: '体质转内功会心',
    属性类型值: 属性类型.郭氏体质转全会心,
    gainType: '特殊效果',
  },
  vitality_to_max_life: { key: 'vitality_to_max_life', label: '体质转气血', gainType: '特殊效果' },
  vitality_to_parry: { key: 'vitality_to_parry', label: '体质转招架', gainType: '特殊效果' },
  vitality_to_parry_value: {
    key: 'vitality_to_parry_value',
    label: '体质转拆招值',
    gainType: '特殊效果',
  },
  vitality_to_dodge: { key: 'vitality_to_dodge', label: '体质转闪避', gainType: '特殊效果' },
  vitality_to_physical_shield: {
    key: 'vitality_to_physical_shield',
    label: '体质转外防',
    gainType: '特殊效果',
  },
  vitality_to_magical_shield: {
    key: 'vitality_to_magical_shield',
    label: '体质转内防',
    gainType: '特殊效果',
  },

  // 会心率 (rate类)
  physical_critical_strike_rate: {
    key: 'physical_critical_strike_rate',
    label: '外功会心率%',
    gainType: '会心会效',
  },
  solar_critical_strike_rate: {
    key: 'solar_critical_strike_rate',
    label: '阳性会心率%',
    gainType: '会心会效',
  },
  lunar_critical_strike_rate: {
    key: 'lunar_critical_strike_rate',
    label: '阴性会心率%',
    gainType: '会心会效',
  },
  neutral_critical_strike_rate: {
    key: 'neutral_critical_strike_rate',
    label: '混元会心率%',
    gainType: '会心会效',
  },
  poison_critical_strike_rate: {
    key: 'poison_critical_strike_rate',
    label: '毒性会心率%',
    gainType: '会心会效',
  },

  // 会效率 (rate类)
  physical_critical_power_rate: {
    key: 'physical_critical_power_rate',
    label: '外功会效率%',
    属性类型值: 属性类型.郭氏外功会心效果等级,
    gainType: '会心会效',
  },
  solar_critical_power_rate: {
    key: 'solar_critical_power_rate',
    label: '阳性会效率%',
    gainType: '会心会效',
  },
  lunar_critical_power_rate: {
    key: 'lunar_critical_power_rate',
    label: '阴性会效率%',
    gainType: '会心会效',
  },
  neutral_critical_power_rate: {
    key: 'neutral_critical_power_rate',
    label: '混元会效率%',
    gainType: '会心会效',
  },
  poison_critical_power_rate: {
    key: 'poison_critical_power_rate',
    label: '毒性会效率%',
    gainType: '会心会效',
  },
  magical_critical_power_rate: {
    key: 'magical_critical_power_rate',
    label: '内功会效率%',
    属性类型值: 属性类型.郭氏内功会心效果等级,
    gainType: '会心会效',
  },
  unlimit_critical_power_rate: {
    key: 'unlimit_critical_power_rate',
    label: '突破上限会效率%',
    属性类型值: 属性类型.郭氏突破上限会心效果等级,
    gainType: '会心会效',
  },

  // 加速率
  haste_rate: {
    key: 'haste_rate',
    label: '加速率%',
    属性类型值: 属性类型.郭氏加速等级,
    gainType: '百分比增益',
  },
  unlimit_haste_rate: {
    key: 'unlimit_haste_rate',
    label: '突破上限加速率%',
    属性类型值: 属性类型.郭氏突破上限加速,
    gainType: '百分比增益',
  },

  // 无双率
  strain_rate: {
    key: 'strain_rate',
    label: '无双率%',
    属性类型值: 属性类型.郭氏额外无双,
    gainType: '百分比增益',
  },

  // ===== 公式运行时变量 → 中文显示名 =====
  physical_attack_power: { key: 'physical_attack_power', label: '外功攻击', gainType: '属性增益' },
  magical_attack_power: { key: 'magical_attack_power', label: '内功攻击', gainType: '属性增益' },
  lunar_attack_power: { key: 'lunar_attack_power', label: '阴性攻击', gainType: '属性增益' },
  solar_attack_power: { key: 'solar_attack_power', label: '阳性攻击', gainType: '属性增益' },
  neutral_attack_power: { key: 'neutral_attack_power', label: '混元攻击', gainType: '属性增益' },
  poison_attack_power: { key: 'poison_attack_power', label: '毒性攻击', gainType: '属性增益' },
  physical_damage_addition: {
    key: 'physical_damage_addition',
    label: '外功伤害加成',
    gainType: '百分比增益',
  },
  magical_damage_addition: {
    key: 'magical_damage_addition',
    label: '内功伤害加成',
    gainType: '百分比增益',
  },
  skill_damage_final_addition: {
    key: 'skill_damage_final_addition',
    label: '最终技能增伤',
    gainType: '百分比增益',
  },
  physical_overcome: { key: 'physical_overcome', label: '外功破防率', gainType: '百分比增益' },
  lunar_overcome: { key: 'lunar_overcome', label: '阴性破防率', gainType: '百分比增益' },
  solar_overcome: { key: 'solar_overcome', label: '阳性破防率', gainType: '百分比增益' },
  neutral_overcome: { key: 'neutral_overcome', label: '混元破防率', gainType: '百分比增益' },
  poison_overcome: { key: 'poison_overcome', label: '毒性破防率', gainType: '百分比增益' },
  physical_shield: { key: 'physical_shield', label: '目标外防', gainType: '属性增益' },
  lunar_shield: { key: 'lunar_shield', label: '目标阴性防御', gainType: '属性增益' },
  solar_shield: { key: 'solar_shield', label: '目标阳性防御', gainType: '属性增益' },
  neutral_shield: { key: 'neutral_shield', label: '目标混元防御', gainType: '属性增益' },
  poison_shield: { key: 'poison_shield', label: '目标毒性防御', gainType: '属性增益' },
  shield_constant: { key: 'shield_constant', label: '防御常数', gainType: '属性增益' },
  strain: { key: 'strain', label: '无双率', gainType: '百分比增益' },
  pve_damage_addition: { key: 'pve_damage_addition', label: '非侠增伤', gainType: '百分比增益' },
  physical_damage_scale: {
    key: 'physical_damage_scale',
    label: '外功伤害比例',
    gainType: '百分比增益',
  },
  lunar_damage_scale: { key: 'lunar_damage_scale', label: '阴性伤害比例', gainType: '百分比增益' },
  solar_damage_scale: { key: 'solar_damage_scale', label: '阳性伤害比例', gainType: '百分比增益' },
  neutral_damage_scale: {
    key: 'neutral_damage_scale',
    label: '混元伤害比例',
    gainType: '百分比增益',
  },
  poison_damage_scale: {
    key: 'poison_damage_scale',
    label: '毒性伤害比例',
    gainType: '百分比增益',
  },
  damage_scale: { key: 'damage_scale', label: '最终伤害比例', gainType: '百分比增益' },
  level: { key: 'level', label: '目标等级', gainType: '其他' },
  rand: { key: 'rand', label: '随机值', gainType: '其他' },
  equip_score: { key: 'equip_score', label: '装备分', gainType: '属性增益' },
  weapon_damage: { key: 'weapon_damage', label: '武器伤害', gainType: '属性增益' },
  weapon_damage_rand: { key: 'weapon_damage_rand', label: '武器伤害随机', gainType: '其他' },
  physical_critical_strike: {
    key: 'physical_critical_strike',
    label: '外功会心率',
    gainType: '会心会效',
  },
  lunar_critical_strike: {
    key: 'lunar_critical_strike',
    label: '阴性会心率',
    gainType: '会心会效',
  },
  solar_critical_strike: {
    key: 'solar_critical_strike',
    label: '阳性会心率',
    gainType: '会心会效',
  },
  neutral_critical_strike: {
    key: 'neutral_critical_strike',
    label: '混元会心率',
    gainType: '会心会效',
  },
  poison_critical_strike: {
    key: 'poison_critical_strike',
    label: '毒性会心率',
    gainType: '会心会效',
  },
  physical_critical_power: {
    key: 'physical_critical_power',
    label: '外功会效率',
    gainType: '会心会效',
  },
  lunar_critical_power: { key: 'lunar_critical_power', label: '阴性会效率', gainType: '会心会效' },
  solar_critical_power: { key: 'solar_critical_power', label: '阳性会效率', gainType: '会心会效' },
  neutral_critical_power: {
    key: 'neutral_critical_power',
    label: '混元会效率',
    gainType: '会心会效',
  },
  poison_critical_power: {
    key: 'poison_critical_power',
    label: '毒性会效率',
    gainType: '会心会效',
  },
}

/** 根据buff属性key获取中文显示名称 */
export function getAttributeLabel(key: string): string {
  return map[key]?.label || key
}

/** 根据buff属性key获取属性分类 */
export function getGainType(key: string): GainType {
  const info = map[key]
  if (info) return info.gainType
  if (key.endsWith('_gain') || key.endsWith('_percent')) return '百分比增益'
  if (key.includes('critical_strike') || key.includes('critical_power')) return '会心会效'
  if (key.endsWith('_base')) return '属性增益'
  return '其他'
}

/** 获取增益类型颜色 */
export function getGainTypeColor(type: GainType): string {
  switch (type) {
    case '属性增益':
      return '#52c41a'
    case '百分比增益':
      return '#faad14'
    case '会心会效':
      return '#fa8c16'
    case '特殊效果':
      return '#1890ff'
    default:
      return '#8c8c8c'
  }
}

/** 根据buff属性key获取属性类型枚举值 */
export function getAttributeType(key: string): 属性类型 | undefined {
  return map[key]?.属性类型值
}

export default map
