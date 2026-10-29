import { SelectProps, Select, Tooltip } from 'antd'
import React, { useMemo } from 'react'
import { 装备属性信息模型 } from '@/@types/装备'
import './index.css'

interface 精炼等级选择入参 extends SelectProps {
  装备数据: 装备属性信息模型
}

function 精炼等级选择(props: 精炼等级选择入参) {
  const { 装备数据, ...rest } = props

  const list = useMemo(() => {
    const list = Array.from({ length: (装备数据?.最大精炼等级 || 0) + 1 }, (v, i) => i)
    list.sort((a, b) => b - a)
    return list
  }, [装备数据?.最大精炼等级])
  const 是否未精炼满 = 装备数据?.最大精炼等级 && props.value < 装备数据?.最大精炼等级

  return (
    <Tooltip title={是否未精炼满 ? '请注意，当前装备未精炼至满级' : null}>
      <Select className='jinglian-select' optionFilterProp='label' {...rest}>
        {list.map((item) => {
          const 是最大等级 = item === 装备数据?.最大精炼等级
          return (
            <Select.Option key={item} value={item} label={item}>
              <div
                className={`${是否未精炼满 && !是最大等级 ? 'jinglian-not-max' : ''} ${
                  是否未精炼满 && 是最大等级 ? 'jinglian-max' : ''
                }`}
              >
                {item}
              </div>
            </Select.Option>
          )
        })}
      </Select>
    </Tooltip>
  )
}

export default 精炼等级选择
