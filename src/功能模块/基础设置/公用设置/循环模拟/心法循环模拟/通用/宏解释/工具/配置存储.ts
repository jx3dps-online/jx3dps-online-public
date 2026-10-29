import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import { 创建本地存储, 是对象, 生成id } from '@/工具函数/本地存储'
import type { 宏编辑内容 } from './分页编辑'
import type { 生成进度 } from '../生成/类型'
import type { 生成任务诊断 } from '../生成/任务协议'

export type 配置保存结果 = { 成功: true } | { 成功: false; 错误: string }

export const 宏数量上限 = 16

export interface 保存的宏 {
  id: string
  名称: string
  图标: string
  编辑: 宏编辑内容
  秒数: number
  气血比例: number
  环境: Record<string, number>
  生成结果?: { 请求: string; 进度: 生成进度; 诊断?: 生成任务诊断 }
}

interface 宏缓存 {
  版本: 1
  宏: 保存的宏[]
}

const 校验生成结果 = (值: unknown) => {
  if (!是对象(值) || typeof 值.请求 !== 'string' || !是对象(值.进度)) return false
  const 进度 = 值.进度
  return (
    ['成功', '未完成'].includes(进度.状态) &&
    typeof 进度.宏 === 'string' &&
    typeof 进度.说明 === 'string' &&
    [进度.轮数, 进度.目标数, 进度.匹配数].every((数) => Number.isSafeInteger(数) && 数 >= 0) &&
    进度.目标数 <= 6000 &&
    进度.匹配数 <= 进度.目标数 &&
    [进度.最大偏差, 进度.容差].every(
      (数) => 数 === undefined || (Number.isFinite(数) && 数 >= 0),
    ) &&
    (进度.已认证 === undefined || typeof 进度.已认证 === 'boolean') &&
    (进度.压缩 === undefined ||
      (是对象(进度.压缩) &&
        ['初始字符', '最佳字符', '试算次数', '接受次数'].every(
          (字段) => Number.isSafeInteger(进度.压缩[字段]) && 进度.压缩[字段] >= 0,
        )))
  )
}

export const 校验宏缓存 = (值: unknown): boolean =>
  是对象(值) &&
  值.版本 === 1 &&
  Array.isArray(值.宏) &&
  值.宏.length <= 宏数量上限 &&
  new Set(值.宏.map((项: unknown) => (是对象(项) ? 项.id : undefined))).size === 值.宏.length &&
  值.宏.every(
    (项: unknown) =>
      是对象(项) &&
      typeof 项.id === 'string' &&
      !!项.id &&
      typeof 项.名称 === 'string' &&
      typeof 项.图标 === 'string' &&
      是对象(项.编辑) &&
      ['单页', '翻页'].includes(项.编辑.模式) &&
      typeof 项.编辑.单页 === 'string' &&
      typeof 项.编辑.翻页 === 'string' &&
      Number.isFinite(项.秒数) &&
      项.秒数 >= 1 &&
      项.秒数 <= 300 &&
      Number.isFinite(项.气血比例) &&
      项.气血比例 >= 0 &&
      项.气血比例 <= 1 &&
      是对象(项.环境) &&
      Object.values(项.环境).every(Number.isFinite) &&
      (项.生成结果 === undefined || 校验生成结果(项.生成结果)),
  )

export const 创建宏存储 = (心法: string) => {
  const 存储 = 创建本地存储<宏缓存>(获取缓存映射(心法).循环模拟宏, { 版本: 1, 宏: [] }, 校验宏缓存)
  return {
    ...存储,
    新增: (图标: string) => {
      const 当前 = 存储.读取()
      if (当前.宏.length >= 宏数量上限) throw new Error('当前心法最多设置 16 个宏')
      const 宏: 保存的宏 = {
        id: 生成id(),
        名称: '宏 ' + (当前.宏.length + 1),
        图标,
        编辑: { 模式: '单页', 单页: '', 翻页: '' },
        秒数: 300,
        气血比例: 1,
        环境: {},
      }
      存储.保存({ 版本: 1, 宏: [...当前.宏, 宏] })
      return 宏.id
    },
    更新: (宏: 保存的宏) => {
      const 当前 = 存储.读取()
      if (!当前.宏.some((项) => 项.id === 宏.id)) throw new Error('该宏已被删除，请重新打开设置')
      存储.保存({ 版本: 1, 宏: 当前.宏.map((项) => (项.id === 宏.id ? 宏 : 项)) })
    },
    删除: (id: string) => 存储.保存({ 版本: 1, 宏: 存储.读取().宏.filter((项) => 项.id !== id) }),
  }
}
