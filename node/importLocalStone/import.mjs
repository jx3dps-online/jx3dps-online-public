import { map as 数据源 } from './stone.mjs'
import {
  attrMap as 五彩石属性枚举,
  filterNames,
  WuCaiShiGainNameMeiju,
  tankFilterNames,
} from './attrMap.mjs'
import fs from 'fs'
let item_id列表 = {}
let enchant_id列表 = {}
// 导入本地五彩石数据

function 校验属性名称允许导入(属性, type, 导出五彩石映射) {
  if (导出五彩石映射) {
    return true
  }
  if (type === '天罗诡道') {
    return !filterNames?.filter((a) => a !== 'poison')?.some((item) => 属性?.includes(item))
  }
  if (type === '防御') {
    return !filterNames
      ?.filter((a) => a !== 'vitality' && a !== 'vitality_gain' && a !== 'all_major_base')
      ?.concat(tankFilterNames)
      ?.some((item) => 属性?.includes(item))
  }
  return !filterNames?.some((item) => 属性?.includes(item))
}

// 获取全部部位的数据
async function 获取全部部位的数据(type, 导出五彩石映射) {
  let 数据结果 =
    type === '天罗诡道'
      ? {
          天罗诡道: { 5: [], 6: [] },
        }
      : type === '防御'
        ? {
            防御_内功: { 5: [], 6: [] },
            防御_外功: { 5: [], 6: [] },
            防御_通用: { 5: [], 6: [] },
          }
        : {
            内功: { 5: [], 6: [] },
            外功: { 5: [], 6: [] },
          }

  function 生成数据(完整key, 五彩石数据, 五彩石等级, 导出五彩石映射) {
    const 外功五彩石 =
      完整key?.includes('physical') || 完整key?.includes('strength') || 完整key?.includes('agility')

    const 外功 = 完整key?.includes('physical')
    const 内功 = 完整key?.includes('magical')
    const 功法 =
      type === '防御'
        ? 外功
          ? '防御_外功'
          : 内功
            ? '防御_内功'
            : '防御_通用'
        : 外功五彩石
          ? '外功'
          : '内功'
    if (五彩石等级 >= 5) {
      if (导出五彩石映射) {
        if (五彩石数据?.item_id?.[0]) {
          item_id列表[五彩石数据?.item_id?.[0]] = 五彩石数据?.name
        }
        if (五彩石数据?.enchant_id?.[0]) {
          enchant_id列表[五彩石数据?.enchant_id?.[0]] = 五彩石数据?.name
        }
      } else {
        // 判断是否为天罗诡道五彩石
        if (type === '天罗诡道') {
          if (
            !完整key?.includes('weapon_damage_base') &&
            !完整key?.includes('physical_overcome') &&
            !完整key?.includes('physical_attack') &&
            !完整key?.includes('magical_critical') &&
            !完整key?.includes('poison_critical') &&
            !完整key?.includes('solar_') &&
            !完整key?.includes('lunar_') &&
            !完整key?.includes('solar_and_lunar_') &&
            !完整key?.includes('neutral_') &&
            !完整key?.includes('spirit_') &&
            !完整key?.includes('agility_') &&
            !完整key?.includes('strength_')
          ) {
            const 数据 = {
              五彩石名称: 五彩石数据?.name,
              五彩石等级: 五彩石数据?.level,
              装备增益: 获取五彩石增益(五彩石数据?.attributes),
            }
            数据结果?.['天罗诡道']?.[五彩石等级].push(数据)
          }
        } else {
          const 数据 = {
            五彩石名称: 五彩石数据?.name,
            五彩石等级: 五彩石数据?.level,
            装备增益: 获取五彩石增益(五彩石数据?.attributes),
          }
          数据结果?.[功法]?.[五彩石等级].push(数据)
        }
      }
    }
  }
  Object.keys(数据源).forEach((第一条属性名称) => {
    if (校验属性名称允许导入(第一条属性名称, type, 导出五彩石映射)) {
      Object.keys(数据源[第一条属性名称])?.forEach((第二条属性名称) => {
        if (校验属性名称允许导入(第二条属性名称, type, 导出五彩石映射)) {
          if (第二条属性名称?.includes('_gain')) {
            Object.keys(数据源[第一条属性名称][第二条属性名称])?.forEach((五彩石等级) => {
              const 完整key = `${第一条属性名称}${第二条属性名称}`
              const 五彩石数据 = 数据源[第一条属性名称][第二条属性名称][五彩石等级]
              生成数据(完整key, 五彩石数据, 五彩石等级, 导出五彩石映射)
            })
          } else {
            Object.keys(数据源[第一条属性名称][第二条属性名称])?.forEach((第三条属性名称) => {
              if (校验属性名称允许导入(第三条属性名称, type, 导出五彩石映射)) {
                Object.keys(数据源[第一条属性名称][第二条属性名称][第三条属性名称])?.forEach(
                  (五彩石等级) => {
                    const 完整key = `${第一条属性名称}${第二条属性名称}${第三条属性名称}`
                    const 五彩石数据 =
                      数据源[第一条属性名称][第二条属性名称][第三条属性名称][五彩石等级]
                    生成数据(完整key, 五彩石数据, 五彩石等级, 导出五彩石映射)
                  },
                )
              }
            })
          }
        }
      })
    }
  })

  if (!导出五彩石映射) {
    Object.keys(数据结果).forEach((功法) => {
      Object.keys(数据结果[功法]).forEach((等级) => {
        console.info(`开始导入【${功法}】【${等级}级】五彩石`)
        导出成文件(数据结果[功法][等级], 功法, 等级)
      })
    })
  }
}

