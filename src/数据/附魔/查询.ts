import { 附魔列表 } from './index'
import { 附魔数据类型 } from '@/@types/附魔'
import { 属性类型 } from '@/@types/属性'

const ID索引 = new Map(附魔列表.map((item) => [item.id, item]))
const 主属性列表 = [属性类型.力道, 属性类型.身法, 属性类型.元气, 属性类型.根骨]
const 心法缓存 = new Map<string, 附魔数据类型[]>()

export const 根据附魔ID获取附魔数据 = (id: unknown, 部位?: string) => {
  if (typeof id !== 'number' || !Number.isSafeInteger(id)) return undefined
  const item = ID索引.get(id)
  return item && (!部位 || item.附魔支持部位.some((part) => part === 部位)) ? item : undefined
}

export const 获取附魔显示名称 = (id: unknown) => 根据附魔ID获取附魔数据(id)?.附魔效果简写 || ''

export const 获取附魔数据 = (功法?: string, 主属性?: string): 附魔数据类型[] => {
  const key = `${功法}|${主属性}`
  if (!心法缓存.has(key)) {
    心法缓存.set(
      key,
      附魔列表.filter((item) =>
        item.增益集合.every(({ 属性 }) => {
          if (主属性列表.includes(属性)) return 属性 === 属性类型[主属性 || '']
          if (属性 === 属性类型.武器伤害) return 主属性 === '力道' || 主属性 === '身法'
          if (
            [
              属性类型.外功基础攻击,
              属性类型.外功会心等级,
              属性类型.外功会心效果等级,
              属性类型.外功破防等级,
            ].includes(属性)
          )
            return 功法 === '外功'
          if (
            [
              属性类型.内功基础攻击,
              属性类型.内功会心等级,
              属性类型.内功会心效果等级,
              属性类型.内功破防等级,
            ].includes(属性)
          )
            return 功法 !== '外功'
          return true
        }),
      ),
    )
  }
  return 心法缓存.get(key)!
}

export const 解析外部附魔ID = (value: unknown, 部位?: string): number | undefined => {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value)))
    return undefined
  return 根据附魔ID获取附魔数据(Number(value), 部位)?.id
}

// 无ID的外部协议必须匹配真实效果与部位；不采用同名首项。
export const 根据外部附魔属性获取ID = (
  属性: string,
  值: number,
  部位: string,
  功法?: string,
  主属性?: string,
) => {
  const 属性映射: Record<string, string> = {
    atAllTypeAttackPowerBase: 属性类型.全基础攻击,
    atAllTypeOvercomeBase: 属性类型.全破防等级,
    atMagicOvercomeBase: 属性类型.内功破防等级,
  }
  const 实际属性 = 属性映射[属性] || 属性
  const candidates = 获取附魔数据(功法, 主属性).filter(
    (item) =>
      item.附魔支持部位.some((part) => part === 部位) &&
      item.增益集合.length === 1 &&
      item.增益集合[0].属性 === 实际属性 &&
      item.增益集合[0].值 === 值,
  )
  return candidates.length === 1 ? candidates[0].id : undefined
}

export const 获取最高武伤附魔 = () =>
  附魔列表
    .filter((item) => item.增益集合.some((gain) => gain.属性 === 属性类型.武器伤害))
    .sort((a, b) => b.增益集合[0].值 - a.增益集合[0].值)[0]
