/**
 * 数据索引 - 数据加载与查询引擎
 * 负责: JSON文件加载、内存索引构建、多模式查询
 */

import type {
  SkillItem,
  DotItem,
  BuffItem,
  RecipeItem,
  BuffsIndexData,
  RecipesIndexData,
  BelongsIndexData,
  NameRegistry,
  SearchResult,
  BuffDisplayInfo,
  RecipeDisplayInfo,
  FormulaSegment,
} from './类型定义'
import { getAttributeLabel, getGainType, getGainTypeColor } from './属性映射'
import { parseFormula, analyzeContributions } from './公式解析'

import skillsData from './数据源/skills_index.json'
import dotsData from './数据源/dots_index.json'
import buffsData from './数据源/buffs_index.json'
import recipesData from './数据源/recipes_index.json'
import belongsData from './数据源/belongs_index.json'
import nameRegistryData from './数据源/name_registry.json'
import kungfuData from './数据源/kungfu_index.json'

let initialized = false

const skillById = new Map<string, SkillItem>()
const dotById = new Map<string, DotItem>()
const buffById = new Map<string, BuffItem>()
const recipeByKey = new Map<string, RecipeItem>()
const skillNameIndex: string[] = []
const buffNameIndex: string[] = []
const recipeNameIndex: string[] = []
const buffToSkills = new Map<string, string[]>()
const recipeToSkills = new Map<string, string[]>()
const recipeToBuff = new Map<string, { buffId: string; buffName: string }>()
const recipeToBelong = new Map<string, { belongId: string; belongName: string; desc: string }>()
const nameRegistry = nameRegistryData as unknown as NameRegistry
const belongSkillRecipes = (belongsData as unknown as BelongsIndexData).skill_recipes || {}

function init() {
  if (initialized) return
  initialized = true

  for (const skill of skillsData as unknown as SkillItem[]) {
    const existing = skillById.get(skill.id)
    if (!existing || (skill.name && skill.name.length > (existing.name || '').length)) {
      skillById.set(skill.id, skill)
    }
    if (!existing) {
      skillNameIndex.push(skill.id)
    }
  }

  for (const dot of dotsData as unknown as DotItem[]) {
    const existing = dotById.get(dot.id)
    if (!existing || (dot.name && dot.name.length > (existing.name || '').length)) {
      dotById.set(dot.id, dot)
    }
    if (!existing) {
      skillNameIndex.push(dot.id)
    }
  }

  const bi = buffsData as unknown as BuffsIndexData
  for (const buff of bi.items || []) {
    const existing = buffById.get(buff.id)
    if (!existing || (buff.name && buff.name.length > (existing.name || '').length)) {
      buffById.set(buff.id, buff)
    }
    if (!existing) {
      buffNameIndex.push(buff.id)
    }
    const skills = bi.reverse?.[buff.id] || []
    buffToSkills.set(buff.id, skills)
  }

  // recipe → buff: match by recipe numeric ID (ignore level)
  for (const buff of bi.items || []) {
    if (buff.recipes && Array.isArray(buff.recipes)) {
      for (const rk of buff.recipes) {
        const m = rk.match(/\d+/)
        if (m) {
          const rid = m[0]
          if (!recipeToBuff.has(rid)) {
            recipeToBuff.set(rid, { buffId: buff.id, buffName: buff.name })
          }
        }
      }
    }
  }

  // recipe → belong (talent/奇穴 provided recipes)
  const belData = belongsData as unknown as BelongsIndexData
  if (belData.recipe_to_belong) {
    for (const [rk, info] of Object.entries(belData.recipe_to_belong)) {
      const m = rk.match(/\d+/)
      if (m) {
        const rid = m[0]
        if (!recipeToBelong.has(rid)) {
          recipeToBelong.set(rid, info)
        }
      }
    }
  }

  const ri = recipesData as unknown as RecipesIndexData
  for (const recipe of ri.items || []) {
    recipeByKey.set(recipe.key, recipe)
    recipeNameIndex.push(recipe.key)
    const skills = ri.reverse?.[String(recipe.id)] || []
    recipeToSkills.set(String(recipe.id), skills)
  }
}

function getNameById(id: string, source: string): string {
  const key = `${source}_${id}`
  return nameRegistry[key]?.name || ''
}

