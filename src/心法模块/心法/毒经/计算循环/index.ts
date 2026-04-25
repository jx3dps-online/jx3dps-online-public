import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 紫武连令 from './紫武连令.json'
import 橙武连令 from './橙武连令.json'
import 橙武降厄 from './橙武降厄.json'

const 计算循环: 循环数据[] = [紫武连令, 橙武连令, 橙武降厄] as 循环数据[]

export default 计算循环
