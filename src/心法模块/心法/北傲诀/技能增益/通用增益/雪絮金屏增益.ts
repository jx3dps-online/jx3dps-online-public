import { 属性类型 } from '@/@types/属性'
import { 技能增益列表类型 } from '@/@types/技能'
import { 按数字生成数组 } from '@/工具函数/help'

const 蓄势函数 = () => {
  const 数组 = 按数字生成数组(5)
  return 数组.map((层数) => {
    return {
      BuffId: 30738,
      Buff层数: 层数,
      增益名称: `蓄势·${层数}`,
      增益所在位置: '技能',
      增益类型: '部分启用',
      增益集合: [{ 属性: 属性类型.通用增伤, 值: (82 * 层数) / 1024 }],
    } as 技能增益列表类型
  })
}

const 雪絮金屏增益: 技能增益列表类型[] = [...蓄势函数()]

export default 雪絮金屏增益
