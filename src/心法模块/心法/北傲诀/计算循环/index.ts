import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 紫武_四面 from './紫武_四面.json'
import 紫武_无四面 from './紫武_无四面.json'
import 冷川 from './冷川.json'
import 分疆 from './分疆.json'
import 烽河 from './烽河.json'

const 计算循环: 循环数据[] = [紫武_四面, 紫武_无四面, 冷川, 分疆, 烽河] as 循环数据[]

export default 计算循环
