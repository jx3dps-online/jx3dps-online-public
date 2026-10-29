import type { 说明目录, 说明正文, 文档索引 } from './类型'

let 目录缓存: Promise<说明目录> | undefined
const 正文缓存 = new Map<string, Promise<说明正文>>()

export function 读取说明目录(): Promise<说明目录> {
  if (!目录缓存) {
    目录缓存 = import('./数据/目录.json')
      .then((模块) => {
        const 数据 = 模块.default as 说明目录
        if (数据.格式版本 !== 1) throw new Error('功能说明数据版本不兼容，请刷新后重试。')
        return 数据
      })
      .catch((错误) => {
        目录缓存 = undefined
        throw 错误
      })
  }
  return 目录缓存
}

export function 读取说明正文(目录: 说明目录, 文档: 文档索引): Promise<说明正文> {
  let 缓存 = 正文缓存.get(文档.文件)
  if (!缓存) {
    缓存 = import(`./数据/${文档.文件}`)
      .then((模块) => {
        const 数据 = 模块.default as 说明正文
        if (
          数据.格式版本 !== 1 ||
          数据.内容版本 !== 目录.内容版本 ||
          数据.文档.标识 !== 文档.标识
        ) {
          throw new Error('功能说明目录与正文版本不一致，请刷新后重试。')
        }
        return 数据
      })
      .catch((错误) => {
        正文缓存.delete(文档.文件)
        throw 错误
      })
    正文缓存.set(文档.文件, 缓存)
  }
  return 缓存
}
