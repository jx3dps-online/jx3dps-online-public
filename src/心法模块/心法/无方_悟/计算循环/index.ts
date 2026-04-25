import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */
//import 紫武_自用 from './紫武_自用.json'
//import 橙武_自用 from './橙武_自用.json'
import 橙武_川沾并青 from './橙武_川沾并青.json'
import 紫武_川沾并青 from './紫武_川沾并青.json'

const 计算循环: 循环数据[] = [
  //紫武_自用,
  // 橙武_自用,
  紫武_川沾并青,
  橙武_川沾并青,
] as 循环数据[]

export default 计算循环
