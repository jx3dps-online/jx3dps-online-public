import React, { useEffect } from 'react'
import use移动端 from '@/hooks/use移动端'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { App, Divider, Popover, Select, Tooltip } from 'antd'
import { 更新角色数据 } from '@/store/data'
import classnames from 'classnames'
import useCycle from '@/hooks/use-cycle'
import { 获取循环配套数据 } from '@/角色/状态'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import { 根据循环判断快照计算列表 } from '@/计算模块/统一工具函数/增益计算函数'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 装备部位枚举 } from '@/@types/枚举'
import { 装备位置部位枚举, 装备特效枚举 } from '@/@types/装备'
import classNames from 'classnames'
import './index.css'

function 循环选择(props) {
  const 移动端 = use移动端()
  const { 装备数据 } = use心法数据()
  const { className, 不提示循环, 不更新秒伤 } = props
  const { modal } = App.useApp()
  const dispatch = useAppDispatch()
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 增益数据 = useAppSelector((state) => state.data.增益数据)
  const 增益启用 = useAppSelector((state) => state.data.增益启用)
  const 网络延迟 = useAppSelector((state) => state.data.网络延迟)
  const 自定义循环列表 = useAppSelector((state) => state.data.自定义循环列表)

  const { 全部循环 = [] } = useCycle()

  useEffect(() => {
    if (!全部循环.some((项) => 项.名称 === 当前计算循环名称)) {
      const 默认名称 = 全部循环[0]?.名称 || ''
      if (默认名称 !== 当前计算循环名称) 切换循环(默认名称)
    }
  }, [当前计算循环名称, 自定义循环列表, 全部循环[0]?.名称])

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
    dispatch(
      更新角色数据({
        属性: '循环配置',
        数据: 获取循环配套数据(val, { 装备信息, 增益数据, 增益启用, 网络延迟, 自定义循环列表 }),
      }),
    )
    if (!不更新秒伤) {
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
    }
  }

  const cls = classNames('common-item', className)

  return (
    <div className={cls} id={props.id}>
      {/* <h1 className='common-label'>循环</h1> */}
      <div className='common-content'>
        <Select
          value={当前计算循环名称 || undefined}
          placeholder='暂无可用循环'
          className='cycle-select'
          onChange={(v) => {
            if (不提示循环) {
              切换循环(v)
            } else {
              切换循环前校验(v)
            }
          }}
          optionFilterProp='label'
          popupMatchSelectWidth={移动端 ? true : 300}
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
                  placement={'right'}
                  overlayClassName='循环说明浮层'
                  zIndex={2000}
                  title='循环说明'
                  open={移动端 ? false : item.提供者 || item.备注 ? undefined : false}
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
