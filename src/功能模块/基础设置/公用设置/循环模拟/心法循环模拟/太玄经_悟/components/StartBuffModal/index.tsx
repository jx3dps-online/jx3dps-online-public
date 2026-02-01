import React, { useEffect, useMemo, useState } from 'react'
import { Button, Col, InputNumber, Modal, Row, Select, Space } from 'antd'
import { 每秒郭氏帧 } from '@/数据/常量'
import { 起手Buff配置 } from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/通用/通用框架/类型定义/Buff'

interface StartBuffModalProps {
  open: boolean
  onCancel: () => void
  起手Buff配置: 起手Buff配置
  更新起手Buff配置: (e: 起手Buff配置) => void
  可选Buff列表: { key: string; 名称: string }[]
}

interface UiBuffRow {
  buffKey: string
  类型: '自身' | '目标'
  层数: number
  获得时间秒: number
}

function StartBuffModal(props: StartBuffModalProps) {
  const { open, onCancel, 起手Buff配置, 更新起手Buff配置, 可选Buff列表 } = props

  const [rows, setRows] = useState<UiBuffRow[]>([])

  useEffect(() => {
    if (!open) {
      return
    }
    const nextRows: UiBuffRow[] = Object.keys(起手Buff配置 || {}).map((key) => {
      const v = 起手Buff配置[key]
      return {
        buffKey: key,
        类型: (v?.类型 as any) || '自身',
        层数: v?.层数 || 1,
        获得时间秒: ((v?.获得时间 || 0) as number) / 每秒郭氏帧,
      }
    })
    setRows(nextRows)
  }, [open, 起手Buff配置])

  const buffOptions = useMemo(() => {
    return (可选Buff列表 || []).map((item) => ({ label: item.名称, value: item.key }))
  }, [可选Buff列表])

  const onSave = () => {
    const nextCfg: 起手Buff配置 = {}
    ;(rows || []).forEach((r) => {
      if (!r?.buffKey) {
        return
      }
      nextCfg[r.buffKey] = {
        类型: r.类型,
        层数: r.层数,
        获得时间: Math.round((r.获得时间秒 || 0) * 每秒郭氏帧),
      }
    })
    更新起手Buff配置(nextCfg)
    onCancel()
  }

  return (
    <Modal
      title='起手Buff设置'
      open={open}
      onCancel={onCancel}
      onOk={onSave}
      okText='保存'
      cancelText='取消'
      width={820}
      destroyOnClose
    >
      <Space direction='vertical' style={{ width: '100%' }} size={12}>
        {(rows || []).map((r, idx) => {
          return (
            <Row key={`${r.buffKey}-${idx}`} gutter={[12, 12]} align='middle'>
              <Col span={10}>
                <Select
                  style={{ width: '100%' }}
                  placeholder='Buff名称'
                  value={r.buffKey}
                  options={buffOptions}
                  onChange={(v) => {
                    const next = [...rows]
                    next[idx] = { ...next[idx], buffKey: v }
                    setRows(next)
                  }}
                  showSearch
                  optionFilterProp='label'
                />
              </Col>
              <Col span={4}>
                <Select
                  style={{ width: '100%' }}
                  value={r.类型}
                  options={[
                    { label: '自身', value: '自身' },
                    { label: '目标', value: '目标' },
                  ]}
                  onChange={(v) => {
                    const next = [...rows]
                    next[idx] = { ...next[idx], 类型: v as any }
                    setRows(next)
                  }}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={999}
                  value={r.层数}
                  onChange={(v) => {
                    const next = [...rows]
                    next[idx] = { ...next[idx], 层数: Number(v || 1) }
                    setRows(next)
                  }}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={-60}
                  max={0}
                  step={0.25}
                  value={r.获得时间秒}
                  onChange={(v) => {
                    const next = [...rows]
                    next[idx] = { ...next[idx], 获得时间秒: Number(v || 0) }
                    setRows(next)
                  }}
                />
              </Col>
              <Col span={2}>
                <Button
                  danger
                  onClick={() => {
                    setRows(rows.filter((_, i) => i !== idx))
                  }}
                >
                  删除
                </Button>
              </Col>
            </Row>
          )
        })}

        <Button
          type='dashed'
          onClick={() => {
            setRows([...(rows || []), { buffKey: '', 类型: '自身', 层数: 1, 获得时间秒: 0 }])
          }}
        >
          +
        </Button>
      </Space>
    </Modal>
  )
}

export default StartBuffModal
