import React from 'react'
import { Input, Typography } from 'antd'
import type { TextAreaProps } from 'antd/es/input/TextArea'
import 样式 from './样式.module.less'

export function 宏字数({ 文本 }: { 文本: string }) {
  return <Typography.Text type='secondary'>{文本.length} UTF-16 字符</Typography.Text>
}

export default function 宏文本输入({
  显示字数 = true,
  ...属性
}: TextAreaProps & { value: string; 显示字数?: boolean }) {
  return (
    <div>
      {显示字数 && (
        <div className={样式.字数}>
          <宏字数 文本={属性.value} />
        </div>
      )}
      <Input.TextArea {...属性} className={样式.编辑器} />
    </div>
  )
}
