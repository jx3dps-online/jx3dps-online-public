import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 橙武 from './橙武.json'
import 紫武 from './紫武.json'

const 计算循环: 循环数据[] = [紫武, 橙武] as 循环数据[]

export default 计算循环
