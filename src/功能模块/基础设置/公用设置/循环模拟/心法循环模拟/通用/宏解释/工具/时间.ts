const 浮点视图 = new DataView(new ArrayBuffer(8))

export const 紧邻后继时间 = (时间: number): number => {
  if (!Number.isFinite(时间)) return 时间
  if (时间 === 0) return Number.MIN_VALUE
  浮点视图.setFloat64(0, 时间)
  let 高位 = 浮点视图.getUint32(0)
  let 低位 = 浮点视图.getUint32(4)
  if (时间 > 0) {
    低位 = (低位 + 1) >>> 0
    if (低位 === 0) 高位++
  } else {
    if (低位 === 0) 高位--
    低位 = (低位 - 1) >>> 0
  }
  浮点视图.setUint32(0, 高位)
  浮点视图.setUint32(4, 低位)
  return 浮点视图.getFloat64(0)
}

export const 正等待时刻 = (当前时间: number, 剩余帧: number): number => {
  if (!(剩余帧 > 0)) return Infinity
  const 时刻 = 当前时间 + 剩余帧
  // 正时长被浮点加法舍去时，仍通过原生推进处理最早可表示的未来时刻。
  return 时刻 === 当前时间 ? 紧邻后继时间(当前时间) : 时刻
}
