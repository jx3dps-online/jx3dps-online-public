import React, { useState } from 'react'
import { Button, Divider, Input, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { 副本事件方案类型 } from '@/@types/副本事件'
import { 默认方案名称 } from '../utils'
import styles from '../index.module.less'

interface 方案选择器Props {
  方案列表: 副本事件方案类型[]
  当前方案名称: string
  onChange: (名称: string) => void
  onNew: (名称: string) => void
  onRename: (名称: string) => void
  onDelete: (名称: string) => void
}

const 方案选择器: React.FC<方案选择器Props> = (props) => {
  const { 方案列表, 当前方案名称, onChange, onNew, onRename, onDelete } = props
  const [新建名称, 设置新建名称] = useState<string>('')

  const 确认新建 = () => {
    onNew(新建名称)
    设置新建名称('')
  }

  return (
    <Select
      className={styles.schemeSelect}
      value={当前方案名称 || undefined}
      onChange={onChange}
      placeholder='选择副本事件方案'
      options={(方案列表 || []).map((item) => ({ value: item.方案名称, label: item.方案名称 }))}
      optionRender={(option) => (
        <div className={styles.schemeOption}>
          <span className={styles.schemeOptionName}>
            {option.value}
            {option.value === 默认方案名称 ? '（默认）' : ''}
          </span>
          {option.value === 默认方案名称 ? null : (
            <span className={styles.schemeOptionActions}>
              <a
                className={styles.schemeOptionLink}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onRename(option.value as string)
                }}
              >
                重命名
              </a>
              <a
                className={styles.schemeOptionDelete}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete(option.value as string)
                }}
              >
                删除
              </a>
            </span>
          )}
        </div>
      )}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <div className={styles.schemeAddWrap}>
            <Input
              placeholder='输入新方案名称'
              value={新建名称}
              onChange={(e) => 设置新建名称(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onPressEnter={确认新建}
            />
            <Button type='text' icon={<PlusOutlined />} onClick={确认新建}>
              新建方案
            </Button>
          </div>
        </>
      )}
    />
  )
}

export default React.memo(方案选择器)
