import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import 对阵招式增益 from './通用增益/对阵招式增益'
import { 属性类型 } from '@/@types/属性'

const 奇门飞宫: 技能增益列表类型[] = [...通用增益, ...对阵招式增益]

export default 奇门飞宫
