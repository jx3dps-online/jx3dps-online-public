import { 初始化心法数据 } from '@/数据/数据工具/获取当前数据'
import { 执行秒伤计算 } from '@/计算模块/执行秒伤计算'
import type { 寻优计算上下文, 线程请求, 线程响应 } from './计算线程池'

let 上下文: 寻优计算上下文

self.onmessage = async ({ data }: MessageEvent<线程请求>) => {
  let 响应: 线程响应
  try {
    if (data.类型 === '初始化') {
      await 初始化心法数据(data.上下文.心法名称, false)
      上下文 = data.上下文
      响应 = { 序号: data.序号, 秒伤: [] }
    } else {
      const 秒伤 = data.任务.map((任务) => {
        try {
          return 执行秒伤计算(
            {
              ...上下文.循环覆盖,
              更新装备信息: 任务.装备信息,
              更新增益数据: 任务.增益数据,
              更新增益启用: 上下文.数据.增益启用,
              计算技能详情: false,
            },
            () => ({ data: 上下文.数据 }),
          ).秒伤
        } catch {
          return 0
        }
      })
      响应 = { 序号: data.序号, 秒伤 }
    }
  } catch (错误) {
    响应 = { 序号: data.序号, 错误: 错误 instanceof Error ? 错误.message : String(错误) }
  }
  self.postMessage(响应)
}
