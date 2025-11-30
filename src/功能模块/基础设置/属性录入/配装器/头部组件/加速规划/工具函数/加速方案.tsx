function findCombinationsBag(arr, target, limit = 20) {
  const maxValue = target + Math.max(...arr.map((i) => i.value))
  const minValue = Math.min(...arr.map((i) => i.value))
  const results = new Array(maxValue).fill(undefined).fill(undefined)
  const conbinations: any[] = []

  for (let i = minValue; i < maxValue; i++) {
    const rowResults = new Array(arr.length).fill(undefined).fill(undefined)
    for (let j = 0; j < arr.length; j++) {
      if (arr[j].value === i) {
        // 当前加速值刚好等于i
        if (j > 0 && rowResults[j - 1]) {
          // 如果前j-1中有相同的加速值
          rowResults[j] = [...rowResults[j - 1], [j]]
        } else {
          rowResults[j] = [[j]]
        }
      } else if (i - arr[j].value > 0 && i - arr[j].value < target && results[i - arr[j].value]) {
        // 加上当前加速值
        rowResults[j] = [
          ...results[i - arr[j].value]
            .filter((k) => k.every((p) => arr[p].type !== arr[j].type))
            .map((k) => [...k, j]),
          ...(rowResults[j - 1] || []),
        ]
      } else {
        rowResults[j] = rowResults[j - 1]
      }
    }

    results[i] = Array.from(
      new Set(rowResults[arr.length - 1]?.map((k) => k.sort((i, j) => i - j)).map(JSON.stringify)), // 转换数组为字符串并去重
    ).map(JSON.parse as any)

    if (results[i]?.length && i >= target) {
      conbinations.push(
        ...results[i].map((j) => ({
          组合: j.map((k) => arr[k]),
          sum: i,
        })),
      )
    }
    if (conbinations.length > limit) {
      return conbinations
    }
  }

  return conbinations
}

export function closestCombinations(arr, target, limit = 50) {
  const combinationsBag = findCombinationsBag(arr, target, limit)

  // const combinations = findCombinations(arr, target)
  if (combinationsBag.length === 0) {
    return [] // 没有找到符合条件的组合
  }
  // console.log(combinations);

  // 按与目标数字的差异排序
  // combinations.sort((a, b) => Math.abs(a.sum - target) - Math.abs(b.sum - target))

  // 返回前 `limit` 个组合
  return combinationsBag.slice(0, limit)
}
