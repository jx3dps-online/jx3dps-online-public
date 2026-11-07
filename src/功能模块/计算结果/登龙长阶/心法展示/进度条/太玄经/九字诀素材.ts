import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'

const 临 = `${GLOBAL_CDN_PREFIX}/jiuzijue-lin-45df228691.webp`
const 兵 = `${GLOBAL_CDN_PREFIX}/jiuzijue-bing-2cec4b8b99.webp`
const 斗 = `${GLOBAL_CDN_PREFIX}/jiuzijue-dou-be7893a7ae.webp`
const 行 = `${GLOBAL_CDN_PREFIX}/jiuzijue-xing-4b626120ff.webp`

export const 九字诀素材 = [
  { 文字: '临', 图片: 临 },
  { 文字: '兵', 图片: 兵 },
  { 文字: '斗', 图片: 斗 },
  { 文字: '行', 图片: 行 },
] as const
