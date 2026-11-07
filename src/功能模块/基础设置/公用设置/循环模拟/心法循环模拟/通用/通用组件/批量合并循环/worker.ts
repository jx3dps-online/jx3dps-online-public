import { 初始化心法数据, 在指定心法数据下执行 } from '@/数据/数据工具/获取当前数据'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 模拟器加载表 } from './加载模拟器'

self.onmessage = async ({ data: { 心法, 参数 } }) => {
  try {
    const 数据 = await 初始化心法数据(心法, false)
    const [模拟模块, 日志模块] = await 模拟器加载表[心法]()
    if (心法 === '分山劲_悟' && 参数.斩杀模拟) {
      const { 斩杀推算最短循环秒, 斩杀时间占比 } = await import('../../../分山劲_悟/constant/skill')
      const 测量 = 在指定心法数据下执行(数据, () => 模拟模块.default({ ...参数, 斩杀模拟: false }))
      参数.斩杀开始帧 =
        测量.当前时间 >= 斩杀推算最短循环秒 * 每秒郭氏帧
          ? Math.round(斩杀时间占比 * 测量.当前时间)
          : undefined
      参数.斩杀模拟 = 参数.斩杀开始帧 !== undefined
    }
    const 结果 = 在指定心法数据下执行(数据, () => {
      const 模拟 = 模拟模块.default(参数)
      if (模拟.循环执行结果 !== '成功') {
        throw new Error(JSON.stringify(模拟.循环异常信息) || '循环执行异常')
      }
      if (!(模拟.当前时间 > 0)) throw new Error('循环没有有效战斗时间')
      return {
        战斗时间: 模拟.当前时间 / 每秒郭氏帧,
        技能详情: 日志模块.getDpsCycle(模拟.最终日志, 模拟.当前时间, 参数.大橙武模拟),
      }
    })
    self.postMessage({ 结果 })
  } catch (错误) {
    self.postMessage({ 错误: 错误 instanceof Error ? 错误.message : String(错误) })
  }
}
