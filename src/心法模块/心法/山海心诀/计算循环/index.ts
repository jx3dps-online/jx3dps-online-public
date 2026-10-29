import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// 循环
import 紫武_襄尺_桑柘 from './紫武_襄尺_桑柘.json'
// import 紫武_乌烬_审固 from './紫武_乌烬_审固.json'
import 橙武_襄尺_桑柘 from './橙武_襄尺_桑柘.json'
// import 橙武_乌烬_审固 from './橙武_乌烬_审固.json'

const 计算循环: 循环数据[] = [紫武_襄尺_桑柘, 橙武_襄尺_桑柘] as any

export default 计算循环
