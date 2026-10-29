export const 快捷添加数据: 快捷添加数据类型[] = [
  {
    名称: '灭牙',
    技能序列: ['灭', '龙牙'],
    color: 'cyan',
  },
  {
    名称: '吟穿牙',
    技能序列: ['龙吟', '穿云', '龙牙'],
    color: 'green',
  },
  {
    名称: '灭牙灭牙',
    技能序列: ['灭', '龙牙', '灭', '龙牙'],
    color: 'blue',
  },
]

export interface 快捷添加数据类型 {
  名称: string
  技能序列: string[]
  color?: string
}
