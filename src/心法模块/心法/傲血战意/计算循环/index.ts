import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 默认循环 from './默认循环.json'
import 橙武45合并 from './橙武45合并.json'

const 计算循环: 循环数据[] = [默认循环, 橙武45合并] as 循环数据[]

export default 计算循环
