import React from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { App, Divider, Popover, Select, Tooltip } from 'antd'
import { 更新方案数据 } from '@/store/data'
import classnames from 'classnames'
import useCycle from '@/hooks/use-cycle'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import { 根据循环判断快照计算列表 } from '@/计算模块/统一工具函数/增益计算函数'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 装备部位枚举 } from '@/@types/枚举'
import { 装备位置部位枚举, 装备特效枚举 } from '@/@types/装备'
import classNames from 'classnames'
import './index.css'

const { 装备数据 } = 获取当前数据()

function 循环选择(props) {
  const { className, 不提示循环, 不更新秒伤 } = props
  const { modal } = App.useApp()
  const dispatch = useAppDispatch()
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)

  const { 全部循环 = [], 计算循环详情 } = useCycle()

  const 切换循环前校验 = (val) => {
    const 目标循环数据 = 全部循环?.find((item) => item?.名称 === val)
    const 目标循环标记 = 目标循环数据?.标记
    const 武器ID = 装备信息?.装备列表?.find((a) => a?.装备部位 === 装备位置部位枚举?._12)?.id
    const 全部装备数据 = 装备数据?.[装备部位枚举?.武器]
    const 当前武器数据 = 全部装备数据?.find((a) => a?.id === 武器ID)
    const 当前武器类型 = 当前武器数据?.装备类型
    const 当前武器特效 = 当前武器数据?.装备特效
    if (当前武器类型 && 目标循环标记) {
      let 当前武器标记 = ''
      switch (当前武器特效) {
        case 装备特效枚举?.大橙武特效:
          当前武器标记 = '橙武'
          break
        case 装备特效枚举?.门派特效武器:
          当前武器标记 = '特效'
          break
        default:
          当前武器标记 = '紫武'
      }
      if (['橙武', '特效']?.includes(目标循环标记) && 当前武器标记 !== 目标循环标记) {
        modal.confirm({
          title: '选择循环和当前装备不匹配',
          content: (
            <div>
              <p>武器不匹配会导致错误的计算结论。</p>
              <p>
                当前武器类型为
                <TagItem val={当前武器标记} />，
              </p>
              <p>
                确定要切换到
                <TagItem val={目标循环标记} />
                武器专用循环吗？
              </p>
            </div>
          ),
          onOk: () => {
            切换循环(val)
          },
        })
      } else {
        切换循环(val)
      }
    } else {
      切换循环(val)
    }
  }

  const 切换循环 = (val) => {
    const 目标循环数据 = 全部循环?.find((item) => item?.名称 === val)
    dispatch(更新方案数据({ 属性: '当前计算循环名称', 数据: val }))
    dispatch(更新方案数据({ 属性: '当前奇穴信息', 数据: 目标循环数据?.奇穴 }))
    const 实际计算循环秘籍信息 = 获取实际计算循环秘籍信息(val)

    if (实际计算循环秘籍信息 && Object.keys(实际计算循环秘籍信息)?.length) {
      dispatch(更新方案数据({ 属性: '当前秘籍信息', 数据: 实际计算循环秘籍信息 }))
    }
    if (!不更新秒伤) {
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
    }
  }

  const 获取实际计算循环秘籍信息 = (循环名称) => {
    let 循环默认秘籍 = {}
    const 目标循环数据 = 全部循环?.find((item) => item?.名称 === 循环名称)
    if (目标循环数据 && 目标循环数据?.秘籍) {
      循环默认秘籍 = { ...目标循环数据?.秘籍 }
    }
    // 部分加速的秘籍内置在加速循环详情中，此时需要覆盖
    if (计算循环详情?.秘籍) {
      循环默认秘籍 = { ...计算循环详情?.秘籍 }
    }
    return 循环默认秘籍
  }

  const cls = classNames('common-item', className)

  return (
    <div className={cls}>
      <h1 className='common-label'>循环</h1>
      <div className='common-content'>
        <Select
          value={当前计算循环名称}
          className='cycle-select'
          onChange={(v) => {
            if (不提示循环) {
              切换循环(v)
            } else {
              切换循环前校验(v)
            }
          }}
          optionFilterProp='label'
          popupMatchSelectWidth={300}
          dropdownRender={(menu) => (
            <>
              {menu}
              {/* <Divider style={{ margin: '8px 0' }} />
              <div className='cycle-select-cycle-out'>
                <Tooltip title='点击访问魔盒教程，定制自己的循环计算吧！'>
                  <a target='_blank' href={'https://www.jx3box.com/bps/95296'} rel='noreferrer'>
                    没有合适的循环？
                  </a>
                </Tooltip>
              </div> */}
            </>
          )}
        >
          {全部循环.map((item) => {
            const cls = classnames(
              'cycle-select-item-tag',
              item.标记 === '紫武' ? 'cycle-select-item-tag-purple' : '',
              item.标记 === '橙武' ? 'cycle-select-item-tag-orange' : '',
              item.标记 === '特效' ? 'cycle-select-item-tag-texiao' : '',
              item.标记 === '助手' ? 'cycle-select-item-tag-green' : '',
            )

            const 快照计算列表 = 根据循环判断快照计算列表(item?.循环详情?.[0]?.技能详情 || [])
            return (
              <Select.Option value={item?.名称} key={item.名称} label={item.名称}>
                <Popover
                  placement='right'
                  zIndex={2000}
                  title='说明'
                  open={item.提供者 || item.备注 ? undefined : false}
                  content={
                    item.提供者 || item.备注 || 快照计算列表?.length ? (
                      <div className='cycle-select-popover-content'>
                        <>
                          {item.提供者 !== '模拟' ? (
                            <p>
                              该循环计算数据由
                              <span className='cycle-select-provider'> {item.提供者} </span>
                              提供
                            </p>
                          ) : (
                            <p>
                              该循环计算数据由
                              <span className='cycle-select-provider'> 模拟器 </span>生成
                            </p>
                          )}
                          <p dangerouslySetInnerHTML={{ __html: item?.备注 as any }} />
                        </>
                        {快照计算列表?.length ? (
                          <div>
                            以下增益支持快照计算
                            <div>
                              {快照计算列表?.map((data, index) => {
                                return (
                                  <span
                                    className='cycle-select-provider'
                                    key={`增益快照计算${data}`}
                                  >
                                    {data?.replace('_快照', '')}
                                    {index < (快照计算列表?.length || 0) - 1 ? '｜' : ''}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div>该循环无特殊说明</div>
                    )
                  }
                >
                  <div className='cycle-select-item'>
                    <div dangerouslySetInnerHTML={{ __html: item.标题 || item.名称 }} />
                    <div>
                      {item.提供者 ? (
                        <span className='cycle-select-provider'>{item.提供者}</span>
                      ) : null}
                      <span className={cls}>{item.标记}</span>
                    </div>
                  </div>
                </Popover>
              </Select.Option>
            )
          })}
        </Select>
      </div>
    </div>
  )
}

const TagItem = ({ val }) => {
  const cls = classNames(
    val === '紫武' ? 'cycle-select-item-tag-purple' : '',
    val === '橙武' ? 'cycle-select-item-tag-orange' : '',
    val === '特效' ? 'cycle-select-item-tag-texiao' : '',
  )
  return <b className={cls}>{val}</b>
}

export default 循环选择
