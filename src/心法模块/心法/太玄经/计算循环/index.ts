import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 紫武_亘天_山海 from './紫武_亘天_山海.json'
import 橙武_亘天_山海 from './橙武_亘天_山海.json'
import 紫武_撞灯_山海 from './紫武_撞灯_山海.json'
import 橙武_撞灯_山海 from './橙武_撞灯_山海.json'
// import 紫武_神火 from './紫武_神火.json'
// import 橙武_亘天 from './橙武_亘天.json'
// import 度冥 from './度冥.json'
// import 擎羊_紫武 from './擎羊_紫武.json'
// import 擎羊_橙武 from './擎羊_橙武.json'
// import 橙武 from './橙武.json'
// import 往日荣光天斗旋橙武 from './往日荣光天斗旋橙武.json'
// import 测试循环 from './测试循环.json'
// import 橙武加速测试 from './橙武加速测试.json'

const 计算循环: 循环数据[] = [
  // 测试循环,
  紫武_亘天_山海,
  橙武_亘天_山海,
  紫武_撞灯_山海,
  橙武_撞灯_山海,
  // 紫武_神火,
  // 橙武_亘天,
  // 橙武,
  // 往日荣光天斗旋橙武,
  // 擎羊_橙武,
] as 循环数据[]

export default 计算循环
