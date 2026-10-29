import React from 'react'
import { useSearchParams } from 'react-router-dom'
import 功能说明 from '@/功能模块/功能说明'
import 简写映射 from '@/心法模块/简写映射.json'
import styles from '@/功能模块/功能说明/index.module.less'

export default function 功能说明页() {
  const [参数, 设置参数] = useSearchParams()
  const 心法参数 = 参数.get('xf') || ''
  const 心法名称 = 简写映射[心法参数] || 心法参数
  const 心法 = Object.values(简写映射).includes(心法名称) ? 心法名称 : undefined
  return (
    <div className={styles.page}>
      <功能说明
        定位={{ 文档: 参数.get('doc') || undefined, 章节: 参数.get('section') || undefined, 心法 }}
        on定位={(定位) => {
          const 新参数 = new URLSearchParams()
          if (定位.文档) 新参数.set('doc', 定位.文档)
          if (定位.章节) 新参数.set('section', 定位.章节)
          if (定位.心法) 新参数.set('xf', 定位.心法)
          设置参数(新参数)
        }}
      />
    </div>
  )
}
