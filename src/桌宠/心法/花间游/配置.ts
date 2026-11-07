import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { 桌宠配置 as 桌宠配置类型 } from '@/桌宠/interface'
import 默认桌宠配置 from '../../默认/配置'

const 桌宠配置: 桌宠配置类型 = {
  名称: '花间游',
  启用: true,
  待机资源: {
    资源: `${GLOBAL_CDN_PREFIX}/huajian.webp`,
    类型: 'webp',
    循环: true,
  },
  主动交互: 默认桌宠配置.主动交互,
  点击交互: 默认桌宠配置.点击交互,
  尺寸: { 宽: '10%', 比例: 1 },
  气泡: 默认桌宠配置.气泡,
}

export default 桌宠配置
