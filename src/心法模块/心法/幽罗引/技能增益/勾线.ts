import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import 小橙武技能增益 from './通用增益/小橙武技能增益'

export const 勾线增益: 技能增益列表类型[] = [...通用增益, ...小橙武技能增益]
