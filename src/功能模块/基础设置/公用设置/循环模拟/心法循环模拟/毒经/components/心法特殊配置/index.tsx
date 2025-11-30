import { Select, Tooltip } from 'antd'
import styles from './index.module.less'
import React from 'react'

interface 心法特殊配制类型 {
  忽略延迟技能: string[],
  更新忽略延迟技能: (e: string[]) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    忽略延迟技能,
    更新忽略延迟技能
  } = props

  return (
    <>

      <span className={styles.label}>忽略延迟</span>
      <Tooltip title='以下技能计算时忽略延迟影响' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={忽略延迟技能}
          style={{ minWidth: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          placeholder={'无设置'}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          mode={'multiple'}
          onChange={(e) => 更新忽略延迟技能(e)}
          options={['蝎心', '蛇影', '百足', '千丝', '蟾啸', '蛊虫献祭', '灵蛊', '凤凰蛊', '降厄', '连缘蛊', '触发橙武', '特效腰坠'].map((a) => {
            return {
              value: a,
              label: a,
            }
          })}
        />
      </Tooltip>
    </>
  )
}

export default 心法特殊配置
