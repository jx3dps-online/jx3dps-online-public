import { Select, SelectProps, Tooltip } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { 附魔数据类型 } from '@/@types/附魔'
import { 对比结果条目 } from '@/@types/配装指导'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 根据表单选项获取装备信息 from '../../../工具函数/根据表单选项获取装备信息'
import { 计算候选收益, 候选装备信息, 格式化收益文本 } from '../../../工具函数/计算候选收益'
import './index.css'
import classNames from 'classnames'
import { 装备信息数据类型 } from '@/@types/装备'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import { 根据部位索引获取装备 } from '../../../工具函数/装备表单转换'
import { 排序附魔列表 } from './排序'

interface 附魔选择入参 extends SelectProps {
  list: 附魔数据类型[]
  form: any
  开启装备智能对比: boolean
  对比显示百分比: boolean
  候选按收益排序: boolean
  allValue?: any // 选择装备的全部信息包含附魔等
  部位索引: string
  /**
   * @name 对比装备信息
   * 红色标记的基准；传 null 表示不标红，不传则回退到页面当前装备。
   */
  对比装备信息?: 装备信息数据类型 | null
  /**
   * @name 循环覆盖
   * 目标编辑时用目标循环/奇穴/秘籍计算候选收益。
   */
  循环覆盖?: 计算循环覆盖类型
}

function 附魔选择(props: 附魔选择入参) {
  const {
    list,
    开启装备智能对比,
    form,
    allValue,
    部位索引,
    对比显示百分比,
    候选按收益排序,
    对比装备信息,
    循环覆盖,
    ...rest
  } = props

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 页面装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 当前装备信息 = 对比装备信息 === undefined ? 页面装备信息 : 对比装备信息
  const [dpsUpList, setDpsUpList] = useState<对比结果条目[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const 原始附魔 = useMemo(() => {
    return 根据部位索引获取装备(当前装备信息?.装备列表, 部位索引)?.附魔
  }, [当前装备信息, 部位索引])

  const 是否更换附魔 = useMemo(() => {
    return allValue?.附魔 !== 原始附魔
  }, [原始附魔, allValue])

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

  // 获取dps提升装备列表
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
        const 新装备数据 = {
          ...allValue,
          附魔: item.id,
        }

        const 更新后装备信息 = 根据表单选项获取装备信息({
          ...当前装备列表信息,
          [`${部位索引}`]: 新装备数据,
        })

        return {
          id: String(item.id) || '',
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

  const cls = classNames('fumo-select', { 'equip-diff-change': 是否更换附魔 })

  const 排序后附魔列表 = useMemo(
    () => 排序附魔列表(list, 候选按收益排序 ? dpsUpList : undefined),
    [list, dpsUpList, 候选按收益排序],
  )

  return (
    <Select
      placeholder='选择附魔'
      loading={loading}
      allowClear
      showSearch
      filterOption={(input, option) => {
        return `${option?.label || ''} ${option?.title || ''} ${option?.value || ''}`.includes(
          input,
        )
      }}
      popupMatchSelectWidth={开启装备智能对比 ? 260 : 200}
      optionFilterProp='label'
      onDropdownVisibleChange={(e) => {
        if (e) {
          getDpsUpList()
        } else {
          请求序号.current++
          setLoading(false)
          setDpsUpList([])
        }
      }}
      className={cls}
      {...rest}
    >
      {排序后附魔列表.map((item) => {
        const upItem = dpsUpList?.find((up) => up.id === String(item.id)) || {
          id: '',
          dpsUp: 0,
          dpsPercent: 0,
          属性差: {},
          装分差: 0,
          加速不匹配: false,
          已收藏: false,
        }

        const 颜色 = item.附魔颜色

        return (
          <Select.Option
            key={item.id}
            value={item.id}
            label={item.附魔效果简写}
            // title={`${item.附魔名称} #${item.id}`}
          >
            <Tooltip title={item.附魔名称} placement='right'>
              <div className='fumo-diff-wrap'>
                <span className='fumo-diff-name-wrap'>
                  <span title={item.附魔名称}>{item.附魔效果简写}</span>
                </span>
                <div className='fumo-diff-right'>
                  {upItem?.dpsUp !== 0 && 开启装备智能对比 ? (
                    <span
                      className={`zhuangbei-diff ${
                        +upItem?.dpsUp > 0 ? 'dps-up-color' : 'dps-low-color'
                      }`}
                    >
                      {格式化收益文本(upItem?.dpsUp, upItem?.dpsPercent, 对比显示百分比)}
                    </span>
                  ) : null}
                  <span className={`fumo-name-number fumo-name-${颜色枚举?.[颜色]?.样式}`}>
                    {颜色枚举?.[颜色]?.名称}
                  </span>
                </div>
              </div>
            </Tooltip>
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default 附魔选择

const 颜色枚举 = {
  精: { 样式: 'orange', 名称: '精' },
  挑: { 样式: 'green', 名称: '挑' },
  紫: { 样式: 'purple', 名称: '紫' },
  蓝: { 样式: 'blue', 名称: '蓝' },
}
