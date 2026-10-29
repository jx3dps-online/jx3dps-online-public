import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 风萦紫武 from './风萦紫武.json'
import 风萦橙武 from './风萦橙武.json'

const 计算循环: 循环数据[] = [风萦紫武, 风萦橙武] as 循环数据[]

export default 计算循环
