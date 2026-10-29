// 加速规划
import { Button, Modal, ModalProps, Table, Tag, Tooltip } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { 属性类型 } from '@/@types/属性'
import { 装备属性信息模型, 装备位置部位枚举 } from '@/@types/装备'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 秒伤计算 } from '@/计算模块/计算函数'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import 根据表单选项获取装备信息 from '../../../工具函数/根据表单选项获取装备信息'
import { 应用组合到表单 } from '../工具函数/应用组合到表单'
import useCycle from '@/hooks/use-cycle'
import { 五彩石满足潮生要求 } from '@/功能模块/基础设置/公用设置/循环约束/潮生五彩石'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { color_list } from '../加速装备选择'
import { 获取最大精炼等级 } from '../../../功能组件/装备选择'
import { 精炼加成系数算法 } from '../../../工具函数/根据装备信息获取基础属性'
import 装备详情容器 from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择/装备部位选择/装备详情容器'
import { 合并小吃数据, 提取组合小吃 } from '../工具函数/合并小吃'
import { 创建时间片让出器 } from '@/工具函数/help'
import './index.css'

interface 加速数据类型 {
  五彩石名称?: string
  附魔分配?: Record<string, number>
  id: string | number // 唯一id
  label: string // 用于展示的名字
  value: number // 提供加速值
  type: string // 计算类型 相同类型不可重复选择
  equip?: any // 额外装备数据
}

export interface 计算组合结果类型 {
  所有组合: Array<{
    组合: 加速数据类型[]
    sum: number
  }>
  锁定装备加速总和: number
  实际目标加速: number
}

interface 组合秒伤结果 {
  秒伤: number
  秒伤变化?: number
  加速不匹配: boolean
}

interface 展示行类型 {
  key: number
  组合: 加速数据类型[]
  sum: number
  秒伤?: number
  秒伤变化?: number
  加速不匹配?: boolean
  与当前一致?: boolean
}

interface 计算组合结果弹窗类型 extends ModalProps {
  计算组合结果: 计算组合结果类型 | undefined
  锁定装备: 装备属性信息模型[]
  onApply?: (组合: 加速数据类型[]) => void
  form?: any
  /**
   * @name 循环覆盖
   * 目标编辑时用目标循环/奇穴/秘籍计算组合秒伤。
   */
  循环覆盖?: 计算循环覆盖类型
  允许规划增益?: boolean
}

const 判断含增益加速 = (组合: 加速数据类型[]) => {
  return 组合?.some((item) => {
    const id = item?.id?.toString() || ''
    return id?.startsWith('小药_') || id?.startsWith('家园酒_')
  })
}

const 提取表单关键信息 = (表单值: Record<string, any>) => {
  const 部位 = Object.keys(装备位置部位枚举).map((key) => ({
    id: 表单值?.[key]?.id ?? 0,
    附魔: 表单值?.[key]?.附魔 || '',
    精炼: 表单值?.[key]?.当前精炼等级 ?? 0,
    镶嵌: (表单值?.[key]?.镶嵌孔数组 || []).map((孔) => 孔?.镶嵌宝石等级 ?? 0),
  }))
  return JSON.stringify({ 部位, 五彩石: 表单值?.五彩石 || '' })
}

const 判断表单一致 = (a: Record<string, any>, b: Record<string, any>) => {
  return 提取表单关键信息(a) === 提取表单关键信息(b)
}

const 判断小吃一致 = (小吃名称列表: string[], 当前增益数据: any, 当前增益启用: boolean) => {
  if (!小吃名称列表?.length) {
    return true
  }
  if (!当前增益启用) {
    return false
  }
  return 小吃名称列表?.every((名) => 当前增益数据?.小吃?.includes(名))
}

