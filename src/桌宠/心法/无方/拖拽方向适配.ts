const 拖拽向左 =
  'https://cdn.arkwish.com/jx3dps/pet/wf/%E6%8B%96%E6%8B%BD%E5%90%91%E5%B7%A6_20260906_118.gif'
const 拖拽向右 =
  'https://cdn.arkwish.com/jx3dps/pet/wf/%E6%8B%96%E6%8B%BD%E4%B8%AD_20260906_115.gif'
import type { 拖拽方向 } from '@/桌宠/interface'

export type { 拖拽方向 } from '@/桌宠/interface'

export const 拖拽方向资源: Record<拖拽方向, string> = {
  左: 拖拽向左,
  右: 拖拽向右,
}
