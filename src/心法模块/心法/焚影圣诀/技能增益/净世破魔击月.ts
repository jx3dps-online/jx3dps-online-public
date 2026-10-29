import { 技能增益列表类型 } from '@/@types/技能'
import { 通用月增益 } from './通用增益/通用增益'
import { 明光月增益 } from './通用增益/明光'
import { 光明相会心增益 } from './光明相'
import 净世破魔击增益 from './净世破魔击'

const 净世破魔击月增益: 技能增益列表类型[] = [
  ...通用月增益,
  ...净世破魔击增益,
  光明相会心增益,
  明光月增益,
]

export default 净世破魔击月增益