function getNameByRecipeKey(key: string): string {
  return nameRegistry[key]?.name || recipeByKey.get(key)?.name || ''
}

/** 模糊匹配搜索 */
function fuzzyMatch(
  query: string,
  candidates: string[],
  getText: (id: string) => string,
): { id: string; score: number }[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const seen = new Set<string>()
  const results: { id: string; score: number }[] = []

  for (const id of candidates) {
    if (seen.has(id)) continue
    seen.add(id)
    const text = getText(id).toLowerCase()
    if (!text) continue

    let score = 0
    if (text === q) {
      score = 100
    } else if (text.startsWith(q)) {
      score = 80
    } else if (text.includes(q)) {
      score = 60
    } else if (id.toLowerCase() === q) {
      score = 50
    } else if (id.toLowerCase().includes(q)) {
      score = 40
    }

    if (score > 0) {
      results.push({ id, score })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, 50)
}

/** 按技能名/ID搜索 */
export function searchSkill(query: string): SearchResult[] {
  init()
  const matches = fuzzyMatch(query, skillNameIndex, (id) => {
    const skill = skillById.get(id) || dotById.get(id)
    return skill?.name || ''
  })

  return matches.map(({ id, score }) => {
    const skill = skillById.get(id)
    const dot = dotById.get(id)
    const entity = skill || dot

    return {
      id,
      name: entity?.name || id,
      type: skill ? 'skill' : 'dot',
      schoolId: entity?.school_id || '',
      matchedField: 'name',
      score,
    }
  })
}

/** 按增益名/ID搜索 */
export function searchBuff(query: string): SearchResult[] {
  init()
  const matches = fuzzyMatch(query, buffNameIndex, (id) => buffById.get(id)?.name || '')

  return matches.map(({ id, score }) => {
    const buff = buffById.get(id)
    return {
      id,
      name: buff?.name || id,
      type: 'buff' as const,
      schoolId: buff?.school_id || '',
      matchedField: 'name',
      score,
    }
  })
}

/** 按秘籍名/key搜索 */
export function searchRecipe(query: string): SearchResult[] {
  init()
  const matches = fuzzyMatch(query, recipeNameIndex, (key) => recipeByKey.get(key)?.name || '')

  return matches.map(({ id, score }) => {
    const recipe = recipeByKey.get(id)
    return {
      id,
      name: recipe?.name || id,
      type: 'recipe' as const,
      schoolId: recipe?.school_id || '',
      matchedField: 'name',
      score,
    }
  })
}

/** 获取技能关联的Buffs，包含 buff 提供的 recipe 信息 */
export function getSkillBuffs(
  skillId: string,
  contributions?: Record<
    string,
    | {
        segmentLabel: string
        segmentColorKey: string
        effectType: string
        coeff: number
        divisor: number
        effectDesc: string
      }
    | undefined
  >,
): BuffDisplayInfo[] {
  init()
  const skill = skillById.get(skillId) || dotById.get(skillId)
  if (!skill) return []

  const results: BuffDisplayInfo[] = []
  const seen = new Set<string>()

  // A. 直接公式引用: skill.ref_buffs
  for (const buffRef of skill.ref_buffs) {
    const m = buffRef.match(/\d+/)
    if (!m) continue
    const bid = m[0]
    if (seen.has(bid)) continue
    seen.add(bid)

    const buff = buffById.get(bid)
    if (!buff) continue

    const attributes: { label: string; value: number }[] = []
    let primaryGainType = '其他'
    for (const [key, value] of Object.entries(buff.attrs)) {
      const label = getAttributeLabel(key)
      attributes.push({ label, value: Number(value) })
      if (primaryGainType === '其他') {
        primaryGainType = getGainType(key)
      }
    }

    // Determine gain type from formula context if no attrs
    if (primaryGainType === '其他' && (!buff.attrs || Object.keys(buff.attrs).length === 0)) {
      if (skill.formula.includes('damage_scale'))
        primaryGainType = '百分比增益' as BuffDisplayInfo['gainType']
    }

    // Build providedRecipes with contribution-based names
    const providedRecipes: { key: string; name: string; desc: string }[] = []
    if (buff.recipes && Array.isArray(buff.recipes)) {
      for (const rk of buff.recipes) {
        const recipeRid = (rk.match(/\d+/) || [''])[0]
        if (skill.ref_recipes.some((rr) => (rr.match(/\d+/) || [''])[0] === recipeRid)) {
          const contrib = contributions?.[rk]
          if (contrib) {
            providedRecipes.push({
              key: rk,
              name: `[${contrib.segmentLabel}] ${contrib.effectDesc}`,
              desc: `系数: ${contrib.coeff}/${contrib.divisor}`,
            })
          } else {
            const rinfo = recipeByKey.get(rk)
            providedRecipes.push({
              key: rk,
              name: rinfo?.name || `配方`,
              desc: rinfo?.desc || `由增益 "${buff.name}" 提供`,
            })
          }
        }
      }
    }

    // If no attr and no recipe, show formula coefficient from contributions
    if (attributes.length === 0 && providedRecipes.length === 0) {
      const contrib = contributions?.[buffRef]
      if (contrib) {
        attributes.push({ label: `${contrib.segmentLabel}`, value: contrib.coeff })
        primaryGainType = '百分比增益' as BuffDisplayInfo['gainType']
      }
    }

    results.push({
      id: buff.id,
      name: buff.name || getNameById(buff.id, 'buff') || `Buff_${buff.id}`,
      gainType: primaryGainType as BuffDisplayInfo['gainType'],
      gainTypeColor: getGainTypeColor(primaryGainType as BuffDisplayInfo['gainType']),
      attributes,
      maxStack: buff.max_stack,
      maxTick: buff.max_tick,
      interval: buff.interval,
      providedRecipes: providedRecipes.length > 0 ? providedRecipes : undefined,
    })
  }

  // B. Buffs that provide recipes referenced in the formula
  // (these buffs are NOT in ref_buffs but their recipes ARE in ref_recipes)
  const addedBuffIds = new Set(results.map((r) => r.id))
  for (const recipeRef of skill.ref_recipes) {
    const rid = (recipeRef.match(/\d+/) || [''])[0]
    if (!rid) continue
    const buffInfo = recipeToBuff.get(rid)
    if (!buffInfo) continue
    const bid = buffInfo.buffId
    if (addedBuffIds.has(bid)) continue
    addedBuffIds.add(bid)

    const buff = buffById.get(bid)
    if (!buff) continue

    const attributes: { label: string; value: number }[] = []
    let primaryGainType = '其他'
    for (const [key, value] of Object.entries(buff.attrs)) {
      const label = getAttributeLabel(key)
      attributes.push({ label, value: Number(value) })
      if (primaryGainType === '其他') {
        primaryGainType = getGainType(key)
      }
    }
    if (primaryGainType === '其他') primaryGainType = '特殊效果'

    // Collect all recipes from this buff that the skill references, with contribution info
    const providedRecipesB: { key: string; name: string; desc: string }[] = []
    if (buff.recipes && Array.isArray(buff.recipes)) {
      for (const rk of buff.recipes) {
        const recipeRid = (rk.match(/\d+/) || [''])[0]
        if (skill.ref_recipes.some((rr) => (rr.match(/\d+/) || [''])[0] === recipeRid)) {
          const contrib = contributions?.[rk]
          if (contrib) {
            providedRecipesB.push({
              key: rk,
              name: `[${contrib.segmentLabel}] ${contrib.effectDesc}`,
              desc: `系数: ${contrib.coeff}/${contrib.divisor}`,
            })
          } else {
            const rinfo = recipeByKey.get(rk)
            providedRecipesB.push({
              key: rk,
              name: rinfo?.name || `配方`,
              desc: rinfo?.desc || `由增益 "${buff.name}" 提供`,
            })
          }
        }
      }
    }
    if (providedRecipesB.length === 0 && buff.recipes && buff.recipes.length > 0) {
      providedRecipesB.push({
        key: recipeRef,
        name: `多级配方`,
        desc: `由增益 "${buff.name}" 提供`,
      })
    }

    results.push({
      id: buff.id,
      name: buff.name || getNameById(buff.id, 'buff') || `Buff_${buff.id}`,
      gainType: primaryGainType as BuffDisplayInfo['gainType'],
      gainTypeColor: getGainTypeColor(primaryGainType as BuffDisplayInfo['gainType']),
      attributes,
      maxStack: buff.max_stack,
      maxTick: buff.max_tick,
      interval: buff.interval,
      providedRecipes: providedRecipesB.length > 0 ? providedRecipesB : undefined,
    })
  }

  return results
}

/** 获取技能关联的Recipes - 只展示公式中的 recipe，按优先级查找详情 */
export function getSkillRecipes(skillId: string): RecipeDisplayInfo[] {
  init()
  const skill = skillById.get(skillId) || dotById.get(skillId)
  if (!skill) return []

  const results: RecipeDisplayInfo[] = []
  const seen = new Set<string>()

  for (const recipeRef of skill.ref_recipes) {
    if (seen.has(recipeRef)) continue
    seen.add(recipeRef)

    const rid = (recipeRef.match(/\d+/) || [''])[0]

    // Priority 1: recipes_index.json (skill secret manuals)
    const recipe = recipeByKey.get(recipeRef)
    if (
      recipe &&
      recipe.source !== '武器' &&
      recipe.source !== '防具' &&
      recipe.source !== '饰品' &&
      recipe.source !== '附魔'
    ) {
      results.push({
        key: recipe.key,
        name: recipe.name,
        desc: recipe.desc,
        skillId: recipe.skill_id,
        skillName:
          getNameById(recipe.skill_id, 'skill') ||
          getNameById(recipe.skill_id, 'belong') ||
          recipe.skill_id,
      })
      continue
    }

    // Priority 2: Equipment source (武器/防具/饰品/附魔)
    if (recipe && recipe.source) {
      results.push({
        key: recipe.key,
        name: recipe.name,
        desc: recipe.desc,
        skillId: recipe.skill_id,
        skillName: getNameById(recipe.skill_id, 'skill') || recipe.skill_id,
      })
      continue
    }

    // Priority 3: Belongs (奇穴/技能提供的 recipe)
    const belongInfo = recipeToBelong.get(rid)
    if (belongInfo) {
      results.push({
        key: recipeRef,
        name: `[奇穴: ${belongInfo.belongName}] ${recipeRef}`,
        desc: belongInfo.desc || `奇穴 "${belongInfo.belongName}" 提供`,
        skillId: belongInfo.belongId,
        skillName: belongInfo.belongName,
      })
      continue
    }

    // Priority 4: Buff → skip here, shown in getSkillBuffs
    if (recipeToBuff.has(rid)) continue

    // Fallback: formula reference only
    results.push({
      key: recipeRef,
      name: `[公式引用] ${recipeRef}`,
      desc: '该秘籍在公式中存在引用，但无详情数据',
      skillId: '',
      skillName: '未知',
    })
  }

  return results
}

/** 获取增益作用的技能列表 */
export function getBuffSkills(buffId: string): (SkillItem | DotItem)[] {
  init()
  const skillIds = buffToSkills.get(buffId) || []

  return skillIds.map((id) => skillById.get(id) || dotById.get(id)).filter(Boolean) as (
    | SkillItem
    | DotItem
  )[]
}

/** 获取秘籍作用的技能列表 */
export function getRecipeSkills(recipeKey: string): (SkillItem | DotItem)[] {
  init()
  const m = recipeKey.match(/\d+/)
  if (!m) return []
  const recipeId = m[0]
  const skillIds = recipeToSkills.get(recipeId) || []

  return skillIds.map((id) => skillById.get(id) || dotById.get(id)).filter(Boolean) as (
    | SkillItem
    | DotItem
  )[]
}

/** 获取技能完整公式信息 */
export function getSkillFormula(
  skillId: string,
): {
  formula: string
  critical: string
  criticalPower: string
  attrs: Record<string, string>
} | null {
  init()
  const skill = skillById.get(skillId) || dotById.get(skillId)
  if (!skill) return null

  return {
    formula: skill.formula,
    critical: skill.critical_strike,
    criticalPower: skill.critical_power,
    attrs: skill.attrs as unknown as Record<string, string>,
  }
}

/** 获取技能完整公式解析结果 */
export function getSkillFormulaParsed(skillId: string): {
  skill: SkillItem | DotItem | null
  formulaSegments: FormulaSegment[]
  criticalSegments: FormulaSegment[]
  formulaRaw: string
  criticalRaw: string
  recipeContributions: Record<
    string,
    | {
        segmentLabel: string
        segmentColorKey: string
        effectType: string
        coeff: number
        divisor: number
        effectDesc: string
      }
    | undefined
  >
} {
  init()
  const skill = skillById.get(skillId) || dotById.get(skillId)
  if (!skill)
    return {
      skill: null,
      formulaSegments: [],
      criticalSegments: [],
      formulaRaw: '',
      criticalRaw: '',
      recipeContributions: {},
    }

  const nameMap = buildNameMapForSkill(skill)
  const descMap = buildDescMapForSkill(skill)

  const formulaSegments = parseFormula(skill.formula, nameMap, descMap)
  const criticalSegments =
    skill.critical_strike && skill.critical_strike !== '0'
      ? parseFormula(skill.critical_strike, nameMap, descMap)
      : []

  const allVars = [...skill.ref_recipes, ...skill.ref_buffs]
  const framesFormula = skill.attrs?.frames || ''
  const recipeContributions = analyzeContributions(
    skill.formula,
    skill.critical_strike,
    framesFormula,
    allVars,
  )

  return {
    skill,
    formulaSegments,
    criticalSegments,
    formulaRaw: skill.formula,
    criticalRaw: skill.critical_strike,
    recipeContributions,
  }
}

/** 为技能的变量构建名称映射 */
function buildNameMapForSkill(skill: SkillItem | DotItem): Record<string, string> {
  const map: Record<string, string> = {}
  for (const r of skill.ref_recipes) {
    const name = getNameByRecipeKey(r)
    if (name && name !== r) {
      map[r] = name
    } else {
      const rid = (r.match(/\d+/) || [''])[0]
      const buffInfo = recipeToBuff.get(rid)
      if (buffInfo) {
        map[r] = buffInfo.buffName
      } else {
        const belongInfo = recipeToBelong.get(rid)
        if (belongInfo) {
          map[r] = belongInfo.belongName
        } else {
          map[r] = r
        }
      }
    }
  }
  for (const b of skill.ref_buffs) {
    const m = b.match(/\d+/)
    if (m) {
      const buff = buffById.get(m[0])
      map[b] = buff?.name || getNameById(m[0], 'buff') || b
    }
  }
  return map
}

/** 为技能的变量构建描述映射 */
function buildDescMapForSkill(skill: SkillItem | DotItem): Record<string, string> {
  const map: Record<string, string> = {}
  for (const r of skill.ref_recipes) {
    const recipe = recipeByKey.get(r)
    if (recipe?.desc) {
      map[r] = recipe.desc
    } else {
      const rid = (r.match(/\d+/) || [''])[0]
      const buffInfo = recipeToBuff.get(rid)
      if (buffInfo) {
        map[r] = `由增益 "${buffInfo.buffName}" 提供`
      } else {
        const belongInfo = recipeToBelong.get(rid)
        if (belongInfo) {
          map[r] = `奇穴 "${belongInfo.belongName}": ${belongInfo.desc.substring(0, 80)}`
        }
      }
    }
  }
  return map
}

/** 获取增益基本信息 */
export function getBuffInfo(buffId: string): BuffItem | null {
  init()
  return buffById.get(buffId) || null
}

export function getRecipeInfo(recipeKey: string): RecipeItem | null {
  init()
  return recipeByKey.get(recipeKey) || null
}

/** 获得技能基本信息 */
export function getSkillInfo(skillId: string): SkillItem | DotItem | null {
  init()
  return skillById.get(skillId) || dotById.get(skillId) || null
}

/** 获取心法筛选选项（动态，基于 kungfu_index.json） */
export function getKungfuOptions(): { label: string; value: string }[] {
  const kf = kungfuData as unknown as {
    items: { id: string; school: string; kind: string; major: string }[]
  }
  const options: { label: string; value: string }[] = [{ label: '全部门派', value: '' }]
  for (const item of kf.items || []) {
    options.push({
      label: `${item.school} (${item.kind})`,
      value: item.id,
    })
  }
  return options
}
