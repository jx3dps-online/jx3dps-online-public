import type { 心法耦合表 } from './类型'

export const 读取特殊资源 = (角色: Record<string, unknown>, 表: 心法耦合表) =>
  Object.fromEntries(
    Object.entries(表.资源读取规则 || {}).map(([名称, 配置]) => {
      const 值 = 配置.路径
        .split('.')
        .reduce<unknown>((对象, 字段) => (对象 as Record<string, unknown>)?.[字段], 角色)
      if (配置.类型 === '布尔') {
        if (typeof 值 !== 'boolean') throw new Error('原模拟器缺少充盈状态：' + 配置.路径)
        return [名称, Number(值)]
      }
      if (配置.类型 === '阈值') {
        if (typeof 值 !== 'number' || !Number.isFinite(值))
          throw new Error('原模拟器缺少充盈资源：' + 配置.路径)
        return [名称, Number(值 >= 配置.最低值!)]
      }
      if (配置.类型 === '位掩码' || 配置.类型 === '真值计数') {
        if (!值 || typeof 值 !== 'object' || Array.isArray(值))
          throw new Error('原模拟器缺少状态对象：' + 配置.路径)
        const 对象 = 值 as Record<string, unknown>
        const 数值 =
          配置.类型 === '真值计数'
            ? Object.values(对象).filter((项) => 项 === true).length
            : Object.entries(配置.位权!).reduce(
                (和, [键, 权]) => 和 + (对象[键] === true ? 权 : 0),
                0,
              )
        return [名称, 数值]
      }
      if (!Array.isArray(值)) throw new Error('原模拟器缺少资源队列：' + 配置.路径)
      const 数值 = 值.reduce(
        (和, 项, 索引) =>
          和 +
          (配置.取值!.includes(项[配置.字段!]) ? (配置.类型 === '数组计数' ? 1 : 2 ** 索引) : 0),
        0,
      )
      return [名称, 数值]
    }),
  )
