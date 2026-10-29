/**
 * 公式解析器
 * 负责: 变量提取、变量分类、公式分段分解
 */

import type { FormulaSegment, FormulaVariable } from './类型定义'
import { getAttributeLabel, getGainTypeColor, getGainType } from './属性映射'

const VARIABLE_PATTERN = /[a-zA-Z_][a-zA-Z0-9_]*/g
const RECIPE_PATTERN = /^recipe_\d+_\d+$/
const BUFF_PATTERN = /^buff_\d+_\d+$/
const KNOWN_FUNCTIONS = ['int', 'ceil', 'max', 'min', 'floor']

const SEGMENT_LABELS: { pattern: RegExp; label: string; colorKey: string; color: string }[] = [
  { pattern: /weapon_damage/, label: '武器伤害', colorKey: 'weapon', color: '#722ed1' },
  {
    pattern: /skill_damage_final_addition/,
    label: '最终增伤',
    colorKey: 'final',
    color: '#f5222d',
  },
  { pattern: /pve_damage_addition/, label: '非侠增伤', colorKey: 'pve', color: '#2f54eb' },
  { pattern: /[a-z]+_damage_addition/, label: '伤害加成', colorKey: 'addition', color: '#faad14' },
  { pattern: /damage_scale/, label: '伤害缩放', colorKey: 'scale', color: '#a0d911' },
  { pattern: /[a-z]+_damage_scale/, label: '属性伤害缩放', colorKey: 'scale', color: '#a0d911' },
  { pattern: /level/, label: '等级压制', colorKey: 'level', color: '#fa541c' },
  { pattern: /shield_constant/, label: '防御减免', colorKey: 'defense', color: '#eb2f96' },
  { pattern: /_shield|shield_/, label: '防御减免', colorKey: 'defense', color: '#eb2f96' },
  { pattern: /_overcome/, label: '破防增益', colorKey: 'overcome', color: '#52c41a' },
  { pattern: /strain/, label: '无双增益', colorKey: 'strain', color: '#13c2c2' },
  { pattern: /attack_power/, label: '攻击力系数', colorKey: 'attack', color: '#1890ff' },
  { pattern: /equip_score/, label: '装分加成', colorKey: 'equip', color: '#722ed1' },
  { pattern: /rand/, label: '基础伤害浮动', colorKey: 'base', color: '#8c8c8c' },
  { pattern: /_damage_base/, label: '基础伤害', colorKey: 'base', color: '#8c8c8c' },
]

/** 提取公式中的所有变量名 */
export function extractVariables(formula: string): string[] {
  const matches = formula.match(VARIABLE_PATTERN) || []
  const unique = [...new Set(matches)]
  return unique.filter((v) => !KNOWN_FUNCTIONS.includes(v))
}

/** 分类变量 */
export function classifyVariable(name: string): FormulaVariable['type'] {
  if (RECIPE_PATTERN.test(name)) return 'recipe'
  if (BUFF_PATTERN.test(name)) return 'buff'
  if (KNOWN_FUNCTIONS.includes(name)) return 'function'
  if (/^\d+(\.\d+)?$/.test(name)) return 'constant'
  return 'attribute'
}

/** 解析变量为显示信息 */
export function resolveVariable(
  name: string,
  nameMap: Record<string, string> = {},
  descMap: Record<string, string> = {},
): FormulaVariable {
  const type = classifyVariable(name)

  let displayName = name
  let description: string | undefined
  let refId: string | undefined
  let isTogglable = false

  if (type === 'recipe') {
    displayName = nameMap[name] || `秘籍_${name}`
    description = descMap[name]
    refId = name.match(/\d+/)?.[0]
    isTogglable = true
  } else if (type === 'buff') {
    displayName = nameMap[name] || `Buff_${name}`
    description = descMap[name]
    refId = name.match(/\d+/)?.[0]
    isTogglable = false
  } else if (type === 'attribute') {
    displayName = getAttributeLabel(name)
  }

  return { name, type, displayName, description, refId, isTogglable }
}

