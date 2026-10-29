import { Modal } from 'antd'
import React from 'react'
import 技能增益查询 from './index'

interface Props {
  open: boolean
  onCancel: () => void
}

const 弹窗入口: React.FC<Props> = ({ open, onCancel }) => {
  return (
    <Modal
      title='技能增益查询'
      centered
      width='95%'
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      styles={{
        body: { maxHeight: 'calc(100vh - 180px)', overflow: 'auto' },
      }}
    >
      <技能增益查询 />
    </Modal>
  )
}

export default 弹窗入口
