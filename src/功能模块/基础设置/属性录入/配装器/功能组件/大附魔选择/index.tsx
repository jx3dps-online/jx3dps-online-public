import ImageComponent from '@/组件/图片展示'
import { Select } from 'antd'
import { forwardRef, ForwardRefExoticComponent, useMemo, useState } from 'react'
import './index.css'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 根据表单选项获取装备信息 from '../../工具函数/根据表单选项获取装备信息'
import { 秒伤计算 } from '@/计算模块/计算函数'

interface 大附魔选择类型 {
  value?: number
  onChange?: (e: number) => void
  type: string
  开启装备智能对比: boolean
  form?: any
}

const 大附魔选择: ForwardRefExoticComponent<大附魔选择类型> = forwardRef((props) => {
  const { type, value, onChange, 开启装备智能对比, form } = props

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState<boolean>(false)
  const [dpsUpList, setDpsUpList] = useState<{ value: number; dpsUp: number }[]>()

  const list = useMemo(() => {
    return [
      {
        label: `英雄·${type}`,
        value: 2,
        iconId: '23948', 
      },
      {
        label: `普通·${type}`,
        value: 1,
        iconId: '23950',
      },
    ]
  }, [type])

  const getDpsUpList = () => {
    if (开启装备智能对比) {
      setLoading(true)
      // 获取旧装备列表
      const 当前装备列表信息 = form?.getFieldsValue()
      const 当前装备信息 = 根据表单选项获取装备信息(当前装备列表信息)

      const { 秒伤: 旧秒伤 } = dispatch(
        秒伤计算({ 更新装备信息: 当前装备信息, 计算技能详情: false }),
      )

      // 传入新的装备
      const newDpsUpList = list.map((item) => {
        const 更新后装备信息 = 根据表单选项获取装备信息({
          ...当前装备列表信息,
          [`大附魔_伤${type}`]: item?.value,
        })

        const { 秒伤: 更新后秒伤 } = dispatch(
          秒伤计算({ 更新装备信息: 更新后装备信息, 计算技能详情: false }),
        )

        return {
          value: item?.value,
          dpsUp: 更新后秒伤 - (旧秒伤 || 当前计算结果?.秒伤),
        }
      })

      if (newDpsUpList?.length) {
        setDpsUpList(newDpsUpList)
      }
      setLoading(false)
    }
  }

  return (
    <Select
      optionFilterProp='label'
      value={value || undefined}
      onChange={onChange}
      loading={loading}
      allowClear
      placeholder={`未选择 ${type}`}
      className='dafumo-select'
      popupClassName='dafumo-select-popup'
      popupMatchSelectWidth={开启装备智能对比 ? 200 : undefined}
      onDropdownVisibleChange={(e) => {
        if (e) {
          getDpsUpList()
        } else {
          setDpsUpList([])
        }
      }}
    >
      {list.map((item) => {
        const upItem = dpsUpList?.find((up) => up.value === item?.value) || {
          dpsUp: 0,
        }

        return (
          <Select.Option
            key={`dafumo_${type}_${item.value}`}
            value={item?.value}
            label={item.label}
          >
            <div className={`dafumo-diff-wrap`}>
              <ImageComponent
                key={`${type}_图标_${item?.iconId}`}
                src={`https://icon.jx3box.com/icon/${item?.iconId}.png`}
                fallback={'https://icon.jx3box.com/icon/13.png'}
                className={'dafumo-icon'}
              />
              {item.label}
            </div>
            {upItem?.dpsUp !== 0 ? (
              <span
                className={`zhuangbei-diff ${upItem?.dpsUp > 0 ? 'dps-up-color' : 'dps-low-color'}`}
              >
                {upItem?.dpsUp > 0 ? '+' : ''}
                {upItem?.dpsUp}
              </span>
            ) : null}
          </Select.Option>
        )
      })}
    </Select>
  )
})

export default 大附魔选择
