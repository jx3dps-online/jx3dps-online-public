import { 技能基础数据模型 } from '@/@types/技能'
import { 循环技能详情 } from '@/@types/循环'
import { Buff, Dot, LoopItem, Skill } from './interface'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 去除对象中的无效值 } from '@/工具函数/help'

const { 技能系数 } = 获取当前数据()

const 解析Generator主函数 = (value) => {
  // 奇穴信息
  const talentData = parseTalentData(value.talents)
  // 技能信息
  const { loopData, totalDuration, notFoundSkill, notFoundBuff } = parseLoopData(value.loop)
  return {
    talentData,
    loopData,
    totalDuration: Number(totalDuration.toFixed(5)), // 避免计算精度问题导致的000000001
    notFoundSkill,
    notFoundBuff,
  }
}

/**
 * 技能信息
 * @param {*} loop
 */
const parseLoopData = (loop: LoopItem[]) => {
  let totalDuration = 0 // 循环总时长
  const notFoundSkill: Array<Skill | Dot> = []
  let notFoundBuff: Buff[] = []
  const skillDataMap: Record<string, 循环技能详情> = {}

  // 统一处理函数
  const parseDamageData = (
    key,
    level,
    baseData,
    allCount,
    allBuff: any[] = [],
    hitCount?,
    dotTick?,
  ) => {
    // 创建新的技能数据
    if (!skillDataMap[key]) {
      skillDataMap[key] = 去除对象中的无效值({
        技能名称: baseData?.技能名称,
        技能等级: level || 1,
        技能数量: 0,
        伤害层数: hitCount || undefined,
        DOT跳数: dotTick || undefined,
      })
    }
    // 技能数量
    skillDataMap[key].技能数量 += allCount
    // 判断增益，添加技能增益数据
    const gainKey = allBuff?.join(',')
    const currentSkillData = [...(skillDataMap[key]?.技能增益列表 || [])]
    const findcurrentGain = currentSkillData.find((gain) => gain.增益名称 === gainKey)
    if (findcurrentGain) {
      findcurrentGain.增益技能数 += allCount
    } else {
      currentSkillData.push({ 增益名称: gainKey, 增益技能数: allCount })
    }
    skillDataMap[key].技能增益列表 = currentSkillData
  }

  // 解析技能
  loop.forEach((loop) => {
    // 叠加技能总时间
    totalDuration += loop.duration * loop.count
    // 处理循环小节
    loop.records.forEach((record) => {
      const { buffs, skills, dots } = record
      if (!record.count) return
      // 处理常规技能
      skills.forEach((skill) => {
        let findSkillData
        const allSkillData = 技能系数?.filter(
          (item) => item.技能ID?.toString() === skill.skill_id.toString(),
        )
        if (allSkillData.length === 1) {
          findSkillData = allSkillData[0]
        } else {
          findSkillData = allSkillData[skill.skill_level - 1]
        }
        if (findSkillData) {
          const skillKey = `${skill.skill_id}**${skill.skill_level}`
          const { allBuff, notFoundBuff: notFound } = getSkillBuffs(buffs, findSkillData)
          const allCount = skill.count * record.count * loop.count
          parseDamageData(skillKey, skill.skill_level, findSkillData, allCount, allBuff)
          if (notFound?.length) {
            notFoundBuff = notFoundBuff.concat(
              notFound?.filter((item) => !notFoundBuff.some((a) => a.buff_id === item.buff_id)),
            )
          }
        } else {
          notFoundSkill.push(skill)
        }
      })
      // 处理Dot技能
      dots.forEach((dot) => {
        const findDotData = 技能系数?.find(
          (item) => item.技能ID?.toString() === `${dot.dot_id}_${dot.source.skill_id}`,
        )
        if (findDotData) {
          const key = `${dot.dot_id}**${dot.source.skill_id}**${dot.source.skill_level}**${dot.source.count}`
          const { allBuff, notFoundBuff: notFound } = getDotBuffs(buffs, findDotData)
          const allCount = dot.count * record.count * loop.count
          parseDamageData(
            key,
            dot.source.skill_level,
            findDotData,
            allCount,
            allBuff,
            dot.source.count,
            dot.current_tick,
          )
          if (notFound?.length) {
            notFoundBuff = notFoundBuff.concat(
              notFound?.filter((item) => !notFoundBuff.some((a) => a.buff_id === item.buff_id)),
            )
          }
        } else {
          notFoundSkill.push(dot)
        }
      })
    })
  })

  const loopData = Object.values(skillDataMap)
  return { loopData, totalDuration, notFoundSkill, notFoundBuff }
}

