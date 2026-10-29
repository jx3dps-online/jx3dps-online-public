import type { DotDTO } from '../通用框架/类型定义/Buff'

export interface 起手DOT初始化信息 {
  获得时间: number
  当前层数: number
  DOT数据: DotDTO
  快照buff列表: string[]
}

export interface 起手DOT待生效数据 {
  生效时间: number
  当前层数: number
  快照buff列表: string[]
}

interface 起手DOT实例 {
  生成初次待生效数据: (信息: 起手DOT初始化信息) => 起手DOT待生效数据[]
  更新DOT运行数据: (数据: { 待生效数据: 起手DOT待生效数据[] }) => void
  登记DOT事件: (名称: string, 数据: 起手DOT待生效数据[], 获得时间: number) => void
}

export const 初始化起手DOT = (信息: 起手DOT初始化信息, 实例: 起手DOT实例) => {
  const 待生效数据 = 实例.生成初次待生效数据(信息).filter((数据) => 数据.生效时间 >= 0)
  实例.更新DOT运行数据({ 待生效数据 })
  if (待生效数据.length) {
    实例.登记DOT事件(信息.DOT数据.名称, 待生效数据, 0)
  }
}
