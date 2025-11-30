import * as luadata from 'luadata'
// https://github.com/tinymins/luadata

function DecompressLUAData(compressedBase64) {
  // 1. Base64解码（处理URL安全和填充）
  const base64 = compressedBase64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(compressedBase64.length + ((4 - (compressedBase64.length % 4)) % 4), '=')

  // 转换Base64字符串为字节数组
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // 2. Zlib解压
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const decompressed = pako?.inflate(bytes)

  if (!decompressed) return

  // 3. 反序列化数据（假设原始数据为JSON字符串）
  const luaString = new TextDecoder().decode(decompressed)
  // 4. 解析Lua数据格式为对象格式
  const res = luadata.serializer.unserialize(luaString, { dictType: 'object' })
  console.log('=====解析结果=====', res)
  return res
}

export default DecompressLUAData
