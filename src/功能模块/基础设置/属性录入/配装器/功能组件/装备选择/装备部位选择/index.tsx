/**
 * 装备选择
 */
import React, { forwardRef, useImperativeHandle, useEffect, useMemo, useRef, useState } from 'react'
import classnames from 'classnames'
import { Button, message, Popover, Select } from 'antd'
import { BulbOutlined } from '@ant-design/icons'

import ImageComponent from '@/组件/图片展示'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 装备部位枚举 } from '@/@types/枚举'
import {
  装备位置部位枚举,
  装备属性信息模型,
  装备特效枚举,
  装备类型枚举,
  装备选择范围类型,
  装备信息数据类型,
} from '@/@types/装备'
import { 获取装备数据描述 } from '../../../工具函数/获取装备数据描述'
import { 对比结果条目 } from '@/@types/配装指导'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'

import 根据表单选项获取装备信息 from '../../../工具函数/根据表单选项获取装备信息'
import { 根据部位索引获取装备 } from '../../../工具函数/装备表单转换'
import { 计算候选收益, 候选装备信息, 格式化收益文本 } from '../../../工具函数/计算候选收益'
import { 获取最大精炼等级 } from '..'

import 装备详情容器 from './装备详情容器'
import 渐变特效文字 from './渐变特效文字'
import styles from './index.module.less'
import './index.css'
import classNames from 'classnames'
import use移动端 from '@/hooks/use移动端'

interface 装备部位选择入参 {
  value?: number // 装备ID
  allValue?: any // 选择装备的全部信息包含附魔等
  onChange?: (e: number) => void
  装备数据列表: 装备属性信息模型[]
  部位: 装备部位枚举
  部位索引: string
  默认镶嵌宝石等级: number
  form: any
  开启装备智能对比: boolean
  对比显示百分比: boolean
  对比加速: boolean
  候选按收益排序: boolean
  装备选择范围: 装备选择范围类型
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

function 装备部位选择(props: 装备部位选择入参, ref) {
  const {
    装备数据列表,
    部位,
    部位索引,
    默认镶嵌宝石等级,
    allValue,
    form,
    开启装备智能对比,
    对比显示百分比,
    对比加速,
    候选按收益排序,
    装备选择范围,
    对比装备信息,
    循环覆盖,
    onChange,
    ...options
  } = props

  const 移动端 = use移动端()
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 页面装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 当前装备信息 = 对比装备信息 === undefined ? 页面装备信息 : 对比装备信息
  const 高亮属性 = useAppSelector((state) => state?.system?.网页设置?.行为偏好?.配装器高亮属性)
  const [dpsUpList, setDpsUpList] = useState<对比结果条目[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  // 组件初始化存储第一次进入得装备ID

  const 原始装备ID = useMemo(() => {
    return 根据部位索引获取装备(当前装备信息?.装备列表, 部位索引)?.id
  }, [当前装备信息, 部位索引])

  const 是否更换装备 = useMemo(() => {
    return 原始装备ID !== allValue?.id
  }, [原始装备ID, allValue])

  const 实际装备列表 = useMemo(() => {
    const 当前选中装备 = 装备数据列表?.find((item) => item?.id === allValue?.id)
    const 去重过滤 = (列表) =>
      列表?.filter((item) => {
        if (item.重复装备id) {
          return item.id === allValue?.id
        }
        if (当前选中装备?.重复装备id === item.id) {
          return false
        }
        return true
      })

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

      return 去重过滤(新列表)
    } else {
      return 去重过滤(装备数据列表)
    }
  }, [装备数据列表, 装备选择范围, 部位, allValue?.id])

  const 当前镶嵌等级数组 = useMemo(() => {
    return allValue?.镶嵌孔数组?.map((item) => item.镶嵌宝石等级) || []
  }, [allValue])

  // 加速对比需以真实当前装备为准：它可能因品级范围过滤而不在实际装备列表里
  const 当前选择装备 = useMemo(() => {
    return 装备数据列表.find((a) => a.id === allValue?.id)
  }, [allValue, 装备数据列表])

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
  const getDpsUpList = async (获取最佳装备?) => {
    if (开启装备智能对比 || 获取最佳装备) {
      const 本次序号 = ++请求序号.current
      setLoading(true)
      // 先让出主线程，保证下拉与 loading 状态先渲染，再进行密集计算
      await new Promise((resolve) => setTimeout(resolve, 0))
      // 获取旧装备列表
      const 当前装备列表信息 = form?.getFieldsValue()
      const 当前装备信息 = 根据表单选项获取装备信息(当前装备列表信息)

      // 传入新的装备
      const 候选装备信息列表: (候选装备信息 & { 装备id?: number })[] = 实际装备列表
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
                return item.装备品级 >= 0 && 加速对比条件
              }
            } else {
              if (部位 === '武器') {
                return item.装备品级 >= 0 && item.装备特效 !== 装备特效枚举.大橙武特效
              }
              return item.装备品级 >= 0 && 加速对比条件
            }
          }
          const 基本条件 = item.装备品级 >= 0 || item.装备特效 === 装备特效枚举.大橙武特效

