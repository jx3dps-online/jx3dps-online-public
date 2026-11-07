import { Button, Card, Checkbox, Collapse, Input, Space, Switch } from 'antd'
import { useContext, useState } from 'react'
import type { 加速阈值分组 } from '@/@types/加速阈值'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 延迟设定 } from '@/数据/常量'
import 加速阈值选择 from '@/组件/加速阈值选择'
import CycleSimulatorContext from '../../../../context'
import 开场Buff配置弹窗 from '../心法配置/开场Buff/开场Buff配置弹窗'
import type { 待合并序列, 批量模拟配置 } from './类型'
import styles from './index.module.less'
import { 批量配置编辑 } from '../心法配置/环境'

interface 序列编辑属性 {
  序列: 待合并序列
  配置: 批量模拟配置
  阈值列表: 加速阈值分组[]
  onChange: (值: Partial<待合并序列>) => void
  onDelete: () => void
  onCopy: () => void
}

export default function 序列编辑({
  序列,
  配置,
  阈值列表,
  onChange,
  onDelete,
  onCopy,
}: 序列编辑属性) {
  const 上下文 = useContext(CycleSimulatorContext)
  const { 心法所属端 } = use心法数据()
  const [Buff设置展示, 设置Buff设置展示] = useState(false)
  return (
    <Card
      size='small'
      title={序列.名称 || '未命名序列'}
      extra={
        <Space>
          <Button onClick={onCopy}>复制</Button>
          <Button danger onClick={onDelete}>
            删除
          </Button>
        </Space>
      }
    >
      <div className={styles.表单}>
        <label>
          序列名称
          <Input
            value={序列.名称}
            onChange={(e) => onChange({ 名称: e.target.value })}
            placeholder='如：紫武长轴'
          />
        </label>
        <label>
          技能序列
          <Input.TextArea
            value={序列.文本}
            onChange={(e) => onChange({ 文本: e.target.value })}
            rows={4}
            placeholder={`粘贴以逗号分隔的序列，或技能字符串 JSON 数组；${心法所属端 === '无界' ? '悟心法按当前配装识别武器类型' : '包含“触发橙武”自动识别为橙武序列'}`}
          />
        </label>
        <Space wrap>
          <Button onClick={() => 设置Buff设置展示(true)}>
            起手 Buff（{Object.keys(序列.起手Buff配置).length}）
          </Button>
          <span>{Object.keys(序列.起手Buff配置).join('、') || '无起手 Buff'}</span>
        </Space>
        <Collapse
          items={[
            {
              key: 'config',
              label: '心法配置',
              children: 配置.渲染配置 ? (
                <div className={styles.表单}>
                  <span>
                    起手资源与延迟策略用于本次模拟；显示层数、隐藏角标等显示选项不影响计算结果。
                  </span>
                  <div className={styles.参数组}>
                    <批量配置编辑.Provider value={true}>
                      {配置.渲染配置(序列.心法配置, (修改) =>
                        onChange({ 心法配置: { ...序列.心法配置, ...修改 } }),
                      )}
                    </批量配置编辑.Provider>
                  </div>
                </div>
              ) : (
                '沿用当前模拟器的心法配置'
              ),
            },
          ]}
        />
        <Space>
          <span>保存的加速</span>
          <Switch
            checked={序列.按阈值选择}
            onChange={(按阈值选择) => onChange({ 按阈值选择 })}
            checkedChildren='选择阈值'
            unCheckedChildren='手动输入数值'
          />
        </Space>
        {序列.按阈值选择 ? (
          <加速阈值选择
            多选
            展示方式='平铺'
            阈值列表={阈值列表}
            value={序列.选中阈值}
            onChange={(选中阈值) => onChange({ 选中阈值 })}
          />
        ) : (
          <Input
            aria-label='保存加速值'
            value={序列.加速输入}
            onChange={(e) => onChange({ 加速输入: e.target.value })}
            placeholder='多个加速值用英文逗号分隔'
          />
        )}
        <Space wrap>
          <span>保存的延迟</span>
          <Checkbox.Group
            options={延迟设定}
            value={序列.延迟}
            onChange={(延迟) => onChange({ 延迟: 延迟 as number[] })}
          />
        </Space>
      </div>
      <CycleSimulatorContext.Provider
        value={{
          ...上下文,
          起手Buff配置: 序列.起手Buff配置,
          更新起手Buff配置: (起手Buff配置) => onChange({ 起手Buff配置 }),
        }}
      >
        <开场Buff配置弹窗
          open={Buff设置展示}
          onClose={() => 设置Buff设置展示(false)}
          原始Buff数据={配置.原始Buff数据}
          起手可选DOT={配置.起手可选DOT}
        />
      </CycleSimulatorContext.Provider>
    </Card>
  )
}
