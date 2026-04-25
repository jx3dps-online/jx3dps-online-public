import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
// import 紫武251001 from './紫武251001.json'
import 紫武常规 from './紫武常规.json'
// import 导入测试 from './导入测试.json'
// import 橙武常规 from './橙武常规.json'
// import 紫武 from './紫武.json'
// import 腾空 from './腾空.json'
import 橙武常规 from './橙武常规.json'

const 计算循环: 循环数据[] = [紫武常规, 橙武常规] as 循环数据[]

export default 计算循环
