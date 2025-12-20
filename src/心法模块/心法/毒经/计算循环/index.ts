import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 武学助手 from './武学助手.json'
import 连令 from './紫武连令.json'
import 降厄 from './紫武降厄.json'
import 悸心 from './紫武悸心.json'
import 橙武连令 from './橙武连令.json'
import 橙武悸心 from './橙武悸心.json'
import 橙武降厄乱轴 from './橙武降厄乱轴.json'

const 计算循环: 循环数据[] = [
  武学助手,
  连令,
  悸心,
  降厄,
  橙武连令,
  橙武悸心,
  橙武降厄乱轴,
] as 循环数据[]

export default 计算循环
