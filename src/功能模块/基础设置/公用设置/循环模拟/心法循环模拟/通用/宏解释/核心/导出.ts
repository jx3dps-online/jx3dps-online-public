import type { 宏条件, 宏配置, 心法说明 } from '../类型'
import { 创建名称导出 } from './名称'

const 导出条件 = (条件: 宏条件, 说明: 心法说明, 名称: ReturnType<typeof 创建名称导出>): string => {
  const 待输出: (宏条件 | string)[] = [条件]
  const 片段: string[] = []
  while (待输出.length) {
    const 当前 = 待输出.pop()!
    if (typeof 当前 === 'string') 片段.push(当前)
    else if ('左' in 当前) {
      待输出.push(当前.右, 当前.类型 === '且' ? '&' : '|', 当前.左)
    } else 片段.push(导出原子(当前, 说明, 名称))
  }
  return 片段.join('')
}

const 导出原子 = (
  条件: Exclude<宏条件, { 类型: '且' | '或' }>,
  说明: 心法说明,
  名称: ReturnType<typeof 创建名称导出>,
): string => {
  switch (条件.类型) {
    case '数值':
      return 条件.字段 + 条件.比较 + 条件.值
    case '充盈':
      return 条件.字段
    case '上个技能':
      return 'last_skill' + (条件.取反 ? '~=' : '=') + 名称.技能(条件.名称)
    case '奇穴':
      return (
        (条件.取反 ? 'noskill:' : 'skill:') +
        (Object.keys(说明.映射.奇穴).find((ID) => 说明.映射.奇穴[ID] === 条件.名称) ||
          Object.keys(说明.映射.技能).find((ID) => 说明.映射.技能[ID] === 条件.名称) ||
          条件.名称)
      )
    case '技能':
      return 条件.字段 === '充能'
        ? 'skill_energy:' + 名称.技能(条件.名称) + 条件.比较 + 条件.值
        : 'skill_notin_cd:' + 名称.技能(条件.名称)
    case '增益': {
      const 前缀 =
        (条件.对象 === '目标' ? 't' : '') + (条件.取反 ? 'nobuff' : 条件.时间 ? 'bufftime' : 'buff')
      return (
        前缀 +
        ':' +
        名称[条件.对象 === '目标' ? '目标增益' : '自身增益'](条件.名称) +
        (条件.取反 || (!条件.时间 && 条件.比较 === '>' && 条件.值 === 0) ? '' : 条件.比较 + 条件.值)
      )
    }
  }
}

export const 导出宏 = (配置: 宏配置, 说明: 心法说明): string => {
  const 名称 = 创建名称导出(说明)
  return 配置.页
    .map((页, 索引) => {
      const 行: string[] = []
      if (页.体态 !== undefined) {
        const 名称 = Object.keys(说明.体态别名).find((名称) => 说明.体态别名[名称] === 页.体态)!
        行.push('#page ' + 名称)
      } else if (索引 > 0 || !页.语句.length) 行.push('#page')
      for (const 语句 of 页.语句)
        行.push(
          '/' +
            语句.命令 +
            ' ' +
            (语句.条件 ? '[' + 导出条件(语句.条件, 说明, 名称) + '] ' : '') +
            (语句.命令 === 'mcast' ? JSON.stringify(语句.宏) : 名称.技能(语句.技能)),
        )
      return 行.join('\n')
    })
    .join('\n\n')
}
