import type { 说明目录, 检索结果, 章节索引 } from './类型'

const 规范查询 = (文本: string) => 文本.normalize('NFKC').toLowerCase().replace(/\s+/g, '')

export const 章节适用 = (章节: 章节索引, 心法 = '') => !章节.心法.length || 章节.心法.includes(心法)

export function 检索说明(目录: 说明目录, 输入: string, 心法 = ''): 检索结果[] {
  const 查询 = 规范查询(输入)
  if (!查询) return []
  const 词表 = new Set(
    目录.文档.flatMap((文档) => 文档.章节.flatMap((章节) => 章节.关键词.map(规范查询))),
  )
  const 命中词 = [...词表].filter((词) => 查询.includes(词))
  return 目录.文档
    .flatMap((文档) =>
      文档.章节
        .filter((章节) => 章节适用(章节, 心法))
        .map((章节) => {
          const 标题 = 规范查询(章节.标题)
          const 关键词 = 章节.关键词.map(规范查询)
          const 标题词 = 命中词.filter((词) => 标题.includes(词) || 关键词.includes(词))
          const 问法命中 = 章节.常见问法.some((问法) => 规范查询(问法) === 查询)
          const 标题命中 = 标题.includes(查询)
          const 正文命中 = 命中词.filter((词) => 规范查询(章节.搜索文本).includes(词)).length
          const 得分 = 问法命中
            ? 10000
            : 标题命中
              ? 5000
              : 标题词.length > 1
                ? 1000 + 标题词.length * 10
                : 标题词.length
                  ? 100
                  : 正文命中
                    ? 10 + 正文命中
                    : 0
          return { 文档, 章节, 得分 }
        }),
    )
    .filter((项) => 项.得分 > 0)
    .sort(
      (甲, 乙) =>
        乙.得分 - 甲.得分 ||
        Number(乙.章节.心法.includes(心法)) - Number(甲.章节.心法.includes(心法)),
    )
    .map(({ 文档, 章节 }) => ({ 文档, 章节 }))
}
