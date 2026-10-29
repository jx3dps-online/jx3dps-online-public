import React, { useRef, useState } from 'react'
import { Modal, ModalProps } from 'antd'
import 外观设置 from './外观设置'
import 背景图设置 from './背景图设置'
import 系统设置 from './系统设置'
import 数据管理 from './数据管理'
import 行为偏好 from './行为偏好'
import 系统维护 from './系统维护'
import 心法收藏 from './心法收藏'
import styles from './index.module.less'
import use移动端 from '@/hooks/use移动端'

const 导航项 = [
  { key: '外观设置', 标题: '外观设置' },
  { key: '背景设置', 标题: '背景设置' },
  { key: '行为偏好', 标题: '行为偏好' },
  { key: '心法收藏', 标题: '心法收藏' },
  { key: '系统设置', 标题: '系统设置' },
  { key: '数据管理', 标题: '数据管理' },
  { key: '系统维护', 标题: '系统维护' },
]

const 分区标识前缀 = '网页设置_'

function 网页设置(props: ModalProps) {
  const { open, onCancel } = props
  const 移动端 = use移动端()
  const 可见导航 = 移动端 ? 导航项.filter((项) => 项.key !== '外观设置') : 导航项
  const 内容容器 = useRef<HTMLDivElement>(null)
  const [当前导航, 设置当前导航] = useState(导航项[0].key)

  const 跳转 = (key) => {
    const 目标 = document.getElementById(`${分区标识前缀}${key}`)
    if (目标) {
      目标.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const 处理滚动 = () => {
    const 容器 = 内容容器.current
    if (!容器) {
      return
    }
    const 容器顶部 = 容器.getBoundingClientRect().top
    let 命中 = 可见导航[0].key
    for (const item of 可见导航) {
      const 分区 = document.getElementById(`${分区标识前缀}${item.key}`)
      if (分区 && 分区.getBoundingClientRect().top <= 容器顶部 + 60) {
        命中 = item.key
      }
    }
    设置当前导航(命中)
  }

  const 关闭 = () => {
    onCancel?.({} as any)
  }

  return (
    <Modal
      open={open}
      onCancel={关闭}
      footer={null}
      width={960}
      centered
      title='网页设置'
      className={styles.网页设置弹窗}
    >
      <div className={styles.布局}>
        <div className={styles.导航}>
          {可见导航.map((item) => (
            <div
              key={item.key}
              className={当前导航 === item.key ? styles.导航激活 : styles.导航项}
              onClick={() => 跳转(item.key)}
            >
              {item.标题}
            </div>
          ))}
        </div>
        <div className={styles.内容} ref={内容容器} onScroll={处理滚动}>
          {!移动端 && (
            <section className={styles.分区} id={`${分区标识前缀}外观设置`}>
              <div className={styles.分区标题}>外观设置</div>
              <外观设置 open={open} />
            </section>
          )}
          <section className={styles.分区} id={`${分区标识前缀}背景设置`}>
            <div className={styles.分区标题}>背景设置</div>
            <背景图设置 open={open} />
          </section>
          <section className={styles.分区} id={`${分区标识前缀}行为偏好`}>
            <div className={styles.分区标题}>行为偏好</div>
            <行为偏好 />
          </section>
          <section className={styles.分区} id={`${分区标识前缀}心法收藏`}>
            <div className={styles.分区标题}>心法收藏</div>
            <心法收藏 open={open} />
          </section>
          <section className={styles.分区} id={`${分区标识前缀}系统设置`}>
            <div className={styles.分区标题}>系统设置</div>
            <系统设置 />
          </section>
          <section className={styles.分区} id={`${分区标识前缀}数据管理`}>
            <div className={styles.分区标题}>数据管理</div>
            <数据管理 />
          </section>
          <section className={styles.分区} id={`${分区标识前缀}系统维护`}>
            <div className={styles.分区标题}>系统维护</div>
            <系统维护 onClose={关闭} />
          </section>
        </div>
      </div>
    </Modal>
  )
}

export default 网页设置
