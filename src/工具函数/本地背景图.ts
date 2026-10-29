import { useEffect, useState } from 'react'

const 数据库名 = 'jx3dps'
const 存储表名 = '本地背景图'

let 数据库实例: IDBDatabase | null = null

const 打开数据库 = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (数据库实例) {
      resolve(数据库实例)
      return
    }
    const 请求 = indexedDB.open(数据库名, 1)
    请求.onupgradeneeded = () => {
      const db = 请求.result
      if (!db.objectStoreNames.contains(存储表名)) {
        db.createObjectStore(存储表名)
      }
    }
    请求.onsuccess = () => {
      数据库实例 = 请求.result
      resolve(数据库实例)
    }
    请求.onerror = () => reject(请求.error)
  })
}

export const 生成本地背景图id = () => {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const 是否为本地背景图 = (引用: string) => {
  return 引用?.startsWith('local:')
}

const 提取本地背景图id = (引用: string) => {
  return 引用?.slice('local:'.length)
}

export const 存储本地背景图 = async (id: string, blob: Blob): Promise<void> => {
  const db = await 打开数据库()
  return new Promise((resolve, reject) => {
    const 事务 = db.transaction(存储表名, 'readwrite')
    事务.objectStore(存储表名).put(blob, id)
    事务.oncomplete = () => resolve()
    事务.onerror = () => reject(事务.error)
  })
}

export const 获取本地背景图 = async (id: string): Promise<Blob | undefined> => {
  const db = await 打开数据库()
  return new Promise((resolve, reject) => {
    const 事务 = db.transaction(存储表名, 'readonly')
    const 请求 = 事务.objectStore(存储表名).get(id)
    请求.onsuccess = () => resolve(请求.result as Blob | undefined)
    请求.onerror = () => reject(请求.error)
  })
}

export const 删除本地背景图 = async (id: string): Promise<void> => {
  const db = await 打开数据库()
  return new Promise((resolve, reject) => {
    const 事务 = db.transaction(存储表名, 'readwrite')
    事务.objectStore(存储表名).delete(id)
    事务.oncomplete = () => resolve()
    事务.onerror = () => reject(事务.error)
  })
}

const 对象地址缓存 = new Map<string, string>()

export const 清空本地背景图存储 = async (): Promise<void> => {
  对象地址缓存.forEach((url) => URL.revokeObjectURL(url))
  对象地址缓存.clear()
  const db = await 打开数据库()
  return new Promise((resolve, reject) => {
    const 事务 = db.transaction(存储表名, 'readwrite')
    事务.objectStore(存储表名).clear()
    事务.oncomplete = () => resolve()
    事务.onerror = () => reject(事务.error)
  })
}

export const 使用背景图地址 = (引用: string): string | undefined => {
  const [地址, 设置地址] = useState<string | undefined>(undefined)

  useEffect(() => {
    let 已取消 = false
    if (!引用) {
      设置地址(undefined)
      return
    }
    if (!是否为本地背景图(引用)) {
      设置地址(引用)
      return
    }
    const id = 提取本地背景图id(引用)
    if (对象地址缓存.has(id)) {
      设置地址(对象地址缓存.get(id))
      return
    }
    获取本地背景图(id).then((blob) => {
      if (blob && !已取消) {
        const 对象地址 = URL.createObjectURL(blob)
        对象地址缓存.set(id, 对象地址)
        设置地址(对象地址)
      }
    })
    return () => {
      已取消 = true
    }
  }, [引用])

  return 地址
}
