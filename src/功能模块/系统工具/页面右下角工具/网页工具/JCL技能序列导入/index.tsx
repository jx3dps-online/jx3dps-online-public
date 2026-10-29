import React, { useEffect, useRef, useState } from 'react'
import { Button, Spin, Upload, message } from 'antd'
// import { JCL技能序列导入 } from './JCL技能序列导入'
import { InboxOutlined } from '@ant-design/icons'
import './index.css'
import { downloadCSV } from '@/工具函数/help'
const { Dragger } = Upload

const isLocalBuild = process.env.REACT_APP_BUILD_TYPE === 'local'

function JclSkillDaoru() {
  const [loading, setLoading] = useState<boolean>(false)
  const [shuju, setShuju] = useState<any>()
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    if (isLocalBuild) {
      return
    }
    // 创建 Worker 实例
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url))

    // 定义接收 Worker 消息的回调
    workerRef.current.onmessage = (event) => {
      if (event.data?.length) {
        setShuju(event.data?.join(','))
      } else {
        message.error('该心法不支持或解析失败')
      }
      setLoading(false)
    }

    // 清理 Worker
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const copy = () => {
    const res = document.getElementById('tools-daoru-zhuangbei-result')
    if (res) {
      const text = res?.innerHTML
      if (text) {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.setAttribute('value', text)
        input.select()
        document.execCommand('copy') // 执行浏览器复制命令
        if (document.execCommand('copy')) {
          document.execCommand('copy')
          message.success('复制成功')
        }
        if (text?.includes('未匹配')) {
          message.warning('存在未匹配装备')
        }
        document.body.removeChild(input)
      }
    }
  }

  const handleFileChange = (e) => {
    if (isLocalBuild) {
      message.info('本地版本暂不支持该导入功能，请使用网页版')
      return
    }
    const file = e
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      if (reader.result) {
        setLoading(true)
        if (workerRef.current) {
          workerRef.current.postMessage(reader.result)
        }
      }
    }
  }

  const download = () => {
    let res = shuju?.split(',')
    if (shuju?.includes('起点')) {
      let a: string[][] = []
      shuju?.split(',')?.forEach((item) => {
        if (item === '起点') {
          if (a?.length) {
            a = [...a, []]
          } else {
            a = [[]]
          }
        } else {
          if (a?.length) {
            a[a.length - 1] = [...a[a.length - 1], item]
          } else {
            a = [[item]]
          }
        }
      })
      res = a
    }
    downloadCSV(res)
  }

  return (
    <Spin spinning={loading} tip='解析中'>
      <div>
        <Dragger
          name='file'
          fileList={[]}
          beforeUpload={(file) => {
            handleFileChange(file)
          }}
          className={'tools-daoru-dragger'}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>点击上传JCL文件</p>
        </Dragger>
        <div className={'tools-daoru-btns'}>
          <Button type='primary' disabled={!shuju} className='tools-daoru-btn' onClick={copy}>
            复制
          </Button>
          <Button disabled={!shuju} className='tools-daoru-btn' onClick={download}>
            下载
          </Button>
          {/* <Button onClick={getDetail}>转换</Button> */}
        </div>
        {shuju && (
          <div id='tools-daoru-zhuangbei-result' className={'tools-daoru-result'}>
            {shuju}
          </div>
        )}
      </div>
    </Spin>
  )
}

export default JclSkillDaoru
