import React, { useMemo, useState } from 'react'
import { Alert, Checkbox, Drawer } from 'antd'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 团队增益类型枚举, 团队增益选项数据类型, 增益选项数据类型 } from '@/@types/团队增益'
import { 秒伤计算 } from '@/计算模块/计算函数'
import 团队增益图标 from '../团队增益图标'
import styles from './index.module.less'

const { 团队增益 = [] } = 获取当前数据()

function 团队增益轴设置弹窗({ open, onCancel }) {
  const 增益数据 = useAppSelector((state) => state.data.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const 当前计算结果 = useAppSelector((state) => state.data.当前计算结果)
  const dispatch = useAppDispatch()
  const [团队增益类型过滤, 设置团队增益类型过滤] = useState<团队增益类型枚举[]>(
    Object.keys(团队增益类型枚举) as any,
  )
  const [仅看已启用, 设置仅看已启用] = useState<boolean>(true)
  const [仅看旗舰, 设置仅看旗舰] = useState<boolean>(true)

  const 获取增益变化后秒伤 = (增益: 团队增益选项数据类型, 类型) => {
    let 更新后增益数据: 增益选项数据类型 = { ...增益数据 }
    if (类型 === '阵眼') {
      更新后增益数据 = { ...更新后增益数据, 阵眼: '' }
    } else {
      let 团队增益数据 = [...(增益数据?.团队增益 || [])]
      if (增益数据?.团队增益?.some((a) => a?.增益名称 === 增益?.增益名称)) {
        团队增益数据 = 增益数据?.团队增益?.map((a) => {
          if (a?.增益名称 === 增益?.增益名称) {
            return {
              ...a,
              启用: !增益?.启用,
            }
          } else {
            return { ...a }
          }
        })
        更新后增益数据 = { ...更新后增益数据, 团队增益: 团队增益数据 }
      } else {
        团队增益数据.push({
          ...增益,
          启用: true,
        })
      }
      更新后增益数据 = { ...更新后增益数据, 团队增益: 团队增益数据 }
    }
    const { 秒伤 } = dispatch(
      秒伤计算({
        更新增益数据: 更新后增益数据,
        计算技能详情: false,
      }),
    )
    return 秒伤 || 0
  }

  const 显示增益数据 = useMemo(() => {
    if (!open || !增益启用) {
      return []
    }
    const 整合增益 = 团队增益
      ?.filter((增益) => {
        const 当前增益数据: any = 增益数据?.团队增益?.find((a) => a?.增益名称 === 增益?.增益名称)
        const 启用校验 = 仅看已启用 ? !!当前增益数据?.启用 : true
        const 旗舰校验 = 仅看旗舰 ? 增益?.增益心法端 !== '无界' : true
        const 类型校验 = 增益?.团队增益类型 && 团队增益类型过滤?.includes(增益?.团队增益类型 as any)
        return 启用校验 && 旗舰校验 && 类型校验
      })
      ?.map((增益) => {
        const 当前增益数据: any = 增益数据?.团队增益?.find((a) => a?.增益名称 === 增益?.增益名称)
        const 新增益数据: any = {
          ...增益,
          ...当前增益数据,
        }
        const 变化后秒伤 = 获取增益变化后秒伤(新增益数据 as any, '增益')
        const 秒伤差值 = Math.abs(变化后秒伤 - 当前计算结果?.秒伤) || 0
        return {
          ...新增益数据,
          秒伤差值,
          秒伤比例: ((秒伤差值 / 当前计算结果?.秒伤) * 100)?.toFixed(2),
        }
      })
      ?.filter((增益) => {
        return 增益?.秒伤差值 > 0
      })
    整合增益.sort((a, b) => b.秒伤差值 - a.秒伤差值)
    return 整合增益
  }, [增益数据, open, 增益启用, 当前计算结果, 仅看已启用, 仅看旗舰, 团队增益类型过滤])

  const 最大增益提升值 = useMemo(() => {
    if (显示增益数据?.length) {
      return Math.max(...(显示增益数据?.map((a) => a?.秒伤差值) || []))
    } else {
      return -1
    }
  }, [显示增益数据])

  return (
    <Drawer
      className='tuandui-zengyi-timeline-detail-modal'
      open={open}
      title={<div>增益收益</div>}
      onClose={onCancel}
      footer={null}
      width={804}
      placement='left'
      mask={false}
      destroyOnClose
    >
      <Alert
        type='warning'
        className={styles.tip}
        message={
          <div style={{ fontWeight: 500 }}>
            <p>
              声明：本功能不能代表‘rdps’。仅对比在当前情况下 去除/启用
              某增益后的秒伤变化，不支持节奏出警。
            </p>
            <p>部分增益间存在联动性，未进行组合计算，故当前数值仅供参考。</p>
          </div>
        }
      />
      {增益启用 ? (
        <>
          <div className={styles.checkItem}>
            <h1 className={styles.checkItemTitle}>过滤选项</h1>
            <Checkbox checked={仅看已启用} onChange={(e) => 设置仅看已启用(e?.target?.checked)}>
              仅看已启用
            </Checkbox>
            <Checkbox checked={仅看旗舰} onChange={(e) => 设置仅看旗舰(e?.target?.checked)}>
              仅看旗舰
            </Checkbox>
          </div>
          <div className={styles.checkItem}>
            <h1 className={styles.checkItemTitle}>增益类型选项</h1>
            <Checkbox.Group value={团队增益类型过滤} onChange={设置团队增益类型过滤}>
              {Object.keys(团队增益类型枚举)?.map((item) => {
                return (
                  <Checkbox key={`${item}_团队增益类型枚举`} value={item}>
                    {item}
                  </Checkbox>
                )
              })}
            </Checkbox.Group>
          </div>
          {显示增益数据?.length ? (
            显示增益数据?.map((item) => {
              return (
                <div className={styles.dataWrap} key={`${item?.增益名称}_增益收益`}>
                  <div className={styles.content}>
                    <团队增益图标 data={item as any} 当前数据={item} />
                    <div className={styles.data}>
                      <h1 className={styles.name}>{item?.增益名称}</h1>
                      <span className={styles.info}>{item?.团队增益类型}</span>
                      <span className={styles.info}>
                        <span
                          className={`${styles.diffText} ${
                            item?.启用 ? 'dps-up-color' : 'dps-low-color'
                          }`}
                        >
                          {item?.启用 ? '关闭后损失' : '启用后增加'}
                        </span>
                      </span>
                      <span
                        className={`${styles.dpsItem} ${
                          item?.启用 ? 'dps-up-color' : 'dps-low-color'
                        }`}
                      >
                        {item?.秒伤差值}
                        <span>({item?.秒伤比例}%)</span>
                      </span>
                    </div>
                  </div>
                  <div
                    className={styles.dpsBg}
                    style={{
                      width: `${(item?.秒伤差值 / 最大增益提升值) * 100}%`,
                    }}
                  />
                </div>
              )
            })
          ) : (
            <p className={styles.noData}>暂无数据</p>
          )}
        </>
      ) : (
        <p className={styles.noData}>未开启增益</p>
      )}
    </Drawer>
  )
}

export default 团队增益轴设置弹窗
