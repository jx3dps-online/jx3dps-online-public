import type { 对比数据, 对比行, 对比列, 对比结果 } from './类型'

export const 下载对比表格 = async (
  数据: 对比数据,
  行: 对比行[],
  列: 对比列[],
  结果: Record<string, 对比结果>,
) => {
  const { utils, writeFile } = await import('xlsx')
  const 角色名称 = new Map(
    数据.行.filter((项) => 项.来源 === '角色').map((项) => [项.角色id, 项.名称]),
  )
  const 表头 = [
    '名称',
    '类型',
    '增益来源角色',
    '总加速',
    '加速装备',
    '加速附魔',
    '加速小药',
    '加速酒',
    ...列.map((项) =>
      [项.循环.标题, 项.循环.名称, 项.循环.备注, 项.标题].filter(Boolean).join('\n'),
    ),
  ]
  const 工作表 = utils.aoa_to_sheet([
    表头,
    ...行.map((项) => [
      项.名称,
      项.来源,
      角色名称.get(项.角色id),
      项.加速概要 ? 项.加速值 : '-',
      项.加速概要?.装备 || '',
      项.加速概要?.附魔 || '',
      项.加速概要?.小药 ?? '',
      项.加速概要?.酒 ?? '',
      ...列.map((当前列) => 结果[`${项.id}/${当前列.id}`]?.秒伤 ?? '-'),
    ]),
  ])
  行.forEach((项, 行号) =>
    列.forEach((当前列, 列号) => {
      const 原因 = 结果[`${项.id}/${当前列.id}`]?.原因
      if (原因) {
        工作表[utils.encode_cell({ r: 行号 + 1, c: 列号 + 8 })].c = [{ a: '角色对比', t: 原因 }]
      }
    }),
  )
  工作表['!cols'] = 表头.map((_, 序号) => ({ wch: 序号 < 3 ? 24 : 序号 < 8 ? 14 : 32 }))
  const 工作簿 = utils.book_new()
  utils.book_append_sheet(工作簿, 工作表, '角色对比')
  writeFile(工作簿, `${数据.心法数据.名称}-角色对比.xlsx`)
}
