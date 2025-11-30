import { message } from 'antd'
import { 循环技能详情, 循环详情, 技能增益列表数据 } from '@/@types/循环'

import commonMap from './common'

import 凌海诀 from './职业技能映射枚举/凌海诀.json'
import 分山劲 from './职业技能映射枚举/分山劲.json'
import 太玄经 from './职业技能映射枚举/太玄经.json'
import 无方 from './职业技能映射枚举/无方.json'
import 花间游 from './职业技能映射枚举/花间游.json'
import 山海心诀悟 from './职业技能映射枚举/山海心诀悟.json'
import 太玄经悟 from './职业技能映射枚举/太玄经悟.json'
import 凌海诀悟 from './职业技能映射枚举/凌海诀悟.json'
import 花间游悟 from './职业技能映射枚举/花间游悟.json'
import 无方悟 from './职业技能映射枚举/无方悟.json'
import 毒经 from './职业技能映射枚举/毒经.json'
import 易筋经 from './职业技能映射枚举/易筋经.json'
import 北傲诀 from './职业技能映射枚举/北傲诀.json'
import 焚影圣诀 from './职业技能映射枚举/焚影圣诀.json'
import 紫霞功 from './职业技能映射枚举/紫霞功.json'
import 周天功 from './职业技能映射枚举/周天功.json'
import 周天功悟 from './职业技能映射枚举/周天功悟.json'
import 笑尘诀 from './职业技能映射枚举/笑尘诀.json'
import 天罗诡道 from './职业技能映射枚举/天罗诡道.json'
import 判断团队增益快照Buff from '@/数据/团队增益/tools'
import { 每秒郭氏帧 } from '@/数据/常量'

const hrefDev = location?.href?.includes?.('localhost')

export const 心法枚举 = {
  周天功: 周天功,
  凌海诀: 凌海诀,
  北傲诀,
  分山劲: 分山劲,
  太玄经: 太玄经,
  无方: 无方,
  毒经: 毒经,
  易筋经: 易筋经,
  花间游: 花间游,
  紫霞功: 紫霞功,
  笑尘诀: 笑尘诀,
  天罗诡道,
  '山海心诀·悟': 山海心诀悟,
  '无方·悟': 无方悟,
  '太玄经·悟': 太玄经悟,
  '凌海诀·悟': 凌海诀悟,
  '花间游·悟': 花间游悟,
  '周天功·悟': 周天功悟,
  焚影圣诀: 焚影圣诀,
}

const 无界统一buff = ['70161', '70188', '70163', '70162', '70167', '70345', '70729', '70973']
const DOT直接生成层数心法 = [
  '花间游',
  '无方',
  '无方·悟',
  '花间游·悟',
  '凌海诀',
  '毒经',
  '易筋经',
  '分山劲',
  '北傲诀',
  '焚影圣诀',
  '笑尘诀',
  '天罗诡道',
]

const 跳过解析技能 = ['38966', '40788']

const 跳过解析增益 = [
  '4761', // 水特效
  '29608',
  '29536',
  '29524',
  '29526',
  '29528',
  '29529',
  '29519',
  '29537',
  '18792',
  '30757',
  '30756',
  '30755',
  '30770',
  '30749',
  '30748',
  '30743',
  '30705',
  '30742',
]

/**
 * 先声明一个吃快照的属性集合
 * 然后在判断 一个 吃快照的技能时
 * 吃快照的属性只检查第二个数组的情况
 * 不吃快照的属性只检查第一个数组和第三个分组的情况
 * @params 数组 当前Buff，快照Buff，目标Buff
 * 攻击会心会效无双增伤非侠吃快照
 */

