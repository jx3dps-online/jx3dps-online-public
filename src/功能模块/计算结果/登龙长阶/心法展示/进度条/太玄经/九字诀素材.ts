import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'

const 临 = `${GLOBAL_CDN_PREFIX}/20261029/jiuzijue-lin.png`
const 兵 = `${GLOBAL_CDN_PREFIX}/20261029/jiuzijue-bing.png`
const 斗 = `${GLOBAL_CDN_PREFIX}/20261029/jiuzijue-dou.png`
const 行 = `${GLOBAL_CDN_PREFIX}/20261029/jiuzijue-xing.png`

export const 九字诀素材 = [
  { 文字: '临', 图片: 临 },
  { 文字: '兵', 图片: 兵 },
  { 文字: '斗', 图片: 斗 },
  { 文字: '行', 图片: 行 },
] as const
