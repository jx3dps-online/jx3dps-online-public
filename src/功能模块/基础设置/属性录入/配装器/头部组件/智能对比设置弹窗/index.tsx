import { Checkbox, Divider, Modal, Space, Tooltip } from 'antd'
import React from 'react'

const 智能对比设置弹窗 = (props) => {
  const { 对比显示百分比, 设置对比显示百分比, 对比加速, 设置对比加速, open, onCancel } = props

  return (
    <Modal
      title={'智能对比设置'}
      footer={false}
      open={open}
      width={460}
      onCancel={() => onCancel()}
    >
      <Space style={{ paddingTop: 12 }} split={<Divider type='vertical' />}>
        <div>
          <Checkbox
            checked={对比显示百分比}
            onChange={(e) => 设置对比显示百分比(e?.target?.checked)}
          >
            <div>差异按百分比显示</div>
          </Checkbox>
        </div>
        <Checkbox checked={对比加速} onChange={(e) => 设置对比加速(e?.target?.checked)}>
          <Tooltip title={'关闭后，若该部位为加速装备，则非加速装备不会参与智能对比；反之同理'}>
            <div>允许跨加速对比</div>
          </Tooltip>
        </Checkbox>
      </Space>
    </Modal>
  )
}

export default 智能对比设置弹窗
