import React, { useState } from 'react'
import { Button, Checkbox, Modal } from 'antd'
import { BookOutlined } from '@ant-design/icons'
import './攻略弹窗.css'

interface 攻略引导弹窗类型 {
  打开: boolean
  关闭: () => void
  立即查看: () => void
  设置不再提示: () => void
}

function 攻略引导弹窗(props: 攻略引导弹窗类型) {
  const { 打开, 关闭, 立即查看, 设置不再提示 } = props
  const [不再提示, 设置勾选] = useState(false)

  const 处理关闭 = () => {
    if (不再提示) 设置不再提示()
    关闭()
  }

  const 处理立即查看 = () => {
    if (不再提示) 设置不再提示()
    立即查看()
  }

  return (
    <Modal
      open={打开}
      onCancel={处理关闭}
      title='循环攻略'
      width={420}
      centered
      destroyOnHidden
      footer={
        <div className='jx3-guide-tip-footer'>
          <Checkbox checked={不再提示} onChange={(e) => 设置勾选(e.target.checked)}>
            不再提示
          </Checkbox>
          <div className='jx3-guide-tip-btns'>
            <Button onClick={处理关闭}>知道了</Button>
            <Button type='primary' icon={<BookOutlined />} onClick={处理立即查看}>
              立刻查看
            </Button>
          </div>
        </div>
      }
    >
      <p>当前循环已配置专属攻略，可查看输出手法、奇穴与配装推荐。</p>
    </Modal>
  )
}

export default 攻略引导弹窗
