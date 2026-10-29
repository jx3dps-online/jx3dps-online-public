import { 根据外部附魔属性获取ID } from '@/数据/附魔/查询'
import { 属性简写枚举 } from '@/@types/枚举'
import { 装备位置部位枚举 } from '@/@types/装备'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 归一五彩石名称 } from '../统一映射枚举'

// 获取配装数据
export const getEquipData = (data) => {
  const { 功法, 主属性 } = 获取当前数据()
  const equip: any = {}
  Object.keys(EquipPositionMap).forEach((item) => {
    equip[EquipPositionMap[item]] = undefined
  })
  let msg = ''
  try {
    Object.keys(data).map((item) => {
      if (EquipPositionMap[item]) {
        const basicData = data[item]
        const 附魔属性 = basicData?.enhance?.Attribute1ID
        const 附魔值 = basicData?.enhance?.Attribute1Value1

        const 附魔数据判断 = 根据外部附魔属性获取ID(
          附魔属性,
          Number(附魔值),
          装备位置部位枚举[EquipPositionMap[item]],
          功法,
          主属性,
        )
        if (!属性简写枚举[附魔属性]) {
          console.warn(`存在计算器未内置附魔${附魔属性}${附魔值}`)
        }
        if (
          !附魔数据判断 &&
          属性简写枚举[附魔属性] &&
          !['atDecriticalDamageBase', 'atToughnessBase'].includes(附魔属性)
        ) {
          console.warn(`存在计算器未内置附魔${附魔属性}${附魔值}，已跳过。不影响导入。`)
        }
        equip[EquipPositionMap[item]] = {
          当前精炼等级: basicData?.strength,
          id: basicData?.equip.ID,
          装备部位: 装备位置部位枚举[EquipPositionMap[item]],
          镶嵌孔数组: basicData?.embedding?.map((a) => {
            const 镶嵌属性 = 转换镶嵌属性(a?.raw?.[0])
            if (!属性简写枚举[镶嵌属性]) {
              console.warn(`存在计算器未内置镶嵌孔${镶嵌属性}`)
            }
            return {
              镶嵌类型: 镶嵌属性,
              镶嵌宝石等级: a?.level,
            }
          }),
          附魔: 附魔数据判断,
        }

        // 判断大附魔
        if (DaFuMoMap[item]) {
          equip[DaFuMoMap[item]] = basicData?.enchant ? 1 : 0
        }

        if (item === 'PRIMARY_WEAPON' && basicData?.stone) {
          let 五彩石名称 = basicData?.stone.Name

          equip.五彩石 = 归一五彩石名称(五彩石名称, 功法)
        }
      }
    })
  } catch {
    msg = '获取方案异常'
  }
  return {
    equip,
    errorMsg: msg ? (
      <span>
        <p>{msg}</p>
        {/* <p>请联系计算器作者（QQ：372103645）并提供异常的配装ID</p> */}
      </span>
    ) : null,
  }
}

const DaFuMoMap = {
  HAT: '大附魔_伤帽',
  JACKET: '大附魔_伤衣',
  BELT: '大附魔_伤腰',
  WRIST: '大附魔_伤腕',
  SHOES: '大附魔_伤鞋',
}

const EquipPositionMap = {
  HAT: '_1',
  JACKET: '_2',
  BELT: '_3',
  WRIST: '_4',
  BOTTOMS: '_5',
  SHOES: '_6',
  NECKLACE: '_7',
  PENDANT: '_8',
  RING_1: '_9',
  RING_2: '_10',
  SECONDARY_WEAPON: '_11',
  PRIMARY_WEAPON: '_12',
}

const 转换镶嵌属性 = (原属性名称) => {
  return 原属性名称
    .replaceAll('atPoisonOvercomeBase', 'atMagicOvercome')
    .replaceAll('atNeutralOvercomeBase', 'atMagicOvercome')
    .replaceAll('atSolarOvercomeBase', 'atMagicOvercome')
    .replaceAll('atLunarOvercomeBase', 'atMagicOvercome')
    .replaceAll('atSolarAndLunarOvercomeBase', 'atMagicOvercome')
    .replaceAll('atNeutralCriticalStrike', 'atMagicCriticalStrike')
    .replaceAll('atSolarCriticalStrike', 'atMagicCriticalStrike')
    .replaceAll('atPoisonCriticalStrike', 'atMagicCriticalStrike')
    .replaceAll('atLunarCriticalStrike', 'atMagicCriticalStrike')
    .replaceAll('atSolarAndLunarCriticalStrike', 'atMagicCriticalStrike')
    .replaceAll('atPoisonAttackPowerBase', 'atMagicAttackPowerBase')
    .replaceAll('atSolarAttackPowerBase', 'atMagicAttackPowerBase')
    .replaceAll('atNeutralAttackPowerBase', 'atMagicAttackPowerBase')
    .replaceAll('atLunarAttackPowerBase', 'atMagicAttackPowerBase')
    .replaceAll('atSolarAndLunarAttackPowerBase', 'atMagicAttackPowerBase')
}
