// import 赛季范围数据 from './赛季范围数据.json'

// 装备导入
export const 接口装备数据格式化 = (list,赛季范围数据) => {
  const 装备列表 = list.map((item) => {
    const wuqishanghaiObj = {}
    const isWuqi =
      item.Base1Type === 'atMeleeWeaponDamageBase' && item.Base2Type === 'atMeleeWeaponDamageRand'
    if (isWuqi) {
      wuqishanghaiObj.武器伤害_最小值 = +item.Base1Min
      wuqishanghaiObj.武器伤害_最大值 = +item.Base1Min + +item.Base2Min
    }
    const name = item.Name || '数据丢失-未知'

    const 装备特效 = 判断装备特效(item,赛季范围数据)
    const 装备主属性 = 判断装备主属性(item)
    return {
      id: item.ID,
      uid: item.UiID,
      装备名称: name,
      所属门派: item.BelongSchool !== '精简' && item.BelongSchool !== '通用' ? item.BelongSchool !== '精简' && item.BelongSchool : '通用',
      装备主属性: 装备主属性,
      装备品级: item.Level,
      ...wuqishanghaiObj,
      ...(装备特效 ? { 装备特效 } : null),
      装备类型:
        item.GetType === 'PVX'
          ? '装备类型枚举.PVX'
          : isWuqi
          ? +item.MaxStrengthLevel === 4
            ? `装备类型枚举.特效武器`
            : +item.MaxStrengthLevel === 6
            ? `装备类型枚举.普通`
            : +item.MaxStrengthLevel === 8
            ? "装备类型枚举.橙武"
            : `未匹配`
          : 装备特效?.toString()?.includes('切糕')
          ? `装备类型枚举.切糕`
          : 装备特效?.toString()?.includes('门派套装')
          ? `装备类型枚举.门派套装`
          : +item.MaxStrengthLevel === 4
          ? `装备类型枚举.副本精简`
          : +item.MaxStrengthLevel === 3
          ? `装备类型枚举.试炼精简`
          : +item.MaxStrengthLevel === 8
          ? `装备类型枚举.橙武`
          : +item.MaxStrengthLevel === 6
          ? `装备类型枚举.普通`
          : `未匹配`,
      装备增益: Object.keys(item)
        .filter((key) => key.includes('_Magic'))
        .map((key) => {
          if (item[key]) {
            return getZengyi(item[key])
          } else {
            return null
          }
        })
        .filter((item) => item?.属性 !== '未匹配')
        .filter((a) => a),
      镶嵌孔数组: Object.keys(item)
        .filter((key) => key.includes('_DiamondAttributeID'))
        .map((key) => {
          return getXiangqian(item[key])
        })
        .filter((a) => a),
    }
  }).filter(item => (赛季范围数据.门派列表 ||[]).includes(item.所属门派))
  return 装备列表
}

const getZengyi = ({ attr }) => {
  if (attr?.length) {
    return {
      属性: 属性枚举[attr?.[0]] || '未匹配',
      值: +attr?.[1],
    }
  } else {
    return null
  }
}

const getXiangqian = (data) => {
  if (data?.length) {
    return {
      镶嵌类型: 属性枚举[data?.[0]],
    }
  } else {
    return null
  }
}


