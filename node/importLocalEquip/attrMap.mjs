export const attrMap = {
  vitality_base: '属性类型.体质',
  max_life_base: '属性类型.基础气血上限',
  max_life_additional: '属性类型.额外气血上限',
  max_life_add: '属性类型.额外气血上限',
  strength_base: '属性类型.力道',
  agility_base: '属性类型.身法',
  spunk_base: '属性类型.元气',
  spirit_base: '属性类型.根骨',
  haste_base: '属性类型.加速等级',
  strain_base: '属性类型.无双等级',
  pvx_round: '属性类型.全能等级',
  surplus_base: '属性类型.破招值',
  physical_attack_power_base: '属性类型.外功基础攻击',
  physical_critical_strike_base: '属性类型.外功会心等级',
  physical_critical_power_base: '属性类型.外功会心效果等级',
  physical_overcome_base: '属性类型.外功破防等级',
  magical_attack_power_base: '属性类型.内功基础攻击',
  poison_attack_power_base: '属性类型.内功基础攻击',
  solar_attack_power_base: '属性类型.内功基础攻击',
  neutral_attack_power_base: '属性类型.内功基础攻击',
  lunar_attack_power_base: '属性类型.内功基础攻击',
  solar_and_lunar_attack_power_base: '属性类型.内功基础攻击',
  all_critical_strike_base: '属性类型.全会心等级',
  magical_critical_strike_base: '属性类型.内功会心等级',
  neutral_critical_strike_base: '属性类型.内功会心等级',
  solar_critical_strike_base: '属性类型.内功会心等级',
  poison_critical_strike_base: '属性类型.内功会心等级',
  lunar_critical_strike_base: '属性类型.内功会心等级',
  solar_and_lunar_critical_strike_base: '属性类型.内功会心等级',
  all_critical_power_base: '属性类型.全会心效果等级',
  magical_critical_power_base: '属性类型.内功会心效果等级',
  neutral_critical_power_base: '属性类型.内功会心效果等级',
  solar_critical_power_base: '属性类型.内功会心效果等级',
  poison_critical_power_base: '属性类型.内功会心效果等级',
  lunar_critical_power_base: '属性类型.内功会心效果等级',
  solar_and_lunar_critical_power_base: '属性类型.内功会心效果等级',
  magical_overcome_base: '属性类型.内功破防等级',
  poison_overcome_base: '属性类型.内功破防等级',
  neutral_overcome_base: '属性类型.内功破防等级',
  solar_overcome_base: '属性类型.内功破防等级',
  lunar_overcome_base: '属性类型.内功破防等级',
  solar_and_lunar_overcome_base: '属性类型.内功破防等级',
}

export const 精简特效Map = {
  2770: '龙门飞剑武器',
  // 山海源流
  // 试炼
  38944: '试炼鞋子破防',
  38934: '试炼适应之力',
  38946: '试炼项链破防',
  38948: '试炼腰坠破防',
  38950: '试炼暗器特效',
  38945: '试炼项链会心',
  38939: '试炼鞋子会心',
  38949: '试炼腰坠会效',
  // 副本
  40788: '特效_40788', // 2966 2869
  40790: '特效_40790', // 2967 2870
  40791: '特效_40791', // 2968 2871
  40793: '特效_40793', // 2969 2872
  40794: '特效_40794', // 2970 2974 2873 2880
  40802: '特效_40802', // 2971 2874
  40803: '特效_40803', // 2972 2875
  40804: '特效_40804', // 2973 2876
  42767: '特效_42767', // 2983
  41065: '特效_41065', // 2982
}

export const 精简特效区分等级 = [
  40794,
  41065,
  38944,
  38934,
  38946,
  38948,
  38950,
  38945,
  38939,
  38949,
]

export const 暂不处理属性 = [
  'event', // 触发
  'recipe', // 秘籍
  // --
  'physical_shield_base', // 外防
  'magical_shield_base', // 内防
  'toughness_base', // 御劲
  'decritical_power_base', // 化劲等级提高
  "dodge", //  "闪避",
  "parry_value", //  "拆招值",
  "parry", //  "拆招",
  'parry_base', // 赵家
]
  

export const 装备特效枚举 = [
  '水特效武器',
  '门派套装',
  '新门派套装',
  '切糕_普通',
  '切糕_英雄',
  '冬至套装',
  '大橙武特效',
  '小橙武特效',
  '风特效腰坠',
  '龙门飞剑武器',
  // 试炼之地
  '试炼鞋子破防',
  '试炼适应之力',
  '试炼项链破防',
  '试炼腰坠破防',
  '试炼暗器特效',
  '门派特效武器',
  '试炼项链会心',
  '试炼鞋子会心',
  '试炼腰坠会效',
  // 太极秘录副本特效
  '特效_40788',
  '特效_40790',
  '特效_40791',
  '特效_40793',
  '特效_40794',
  '特效_40802',
  '特效_40803',
  '特效_40804',
  '特效_42767',
  '特效_41065',
]

export const 装备类型枚举 = [
  '普通',
  '副本精简',
  '切糕',
  '门派套装',
  '门派特效武器',
  // '新门派套装',
  '试炼精简',
  '特效武器',
  '橙武',
  'PVX',
]