export const 战斗数据转换 = ({
  心法,
  数据,
  最大时间,
  最小时间,
  团队增益轴,
  导入启用团队快照,
  记录伤害数据 = false,
}): 循环详情 => {
  const 心法数据枚举 = 心法枚举[心法]
  const JSONData = JSON.parse(数据 || '{}')
  let res: 循环技能详情[] = []

  let 初始时间 = 0
  let 战斗时间 = 0
  let 直伤最终时间 = 0
  const 引窍阵眼时间轴: number[][] = []

  function removeChineseCharacters(str) {
    if (str) {
      return str.replace(/[\u4e00-\u9fa5]/g, '')
    } else {
      return ''
    }
  }

  if (心法数据枚举) {
    // 先处理引窍，遍历后添加阵眼覆盖时间数组
    if (心法 === '周天功') {
      Object.keys(JSONData)?.forEach((currentKey) => {
        if (currentKey?.includes('引窍')) {
          // 找到 key为“”，代表全部时间轴
          const data = JSONData[currentKey]?.['']
          if (data && data?.timeline?.length) {
            const timeLineList = data?.timeline || []
            timeLineList?.forEach((item) => {
              引窍阵眼时间轴.push([item?.[0], item?.[0] + 每秒郭氏帧 * 10])
            })
          }
        }
      })
    }
    //
    Object.keys(JSONData).forEach((currentKey) => {
      const key = currentKey?.replaceAll('(', '')?.replaceAll(')', '')?.replaceAll('|', '')
      const 全部技能数据 = key?.split('#')
      const 全部技能 = [
        `${全部技能数据[0]}#${全部技能数据[1]}`,
        全部技能数据[2],
        全部技能数据[3],
      ]?.filter((item) => item)
      const 获取技能数据 = 全部技能?.[0]?.split('#')?.[1]?.split('-')
      let 获取技能ID = 获取技能数据?.[0]
      let 技能等级 = +获取技能数据?.[1] || 1
      let 技能层数 = +(获取技能数据?.[2] || 1)
      let DOT跳数 = 1

      if (跳过解析技能?.includes(获取技能ID)) {
        return
      }

      let 技能总数 = 0
      const 技能增益列表: 技能增益列表数据[] = []

      if (key?.includes('DOT')) {
        const DOTID = 获取技能ID
        const 释放DOT技能 = key?.split('#')?.[2]?.split('-')
        const 释放DOT技能ID = 释放DOT技能?.[0]
        const 释放DOT技能等级 = 释放DOT技能?.[1] || 1
        if (!DOTID || !释放DOT技能ID) {
          获取技能ID = ''
        } else {
          获取技能ID = `${DOTID}_${释放DOT技能ID}`
          技能等级 = +释放DOT技能等级
        }
      }

      // 特殊处理当同一个技能，id相同等级不同调用不同伤害名称时，修正技能ID，用于快速找到映射。例万花 墨海、临源
      if (心法数据枚举?.技能带等级?.includes(获取技能ID)) {
        获取技能ID = `${获取技能ID}_${技能等级 || 1}`
      }

      if (全部技能?.length >= 2) {
        const dot技能数据 = 全部技能?.[0]?.replace(')', '')
        const dot技能 = dot技能数据?.split('-')
        const dot技能跳数 = removeChineseCharacters(dot技能?.[2]) || 1
        DOT跳数 = +dot技能跳数 || 1
        const dot伤害技能数据 = 全部技能?.[1]?.replace(')', '')
        const dot伤害技能 = dot伤害技能数据?.split('-')
        const dot伤害技能跳数 = removeChineseCharacters(dot伤害技能?.[2]) || 1
        技能层数 = +dot伤害技能跳数 || 1

        if (全部技能?.length === 3) {
          const dot引爆技能数据 = 全部技能?.[2]?.replace(')', '')
          const dot引爆技能 = dot引爆技能数据?.split('-')
          const 引爆技能数据 = 全部技能?.[2]
          const 引爆层数 = +removeChineseCharacters(dot引爆技能?.[2]) || 1
          技能层数 = 技能层数 * 引爆层数

          if (
            ['#6126-5', '#6128-5', '#6129-5']?.some((item) => currentKey?.includes(item)) ||
            ['吞海', '|玉石俱焚·悟']?.some((item) => currentKey?.includes(item))
          ) {
            if (['吞海', '|玉石俱焚·悟']?.some((item) => currentKey?.includes(item))) {
              // 特殊处理某些引爆技能
              if (引爆技能数据?.split('-')?.[0]) {
                获取技能ID = `${获取技能ID}_${引爆技能数据?.split('-')?.[0]}`
              }
            }
            // 统一处理玉石引爆
            if (['#6126-5', '#6128-5', '#6129-5']?.some((item) => currentKey?.includes(item))) {
              if (['#6134', '#6135', '#6136']?.some((item) => currentKey?.includes(item))) {
                获取技能ID = `${获取技能ID}_6126`
              } else {
                获取技能ID = `${获取技能数据?.[0]}_6126`
              }
            }
          } else {
            获取技能ID = `${获取技能ID}_${引爆技能数据?.split('-')?.[0]}`
          }
        }
      }

      function 判断时间函数(timelineData: any = []) {
        let num = 0
        timelineData?.forEach((time) => {
          if (time?.length) {
            const 造成伤害时间 = time?.[0] || 0
            if (造成伤害时间 <= 最大时间 * 16 && 造成伤害时间 >= 最小时间 * 16) {
              if (typeof 造成伤害时间 === 'number') {
                if (战斗时间 < 造成伤害时间) {
                  战斗时间 = 造成伤害时间
                  if (!心法数据枚举?.过滤截止战斗时间?.includes(获取技能ID)) {
                    if (直伤最终时间 < 战斗时间) {
                      直伤最终时间 = 战斗时间
                    }
                  }
                }
                if (初始时间 !== 0) {
                  if (!初始时间 || 造成伤害时间 < 初始时间) {
                    初始时间 = 造成伤害时间
                  }
                }
              }
              num += 1
            }
          }
        })
        return num
      }

      function 获取buff实际名称(buffListPorps, 完整buff列表) {
        const list: string[] = []
        const buffList = buffListPorps || []
        let 常驻buff数量索引: any = undefined

        const 是否为吃快照技能 = 心法数据枚举?.吃快照技能?.includes(获取技能ID)
        if (是否为吃快照技能) {
          const 常驻buff数量 = 完整buff列表
            ?.split('|')?.[0]
            ?.split(',')
            ?.filter((item) => item)?.length
          常驻buff数量索引 = 常驻buff数量
        }

        buffList.forEach((currentBuff, index) => {
          const buff = currentBuff
            ?.replaceAll('连缘蛊增伤#-19513', '连缘蛊增伤#19513')
            ?.replaceAll('众嗔#-13910', '众嗔#13910')
            ?.replaceAll('清流#-12588', '清流#12588')
            ?.replaceAll('溅玉#-24599', '溅玉#24599')
            ?.replaceAll('涓流#-9722', '涓流#9722')
            ?.replaceAll('星火#-29478', '星火#29478')
            ?.replaceAll('用晦而明#-12575', '用晦而明#12575')
            ?.replaceAll('跬步#-12550', '跬步#12550')
            ?.replaceAll('跬步#-12551', '跬步#12551')
            ?.replaceAll('杀机断魂#-24668', '杀机断魂#24668')
            ?.replaceAll('龙驭#-21638', '龙驭#21638')

          // ?.replaceAll('青冠#-29525', '青冠#-29525')
          const buffData = buff?.split('#')?.[1]
          const buffSplit = buffData?.split('-')
          let buffId = buffSplit?.[0]
          const bufflevel = buffSplit?.[1] || 1
          const buffTick = buffSplit?.[2] || 1

          if (!跳过解析增益?.includes(buffId)) {
            // 无界统一buff，例70161增伤 70188易伤 统一处理
            if (无界统一buff?.includes(buffId)) {
              buffId = `${buffId}_${bufflevel}`
            }

            let 增益名称 = 心法数据枚举?.buff?.[buffId] || 心法数据枚举?.buff?.[`;${buffId}`]
            if (增益名称 && 心法数据枚举?.Buff带等级?.includes(buffId)) {
              增益名称 = `${增益名称}·${bufflevel}`
            }
            if (心法数据枚举?.Buff带层数?.includes(buffId)) {
              增益名称 = `${增益名称}·${buffTick}`
            }

            if (
              是否为吃快照技能 &&
              常驻buff数量索引 !== undefined &&
              心法数据枚举?.Buff自身存在快照区分?.includes(buffId)
            ) {
              if (index < 常驻buff数量索引) {
                增益名称 = `${增益名称}_常驻`
              } else {
                增益名称 = `${增益名称}_快照`
              }
            }

            if (增益名称) {
              if (!list?.includes(增益名称)) {
                list.push(增益名称)
              }
            } else {
              // console.error(`增益未匹配：${buff}`)
              if (!buff?.includes('神兵·无双')) {
                message.error(`增益未匹配：${buff}`)
              }
            }
          }
        })
        return list
      }

      if (获取技能ID) {
        Object.keys(JSONData?.[currentKey])?.forEach((gain) => {
          if (gain) {
            if (gain === '||') {
              const 数量 = 判断时间函数(JSONData?.[currentKey]?.[gain]?.timeline)
              技能总数 = 技能总数 + 数量
            } else {
              const 获取buff列表 = gain
                ?.replaceAll('|', ',')
                .split(',')
                ?.filter((item) => item)
              if (获取buff列表?.length) {
                const buff实际列表 = 获取buff实际名称(获取buff列表, gain)
                if (导入启用团队快照) {
                  const 时间轴 = JSONData?.[currentKey]?.[gain]?.timeline || []
                  const 原来buff列表String = buff实际列表?.join(',')
                  const 增益对象数量组 = {
                    [原来buff列表String]: 0,
                  }
                  时间轴?.forEach((time) => {
                    if (time?.length) {
                      const 造成伤害时间 = time?.[0] || 0
                      if (造成伤害时间 <= 最大时间 * 16 && 造成伤害时间 >= 最小时间 * 16) {
                        if (typeof 造成伤害时间 === 'number') {
                          if (战斗时间 < 造成伤害时间) {
                            战斗时间 = 造成伤害时间
                            if (!心法数据枚举?.过滤截止战斗时间?.includes(获取技能ID)) {
                              if (直伤最终时间 < 战斗时间) {
                                直伤最终时间 = 战斗时间
                              }
                            }
                          }
                          if (初始时间 !== 0) {
                            if (!初始时间 || 造成伤害时间 < 初始时间) {
                              初始时间 = 造成伤害时间
                            }
                          }
                        }
                        const 距初始时间帧数 = 造成伤害时间 - 初始时间
                        const 团队增益列表 = 判断团队增益快照Buff({
                          团队增益轴,
                          判定帧: 距初始时间帧数,
                        })
                        if (心法 === '周天功' && 引窍阵眼时间轴?.length) {
                          // 判定引窍
                          if (
                            引窍阵眼时间轴?.some(
                              (item) => 距初始时间帧数 > item[0] && 距初始时间帧数 < item[1],
                            )
                          ) {
                            团队增益列表.push('含章挺秀阵')
                          }
                        }
                        if (团队增益列表?.length) {
                          const buff名称组 = `${原来buff列表String},${团队增益列表?.join(',')}`
                          增益对象数量组[buff名称组] = (增益对象数量组[buff名称组] || 0) + 1
                        } else {
                          增益对象数量组[原来buff列表String] =
                            增益对象数量组[原来buff列表String] + 1
                        }
                      }
                    }
                  })

                  Object.keys(增益对象数量组)?.forEach((buff列表) => {
                    const 数量 = 增益对象数量组[buff列表] || 0
                    if (数量) {
                      技能总数 = 技能总数 + 数量
                      技能增益列表.push({
                        增益名称: buff列表,
                        增益技能数: 数量,
                      })
                    }
                  })
                } else {
                  // 判断团队增益
                  const 数量 = 判断时间函数(JSONData?.[currentKey]?.[gain]?.timeline)
                  技能总数 = 技能总数 + 数量
                  let 增益实际情况: any = {
                    增益名称: buff实际列表?.join(','),
                    增益技能数: 数量,
                  }
                  if (记录伤害数据) {
                    const 数据信息 = JSONData?.[currentKey]?.[gain]
                    增益实际情况 = {
                      ...增益实际情况,
                      伤害数据: {
                        命中伤害: 数据信息?.damage,
                        会心伤害: 数据信息?.critical_damage,
                        会心率: 数据信息?.critical_strike,
                        期望伤害: 数据信息?.expected_damage,
                      },
                    }
                  }
                  技能增益列表.push(增益实际情况)
                }
              }
            }
          }
        })

        let 技能名称 = 心法数据枚举?.skills?.[获取技能ID]

        // 对部分心法，未支持dot的多层声明的情况，采用这种方式特殊处理，例：万灵 贯穿 dot 10层 调用为 贯穿·十
        // 后续新门派均不采用次方法，已经支持门派参考 DOT直接生成层数心法 可以节省大量代码
        if (技能名称?.includes('DOT') && !DOT直接生成层数心法?.includes(心法)) {
          if (技能层数) {
            技能名称 = `${技能名称}·${commonMap?.StackMap?.[技能层数]}`
          }
        }

        if (!技能名称) {
          message.error(`技能名称ID未获取：${key}`)
        }

        if (技能总数) {
          const obj: any = {
            技能名称,
            技能数量: 技能总数,
            技能增益列表,
          }
          if (技能层数 > 1) {
            obj.伤害层数 = 技能层数
          }
          if (技能等级 > 1) {
            obj.技能等级 = 技能等级
          }
          if (DOT跳数 > 1) {
            obj.DOT跳数 = DOT跳数
          }
          res.push(obj)
        }
      }
    })
  }

  // 过滤大附魔解析，统一用均摊计算，避免会心大附魔数量波动导致对循环相对高低的错误判断
  res = res?.filter((a) => !a?.技能名称?.includes('昆吾·弦刃') && !a?.技能名称?.includes('刃凌'))
  console.info('res', res)
  // 对技能名称进行排序
  res.sort((a, b) => a.技能名称?.localeCompare(b?.技能名称))

  console.info('战斗时间', 战斗时间)
  console.info('初始时间', 初始时间)

  if (直伤最终时间 && 心法数据枚举?.过滤截止战斗时间) {
    console.info('直伤最终时间', 直伤最终时间)
    message.info(`推测可能截断时间：${(直伤最终时间 - 初始时间) / 16}`)
  }
  const exportRes: any = {
    // 战斗时间: 战斗时间 / 16,
    战斗时间: (战斗时间 - 初始时间) / 16,
    技能详情: res,
  }
  if (记录伤害数据) {
    exportRes.支持伤害校验 = true
  }
  return exportRes
}
