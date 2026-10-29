import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Spin, Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 根据id获取装备数据 } from '@/数据/装备'
import { 装备位置部位枚举, 装备属性信息模型, 装备类型枚举, 选择装备数据类型 } from '@/@types/装备'
const { Dragger } = Upload

const isLocalBuild = process.env.REACT_APP_BUILD_TYPE === 'local'

function Generator装备导入({ onOk }) {
  const { 装备数据, 附魔, 名称: 心法名称, 五彩石, 功法 } = use心法数据()
  const [loading, setLoading] = useState<boolean>(false)
  const workerRef = useRef<Worker | null>(null)
  const [解析结果, 更新解析结果] = useState<{
    最终装备对象: { [key: string]: 选择装备数据类型 }
    未支持附魔: string[]
    未支持装备: number[]
    支持的装备: 装备属性信息模型[]
  }>()

  const beforeOnOk = () => {
    if (解析结果 && Object.keys(解析结果?.最终装备对象)?.length) {
      console.log('解析结果?.最终装备对象', 解析结果?.最终装备对象)
      onOk({
        大附魔_伤帽: undefined,
        大附魔_伤衣: undefined,
        大附魔_伤腰: undefined,
        大附魔_伤腕: undefined,
        大附魔_伤鞋: undefined,
        ...解析结果?.最终装备对象,
      })
    } else {
      message.error('无成功解析数据')
    }
  }

  useEffect(() => {
    if (isLocalBuild) {
      return
    }
    // 创建 Worker 实例
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url))

    // 定义接收 Worker 消息的回调
    workerRef.current.onmessage = (event) => {
      console.log('event', event)
      if (event.data && Object.keys(event.data)?.length) {
        message.success('解析成功，请确认无误后点击导入')
        初始化装备数据(event.data)
      } else {
        更新解析结果(undefined)
        message.error('该心法不支持或解析失败')
      }
      setLoading(false)
    }

    // 清理 Worker
    return () => {
      workerRef.current?.terminate()
    }
  }, [装备数据, 附魔])

  const 初始化装备数据 = (data) => {
    const 最终装备对象: { [key: string]: 选择装备数据类型 } = {}
    const 未支持附魔: string[] = []
    const 未支持装备: number[] = []
    const 支持的装备: 装备属性信息模型[] = []
    Object.keys(data).forEach((部位索引) => {
      const 数据 = data[部位索引]
      if (部位索引?.includes('大附魔') || 部位索引?.includes('五彩石')) {
        最终装备对象[部位索引] = 数据
        return
      }
      const 装备部位 = 装备位置部位枚举[部位索引]
      const 找到对应装备 = 根据id获取装备数据(装备数据, 装备部位, 数据?.id)
      if (找到对应装备) {
        支持的装备.push({ ...找到对应装备, 装备部位 })
        let 附魔ID: number | undefined = undefined
        if (数据?.未支持附魔ID) 未支持附魔.push(数据.未支持附魔ID)
        if (数据?.附魔) {
          const 判断附魔是否存在 = 附魔?.find(
            (a) => a?.id === 数据?.附魔 && a.附魔支持部位.includes(装备部位),
          )
          if (判断附魔是否存在) {
            附魔ID = 数据?.附魔
          } else {
            未支持附魔.push(数据?.附魔)
          }
        }
        const 最大精炼等级 = 获取最大精炼等级(找到对应装备)
        最终装备对象[部位索引] = {
          id: 数据?.id,
          当前精炼等级: 最大精炼等级 || 6,
          镶嵌孔数组:
            找到对应装备?.镶嵌孔数组?.map((item, index) => {
              return {
                ...item,
                镶嵌宝石等级: 数据?.镶嵌等级?.[index],
              }
            }) || [],
          装备部位,
          附魔: 附魔ID,
        }
      } else {
        if (数据?.id) {
          未支持装备.push(数据?.id)
        }
        最终装备对象[部位索引] = {
          id: undefined,
          当前精炼等级: 6,
          镶嵌孔数组: [],
          装备部位,
          附魔: undefined,
        }
      }
    })
    更新解析结果({
      最终装备对象,
      未支持附魔,
      未支持装备,
      支持的装备,
    })
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
          try {
            const data = JSON.parse(reader.result as any)
            const firstKey = Object.keys(data)[0]
            if (firstKey !== 心法名称) {
              message.error('导入失败，请检查文件格式')
              return
            }
            workerRef.current.postMessage(
              JSON.stringify({ ...data?.[心法名称]?.gear, 全部五彩石数据: 五彩石?.[6], 功法 }),
            )
          } catch (error) {
            console.error(error)
          }
        }
      }
    }
  }

  return (
    <Spin spinning={loading} tip='解析中'>
      <div>
        <Alert
          type='warning'
          style={{ marginBottom: 12 }}
          message={'解析不一定准确，若有需要请手动调整'}
        />
        <Dragger
          name='file'
          fileList={[]}
          beforeUpload={(file) => {
            handleFileChange(file)
          }}
          className={styles.dragger}
        >
          <p className={styles.dragIconWrap}>
            <InboxOutlined className={styles.dragIcon} />
          </p>
          <p className={styles.dragText}>点击上传JCL文件</p>
        </Dragger>
        {解析结果 ? (
          <div className={styles.res}>
            {解析结果?.支持的装备?.length ? (
              <>
                <Button block type='primary' onClick={beforeOnOk} style={{ marginBottom: 12 }}>
                  导入
                </Button>
                <div className={styles.title}>成功识别 {解析结果?.支持的装备?.length} 件装备</div>
                <div className={styles.contentText}>
                  {解析结果?.支持的装备
                    ?.map((装备) => {
                      return 装备?.装备名称
                    })
                    ?.join('、')}
                </div>
              </>
            ) : null}

            {解析结果?.未支持装备?.length ? (
              <>
                <div className={styles.title}>未识别装备ID</div>
                <div className={styles.contentText}>{解析结果?.未支持装备?.join('、')}</div>
              </>
            ) : null}
            {解析结果?.未支持附魔?.length ? (
              <>
                <div className={styles.title}>未识别附魔</div>
                <div className={styles.contentText}>{解析结果?.未支持附魔?.join('、')}</div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </Spin>
  )
}

export default Generator装备导入

const 获取最大精炼等级 = (data?: 装备属性信息模型) => {
  switch (data?.装备类型) {
    case 装备类型枚举.橙武:
      return 8
    case 装备类型枚举.副本精简:
    case 装备类型枚举.特效武器:
      return 6
    case 装备类型枚举.试炼精简:
      return 6
    default:
      return 6
  }
}
