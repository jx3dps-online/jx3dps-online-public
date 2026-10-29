import React from 'react'
import { Input, Modal } from 'antd'

interface 导入弹窗Props {
  open: boolean
  文本: string
  on文本变化: (文本: string) => void
  onCancel: () => void
  onOk: () => void
}

const 导入弹窗: React.FC<导入弹窗Props> = (props) => {
  const { open, 文本, on文本变化, onCancel, onOk } = props

  return (
    <Modal
      open={open}
      title='导入 JSON'
      okText='导入'
      cancelText='取消'
      onCancel={onCancel}
      onOk={onOk}
    >
      <Input.TextArea
        rows={8}
        placeholder='粘贴方案 JSON 内容'
        value={文本}
        onChange={(e) => on文本变化(e.target.value)}
      />
    </Modal>
  )
}

export default React.memo(导入弹窗)
