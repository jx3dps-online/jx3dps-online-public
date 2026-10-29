import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Spin, message } from 'antd'

function 奇穴导入() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    form?.setFieldsValue({
      timeLine: undefined,
    })
  }, [])

  const 获取并复制 = async () => {
    form.validateFields().then(async (values) => {
      setLoading(true)
      try {
        const list = JSON.parse(values?.timeLine)?.map((a) => a[0])
        const resTime = Math.max(...list)
        copy(resTime / 16)
      } catch (error) {
        console.log('error', error)
      }
      setLoading(false)
    })
  }

  const copy = (text) => {
    if (text) {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.setAttribute('value', text)
      input.select()
      document.execCommand('copy') // 执行浏览器复制命令
      if (document.execCommand('copy')) {
        document.execCommand('copy')
        message.success(`复制成功：${text}s`)
      }
      // if (text?.includes('未匹配')) {
      //   message.warning('存在未匹配装备')
      // }
      document.body.removeChild(input)
    }
  }

  return (
    <div>
      <Spin spinning={loading}>
        <Form form={form} className={'tools-qixue-params'} layout='vertical'>
          <Form.Item name='timeLine' label='timeLine' required>
            <Input.TextArea className={'tool-qixue-input-area'} />
          </Form.Item>
        </Form>
        <div className={'tools-qixue-btns'}>
          <Button type='primary' className='tools-qixue-btn' onClick={获取并复制}>
            获取并复制
          </Button>
        </div>
      </Spin>
    </div>
  )
}

export default 奇穴导入
