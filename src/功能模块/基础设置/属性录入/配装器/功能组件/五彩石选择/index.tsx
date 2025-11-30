import { Cascader, Select } from 'antd'
import React, { useMemo } from 'react'
import { 五彩石增益类型枚举 } from '@/@types/枚举'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import './index.css'

const { 五彩石 } = 获取当前数据()

interface WucaishiFilterList {
  value: 五彩石增益类型枚举 | string
  label: 五彩石增益类型枚举 | string
  children?: WucaishiFilterList[]
}

interface WuCaiShiXuanZeProps {
  value?: string
  onChange?: (e: string | undefined) => void
}

function WuCaiShiXuanZe(props: WuCaiShiXuanZeProps) {
  const { value, onChange } = props

  const jibie = useMemo(() => {
    return value?.includes('伍') ? 5 : 6
  }, [value])

  const mingzi = useMemo(() => {
    const jibie = value?.includes('伍') ? 5 : 6
    const list = 五彩石[jibie] || []
    const findObj = list.find((item) => {
      return item.五彩石名称 === value
    })
    return findObj?.装备增益.map((item) => item.增益名称)
  }, [value])

  const wucaishiFilterList: WucaishiFilterList[] = useMemo(() => {
    return getWuCaiShiFilterList()
  }, [五彩石[6]])

  const handleChange = (e) => {
    if (!e) {
      onChange && onChange(undefined)
    } else {
      const list = 五彩石[jibie] || []
      const findObj = list.find((item) => {
        return (
          item.装备增益?.[0]?.增益名称 === e?.[0] &&
          item.装备增益?.[1]?.增益名称 === e?.[1] &&
          item.装备增益?.[2]?.增益名称 === e?.[2]
        )
      })
      if (findObj && findObj?.五彩石名称) {
        onChange && onChange(findObj?.五彩石名称)
      }
    }
  }

  const changeJiBie = (e) => {
    let newName = value
    if (e === 5) {
      newName = newName?.replace('(陆)', '(伍)')
    } else {
      newName = newName?.replace('(伍)', '(陆)')
    }
    if (newName) {
      onChange && onChange(newName)
    }
  }

  return (
    <div className='wucaishi-wrap'>
      <div className={'wucaishi-xuanze-wrap'}>
        <Select
          className={'wucaishi-xuanze-dengji'}
          disabled={!mingzi}
          value={jibie}
          options={[
            { label: '六级', value: 6 },
            { label: '五级', value: 5 },
          ]}
          onChange={(e) => changeJiBie(e)}
        />
        <Cascader
          className={'wucaishi-xuanze'}
          value={mingzi}
          showSearch
          placeholder='选择五彩石'
          onChange={handleChange}
          allowClear
          options={wucaishiFilterList}
        />
      </div>
      {value ? (
        <div className={`wucaishi-value ${jibie === 6 ? 'wucaishi-value-6' : 'wucaishi-value-5'}`}>
          {value}
        </div>
      ) : null}
    </div>
  )
}

export default WuCaiShiXuanZe

const getWuCaiShiFilterList = () => {
  let list: WucaishiFilterList[] = []
  五彩石[6].forEach((item) => {
    item.装备增益.forEach((a, index) => {
      if (index === 0) {
        if (!list?.some((c) => c.value === a.增益名称)) {
          list.push({
            label: a.增益名称,
            value: a.增益名称,
            children: [],
          })
        }
      } else if (index === 1) {
        list = list.map((c) => {
          if (c.value === item.装备增益?.[0].增益名称) {
            return {
              ...c,
              children: c.children?.some((d) => d.value === a.增益名称)
                ? c.children
                : (c.children || []).concat([
                    {
                      label: a.增益名称,
                      value: a.增益名称,
                      children: [],
                    },
                  ]),
            }
          } else {
            return { ...c }
          }
        })
      } else if (index === 2) {
        list = list.map((c) => {
          if (c.value === item.装备增益?.[0].增益名称) {
            return {
              ...c,
              children: c.children?.map((d) => {
                if (d.value === item.装备增益?.[1].增益名称) {
                  return {
                    ...d,
                    children: d.children?.some((e) => e.value === a.增益名称)
                      ? d.children
                      : (d.children || []).concat([
                          {
                            label: a.增益名称,
                            value: a.增益名称,
                          },
                        ]),
                  }
                } else {
                  return { ...d }
                }
              }),
            }
          } else {
            return { ...c }
          }
        })
      }
    })
  })
  return list
}
