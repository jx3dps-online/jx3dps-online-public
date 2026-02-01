import { 技能增益列表类型 } from '@/@types/技能'
import 大橙武技能增益 from './大橙武技能增益'
import 小橙武技能增益 from '../../../凌海诀/技能增益/通用增益/小橙武技能增益'

const 傍身招式增益: 技能增益列表类型[] = [...大橙武技能增益, ...小橙武技能增益]

export default 傍身招式增益
