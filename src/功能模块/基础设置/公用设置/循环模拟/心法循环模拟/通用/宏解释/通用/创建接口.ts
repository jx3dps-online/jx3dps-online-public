import 获取当前数据, { 获取当前心法名, 初始化心法数据 } from '@/数据/数据工具/获取当前数据'

export const 初始化工作线程数据 = async (名称: string) => {
  if (获取当前心法名() === 名称 && 获取当前数据().名称 === 名称 && 获取当前数据().技能系数?.length)
    return
  try {
    await 初始化心法数据(名称)
  } catch (错误) {
    // 原入口在数据加载完成后更新 favicon；只接收 Worker 缺少 DOM 的这一处错误。
    if (
      !(错误 instanceof ReferenceError) ||
      !/^document is not defined$/.test(错误.message) ||
      获取当前心法名() !== 名称 ||
      获取当前数据().名称 !== 名称 ||
      !获取当前数据().技能系数?.length
    )
      throw 错误
  }
}
