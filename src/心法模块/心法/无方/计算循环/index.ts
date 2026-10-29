import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 武学助手 from './武学助手.json'
import 两段宏 from './两段宏.json'
import 紫武手动 from './紫武手动.json'
import 橙武手动 from './CW手动.json'
// import 后沾橙武 from './后沾橙武.json'
// import 疾根紫武 from './疾根紫武.json'
// import 疾根橙武 from './疾根橙武.json'
const 计算循环: 循环数据[] = [
  武学助手,
  两段宏,
  紫武手动,
  橙武手动,
  // 疾根紫武,
  // 七商橙武,
  // 后沾橙武,
  // 疾根橙武,
] as 循环数据[]

export default 计算循环
