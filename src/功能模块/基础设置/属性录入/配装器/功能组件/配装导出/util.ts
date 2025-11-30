import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export const PEIZHUANG_BACKGROUND_URL_PREFIX = `https://cdn.jx3box.com/static/pz/img/overview/horizontal/`
export const DEFAULT_PEIZHUANG_BACKGROUND_URL = `https://img.jx3box.com/image/pz/overview/horizontal/默认.png`

const { 所属门派 } = 获取当前数据()

export const 获取配装背景图片 = () => {
  // 魔盒没更新，用的是默认图片
  if (所属门派 === '无相') {
    return DEFAULT_PEIZHUANG_BACKGROUND_URL
  }
  return `${PEIZHUANG_BACKGROUND_URL_PREFIX}${所属门派}.png`
}
