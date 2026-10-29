import React, { useEffect } from 'react'
import { Form, Input, Modal, message } from 'antd'
import { 读取角色注册表 } from '@/角色/注册表'
import type { 角色元数据 } from '@/角色/类型'

interface 角色另存为弹窗Props {
  源角色?: 角色元数据
  open: boolean
  onCancel: () => void
  onSuccess: (角色: 角色元数据) => void
  另存为: (源: 角色元数据, 名称: string) => 角色元数据 | Promise<角色元数据>
}

/** 默认名「原名 - 副本」，超 20 字截断，重名自动加序号。 */
const 生成默认名称 = (源: 角色元数据) => {
  const 已有 = 读取角色注册表().列表
  let 序号 = 1
  let 名称 = ''
  do {
    const 后缀 = 序号 === 1 ? ' - 副本' : ` - 副本${序号}`
    名称 = 源.名称.slice(0, 20 - 后缀.length) + 后缀
    序号++
  } while (已有.some((项) => 项.心法 === 源.心法 && 项.名称 === 名称))
  return 名称
}

function 角色另存为弹窗(props: 角色另存为弹窗Props) {
  const { 源角色, open, onCancel, onSuccess, 另存为 } = props
  const [表单] = Form.useForm()

  useEffect(() => {
    if (open && 源角色) {
      表单.setFieldsValue({ 名称: 生成默认名称(源角色) })
    }
  }, [open, 源角色, 表单])

  const 提交 = async () => {
    if (!源角色) return
    try {
      const 值 = await 表单.validateFields()
      const 新角色 = await 另存为(源角色, 值.名称)
      onSuccess(新角色)
    } catch (错误) {
      if (错误 instanceof Error) message.error(错误.message)
    }
  }

  return (
    <Modal
      title='另存为新角色'
      open={open}
      onCancel={onCancel}
      onOk={提交}
      okText='创建'
      cancelText='取消'
      width={420}
      zIndex={1200}
      forceRender
    >
      <Form form={表单} layout='vertical'>
        <Form.Item
          label='角色名'
          name='名称'
          rules={[
            { required: true, message: '请填写角色名' },
            { max: 20, message: '角色名最多 20 个字符' },
          ]}
        >
          <Input placeholder='计算器内显示的角色名' maxLength={20} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default 角色另存为弹窗
