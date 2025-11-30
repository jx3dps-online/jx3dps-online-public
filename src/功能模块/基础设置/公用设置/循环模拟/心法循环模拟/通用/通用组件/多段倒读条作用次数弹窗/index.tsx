import React, { useEffect } from 'react'
import { Form, Modal, ModalProps, Select } from 'antd'
import { 按数字生成数组 } from '@/工具函数/help'

interface hitModalType extends ModalProps {
  onSubmit: (countHit: number) => void
  maxHit: number
  defaulValue?: number
}

const 多段倒读条作用次数弹窗: React.FC<hitModalType> = (props) => {
  const { onSubmit, maxHit, onCancel, open, defaulValue, ...rest } = props

  const [form] = Form.useForm()

  useEffect(() => {
    // 打开弹窗设置默认值
    if (open) {
      form.setFieldsValue({
        countHit: defaulValue || maxHit,
      })
    }
  }, [open, defaulValue, maxHit])

  const beforeSubmit = (e) => {
    form.validateFields().then((values) => {
      onSubmit(values.countHit)
      onCancel?.(e)
    })
  }

  return (
    <Modal
      open={open}
      title='选择多段倒读条作用次数'
      onCancel={onCancel}
      onOk={beforeSubmit}
      {...rest}
    >
      <Form form={form} style={{ paddingTop: 24 }}>
        <Form.Item
          label='实际作用跳数'
          name={'countHit'}
          required
          rules={[{ required: true, message: '请选择实际作用跳数' }]}
        >
          <Select
            options={按数字生成数组(maxHit)
              .reverse()
              ?.map((item) => {
                return { label: `${item}跳`, value: item }
              })}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default 多段倒读条作用次数弹窗
