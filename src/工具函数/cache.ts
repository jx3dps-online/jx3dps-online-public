export function 函数缓存(func, resolver?) {
  // your code here
  const map = new Map()

  return function (...args) {
    const key = resolver ? resolver(...args) : args.join('_')
    if (map.has(key)) {
      return map.get(key)
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cache = func.call(this, ...args)
    map.set(key, cache)
    return cache
  }
}

/**
 * 内容式缓存：以 keyFn 生成的字符串为 key，带 LRU 上限。
 * 适用于「入参为对象、但内容相等即可命中」的纯函数。
 * 注意：调用方不得修改缓存返回值的引用。
 */
export function 内容缓存(
  func,
  { keyFn, maxSize = 200 }: { keyFn: (...args) => string; maxSize?: number } = {
    keyFn: (...args) => args.join('_'),
  },
) {
  const map = new Map()

  return function (this: any, ...args) {
    const key = keyFn(...args)
    if (map.has(key)) {
      const value = map.get(key)
      map.delete(key)
      map.set(key, value)
      return value
    }

    const value = func.call(this, ...args)
    map.set(key, value)
    if (map.size > maxSize) {
      map.delete(map.keys().next().value)
    }
    return value
  }
}
