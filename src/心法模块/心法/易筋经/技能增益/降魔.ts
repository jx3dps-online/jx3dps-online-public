import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import { 属性类型 } from '@/@types/属性'

const 降魔增益: 技能增益列表类型[] = [
  ...通用增益,
  ...Array.from(
    { length: 6 },
    (_, 索引): 技能增益列表类型 => ({
      BuffId: 24453,
      增益名称: `贪破·${索引 + 1}`,
      增益所在位置: '技能',
      增益类型: '部分启用',
      增益集合: [
        {
          属性: 属性类型.易伤增伤,
          值: Math.ceil((Math.max(1 - (索引 + 1) * 0.05, 0.7) - 1) * 1024) / 1024,
          // scripts\skill\少林\少林_韦陀献杵增加伤害.luad
        },
      ],
    }),
  ),
]

export default 降魔增益
