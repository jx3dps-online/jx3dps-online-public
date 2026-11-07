import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { 桌宠资源, 桌宠配置 as 桌宠配置类型 } from '@/桌宠/interface'
import 默认桌宠配置 from '../../默认/配置'
const 待机: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/shxj-daiji.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/shxj-daiji.gif`, 类型: 'gif' },
}
const 点击: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/shxj-dianji.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/shxj-dianji.gif`, 类型: 'gif' },
}
const 拖拽中: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/shxj-tuozhuaizhong.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/shxj-tuozhuaizhong.gif`, 类型: 'gif' },
}

const 桌宠配置: 桌宠配置类型 = {
  名称: '山海心诀',
  启用: true,
  待机资源: 待机,
  状态资源: {
    点击交互: 点击,
    问答交互: { ...点击, 单次时长毫秒: 1400 },
    拖拽中: 拖拽中,
  },
  主动交互: 默认桌宠配置.主动交互,
  点击交互: 默认桌宠配置.点击交互,
  尺寸: { 宽: '10%', 比例: 1976 / 1300 },
  交互区域: { 上: 40, 右: 5, 下: 2, 左: 5 },
  气泡: 默认桌宠配置.气泡,
}

export default 桌宠配置
