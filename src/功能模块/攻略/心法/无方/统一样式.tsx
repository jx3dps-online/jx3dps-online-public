import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useRef } from 'react'
import 奇穴展示 from '../../components/展示/奇穴展示'
import 连招 from '../../components/连招'
import styles from './统一样式.module.less'

function 标题文字(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (isValidElement(node)) return 标题文字(node.props.children)
  return Children.toArray(node).map(标题文字).join('')
}

// 保留原文与标题层级，只为明确的结构添加样式，不推断攻略结论。
export default function 无方攻略排版({ children }: { children: ReactNode }) {
  const 正文 = useRef<HTMLElement>(null)
  const 导航: { id: string; text: string; level: string }[] = []
  const 排版 = (nodes: ReactNode): ReactNode =>
    Children.map(nodes, (node) => {
      if (!isValidElement(node)) return node
      const element = node as ReactElement<any>
      if (element.type === 'h2' || element.type === 'h3') {
        const id = `wufang-section-${导航.length + 1}`
        导航.push({ id, text: 标题文字(element.props.children), level: element.type })
        return cloneElement(element, {
          id,
          tabIndex: -1,
          className:
            element.type === 'h2'
              ? [element.props.className, styles.chapter].filter(Boolean).join(' ')
              : element.props.className,
        })
      }
      if (element.type === 'h1') return <header className={styles.hero}>{element}</header>
      if (element.type === 奇穴展示) return <div className={styles.talents}>{element}</div>
      if (element.type === 连招) return <div className={styles.combo}>{element}</div>
      if (typeof element.type === 'string' && element.props.children) {
        const className =
          element.type === 'blockquote'
            ? styles.note
            : element.type === 'pre'
              ? styles.sequence
              : ''
        return cloneElement(
          element,
          {
            className: [element.props.className, className].filter(Boolean).join(' ') || undefined,
          },
          排版(element.props.children),
        )
      }
      return node
    })
  const 内容 = 排版(children)
  return (
    <article className={styles.guide} ref={正文}>
      {导航.length ? (
        <details className={styles.navigation} open>
          <summary>章节导航</summary>
          <nav aria-label='无方攻略章节'>
            {导航
              .filter(({ level }) => level === 'h2')
              .map(({ id, text }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    const section = 正文.current?.querySelector<HTMLElement>(`#${id}`)
                    section?.scrollIntoView({ block: 'start', behavior: 'auto' })
                    section?.focus({ preventScroll: true })
                  }}
                >
                  {text}
                </a>
              ))}
          </nav>
        </details>
      ) : null}
      {内容}
    </article>
  )
}
