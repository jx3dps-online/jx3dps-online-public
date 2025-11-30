import {
  Button,
  ModalProps,
  Spin,
  message,
  Popover,
  Input,
  Checkbox,
  Table,
  InputNumber,
  Image,
  Divider,
} from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 装备属性信息模型, 装备类型枚举 } from '@/@types/装备'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 根据装备信息获取基础属性 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据装备信息获取基础属性'
import { 角色默认基础属性 } from '@/工具函数/init/默认数据'
import { 获取最大精炼等级 } from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { v4 as uuidV4 } from 'uuid'
import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import Map from './map.json'
import './index.css'

const 教程_1 = `${GLOBAL_CDN_PREFIX}/help_equip_1.png`
const 教程_2 = `${GLOBAL_CDN_PREFIX}/help_equip_2.png`
const 教程_3 = `${GLOBAL_CDN_PREFIX}/help_equip_3.png`

const 高性价比常数 = 5
const 低性价比常数 = 3

const { 装备数据 } = 获取当前数据()

// 门派套装牌子枚举
const 门派套装牌子枚举 = {
  帽子: '帽',
  衣服: '衣',
  腰带: '腰带',
  护腕: '护腕',
  鞋子: '鞋',
}

const 识别装备对比: React.FC<ModalProps> = () => {
  const [loading, setLoading] = useState(false)
  const [dpsLoading, setDpsLoading] = useState(false)
  const [initEd, setInitEd] = useState(false)
  const [autoAction, setAutoAction] = useState(true)
  const [inputVal, setInputVal] = useState<string | undefined>(undefined)
  const equipData = useRef<装备属性信息模型[]>([])
  const [matchList, setMatchList] = useState<Array<{ name: string; id: number[]; price?: number }>>(
    [],
  )
  const [dpsDiffMap, setDpsDiffMap] = useState<{ [key: string]: number } | undefined>(undefined)
  const dispatch = useAppDispatch()

  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)

  useEffect(() => {
    if (!initEd) {
      initEquip()
    }
    return () => {
      reset()
    }
  }, [initEd])

  const reset = () => {
    setLoading(false)
    setDpsLoading(false)
    setMatchList([])
    setDpsDiffMap(undefined)
    setInputVal(undefined)
  }

  // 初始化装备数据
  const initEquip = () => {
    const list: 装备属性信息模型[] = []
    Object.keys(装备数据).map((装备部位) => {
      const 当前部位数据 = 装备数据[装备部位]
      当前部位数据.forEach((装备) => {
        if (!装备?.装备名称?.includes('无修')) {
          let 装备牌子映射 = ''
          // 门派牌子转换
          if (装备?.装备类型 === 装备类型枚举.门派套装) {
            const 套装名称 = 装备?.装备名称?.split('·')?.[0]
            const 部位名称 = 门派套装牌子枚举[装备部位]
            if (套装名称 && 部位名称 && 装备?.所属门派) {
              装备牌子映射 = `${套装名称}${部位名称}·${装备?.所属门派}`
            }
          }

          list.push({ ...装备, 装备部位, 装备牌子映射 } as any)
        }
      })
    })
    equipData.current = list
    setInitEd(true)
  }

  // 解析装备列表
  const handleGetEquip = (listStr) => {
    if (!listStr?.length) {
      reset()
      return
    }
    const regex = /\[([^\]]+)\]/g
    let match: any
    const list: string[] = []
    // 循环匹配所有结果
    while ((match = regex.exec(listStr)) !== null) {
      if (!Map.过滤掉落列表?.includes(match[1])) {
        // 将匹配到的文本添加到数组中
        list.push(match[1])
      }
    }
    if (list?.length) {
      setMatchList(
        list.map((item) => {
          return {
            name: item,
            id: uuidV4(),
          }
        }),
      )
      getDpsDiff(list)
    } else {
      reset()
      message.error('未解析到装备')
      return
    }
  }

  // 获取dps对比列表
  const getDpsDiff = (list) => {
    const obj: { [key: string]: number } = {}
    setLoading(false)
    setDpsLoading(true)
    list.forEach((item) => {
      const afterDpsDiff = getEquipDiffDps(item)
      if (afterDpsDiff !== undefined) {
        obj[item] = afterDpsDiff
      }
    })
    setDpsLoading(false)
    setDpsDiffMap(obj)
  }

  // 获取装备dps差
  const getEquipDiffDps = (name): number | undefined => {
    const 找到对应装备数据 = equipData?.current?.find(
      (item: any) => item?.装备名称 === name || item?.装备牌子映射 === name,
    )
    if (找到对应装备数据 && !name?.includes('无修')) {
      const 被替换的装备 = 装备信息.装备列表.find(
        (item) => item.装备部位 === 找到对应装备数据?.装备部位,
      )
      const 装备最大精炼等级 = 获取最大精炼等级(找到对应装备数据)

      const 新装备列表 = 装备信息.装备列表.map((item) => {
        if (item.装备部位 !== 找到对应装备数据?.装备部位) {
          return item
        } else {
          return {
            id: 找到对应装备数据.id,
            装备名称: 找到对应装备数据.装备名称,
            装备部位: 找到对应装备数据?.装备部位,
            当前精炼等级: 装备最大精炼等级,
            镶嵌孔数组: 找到对应装备数据?.镶嵌孔数组?.map((a, index) => {
              return {
                ...a,
                镶嵌宝石等级: 被替换的装备?.镶嵌孔数组?.[index]?.镶嵌宝石等级 || 8,
              }
            }),
            附魔: 被替换的装备?.附魔,
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
        className={`ocr-diff-dps-res-number ${
          data > 0 ? 'ocr-diff-dps-res-up' : data < 0 ? 'ocr-diff-dps-res-down' : ''
        }`}
      >
        {data > 0 ? `+` : ''}
        {data == 0 || data === undefined ? '-' : data}
      </div>
    )
  }

  // 根据秒伤提升排序
  const sortMatchList = useMemo(() => {
    const newList = [...matchList]
    newList.sort((a, b) => {
      if (dpsDiffMap?.[a?.name] === undefined) {
        return 1
      }
      if (dpsDiffMap?.[b?.name] === undefined) {
        return -1
      }
      return (dpsDiffMap?.[b?.name] || 0) - (dpsDiffMap?.[a?.name] || 0)
    })
    return newList.map((item) => {
      const dpsNum = dpsDiffMap?.[item?.name] || 0
      return {
        ...item,
        dps: dpsNum,
        dpsPrice: dpsNum > 0 && item.price ? (dpsNum / +item.price / 1000).toFixed(2) : '-',
      }
    })
  }, [matchList, dpsDiffMap])

  return (
    <div className={'ocr-modal'}>
      <div className={'ocr-modal-header'}>
        <h1 className={'ocr-modal-title'}>
          <Popover
            title='使用须知'
            content={
              <div>
                <h1 className={'ocr-modal-tip-title'}>使用注意</h1>
                <p>在使用前请在配装器内提前录入您的配装，以便于后续的对比</p>
                <p>
                  您可以打本时后台同步开启本网页弹窗。在打本结束后复制掉落列表，切换到本网页进行粘贴，以进行快速识别
                </p>
                <p>
                  该功能本质上是配装器内的智能对比功能，仅作为快速识别掉落列表中多个装备的情况使用
                  <span style={{ color: '#F34242' }}>仅供娱乐</span>
                </p>
                <h1 className={'ocr-modal-tip-title'}>如何获取掉落列表</h1>
                <p>1、在掉落列表左上角的菜单中点击“贴出所有物品”</p>
                <p>2、在团队中复制发送的掉落列表，到浏览器粘贴</p>
                <p>3、由于是插件自动发到团队的，可能会有点显眼包</p>
                <Divider style={{ margin: '8px 0' }} />
                <p>
                  如果你不想太显眼包，你也可以 按住 「Ctrl」 +
                  左键依次在掉落列表中点击你的装备，使它出现在聊天输入框内
                </p>
                <p style={{ marginBottom: 8 }}>
                  然后 使用 「Ctrl」+「A」全选，「Ctrl」+「X」剪切，然后到浏览器内粘贴
                </p>
                <div className={'ocr-modal-tip-image-wrap'}>
                  <Image className={'ocr-modal-tip-image'} src={教程_1} />
                  <Image className={'ocr-modal-tip-image'} src={教程_2} />
                  <Image className={'ocr-modal-tip-image'} src={教程_3} />
                </div>
              </div>
            }
          >
            <span className={'ocr-modal-tip-text'}>
              使用须知
              <QuestionCircleOutlined className={'ocr-modal-tip-icon'} />
            </span>
          </Popover>
        </h1>
        <div className={'ocr-modal-header-operates'}>
          <Checkbox checked={autoAction} onChange={(e) => setAutoAction(e?.target?.checked)}>
            输入后自动计算
          </Checkbox>
          {!autoAction ? (
            <Button
              loading={loading}
              type='primary'
              onClick={() => handleGetEquip(inputVal)}
              style={{ marginLeft: 12 }}
            >
              开始解析
            </Button>
          ) : null}
        </div>
      </div>
      <Spin
        spinning={loading || dpsLoading}
        className={'ocr-spnning'}
        tip={dpsLoading ? '计算装秒伤中，请稍后...' : '解析装备中，请稍后...'}
      >
        <Input.TextArea
          className={'ocr-upload-text-area'}
          value={inputVal}
          placeholder='请粘贴你的掉落列表，如不知道如何获取掉落列表，请查看使用须知'
          maxLength={500}
          onChange={(e) => {
            if (autoAction) {
              handleGetEquip(e?.target?.value)
            }
            setInputVal(e?.target?.value)
          }}
        />
        {sortMatchList?.length > 0 ? (
          <Table
            dataSource={sortMatchList}
            rowKey={'id'}
            size='small'
            className={'dps-price-table'}
            columns={[
              {
                title: '掉落名称',
                dataIndex: 'name',
                render: (_, row) => {
                  return <span className={`${row.dps > 0 ? 'dps-diff-name-up' : ''}`}>{_}</span>
                },
              },
              {
                title: '秒伤提升',
                dataIndex: 'dps',
                sorter: (a: any, b: any) => {
                  return (b.dps || 0) - (a.dps || 0)
                },
                render: (_) => {
                  return _ !== undefined ? <DiffDpsRes data={_} /> : '-'
                },
              },
              {
                title: '价格',
                dataIndex: 'price',
                render: (_, row) => {
                  const setNewPrice = (v) => {
                    const newList = matchList.map((item) => {
                      if (item.id === row.id) {
                        return {
                          ...item,
                          price: v,
                        }
                      } else {
                        return item
                      }
                    })
                    setMatchList(newList)
                  }
                  return row.dps > 0 && row.dps !== undefined ? (
                    <InputNumber
                      placeholder={'输入当前拍价以计算性价比'}
                      className={'dps-price-input-width'}
                      value={_}
                      onChange={(e) => setNewPrice(e)}
                      addonAfter='砖'
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
                width: 120,
                dataIndex: 'dpsPrice',
                sorter: (a: any, b: any) => b.dpsPrice - a.dpsPrice,
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
            ]}
          />
        ) : null}
      </Spin>
    </div>
  )
}

export default React.memo(识别装备对比)
