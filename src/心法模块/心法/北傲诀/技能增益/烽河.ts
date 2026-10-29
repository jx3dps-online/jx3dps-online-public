import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import 雪絮金屏增益 from './通用增益/雪絮金屏增益'

const 烽河增益: 技能增益列表类型[] = [...通用增益, ...雪絮金屏增益]

export default 烽河增益
