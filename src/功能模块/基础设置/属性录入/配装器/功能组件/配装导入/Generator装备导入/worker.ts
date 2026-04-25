import 五彩石映射 from '../../../../../../../数据/常量/五彩石映射.json'
// import 心法枚举JSON from '../../../../../../..//数据/静态数据/心法枚举.json'
import { 本赛季英雄品级 } from '../../../../../../../数据/常量/装备常量'
import 附魔ID枚举 from '../../../../../../../数据/常量/附魔映射'
import { EquipPositionMap, DaFuMoMap, 五彩石转换 } from '../统一映射枚举'

self.onmessage = (event) => {
  const { data } = event // 获取传入的数据
  // 假设我们进行一些复杂的计算
  const result = Generator装备导入(data)
  self.postMessage(result) // 将结果发送回主线程
}

const 装备部位转化枚举 = {
  上衣: '衣服',
  帽子: '帽子',
  项链: '项链',
  戒指1: '戒指',
  戒指2: '戒指_2',
  腰带: '腰带',
  腰坠: '腰坠',
  下装: '下装',
  鞋子: '鞋子',
  护腕: '护腕',
  远程武器: '暗器',
  近战武器: '武器',
}

function extractItemId(str: string): string | null {
  const regex = /#(\d+)\s*\(/
  const match = str.match(regex)
  return match ? match[1] : null
}

function extractLevel(str: string): string | null {
  const regex = /\(\s*(\d+)/
  const match = str.match(regex)
  return match ? match[1] : null
}

export const Generator装备导入 = (原序列: string) => {
  const equip: any = {}
  // 参考文档 https://www.jx3box.com/tool/84749
  try {
    const data = JSON.parse(原序列)

    const 全部五彩石数据 = data?.全部五彩石数据
    const 功法 = data?.功法

    Object.keys(data)?.forEach((部位) => {
      try {
        // 获取具体LogData
        const 装备部位类型 = 装备部位转化枚举[部位]
        if (!装备部位类型) return
        const 装备数据 = data[部位]
        const 装备品级 = Number(extractLevel(装备数据?.equipment))
        const 装备ID = Number(extractItemId(装备数据?.equipment))
        const 装备附魔ID = 装备数据?.enchant?.id
        const 附魔实际名称 = 附魔ID枚举[装备附魔ID]
        const 内部索引 = EquipPositionMap[装备部位类型]
        const 该装备有大附魔 = 装备数据?.special_enchant
        const 五彩石ID = 装备数据?.stone?.id?.[0]
        if (!内部索引) {
          console.log('内部索引-装备数据', 装备数据)
        }
        if (该装备有大附魔) {
          // 判断大附魔是否存在
          let 大附魔等级: number | undefined = undefined
          if (装备品级 >= 本赛季英雄品级) {
            大附魔等级 = 2
          } else {
            大附魔等级 = 1
          }
          equip[DaFuMoMap[装备部位类型]] = 大附魔等级
        }
        if (内部索引) {
          equip[内部索引] = {
            id: 装备ID,
            附魔: 附魔实际名称,
            镶嵌等级: Object.values(装备数据?.embed_levels) || [8, 8],
          }
        }
        if (五彩石ID) {
          let 五彩石名称 = 五彩石映射?.item_id?.[五彩石ID]
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
              五彩石名称 = ''
            }
            equip.五彩石 = 五彩石名称
          } else {
            equip.五彩石 = undefined
          }
        }
      } catch (e) {
        console.error(e)
      }
    })
    return equip
  } catch (e) {
    console.error(e)
    return []
  }
}
