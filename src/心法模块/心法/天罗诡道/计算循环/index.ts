import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 该数据可以通过JCL分析器进行获取，也可以自己根据实际情况编写
 */

// [太极宫版本] 循环
// import 测试循环 from './测试循环.json'
// import 紫武_千机云奔 from './太极宫版本归档/紫武_千机云奔.json'
// import 紫武_千秋化血 from './太极宫版本归档/紫武_千秋化血.json'
// import 紫武_千秋化血_等鬼斧 from './太极宫版本归档/紫武_千秋化血_等鬼斧.json'
// import 紫武_千秋毒刹 from './太极宫版本归档/紫武_千秋毒刹.json'
// import 紫武_千秋毒刹_一键宏 from './太极宫版本归档/紫武_千秋毒刹_一键宏.json'
// import 橙武_千机云奔 from './太极宫版本归档/橙武_千机云奔.json'
// import 橙武_千秋化血 from './太极宫版本归档/橙武_千秋化血.json'
// import 橙武_千秋化血_等鬼斧 from './太极宫版本归档/橙武_千秋化血_等鬼斧.json'
// import 橙武加速测试 from './橙武加速测试.json'

// [山海源流] 循环
// import 橙武_鸩羽星离_二段 from './山海源流版本归档/橙武_鸩羽星离_二段.json'
// import 紫武_鸩羽星离_二段 from './山海源流版本归档/紫武_鸩羽星离_二段.json'
// import 紫武_鸩羽星离_一段 from './山海源流版本归档/紫武_鸩羽星离_一段.json'

// [暗影千机] 循环
import 橙武_暗影千机 from './橙武_暗影千机.json'
import 紫武_暗影千机 from './紫武_暗影千机.json'

const 计算循环: 循环数据[] = [橙武_暗影千机, 紫武_暗影千机] as 循环数据[]

export default 计算循环
