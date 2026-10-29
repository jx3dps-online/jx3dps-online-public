import { 比较符, 宏条件, 宏状态, 释放规则 } from '../类型'

export const 获取条件增益 = (条件: Extract<宏条件, { 类型: '增益' }>, 状态: 宏状态) => {
  const 列表 = 条件.对象 === '自身' ? 状态.自身增益 : 状态.目标增益
  return (条件.同ID名称 || [条件.名称]).map((名) => 列表[名]).filter((增益) => 增益?.层数 > 0)
}

export const 比较数值 = (左: number, 运算: 比较符, 右: number, 容差 = 0): boolean => {
  switch (运算) {
    case '=':
      return 容差 ? Math.abs(左 - 右) < 容差 : 左 === 右
    case '~=':
      return 容差 ? Math.abs(左 - 右) >= 容差 : 左 !== 右
    case '>':
      return 左 > 右
    case '<':
      return 左 < 右
    case '>=':
      return 左 >= 右 - 容差
    case '<=':
      return 左 <= 右 + 容差
  }
}

export const 判定条件 = (条件: 宏条件, 状态: 宏状态): boolean => {
  if (!('左' in 条件)) return 判定原子(条件, 状态)
  // 显式保存未求值的右分支：保持任意树的左先短路，而不受宏链深度影响。
  const 待定: Extract<宏条件, { 类型: '且' | '或' }>[] = []
  let 当前: 宏条件 = 条件
  求值: while (true) {
    while ('左' in 当前) {
      待定.push(当前)
      当前 = 当前.左
    }
    const 值 = 判定原子(当前, 状态)
    while (待定.length) {
      const 父 = 待定.pop()!
      if ((父.类型 === '且' && 值) || (父.类型 === '或' && !值)) {
        当前 = 父.右
        continue 求值
      }
    }
    return 值
  }
}

const 判定原子 = (条件: Exclude<宏条件, { 类型: '且' | '或' }>, 状态: 宏状态): boolean => {
  switch (条件.类型) {
    case '上个技能':
      return (状态.上个技能 === 条件.名称) !== 条件.取反
    case '奇穴':
      return (状态.奇穴.includes(条件.名称) || !!状态.已有技能?.includes(条件.名称)) !== 条件.取反
    case '充盈':
      return !!状态.数值[条件.字段]
    case '数值':
      return 比较数值(
        状态.数值[条件.字段],
        条件.比较,
        typeof 条件.值 === 'string' ? 状态.数值[条件.值] : 条件.值,
        状态.数值容差[条件.字段] || 0,
      )
    case '技能':
      if (条件.字段 === '充能' && 条件.充能技能 === false) {
        if (条件.比较 === '=' && 条件.值 === 1) return true
        if (条件.比较 === '<' || 条件.比较 === '>') return false
      }
      return 比较数值(
        状态.技能[条件.名称][条件.字段],
        条件.比较,
        条件.值 === 'max' ? 状态.技能[条件.名称].最大充能 || 1 : 条件.值,
      )
    case '增益': {
      const 列表 = 条件.对象 === '自身' ? 状态.自身增益 : 状态.目标增益
      const 名称 = 条件.同ID名称
      for (let i = 0; i < (名称?.length ?? 1); i++) {
        const 项 = 列表[名称 ? 名称[i] : 条件.名称]
        if (!(项?.层数 > 0)) continue
        if (条件.取反) return false
        if (
          比较数值(
            条件.时间 ? 项.剩余帧 / 状态.每秒帧 : 项.层数,
            条件.比较,
            条件.值,
            条件.时间 ? 0.001 : 0,
          )
        )
          return true
      }
      return 条件.取反
    }
  }
}

export const 获取不可释放原因 = (
  技能: string,
  状态: 宏状态,
  规则: 释放规则[],
  奇穴: string[],
): string | undefined => {
  const 运行状态 = 状态.技能[技能]
  if (!运行状态.体态允许) return '体态不符'
  if (运行状态.阻塞帧 > 0) return 'GCD、调息或延迟未结束'
  if (运行状态.充能 <= 0) return '充能不足'
  for (const 条件 of 规则) {
    if (条件.类型 === '资源' && 状态.数值[条件.名称] < 条件.最低值) return 条件.名称 + '不足'
    if (条件.类型 === '奇穴' && !奇穴.includes(条件.名称)) return '未选择奇穴：' + 条件.名称
    if (条件.类型 === '增益' && !!状态.自身增益[条件.名称]?.层数 !== 条件.存在) {
      return (条件.存在 ? '缺少增益：' : '增益禁用：') + 条件.名称
    }
  }
  return undefined
}