/** 分解公式为乘法链段 */
export function decomposeFormula(formula: string): FormulaSegment[] {
  if (!formula || formula === '0') return []

  const segments: FormulaSegment[] = []

  let working = formula.trim()

  const basePart = extractBasePart(working)
  if (basePart) {
    const vars = extractVariables(basePart)
    segments.push({
      label: getBaseLabel(basePart),
      expression: basePart,
      colorKey: 'base',
      color: '#8c8c8c',
      variables: vars.map((v) => resolveVariable(v)),
    })
    working = working.slice(basePart.length).trim()
  }

  const factors = splitFactors(working)
  for (const factor of factors) {
    const label = matchSegmentLabel(factor)
    const vars = extractVariables(factor)
    segments.push({
      label: label.label,
      expression: factor,
      colorKey: label.colorKey,
      color: label.color,
      variables: vars.map((v) => resolveVariable(v)),
    })
  }

  return segments
}

/** 从公式开头提取基础伤害段 */
function extractBasePart(formula: string): string {
  const trimed = formula.trim()

  if (trimed.startsWith('(')) {
    let depth = 0
    let end = 0
    for (let i = 0; i < trimed.length; i++) {
      if (trimed[i] === '(') depth++
      if (trimed[i] === ')') depth--
      if (depth === 0) {
        end = i + 1
        break
      }
    }
    if (end > 0) {
      let after = trimed.slice(end).trim()
      while (after.startsWith('*')) {
        const nextClose = after.indexOf(')')
        const nextPlus = after.indexOf('+')
        const nextMinus = after.indexOf('-')
        if (nextClose === -1) break
        if (
          (nextPlus !== -1 && nextPlus < nextClose) ||
          (nextMinus !== -1 && nextMinus < nextClose)
        ) {
          end += after.indexOf('*')
          const extended = extractBasePartFrom(trimed.slice(end + 1).trim())
          if (extended) {
            return trimed.slice(0, end + 1 + extended.length).trim()
          }
        }
        break
      }
      return trimed.slice(0, end).trim()
    }
  }

  const firstMul = findTopLevelMul(trimed)
  if (firstMul === -1) return trimed
  return trimed.slice(0, firstMul).trim()
}

function extractBasePartFrom(s: string): string {
  const firstMul = findTopLevelMul(s)
  if (firstMul === -1) return s
  const left = s.slice(0, firstMul).trim()
  if (left && left[0] !== '(') return left
  return ''
}

/** 寻找顶层乘号位置 */
function findTopLevelMul(expr: string): number {
  let depth = 0
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') depth++
    if (expr[i] === ')') depth--
    if (expr[i] === '*' && depth === 0) return i
  }
  return -1
}

/** 将公式拆分乘法因子 */
function splitFactors(expr: string): string[] {
  const factors: string[] = []
  const trimmed = expr.trim()

  let current = ''
  let depth = 0
  let i = 0

  while (i < trimmed.length) {
    if (trimmed[i] === '(') depth++
    if (trimmed[i] === ')') depth--
    if (trimmed[i] === '*' && depth === 0) {
      current = current.trim()
      if (current) factors.push(current)
      current = ''
      i++
      continue
    }
    current += trimmed[i]
    i++
  }

  current = current.trim()
  if (current) factors.push(current)

  return factors
}

/** 根据段内容匹配标签 */
function matchSegmentLabel(expr: string): { label: string; colorKey: string; color: string } {
  for (const seg of SEGMENT_LABELS) {
    if (seg.pattern.test(expr)) {
      return { label: seg.label, colorKey: seg.colorKey, color: seg.color }
    }
  }
  return { label: '其他增益段', colorKey: 'other', color: '#d9d9d9' }
}

/** 获取基础段的匹配标签 */
function getBaseLabel(expr: string): string {
  for (const seg of SEGMENT_LABELS) {
    if (seg.pattern.test(expr)) {
      return '基础伤害段'
    }
  }
  return '基础伤害段'
}

