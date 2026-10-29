import type { 心法说明 } from '../类型'

export const 创建名称导出 = (说明: 心法说明) => {
  const 反向名称 = (映射: Record<string, string>) => {
    const 名称表 = new Map<string, string>()
    for (const [输入, 名称] of Object.entries(映射)) {
      if (!/^\d+$/.test(输入) && !名称表.has(名称)) 名称表.set(名称, 输入)
    }
    return (名称: string) => 名称表.get(名称) ?? 名称
  }
  const 技能名称 = 反向名称(说明.映射.技能)
  return {
    技能: (名称: string) => {
      const 别名 = 技能名称(名称)
      const 显示 = 别名 !== 名称 ? 别名 : (说明.技能显示名称?.[名称] ?? 名称)
      // 共享原始名称的多个动作不能靠导出时改名合并。
      return (说明.映射.技能[显示] ?? 显示) === 名称 ? 显示 : 名称
    },
    自身增益: 反向名称(说明.映射.自身增益),
    目标增益: 反向名称(说明.映射.目标增益),
  }
}
