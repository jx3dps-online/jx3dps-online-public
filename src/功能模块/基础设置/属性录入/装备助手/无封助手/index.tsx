import {
  ModalProps,
  Spin,
  Popover,
  Table,
  InputNumber,
  Alert,
  Button,
  Rate,
  Checkbox,
  Tag,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 根据装备信息获取基础属性 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据装备信息获取基础属性'
import { 角色默认基础属性 } from '@/工具函数/init/默认数据'
import { 获取最大精炼等级 } from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 装备部位枚举 } from '@/@types/枚举'
import { 获取装备数据描述 } from '../../配装器/功能组件/装备选择/装备部位选择'
import 导入交易行价格弹窗 from './导入交易行价格弹窗'
import './index.css'
import { 展示装备数据列表类型 } from './interface'

const 高性价比常数 = 5
const 低性价比常数 = 3

const { 装备数据, 缓存映射 } = 获取当前数据()

const 获取缓存收藏装备 = () => {
  const listStr = localStorage?.getItem(缓存映射.收藏装备) || '[]'
  const list = JSON.parse(listStr)
  if (list.length) {
    return list
  } else {
    return []
  }
}

const 识别装备对比: React.FC<ModalProps> = () => {
  const [loading, setLoading] = useState(false)
  const [dpsLoading, setDpsLoading] = useState(false)
  const [展示装备数据列表, 更新展示装备数据列表] = useState<展示装备数据列表类型[]>([])
  const dispatch = useAppDispatch()

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const [交易行价格弹窗, 切换导入交易行价格弹窗] = useState<boolean>(false)

  const [收藏装备, 更新收藏装备] = useState<number[]>(获取缓存收藏装备() || [])
  const [只看收藏, 设置只看收藏] = useState<boolean>(false)

  const [开启组合计算, 设置开启组合计算] = useState<boolean>(false)
  const [组合计算装备, 设置组合计算装备] = useState<展示装备数据列表类型[]>([])

  useEffect(() => {
    initEquip()
    return () => {
      reset()
    }
  }, [])

  const reset = () => {
    setLoading(false)
    setDpsLoading(false)
    更新展示装备数据列表([])
  }

  // 更新装备收藏状态
  const 更新收藏状态 = (装备ID: number, 更新后状态) => {
    let 新数据: number[] = [...收藏装备]
    if (更新后状态) {
      if (!新数据?.includes(装备ID)) {
        新数据.push(装备ID)
      }
    } else {
      新数据 = 新数据.filter((item) => item !== 装备ID)
    }
    更新收藏装备(新数据)
    localStorage?.setItem(缓存映射.收藏装备, JSON.stringify(新数据))
  }

  // 解析装备列表
  const initEquip = () => {
    const list: 展示装备数据列表类型[] = []
    setLoading(false)
    setDpsLoading(true)
    Object.keys(装备数据).map((装备部位) => {
      const 当前部位数据 = 装备数据[装备部位]
      当前部位数据.forEach((装备) => {
        if (装备?.装备名称?.includes('无修')) {
          const 秒伤变化 = getEquipDiffDps({ ...装备, 装备部位 })
          list.push({
            id: 装备?.id,
            装备名称: 装备?.装备名称,
            装备部位,
            秒伤变化,
            装备品级: 装备?.装备品级,
          } as any)
        }
      })
    })
    更新展示装备数据列表(list)
    setDpsLoading(false)
  }

  // 获取装备dps差
  const getEquipDiffDps = (对应装备数据): number | undefined => {
    if (对应装备数据) {
      const 装备最大精炼等级 = 获取最大精炼等级(对应装备数据)
      const 新装备列表 = 装备信息.装备列表.map((被替换装备) => {
        if (被替换装备.装备部位 !== 对应装备数据?.装备部位) {
          return 被替换装备
        } else {
          return {
            id: 对应装备数据.id,
            装备名称: 对应装备数据.装备名称,
            装备部位: 对应装备数据?.装备部位,
            当前精炼等级: 装备最大精炼等级,
            镶嵌孔数组: 对应装备数据?.镶嵌孔数组?.map((a, index) => {
              return {
                ...a,
                镶嵌宝石等级: 被替换装备?.镶嵌孔数组?.[index]?.镶嵌宝石等级 || 8,
              }
            }),
            附魔: 被替换装备?.附魔,
          } as any
        }
      })

      const { 大附魔_伤帽, 大附魔_伤衣, 大附魔_伤腰, 大附魔_伤腕, 大附魔_伤鞋 } =
        装备信息?.装备增益 || {}

      const 更新后装备信息 = 根据装备信息获取基础属性({
        ...装备信息,
        装备基础属性: { ...角色默认基础属性 },
        装备列表: 新装备列表,
        装备增益: { 大附魔_伤帽, 大附魔_伤衣, 大附魔_伤腰, 大附魔_伤腕, 大附魔_伤鞋 },
      })

      const { 秒伤: 更新后秒伤 } = dispatch(
        秒伤计算({ 更新装备信息: 更新后装备信息, 计算技能详情: false }),
      )
      return 更新后秒伤 - 当前计算结果?.秒伤
    } else {
      return undefined
    }
  }

  // 对比结果显示组件
  const DiffDpsRes = ({ data = 0 }) => {
    return (
      <div
        className={`wufeng-diff-dps-res-number ${
          data > 0 ? 'wufeng-diff-dps-res-up' : data < 0 ? 'wufeng-diff-dps-res-down' : ''
        }`}
      >
        {data > 0 ? `+` : ''}
        {data == 0 || data === undefined ? '-' : data}
        {data > 0 ? `（${((data / 当前计算结果?.秒伤) * 100).toFixed(1)}%）` : ''}
      </div>
    )
  }

  // 根据秒伤提升排序
  const sortMatchList = useMemo(() => {
    const newList = [...展示装备数据列表]
    newList.sort((a, b) => {
      return (b?.秒伤变化 || 0) - (a?.秒伤变化 || 0)
    })
    return newList
      .filter((item: any) => {
        if (只看收藏) {
          return 收藏装备?.includes(item?.id)
        } else {
          return true
        }
      })
      .map((item) => {
        const dpsNum = item?.秒伤变化
        return {
          ...item,
          dpsPrice: dpsNum > 0 && item.price ? (dpsNum / +item.price / 1000).toFixed(2) : '-',
        }
      })
  }, [展示装备数据列表, 只看收藏, 收藏装备])

  const rowSelection = {
    selectedRowKeys: 组合计算装备?.map((item) => item?.id as any),
    onChange: (_, selectedRows: 展示装备数据列表类型[]) => {
      设置组合计算装备(selectedRows)
    },
    hideSelectAll: true,
    getCheckboxProps: (record) => {
      // 判断如果已经有选的同部位，不可以继续选择
      if (
        组合计算装备?.find((item) => item?.装备部位 === record?.装备部位 && item?.id !== record?.id)
      ) {
        return {
          disabled: true,
        }
      } else {
        return {}
      }
    },
  }

  const 批量更新价格 = (装备数据) => {
    const 新数据 = 展示装备数据列表.map((item) => {
      const 找到价格数据 = 装备数据?.find((a) => a?.id === item?.id)?.价格数据
      if (找到价格数据 && !isNaN(找到价格数据?.LowestPrice)) {
        // 获取到的价格为铜，转换为砖后
        // 10000*100*100
        const 实际价格计算 = 找到价格数据?.LowestPrice / (10000 * 100 * 100)
        return {
          ...item,
          price: 实际价格计算,
        }
      } else {
        return item
      }
    })
    更新展示装备数据列表(新数据)
  }

  const 组合计算结果 = useMemo(() => {
    let 新装备列表 = [...装备信息.装备列表]
    组合计算装备.forEach((装备) => {
      const 对应装备数据 =
        装备数据?.[装备?.装备部位]?.find((item) => item?.id === 装备?.id) || ({} as any)

      const 装备最大精炼等级 = 获取最大精炼等级(对应装备数据)
      新装备列表 = 新装备列表.map((被替换装备) => {
        if (被替换装备.装备部位 !== 装备?.装备部位) {
          return 被替换装备
        } else {
          return {
            id: 对应装备数据.id,
            装备名称: 对应装备数据.装备名称,
            装备部位: 被替换装备?.装备部位,
            当前精炼等级: 装备最大精炼等级,
            镶嵌孔数组: 对应装备数据?.镶嵌孔数组?.map((a, index) => {
              return {
                ...a,
                镶嵌宝石等级: 被替换装备?.镶嵌孔数组?.[index]?.镶嵌宝石等级 || 8,
              }
            }),
            附魔: 被替换装备?.附魔,
          } as any
        }
      })
    })

    const { 大附魔_伤帽, 大附魔_伤衣, 大附魔_伤腰, 大附魔_伤腕, 大附魔_伤鞋 } =
      装备信息?.装备增益 || {}

    const 更新后装备信息 = 根据装备信息获取基础属性({
      ...装备信息,
      装备基础属性: { ...角色默认基础属性 },
      装备列表: 新装备列表,
      装备增益: { 大附魔_伤帽, 大附魔_伤衣, 大附魔_伤腰, 大附魔_伤腕, 大附魔_伤鞋 },
    })

    const { 秒伤: 更新后秒伤 } = dispatch(
      秒伤计算({ 更新装备信息: 更新后装备信息, 计算技能详情: false }),
    )
    return 更新后秒伤 - 当前计算结果?.秒伤
  }, [组合计算装备, 当前计算结果, 角色默认基础属性, 装备信息])

  return (
    <>
      <div className={'wufeng-modal'}>
        <div className={'wufeng-modal-header'}>
          <Alert
            className={'wufeng-modal-alert'}
            type='warning'
            message={
              <div>
                <p>
                  注意：本功能仅为替换单件装备的秒伤期望，容易落入局部最优解陷阱。仅做参考。选购前最好结合完整配装进行分析。
                </p>
              </div>
            }
          />
          <div>
            <Checkbox
              style={{ marginRight: 12 }}
              checked={只看收藏}
              onChange={(e) => 设置只看收藏(e?.target?.checked)}
            >
              只看收藏
            </Checkbox>
            <Button type='primary' onClick={() => 切换导入交易行价格弹窗(true)}>
              导入交易行价格
            </Button>
          </div>
        </div>
        <Spin
          spinning={loading || dpsLoading}
          className={'wufeng-spnning'}
          tip={dpsLoading ? '计算装秒伤中，请稍后...' : '解析装备中，请稍后...'}
        >
          <Table
            rowSelection={开启组合计算 ? rowSelection : undefined}
            dataSource={sortMatchList}
            rowKey={'id'}
            size='small'
            className={'dps-price-table'}
            pagination={{ showSizeChanger: false }}
            columns={[
              {
                title: '装备信息',
                width: 300,
                dataIndex: '装备名称',
                filters: 筛选属性.map((item) => {
                  return { text: item, value: item }
                }),
                onFilter: (value, row) => {
                  const 获取装备信息 =
                    装备数据?.[row?.装备部位]?.find((item) => item?.id === row?.id) || ({} as any)
                  return 获取装备数据描述(获取装备信息, false)?.includes(value as any)
                },
                render: (_, row) => {
                  const 获取装备信息 =
                    装备数据?.[row?.装备部位]?.find((item) => item?.id === row?.id) || ({} as any)
                  return (
                    <div className={`wufeng-equip-info`}>
                      <span className={`wufeng-equip-name`}>{_}</span>
                      {获取装备信息 ? (
                        <span className={'dps-diff-zhuangbei-select-shuoming'}>
                          {(获取装备数据描述(获取装备信息, false) || []).map((a) => {
                            return <span key={`${row.装备名称}-${a}-${row?.id}`}>{a}</span>
                          })}
                        </span>
                      ) : null}
                    </div>
                  )
                },
              },
              {
                title: '装备部位',
                width: 130,
                dataIndex: '装备部位',
                filters: Object.keys(装备部位枚举)
                  ?.filter((item) => !['衣服', '戒指', '腰带', '武器']?.includes(item))
                  .map((item) => {
                    return { text: item, value: item }
                  }),
                onFilter: (value, record) => record.装备部位?.indexOf(value as string) === 0,
              },
              {
                title: '装备品级',
                width: 130,
                dataIndex: '装备品级',
                sorter: (a: any, b: any) => {
                  return (b.装备品级 || 0) - (a.装备品级 || 0)
                },
              },
              {
                title: '秒伤提升',
                dataIndex: '秒伤变化',
                sorter: (a: any, b: any) => {
                  return (b.秒伤变化 || 0) - (a.秒伤变化 || 0)
                },
                render: (_) => {
                  return _ !== undefined ? <DiffDpsRes data={_} /> : '-'
                },
              },
              {
                title: '价格',
                dataIndex: 'price',
                sorter: (a: any, b: any) => {
                  return (b.price || 0) - (a.price || 0)
                },
                width: 200,
                render: (_, row) => {
                  const setNewPrice = (v) => {
                    const newList = 展示装备数据列表.map((item) => {
                      if (item.id === row.id) {
                        return {
                          ...item,
                          price: v,
                        }
                      } else {
                        return item
                      }
                    })
                    更新展示装备数据列表(newList)
                  }
                  return row.秒伤变化 > 0 && row.秒伤变化 !== undefined ? (
                    <InputNumber
                      className='wufeng-dps-price-input-width'
                      placeholder={'手动输入价格'}
                      value={_}
                      onChange={(e) => setNewPrice(e)}
                      addonAfter='砖'
                      size='small'
                    />
                  ) : (
                    '-'
                  )
                },
              },
              {
                title: (
                  <Popover
                    title={'性价比解释说明'}
                    placement='left'
                    content={
                      <div>
                        <p>根据秒伤和拍价计算的性价比，仅供参考。理性消费！</p>
                        <p>计算公式：秒伤提升/价格*1000</p>
                        <p>红色为低性价比，阈值暂定 3</p>
                        <p>绿色为高性价比，阈值暂定 5</p>
                      </div>
                    }
                  >
                    性价比
                  </Popover>
                ),
                width: 130,
                dataIndex: 'dpsPrice',
                sorter: (a: any, b: any) => {
                  if (b.dpsPrice !== '-' && a.dpsPrice !== '-') {
                    return Number(b.dpsPrice) - Number(a.dpsPrice)
                  } else if (b.dpsPrice !== '-' && a.dpsPrice === '-') {
                    return 1
                  } else {
                    return -999
                  }
                },
                render: (v) => {
                  return (
                    <span
                      className={`${
                        v >= 高性价比常数
                          ? 'dps-hight-dps-price'
                          : v <= 低性价比常数
                            ? 'dps-low-dps-price'
                            : ''
                      } dps-price-number`}
                    >
                      {v}
                    </span>
                  )
                },
              },
              {
                title: '标记',
                dataIndex: '收藏',
                width: 50,
                render: (_, row: any) => {
                  const 当前是否收藏 = 收藏装备?.includes(row?.id)
                  return (
                    <Rate
                      tooltips={当前是否收藏 ? ['取消收藏'] : ['收藏该装备']}
                      onChange={() => 更新收藏状态(row?.id, !当前是否收藏)}
                      value={当前是否收藏 ? 1 : 0}
                      count={1}
                    />
                  )
                },
              },
            ]}
          />
        </Spin>
        <div className={'wufeng-modal-footer'}>
          <Button
            type={开启组合计算 ? 'primary' : 'primary'}
            danger={开启组合计算}
            onClick={() => {
              if (开启组合计算) {
                设置组合计算装备([])
              }
              设置开启组合计算(!开启组合计算)
            }}
          >
            {开启组合计算 ? '关闭组合计算' : '开启组合计算'}
          </Button>
          {开启组合计算 ? (
            <div className='wufeng-group-dps-res'>
              <div className='wufeng-group-dps-res-num'>
                秒伤变化：
                <DiffDpsRes data={组合计算结果} />
              </div>
              <div className='wufeng-group-dps-res-equips'>
                已选装备：
                {组合计算装备?.map((item) => {
                  const 获取装备信息 =
                    装备数据?.[item?.装备部位]?.find((a) => a?.id === item?.id) || ({} as any)
                  const 装备信息 = 获取装备数据描述(获取装备信息, false)
                  return (
                    <Tag key={item?.id} color={部位颜色映射[item?.装备部位]}>{`${
                      item?.装备名称
                    } ${装备信息?.join(' ')} ${item?.装备品级}`}</Tag>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
        <导入交易行价格弹窗
          open={交易行价格弹窗}
          导入价格={(data) => {
            批量更新价格(data)
            切换导入交易行价格弹窗(false)
          }}
          展示装备数据列表={展示装备数据列表}
          onCancel={() => 切换导入交易行价格弹窗(false)}
        />
      </div>
    </>
  )
}

export default React.memo(识别装备对比)

const 筛选属性 = [
  '会心',
  '会效',
  '破防',
  '无双',
  '破招',
  // '全能',
  // '加速',
]

const 部位颜色映射 = {
  帽子: 'magenta',
  护腕: 'red',
  下装: 'volcano',
  鞋子: 'green',
  项链: 'blue',
  腰坠: 'purple',
  暗器: 'cyan',
}
