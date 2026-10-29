import type { 宏配置, 宏定义, 心法说明 } from '../类型'
import { 解析宏, 宏解析错误 } from './解析'
import { 包含分页声明 } from '../工具/分页编辑'

export const 包含宏调用 = (文本: string) => /^\s*\/mcast(?:\s|$)/m.test(文本)

export const 编译宏调用 = (文本: string, 说明: 心法说明, 宏列表: 宏定义[] = []) => {
  const 宏库 = new Map<string, 宏配置>()
  const 解析配置 = (文本: string, 模式?: 宏定义['模式']) => {
    if (包含分页声明(文本)) {
      if (模式 === '单页') throw new Error('不翻页模式下不能使用 #page')
      if (!说明.翻页体态) throw new Error('当前心法仅支持不翻页宏，请移除 #page')
    }
    return 解析宏(文本, 说明)
  }
  const 绑定调用 = (配置: 宏配置, 调用链: string[]) => {
    for (const 行 of 配置.页.flatMap((页) => 页.语句)) {
      if (行.命令 !== 'mcast') continue
      if (调用链.includes(行.宏))
        throw new 宏解析错误(行.行号, 1, '宏循环调用：' + [...调用链, 行.宏].join(' → '))
      if (宏库.has(行.宏)) continue
      const 同名宏 = 宏列表.filter((宏) => 宏.名称 === 行.宏)
      if (同名宏.length !== 1) {
        let 提示 = 同名宏.length
          ? '存在多个同名宏，无法确定调用：' + 行.宏
          : '找不到当前心法的宏：' + 行.宏
        const 疑似条件 = !行.条件 && 行.宏.match(/^(\S*[<>=~:&|]\S*)\s+(.+)$/)
        if (!同名宏.length && 疑似条件)
          提示 +=
            '。如果前半部分是条件，请用方括号 [] 包起来；/mcast 不支持省略条件括号。例如：/mcast [' +
            疑似条件[1] +
            '] ' +
            JSON.stringify(疑似条件[2])
        throw new 宏解析错误(行.行号, 1, 提示)
      }
      try {
        const 子宏 = 解析配置(同名宏[0].文本, 同名宏[0].模式)
        绑定调用(子宏, [...调用链, 行.宏])
        宏库.set(行.宏, 子宏)
      } catch (错误) {
        throw new 宏解析错误(行.行号, 1, '调用宏「' + 行.宏 + '」失败：' + (错误 as Error).message)
      }
    }
  }
  const 配置 = 解析配置(文本)
  绑定调用(配置, [])
  return { 配置, 宏库 }
}
