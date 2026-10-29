import React from 'react'
import { Input, Modal } from 'antd'

interface 重命名弹窗Props {
  open: boolean
  值: string
  onChange: (值: string) => void
  onCancel: () => void
  onOk: () => void
}

const 重命名弹窗: React.FC<重命名弹窗Props> = (props) => {
  const { open, 值, onChange, onCancel, onOk } = props

  return (
    <Modal
      open={open}
      title='重命名方案'
      okText='确认'
      cancelText='取消'
      onCancel={onCancel}
      onOk={onOk}
    >
      <Input placeholder='请输入方案名称' value={值} onChange={(e) => onChange(e.target.value)} />
    </Modal>
  )
}

export default React.memo(重命名弹窗)