/** 公式分段并解析所有变量（包含名称映射） */
export function parseFormula(
  formula: string,
  nameMap: Record<string, string> = {},
  descMap: Record<string, string> = {},
): FormulaSegment[] {
  const segments = decomposeFormula(formula)
  return segments.map((seg) => ({
    ...seg,
    variables: seg.variables.map((v) => ({
      ...v,
      displayName: nameMap[v.name] || v.displayName,
      description: descMap[v.name] || v.description,
    })),
  }))
}

/**
 * 分析公式/会心/帧数中每个 recipe/buff 变量的具体贡献
 */
export function analyzeContributions(
  formula: string,
  criticalFormula: string,
  framesFormula: string,
  variables: string[],
): Record<
  string,
  | {
      segmentLabel: string
      segmentColorKey: string
      effectType: 'mul' | 'add' | 'add_crit'
      coeff: number
      divisor: number
      effectDesc: string
    }
  | undefined
> {
  const result: Record<string, any> = {}
  const fullText = `${formula} ${criticalFormula} ${framesFormula}`
  const segments = decomposeFormula(formula)
  const critSegments =
    criticalFormula && criticalFormula !== '0' ? decomposeFormula(criticalFormula) : []

  function findSegment(name: string) {
    for (const s of segments) {
      if (s.variables.some((v) => v.name === name)) return s
    }
    for (const s of critSegments) {
      if (s.variables.some((v) => v.name === name))
        return { ...s, label: s.label || '会心公式', colorKey: 'critical' }
    }
    if (framesFormula?.includes(name)) return { label: '攻击系数段', colorKey: 'attack' }
    return null
  }

  for (const varName of variables) {
    const seg = findSegment(varName)
    if (!seg) continue

    const base: any = { segmentLabel: seg.label, segmentColorKey: seg.colorKey }

    // Pattern 1: K * var / 1024 → additive N%
    const esc = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m1 = fullText.match(
      new RegExp('(\\d+(?:\\.\\d+)?)\\s*\\*\\s*' + esc + '\\s*\\)?\\s*/\\s*(\\d+)'),
    )
    if (m1) {
      const coeff = parseFloat(m1[1])
      const divisor = parseInt(m1[2], 10)
      result[varName] = {
        ...base,
        effectType: 'add' as const,
        coeff,
        divisor,
        effectDesc: `+${((coeff / divisor) * 100).toFixed(1)}%`,
      }
      continue
    }

    // Pattern 2: (1 + K * var) → multiplicative
    const m2 = fullText.match(
      new RegExp('\\(1\\s*\\+\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\*\\s*' + esc + '\\)'),
    )
    if (m2) {
      const coeff = parseFloat(m2[1])
      result[varName] = {
        ...base,
        effectType: 'mul' as const,
        coeff,
        divisor: 1,
        effectDesc: `×${(1 + coeff).toFixed(2)}`,
      }
      continue
    }

    // Pattern 3: K * var / 10000 → crit rate
    const m3 = fullText.match(
      new RegExp('(\\d+(?:\\.\\d+)?)\\s*\\*\\s*' + esc + '\\s*\\)?\\s*/\\s*10000'),
    )
    if (m3) {
      const coeff = parseFloat(m3[1])
      result[varName] = {
        ...base,
        effectType: 'add_crit' as const,
        coeff,
        divisor: 10000,
        effectDesc: `会心 +${(coeff / 100).toFixed(1)}%`,
      }
      continue
    }

    // Pattern 4: K * var → implicit /1024 or /10000
    const m4 = fullText.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*\\*\\s*' + esc + '(?!\\s*/)'))
    if (m4) {
      const coeff = parseFloat(m4[1])
      result[varName] = {
        ...base,
        effectType: 'add' as const,
        coeff,
        divisor: 1024,
        effectDesc: `+${((coeff / 1024) * 100).toFixed(1)}%`,
      }
      continue
    }

    result[varName] = {
      ...base,
      effectType: 'add' as const,
      coeff: 0,
      divisor: 1,
      effectDesc: '影响公式',
    }
  }

  return result
}
