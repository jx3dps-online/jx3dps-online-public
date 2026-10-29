import { useEffect, useState } from 'react'

export const 移动端媒体查询 = '(max-width: 760px), (max-width: 1024px) and (pointer: coarse)'

export default function use移动端() {
  const [移动端, 设置移动端] = useState(() => window.matchMedia(移动端媒体查询).matches)

  useEffect(() => {
    const 查询 = window.matchMedia(移动端媒体查询)
    const 更新 = () => 设置移动端(查询.matches)
    更新()
    查询.addEventListener('change', 更新)
    return () => 查询.removeEventListener('change', 更新)
  }, [])

  return 移动端
}