function 获取五彩石增益(五彩石增益) {
  let list = []
  Object.keys(五彩石增益).forEach((key) => {
    if (五彩石属性枚举[key]) {
      list.push({
        增益类型: 五彩石属性枚举[key],
        增益名称: WuCaiShiGainNameMeiju[key],
        增益数值: 五彩石增益[key],
      })
    } else {
      console.log(`存在未识别五彩石属性：${key}`)
    }
  })
  return list
}

function 导出成文件(数据, 功法, 等级) {
  // 判断文件夹是否存在
  if (!fs.existsSync('导出五彩石')) {
    fs.mkdirSync('导出五彩石', { recursive: true })
  }
  if (!fs.existsSync(`导出五彩石/${功法}`)) {
    fs.mkdirSync(`导出五彩石/${功法}`, { recursive: true })
  }
  const 等级key = +等级 === 6 ? '六级' : '五级'
  if (!fs.existsSync(`导出五彩石/${功法}/${等级key}`)) {
    fs.mkdirSync(`导出五彩石/${功法}/${等级key}`, { recursive: true })
  }

  const 文件名称 = `导出五彩石/${功法}/${等级key}/index.ts`
  const 生成文本 = JSON.stringify(数据)
    .replaceAll(`"`, '')
    .replaceAll(`五彩石名称:`, `五彩石名称:"`)
    .replaceAll(`,五彩石等级:`, `",五彩石等级:`)
  // console.info(`${部位}文件已创建`)
  fs.writeFile(
    文件名称,
    `
import { 五彩石数据类型 } from '@/@types/五彩石'
import { 属性类型 } from '@/@types/属性'
import { 五彩石增益类型枚举 } from '@/@types/枚举'

const 五彩石_${等级key}: 五彩石数据类型[] = ${生成文本}

export default 五彩石_${等级key}
  `,
    (err) => {
      if (err) {
        console.info('err', err)
      }
    },
  )
  console.info(`【${功法}】【${等级key}】文件导入成功，成功导入${数据?.length}个五彩石`)
}

function 生成五彩石映射文件() {
  const 生成 = { item_id: item_id列表, enchant_id: enchant_id列表 }
  const 生成文本 = JSON.stringify(生成)
  fs.writeFile('五彩石映射.json', 生成文本, (err) => {
    if (err) {
      console.info('err', err)
    }
  })
  console.info(`生成五彩石映射成功`)
}

async function 获取五彩石数据() {
  item_id列表 = {}
  enchant_id列表 = {}
  await 获取全部部位的数据()
  await 获取全部部位的数据('天罗诡道')
  await 获取全部部位的数据('防御')
  await 获取全部部位的数据('默认', true)
  生成五彩石映射文件()
}

获取五彩石数据()
