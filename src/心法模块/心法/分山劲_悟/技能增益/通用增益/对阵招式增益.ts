import { 技能增益列表类型 } from '@/@types/技能'
import 门派套装增益 from './门派套装增益'
import 大橙武技能增益 from './大橙武技能增益'

const 对阵招式增益: 技能增益列表类型[] = [...门派套装增益, ...大橙武技能增益]

export default 对阵招式增益
