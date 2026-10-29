import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import { 属性类型 } from '@/@types/属性'
import { 按数字生成数组 } from '@/工具函数/help'
import 涣风增益 from './涣风'

// 33154
const 蛰微督脉函数 = () => {
  const 数组 = 按数字生成数组(200)
  return 数组.map((item) => {
    return {
      BuffId: 33154,
      Buff等级: 1,
      增益名称: `蛰微督脉·${item}`,
      增益所在位置: '奇穴',
      依赖奇穴: '蛰微',
      增益类型: '部分启用',
      增益集合: [{ 属性: 属性类型.职业最终增伤, 值: (item * 41) / 1024 }],
    } as 技能增益列表类型
  })
}

const 蛰微增益: 技能增益列表类型[] = [...通用增益, ...涣风增益, ...蛰微督脉函数()]

export default 蛰微增益
