import { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'

/**
 * 获取附魔分数
 * 附魔分数为固定值，直接取数据中的附魔数值
 * @param {number} 附魔ID
 * @return {number}
 */
export function 获取附魔分数(附魔ID) {
  const 当前附魔数据 = 根据附魔ID获取附魔数据(附魔ID)
  if (当前附魔数据) {
    return 当前附魔数据?.附魔装分 || 0
  } else {
    return 0
  }
}
