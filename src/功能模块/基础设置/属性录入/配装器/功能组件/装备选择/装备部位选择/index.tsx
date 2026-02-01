/**
 * 装备选择
 */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import classnames from 'classnames'
import { Button, message, Popover, Select } from 'antd'
import { BulbOutlined } from '@ant-design/icons'

import ImageComponent from '@/组件/图片展示'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 装备部位枚举 } from '@/@types/枚举'
import {
  副本精简特效枚举,
  装备位置部位枚举,
  装备属性信息模型,
  装备特效枚举,
  装备类型枚举,
  装备选择范围类型,
  试炼之地特效枚举,
} from '@/@types/装备'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 属性类型 } from '@/@types/属性'

import 根据表单选项获取装备信息 from '../../../工具函数/根据表单选项获取装备信息'
import { 获取最大精炼等级 } from '..'

import 装备详情容器 from './装备详情容器'
import 渐变特效文字 from './渐变特效文字'
import styles from './index.module.less'
import './index.css'
import classNames from 'classnames'

interface 装备部位选择入参 {
  value?: number // 装备ID
  allValue?: any // 选择装备的全部信息包含附魔等
  onChange?: (e: number) => void
  装备数据列表: 装备属性信息模型[]
  部位: 装备部位枚举
  部位索引: string
  排序索引: number
  默认镶嵌宝石等级: number
  form: any
  开启装备智能对比: boolean
  对比显示百分比: boolean
  对比加速: boolean
  装备选择范围: 装备选择范围类型
}

