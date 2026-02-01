import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 一速紫武冷砺 from './1速紫武冷砺.json'
import 一速紫武烽砺 from './1速紫武烽砺.json'
import 二速橙武锋砺 from './2速橙武锋砺.json'
import 三速橙武冷砺 from './3速橙武冷砺.json'
import 三速橙武冷疏 from './3速橙武冷疏.json'
import 四速橙武烽砺 from './4速橙武烽砺.json'

const 计算循环: 循环数据[] = [
  一速紫武冷砺,
  一速紫武烽砺,
  二速橙武锋砺,
  三速橙武冷砺,
  三速橙武冷疏,
  四速橙武烽砺,
] as 循环数据[]

export default 计算循环
