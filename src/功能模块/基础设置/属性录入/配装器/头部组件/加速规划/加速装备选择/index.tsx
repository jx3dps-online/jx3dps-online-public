import { 属性类型 } from '@/@types/属性'
import { 装备属性信息模型, 装备类型枚举 } from '@/@types/装备'
import { use心法数据 } from '@/心法模块/心法上下文'
import { Button, Modal, Select, Tag, Tooltip } from 'antd'
import React, { forwardRef, ForwardRefExoticComponent, useMemo, useState } from 'react'
import classnames from 'classnames'
import './index.css'
import { 获取装备数据描述 } from '../../../功能组件/装备选择/装备部位选择'

interface 加速装备选择类型 {
  value?: 装备属性信息模型[]
  onChange?: (e: 装备属性信息模型[]) => void
}

export const color_list = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
]

const 加速装备选择: ForwardRefExoticComponent<加速装备选择类型> = forwardRef((props, _) => {
  const { 装备数据 } = use心法数据()
  const { value = [], onChange } = props
  const [加速装备选择弹窗展示, 设置加速装备选择弹窗展示] = useState<boolean>(false)
  const [弹窗内数据, 修改弹窗内数据] = useState<装备属性信息模型[]>([])

  const 判断是否禁用 = (数据) => {
    if (弹窗内数据?.some((item) => item?.id === 数据?.id)) {
      return false
    }
    if (数据?.装备部位 === '戒指') {
      return 弹窗内数据?.filter((item) => item?.装备部位 === 数据?.装备部位)?.length > 1
    } else {
      return 弹窗内数据?.some((item) => item?.装备部位 === 数据?.装备部位)
    }
  }

  const 包含加速的装备部位 = useMemo(() => {
    const list: 装备属性信息模型[] = []
    Object.keys(装备数据)?.forEach((部位) => {
      const 该部位数据 = 装备数据[部位]
      该部位数据.forEach((装备) => {
        const 装备增益列表 = 装备?.装备增益
        const 该装备包含加速 = 装备增益列表?.some((item) => item?.属性 === 属性类型.加速等级)
        const 数据 = { ...装备, 装备部位: 部位 }
        const 是否禁用 = 判断是否禁用(数据)
        if (该装备包含加速 && !是否禁用) {
          list.push({ ...装备, 装备部位: 部位 })
        }
      })
    })
    return list
  }, [弹窗内数据, 装备数据])

  const 选择装备 = (新id列表) => {
    const 数据列表 = 包含加速的装备部位?.filter((item) => 新id列表?.includes(item?.id))
    修改弹窗内数据(数据列表)
  }

  const 关闭加速装备选择弹窗 = () => {
    设置加速装备选择弹窗展示(false)
    修改弹窗内数据([])
  }

  const 提交数据 = () => {
    const 全部数据 = [...(弹窗内数据 || [])]
    onChange?.(全部数据)
    关闭加速装备选择弹窗()
  }

  const 删除指定装备 = (id) => {
    const 全部数据 = [...(value || [])]?.filter((item) => item?.id !== id)
    onChange?.(全部数据)
  }

  return (
    <div className={`haste-equipment-select-content`}>
      {value?.map((item, index) => {
        const color = color_list?.[index % color_list?.length] || color_list[0]
        return (
          <Tag
            className={`haste-equipment-select-tag`}
            color={color}
            closable
            key={`加速装备已选择${item?.id}`}
            onClose={() => 删除指定装备(item?.id)}
          >
            {item?.装备名称}
          </Tag>
        )
      })}
      <Button
        className={`haste-equipment-select-tag`}
        size='small'
        type='dashed'
        onClick={() => {
          设置加速装备选择弹窗展示(true)
          修改弹窗内数据([...value])
        }}
      >
        + 添加
      </Button>
      <Modal
        title='加速装备选择'
        open={加速装备选择弹窗展示}
        onCancel={() => 关闭加速装备选择弹窗()}
        onOk={提交数据}
      >
        <Select
          className='haste-equipment-select'
          value={弹窗内数据?.map((item) => item?.id)}
          onChange={选择装备}
          showSearch
          filterOption={(input, option) => {
            const findObj = 包含加速的装备部位?.find((item) => item.id === option?.value)
            if (findObj) {
              const filterStr = `${findObj.装备名称}${findObj.装备品级}${findObj.id}`
              return filterStr.includes(input.toLowerCase())
            }
            return false
          }}
          mode='multiple'
          placeholder={'请选择你要锁定的加速装备'}
          optionFilterProp='label'
          tagRender={(props) => {
            const 装备名称 = 包含加速的装备部位?.find((item) => item?.id === props?.value)?.装备名称
            const index = 弹窗内数据?.findIndex((item) => item?.id === props?.value)
            const color = color_list?.[index % color_list?.length] || color_list[0]

            return (
              <Tag color={color} className={`haste-equipment-select-tag`} {...props}>
                {装备名称}
              </Tag>
            )
          }}
        >
          {包含加速的装备部位?.map((item) => {
            const disabled = 判断是否禁用(item)
            return (
              <Select.Option
                key={`${item?.装备部位}${item?.id}`}
                value={item?.id}
                disabled={disabled}
                label={item.装备名称}
              >
                <Tooltip title={disabled ? '已经选择过该部位装备，无法重复选择' : ''}>
                  <div className={`haste-equipment-select-wrap`}>
                    <div>
                      <span className={'haste-equipment-select-position'}>{item.装备部位}</span>
                      <span
                        className={`zhuangbei-select-name ${
                          [装备类型枚举.橙武].includes(item.装备类型)
                            ? 'zhuangbei-select-name-cw'
                            : ''
                        }`}
                      >
                        {item.装备名称}
                      </span>
                      <span className={'zhuangbei-select-shuoming'}>
                        {`(`}
                        {(获取装备数据描述(item) || []).map((a) => {
                          const 装备描述文本样式 = classnames(
                            'zhuangbei-miaoshu-label',
                            a === '精简' || a === '特效' ? 'zhuangbei-miaoshu-label-jingjian' : '',
                            a === '试炼' ? 'zhuangbei-miaoshu-label-shilian' : '',
                            a === 'PVX' ? 'zhuangbei-miaoshu-label-pvx' : '',
                          )

                          return (
                            <span
                              className={装备描述文本样式}
                              key={`${item.装备名称}-${a}-${item?.装备部位}`}
                            >
                              {a}
                            </span>
                          )
                        })}
                        {`)`}
                      </span>
                    </div>
                    <div>
                      <span className={'zhuangbei-select-level'}>{item.装备品级}品</span>
                    </div>
                  </div>
                </Tooltip>
              </Select.Option>
            )
          })}
        </Select>
      </Modal>
    </div>
  )
})

export default 加速装备选择
