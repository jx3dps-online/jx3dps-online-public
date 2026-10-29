import { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'
import React, { useState } from 'react'
import { Alert, Button, Input, message } from 'antd'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 根据id获取装备数据 } from '@/数据/装备'
import { 装备位置部位枚举, 装备属性信息模型, 选择装备数据类型 } from '@/@types/装备'
import styles from './index.module.less'

function 配装器导入({ onOk }) {
  const [待解析数据, 更新待解析数据] = useState<string>()
  const [解析结果, 更新解析结果] = useState<{
    未支持装备: number[]
    支持的装备: 装备属性信息模型[]
  }>()

  const beforeOnOk = () => {
    if (解析结果 && 解析结果?.支持的装备?.length && 待解析数据) {
      const res = JSON.parse(待解析数据 as any)
      const { 附魔 } = 获取当前数据()
      Object.keys(装备位置部位枚举).forEach((key) => {
        if (!res[key]) return
        const id = 根据附魔ID获取附魔数据(res[key].附魔, 装备位置部位枚举[key])?.id
        res[key].附魔 = 附魔?.some((item) => item.id === id) ? id : undefined
      })
      onOk({
        ...res,
      })
    } else {
      message.error('无成功解析数据')
    }
  }

  const 开始解析 = () => {
    let data
    try {
      if (待解析数据) {
        data = JSON.parse(待解析数据)
      }
    } catch (error) {
      console.error('error', error)
    }
    if (!data) {
      message.error('获取解析数据失败')
      return
    }
    const { 装备数据 } = 获取当前数据()
    const 最终装备对象: { [key: string]: 选择装备数据类型 } = {}
    const 未支持装备: number[] = []
    const 支持的装备: 装备属性信息模型[] = []
    Object.keys(data).forEach((部位索引) => {
      const 数据 = data[部位索引]
      const 装备部位 = 装备位置部位枚举[部位索引]
      const 找到对应装备 = 根据id获取装备数据(装备数据, 装备部位, 数据?.id)
      if (找到对应装备) {
        支持的装备.push({ ...找到对应装备, 装备部位 })
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
      未支持装备,
      支持的装备,
    })
  }

  return (
    <div>
      <Alert
        type='info'
        style={{ marginBottom: 12 }}
        message={'请粘贴由{在线配装器-配装导出功能}生成的代码，然后点击解析按钮'}
      />
      <Input.TextArea
        value={待解析数据}
        onChange={(e) => 更新待解析数据(e?.target?.value)}
        className={styles.textArea}
        style={{ height: 200 }}
        maxLength={5000}
      />
      <div className={styles.buttonText}>
        <Button onClick={开始解析}>解析</Button>
        {解析结果 ? (
          <Button type='primary' onClick={beforeOnOk}>
            导入
          </Button>
        ) : null}
      </div>
      {解析结果 ? (
        <div className={styles.res}>
          {解析结果?.支持的装备?.length ? (
            <>
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
        </div>
      ) : null}
    </div>
  )
}

export default 配装器导入
