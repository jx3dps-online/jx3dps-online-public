import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { 拖拽方向 } from '@/桌宠/interface'

const 拖拽向左 = `${GLOBAL_CDN_PREFIX}/wf-808dcc2e8143.webp`
const 拖拽向右 = `${GLOBAL_CDN_PREFIX}/wf-4576beb9062c.webp`

export type { 拖拽方向 } from '@/桌宠/interface'

export const 拖拽方向资源: Record<拖拽方向, string> = {
  左: 拖拽向左,
  右: 拖拽向右,
}
