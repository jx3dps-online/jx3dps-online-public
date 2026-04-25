/**
 * @name 装备速查表
 */

import { Button, Form, Select, Slider, Table, Tag, Tooltip } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取装备数据描述 } from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择/装备部位选择'
import 装备详情容器 from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择/装备部位选择/装备详情容器'

import { useEffect, useState } from 'react'
import { 装备类型枚举 } from '@/@types/装备'
import { 装备速查数据 } from './interface'
import 计算装备容量, { 分数放大系数 } from './计算装备容量'
import ImageComponent from '@/组件/图片展示'
import 渐变特效文字 from '../../../../基础设置/属性录入/配装器/功能组件/装备选择/装备部位选择/渐变特效文字'
import styles from './index.module.less'
import classNames from 'classnames'
import { 属性简写枚举 } from '@/@types/枚举'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { 获取武伤附魔数据 } from '@/数据/附魔/武器伤害附魔'
import { 属性类型 } from '@/@types/属性'

const { 附魔, 装备数据 } = 获取当前数据()

const 英雄品 = [35900, 43000]
const 普通品 = [30800, 35899]
const 类型 = ['散件', '精简', '无修', '橙武']

const 装备速查 = () => {
  const [form] = Form.useForm()
  const [品级范围, 设置品级范围] = useState<number[]>(英雄品)
  const [展示数据, 更新展示数据] = useState<装备速查数据[]>([])
  const [最大容量, 更新最大容量] = useState<number>(1)
  const [自定义容量系数, 更新自定义容量系数] = useState<Record<string, number>>({})

  useEffect(() => {
    初始化容量系数()
  }, [])

  const 初始化容量系数 = () => {
    const 附魔 = 获取当前各属性最大附魔()
    const 武伤附魔 = 获取武伤附魔数据('力道')
    const 武伤最大附魔 = 武伤附魔?.[0]
    附魔.push({
      属性: 属性类型.武器伤害,
      值: 武伤最大附魔?.增益集合?.[0]?.值 || 0,
    })
    const 容量对象 = 附魔
      ?.filter((a) => a.属性 !== 属性类型.额外气血上限)
      .reduce(
        (acc, cur) => {
          acc[cur.属性] = cur.值
          return acc
        },
        {} as Record<string, any>,
      )

    更新自定义容量系数(容量对象)
    form.setFieldsValue({
      部位: Object.keys(装备数据)?.[0],
      品级范围: 英雄品,
      类型: 类型,
      容量计算属性: Object.keys(容量对象),
    })
    更换表单筛选(
      {},
      {
        部位: Object.keys(装备数据)?.[0],
        品级范围: 英雄品,
        类型: 类型,
        容量计算属性: Object.keys(容量对象),
      },
      容量对象,
    )
  }

  const 更换表单筛选 = (_, values, 容量对象?) => {
    const 目标部位数据 = 装备数据[values.部位]
    const 筛选后数据 = 目标部位数据
      .filter((item) => {
        if (values?.品级范围?.length) {
          return item.装备品级 >= values.品级范围?.[0] && item.装备品级 <= values.品级范围?.[1]
        } else {
          return true
        }
      })
      .filter((item) => {
        if (item?.装备名称?.includes('无修')) {
          return values?.类型?.includes('无修')
        } else if (item?.装备类型 === 装备类型枚举.副本精简) {
          return values?.类型?.includes('精简')
        } else if (item?.装备类型 === 装备类型枚举.橙武) {
          return values?.类型?.includes('橙武')
        }
        // return true
        return values?.类型?.includes('散件')
      })

    const 最终数据 = 计算装备容量(
      筛选后数据,
      values.部位,
      values.容量计算属性,
      容量对象 || 自定义容量系数,
    )

    最终数据.sort((a, b) => {
      return (b.属性容量 || 0) + (b?.特效容量 || 0) - ((a.属性容量 || 0) + (a?.特效容量 || 0))
    })

    const maxAttr = 最终数据?.[0]?.属性容量
    const maxEffect = Math.max(
      ...最终数据.map((item) => {
        return item.特效容量
      }),
    )

    更新最大容量(maxEffect + maxAttr)

    更新展示数据(最终数据)
  }

  const columns: ColumnsType<装备速查数据> = [
    {
      title: '名称',
      dataIndex: '装备名称',
      width: 350,
      key: 'name',
      render: (text, record) => {
        return (
          <装备详情容器
            装备数据={record}
            当前装备信息={{
              当前精炼等级: 8,
              镶嵌孔数组: record?.镶嵌孔数组?.map((a) => {
                return {
                  ...a,
                  镶嵌宝石等级: 8,
                }
              }),
            }}
          >
            <div className={styles.nameWrapper}>
              {record?.图标ID ? (
                <ImageComponent
                  key={`装备图标_${record?.id}`}
                  src={`https://icon.jx3box.com/icon/${record?.图标ID}.png`}
                  fallback={'https://icon.jx3box.com/icon/13.png'}
                  className={styles.image}
                />
              ) : null}
              <div
                className={`${styles.name}
                      ${[装备类型枚举.橙武].includes(record.装备类型) ? styles.nameCW : ''}
            `}
              >
                {record?.装备名称}
              </div>
              <span className={'zhuangbei-select-shuoming'}>
                {`(`}
                {(获取装备数据描述(record) || []).map((a) => {
                  const 装备描述文本样式 = classNames(
                    'zhuangbei-miaoshu-label',
                    a === '精简' ? 'zhuangbei-miaoshu-label-jingjian' : '',
                    // a === '特效' ? 'zhuangbei-miaoshu-label-texiao' : '',
                    a === 'PVX' ? 'zhuangbei-miaoshu-label-pvx' : '',
                  )

                  return (
                    <span
                      className={装备描述文本样式}
                      key={`${record.装备名称}-${record?.id}-${a}`}
                    >
                      {a === '特效' ? (
                        <渐变特效文字 className='zhuangbei-miaoshu-label-texiao-text' text={a} />
                      ) : (
                        a
                      )}
                    </span>
                  )
                })}
                {`)`}
              </span>
            </div>
          </装备详情容器>
        )
      },
    },
    {
      title: '品级',
      dataIndex: '装备品级',
      key: 'level',
      width: 100,
    },
    {
      title: '属性',
      dataIndex: '装备属性',
      key: 'attr',
      filters: Object.keys(ColorMap).map((item) => {
        return { text: item, value: item }
      }),
      onFilter: (value, record) => {
        const 展示列表 = 获取属性列表(record)
        return 展示列表?.some((a) => a?.名称 === value)
      },
      render: (text, record) => {
        const 展示列表 = 获取属性列表(record)
        return (
          <div className={styles.attrWrap}>
            {展示列表?.map((a) => {
              return (
                <div key={`${record?.id}_${a?.名称}`} className={styles.attrItem}>
                  <Tag className={styles.attrLabel} color={ColorMap?.[a?.名称]}>
                    {a?.名称}
                  </Tag>
                  <div className={styles.attrValue}>{a?.数值}</div>
                </div>
              )
            })}
          </div>
        )
      },
    },
    {
      title: (
        <div>
          属性容量分
          <Tooltip
            title={`该装备各属性值除以紫色附魔对应数值后乘${分数放大系数}，非标准分数，仅供相对参考`}
          >
            <QuestionCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </div>
      ),
      dataIndex: '属性容量',
      key: 'data',
      width: 400,
      sorter: (a, b) => {
        return (a.属性容量 || 0) + (a?.特效容量 || 0) - ((b.属性容量 || 0) + (b?.特效容量 || 0))
      },
      render: (text, record) => {
        return (
          <div className={styles.attrCapacity}>
            <div className={styles.attrCapacityText}>
              <span className={styles.attrCapacityTextItem}>
                <span className={styles.attrCapacityTextItem}>
                  {(record?.属性容量 + record?.特效容量)?.toFixed(0)}
                </span>
              </span>

              {record?.特效容量 ? (
                <>
                  <span className={styles.attrCapacityTextItem}>
                    {' = '}
                    <span className={styles.attrCapacityTextItem}>
                      {record?.属性容量?.toFixed(0)}
                    </span>
                  </span>
                  <span className={styles.attrCapacityTextItem}>
                    {`+ `}
                    <span className={styles.attrCapacityTextItem}>
                      {record?.特效容量?.toFixed(0)}（特效）
                    </span>
                  </span>
                </>
              ) : null}
            </div>
            <div className={styles.attrCapacityBg}>
              <Tooltip title={`装备基础容量分：${record?.属性容量.toFixed(0)}`}>
                <div
                  className={styles.attrCapacityBgAttr}
                  style={{ width: `${(record?.属性容量 / 最大容量) * 100}%` }}
                />
              </Tooltip>
              <Tooltip title={`装备特效附加容量分：${record?.特效容量.toFixed(0)}`}>
                <div
                  className={styles.attrCapacityBgEffect}
                  style={{ width: `${(record?.特效容量 / 最大容量) * 100}%` }}
                />
              </Tooltip>
            </div>
          </div>
        )
      },
    },
    {
      title: '容量装分比',
      dataIndex: '容量装分比',
      key: '容量装分比',
      width: 140,
      sorter: (a, b) => {
        return (a.容量装分比 || 0) - (b.容量装分比 || 0)
      },
      render: (text) => {
        return text.toFixed(4)
      },
    },
  ]

  return (
    <div>
      {/* 预渲染，避免select特效显示异常 */}
      <div style={{ overflow: 'hidden', width: 0, height: 0 }}>
        <渐变特效文字 text={'预渲染'} />
      </div>
      <div className={styles.formWrapper}>
        <Form layout='vertical' className={styles.form} form={form} onValuesChange={更换表单筛选}>
          <Form.Item label='装备部位' name='部位' className={styles.formItem}>
            <Select
              placeholder='请选择'
              options={Object.keys(装备数据).map((key) => {
                return {
                  label: key,
                  value: key,
                }
              })}
            />
          </Form.Item>
          <Form.Item label='装备类型' name='类型' className={styles.formItem}>
            <Select
              mode='multiple'
              placeholder='请选择'
              options={类型.map((key) => {
                return {
                  label: key,
                  value: key,
                }
              })}
            />
          </Form.Item>
          <Form.Item
            className={styles.formItem}
            style={{ width: 460 }}
            name='品级范围'
            label={
              <div className={'zhuangbei-scope-label'}>
                <div>
                  品级范围
                  {品级范围?.length ? (
                    <span className={'zhuangbei-scope-level-number'}>
                      ({品级范围?.[0]}-{品级范围?.[1]})
                    </span>
                  ) : null}
                </div>
                <div className={'zhuangbei-scope-level-label-btns'}>
                  <Tag
                    className={'zhuangbei-scope-level-label-tag'}
                    color='green'
                    onClick={(e) => {
                      e?.preventDefault()
                      设置品级范围(英雄品)
                      form.setFieldValue('品级范围', 英雄品)
                      更换表单筛选(
                        {},
                        {
                          部位: Object.keys(装备数据)?.[0],
                          类型: 类型,
                          品级范围: 英雄品,
                        },
                      )
                    }}
                  >
                    英雄
                  </Tag>
                  <Tag
                    className={'zhuangbei-scope-level-label-tag'}
                    color='blue'
                    onClick={(e) => {
                      e?.preventDefault()
                      设置品级范围(普通品)
                      form.setFieldValue('品级范围', 普通品)
                      更换表单筛选(
                        {},
                        {
                          部位: Object.keys(装备数据)?.[0],
                          类型: 类型,
                          品级范围: 普通品,
                        },
                      )
                    }}
                  >
                    普通
                  </Tag>
                  <Button
                    type='link'
                    danger
                    size='small'
                    onClick={() => {
                      设置品级范围([])
                      form.setFieldValue('品级范围', [])
                      更换表单筛选(
                        {},
                        {
                          部位: Object.keys(装备数据)?.[0],
                          类型: 类型,
                          品级范围: [],
                        },
                      )
                    }}
                  >
                    清空
                  </Button>
                </div>
              </div>
            }
          >
            <Slider
              range
              max={43000}
              min={16500}
              value={品级范围}
              step={500}
              marks={{
                30200: '十人副本',
                35300: '普通副本',
                41400: '英雄副本',
              }}
              // tooltip={{ open: true }}
              onChange={(e) => 设置品级范围(e)}
            />
          </Form.Item>
          <Form.Item
            label='容量计算属性'
            name='容量计算属性'
            className={styles.formItem}
            style={{ flex: 1 }}
          >
            <Select mode='multiple'>
              {Object.keys(自定义容量系数).map((key) => {
                return (
                  <Select.Option key={key} value={key}>
                    {属性简写枚举[key]}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>
        </Form>
      </div>
      {展示数据?.length ? (
        <Table
          className={styles.table}
          // scroll={{
          //   y: `calc(100vh - 400px)`,
          //   x: '100%',
          // }}
          dataSource={展示数据}
          columns={columns}
          pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 件装备` }}
        />
      ) : null}
    </div>
  )
}

export default 装备速查

const 获取属性列表 = (装备: 装备速查数据) => {
  const 列表: any[] = []
  if (装备?.武器伤害_最大值) {
    列表.push({
      名称: '武伤',
      数值: `${(装备?.武器伤害_最小值 || 0) + (装备?.武器伤害_最大值 || 0) / 2}`,
    })
  }
  装备?.装备增益?.forEach((item) => {
    if (属性简写枚举[item?.属性]) {
      列表.push({
        名称: 属性简写枚举[item?.属性],
        数值: item?.值,
      })
    } else {
      console.error('属性简写枚举没有找到对应属性', item?.属性, 装备)
    }
  })
  return 列表
}

const ColorMap = {
  体质: 'magenta',
  攻击: 'red',
  力道: 'volcano',
  身法: 'volcano',
  根骨: 'volcano',
  元气: 'volcano',
  会心: 'orange',
  会效: 'gold',
  破防: 'lime',
  破招: 'green',
  无双: 'cyan',
  加速: 'blue',
  武伤: 'geekblue',
  全能: 'purple',
}

export const 获取当前各属性最大附魔 = () => {
  const res = {}
  附魔?.forEach((item) => {
    if (item?.挑战附魔) {
      return
    }
    const 附魔属性 = item?.增益集合?.[0]?.属性 || ''
    const 附魔数值 = item?.增益集合?.[0]?.值 || 0
    if (!res?.[附魔属性] || res[附魔属性] < 附魔数值) {
      res[附魔属性] = 附魔数值
    }
  })
  const resList = Object.keys(res).map((key) => {
    return {
      属性: key,
      值: res[key],
    }
  })

  const 无双数据 = resList?.find((item) => item?.属性 === 属性类型.无双等级)?.值
  resList.push({
    属性: 属性类型.全能等级,
    值: Math.floor(无双数据 / 2),
  })

  return resList
}
