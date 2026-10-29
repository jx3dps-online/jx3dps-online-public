import React from 'react'
import { Button, Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import AutoComplete from 'antd/es/auto-complete'
import type { 数据类型 } from '@/@types/数据'
import { 组件目录 } from './组件定义'
import type { 内容块, 编辑字段 } from './类型'
import 富文本 from './富文本'
import styles from './index.module.less'

export default function 内容表单({
  块,
  更新,
  数据,
}: {
  块: 内容块
  更新: (块: 内容块) => void
  数据?: 数据类型
}) {
  const 修改 = (键: string, 值: unknown) => 更新({ ...块, [键]: 值 })
  const 候选 = (字段: 编辑字段): { value: string; label?: string }[] => {
    const 类型 = 字段.候选 || (块.类型 === '引用' && 字段.键 === '键' ? 块.种类 : '')
    if (类型 === '奇穴')
      return 数据?.奇穴数据.flatMap((重) => 重.奇穴列表.map((项) => ({ value: 项.奇穴名称 }))) || []
    if (类型 === '增益') return 数据?.团队增益.map((项) => ({ value: 项.增益名称 })) || []
    if (类型 === '附魔')
      return (
        数据?.附魔.map((项) => ({ value: String(项.id), label: `${项.附魔名称} · ${项.id}` })) || []
      )
    if (类型 === '装备')
      return Object.values(数据?.装备数据 || {}).flatMap((列表) =>
        (列表 as { id: number; 装备名称: string }[]).map((项) => ({
          value: String(项.id),
          label: `${项.装备名称} · ${项.id}`,
        })),
      )
    if (类型 === '技能') return (数据?.技能系数 || []).map((项) => ({ value: 项.技能名称 }))
    return []
  }
  const 表格 = () => {
    const 表头 = 块.表头 as string[],
      行 = 块.行 as string[][],
      列宽 = 块.列宽 as number[]
    return (
      <div className={styles.表格编辑}>
        <div className={styles.表格滚动}>
          <table>
            <thead>
              <tr>
                {表头.map((值, 列) => (
                  <th key={列}>
                    <富文本
                      紧凑
                      值={值}
                      更新={(新值) =>
                        修改(
                          '表头',
                          表头.map((旧, i) => (i === 列 ? 新值 : 旧)),
                        )
                      }
                    />
                    <InputNumber
                      size='small'
                      min={0}
                      placeholder='自动列宽'
                      value={列宽[列]}
                      onChange={(值) =>
                        修改(
                          '列宽',
                          表头.map((_, i) => (i === 列 ? 值 || 0 : 列宽[i] || 0)),
                        )
                      }
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {行.map((本行, 行号) => (
                <tr key={行号}>
                  {表头.map((_, 列) => (
                    <td key={列}>
                      <富文本
                        紧凑
                        值={本行[列] || ''}
                        更新={(新值) =>
                          修改(
                            '行',
                            行.map((旧行, i) =>
                              i === 行号
                                ? 表头.map((_, j) => (j === 列 ? 新值 : 旧行[j] || ''))
                                : 旧行,
                            ),
                          )
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Space wrap>
          <Button
            size='small'
            disabled={行.length >= 100}
            onClick={() => 修改('行', [...行, 表头.map(() => '')])}
          >
            添加行
          </Button>
          <Button size='small' disabled={行.length < 2} onClick={() => 修改('行', 行.slice(0, -1))}>
            删除末行
          </Button>
          <Button
            size='small'
            disabled={表头.length >= 30}
            onClick={() =>
              更新({ ...块, 表头: [...表头, '新列'], 行: 行.map((项) => [...项, '']) })
            }
          >
            添加列
          </Button>
          <Button
            size='small'
            disabled={表头.length < 2}
            onClick={() =>
              更新({
                ...块,
                表头: 表头.slice(0, -1),
                行: 行.map((项) => 项.slice(0, -1)),
                列宽: 列宽.slice(0, -1),
              })
            }
          >
            删除末列
          </Button>
        </Space>
      </div>
    )
  }
  const 字段输入 = (字段: 编辑字段) => {
    const 值 = 块[字段.键]
    if (字段.类型 === '表格') return 表格()
    if (字段.类型 === '富文本')
      return <富文本 值={String(值)} 更新={(新值) => 修改(字段.键, 新值)} />
    if (字段.类型 === '条目')
      return (
        <div>
          {(值 as string[]).map((项, i) => (
            <div className={styles.重复项} key={i}>
              <富文本
                紧凑
                值={项}
                更新={(新值) =>
                  修改(
                    字段.键,
                    (值 as string[]).map((旧, j) => (j === i ? 新值 : 旧)),
                  )
                }
              />
              <Button
                size='small'
                onClick={() =>
                  修改(
                    字段.键,
                    (值 as string[]).filter((_, j) => j !== i),
                  )
                }
              >
                删除
              </Button>
            </div>
          ))}
          <Button size='small' onClick={() => 修改(字段.键, [...(值 as string[]), ''])}>
            添加条目
          </Button>
        </div>
      )
    if (字段.类型 === '宏') {
      const 段 = 值 as { 标题: string; 内容: string }[]
      return (
        <div>
          {段.map((项, i) => (
            <div className={styles.宏段} key={i}>
              <Input
                placeholder='这段宏的标题'
                value={项.标题}
                onChange={(事件) =>
                  修改(
                    '段',
                    段.map((旧, j) => (j === i ? { ...旧, 标题: 事件.target.value } : 旧)),
                  )
                }
              />
              <Input.TextArea
                rows={5}
                spellCheck={false}
                value={项.内容}
                onChange={(事件) =>
                  修改(
                    '段',
                    段.map((旧, j) => (j === i ? { ...旧, 内容: 事件.target.value } : 旧)),
                  )
                }
              />
              <Button
                size='small'
                onClick={() =>
                  修改(
                    '段',
                    段.filter((_, j) => j !== i),
                  )
                }
              >
                删除此段
              </Button>
            </div>
          ))}
          <Button size='small' onClick={() => 修改('段', [...段, { 标题: '', 内容: '' }])}>
            添加一段宏
          </Button>
        </div>
      )
    }
    if (字段.类型 === '开关')
      return <Switch checked={!!值} onChange={(新值) => 修改(字段.键, 新值)} />
    if (字段.类型 === '数字')
      return (
        <InputNumber
          min={0}
          value={值 === '' ? null : Number(值)}
          onChange={(新值) => 修改(字段.键, 新值 ?? '')}
        />
      )
    if (字段.类型 === '选项')
      return (
        <Select
          value={String(值)}
          options={字段.选项?.map((项) => ({ value: 项 }))}
          onChange={(新值) => 修改(字段.键, 新值)}
        />
      )
    if (字段.类型 === '多行')
      return (
        <>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 10 }}
            value={String(值)}
            onChange={(事件) => 修改(字段.键, 事件.target.value)}
          />
          {字段.候选 && (
            <Select
              showSearch
              placeholder='从当前心法选择并追加'
              value={null}
              options={候选(字段)}
              onChange={(选中) =>
                修改(字段.键, [String(值).trim(), 选中].filter(Boolean).join('，'))
              }
            />
          )}
        </>
      )
    const 选项 = 候选(字段)
    return 选项.length ? (
      <AutoComplete
        value={String(值)}
        options={选项}
        filterOption={(输入, 项) =>
          String(项?.label || 项?.value)
            .toLowerCase()
            .includes(输入.toLowerCase())
        }
        onChange={(新值) => 修改(字段.键, 新值)}
      />
    ) : (
      <Input value={String(值)} onChange={(事件) => 修改(字段.键, 事件.target.value)} />
    )
  }
  return (
    <Form layout='vertical' size='middle'>
      {组件目录[块.类型].字段.map((字段) => (
        <Form.Item label={字段.名称} key={字段.键}>
          {字段输入(字段)}
        </Form.Item>
      ))}
    </Form>
  )
}
