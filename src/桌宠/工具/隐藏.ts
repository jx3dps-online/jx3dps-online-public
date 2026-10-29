import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export const 隐藏存储前缀 = '桌宠隐藏_'
export const 桌宠切换隐藏事件名 = '桌宠切换隐藏'

export const 获取桌宠隐藏状态 = (): boolean => {
  const { 名称 } = 获取当前数据()
  try {
    return localStorage.getItem(`${隐藏存储前缀}${名称}`) === '1'
  } catch {
    return false
  }
}

export const 切换桌宠隐藏 = () => {
  window.dispatchEvent(new Event(桌宠切换隐藏事件名))
}
