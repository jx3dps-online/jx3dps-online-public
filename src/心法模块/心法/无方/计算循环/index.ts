import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 七商橙武 from './七商橙武.json'
import 七商紫武 from './七商紫武.json'
import 后沾紫武 from './后沾紫武.json'
import 后沾橙武 from './后沾橙武.json'
import 疾根紫武 from './疾根紫武.json'
import 疾根橙武 from './疾根橙武.json'
const 计算循环: 循环数据[] = [
  七商紫武,
  后沾紫武,
  疾根紫武,
  七商橙武,
  后沾橙武,
  疾根橙武,
] as 循环数据[]

export default 计算循环
