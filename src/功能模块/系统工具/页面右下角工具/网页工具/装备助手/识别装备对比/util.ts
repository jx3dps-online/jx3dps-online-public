export function keepChineseChars(str) {
  return str.replace(/[^\u4e00-\u9fa5]/g, '') // 只保留中文字符
}

// 判断两个字符只有一个字符不同
export function isOnlyOneCharDifferent(str1, str2) {
  str1 = keepChineseChars(str1)
  str2 = keepChineseChars(str2)

  if (Math.abs(str1.length - str2.length) > 1) {
    return false
  }

  let diffCount = 0
  let i = 0
  let j = 0

  while (i < str1.length && j < str2.length) {
    if (str1[i] !== str2[j]) {
      diffCount++
      if (str1.length > str2.length) {
        i++
      } else if (str1.length < str2.length) {
        j++
      } else {
        i++
        j++
      }
    } else {
      i++
      j++
    }

    if (diffCount > 1) {
      return false
    }
  }

  return diffCount === 1 || str1.length !== str2.length
}

// 测试
