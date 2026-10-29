export const 读取续接循环 = (参数: Record<string, unknown>): string[] => {
  const 输入 = 参数.测试循环 ?? []
  if (!Array.isArray(输入) || !输入.every((项) => typeof 项 === 'string'))
    throw new Error('当前循环格式不正确')
  return [...输入]
}
