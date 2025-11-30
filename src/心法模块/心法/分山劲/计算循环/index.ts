import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 绝云 from './绝云.json'
import 极天绝云 from './极天绝云.json'

const 计算循环: 循环数据[] = [
  绝云, 极天绝云,
] as 循环数据[]

export default 计算循环

