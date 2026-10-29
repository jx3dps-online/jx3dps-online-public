export function generateCombinations(arr: number[], length: number): number[][] {
  const result = new Set<string>() // 使用 Set 来避免重复

  function backtrack(current: number[]) {
    // 如果当前组合达到指定长度，将其加入结果
    if (current.length === length) {
      // 检查是否为全零组合
      if (!current.every((num) => num === 0)) {
        // 将当前组合排序并转换为字符串，存储在 Set 中
        result.add(
          current
            .slice()
            .sort((a, b) => a - b)
            .join(','),
        )
      }
      return
    }

    // 遍历数组，选择每个元素并进行递归
    for (let i = 0; i < arr.length; i++) {
      current.push(arr[i])
      backtrack(current)
      current.pop() // 回溯
    }
  }

  backtrack([])

  // 将 Set 中的字符串转换回数组并解析为数字数组
  return Array.from(result).map((item) => item.split(',').map(Number))
}
