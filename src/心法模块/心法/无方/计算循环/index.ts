import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 武学助手 from './武学助手.json'
import 后沾手动 from './后沾手动.json'
import 后沾橙武 from './后沾橙武.json'
//import 奚毒真解_烬灭 from './奚毒真解_烬灭.json'

const 计算循环: 循环数据[] = [
  武学助手,
  后沾手动,
  后沾橙武,
  //奚毒真解_烬灭,
] as 循环数据[]

export default 计算循环
