import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

import 紫武基础绝期 from './紫武基础绝期.json'
import 紫武见霜 from './紫武见霜.json'
import 紫武进阶绝期 from './紫武进阶绝期.json'
import 橙武基础斩破 from './橙武基础斩破5min.json'
import 橙武短轴斩蛇 from './橙武进阶斩蛇短轴5min.json'

const 计算循环: 循环数据[] = [
  紫武见霜,
  紫武基础绝期,
  紫武进阶绝期,
  橙武基础斩破,
  橙武短轴斩蛇,
] as 循环数据[]

export default 计算循环