// 判断该装备能造成什么特效伤害
export const 判断装备特效 = (item) => {
  let 特效效果 = undefined
  // 大CW
  if (item.BelongMap === '橙武' || item.BelongMap?.includes('奇遇橙武')) {
    特效效果 = "装备特效枚举.大橙武特效"
  }
  // 小CW
  if (item.BelongMap?.includes('小橙武')) {
    Object.keys(item).forEach((key) => {
      if (key.includes('_Magic')) {
        const data = item[key]?.attr
        if (data?.[0] === 'atSetEquipmentRecipe') {
          特效效果 = "装备特效枚举.小橙武特效"
        }
      }
    })
    特效效果 = "装备特效枚举.小橙武特效"
  }
  // 特效腰坠
  if (item.SubType === 7) {
    if (item?._SkillDesc?.includes('大幅度提升自身')) {
      特效效果 = "装备特效枚举.风特效腰坠"
    }
  }
  if (item.GetType === '生活技能') {
    if (item._SetData) {
      Object.keys(item._SetData).forEach((key) => {
        if (item._SetData[key]?.attr?.[0] === 'atAllTypeCriticalStrike') {
          特效效果 = "装备特效枚举.切糕"
        }
      })
    }
  }
  if (item.BelongSchool !== '精简' && item.BelongSchool !== '通用') {
    if (item.GetType === '道具换取' && item.Name?.includes('·')) {
      // 通过触发判断来判断是两件套双会还是四件套双会
      特效效果 = "装备特效枚举.门派套装"
    }
  }
  if (item.BelongSchool !== '精简' && item.BelongSchool !== '通用') {
    if (item.GetType === '活动' && item.Name?.includes('·')) {
      特效效果 = "装备特效枚举.冬至套装"
    }
  }
  if (item.BelongMap?.includes('龙门飞剑')) {
    特效效果 = "装备特效枚举.龙门飞剑武器"
  }
  if (!特效效果) {
    Object.keys(item).forEach((key) => {
      if (key.includes('_Magic')) {
        const data = item[key]?.label
        if (data?.includes('水·灭虚')) {
          特效效果 = "装备特效枚举.水特效武器"
        } else if (data?.includes('水·斩流')) {
          特效效果 = "装备特效枚举.水特效武器"
        }
      }
    })
  }
  return 特效效果
}

export const 判断装备主属性 = (item) => {
  if (item?._AttrType?.includes("atStrengthBase")) {
    return "力道"
  } else if (item?._AttrType?.includes("atAgilityBase")) {
    return "身法"
  } else if (item?._AttrType?.includes("atSpunkBase")) {
    return "元气"
  } else if (item?._AttrType?.includes("atSpiritBase")) {
    return "根骨"
  } else {
    return "通用"
  }
}

// 属性类型枚举（转化魔盒的属性类型为本地属性类型
const 属性枚举 = {
  atVitalityBase: '属性类型.体质',
  atMaxLifeBase: '属性类型.基础气血上限',
  atMaxLifeAdditional: '属性类型.额外气血上限',
  atStrengthBase: '属性类型.力道',
  atAgilityBase: '属性类型.身法',
  atSpunkBase: '属性类型.元气',
  atSpiritBase: '属性类型.根骨',
  atHasteBase: '属性类型.加速等级',
  atStrainBase: '属性类型.无双等级',
  atPVXAllRound: '属性类型.全能等级',
  atMeleeWeaponDamageBase: '属性类型.武器伤害',
  atPhysicsAttackPowerBase: '属性类型.外功基础攻击',
  atPhysicsCriticalStrike: '属性类型.外功会心等级',
  atPhysicsCriticalDamagePowerBase: '属性类型.外功会心效果等级',
  atPhysicsOvercomeBase: '属性类型.外功破防等级',

  atMagicAttackPowerBase: '属性类型.内功基础攻击',
  atPoisonAttackPowerBase:'属性类型.内功基础攻击',
  atSolarAttackPowerBase:'属性类型.内功基础攻击',
  atNeutralAttackPowerBase:'属性类型.内功基础攻击',
  atLunarAttackPowerBase:'属性类型.内功基础攻击',

  atAllTypeCriticalStrike: '属性类型.全会心等级',
  atMagicCriticalStrike: '属性类型.内功会心等级',
  atNeutralCriticalStrike: '属性类型.内功会心等级',
  atSolarCriticalStrike: '属性类型.内功会心等级',
  atPoisonCriticalStrike: '属性类型.内功会心等级',
  atLunarCriticalStrike: '属性类型.内功会心等级',

  atAllTypeCriticalDamagePowerBase: '属性类型.全会心效果等级',
  atMagicCriticalDamagePowerBase: '属性类型.内功会心效果等级',
  atNeutralCriticalDamagePowerBase: '属性类型.内功会心效果等级',
  atSolarCriticalDamagePowerBase: '属性类型.内功会心效果等级',
  atPoisonCriticalDamagePowerBase: '属性类型.内功会心效果等级',
  atLunarCriticalDamagePowerBase: '属性类型.内功会心效果等级',

  atMagicOvercome: '属性类型.内功破防等级',
  atPoisonOvercomeBase: '属性类型.内功破防等级',
  atNeutralOvercomeBase: '属性类型.内功破防等级',
  atSolarOvercomeBase: '属性类型.内功破防等级',
  atLunarOvercomeBase: '属性类型.内功破防等级',
  atSolarAndLunarOvercomeBase: '属性类型.内功破防等级',
}
