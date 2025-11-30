import { Button, Modal, Timeline } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import log_data from '@/更新日志'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import 心法枚举 from '@/数据/静态数据/心法枚举.json'
import { useAppDispatch } from '@/hooks'
import { 更新当前引导步骤, 更新新手引导流程状态 } from '@/store/system'
import 计算记录对比 from './计算记录对比'
import './index.css'

const { 缓存映射 } = 获取当前数据()

function Log() {
  const dispatch = useAppDispatch()

  // 更新日志
  const [visible, setVisible] = useState(false)
  // 新版本公告
  const [newVersionModalVisible, setNewVersionModalVisible] = useState(false)
  // 使用须知
  const [noticeVisible, setNoticeVisible] = useState(false)
  // 问卷调查
  // const [questionVisible, setQuestionVisible] = useState(false)
  // const 强制通知 = true

  useEffect(() => {
    checkLogVersion()
    checkNotice()
  }, [])

  const 检查有无进行过引导 = () => {
    const storageData = localStorage.getItem(缓存映射.新手引导)
    if (!storageData) {
      dispatch(更新新手引导流程状态(true))
    }
  }

  const checkLogVersion = () => {
    const storageVersion = localStorage.getItem(缓存映射.日志版本)
    const storageNotice = localStorage.getItem(缓存映射.使用说明)
    if (storageNotice && (!storageVersion || storageVersion !== log_data?.[0]?.version)) {
      setNewVersionModalVisible(true)
    }
  }

  const checkNotice = () => {
    const storageNotice = localStorage.getItem(缓存映射.使用说明)
    if (!storageNotice) {
      setNoticeVisible(true)
    }
  }

  const handleCloseNew = () => {
    localStorage?.setItem(缓存映射.日志版本, log_data?.[0]?.version)
    setNewVersionModalVisible(false)
    检查有无进行过引导()
  }

  const handleCloseNotice = () => {
    localStorage?.setItem(缓存映射.使用说明, '1')
    setNoticeVisible(false)
    dispatch(更新新手引导流程状态(true))
    dispatch(更新当前引导步骤(0))
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

  return (
    <div className='log-wrap'>
      <span>当前版本: {log_data?.[0]?.version}</span>
      {/* <span onClick={() => setNoticeVisible(true)}>使用前声明</span> */}
      <span className='log' onClick={() => setVisible(true)}>
        更新日志
      </span>
      {/* 新版本公告 */}
      <Modal
        className='new-log-modal'
        width={800}
        title='新版本公告'
        centered
        open={newVersionModalVisible}
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
              {Array.isArray(log_data?.[0].content)
                ? log_data?.[0].content.map((a, index) => {
                    return (
                      <div key={`${log_data[0]?.date}${index}`} className='log-content-item'>
                        <LogItem data={a} />
                      </div>
                    )
                  })
                : log_data?.[0].content}
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
        title={
          <div>
            <span>更新日志</span>
            <Button
              onClick={() => {
                setVisible(false)
                setNewVersionModalVisible(true)
              }}
              type='link'
            >
              新版本公告
            </Button>
          </div>
        }
        centered
        className='log-modal'
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Timeline className={'log-line'}>
          {log_data.map((item) => {
            return (
              <Timeline.Item key={item.version}>
                <div className='log-content-text'>
                  {Array.isArray(item.content)
                    ? item.content.map((a: any, index) => {
                        return (
                          <div key={`${item.date}${index}`} className='log-content-item'>
                            <LogItem data={a} />
                          </div>
                        )
                      })
                    : item.content}
                </div>
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
        onCancel={handleCloseNotice}
        maskClosable={false}
        title='声明'
        closable={false}
        centered
        footer={
          <Button onClick={handleCloseNotice} type='primary'>
            使用本计算器则视作你已经知晓并同意此声明。
          </Button>
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
