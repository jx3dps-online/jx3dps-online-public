import type { 心法说明, 释放规则 } from '../类型'
import type { 奇穴列表数据类型 } from '@/@types/奇穴'
import type { 原模拟器接口, 心法耦合表, 冷却绑定 } from './类型'
import { 通用环境字段 } from './耦合默认值'
import { 通用调息查询, 获取冷却依赖 } from './调息查询'
import { 通用循环模拟技能基础数据 } from '../../通用技能/通用技能定义'

export const 创建心法说明 = (
  模拟: 原模拟器接口,
  表: 心法耦合表,
  奇穴数据: 奇穴列表数据类型[],
): 心法说明 => {
  const 释放规则: Record<string, 释放规则[]> = {}
  for (const 技能 of 模拟.技能基础数据.filter(
    (技能) =>
      (表.沿用技能 ||
        Object.values(表.技能).includes(技能.技能名称) ||
        通用循环模拟技能基础数据.some((通用技能) => 通用技能.技能名称 === 技能.技能名称)) &&
      !!模拟.技能类实例集合[技能.技能名称] &&
      !(表.排除技能 || []).includes(技能.技能名称),
  )) {
    const 名称 = 技能.技能名称
    const 规则: 释放规则[] = []
    for (const 增益 of 技能.释放依赖Buff || []) 规则.push({ 类型: '增益', 名称: 增益, 存在: true })
    for (const 增益 of 技能.Buff存在不可释放 || [])
      规则.push({ 类型: '增益', 名称: 增益, 存在: false })
    const 构造器 = 模拟.技能类实例集合[名称].constructor
    for (const [资源, 字段列表] of Object.entries(表.资源下限字段)) {
      const 下限 = 字段列表.map((字段) => 构造器[字段]).find((值) => 值 !== undefined)
      if (下限) 规则.push({ 类型: '资源', 名称: 资源, 最低值: 下限 })
    }
    if (技能.显示类型 === '奇穴技能') 规则.push({ 类型: '奇穴', 名称: 技能.依赖奇穴名 || 名称 })
    释放规则[名称] = 规则.concat(表.补充规则[名称] || [])
  }
  const 自身增益 = Object.values(模拟.Buff和Dot数据)
    .filter((增益) => 增益.类型 === '自身')
    .map((增益) => 增益.名称)
  const 目标增益 = Object.values(模拟.Buff和Dot数据)
    .filter((增益) => 增益.类型 === '目标')
    .map((增益) => 增益.名称)
  const DOT名称 = 表.DOT.map((名称) => 模拟.Buff和Dot数据[名称]?.名称 || 名称)
  目标增益.push(...DOT名称.filter((名称) => !目标增益.includes(名称)))
  const DOT候选: Record<string, string[]> = {}
  for (const 名称 of DOT名称) {
    const 别名 = 名称.replace(/^DOT_/, '').replace(/(?:\(DOT\)|DOT)$/, '')
    if (别名 !== 名称 && !目标增益.includes(别名)) (DOT候选[别名] ||= []).push(名称)
  }
  const DOT别名 = Object.fromEntries(
    Object.entries(DOT候选)
      .filter(([, 候选]) => new Set(候选).size === 1)
      .map(([别名, 候选]) => [别名, 候选[0]]),
  )
  const 目标增益映射 = { ...表.目标增益 }
  for (const [名称, 原名] of Object.entries(DOT别名)) 目标增益映射[名称] ??= 原名
  自身增益.push(...Object.keys(表.增益体态))
  自身增益.push(...Object.keys(表.增益层数来源 || {}))
  自身增益.push(...Object.keys(表.增益资源来源 || {}))
  const 环境字段 = { ...通用环境字段, ...表.环境字段 }
  for (const 字段 of Object.keys(表.资源)) delete 环境字段[字段]
  const 小数字段 = ['life', 'mana', ...(表.小数字段 || [])]
  const 原名对应: Record<string, string[]> = {}
  for (const 技能 of 模拟.技能基础数据.filter((项) => !!释放规则[项.技能名称])) {
    if (技能.技能原始名称 && 技能.技能原始名称 !== 技能.技能名称)
      (原名对应[技能.技能原始名称] ||= []).push(技能.技能名称)
  }
  const 技能别名 = Object.fromEntries(
    Object.entries(原名对应)
      .filter(([名称, 候选]) => 候选.length === 1 && !释放规则[名称])
      .map(([名称, 候选]) => [名称, 候选[0]]),
  )
  const 调息查询: Record<string, 冷却绑定> = {
    骑御: { GCD组: [...(表.公共GCD组 || ['公共']), '后跳'] },
    ...表.调息查询,
  }
  const 调息依赖 = Object.fromEntries(
    [...new Set([...Object.keys(释放规则), ...Object.keys(调息查询)])].map((名称) => {
      const 依赖 = 获取冷却依赖(模拟, 表, 名称, 调息查询[名称])
      return [
        名称,
        [
          ...依赖.GCD组.map((项) => 'gcd:' + 项),
          ...依赖.技能.map((项) => 'charge:' + 项),
          ...(依赖.时间字段 ? ['clock:' + 依赖.时间字段.名称] : []),
        ],
      ]
    }),
  )
  return {
    名称: 表.名称,
    图标库: [
      ...模拟.技能基础数据.map((项) => ({
        名称: 项.技能原始名称 || 项.技能名称,
        图标: 项.图标 || '',
      })),
      ...Object.values(模拟.Buff和Dot数据).map((项) => ({ 名称: 项.名称, 图标: 项.图标 || '' })),
      ...奇穴数据.flatMap((层) =>
        层.奇穴列表.map((项) => ({ 名称: 项.奇穴名称, 图标: 项.奇穴图片 })),
      ),
    ].filter((项) => !!项.图标),
    技能: Object.keys(释放规则),
    充能技能: 模拟.技能基础数据
      .filter(
        (技能) =>
          !!释放规则[技能.技能名称] &&
          ((技能.最大充能层数 || 1) > 1 || !!表.技能充能?.[技能.技能名称]),
      )
      .map((技能) => 技能.技能名称),
    调息查询技能: [...new Set([...Object.keys(通用调息查询), ...Object.keys(表.调息查询 || {})])],
    调息依赖,
    技能显示名称: Object.fromEntries(
      模拟.技能基础数据
        .filter((技能) => !!释放规则[技能.技能名称])
        .map((技能) => [技能.技能名称, 技能.技能原始名称 || 技能.技能名称]),
    ),
    数值字段: [...Object.keys(表.资源), 'life', ...Object.keys(环境字段)],
    小数字段,
    充盈字段: 表.充盈字段,
    未支持条件: 表.未支持条件,
    资源显示: {
      life: '气血比例',
      ...Object.fromEntries(Object.entries(环境字段).map(([名, 值]) => [名, 值.名称])),
      ...表.资源显示,
    },
    自动技能: 表.自动技能,
    自身增益: 自身增益.filter((名称) => !表.禁用增益?.自身?.includes(名称)),
    目标增益: 目标增益.filter((名称) => !表.禁用增益?.目标?.includes(名称)),
    增益ID: 表.增益ID,
    永久增益: 表.永久增益,
    无计时增益: 表.增益资源来源 ? { 自身: Object.keys(表.增益资源来源) } : undefined,
    禁用增益: 表.禁用增益,
    隐藏增益: 表.隐藏增益,
    体态: Object.values(表.体态名称),
    体态名称: 表.体态名称,
    体态别名: { ...表.体态名称, ...表.翻页体态, ...表.体态别名 },
    翻页体态: 表.翻页体态,
    翻页示例: 表.翻页示例,
    释放规则,
    连招: 表.连招,
    映射: {
      技能: {
        ...技能别名,
        ...表.技能,
        ...Object.fromEntries(Object.entries(通用调息查询).map(([名称, ID]) => [ID, 名称])),
      },
      自身增益: 表.自身增益,
      目标增益: 目标增益映射,
      字段: 表.字段,
      奇穴:
        表.奇穴 ||
        Object.fromEntries(
          奇穴数据.flatMap((层) => 层.奇穴列表.map((奇穴) => [奇穴.id, 奇穴.奇穴名称])),
        ),
      禁用体态: 表.禁用体态,
    },
    环境字段,
    示例: 表.示例,
  }
}
