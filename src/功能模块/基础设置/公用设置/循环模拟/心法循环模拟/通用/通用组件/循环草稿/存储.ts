import { 获取缓存映射 } from '@/心法模块/模块工具/获取缓存映射'
import { 创建本地存储, 是对象 } from '@/工具函数/本地存储'
import type { 循环基础技能数据类型 } from '../../通用框架/类型定义/技能'

export type 草稿技能 = Pick<循环基础技能数据类型, '技能名称' | '额外信息'>
export interface 循环草稿 {
  保存时间: number
  技能序列: 草稿技能[]
}
export type 草稿列表 = Record<string, 循环草稿>

const 校验草稿列表 = (值: unknown): 值 is 草稿列表 =>
  是对象(值) &&
  Object.entries(值).every(
    ([键, 草稿]) =>
      !!键.trim() &&
      是对象(草稿) &&
      Number.isSafeInteger(草稿.保存时间) &&
      草稿.保存时间 > 0 &&
      Array.isArray(草稿.技能序列) &&
      草稿.技能序列.every(
        (技能) =>
          是对象(技能) &&
          typeof 技能.技能名称 === 'string' &&
          !!技能.技能名称 &&
          (技能.额外信息 === undefined ||
            (是对象(技能.额外信息) &&
              (技能.额外信息.延迟 === undefined ||
                技能.额外信息.延迟 === 'GCD' ||
                (Number.isFinite(技能.额外信息.延迟) && 技能.额外信息.延迟 >= 0)) &&
              (技能.额外信息.作用次数 === undefined ||
                (Number.isSafeInteger(技能.额外信息.作用次数) && 技能.额外信息.作用次数 >= 0)))),
      ),
  )

export const 创建循环草稿存储 = (心法: string) => {
  const 键 = 获取缓存映射(心法)
  const 手动 = 创建本地存储<草稿列表>(键.循环模拟手动草稿, {}, 校验草稿列表)
  const 自动 = 创建本地存储<草稿列表>(
    键.循环模拟自动草稿,
    {},
    (值) =>
      校验草稿列表(值) &&
      Object.entries(值).every(([时间戳, 草稿]) => 时间戳 === String(草稿.保存时间)),
  )

  return {
    手动,
    自动,
    保存手动: (名称: string, 技能序列: 草稿技能[]) => {
      手动.保存({ ...手动.读取(), [名称]: { 保存时间: Date.now(), 技能序列 } })
    },
    保存自动: (技能序列: 草稿技能[]) => {
      const 原草稿 = 自动.读取()
      let 保存时间 = Date.now()
      while (Object.prototype.hasOwnProperty.call(原草稿, 保存时间)) 保存时间 += 1
      const 草稿: 草稿列表 = { ...原草稿, [保存时间]: { 保存时间, 技能序列 } }
      自动.保存(
        Object.fromEntries<循环草稿>(
          Object.entries(草稿)
            .sort((a, b) => b[1].保存时间 - a[1].保存时间)
            .slice(0, 5),
        ),
      )
    },
    删除: (类型: '手动' | '自动', 名称: string) => {
      const 存储 = 类型 === '手动' ? 手动 : 自动
      const 草稿 = { ...存储.读取() }
      delete 草稿[名称]
      存储.保存(草稿)
    },
  }
}
