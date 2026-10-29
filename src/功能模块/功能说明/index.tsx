import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, ConfigProvider, Input, Select, Spin } from 'antd'
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons'
import { 使用说明目录 } from './使用说明目录'
import { 读取说明正文 } from './读取'
import { 章节适用, 检索说明 } from './检索'
import type { 说明定位, 说明正文 } from './类型'
import 正文 from './正文'
import 简写映射 from '@/心法模块/简写映射.json'
import styles from './index.module.less'

interface 说明参数 {
  定位: 说明定位
  on定位: (定位: 说明定位) => void
}

export default function 功能说明(参数: 说明参数) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#8090e0' } }}>
      <说明阅读 {...参数} />
    </ConfigProvider>
  )
}

function 说明阅读({ 定位, on定位 }: 说明参数) {
  const { 目录, 错误, 重试 } = 使用说明目录()
  const [查询, 设置查询] = useState('')
  const [正文数据, 设置正文] = useState<说明正文>()
  const [正文错误, 设置正文错误] = useState('')
  const [重试次数, 设置重试次数] = useState(0)
  const [跳转次数, 设置跳转次数] = useState(0)
  const [阅读章节, 设置阅读章节] = useState<string>()
  const 阅读区 = useRef<HTMLElement>(null)
  const 当前文档 =
    目录?.文档.find((项) => 项.标识 === 定位.文档) || (!定位.文档 ? 目录?.文档[0] : undefined)
  const 结果 = useMemo(() => (目录 ? 检索说明(目录, 查询, 定位.心法) : []), [目录, 查询, 定位.心法])
  const 跳转 = (目标: 说明定位) => {
    设置查询('')
    设置跳转次数((值) => 值 + 1)
    on定位({ ...定位, ...目标 })
  }
  const 更新阅读章节 = useCallback(() => {
    const 容器 = 阅读区.current
    if (!容器) return
    const 章节 = Array.from(容器.querySelectorAll<HTMLElement>('[data-section]'))
    const 基准线 = 容器.getBoundingClientRect().top + 80
    const 已到底 =
      容器.scrollHeight > 容器.clientHeight &&
      容器.scrollTop + 容器.clientHeight >= 容器.scrollHeight - 4
    const 当前 = 已到底
      ? 章节[章节.length - 1]
      : 章节.filter((项) => 项.getBoundingClientRect().top <= 基准线).pop() || 章节[0]
    设置阅读章节(当前?.dataset.section)
  }, [])

  useEffect(() => {
    设置正文(undefined)
    设置正文错误('')
    if (!目录 || !当前文档) return
    let 已取消 = false
    读取说明正文(目录, 当前文档)
      .then((数据) => {
        if (!已取消) 设置正文(数据)
      })
      .catch((原因) => {
        if (!已取消) 设置正文错误(原因 instanceof Error ? 原因.message : '正文加载失败，请重试。')
      })
    return () => {
      已取消 = true
    }
  }, [目录, 当前文档, 重试次数])

  useEffect(() => {
    if (!正文数据 || 查询.trim()) return
    const 章节 = 阅读区.current?.querySelectorAll<HTMLElement>('[data-section]')
    const 目标 = Array.from(章节 || []).find((项) => 项.dataset.section === 定位.章节)
    if (目标) 目标.scrollIntoView({ block: 'start' })
    else 阅读区.current?.scrollTo({ top: 0 })
    更新阅读章节()
  }, [正文数据, 定位.章节, 定位.心法, 查询, 跳转次数, 更新阅读章节])

  if (错误)
    return <Alert type='error' message={错误} action={<Button onClick={重试}>重试</Button>} />
  if (!目录) return <Spin />
  const 显示正文 = 正文数据?.文档.标识 === 当前文档?.标识 ? 正文数据 : undefined
  const 章节不存在 =
    定位.章节 &&
    当前文档 &&
    !当前文档.章节.some((项) => 项.标识 === 定位.章节 && 章节适用(项, 定位.心法))
  const 目录章节 =
    !查询.trim() && 显示正文 ? 显示正文.文档.章节.filter((章节) => 章节适用(章节, 定位.心法)) : []
  const 章节链接 = 目录章节.map((章节) => (
    <button
      key={章节.标识}
      type='button'
      className={styles.chapterLink}
      aria-current={阅读章节 === 章节.标识 ? 'location' : undefined}
      onClick={() => 跳转({ 文档: 当前文档?.标识, 章节: 章节.标识 })}
    >
      {章节.标题}
    </button>
  ))
  return (
    <div className={styles.reader}>
      <aside className={styles.navigation} aria-label='功能说明目录'>
        {process.env.REACT_APP_BUILD_TYPE !== 'local' && (
          <Button
            type='default'
            href='/'
            icon={<ArrowLeftOutlined />}
            className={styles.homeButton}
          >
            返回计算器主页
          </Button>
        )}
        <h1>功能说明</h1>
        <Select
          aria-label='说明适用心法'
          className={styles.heartSelection}
          value={定位.心法 || ''}
          options={[
            { label: '公共说明（全部心法）', value: '' },
            ...Object.values(简写映射).map((心法) => ({ label: 心法, value: 心法 })),
          ]}
          onChange={(心法) => on定位({ ...定位, 心法: 心法 || undefined })}
        />
        <Input
          aria-label='搜索功能或问题'
          placeholder='搜索功能或问题'
          suffix={<SearchOutlined aria-hidden />}
          allowClear
          value={查询}
          onChange={(事件) => 设置查询(事件.target.value)}
        />
        <Select
          className={styles.mobileNavigation}
          value={当前文档?.标识}
          placeholder='选择模块'
          options={目录.文档.map((文档) => ({ label: 文档.标题, value: 文档.标识 }))}
          onChange={(文档) => 跳转({ 文档, 章节: undefined })}
        />
        <nav className={styles.tree}>
          {目录.模块顺序.map((模块) => {
            const 模块文档 = 目录.文档.filter((文档) => 文档.模块 === 模块)
            return (
              <div key={模块}>
                {模块文档.length > 1 && <h2>{模块}</h2>}
                {模块文档.map((文档) => (
                  <button
                    key={文档.标识}
                    type='button'
                    className={styles.documentLink}
                    aria-current={当前文档?.标识 === 文档.标识 ? 'page' : undefined}
                    onClick={() => 跳转({ 文档: 文档.标识, 章节: undefined })}
                  >
                    {模块文档.length > 1 ? 文档.标题 : 模块}
                  </button>
                ))}
              </div>
            )
          })}
        </nav>
      </aside>
      <div className={styles.readingArea}>
        <main ref={阅读区} className={styles.content} onScroll={更新阅读章节}>
          {查询.trim() ? (
            <>
              <h2>搜索结果</h2>
              {!结果.length && <p>没有找到相关说明，可以换个关键词，或从目录按模块阅读。</p>}
              {结果.map(({ 文档, 章节 }) => (
                <section key={`${文档.标识}/${章节.标识}`} className={styles.searchResult}>
                  <button type='button' onClick={() => 跳转({ 文档: 文档.标识, 章节: 章节.标识 })}>
                    {文档.模块} · {章节.标题}（{章节.用途}）
                  </button>
                  <p>{章节.简答}</p>
                </section>
              ))}
            </>
          ) : !当前文档 ? (
            <Alert type='warning' message='这篇说明不存在，请从目录选择其他内容。' />
          ) : (
            <>
              <h1>{当前文档.标题}</h1>
              {!!目录章节.length && (
                <details className={styles.mobileChapters}>
                  <summary>本页目录</summary>
                  <nav aria-label='本页章节'>{章节链接}</nav>
                </details>
              )}
              {章节不存在 && (
                <Alert
                  type='warning'
                  message='该章节不存在或不适用于当前心法，下面显示本模块其他说明。'
                />
              )}
              {正文错误 ? (
                <Alert
                  type='error'
                  message={正文错误}
                  action={<Button onClick={() => 设置重试次数((值) => 值 + 1)}>重试</Button>}
                />
              ) : !显示正文 ? (
                <Spin />
              ) : (
                显示正文.文档.章节
                  .filter((章节) => 章节适用(章节, 定位.心法))
                  .map((章节) => (
                    <section key={章节.标识} data-section={章节.标识}>
                      <h2>{章节.标题}</h2>
                      <正文 内容={章节.内容} on定位={跳转} />
                    </section>
                  ))
              )}
            </>
          )}
        </main>
        {!!目录章节.length && (
          <aside className={styles.chapterNavigation} aria-label='本页目录'>
            <nav>{章节链接}</nav>
          </aside>
        )}
      </div>
    </div>
  )
}
