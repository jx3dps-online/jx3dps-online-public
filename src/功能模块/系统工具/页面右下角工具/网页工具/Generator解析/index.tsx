import React, { useState } from 'react'
import { Button, Upload, message } from 'antd'
import { 循环详情 } from '@/@types/循环'
import 保存循环弹窗 from './保存循环弹窗'
import styles from './index.module.less'
import { use心法数据 } from '@/心法模块/心法上下文'
import { InboxOutlined } from '@ant-design/icons'
import 解析Generator主函数 from './tool'

const { Dragger } = Upload

function Generator解析() {
  const { 名称: 心法名称 } = use心法数据()
  const [结果数据, 更新结果数据] = useState<循环详情>()
  const [奇穴数据, 更新奇穴数据] = useState<string[]>()
  const [异常数据, 更新异常数据] = useState<any>()
  const [导入循环保存弹窗, 设置导入循环保存弹窗] = useState<boolean>(false)

  /**
   * @name 拖拽解析文件
   */
  const handleFileChange = (file) => {
    const reader: any = new FileReader()
    reader.readAsText(file, 'json')
    reader.onload = () => {
      if (reader.result) {
        try {
          const data = JSON.parse(reader?.result)
          const firstKey = Object.keys(data)[0]
          if (firstKey !== 心法名称) {
            message.error('导入失败，请检查文件格式')
            return
          }
          handleFileLoader(data?.[心法名称])
        } catch (error) {
          console.log('error', error)
          message.error('解析错误，请检查文件')
        }
      }
    }
  }

  console.log('异常数据', 异常数据)

  /**
   * 执行解析脚本
   */
  const handleFileLoader = (data) => {
    const { talentData, loopData, totalDuration, notFoundSkill, notFoundBuff } =
      解析Generator主函数(data)
    const 循环详情 = { 战斗时间: totalDuration, 技能详情: loopData }
    更新结果数据(循环详情)
    更新奇穴数据(talentData)
    更新异常数据({
      buff: notFoundBuff,
      skill: notFoundSkill,
    })
    console.info('异常数据', {
      buff: notFoundBuff,
      skill: notFoundSkill,
    })
  }

  /**
   * 复制结果
   */
  const copy = () => {
    const res = document.getElementById('tools-generator-result')
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
        document.body.removeChild(input)
      }
    }
  }

  return (
    <div>
      <div className={styles.btns}>
        <Button
          type='primary'
          disabled={!结果数据}
          className={styles.btn}
          onClick={() => 设置导入循环保存弹窗(true)}
        >
          保存循环
        </Button>
        <Button disabled={!结果数据} className={styles.btn} onClick={copy}>
          复制
        </Button>
        <Button
          disabled={!结果数据}
          className={styles.btn}
          danger
          onClick={() => 更新结果数据(undefined)}
        >
          重新导入
        </Button>
      </div>
      {结果数据 ? (
        <>
          <div className={styles.result}>{奇穴数据?.join(',')}</div>
          <div id='tools-generator-result' className={styles.result}>
            {JSON.stringify(结果数据)}
          </div>
        </>
      ) : (
        <Dragger
          name='file'
          fileList={[]}
          beforeUpload={(file) => {
            handleFileChange(file)
          }}
        >
          <div className={styles.dragger}>
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>点击上传 Generator 的 Json 产物</p>
          </div>
        </Dragger>
      )}
      <保存循环弹窗
        导入循环保存弹窗={导入循环保存弹窗}
        设置导入循环保存弹窗={设置导入循环保存弹窗}
        目标心法={心法名称}
        结果数据={结果数据}
        奇穴数据={奇穴数据}
        // 原始数据={原始数据}
      />
    </div>
  )
}

export default Generator解析