/**
 * 解析技能伤害携带Buff
 */
const getSkillBuffs = (buffs: Buff[], skillData: 技能基础数据模型) => {
  const notFoundBuff: any[] = []
  const allBuff: string[] = []
  // 找到这个技能可以吃到的加成
  const skillBelongBuff = skillData?.技能增益列表 || []
  buffs.forEach((buff) => {
    // 技能伤害不计算快照伤害
    if (buff.buff_type === 'Snapshot') return
    if (buff.buff_id === 29268) {
      allBuff.push('风特效_快照', '风特效_英雄_快照')
    } else {
      const findBuff = skillBelongBuff.find((skillBuff) => {
        const stackCheck = skillBuff.Buff层数 ? buff.stack === skillBuff.Buff层数 : true
        const levelCheck = skillBuff.Buff等级 ? buff.buff_level === skillBuff.Buff等级 : true
        const idCheck = buff.buff_id === skillBuff.BuffId
        return levelCheck && idCheck && stackCheck
      })
      if (findBuff) {
        if (!allBuff?.includes(findBuff?.增益名称)) {
          allBuff.push(findBuff?.增益名称)
        }
      } else {
        if (!notFoundBuff?.some((a) => a?.buff_id === buff?.buff_id)) {
          notFoundBuff.push({
            skill_name: skillData.技能名称,
            belong: buff.belong,
            skill_id: skillData.技能ID,
            buff_id: buff.buff_id,
          })
        }
      }
    }
  })
  return { allBuff, notFoundBuff }
}

/**
 * 获取Dot伤害懈怠Buff
 */
const getDotBuffs = (buffs: Buff[], skillData: 技能基础数据模型) => {
  const notFoundBuff: any[] = []
  const allBuff: string[] = []
  // 找到这个技能可以吃到的加成
  const skillBelongBuff = skillData?.技能增益列表 || []
  buffs.forEach((buff) => {
    const findBuff = skillBelongBuff.find((skillBuff) => {
      const stackCheck = skillBuff.Buff层数 ? buff.stack === skillBuff.Buff层数 : true
      const levelCheck = skillBuff.Buff等级 ? buff.buff_level === skillBuff.Buff等级 : true
      const idCheck = buff.buff_id === skillBuff.BuffId
      return levelCheck && idCheck && stackCheck
    })
    if (buff.buff_type === 'Current' && findBuff?.增益计算位置 !== '目标') return
    if (findBuff) {
      if (!allBuff?.includes(findBuff?.增益名称)) {
        allBuff.push(findBuff?.增益名称)
      }
    } else {
      if (!notFoundBuff?.some((a) => a?.buff_id === buff?.buff_id)) {
        notFoundBuff.push({
          skill_name: skillData.技能名称,
          belong: buff.belong,
          skill_id: skillData.技能ID,
          buff_id: buff.buff_id,
        })
      }
    }
  })
  return { allBuff, notFoundBuff }
}

/**
 * 解析奇穴信息
 * @param {*} talents
 */
const parseTalentData = (talents) => {
  const talentData: string[] = []
  // 解析常规奇穴
  Object.values(talents).forEach((talent: any) => {
    if (talent?.name) {
      talentData.push(talent.name)
    }
  })
  // 解析混池
  talents?.talent_pool?.forEach((poolItem) => {
    if (poolItem?.name) {
      talentData.push(poolItem.name)
    }
  })
  return talentData
}

export default 解析Generator主函数