function 装备部位选择(props: 装备部位选择入参, ref) {
  const {
    装备数据列表,
    部位,
    部位索引,
    排序索引,
    默认镶嵌宝石等级,
    allValue,
    form,
    开启装备智能对比,
    对比显示百分比,
    对比加速,
    装备选择范围,
    onChange,
    ...options
  } = props

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 当前装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const [dpsUpList, setDpsUpList] = useState<
    {
      uuid: string
      dpsUp: number | string
      dpsPercent: string
      id?: number
    }[]
  >()
  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  // 组件初始化存储第一次进入得装备ID

  const 原始装备ID = useMemo(() => {
    const 装备ID = 当前装备信息?.装备列表?.find(
      (a: any, index) => 装备位置部位枚举[部位索引] === a?.装备部位 && index === 排序索引,
    )?.id
    return 装备ID
  }, [当前装备信息, 排序索引])

  const 是否更换装备 = useMemo(() => {
    if (allValue?.id && 原始装备ID) {
      return 原始装备ID !== allValue?.id
    }
    return false
  }, [原始装备ID, allValue])

  const 实际装备列表 = useMemo(() => {
    if (
      装备选择范围?.品级范围?.length ||
      装备选择范围?.词条类型?.length ||
      装备选择范围?.过滤类型?.length
    ) {
      let 新列表 = [...装备数据列表]
      if (装备选择范围?.品级范围?.length) {
        新列表 = 新列表?.filter(
          (item) =>
            (item?.装备品级 >= (装备选择范围?.品级范围?.[0] || 0) &&
              item?.装备品级 <= (装备选择范围?.品级范围?.[1] || 0)) ||
            (部位 === '武器' && item?.装备类型 === '橙武'),
        )
      }
      if (装备选择范围?.词条类型?.length) {
        新列表 = 新列表?.filter((item) => {
          return 装备选择范围?.词条类型?.some((a) => 获取装备数据描述(item)?.includes(a))
        })
      }

      if (装备选择范围?.过滤类型?.length) {
        新列表 = 新列表?.filter((item) => {
          let 是否过滤 = false
          if (装备选择范围?.过滤类型?.includes('特效')) {
            是否过滤 = !!(item?.装备特效?.includes('试炼') || item?.装备特效?.includes('特效_'))
          }

          if (!是否过滤) {
            if (装备选择范围?.过滤类型?.includes('精简')) {
              是否过滤 = !!(
                item?.装备类型 === 装备类型枚举.副本精简 && !item?.装备特效?.includes('试炼')
              )
            }
          }

          if (!是否过滤) {
            if (装备选择范围?.过滤类型?.includes('无修')) {
              是否过滤 = item?.装备名称?.includes('无修')
            }
          }

          return !是否过滤
        })
      }

      return 新列表
    } else {
      return 装备数据列表
    }
  }, [装备数据列表, 装备选择范围, 部位])

  const 当前镶嵌等级数组 = useMemo(() => {
    return allValue?.镶嵌孔数组?.map((item) => item.镶嵌宝石等级) || []
  }, [allValue])

  const 当前选择装备 = useMemo(() => {
    return 实际装备列表.find((a) => a.id === allValue?.id)
  }, [allValue, 实际装备列表])

  // 获取dps提升装备列表
  const getDpsUpList = (获取最佳装备?) => {
    if (开启装备智能对比) {
      setLoading(true)
      // 获取旧装备列表
      const 当前装备列表信息 = form?.getFieldsValue()
      const 当前装备信息 = 根据表单选项获取装备信息(当前装备列表信息)

      const { 秒伤: 旧秒伤 } = dispatch(
        秒伤计算({ 更新装备信息: 当前装备信息, 计算技能详情: false }),
      )

      // 传入新的装备
      const newDpsUpList = 实际装备列表
        .filter((item) => {
          let 加速对比条件 = false
          if (!对比加速) {
            if (当前选择装备 && 获取装备数据描述(当前选择装备)?.includes('加速')) {
              加速对比条件 = 获取装备数据描述(item)?.includes('加速')
            } else if (当前选择装备 && !获取装备数据描述(当前选择装备)?.includes('加速')) {
              加速对比条件 = !获取装备数据描述(item)?.includes('加速')
            }
          } else {
            加速对比条件 = true
          }
          if (获取最佳装备) {
            // CW只和CW对比
            if (当前装备信息?.装备增益?.大橙武特效) {
              if (部位 === '武器') {
                return (
                  item?.装备品级 >= (装备选择范围?.品级范围?.[0] || 0) &&
                  item?.装备品级 <= (装备选择范围?.品级范围?.[1] || 0) &&
                  item.装备特效 === 装备特效枚举.大橙武特效 &&
                  加速对比条件
                )
              } else {
                return item.装备品级 >= 18900 && 加速对比条件
              }
            } else {
              if (部位 === '武器') {
                return item.装备品级 >= 18900 && item.装备特效 !== 装备特效枚举.大橙武特效
              }
              return item.装备品级 >= 18900 && 加速对比条件
            }
          }
          const 基本条件 = item.装备品级 >= 18900 || item.装备特效 === 装备特效枚举.大橙武特效

          return 基本条件 && 加速对比条件
        })
        .map((item) => {
          const 装备最大精炼等级 = 获取最大精炼等级(item)
          // const 切换后精炼等级 = 当前精炼等级 > 装备最大精炼等级 ? 装备最大精炼等级 : 当前精炼等级

          const 新装备数据 = {
            ...allValue,
            镶嵌孔数组: item?.镶嵌孔数组?.map((a, index) => {
              return {
                ...a,
                镶嵌宝石等级: 当前镶嵌等级数组?.[index] || 默认镶嵌宝石等级,
              }
            }),
            当前精炼等级: 装备最大精炼等级,
            id: item?.id,
            装备部位: 装备位置部位枚举[部位索引],
          }

          const 更新后装备信息 = 根据表单选项获取装备信息({
            ...当前装备列表信息,
            [`${部位索引}`]: 新装备数据,
          })

          const { 秒伤: 更新后秒伤 } = dispatch(
            秒伤计算({ 更新装备信息: 更新后装备信息, 计算技能详情: false }),
          )

          const 旧伤害 = 旧秒伤 || 当前计算结果?.秒伤

          const 秒伤差异 = 更新后秒伤 ? 更新后秒伤 - 旧伤害 : 旧伤害 ? '更换后加速不匹配' : ''
          const dpsPercent = 更新后秒伤
            ? 旧伤害
              ? ((+秒伤差异 / 旧伤害) * 100).toFixed(2)
              : ''
            : ''
          return {
            uuid: `${item?.uid}${item?.id}` || '',
            id: item?.id,
            dpsUp: 秒伤差异,
            dpsPercent: dpsPercent,
          }
        })

      setLoading(false)
      if (newDpsUpList?.length) {
        if (!获取最佳装备) {
          setDpsUpList(newDpsUpList)
        }
        // 过滤因加速导致无法计算的情况
        const upDpsList = newDpsUpList?.filter((item) => Math.abs(+item.dpsUp) >= 0)
        upDpsList?.sort((a, b) => +b.dpsUp - +a.dpsUp)
        const maxId = upDpsList?.[0]?.id || undefined
        return maxId
      }
    }
  }

  /**
   * @return 返回 当前是否替换
   */
  const 选择最佳装备 = async (showTip?) => {
    setLoading(true)
    const maxId = await getDpsUpList(true)
    setLoading(false)
    if (maxId) {
      if (maxId !== allValue?.id) {
        if (showTip) {
          message.success('替换成功')
        }
        onChange?.(maxId)
        return maxId
      } else {
        if (showTip) {
          message.warning('当前已是该部位目前最优解')
        }
        return false
      }
    }
    return false
  }

  useImperativeHandle(ref, () => ({
    选择最佳装备: 选择最佳装备,
  }))

  const cls = classNames('zhuangbei-select', { 'equip-diff-change': 是否更换装备 })

  return (
    <div id='Guide_4' className={styles.zhuangbeiSelectWrapper}>
      <Select
        showSearch
        loading={loading}
        className={cls}
        placeholder={`请选择${部位}`}
        popupMatchSelectWidth={440}
        optionFilterProp='label'
        onDropdownVisibleChange={(e) => {
          if (e) {
            getDpsUpList()
          } else {
            setDpsUpList([])
          }
        }}
        listHeight={500}
        ref={ref}
        filterOption={(input, option) => {
          const findObj = 实际装备列表?.find((item) => item.id === option?.value)
          if (findObj) {
            const filterStr = `${findObj.装备名称}${获取装备数据描述(findObj).join('')}${
              findObj.装备品级
            }`
            return filterStr.includes(input.toLowerCase())
          }
          return false
        }}
        onChange={onChange}
        {...options}
      >
        {实际装备列表.map((item, i) => {
          const upItem = dpsUpList?.find((up) => up.uuid === `${item?.uid}${item?.id}`) || {
            dpsUp: 0,
            dpsPercent: 0,
          }
          return (
            <Select.Option
              className={'zhuangbei-select-item'}
              key={`${item.装备名称}-${部位索引}-${item?.id}-${i}`}
              value={item.id}
              label={item.装备名称}
            >
              <装备详情容器 装备数据={item} 当前装备信息={allValue}>
                <div className={`zhuangbei-select-item-wrap`} translate='no'>
                  {item?.图标ID ? (
                    <ImageComponent
                      key={`装备图标_${item?.id}`}
                      src={`https://icon.jx3box.com/icon/${item?.图标ID}.png`}
                      fallback={'https://icon.jx3box.com/icon/13.png'}
                      className={`zhuangbei-select-img`}
                    />
                  ) : null}
                  <span
                    className={`zhuangbei-select-name ${
                      [装备类型枚举.橙武].includes(item.装备类型) ? 'zhuangbei-select-name-cw' : ''
                    }`}
                  >
                    {item.装备名称?.replaceAll('·内', '').replaceAll('·外', '')}
                  </span>
                  <span className={'zhuangbei-select-shuoming'}>
                    {`(`}
                    {(获取装备数据描述(item) || []).map((a) => {
                      const 装备描述文本样式 = classnames(
                        'zhuangbei-miaoshu-label',
                        a === '精简' ? 'zhuangbei-miaoshu-label-jingjian' : '',
                        a === '特效' ? 'zhuangbei-miaoshu-label-texiao' : '',
                        a === 'PVX' ? 'zhuangbei-miaoshu-label-pvx' : '',
                      )

                      return (
                        <span
                          className={装备描述文本样式}
                          key={`${item.装备名称}-${item?.id}-${a}-${部位索引}`}
                        >
                          {a === '特效' ? (
                            <渐变特效文字
                              className='zhuangbei-miaoshu-label-texiao-text'
                              text={a}
                            />
                          ) : (
                            a
                          )}
                        </span>
                      )
                    })}
                    {`)`}
                  </span>
                </div>
                <div>
                  {upItem?.dpsUp !== 0 ? (
                    <span
                      className={`zhuangbei-diff ${+upItem?.dpsUp > 0 ? 'dps-up-color' : 'dps-low-color'}`}
                    >
                      {+upItem?.dpsUp > 0 ? '+' : ''}
                      {对比显示百分比 && upItem?.dpsPercent
                        ? `${upItem?.dpsPercent}%`
                        : `${upItem?.dpsUp}`}
                    </span>
                  ) : null}
                  <span className={'zhuangbei-select-level'}>{item.装备品级}</span>
                </div>
              </装备详情容器>
            </Select.Option>
          )
        })}
      </Select>
      {开启装备智能对比 ? (
        <Popover
          title='选择当前提升最大(Beta)'
          placement='right'
          mouseEnterDelay={1}
          content={
            <div>
              <p>仅选择在其他部位装备不变情况下，</p>
              <p>
                当前部位替换后
                <span className={styles.important}>当前</span>
                秒伤最高的装备，
              </p>
              <p>仅为智能对比功能的快速选择能力</p>
              <p>由于切换装备后属性收益变化，可能出现当前切换至的装备并非切换后最佳装备的情况</p>
            </div>
          }
        >
          <Button
            onClick={() => 选择最佳装备(true)}
            size='small'
            className={styles.diffIcon}
            icon={<BulbOutlined />}
          />
        </Popover>
      ) : null}
    </div>
  )
}

