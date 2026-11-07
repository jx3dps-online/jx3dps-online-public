import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
/**
 * @name 默认 - 桌宠配置
 * 未配置专属桌宠的心法统一使用本配置（考拉 DJ）。
 * 只继承全局通用问题集，不携带任何心法专属内容。
 */
import type { 桌宠配置 as 桌宠配置类型 } from '@/桌宠/interface'

const 待机 = `${GLOBAL_CDN_PREFIX}/default-35af17fe89df.webp`
const 主动交互 = `${GLOBAL_CDN_PREFIX}/default-610ed72d1ec0.webp`
const 点击交互 = `${GLOBAL_CDN_PREFIX}/default-520598e61b89.webp`
const 问答交互 = `${GLOBAL_CDN_PREFIX}/default-4fadc62a406a.webp`
const 拖拽向左 = `${GLOBAL_CDN_PREFIX}/default-3c3a49552c82.webp`
const 拖拽向右 = `${GLOBAL_CDN_PREFIX}/default-3386f7670458.webp`

const 桌宠配置: 桌宠配置类型 = {
  名称: '默认',
  启用: true,

  待机资源: { 资源: 主动交互, 类型: 'webp' },

  状态资源: {
    主动交互: { 资源: 待机, 类型: 'webp' },
    点击交互: { 资源: 点击交互, 类型: 'webp' },
    问答交互: { 资源: 问答交互, 类型: 'webp' },
  },

  拖拽方向资源: {
    左: { 资源: 拖拽向左, 类型: 'webp' },
    右: { 资源: 拖拽向右, 类型: 'webp' },
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

  尺寸: { 宽: '7%', 比例: 146 / 134 },
  气泡: { 宽: 400 },
}

export default 桌宠配置
