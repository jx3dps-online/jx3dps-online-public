import React, { lazy, Suspense } from 'react'
import 样式 from './index.module.less'

const 药宗排版 = lazy(() => import('../../心法/无方/统一样式'))
const 刀宗排版 = lazy(() => import('../../心法/孤锋诀/统一样式'))
const 凌海排版 = lazy(async () => {
  const { default: styles } = await import('../../心法/凌海诀/统一样式.module.less')
  return {
    default: ({ children }: { children: React.ReactNode }) => (
      <div className={styles.正文}>{children}</div>
    ),
  }
})
const 分山排版 = lazy(async () => {
  const { default: styles } = await import('../../心法/分山劲/统一样式.module.less')
  return {
    default: ({ children }: { children: React.ReactNode }) => (
      <div className={styles.content}>{children}</div>
    ),
  }
})

export default function 攻略正文({ 心法, children }: { 心法: string; children: React.ReactNode }) {
  const 排版 =
    心法 === '无方' || 心法 === '无方_悟'
      ? 药宗排版
      : 心法 === '孤锋诀'
        ? 刀宗排版
        : 心法 === '凌海诀'
          ? 凌海排版
          : 心法 === '分山劲'
            ? 分山排版
            : React.Fragment
  return (
    <article className={样式.正文}>
      <Suspense fallback={<p>正在加载攻略排版…</p>}>
        <排版>{children}</排版>
      </Suspense>
    </article>
  )
}
