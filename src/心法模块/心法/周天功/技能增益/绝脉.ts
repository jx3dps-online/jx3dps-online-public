import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import { 按数字生成数组 } from '@/工具函数/help'
import { 属性类型 } from '@/@types/属性'

// 33154
const 绝脉督脉函数 = () => {
  const 数组 = 按数字生成数组(99)
  return 数组.map((item) => {
    return {
      BuffId: 33154,
      Buff等级: 1,
      增益名称: `绝脉督脉·${item}`,
      增益所在位置: '奇穴',
      增益类型: '部分启用',
      增益集合: [{ 属性: 属性类型.易伤增伤, 值: (item * 41) / 1024 }],
    } as 技能增益列表类型
  })
}

const 绝脉增益: 技能增益列表类型[] = [...通用增益, ...绝脉督脉函数()]

export default 绝脉增益