export default forwardRef(装备部位选择)

export const 获取装备数据描述 = (data: 装备属性信息模型, 携带描述 = true, 携带增益 = true) => {
  const { 装备增益, 装备类型, 装备特效 } = data
  const strList: string[] = []
  if (携带描述) {
    if ([装备类型枚举.特效武器].includes(装备类型) || 装备特效 === '门派特效武器') {
      strList.push('特效')
    }
    if ([装备类型枚举.PVX].includes(装备类型)) {
      strList.push('PVX')
    }
    if (
      data?.装备特效 === 装备特效枚举.风特效腰坠 ||
      (装备特效 && 副本精简特效枚举?.[装备特效]) ||
      (装备特效 && 试炼之地特效枚举?.[装备特效])
    ) {
      strList.push('特效')
    } else if ([装备类型枚举.副本精简, 装备类型枚举.试炼精简].includes(装备类型)) {
      strList.push('精简')
    }
  }
  if (携带增益) {
    装备增益.forEach((item) => {
      switch (item.属性) {
        case 属性类型.全会心等级:
        case 属性类型.外功会心等级:
        case 属性类型.内功会心等级:
          strList.push('会心')
          break
        case 属性类型.全会心效果等级:
        case 属性类型.外功会心效果等级:
        case 属性类型.内功会心效果等级:
          strList.push('会效')
          break
        case 属性类型.全破防等级:
        case 属性类型.外功破防等级:
        case 属性类型.内功破防等级:
          strList.push('破防')
          break
        case 属性类型.无双等级:
          strList.push('无双')
          break
        case 属性类型.破招值:
          strList.push('破招')
          break
        case 属性类型.全能等级:
          strList.push('全能')
          break
        case 属性类型.加速等级:
          strList.push('加速')
          break
      }
    })
  }

  return strList
}
