export const 拆分循环文本 = (文本: string) => {
  const 节点: string[] = []
  let 深度 = 0
  let 引号内 = false
  let 转义 = false
  let 开始 = 0
  for (let 索引 = 0; 索引 < 文本.length; 索引++) {
    const 字符 = 文本[索引]
    if (引号内) {
      if (转义) 转义 = false
      else if (字符 === '\\') 转义 = true
      else if (字符 === '"') 引号内 = false
    } else if (字符 === '"') 引号内 = true
    else if (字符 === '{' || 字符 === '[') 深度++
    else if (字符 === '}' || 字符 === ']') 深度--
    else if (字符 === ',' && 深度 === 0) {
      节点.push(文本.slice(开始, 索引).trim())
      开始 = 索引 + 1
    }
    if (深度 < 0) throw new Error('循环文本中的JSON边界无效')
  }
  if (深度 !== 0 || 引号内) throw new Error('循环文本中的JSON参数不完整')
  节点.push(文本.slice(开始).trim())
  return 节点
}
