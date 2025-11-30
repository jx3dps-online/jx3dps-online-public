import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import dayjs from 'dayjs'

const { 缓存映射 } = 获取当前数据()

/**
 * @name 数据埋点
 * @description 记录用户行为
 * @param {string} 行为
 */

export function 数据埋点(行为: string) {
  const 数据埋点 = localStorage.getItem(缓存映射.数据埋点) || '{}'
  const 数据埋点对象 = { ...JSON.parse(数据埋点) }
  const 行为次数 = 数据埋点对象[行为] || 0
  数据埋点对象[行为] = 行为次数 + 1

  localStorage.setItem(缓存映射.数据埋点, JSON.stringify(数据埋点对象))
  记录时间()
}

export function 记录时间() {
  const 数据埋点 = localStorage.getItem(缓存映射.数据埋点) || '{}'
  const 数据埋点对象 = { ...JSON.parse(数据埋点) }
  let 最晚使用时间 = 数据埋点对象?.最晚使用时间 || 0
  let 最早使用时间 = 数据埋点对象?.最早使用时间 || 0
  const now = new Date()
  const hours = now.getHours()
  const DateKey = dayjs().format('YYYY-MM-DD')

  if (hours < 5) {
    // Update latest time before 5 AM if current time is later
    if (!最晚使用时间 || now.valueOf() > 最晚使用时间) {
      最晚使用时间 = now.valueOf()
    }
  } else if (hours >= 5) {
    // Update earliest time after 5 AM if current time is earlier
    if (!最早使用时间 || now.valueOf() < 最早使用时间) {
      最早使用时间 = now.valueOf()
    }
  }

  if (最晚使用时间 !== 数据埋点对象?.最晚使用时间 || 最早使用时间 !== 数据埋点对象?.最早使用时间) {
    数据埋点对象.最晚使用时间 = 最晚使用时间
    数据埋点对象.最早使用时间 = 最早使用时间
  }

  数据埋点对象.日期使用次数 = {
    ...数据埋点对象.日期使用次数,
    [DateKey]: (数据埋点对象?.日期使用次数?.[DateKey] || 0) + 1,
  }

  localStorage.setItem(缓存映射.数据埋点, JSON.stringify(数据埋点对象))
}

/**
 * @name 清除浏览器缓存
 * @description 保留指定词条
 */

export function ClearLocalStorage(preserveKeys = 保留指定词条) {
  const localStorage = window.localStorage
  const length = localStorage.length
  for (let i = 0; i < length; i++) {
    const key: string = localStorage.key(i) || ''
    if (!preserveKeys?.includes(key) && !key?.includes('计算记录')) {
      localStorage.removeItem(key)
    }
  }
  window?.location?.reload()
}

/**
 * @name 保留指定词条
 * @description 被保留的词条在清除缓存时不再会被删除
 */
const 保留指定词条: string[] = [
  缓存映射.管理员,
  缓存映射.版本,
  缓存映射.日志版本,
  缓存映射.计算记录,
  缓存映射.新手引导,
  缓存映射.使用说明,
  缓存映射.背景图片显示状态,
  缓存映射.网络延迟,
  缓存映射.遍历寻优不再提示,
]
