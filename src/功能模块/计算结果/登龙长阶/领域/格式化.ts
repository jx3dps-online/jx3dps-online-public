export const 数字 = (n: number | undefined, 待评估: string) =>
  n === undefined ? 待评估 : Math.round(n).toLocaleString('zh-CN')

export const 增量 = (n: number | undefined, 待评估: string) =>
  n === undefined ? 待评估 : `${n > 0 ? '+' : ''}${数字(n, 待评估)}`
