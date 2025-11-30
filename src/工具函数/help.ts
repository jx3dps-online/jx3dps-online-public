/**
 * @name 基础算法函数工具
 * @description 基础JS相关算法，无业务属性
 */
export const 按数字生成数组 = (number) => {
  return Array.from({ length: number - 1 + 1 }, (_, index) => index + 1)
}

export const hexToRgba = (hex, alpha) => {
  // 将16进制颜色代码转换为RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // 返回RGBA字符串
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const hexToRgbaToDark = (hex, alpha, num = 10) => {
  // 将16进制颜色代码转换为RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const dark_r = Math.max(r - num, 0)
  const dark_g = Math.max(g - num, 0)
  const dark_b = Math.max(b - num, 0)

  // 返回RGBA字符串
  return `rgba(${dark_r}, ${dark_g}, ${dark_b}, ${alpha})`
}

export const 获取页面参数 = (param) => {
  if (globalThis?.心法 && param === '心法') {
    return globalThis?.心法
  } else if (globalThis?.xf && param === 'xf') {
    return globalThis?.xf
  } else if (window) {
    if (window?.location?.search) {
      const urlParams = new URLSearchParams(window?.location?.search)
      return urlParams.get(param)
    }
  }
  return ''
}

export const 修改页面Logo = (src) => {
  let link: any = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  link.href = src
}

export const INT = (val) => Math.floor(val)

export const 去除对象中的无效值 = (obj) => {
  const newObj: any = {}
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] !== null && obj[prop] !== undefined) {
      newObj[prop] = obj[prop]
    }
  })
  return newObj
}

export function 深拷贝对象(obj: any) {
  // 如果不是对象或数组，直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 创建一个数组或对象
  const copy = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    // 确保是对象自身的属性
    // eslint-disable-next-line no-prototype-builtins
    if (obj?.hasOwnProperty?.(key)) {
      // 递归拷贝
      copy[key] = 深拷贝对象(obj[key])
    }
  }

  return copy
}

export function deepClone(obj, hash = new WeakMap()) {
  // Check for null or non-object type, return directly
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj)
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy: any[] = []
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i], hash)
    }
    return arrCopy
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags)
  }

  // Handle Function
  if (typeof obj === 'function') {
    return obj.bind({})
  }

  // Handle Object with cycle detection
  if (hash.has(obj)) {
    return hash.get(obj)
  }

  const result = Array.isArray(obj) ? [] : {}
  hash.set(obj, result)

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key], hash)
    }
  }

  return result
}

export const deepMerge = (target, source) => {
  for (const key in source) {
    // eslint-disable-next-line no-prototype-builtins
    if (source.hasOwnProperty(key)) {
      // 如果属性是对象，则递归合并
      if (source[key] && typeof source[key] === 'object') {
        // 如果目标对象没有该属性，则直接赋值
        if (!target[key]) {
          target[key] = deepClone(source[key])
        } else {
          // 如果目标对象已有该属性，则递归合并
          target[key] = deepMerge(target[key], source[key])
        }
      } else {
        // 否则直接赋值
        target[key] = deepClone(source[key])
      }
    }
  }
  return target
}

export function arrayToCSV(data) {
  return data?.join('\n')
}

// 创建下载链接并下载 CSV 文件
export function downloadCSV(data) {
  const csvContent = arrayToCSV(data)

  // 添加 UTF-8 BOM
  const bom = '\uFEFF' // UTF-8 BOM
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', '解析JCL技能序列.csv')
  document.body.appendChild(link)
  link.click()
}

/**
 * 将数字或字符串数字转换为千分位格式
 * @param value - 需要转换的数字或字符串数字
 * @returns 千分位格式的字符串
 */
export function 千分位转换(value: number | string): string {
  // 转换为字符串并去除空格
  const stringValue = String(value).trim()

  // 分离整数部分和小数部分
  const [integerPart, decimalPart] = stringValue.split('.')

  // 检查是否为有效数字
  if (!/^-?\d+$/.test(integerPart.replace(/^-/, ''))) {
    throw new Error('Invalid number format')
  }

  // 处理整数部分的千分位分隔
  const isNegative = integerPart.startsWith('-')
  const absIntegerPart = isNegative ? integerPart.slice(1) : integerPart

  // 添加千分位分隔符
  let formattedInteger = ''
  for (let i = 0; i < absIntegerPart.length; i++) {
    if (i > 0 && (absIntegerPart.length - i) % 3 === 0) {
      formattedInteger += ','
    }
    formattedInteger += absIntegerPart[i]
  }

  // 组合结果
  let result = isNegative ? '-' + formattedInteger : formattedInteger

  // 如果有小数部分，则添加小数部分
  if (decimalPart !== undefined) {
    result += '.' + decimalPart
  }

  return result
}

export function 数组求和(数字数组: number[]): number {
  let 总和 = 0
  for (let i = 0; i < 数字数组.length; i++) {
    总和 += 数字数组[i]
  }
  return 总和
}
