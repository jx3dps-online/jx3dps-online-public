import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import type { 桌宠资源, 拖拽动画资源, 桌宠配置 as 桌宠配置类型 } from '@/桌宠/interface'
import { 全局默认问题集 } from '@/桌宠/配置/全局默认问题集'
import 默认桌宠配置 from '../../默认/配置'
import { 焚影圣诀问题集 } from './问题集'
const 睡觉: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/fysj-shuijiao.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/fysj-shuijiao.gif`, 类型: 'gif' },
}
const 抱出罐罐: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/fysj-baochuguanguan.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: {
    资源: `${GLOBAL_CDN_PREFIX}/fysj-baochuguanguan.gif`,
    类型: 'gif',
  },
}
const 掏出小鱼干: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/fysj-taochuxiaoyugan.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: {
    资源: `${GLOBAL_CDN_PREFIX}/fysj-taochuxiaoyugan.gif`,
    类型: 'gif',
  },
}
const 吃小鱼干: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/fysj-chixiaoyugan.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/fysj-chixiaoyugan.gif`, 类型: 'gif' },
}
const 拎起来: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/fysj-linqilai.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/fysj-linqilai.gif`, 类型: 'gif' },
}
const 拎着: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/fysj-linzhe.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/fysj-linzhe.gif`, 类型: 'gif' },
}
const 放下: 桌宠资源 = {
  资源: `${GLOBAL_CDN_PREFIX}/fysj-fangxia.webm`,
  类型: 'webm',
  循环: true,
  兼容资源: { 资源: `${GLOBAL_CDN_PREFIX}/fysj-fangxia.gif`, 类型: 'gif' },
}

// 衔接 GIF 为 100ms/帧，在末帧内提前 50ms 切换，避免再次循环到起始动作。
const 常规拖拽: 拖拽动画资源 = {
  提起: { ...拎起来, 单次时长毫秒: 1350 },
  待机: 拎着,
  放下: { ...放下, 单次时长毫秒: 2850 },
  恢复: 睡觉,
}

const 桌宠配置: 桌宠配置类型 = {
  名称: '焚影圣诀',
  启用: true,
  待机资源: 睡觉,
  状态资源: {
    点击交互: 抱出罐罐,
    问答交互: {
      资源: 掏出小鱼干.资源,
      类型: '序列帧',
      序列帧: {
        帧: [掏出小鱼干, 吃小鱼干],
        间隔毫秒: 4950,
        循环: false,
      },
    },
  },
  拖拽动画: {
    常规: 常规拖拽,
    问答: { ...常规拖拽, 恢复: 吃小鱼干 },
  },
  主动交互: 默认桌宠配置.主动交互,
  点击交互: {
    继承全局问题集: false,
    经典问题集: [...焚影圣诀问题集, ...全局默认问题集].map((问题) => ({
      ...问题,
      回答方式: '气泡',
    })),
  },
  尺寸: { 宽: '15%', 比例: 1 },
  交互区域: { 上: 2, 右: 15, 下: 3, 左: 13 },
  气泡: 默认桌宠配置.气泡,
}

export default 桌宠配置
