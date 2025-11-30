import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 紫武 from './紫武.json'
import 橙武 from './橙武.json'
import 紫武苍狂一段加速 from './紫武苍狂一段加速.json'
import 橙武苍狂二段加速 from './橙武苍狂二段加速.json'
import 橙武贞固二段加速 from './橙武贞固二段加速.json'

const 计算循环: 循环数据[] = [
  紫武,
  橙武,
  紫武苍狂一段加速,
  橙武苍狂二段加速,
  橙武贞固二段加速,
] as 循环数据[]

export default 计算循环
