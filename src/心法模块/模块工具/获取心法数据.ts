import type { 心法配置类型 } from '@/心法模块/interface'
import 简写映射 from '../简写映射.json'

// 简写 → 中文心法名（供 URL/路由层使用）
export const 简写转心法名 = (简写: string): string | undefined => {
  return 简写映射?.[简写]
}

// 心法名 → 模块 import（纯函数，不依赖 window/location）
export const 获取心法数据 = async (目标心法: string): Promise<心法配置类型> => {
  if (!目标心法) {
    throw new Error('未指定心法')
  }
  const 加载数据 = await import(`@/心法模块/心法/${目标心法}/index`)
  return 加载数据?.default
}

// 切/设置心法时更新 favicon 与标题
export const 应用心法外观 = (目标心法数据: 心法配置类型) => {
  if (目标心法数据?.系统配置?.心法图标) {
    修改页面Logo(目标心法数据?.系统配置?.心法图标)
    document.title = `${目标心法数据?.名称}-配装计算器`
  }
}

const 修改页面Logo = (src) => {
  let link: any = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  link.href = src
}
