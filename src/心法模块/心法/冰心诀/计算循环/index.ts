import type { 循环数据 } from '@/@types/循环'
import 武学助手 from './武学助手.json'
import 紫武盈袖 from './紫武盈袖.json'
import 紫武朝露 from './紫武朝露.json'
import CW盈袖 from './CW盈袖.json'
/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// [山海源流] 循环
// import 橙武31799江破玳生莲 from './橙武31799江破玳生莲.json'
// import 橙武31799江破玳广陵月 from './橙武31799江破玳广陵月.json'

const 计算循环: 循环数据[] = [
  { ...武学助手, 类型: '默认' },
  { ...紫武盈袖, 类型: '默认' },
  { ...紫武朝露, 类型: '默认' },
  { ...CW盈袖, 类型: '默认' },
] as 循环数据[]

export default 计算循环
