function toBase64(string) {
  return btoa(unescape(encodeURIComponent(string)))
}

// Base64 解码函数
function fromBase64(base64) {
  try {
    return decodeURIComponent(escape(atob(base64)))
  } catch (e) {
    console.error('解码 URI 时出现错误:', e)
    return null // 或者返回一个合理的默认值
  }
}

// 简单的哈希加密函数
export function simpleHashEncrypt(number) {
  const str = number.toString()
  let hash = ''
  // 混淆字符串
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i) + (i % 10) // 使用字符编码和位置来混淆
    hash += String.fromCharCode(charCode)
  }
  // 使用浏览器的 Base64 方法
  return toBase64(hash).slice(0, 20) // 截取长度至20
}

// 简单的哈希解密函数
export function simpleHashDecrypt(hash) {
  // Base64 解码
  const str = fromBase64(hash)

  if (str) {
    let number = ''
    // 还原字符串
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) - (i % 10) // 逆操作解密
      number += String.fromCharCode(charCode)
    }
    return parseInt(number, 10)
  } else {
    return ''
  }
}
