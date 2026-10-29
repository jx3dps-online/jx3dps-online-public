import { Button, Modal, Timeline } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import log_data from '@/更新日志'
import { use心法数据 } from '@/心法模块/心法上下文'
import 心法枚举 from '@/数据/静态数据/心法枚举.json'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新当前引导步骤, 更新新手引导流程状态 } from '@/store/system'
import { filterLogContent } from './logFilter'
import './index.css'

function Log() {
  const { 缓存映射, 名称: 心法名称 } = use心法数据()
  const dispatch = useAppDispatch()
  const 引导开启 = useAppSelector((state) => state.system.新手引导流程状态)
  const 等待引导结束 = useRef(false)
  const 引导已经开启 = useRef(false)

  // 更新日志
  const [visible, setVisible] = useState(false)
  // 新版本公告
  const [newVersionModalVisible, setNewVersionModalVisible] = useState(false)
  const [showAll, setShowAll] = useState(false)
  // 使用须知
  const [noticeVisible, setNoticeVisible] = useState(false)
  // 问卷调查
  // const [questionVisible, setQuestionVisible] = useState(false)
  // const 强制通知 = true

  useEffect(() => {
    const 声明已读 = localStorage.getItem(缓存映射.使用说明)
    const 引导已读 = localStorage.getItem(缓存映射.新手引导)
    if (!声明已读 || !引导已读) setNoticeVisible(true)
    else checkLogVersion()
  }, [缓存映射])

  useEffect(() => {
    setShowAll(false)
  }, [心法名称])

  useEffect(() => {
    if (!等待引导结束.current) return
    if (引导开启) 引导已经开启.current = true
    else if (引导已经开启.current) {
      等待引导结束.current = false
      引导已经开启.current = false
      checkLogVersion()
    }
  }, [引导开启])

  const checkLogVersion = () => {
    const storageVersion = localStorage.getItem(缓存映射.日志版本)
    const storageNotice = localStorage.getItem(缓存映射.使用说明)
    if (storageNotice && (!storageVersion || storageVersion !== log_data?.[0]?.version)) {
      setNewVersionModalVisible(true)
    }
  }

  const handleCloseNew = () => {
    localStorage?.setItem(缓存映射.日志版本, log_data?.[0]?.version)
    setNewVersionModalVisible(false)
  }

  const handleCloseNotice = (进入引导: boolean) => {
    localStorage.setItem(缓存映射.使用说明, '1')
    setNoticeVisible(false)
    if (进入引导) {
      等待引导结束.current = true
      引导已经开启.current = false
      dispatch(更新当前引导步骤(0))
      dispatch(更新新手引导流程状态(true))
    } else {
      localStorage.setItem(缓存映射.新手引导, 'true')
      checkLogVersion()
    }
  }

  const iconMap = useMemo(() => {
    let obj = {
      综合: 'https://jx3.xoyo.com/p/zt/2023/10/26/index/favicon-200x200.png',
    }
    Object.keys(心法枚举).forEach((i) => {
      obj[心法枚举[i].name] = 心法枚举[i].icon
    })
    return obj
  }, [心法枚举])

  const LogItem = ({ data }) => {
    if (typeof data === 'string' && (data === '综合' || iconMap[data])) {
      return (
        <div className='log-title'>
          <img className='log-title-image' src={iconMap[data]} alt='' />
          <b>{data}</b>
        </div>
      )
    }
    return data
  }

  const renderLogContent = (content: React.ReactNode, date?: string) => {
    const filteredContent = showAll ? content : filterLogContent(content, 心法名称)
    return Array.isArray(filteredContent)
      ? filteredContent.map((item, index) => (
          <div key={`${date}${index}`} className='log-content-item'>
            <LogItem data={item} />
          </div>
        ))
      : filteredContent
  }

  const logTitle = (title: string, includeAnnouncementButton = false) => (
    <div className='log-modal-title'>
      <span>{title}</span>
      <div className='log-modal-title-actions'>
        <Button type='link' onClick={() => setShowAll((value) => !value)}>
          {showAll ? '只看综合和本心法' : '查看全部'}
        </Button>
        {includeAnnouncementButton && (
          <Button
            onClick={() => {
              setVisible(false)
              setShowAll(false)
              setNewVersionModalVisible(true)
            }}
            type='link'
          >
            新版本公告
          </Button>
        )}
      </div>
    </div>
  )

  const latestContent = showAll
    ? log_data?.[0]?.content
    : filterLogContent(log_data?.[0]?.content, 心法名称)

  return (
    <div className='log-wrap'>
      <span>当前版本: {log_data?.[0]?.version}</span>
      <span
        id='Guide_公告'
        className='log'
        onClick={() => {
          setShowAll(false)
          setVisible(true)
        }}
      >
        更新日志
      </span>
      {/* 新版本公告 */}
      <Modal
        className='new-log-modal'
        width={800}
        title={logTitle('新版本公告')}
        centered
        open={newVersionModalVisible && !引导开启 && !noticeVisible}
        onCancel={handleCloseNew}
        footer={
          <Button onClick={handleCloseNew} type='primary'>
            知道了
          </Button>
        }
      >
        <Timeline className={'log-line'}>
          <Timeline.Item style={{ padding: 0 }}>
            <div className='log-content-text'>
              {Array.isArray(latestContent) && latestContent.length === 0 ? (
                <div>无相关更新</div>
              ) : (
                renderLogContent(log_data?.[0].content, log_data?.[0]?.date)
              )}
            </div>
            <div className='log-right'>
              <div className='log-version'>{log_data?.[0].version}</div>
              <div className='log-date'>{log_data?.[0].date || '-'}</div>
            </div>
          </Timeline.Item>
        </Timeline>
        {/* <计算记录对比 /> */}
      </Modal>
      <Modal
        width={800}
        title={logTitle('更新日志', true)}
        centered
        className='log-modal'
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Timeline className={'log-line'}>
          {log_data.map((item) => {
            const filteredContent = showAll
              ? item.content
              : filterLogContent(item.content, 心法名称)
            if (Array.isArray(filteredContent) && filteredContent.length === 0) return null
            return (
              <Timeline.Item key={item.version}>
                <div className='log-content-text'>{renderLogContent(item.content, item.date)}</div>
                <div className='log-right'>
                  <p className='log-version'>{item.version}</p>
                  <p className='log-date'>{item.date || '-'}</p>
                </div>
              </Timeline.Item>
            )
          })}
        </Timeline>
      </Modal>
      <Modal
        width={800}
        open={noticeVisible}
        onCancel={() => handleCloseNotice(false)}
        maskClosable={false}
        title='声明'
        closable={false}
        centered
        footer={
          <>
            <Button type='text' onClick={() => handleCloseNotice(false)}>
              同意声明，暂不引导
            </Button>
            <Button type='primary' onClick={() => handleCloseNotice(true)}>
              同意声明，开始引导
            </Button>
          </>
        }
      >
        <p>计算器只是木桩/理想环境下伤害模拟，仅能用于辅助配装和收益参考。不支持出警dps。</p>
        <p>严禁使用本计算器进行跨心法/门派比较。</p>
        <p>一切数据仅供参考，最终解释权归作者所有。</p>
      </Modal>
    </div>
  )
}

export default Log
