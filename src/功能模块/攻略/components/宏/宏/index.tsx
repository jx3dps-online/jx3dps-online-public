import React, { useState } from 'react'
import { Button, message } from 'antd'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import styles from './index.module.less'

export interface 宏块数据 {
  /** 宏标题，如「起手宏」「循环宏」 */
  标题?: string
  /** 宏内容 */
  内容: string
}

interface 宏组件类型 {
  /** 多个宏块，每个宏块独立展示与复制 */
  宏列表: 宏块数据[]
  标题?: string
}

function 复制文本(text: string) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      resolve(true)
    } catch (e) {
      reject(e)
    } finally {
      document.body.removeChild(textarea)
    }
  })
}

function 宏(props: 宏组件类型) {
  const { 宏列表 = [], 标题 } = props
  const [已复制索引, 设置已复制索引] = useState<number>(-1)

  const 复制 = async (内容: string, index: number) => {
    try {
      await 复制文本(内容)
      设置已复制索引(index)
      setTimeout(() => 设置已复制索引(-1), 2000)
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  return (
    <div className={styles['guide-macro']}>
      {标题 ? <div className={styles['guide-macro-title']}>{标题}</div> : null}
      <div className={styles['guide-macro-list']}>
        {宏列表.map((item, index) => {
          const 已复制 = 已复制索引 === index
          return (
            <div className={styles['guide-macro-item']} key={`宏_${item?.标题}_${index}`}>
              {item?.标题 ? (
                <div className={styles['guide-macro-item-title']}>{item?.标题}</div>
              ) : null}
              <div className={styles['guide-macro-item-body']}>
                <pre className={styles['guide-macro-item-text']}>{item?.内容}</pre>
                <Button
                  className={styles['guide-macro-item-copy']}
                  size='small'
                  type={已复制 ? 'primary' : 'default'}
                  icon={已复制 ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={() => 复制(item?.内容, index)}
                >
                  {已复制 ? '已复制' : '复制'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default 宏
