import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 勾进生出_紫武 from './勾进生出_紫武.json'
import 秒进出_紫武 from './秒进出_紫武.json'
import 秒进出_橙武 from './秒进出_橙武.json'

const 计算循环: 循环数据[] = [勾进生出_紫武, 秒进出_紫武, 秒进出_橙武] as 循环数据[]

export default 计算循环
