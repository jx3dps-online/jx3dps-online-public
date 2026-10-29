/**
 * @name 默认 - 桌宠配置
 * 未配置专属桌宠的心法统一使用本配置（考拉 DJ）。
 * 只继承全局通用问题集，不携带任何心法专属内容。
 */
import type { 桌宠配置 as 桌宠配置类型 } from '@/桌宠/interface'

const 待机 = 'https://cdn.arkwish.com/jx3dps/pet/default/%E5%BE%85%E6%9C%BA_20260906_096.gif'
const 主动交互 =
  'https://cdn.arkwish.com/jx3dps/pet/default/%E4%B8%BB%E5%8A%A8%E4%BA%A4%E4%BA%92_20260906_097.gif'
const 点击交互 =
  'https://cdn.arkwish.com/jx3dps/pet/default/%E7%82%B9%E5%87%BB%E4%BA%A4%E4%BA%92_20260906_098.gif'
const 问答交互 =
  'https://cdn.arkwish.com/jx3dps/pet/default/%E9%97%AE%E7%AD%94%E4%BA%A4%E4%BA%92_20260906_099.gif'
const 拖拽向左 =
  'https://cdn.arkwish.com/jx3dps/pet/default/%E6%8B%96%E6%8B%BD%E5%90%91%E5%B7%A6_20260906_100.gif'
const 拖拽向右 =
  'https://cdn.arkwish.com/jx3dps/pet/default/%E6%8B%96%E6%8B%BD%E5%90%91%E5%8F%B3_20260906_101.gif'

const 桌宠配置: 桌宠配置类型 = {
  名称: '默认',
  启用: true,

  待机资源: { 资源: 主动交互, 类型: 'gif' },

  状态资源: {
    主动交互: { 资源: 待机, 类型: 'gif' },
    点击交互: { 资源: 点击交互, 类型: 'gif' },
    问答交互: { 资源: 问答交互, 类型: 'gif' },
  },

  拖拽方向资源: {
    左: { 资源: 拖拽向左, 类型: 'gif' },
    右: { 资源: 拖拽向右, 类型: 'gif' },
  },

  主动交互: {
    消息集: [{ 文本: '嗨，有需要随时点我~' }, { 文本: '遇到问题可以点我提问' }],
    进入后延迟秒: 6,
    定时随机间隔秒: [30, 60],
  },

  点击交互: {
    继承全局问题集: true,
    经典问题集: [],
  },

  尺寸: { 宽: 134, 高: 146 },
  气泡: { 宽: 400 },
}

export default 桌宠配置