const 获取组合项类型信息 = (item: 加速数据类型) => {
  const id = item?.id?.toString() || ''
  const label = item?.label || ''
  const 含紫 = label?.includes('紫')

  if (item?.equip) {
    return { 类型: '装备', 样式: 'h-result-zhuangbei', 显示文本: label }
  }
  if (item?.type === '五彩石') {
    return { 类型: '五彩石', 样式: 'h-result-wucai', 显示文本: label }
  }

  if (item?.type === '附魔') {
    return {
      类型: '附魔',
      样式: 含紫 ? 'h-result-fumo-zi' : 'h-result-fumo-lan',
      显示文本: label,
    }
  }
  if (id?.startsWith('家园酒_')) {
    return { 类型: '家园酒', 样式: 'h-result-jiu', 显示文本: label }
  }
  if (id?.startsWith('小药_')) {
    return {
      类型: '小药',
      样式: 含紫 ? 'h-result-xiaoyao-zi' : 'h-result-xiaoyao-lan',
      显示文本: label,
    }
  }
  return { 类型: '装备', 样式: 'h-result-zhuangbei', 显示文本: label }
}

function 计算组合结果弹窗(props: 计算组合结果弹窗类型) {
  const {
    onCancel,
    计算组合结果,
    锁定装备,
    onApply,
    form,
    循环覆盖,
    允许规划增益 = true,
    ...rest
  } = props
  const 可用组合 = useMemo(
    () => (计算组合结果?.所有组合 || []).filter((项) => 允许规划增益 || !判断含增益加速(项.组合)),
    [计算组合结果, 允许规划增益],
  )
  const dispatch = useAppDispatch()
  const { 当前循环信息 } = useCycle({
    覆盖数据: 循环覆盖?.更新计算循环名称
      ? { 当前计算循环名称: 循环覆盖.更新计算循环名称 }
      : undefined,
  })
  const 当前增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 当前增益启用 = useAppSelector((state) => state?.data?.增益启用)

  const [dps计算中, setDps计算中] = useState<boolean>(false)
  const [秒伤结果, 设置秒伤结果] = useState<Record<number, 组合秒伤结果>>()
  const [增益提示弹窗展示, 设置增益提示弹窗展示] = useState<boolean>(false)

  const 请求序号 = useRef(0)
  useEffect(() => {
    请求序号.current++
    设置秒伤结果(undefined)
    setDps计算中(false)
    return () => {
      请求序号.current++
    }
  }, [可用组合, 循环覆盖, 当前循环信息, 当前增益数据, 当前增益启用])

  const 计算组合秒伤 = async (
    目标列表: { 原索引: number; 行: { 组合: 加速数据类型[]; sum: number } }[],
    开启增益: boolean,
  ) => {
    const 本次序号 = ++请求序号.current
    setDps计算中(true)
    const 实际开启增益 = 允许规划增益 && 开启增益
    const 当前表单值 = form?.getFieldsValue()
    const 基线装备信息 = 根据表单选项获取装备信息(当前表单值)
    const 五彩石 = 获取当前数据().五彩石
    const 基准潮生匹配 = 五彩石满足潮生要求(
      五彩石[5].concat(五彩石[6]).find((石头) => 石头.五彩石名称 === 当前表单值.五彩石),
      当前循环信息,
    )
    const 基线秒伤 =
      dispatch(
        秒伤计算({
          更新装备信息: 基线装备信息,
          更新增益启用: 实际开启增益 ? true : undefined,
          ...循环覆盖,
          计算技能详情: false,
        }),
      )?.秒伤 || 0

    const 让出主线程 = 创建时间片让出器()
    const 新结果: Record<number, 组合秒伤结果> = { ...秒伤结果 }
    let 待刷新数量 = 0
    for (const { 原索引, 行 } of 目标列表) {
      await 让出主线程()
      if (请求序号.current !== 本次序号) return
      const 组合 = 行?.组合
      try {
        const { 表单值 } = 应用组合到表单(组合, 当前表单值, 锁定装备 || [])
        const 装备信息 = 根据表单选项获取装备信息(表单值)
        let 更新增益数据
        let 更新增益启用
        if (实际开启增益) {
          更新增益启用 = true
          if (判断含增益加速(组合)) {
            const 小吃列表 = 提取组合小吃(组合)
            更新增益数据 = { 小吃: 合并小吃数据(当前增益数据?.小吃 || [], 小吃列表) }
          }
        }
        const 秒伤 = dispatch(
          秒伤计算({
            更新装备信息: 装备信息,
            更新增益数据,
            更新增益启用,
            ...循环覆盖,
            计算技能详情: false,
          }),
        )?.秒伤
        if (秒伤) {
          新结果[原索引] = {
            秒伤,
            秒伤变化: 基准潮生匹配 ? 秒伤 - 基线秒伤 : undefined,
            加速不匹配: false,
          }
        } else {
          新结果[原索引] = { 秒伤: 0, 秒伤变化: 0, 加速不匹配: true }
        }
      } catch {
        新结果[原索引] = { 秒伤: 0, 秒伤变化: 0, 加速不匹配: true }
      }
      // 渐进填充：每算完若干条即刷新表格，避免长时间空等
      待刷新数量++
      if (待刷新数量 >= 5) {
        设置秒伤结果({ ...新结果 })
        待刷新数量 = 0
      }
    }
    设置秒伤结果({ ...新结果 })
    setDps计算中(false)
  }

  const 开始计算DPS = () => {
    const 全部列表 = 可用组合?.slice(0, 50)
    const 含增益 = 全部列表?.some((行) => 判断含增益加速(行?.组合))
    if (含增益 && !当前增益启用) {
      设置增益提示弹窗展示(true)
    } else {
      计算组合秒伤(
        全部列表?.map((行, index) => ({ 原索引: index, 行 })),
        含增益,
      )
    }
  }

  const 只计算不含增益 = () => {
    设置增益提示弹窗展示(false)
    const 目标列表 = 可用组合
      ?.slice(0, 50)
      ?.map((行, index) => ({ 原索引: index, 行 }))
      ?.filter(({ 行 }) => !判断含增益加速(行?.组合))
    计算组合秒伤(目标列表, false)
  }

  const 开启增益并计算 = () => {
    设置增益提示弹窗展示(false)
    const 目标列表 = 可用组合?.slice(0, 50)?.map((行, index) => ({ 原索引: index, 行 }))
    计算组合秒伤(目标列表, true)
  }

  const 展示列表 = useMemo(() => {
    const 当前表单值 = form?.getFieldsValue()
    const 源列表: 展示行类型[] = 可用组合.map((行, index) => {
      const { 表单值, 小吃名称列表 } = 应用组合到表单(行?.组合, 当前表单值, 锁定装备 || [])
      return {
        key: index,
        ...行,
        与当前一致:
          判断表单一致(表单值, 当前表单值) &&
          判断小吃一致(小吃名称列表, 当前增益数据, 当前增益启用),
      }
    })
    const 带结果列表: 展示行类型[] = 秒伤结果
      ? 源列表.map((行) => ({ ...行, ...秒伤结果[行.key] }))
      : 源列表
    // 计算中保持原顺序渐进填充，全部算完后再统一按秒伤排序，避免行序跳动
    if (!秒伤结果 || dps计算中) {
      return 带结果列表
    }
    return [...带结果列表].sort((a, b) => {
      if (a.加速不匹配 && !b.加速不匹配) {
        return 1
      }
      if (!a.加速不匹配 && b.加速不匹配) {
        return -1
      }
      return (b.秒伤 || 0) - (a.秒伤 || 0)
    })
  }, [可用组合, 秒伤结果, dps计算中, form, 锁定装备, 当前增益数据, 当前增益启用])

  return (
    <Modal
      title={
        <div className={'haste-project-modal-title'}>
          <span>规划结果</span>
          <Button size='small' style={{ marginLeft: 12 }} loading={dps计算中} onClick={开始计算DPS}>
            计算DPS
          </Button>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>
            {秒伤结果 && !dps计算中 ? '已按秒伤降序' : '按溢出值升序'}
          </span>
        </div>
      }
      maskClosable={false}
      centered
      width={1200}
      footer={false}
      onCancel={onCancel}
      destroyOnClose
      {...rest}
    >
      <div className={'haste-project-help-wrap'}>
        {锁定装备?.length ? (
          <div className={'haste-project-result-header'}>
            <h1 className={'haste-project-result-header-title'}>锁定装备列表：</h1>
            {锁定装备?.map((item, index) => {
              const color = color_list?.[index % color_list?.length] || color_list[0]
              const 装备最大精炼等级 = 获取最大精炼等级(item)
              let 加速值 = 0
              item?.装备增益?.forEach((增益) => {
                if (增益?.属性 == 属性类型?.加速等级) {
                  const 精炼后加速值 = 精炼加成系数算法(增益.值, 装备最大精炼等级) || 0
                  加速值 = 加速值 + 精炼后加速值
                }
              })
              return (
                <Tooltip key={`加速装备已选择${item?.id}`} title={加速值 || undefined}>
                  <Tag className={`haste-equipment-select-tag`} color={color}>
                    {item?.装备名称}
                  </Tag>
                </Tooltip>
              )
            })}
          </div>
        ) : null}
        <Table
          size='small'
          dataSource={展示列表}
          rowKey='key'
          pagination={false}
          scroll={{ y: 700 }}
          columns={[
            {
              key: '组合信息',
              title: '组合信息',
              dataIndex: '组合信息',
              render: (_, row) => {
                return (
                  <div className='haste-project-result-content'>
                    {row?.与当前一致 ? <Tag color='cyan'>与当前配置一致</Tag> : null}
                    {row?.组合?.map((item) => {
                      const 类型信息 = 获取组合项类型信息(item)
                      const 部位名 = item?.equip ? 装备位置部位枚举[item?.type] : undefined
                      return (
                        <div className='haste-project-result-item' key={item?.id}>
                          <span className={`haste-project-result-type ${类型信息?.样式}`}>
                            {类型信息?.类型}
                          </span>
                          {item?.equip ? (
                            <装备详情容器
                              装备数据={item?.equip}
                              当前装备信息={{
                                当前精炼等级: 8,
                                镶嵌孔数组: item?.equip?.镶嵌孔数组?.map((a) => {
                                  return {
                                    ...a,
                                    镶嵌宝石等级: 8,
                                  }
                                }),
                              }}
                            >
                              <span
                                className={`haste-project-result-equip haste-project-result-label ${类型信息?.样式}`}
                              >
                                {部位名 ? `${部位名} · ` : ''}
                                {item?.label}
                              </span>
                            </装备详情容器>
                          ) : 类型信息?.显示文本 ? (
                            <span className={`haste-project-result-label ${类型信息?.样式}`}>
                              {类型信息?.显示文本}
                            </span>
                          ) : null}
                          <div className='haste-project-result-value'>+{item?.value}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              },
            },
            {
              key: '最终加速值',
              title: '最终加速值',
              width: 140,
              dataIndex: 'sum',
              render: (_, row) => {
                const 最终 = row?.sum + (计算组合结果?.锁定装备加速总和 || 0)
                const 溢出 = row?.sum - (计算组合结果?.实际目标加速 || 0)
                return (
                  <div>
                    <div>{最终}</div>
                    <div className='haste-project-result-sub'>
                      溢出 {溢出 > 0 ? '+' : ''}
                      {溢出}
                    </div>
                  </div>
                )
              },
            },
            {
              key: '秒伤',
              title: '秒伤',
              width: 140,
              dataIndex: '秒伤',
              render: (_, row) => {
                if (row?.加速不匹配) {
                  return <Tag color='red'>加速不匹配</Tag>
                }
                if (row?.秒伤 === undefined) {
                  return '-'
                }
                const 变化 = row?.秒伤变化
                return (
                  <div>
                    <div>{row?.秒伤}</div>
                    {变化 !== undefined && 变化 !== 0 ? (
                      <div
                        className='haste-project-result-sub'
                        style={{ color: 变化 > 0 ? '#52c41a' : '#ff4d4f' }}
                      >
                        {变化 > 0 ? '+' : ''}
                        {变化}
                      </div>
                    ) : null}
                  </div>
                )
              },
            },
            {
              key: '操作',
              title: '操作',
              width: 120,
              dataIndex: '操作',
              render: (_, row) => {
                return (
                  <Tooltip title='应用到配装器'>
                    <Button size='small' type='primary' onClick={() => onApply?.(row?.组合)}>
                      使用方案
                    </Button>
                  </Tooltip>
                )
              },
            },
          ]}
        />
      </div>
      <Modal
        title='增益加速提示'
        open={增益提示弹窗展示}
        onCancel={() => 设置增益提示弹窗展示(false)}
        footer={
          <div>
            <Button onClick={只计算不含增益}>只计算不含增益的组合</Button>
            <Button type='primary' style={{ marginLeft: 12 }} onClick={开启增益并计算}>
              开启增益并计算
            </Button>
          </div>
        }
      >
        <p>组合中包含小药/家园酒加速，需要开启增益才能准确计算 DPS。</p>
      </Modal>
    </Modal>
  )
}

export default 计算组合结果弹窗
