import { optimizationTool } from './optimization-tool'
// import { optimizationTool } from './optimization-tool_2'
import 循环秒伤计算 from '../循环秒伤计算'
import { 装备信息数据类型 } from '@/@types/装备'
import { 循环技能详情 } from '@/@types/循环'
import { 目标属性类型 } from '@/@types/常量'
import { 快照类型, 技能基础数据模型 } from '@/@types/技能'
import { 增益选项数据类型 } from '@/@types/团队增益'
import { 当前计算结果类型 } from '@/@types/输出'

interface DpsKernelOptimizerParams {
  心法名称?: string
  特殊配置?: Record<string, any>
  // 以下为获取dps结果的的基本必要参数集
  计算循环: 循环技能详情[]
  当前装备信息: 装备信息数据类型
  当前输出计算目标: 目标属性类型
  技能基础数据: 技能基础数据模型[]
  增益数据: 增益选项数据类型
  增益启用: boolean
  快照计算: 快照类型[]
  当前计算结果: 当前计算结果类型
  奇穴数据: string[]
}

// 计算dps最大期望值的算法
const DpsKernelOptimizer = ({
  心法名称,
  特殊配置,
  计算循环,
  当前装备信息,
  当前输出计算目标,
  技能基础数据,
  增益启用,
  增益数据,
  快照计算,
  当前计算结果,
  奇穴数据,
}: DpsKernelOptimizerParams) => {
  // console.time('计算耗时')
  // 当前计算环境下的原属性总量
  const 当前装备基础信息 = { ...当前装备信息 }
  /**
   * @name 传入BFGS算法的目标函数
   * !假定当前已经穿上装备的属性总量中，会心+破防+无双的总量不变
   * !以获得在当前宗莲不变时不同占比下的最高dps
   * @param x
   * @params x[0] 代表会心比例 即会心在会心+破防总量中的占比
   * @params x[1] 代表无双比例 即会心在会心+破防总量中的占比
   * @returns number
   */

  const 数量级 = Math.floor(Math.log10(当前计算结果?.总伤))
  const 总数 = 100 * Math.pow(10, 数量级)

  const 技能数据映射 = new Map<string, 技能基础数据模型>(
    技能基础数据.map((item) => [item.技能名称, item]),
  )

  const getDpsFunction = (x) => {
    const 新装备信息 = getNewCharacterData(当前装备基础信息, x?.[0], x?.[1])
    const { 总伤 } = 循环秒伤计算({
      心法名称,
      特殊配置,
      计算循环,
      装备信息: 新装备信息,
      当前目标: 当前输出计算目标,
      技能数据映射,
      增益启用,
      增益数据,
      是否郭氏计算: false,
      战斗时间: 300, // 这里只需要算总dps，算固定300秒的dps
      快照计算,
      奇穴数据,
    })
    let 计算总伤 = 总伤
    if (计算总伤 <= 0) {
      计算总伤 = 1000
    }
    return 总数 / 计算总伤
  }

  const 当前基础面板 = 当前装备信息?.装备基础属性
  const 当前镶嵌附魔面板 = 当前装备信息?.装备镶嵌附魔属性

  const 当前会心 = 当前基础面板?.会心等级 - 当前镶嵌附魔面板?.会心等级 || 0
  const 当前破防 = 当前基础面板?.破防等级 - 当前镶嵌附魔面板?.破防等级 || 0
  const 当前无双 = 当前基础面板?.无双等级 - 当前镶嵌附魔面板?.无双等级 || 0

  const 当前实际会心比例 = 当前会心 / (当前会心 + 当前破防)
  const 当前实际无双比例 = 当前无双 / (当前会心 + 当前破防 + 当前无双)

  let 计算比例 = [0.5, 0.5]
  if (当前实际无双比例 !== 0 && 当前实际会心比例 !== 0) {
    计算比例 = [当前实际会心比例, 当前实际无双比例]
  }
  const maxObj = optimizationTool({
    getDpsFunction,
    initialGuess: 计算比例,
    tol: 1e-20,
  })

  const maxCharacterData = getNewCharacterData(
    当前装备基础信息,
    maxObj?.solution?.[0],
    maxObj?.solution?.[1],
  )

  // console.timeEnd('计算耗时')

  return { maxCharacterData, maxObj }
}

/**
 * @name getNewCharacterData
 * @params x[0] 代表会心比例 即会心在会心+破防总量中的占比
 * @params x[1] 代表无双比例 即无双在会心+破防+无双总量中的占比
 * @returns CharacterFinalDTO
 */

const getNewCharacterData = (
  当前装备信息: 装备信息数据类型,
  会心比例: number,
  无双比例: number,
) => {
  // 提前验证参数合法性
  if (会心比例 < 0 || 会心比例 > 1 || 无双比例 < 0 || 无双比例 > 1) {
    return {
      ...当前装备信息,
      装备基础属性: {
        ...当前装备信息.装备基础属性,
        面板攻击: 0,
        基础攻击: 0,
        会心等级: 0,
        破防等级: 0,
        无双等级: 0,
      },
    }
  }

  // 解构提取必要属性（减少后续的对象访问次数）
  const {
    会心等级: 基础会心 = 0,
    破防等级: 基础破防 = 0,
    无双等级: 基础无双 = 0,
  } = 当前装备信息.装备基础属性 || {}
  const {
    会心等级: 镶嵌会心 = 0,
    破防等级: 镶嵌破防 = 0,
    无双等级: 镶嵌无双 = 0,
  } = 当前装备信息.装备镶嵌附魔属性 || {}

  // 合并计算（时间复杂度从 O(6) 优化为 O(3)）
  const 实际总容量 = 基础会心 + 基础破防 + 基础无双 - (镶嵌会心 + 镶嵌破防 + 镶嵌无双)

  // 批量计算核心数值（减少重复计算）
  const 无双分配量 = 实际总容量 * 无双比例
  const 会心分配量 = 实际总容量 * (1 - 无双比例) * 会心比例
  const 破防分配量 = 实际总容量 * (1 - 无双比例) * (1 - 会心比例)

  // 构造新对象（仅修改必要属性）
  return {
    ...当前装备信息,
    装备基础属性: {
      ...当前装备信息.装备基础属性,
      会心等级: 会心分配量 + 镶嵌会心,
      破防等级: 破防分配量 + 镶嵌破防,
      无双等级: 无双分配量 + 镶嵌无双,
    },
  }
}

export default DpsKernelOptimizer