          return 基本条件 && 加速对比条件
        })
        .map((item) => {
          const 装备最大精炼等级 = 获取最大精炼等级(item)

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

          return {
            id: `${item?.uid}${item?.id}` || '',
            装备id: item?.id,
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

      console.log('结果', 结果)

      if (请求序号.current !== 本次序号) {
        // 计算期间下拉已关闭或已发起新计算，丢弃本次结果
        return
      }
      setLoading(false)
      if (结果?.length) {
        if (!获取最佳装备) {
          setDpsUpList(结果)
        }
        // 过滤因加速导致无法计算的情况
        const upDpsList = 结果?.filter((item) => !item.加速不匹配)
        upDpsList?.sort((a, b) => +b.dpsUp - +a.dpsUp)
        const 最优候选 = 候选装备信息列表?.find((c) => c.id === upDpsList?.[0]?.id)
        return 最优候选?.装备id
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

  const 排序后装备列表 = useMemo(() => {
    if (!候选按收益排序 || !dpsUpList?.length) {
      return 实际装备列表
    }
    return [...实际装备列表].sort((a, b) => {
      const aItem = dpsUpList?.find((up) => up.id === `${a?.uid}${a?.id}`)
      const bItem = dpsUpList?.find((up) => up.id === `${b?.uid}${b?.id}`)
      const aDps = !aItem || aItem.加速不匹配 ? -Infinity : aItem.dpsUp
      const bDps = !bItem || bItem.加速不匹配 ? -Infinity : bItem.dpsUp
      return bDps - aDps
    })
  }, [实际装备列表, dpsUpList, 候选按收益排序])

  const cls = classNames('zhuangbei-select', { 'equip-diff-change': 是否更换装备 })

  return (
    <div id='Guide_4' className={styles.zhuangbeiSelectWrapper}>
      <Select
        showSearch
        loading={loading}
        className={cls}
        placeholder={`请选择${部位}`}
        popupMatchSelectWidth={移动端 ? undefined : 440}
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
        {排序后装备列表.map((item, i) => {
          const upItem = dpsUpList?.find((up) => up.id === `${item?.uid}${item?.id}`) || {
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
              className={'zhuangbei-select-item'}
              key={`${item.装备名称}-${部位索引}-${item?.id}-${i}`}
              value={item.id}
              label={item.装备名称}
            >
              <装备详情容器 装备数据={item} 当前装备信息={allValue} 属性差={upItem?.属性差}>
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
                    {item.装备类型 === 装备类型枚举.门派套装 && (
                      <span className={classnames('zhuangbei-miaoshu-label', styles.套装标记)}>
                        套装
                      </span>
                    )}
                    {(获取装备数据描述(item) || []).map((a) => {
                      const 装备描述文本样式 = classnames(
                        'zhuangbei-miaoshu-label',
                        a === '精简' ? 'zhuangbei-miaoshu-label-jingjian' : '',
                        a === '特效' ? 'zhuangbei-miaoshu-label-texiao' : '',
                        a === 'PVX' ? 'zhuangbei-miaoshu-label-pvx' : '',
                        高亮属性 && a === '会心' ? 'zhuangbei-miaoshu-label-huixin' : '',
                        高亮属性 && a === '会效' ? 'zhuangbei-miaoshu-label-huixiao' : '',
                        高亮属性 && a === '破防' ? 'zhuangbei-miaoshu-label-pofang' : '',
                        高亮属性 && a === '加速' ? 'zhuangbei-miaoshu-label-jiasu' : '',
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
                      {格式化收益文本(upItem?.dpsUp, upItem?.dpsPercent, 对比显示百分比)}
                    </span>
                  ) : null}
                  <span className={'zhuangbei-select-level'}>{item.装备品级}</span>
                </div>
              </装备详情容器>
            </Select.Option>
          )
        })}
      </Select>
      {开启装备智能对比 && !移动端 ? (
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

export { 获取装备数据描述 } from '../../../工具函数/获取装备数据描述'
