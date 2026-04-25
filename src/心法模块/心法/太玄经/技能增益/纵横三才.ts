import { 技能增益列表类型 } from '@/@types/技能'
import { 属性类型 } from '@/@types/属性'
import 通用增益 from './通用增益/通用增益'
import { 按数字生成数组 } from '@/工具函数/help'

// 30434
const 踏斗函数 = () => {
  const 数组 = 按数字生成数组(4)
  return 数组.map((item) => {
    return {
      BuffId: 30434,
      Buff层数: item,
      增益名称: `踏斗·${item}`,
      增益所在位置: '奇穴',
      依赖奇穴: '踏斗',
      增益类型: '部分启用',
      增益集合: [],
    } as 技能增益列表类型
  })
}

const 纵横三才增益: 技能增益列表类型[] = [...通用增益, ...踏斗函数()]

export default 纵横三才增益
