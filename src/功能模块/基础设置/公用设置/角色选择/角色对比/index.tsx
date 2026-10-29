import React, { useEffect, useState } from 'react'
import { Alert, Modal, Spin } from 'antd'
import type { 对比输入, 对比数据 } from './类型'
import { 准备对比数据 } from './输入'
import 对比内容 from './对比内容'

export default function 角色对比({ 输入, 关闭 }: { 输入: 对比输入; 关闭: () => void }) {
  const [数据, 设置数据] = useState<对比数据>()
  const [错误, 设置错误] = useState('')
  useEffect(() => {
    let 有效 = true
    准备对比数据(输入)
      .then((数据) => {
        if (有效) 设置数据(数据)
      })
      .catch((错误) => {
        if (有效) 设置错误(错误 instanceof Error ? 错误.message : '读取对比数据失败')
      })
    return () => {
      有效 = false
    }
  }, [输入])
  return (
    <Modal
      open
      title={`角色对比 · ${输入.角色[0].心法}`}
      onCancel={关闭}
      footer={null}
      width='94vw'
      zIndex={1300}
      style={{ top: 24, paddingBottom: 24 }}
    >
      {错误 ? (
        <Alert type='error' message={错误} />
      ) : 数据 ? (
        <对比内容 数据={数据} />
      ) : (
        <Spin tip='正在读取配装和心法数据…'>
          <div style={{ minHeight: 100 }} />
        </Spin>
      )}
    </Modal>
  )
}
