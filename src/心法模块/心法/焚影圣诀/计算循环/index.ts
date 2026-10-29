import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
// import 默认 from './默认.json'
import 固定轴基础循环 from './固定轴-基础循环.json'
import 固定轴基础循环诛邪 from './固定轴-基础循环-诛邪.json'
import 变轴进阶循环 from './变轴-进阶循环.json'
import 变轴进阶循环诛邪 from './变轴-进阶循环-诛邪.json'
import 变轴橙武循环 from './变轴-橙武循环.json'
import 变轴橙武循环诛邪 from './变轴-橙武循环-诛邪.json'

const 计算循环: 循环数据[] = [
  固定轴基础循环,
  固定轴基础循环诛邪,
  变轴进阶循环,
  变轴进阶循环诛邪,
  变轴橙武循环,
  变轴橙武循环诛邪,
] as 循环数据[]

export default 计算循环
