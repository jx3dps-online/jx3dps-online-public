// 行为注册表：自定义行为的白名单，配置里只存「名称」字符串，运行时校验后执行

type 行为处理器 = (参数?: any) => void | Promise<void>

const 注册表 = new Map<string, 行为处理器>()

export const 注册行为 = (名称: string, 处理器: 行为处理器) => {
  注册表.set(名称, 处理器)
}

export const 执行行为 = (名称: string, 参数?: any) => {
  const 处理器 = 注册表.get(名称)
  if (!处理器) {
    console.warn(`[桌宠] 未注册的自定义行为: ${名称}`)
    return
  }
  return 处理器(参数)
}

export const 注销行为 = (名称: string) => {
  注册表.delete(名称)
}

export const 获取已注册行为 = () => [...注册表.keys()]
