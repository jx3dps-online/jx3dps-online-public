import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益, { 玉枕无视防御函数 } from './通用增益/通用增益'

const 绝脉增益: 技能增益列表类型[] = [...通用增益, ...玉枕无视防御函数()]

export default 绝脉增益
