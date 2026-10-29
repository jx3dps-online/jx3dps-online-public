import React, { useLayoutEffect, useRef } from 'react'
import { Button, InputNumber, message, Space, Tooltip } from 'antd'
import { 清洗富文本, 安全地址 } from './富文本转换'
import styles from './index.module.less'

export default function 富文本({
  值,
  更新,
  紧凑 = false,
}: {
  值: string
  更新: (值: string) => void
  紧凑?: boolean
}) {
  const 容器 = useRef<HTMLDivElement>(null)
  const 选区 = useRef<Range | null>(null)
  const 最后输入 = useRef<string>()
  const 正在输入 = useRef(false)
  useLayoutEffect(() => {
    if (容器.current && 值 !== 最后输入.current) 容器.current.innerHTML = 清洗富文本(值)
    最后输入.current = 值
  }, [值])
  const 记选区 = () => {
    const 当前 = window.getSelection()
    if (当前?.rangeCount && 容器.current?.contains(当前.getRangeAt(0).commonAncestorContainer))
      选区.current = 当前.getRangeAt(0).cloneRange()
  }
  const 保存 = () => {
    if (正在输入.current) return
    try {
      const 内容 = 清洗富文本(容器.current?.innerHTML || '')
      最后输入.current = 内容
      更新(内容)
      记选区()
    } catch (错误) {
      message.error((错误 as Error).message)
    }
  }
  const 恢复 = () => {
    if (!选区.current || !容器.current?.contains(选区.current.commonAncestorContainer)) {
      容器.current?.focus()
      return false
    }
    const 当前 = window.getSelection()!
    当前.removeAllRanges()
    当前.addRange(选区.current)
    return true
  }
  const 格式 = (命令: string) => {
    if (!恢复()) return
    if (命令 === 'link') {
      const 地址 = window.prompt('链接地址（http / https）')
      if (地址 === null) return
      try {
        document.execCommand('createLink', false, 安全地址(地址))
      } catch (错误) {
        message.error((错误 as Error).message)
        return
      }
    } else document.execCommand(命令)
    保存()
  }
  const 包裹 = (标签: string, 样式: Partial<CSSStyleDeclaration> = {}) => {
    if (!恢复() || 选区.current!.collapsed) return
    const 范围 = 选区.current!
    const 元素 = document.createElement(标签)
    Object.assign(元素.style, 样式)
    const 内容 = 范围.extractContents()
    内容.querySelectorAll<HTMLElement>('[style]').forEach((项) =>
      Object.keys(样式).forEach((键) => {
        项.style[键] = ''
      }),
    )
    元素.appendChild(内容)
    范围.insertNode(元素)
    范围.selectNodeContents(元素)
    if (样式.fontSize) {
      const 基准 = Number.parseFloat(getComputedStyle(容器.current!).fontSize)
      const 父级 = Number.parseFloat(getComputedStyle(元素.parentElement!).fontSize)
      元素.style.fontSize = `${(Number.parseFloat(样式.fontSize) * 基准) / 父级}%`
    }
    选区.current = 范围
    恢复()
    保存()
  }
  return (
    <div className={`${styles.富文本} ${紧凑 ? styles.紧凑 : ''}`}>
      <div
        className={styles.格式栏}
        onMouseDown={(事件) => {
          if (!(事件.target instanceof HTMLInputElement)) 事件.preventDefault()
        }}
      >
        <Space size={2} wrap>
          {(
            [
              ['B', 'bold', '加粗'],
              ['I', 'italic', '斜体'],
              ['U', 'underline', '下划线'],
              ['S', 'strikeThrough', '删除线'],
              ['链接', 'link', '添加链接'],
              ['清格式', 'removeFormat', '清除格式'],
            ] as const
          ).map(([名, 命令, 提示]) => (
            <Tooltip title={提示} key={命令}>
              <Button size='small' type='text' onClick={() => 格式(命令)}>
                {名}
              </Button>
            </Tooltip>
          ))}
          <Button size='small' type='text' onClick={() => 包裹('mark')}>
            高亮
          </Button>
          <Button size='small' type='text' onClick={() => 包裹('code')}>
            代码
          </Button>
          <InputNumber
            aria-label='字号百分比'
            size='small'
            min={50}
            max={300}
            defaultValue={100}
            step={5}
            style={{ width: 70 }}
            onChange={(值) => {
              if (值) 包裹('span', { fontSize: `${值}%` })
            }}
          />
          <span>%</span>
          <label title='文字颜色'>
            字{' '}
            <input
              aria-label='文字颜色'
              type='color'
              defaultValue='#c0392b'
              onChange={(事件) => 包裹('span', { color: 事件.target.value })}
            />
          </label>
          <label title='文字底色'>
            底{' '}
            <input
              aria-label='文字底色'
              type='color'
              defaultValue='#fff3bf'
              onChange={(事件) => 包裹('span', { backgroundColor: 事件.target.value })}
            />
          </label>
        </Space>
      </div>
      <div
        ref={容器}
        contentEditable
        suppressContentEditableWarning
        role='textbox'
        aria-label='富文本内容'
        aria-multiline
        tabIndex={0}
        className={styles.输入正文}
        onMouseUp={记选区}
        onKeyUp={记选区}
        onInput={保存}
        onBlur={保存}
        onCompositionStart={() => {
          正在输入.current = true
        }}
        onCompositionEnd={() => {
          正在输入.current = false
          保存()
        }}
        onPaste={(事件) => {
          事件.preventDefault()
          try {
            const 富文 = 事件.clipboardData.getData('text/html')
            if (富文) document.execCommand('insertHTML', false, 清洗富文本(富文))
            else document.execCommand('insertText', false, 事件.clipboardData.getData('text/plain'))
            保存()
          } catch (错误) {
            message.error((错误 as Error).message)
          }
        }}
        onDrop={(事件) => 事件.preventDefault()}
      />
    </div>
  )
}
