import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 紫武雨龙潜龙_一段加速 from './紫武雨龙潜龙_一段加速.json'
import 紫武雨龙苍龙_一段加速 from './紫武雨龙苍龙_一段加速.json'
import 橙武雨龙贞固 from './橙武雨龙贞固.json'
import 橙武驯致贞固 from './橙武驯致贞固.json'
import 橙武雨龙追远苍龙_二段加速 from './橙武雨龙追远苍龙_二段加速.json'

const 计算循环: 循环数据[] = [
  紫武雨龙苍龙_一段加速,
  紫武雨龙潜龙_一段加速,
  橙武雨龙追远苍龙_二段加速,
  橙武雨龙贞固,
  橙武驯致贞固,
] as 循环数据[]

export default 计算循环
