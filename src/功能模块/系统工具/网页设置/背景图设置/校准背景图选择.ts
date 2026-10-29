/**
 * 内置背景图更新后，缓存中可能还保留已经不存在的地址。
 * 优先保留仍然可用的用户选择；若全部失效，则回退到当前全部可用图片。
 */
export const 校准背景图选择 = (已保存选择: string[], 可用背景图: string[]): string[] => {
  const 去重后的可用背景图 = Array.from(new Set(可用背景图.filter(Boolean)))
  const 可用地址 = new Set(去重后的可用背景图)
  const 有效选择 = Array.from(new Set(已保存选择.filter((url) => 可用地址.has(url))))

  return 有效选择.length ? 有效选择 : 去重后的可用背景图
}

export const 背景图选择一致 = (左侧: string[], 右侧: string[]): boolean => {
  return 左侧.length === 右侧.length && 左侧.every((url, index) => url === 右侧[index])
}
