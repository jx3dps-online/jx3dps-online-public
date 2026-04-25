import React, { useState } from 'react'
import { 装备选择范围类型 } from '@/@types/装备'
import { SettingOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, message, Modal, Slider, Tag, Tooltip } from 'antd'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import './index.css'

interface 装备选择范围设置类型 {
  装备选择范围: 装备选择范围类型
  设置装备选择范围: (e: 装备选择范围类型) => void
}

const { 系统配置 } = 获取当前数据()

const 英雄品 = [35900, 43000]
const 普通品 = [30800, 35900]
export const 普通至英雄 = [普通品?.[0], 英雄品?.[1]]

const 装备词条 = {
  会心: 'magenta',
  破招: 'red',
  破防: 'green',
  会效: 'blue',
  加速: 'cyan',
}

const 过滤词条 = {
  无修: 'red',
  特效: 'purple',
  精简: 'magenta',
}

const 装备选择范围设置: React.FC<装备选择范围设置类型> = (props) => {
  const { 装备选择范围, 设置装备选择范围 } = props
  const [设置弹窗展示, 更新设置弹窗展示] = useState<boolean>(false)
  const [品级范围, 设置品级范围] = useState<number[]>([])
  const [词条类型, 设置词条类型] = useState<string[]>([])
  const [过滤类型, 设置过滤类型] = useState<string[]>([])

  const 打开弹窗 = () => {
    更新设置弹窗展示(true)
    设置品级范围(装备选择范围?.品级范围 || [])
    设置词条类型(装备选择范围?.词条类型 || [])
    设置过滤类型(装备选择范围?.过滤类型 || [])
  }

  const 提交表单 = () => {
    设置装备选择范围({
      品级范围: 品级范围 || [],
      词条类型: 词条类型 || [],
      过滤类型: 过滤类型 || [],
    })
    更新设置弹窗展示(false)
  }

  const 删除品级 = () => {
    设置装备选择范围({
      ...装备选择范围,
      品级范围: [],
    })
  }

  const 删除词条 = (target) => {
    const 新词条类型 = [...(装备选择范围?.词条类型 || [])]?.filter((item) => item !== target)
    设置装备选择范围({
      ...装备选择范围,
      词条类型: 新词条类型,
    })
  }

  const 删除过滤类型 = (target) => {
    const 新过滤类型 = [...(装备选择范围?.过滤类型 || [])]?.filter((item) => item !== target)
    设置装备选择范围({
      ...装备选择范围,
      过滤类型: 新过滤类型,
    })
  }

  return (
    <div className={'zhuangbei-scope-wrap'}>
      <div>
        {装备选择范围?.品级范围?.length ? (
          <Tag
            className='zhuangbei-scrop-out-tag'
            color={系统配置?.主题色}
            closable
            onClose={() => 删除品级()}
          >
            {装备选择范围?.品级范围?.[0]}-{装备选择范围?.品级范围?.[1]}
          </Tag>
        ) : null}
        {装备选择范围?.过滤类型?.length
          ? 装备选择范围?.过滤类型?.map((key) => {
              return (
                <Tag
                  className='zhuangbei-scrop-out-tag'
                  color={过滤词条?.[key]}
                  key={`外部过滤类型${key}`}
                  closable
                  onClose={() => 删除过滤类型(key)}
                >
                  过滤{key}
                </Tag>
              )
            })
          : null}
        {装备选择范围?.词条类型?.length
          ? 装备选择范围?.词条类型?.map((key) => {
              return (
                <Tag
                  className='zhuangbei-scrop-out-tag'
                  color={装备词条?.[key]}
                  key={`外部词条${key}`}
                  closable
                  onClose={() => 删除词条(key)}
                >
                  {key}
                </Tag>
              )
            })
          : null}
      </div>
      <Tooltip title='点击设置装备选择范围'>
        <div onClick={() => 打开弹窗()} id='Guide_Equip_Scope' className={'zhuangbei-scope-icon'}>
          <SettingOutlined />
          {!装备选择范围?.品级范围?.length && !装备选择范围?.词条类型?.length ? (
            <span className={'zhuangbei-scope-text'}>装备筛选</span>
          ) : null}
        </div>
      </Tooltip>
      <Modal
        title='装备选择范围设置'
        open={设置弹窗展示}
        onCancel={() => 更新设置弹窗展示(false)}
        onOk={提交表单}
      >
        <Form layout='vertical' className={'zhuangbei-scope-form'}>
          <Form.Item
            label={
              <div className={'zhuangbei-scope-label'}>
                <div>
                  品级范围
                  {品级范围?.length ? (
                    <span className={'zhuangbei-scope-level-number'}>
                      ({品级范围?.[0]}-{品级范围?.[1]})
                    </span>
                  ) : null}
                </div>
                <div className={'zhuangbei-scope-level-label-btns'}>
                  <Tag
                    className={'zhuangbei-scope-level-label-tag'}
                    color='green'
                    onClick={(e) => {
                      e?.preventDefault()
                      设置品级范围(英雄品)
                    }}
                  >
                    英雄
                  </Tag>
                  <Tag
                    className={'zhuangbei-scope-level-label-tag'}
                    color='blue'
                    onClick={(e) => {
                      e?.preventDefault()
                      设置品级范围(普通品)
                    }}
                  >
                    普通
                  </Tag>
                  <Button type='link' danger size='small' onClick={() => 设置品级范围([])}>
                    清空
                  </Button>
                </div>
              </div>
            }
          >
            <Slider
              range
              max={43000}
              min={22000}
              value={品级范围}
              step={500}
              marks={{
                // 20500: '十人副本',
                30200: '普通副本',
                35300: '英雄副本',
              }}
              // tooltip={{ open: true }}
              onChange={(e) => 设置品级范围(e)}
            />
          </Form.Item>
          <Form.Item
            style={{ marginBottom: 12 }}
            label={
              <div className={'zhuangbei-scope-label'}>
                <span>装备词条</span>
                <Button type='link' danger size='small' onClick={() => 设置词条类型([])}>
                  清空
                </Button>
              </div>
            }
          >
            <Checkbox.Group
              value={词条类型}
              onChange={(e) => {
                if (e?.length > 2) {
                  message.error('最多选择2个词条')
                  return
                }
                设置词条类型(e)
              }}
            >
              {Object.keys(装备词条).map((key) => {
                return (
                  <Checkbox value={key} key={`范围选择_${key}`}>
                    {key}
                  </Checkbox>
                )
              })}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            label={
              <div className={'zhuangbei-scope-label'}>
                <span>过滤类型</span>
                <Button type='link' danger size='small' onClick={() => 设置过滤类型([])}>
                  清空
                </Button>
              </div>
            }
          >
            <Checkbox.Group
              value={过滤类型}
              onChange={(e) => {
                if (e?.length > 3) {
                  message.error('最多选择三个词条')
                  return
                }
                设置过滤类型(e)
              }}
            >
              {Object.keys(过滤词条).map((key) => {
                return (
                  <Checkbox value={key} key={`过滤类型_${key}`}>
                    {key}
                  </Checkbox>
                )
              })}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default 装备选择范围设置
