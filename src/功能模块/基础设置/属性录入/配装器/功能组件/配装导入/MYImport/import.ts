import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 大附魔ID } from '@/数据/常量/装备常量'
import 五彩石映射 from '@/数据/常量/五彩石映射.json'
import 附魔映射 from '@/数据/常量/附魔映射'
import DecompressLUAData from './util'
import {
  DaFuMoMap,
  EquipPositionMap,
  JCLEquipPositionMap,
  五彩石转换,
  五行石映射,
} from '../统一映射枚举'
import { 装备属性信息模型 } from '@/@types/装备'

// 'eJzVlttq4zAQhl9IBR1GsnThi0KyENguXZoXUBKxCY2V4rV3G0LefeUcWNuxElkuob3xhUYW8_3_aDS7nX0pcmN_Fcvv5o9ZpwK5BT1__VFmKUGLv1M9eylnE7sw7-kDQXZU5nq2Wq-Kbcok4OOO6fbNpAmyP0t9iIBbnhQm-zZ-HNv5UttiMkoxss-b34eY--V4IsEcC4r0aKWzjV2cNqc7QSlH1Wdf7TbZ2ybX-fb_WYQrEC70bPJMW2OLeihRDuJJv1-AubVW-ns0gB8kjuBnTX5IpIzj5z5-RWgIf5X-IH7GRAS_S64pgGLQJQCRqPpcEQB8AkiOQwSo8h8kAIWYApAtfqF4HD_1FwAL4a_SH8QPjEbwE9wuAMH6C4D9t5-HwFe5D4KPM5-Qi_YXef2Zv_pJiACD3a_TyzB6XocHRojoNr6v5wpUCPLdeVWDlyqpPoiXB13wu_OKpr-YdDzt_Vnlp2RNvipra2wRN3AJAE2OyLhZzqA85YwimzfQoHf7PLgc-ukgKVoTzC0pTs43BhggzE0bnR28H7xzXwQ17u6xBdeo6dlg79vlqwByDbs1uXZQ9yPuMhtfPFPO6_2_Q5JpQg'

// 获取配装数据
export const getEquipData = (data) => {
  // 解析解密装备数据
  const decompressData = DecompressLUAData(data) || {}

  const { 装备数据, 五彩石, 功法 } = 获取当前数据()

  const 全部五彩石数据 = 五彩石?.[6]

  const equip: any = {}
  const 识别装备列表: 装备属性信息模型[] = []
  const 识别大附魔列表: string[] = []
  const 未内置附魔列表: string[] = []
  const 未识别装备列表: string[] = []
  let 未识别五彩石 = ''
  Object.values(decompressData).forEach((item) => {
    // 附魔处理
    const 附魔ID = item?.dwPermanentEnchantID
    const 部位ID = item?.nPos
    const 装备ID = item?.dwTabIndex
    const 镶嵌孔列表 = item?.aDiamondEnchant
    const 识别大附魔ID = item?.dwTemporaryEnchantID
    const 五彩石ID = item?.dwItemFEAEnchantID
    const 实际附魔 = 附魔映射?.[附魔ID] || ''
    if (item?.dwPermanentEnchantID && !实际附魔 && +item?.dwPermanentEnchantID !== 420) {
      未内置附魔列表.push(item?.dwPermanentEnchantID)
    }

    let 装备部位 = JCLEquipPositionMap?.[部位ID]
    const 镶嵌孔数据 = 镶嵌孔列表?.map((item) => 五行石映射?.[item] || 8)

    const 装备位置映射 = EquipPositionMap?.[装备部位]

    if (装备部位 === '戒指_2') {
      装备部位 = '戒指'
    }
    if (装备部位) {
      const 装备原始数据 = 装备数据[装备部位]?.find((data) => +(data.id || 0) === +装备ID)

      if (装备原始数据) {
        equip[装备位置映射] = {
          当前精炼等级: +item?.nStrengthLevel || 0,
          id: 装备原始数据?.id,
          装备部位: 装备部位,
          镶嵌孔数组: (装备原始数据?.镶嵌孔数组 || [])?.map((a, index) => {
            return {
              ...a,
              镶嵌宝石等级: 镶嵌孔数据[index] || 8,
            }
          }),
          附魔: 实际附魔 || undefined,
        }
        识别装备列表.push(装备原始数据)

        // 判断大附魔
        if (DaFuMoMap[装备部位]) {
          // 先判断ID
          if (识别大附魔ID) {
            if (大附魔ID?.英雄?.some((a) => +识别大附魔ID === +a)) {
              识别大附魔列表.push(`英雄·${装备部位}`)
              equip[DaFuMoMap[装备部位]] = 2
            } else if (大附魔ID?.普通?.some((a) => +识别大附魔ID === +a)) {
              识别大附魔列表.push(`普通·${装备部位}`)
              equip[DaFuMoMap[装备部位]] = 1
            } else {
              equip[DaFuMoMap[装备部位]] = 0
            }
          } else {
            equip[DaFuMoMap[装备部位]] = 0
          }
        }

        if (装备部位 === '武器') {
          // 处理五彩石
          if (五彩石ID) {
            let 五彩石名称 = 五彩石映射?.enchant_id?.[五彩石ID]
            if (五彩石名称) {
              if (功法 !== '天罗诡道') {
                // 对内功五彩石做映射
                Object.keys(五彩石转换).forEach((key) => {
                  if (五彩石名称?.includes(key)) {
                    五彩石名称 = 五彩石名称.replace(key, 五彩石转换[key])
                  }
                })
              }

              if (
                !全部五彩石数据?.some(
                  (item) => item.五彩石名称 === 五彩石名称.replace('(伍)', '(陆)'),
                )
              ) {
                未识别五彩石 = 五彩石ID
                五彩石名称 = ''
              }
              equip.五彩石 = 五彩石名称
            } else {
              equip.五彩石 = undefined
              未识别五彩石 = 五彩石ID
            }
          } else {
            equip.五彩石 = undefined
            未识别五彩石 = 五彩石ID
          }
        }
      } else {
        equip[装备位置映射] = undefined
        if (DaFuMoMap[装备部位]) {
          equip[DaFuMoMap[装备部位]] = 0
        }
        if (装备部位 === '武器') {
          equip.五彩石 = undefined
        }
        未识别装备列表.push(`${装备部位}_${装备ID}`)
      }
    }
  })

  return {
    equip,
    未内置附魔列表,
    未识别装备列表,
    未识别五彩石,
    识别装备列表,
    识别大附魔列表,
  }
}
