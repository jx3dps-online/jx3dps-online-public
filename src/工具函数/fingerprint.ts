function generateSimpleFingerprint() {
  if (!navigator || !screen || !window) {
    return false
  }
  const keys = [
    navigator?.userAgent,
    navigator?.platform,
    screen?.colorDepth,
    new Date().getTimezoneOffset(),
    !!navigator?.cookieEnabled,
    navigator?.language,
    !!window?.sessionStorage,
    (window?.devicePixelRatio || 1).toString(),
  ]

  return btoa(keys.join('|')).slice(0, 32) // 生成32位简版指纹
}

export default generateSimpleFingerprint
