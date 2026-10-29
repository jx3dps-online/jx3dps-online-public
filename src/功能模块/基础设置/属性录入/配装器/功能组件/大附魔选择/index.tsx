import ImageComponent from '@/组件/图片展示'
import { Select } from 'antd'
import { forwardRef, ForwardRefExoticComponent, useEffect, useMemo, useRef, useState } from 'react'
import './index.css'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 根据表单选项获取装备信息 from '../../工具函数/根据表单选项获取装备信息'
import { 计算候选收益, 候选装备信息, 格式化收益文本 } from '../../工具函数/计算候选收益'
import { 对比结果条目 } from '@/@types/配装指导'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'

interface 大附魔选择类型 {
  value?: number
  onChange?: (e: number) => void
  type: string
  开启装备智能对比: boolean
  对比显示百分比: boolean
  候选按收益排序: boolean
  form?: any
  循环覆盖?: 计算循环覆盖类型
}

const 大附魔选择: ForwardRefExoticComponent<大附魔选择类型> = forwardRef((props) => {
  const {
    type,
    value,
    onChange,
    开启装备智能对比,
    对比显示百分比,
    候选按收益排序,
    form,
    循环覆盖,
  } = props

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState<boolean>(false)
  const [dpsUpList, setDpsUpList] = useState<对比结果条目[]>()

  // 请求序号：下拉关闭或重新打开后，丢弃上一次未完成计算的结果
  const 请求序号 = useRef(0)
  useEffect(() => {
    请求序号.current++
    setDpsUpList(undefined)
    setLoading(false)
    return () => {
      请求序号.current++
    }
  }, [循环覆盖])

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

  const getDpsUpList = async () => {
    if (开启装备智能对比) {
      const 本次序号 = ++请求序号.current
      setLoading(true)
      // 先让出主线程，保证下拉与 loading 状态先渲染，再进行密集计算
      await new Promise((resolve) => setTimeout(resolve, 0))
      // 获取旧装备列表
      const 当前装备列表信息 = form?.getFieldsValue()
      const 当前装备信息 = 根据表单选项获取装备信息(当前装备列表信息)

      // 传入新的装备
      const 候选装备信息列表: 候选装备信息[] = list.map((item) => {
        const 更新后装备信息 = 根据表单选项获取装备信息({
          ...当前装备列表信息,
          [`大附魔_伤${type}`]: item?.value,
        })

        return {
          id: String(item?.value),
          装备信息: 更新后装备信息,
        }
      })

      const 结果 = await 计算候选收益({
        当前装备信息,
        候选装备信息列表,
        dispatch,
        旧秒伤兜底: 循环覆盖 ? undefined : 当前计算结果?.秒伤,
        循环覆盖,
      })

      if (请求序号.current !== 本次序号) {
        // 计算期间下拉已关闭或已发起新计算，丢弃本次结果
        return
      }
      if (结果?.length) {
        setDpsUpList(结果)
      }
      setLoading(false)
    }
  }

  const 排序后列表 = useMemo(() => {
    if (!候选按收益排序 || !dpsUpList?.length) {
      return list
    }
    return [...list].sort((a, b) => {
      const aItem = dpsUpList?.find((up) => up.id === String(a?.value))
      const bItem = dpsUpList?.find((up) => up.id === String(b?.value))
      const aDps = !aItem || aItem.加速不匹配 ? -Infinity : aItem.dpsUp
      const bDps = !bItem || bItem.加速不匹配 ? -Infinity : bItem.dpsUp
      return bDps - aDps
    })
  }, [list, dpsUpList, 候选按收益排序])

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
          请求序号.current++
          setLoading(false)
          setDpsUpList([])
        }
      }}
    >
      {排序后列表.map((item) => {
        const upItem = dpsUpList?.find((up) => up.id === String(item?.value)) || {
          id: '',
          dpsUp: 0,
          dpsPercent: 0,
          属性差: {},
          装分差: 0,
          加速不匹配: false,
          已收藏: false,
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
                {格式化收益文本(upItem?.dpsUp, upItem?.dpsPercent, 对比显示百分比)}
              </span>
            ) : null}
          </Select.Option>
        )
      })}
    </Select>
  )
})

export default 大附魔选择
