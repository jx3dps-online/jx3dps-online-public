import React, { Suspense, useMemo, useState } from 'react'
import { Button, Input } from 'antd'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import type { 气泡数据 } from '../hooks/use状态机'
import type { 经典问题 } from '../interface'
import styles from './气泡.module.less'

interface 气泡参数 {
  气泡数据: 气泡数据
  宽?: number
  主题色?: string
  朝向?: '上' | '下'
  箭头偏移X?: number
  on选择问题: (问题: 经典问题) => void
  on返回问题列表: () => void
  on关闭: () => void
}

const 气泡: React.FC<气泡参数> = ({
  气泡数据,
  宽 = 280,
  主题色,
  朝向 = '下',
  箭头偏移X = 0,
  on选择问题,
  on返回问题列表,
  on关闭,
}) => {
  const [关键词, 设置关键词] = useState('')
  const [栏目展开状态, 设置栏目展开状态] = useState<Record<string, boolean>>({})

  const 过滤后问题 = useMemo(() => {
    if (气泡数据.类型 !== '问题列表') {
      return []
    }
    const 列表 = 气泡数据.问题列表 || []
    const 带编号问题 = 列表.map((问题, 索引) => ({ 问题, 编号: 索引 + 1 }))
    if (!关键词.trim()) {
      return 带编号问题
    }
    const 小写关键词 = 关键词.trim().toLowerCase()
    return 带编号问题.filter(({ 问题 }) => {
      const 关键词列表 = [问题.标题, ...(问题.关键词 || [])]
      return 关键词列表.some((词) => 词?.toLowerCase()?.includes(小写关键词))
    })
  }, [气泡数据, 关键词])

  const 心法名称 = 气泡数据.问题列表?.find((问题) => 问题.所属心法)?.所属心法
  const 使用衍天分组 = 心法名称 === '太玄经'
  const 问题栏目 = 心法名称
    ? [
        {
          标题: 使用衍天分组 ? '衍天问题' : `${心法名称}答疑`,
          问题: 过滤后问题.filter(({ 问题 }) => 问题.所属心法),
        },
        {
          标题: 使用衍天分组 ? '公共问题' : '公用问题',
          问题: 过滤后问题.filter(({ 问题 }) => !问题.所属心法),
        },
      ]
    : [{ 标题: '', 问题: 过滤后问题 }]

  const 主动消息 = 气泡数据.主动消息
  const 消息内容组件 = useMemo(() => {
    if (!主动消息?.内容组件) {
      return null
    }
    return React.lazy(主动消息.内容组件)
  }, [主动消息])

  const 答案内容 = 气泡数据.答案内容
  const 答案组件 = useMemo(
    () => (答案内容?.内容组件 ? React.lazy(答案内容.内容组件) : null),
    [答案内容],
  )

  const 箭头样式: React.CSSProperties = {
    left: '50%',
    marginLeft: 箭头偏移X,
    ...(朝向 === '下'
      ? {
          bottom: -8,
          borderRight: '1px solid #d9d9d9',
          borderBottom: `1px solid ${主题色}`,
        }
      : {
          top: -8,
          borderLeft: '1px solid #d9d9d9',
          borderTop: `1px solid ${主题色}`,
        }),
  }

  return (
    <div className={styles.bubble} data-pet-bubble style={{ width: 宽, borderColor: 主题色 }}>
      <div className={styles.bubbleArrow} style={箭头样式} />
      <div className={styles.bubbleClose} onClick={on关闭}>
        <CloseOutlined />
      </div>

      {气泡数据.类型 === '主动消息' && (
        <div className={styles.bubbleMessage}>
          {主动消息?.文本}
          {消息内容组件 ? (
            <Suspense fallback={null}>
              <消息内容组件 />
            </Suspense>
          ) : null}
        </div>
      )}

      {气泡数据.类型 === '问题列表' && (
        <div id='Guide_桌宠问题' className={styles.bubbleQuestionList}>
          <Input
            className={styles.bubbleSearch}
            prefix={<SearchOutlined />}
            placeholder='搜索问题或关键词'
            allowClear
            value={关键词}
            onChange={(事件) => 设置关键词(事件.target.value)}
          />
          <div className={styles.bubbleQuestions}>
            {问题栏目
              .filter((栏目) => 栏目.问题.length > 0)
              .map((栏目) => {
                const 问题条目 = 栏目.问题.map(({ 问题, 编号 }, 索引) => {
                  const 带编号标题 = `${栏目.标题 ? 索引 + 1 : 编号}. ${问题.标题}`
                  return (
                    <div
                      key={带编号标题}
                      className={styles.bubbleQuestion}
                      onClick={() => on选择问题({ ...问题, 标题: 带编号标题 })}
                    >
                      {带编号标题}
                    </div>
                  )
                })
                if (使用衍天分组) {
                  return (
                    <details
                      key={栏目.标题}
                      open={!!关键词.trim() || !!栏目展开状态[栏目.标题]}
                      onToggle={(事件) => {
                        if (关键词.trim()) return
                        const 展开 = 事件.currentTarget.open
                        设置栏目展开状态((当前) => ({ ...当前, [栏目.标题]: 展开 }))
                      }}
                    >
                      <summary>
                        <strong>{栏目.标题}</strong>
                      </summary>
                      {问题条目}
                    </details>
                  )
                }
                const 栏目容器 = 栏目.标题 ? 'section' : React.Fragment
                return (
                  <栏目容器 key={栏目.标题}>
                    {栏目.标题 && <strong>{栏目.标题}</strong>}
                    {问题条目}
                  </栏目容器>
                )
              })}
            {过滤后问题.length === 0 && (
              <div className={styles.bubbleEmpty}>没有找到相关问题，试试其他关键词。</div>
            )}
          </div>
        </div>
      )}

      {气泡数据.类型 === '答案' &&
        (答案内容 ? (
          <div className={styles.bubbleAnswer}>
            <strong>{气泡数据.答案}</strong>
            <div className={styles.bubbleAnswerContent}>
              {答案组件 ? (
                <Suspense fallback={<p>加载中…</p>}>
                  <答案组件 />
                </Suspense>
              ) : (
                答案内容.内容
              )}
            </div>
            <Button type='link' size='small' onClick={on返回问题列表}>
              返回问题列表
            </Button>
          </div>
        ) : (
          <div className={styles.bubbleMessage}>{气泡数据.答案}</div>
        ))}
    </div>
  )
}

export default 气泡
