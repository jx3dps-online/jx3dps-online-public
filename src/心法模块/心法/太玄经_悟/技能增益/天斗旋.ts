import { 属性类型 } from '@/@types/属性'
import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import 傍身招式增益 from './通用增益/傍身招式增益'

const 天斗旋: 技能增益列表类型[] = [...通用增益, ...傍身招式增益]

export default 天斗旋
