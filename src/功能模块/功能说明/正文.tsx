import React from 'react'
import type { 行内内容, 正文块, 说明定位 } from './类型'

export default function 正文({
  内容,
  on定位,
}: {
  内容: 正文块[]
  on定位: (定位: 说明定位) => void
}) {
  const 行内 = (内容: 行内内容[]) =>
    内容.map((项, 索引) => {
      switch (项.类型) {
        case '强调':
          return <strong key={索引}>{项.文本}</strong>
        case '斜体':
          return <em key={索引}>{项.文本}</em>
        case '代码':
          return <code key={索引}>{项.文本}</code>
        case '图片':
          return <img key={索引} src={项.地址} alt={项.文本} loading='lazy' />
        case '链接':
        case '说明链接': {
          const 左侧内容 = 内容[索引 - 1]
          const 右侧内容 = 内容[索引 + 1]
          const 链接间距 = {
            marginLeft: 左侧内容 && 左侧内容.类型 !== '图片' && 左侧内容.文本.trim() ? 4 : 0,
            marginRight: 右侧内容 && 右侧内容.类型 !== '图片' && 右侧内容.文本.trim() ? 4 : 0,
          }
          return 项.类型 === '说明链接' ? (
            <button
              key={索引}
              type='button'
              style={链接间距}
              onClick={() => on定位({ 文档: 项.文档, 章节: 项.章节 })}
            >
              {项.文本}
            </button>
          ) : (
            <a key={索引} href={项.地址} target='_blank' rel='noopener noreferrer' style={链接间距}>
              {项.文本}
            </a>
          )
        }
        default:
          return <React.Fragment key={索引}>{项.文本}</React.Fragment>
      }
    })
  return (
    <>
      {内容.map((块, 索引) => {
        switch (块.类型) {
          case '标题':
            return <h3 key={索引}>{行内(块.内容)}</h3>
          case '段落':
            return <p key={索引}>{行内(块.内容)}</p>
          case '代码块':
            return (
              <pre key={索引}>
                <code>{块.文本}</code>
              </pre>
            )
          case '列表': {
            const 标签 = 块.有序 ? 'ol' : 'ul'
            return (
              <标签 key={索引}>
                {块.项.map((项, 序号) => (
                  <li key={序号}>{行内(项)}</li>
                ))}
              </标签>
            )
          }
          case '表格':
            return (
              <div key={索引} style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      {块.表头.map((项, 序号) => (
                        <th key={序号}>{行内(项)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {块.行.map((行, 行号) => (
                      <tr key={行号}>
                        {行.map((项, 列号) => (
                          <td key={列号}>{行内(项)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      })}
    </>
  )
}
