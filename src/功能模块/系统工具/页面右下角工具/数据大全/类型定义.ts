export interface SkillItem {
  id: string
  sub_id: string
  name: string
  school_id: string
  type: 'skill'
  formula: string
  critical_strike: string
  critical_power: string
  attrs: {
    frames: string
    attack_power_cof: string
  }
  ref_recipes: string[]
  ref_buffs: string[]
}

export interface DotItem {
  id: string
  dot_group_id: string
  dot_id: string
  name: string
  dot_name: string
  interval: string
  max_stack: number
  max_tick: number
  school_id: string
  type: 'dot'
  formula: string
  critical_strike: string
  critical_power: string
  attrs: {
    frames: string
    attack_power_cof: string
  }
  ref_recipes: string[]
  ref_buffs: string[]
}

export interface BuffItem {
  id: string
  sub_id: string
  name: string
  school_id: string
  attrs: Record<string, number>
  recipes: string[]
  interval: number
  max_stack: number
  max_tick: number
  comment: string
}

export interface RecipeItem {
  key: string
  id: number
  level: number
  name: string
  desc: string
  skill_id: string
  school_id: string
  source?: string
}

export interface BelongItem {
  id: string
  name: string
  desc: string
  recipes: string[]
  belong_key: string
  school_id: string
}

export interface BuffsIndexData {
  items: BuffItem[]
  reverse: Record<string, string[]>
}

export interface RecipesIndexData {
  items: RecipeItem[]
  reverse: Record<string, string[]>
}

export interface BelongsIndexData {
  items: BelongItem[]
  skill_recipes: Record<string, string[]>
  recipe_to_belong: Record<string, { belongId: string; belongName: string; desc: string }>
}

export interface NameRegistryEntry {
  id?: string
  key?: string
  name: string
  source: 'skill' | 'dot' | 'buff' | 'recipe' | 'belong'
  dot_name?: string
}

export interface NameRegistry {
  [key: string]: NameRegistryEntry
}

export type GainType = '属性增益' | '百分比增益' | '会心会效' | '特殊效果' | '其他'

export interface BuffDisplayInfo {
  id: string
  name: string
  gainType: GainType
  gainTypeColor: string
  attributes: { label: string; value: number }[]
  maxStack: number
  maxTick: number
  interval: number
  providedRecipes?: { key: string; name: string; desc: string }[]
}

export interface RecipeDisplayInfo {
  key: string
  name: string
  desc: string
  skillId: string
  skillName: string
}

export interface SearchResult {
  id: string
  name: string
  type: 'skill' | 'dot' | 'buff' | 'recipe'
  subType?: string
  schoolId: string
  matchedField: string
  score: number
}

export interface FormulaSegment {
  label: string
  expression: string
  colorKey: string
  color: string
  variables: FormulaVariable[]
}

export interface FormulaVariable {
  name: string
  type: 'recipe' | 'buff' | 'attribute' | 'function' | 'constant'
  displayName: string
  description?: string
  refId?: string
  isTogglable: boolean
}

export interface RecipeContribution {
  key: string
  segmentLabel: string
  segmentColorKey: string
  effectType: 'mul' | 'add' | 'add_crit'
  coeff: number
  divisor: number
  effectDesc: string
}
