export const 收藏存储键 = '收藏门派'

export const 读取收藏门派 = (): string[] => {
  try {
    const 解析 = JSON.parse(localStorage.getItem(收藏存储键) || '[]')
    return Array.isArray(解析) ? 解析.filter((项) => typeof 项 === 'string') : []
  } catch {
    return []
  }
}

export const 写入收藏门派 = (列表: string[]) => {
  localStorage.setItem(收藏存储键, JSON.stringify(列表))
}
