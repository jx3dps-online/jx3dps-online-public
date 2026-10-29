import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { 桌宠配置 as 桌宠配置类型 } from '@/桌宠/interface'
const 待机1 = `${GLOBAL_CDN_PREFIX}/20261025/idle-1.gif`
const 待机2 = `${GLOBAL_CDN_PREFIX}/20261025/idle-2.gif`
const 拖拽 = `${GLOBAL_CDN_PREFIX}/20261025/drag.png`

const 桌宠配置: 桌宠配置类型 = {
  名称: '毒经',
  启用: true,

  待机资源: { 资源: 待机1, 类型: 'gif' },

  状态资源: {
    点击交互: { 资源: 待机2, 类型: 'gif' },
    问答交互: { 资源: 待机2, 类型: 'gif' },
    拖拽中: { 资源: 拖拽, 类型: 'png' },
  },

  点击交互: {
    继承全局问题集: true,
    经典问题集: [
      {
        标题: '毒经的加速阈值是多少？',
        关键词: ['加速', '加速阈值', '降厄'],
        分组: '配装',
        排序: 300,
        行为: {
          类型: '弹窗',
          标题: '加速阈值',
          内容组件: () => import('./内容/加速阈值'),
        },
      },
    ],
  },

  尺寸: { 宽: 200, 高: 200 },
}

export default 桌宠配置
