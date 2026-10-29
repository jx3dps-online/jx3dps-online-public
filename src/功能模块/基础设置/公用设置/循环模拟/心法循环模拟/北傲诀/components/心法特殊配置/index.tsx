import React from 'react'
import { InputNumber, Select, Space } from 'antd'
import type { 体态类型, 资源类型 } from '../../simulator/type'

interface 配置属性 {
  起手体态: 体态类型
  设置起手体态: (体态: 体态类型) => void
  起手资源: Record<资源类型, number>
  设置起手资源: (资源: Record<资源类型, number>) => void
}
export default function 心法特殊配置({ 起手体态, 设置起手体态, 起手资源, 设置起手资源 }: 配置属性) {
  return (
    <Space wrap>
      <span>起手体态</span>
      <Select
        value={起手体态}
        onChange={设置起手体态}
        options={['秀明尘身', '松烟竹雾', '雪絮金屏'].map((value) => ({ value, label: value }))}
      />
      {(['狂意', '刀魂', '气劲'] as const).map((资源) => (
        <Space key={资源}>
          <span>{资源}</span>
          <InputNumber
            min={0}
            max={100}
            value={起手资源[资源]}
            onChange={(值) => 设置起手资源({ ...起手资源, [资源]: 值 ?? 100 })}
          />
        </Space>
      ))}
    </Space>
  )
}
