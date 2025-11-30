import { Checkbox, Modal, Tooltip } from 'antd'
import React, { useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks'
import { 当前计算结果类型 } from '@/@types/输出'
import 技能结果详情容器 from './技能结果详情容器'
import { 获取技能统计数据 } from './util'
import './index.css'

function 结果统计({
  visible,
  onClose,
  title = '技能统计' as any,
  计算结果 = {} as Partial<当前计算结果类型>,
}) {
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 显示计算结果 = { ...当前计算结果, ...计算结果 }

  const [合并同名技能, 设置合并同名技能] = useState<boolean>(true)

  const sortDpsList = useMemo(() => {
    return 获取技能统计数据(显示计算结果, 合并同名技能)
  }, [显示计算结果, 合并同名技能])

  return (
    <Modal
      className='dps-count-modal'
      width={1000}
      centered
      title={
        <div className={'dps-count-modal-title'}>
          <span>{title || '技能统计'}</span>
          <Checkbox checked={合并同名技能} onChange={(e) => 设置合并同名技能(e?.target?.checked)}>
            合并同名技能
          </Checkbox>
        </div>
      }
      open={visible}
      onCancel={() => onClose()}
      footer={false}
      destroyOnHidden
    >
      <div>
        <div className={'dps-skill-count'}>
          <div className={'dps-line-header dps-total'}>
            <span>技能名称</span>
            <div className={'dps-count'}>
              <span className='dps-count-1'>技能数量</span>
              <span className='dps-count-2'>技能总伤</span>
              <span className='dps-count-3'>会心几率</span>
              <span className='dps-count-4'>技能比例</span>
            </div>
          </div>
        </div>
        {sortDpsList?.length ? (
          <div className={'dps-skill-count'}>
            {sortDpsList
              // ?.filter((item) => item?.技能名称?.includes('引窍'))
              ?.map((item, index) => {
                return (
                  <技能结果详情容器 key={item.技能名称 + index} 技能数据={item}>
                    <div className={'dps-line-wrap'}>
                      <div className={'dps-line'}>
                        <div className={'dps-line-name'}>
                          <span className={'dps-line-count-name'}>
                            {item.显示名称 || item?.技能名称 || item.统计名称}
                          </span>
                          {!合并同名技能 ? (
                            <span className={'dps-line-count-detail'}>
                              {item?.技能ID ? (
                                <Tooltip title='技能ID'>
                                  <span className='dps-count-detail-id'>{item?.技能ID}</span>
                                </Tooltip>
                              ) : (
                                ''
                              )}
                              {item?.技能等级 ? (
                                <Tooltip title='技能等级'>
                                  <span className='dps-count-detail-level'>{item?.技能等级}</span>
                                </Tooltip>
                              ) : (
                                ''
                              )}
                              {item?.伤害层数 ? (
                                <Tooltip title='伤害层数'>
                                  <span className='dps-count-detail-tick'>{item?.伤害层数}</span>
                                </Tooltip>
                              ) : (
                                ''
                              )}
                            </span>
                          ) : null}
                        </div>
                        <div className={'dps-count'}>
                          <span className='dps-count-1'>
                            {Number.isInteger(item.技能数量)
                              ? item.技能数量
                              : item.技能数量.toFixed(2)}
                          </span>
                          <span className='dps-count-2'>{item.技能总输出.toFixed(2)}</span>
                          <span className='dps-count-3'>
                            {((item?.会心几率 || 0) * 100).toFixed(2)}%
                          </span>
                          <span className='dps-count-4'>
                            {((item.技能总输出 / 显示计算结果?.总伤) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div
                        className={'dps-line-bg'}
                        style={{
                          width: `${(item.技能总输出 / sortDpsList?.[0]?.技能总输出) * 100}%`,
                        }}
                      />
                    </div>
                  </技能结果详情容器>
                )
              })}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

export default 结果统计
