import React, { useState } from 'react'
import { Dropdown, Modal, Select } from 'antd'
import 循环技能显示组件 from '../../../通用/通用组件/循环技能显示组件'
import { 切换武器选项 } from '../../武器切换'
import { 额外信息类型 } from '../../simulator/type'
import styles from './index.module.less'

type 切换武器显示入参 = React.ComponentProps<typeof 循环技能显示组件> & {
  技能: { 额外信息?: 额外信息类型 }
}

const 切换武器显示 = (props: 切换武器显示入参) => {
  const [弹窗显示, 设置弹窗显示] = useState(false)
  const [目标武器ID, 设置目标武器ID] = useState<number>()
  if (props.技能.技能名称 !== '切换武器') return <循环技能显示组件 {...props} />

  const 允许操作 = props.允许操作列表 ?? ['插入技能', '删除后续']
  const 菜单项 = [
    { key: '修改切换武器', label: '修改切换武器' },
    ...(允许操作.includes('插入技能')
      ? [
          { key: '前部插入', label: '在前部添加技能' },
          { key: '后部插入', label: '在后部添加技能' },
        ]
      : []),
    ...(允许操作.includes('删除后续') ? [{ key: '删除后续', label: '删除后续全部技能' }] : []),
    ...(允许操作.includes('设置延迟') ? [{ key: '设置延迟时间', label: '设置技能延迟时间' }] : []),
  ]

  return (
    <>
      <循环技能显示组件
        {...props}
        背景容器={() => (
          <Dropdown
            trigger={['contextMenu']}
            menu={{
              items: 菜单项,
              onClick: (事件) => {
                if (事件.key === '修改切换武器') {
                  设置目标武器ID(props.技能.额外信息?.目标武器ID)
                  设置弹窗显示(true)
                } else {
                  props.点击下拉菜单(事件)
                }
              },
            }}
          >
            <span className={styles.图标操作} onContextMenu={(事件) => 事件.stopPropagation()} />
          </Dropdown>
        )}
      />
      <Modal
        open={弹窗显示}
        title='选择切换武器'
        onCancel={() => 设置弹窗显示(false)}
        okButtonProps={{ disabled: 目标武器ID === undefined }}
        onOk={() => {
          const 修改后技能 = {
            ...props.技能,
            额外信息: { ...props.技能.额外信息, 目标武器ID },
          }
          props.修改技能信息?.(修改后技能)
          设置弹窗显示(false)
        }}
      >
        <div className={styles.武器选择}>
          <span>目标武器</span>
          <Select
            aria-label='修改切换目标武器'
            value={目标武器ID}
            options={切换武器选项}
            onChange={设置目标武器ID}
          />
        </div>
      </Modal>
    </>
  )
}

export default 切换武器显示
