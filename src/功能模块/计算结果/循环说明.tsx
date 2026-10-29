import React, { useLayoutEffect, useRef } from 'react'
import { Button } from 'antd'
import { BookOutlined, InfoCircleOutlined } from '@ant-design/icons'

interface Props {
  名称?: string
  备注?: string
  显示木桩提示: boolean
  潮生要求提示?: string
  打开增益详情: () => void
  查看攻略?: () => void
  长阶双列: boolean
}

export default function 循环说明({
  名称,
  备注,
  显示木桩提示,
  潮生要求提示,
  打开增益详情,
  查看攻略,
  长阶双列,
}: Props) {
  const 区域Ref = useRef<HTMLDivElement>(null)
  const 有备注 = !!备注?.trim()
  const 有攻略 = !!查看攻略

  useLayoutEffect(() => {
    const 区域 = 区域Ref.current
    if (!区域) return
    const 对齐面板 = 区域.closest('.dps')!.querySelector('.dps-planning-layout')!
    const 更新宽度 = () => {
      const 可用宽度 = 区域.clientWidth
      const 面板位置 = 对齐面板.getBoundingClientRect()
      const 列间距 = parseFloat(getComputedStyle(对齐面板).columnGap)
      // 按登龙长阶的 1.7:1 双列及右列最小 260px 计算，切换收益图时保持说明位置。
      const 长阶宽度 = 长阶双列
        ? Math.min(((面板位置.width - 列间距) * 1.7) / 2.7, 面板位置.width - 列间距 - 260)
        : 面板位置.width
      const 对齐宽度 = 面板位置.left + 长阶宽度 - 区域.getBoundingClientRect().left
      const 基准宽度 = Math.min(可用宽度, 对齐宽度 > 0 ? 对齐宽度 : 460)
      区域.style.setProperty('--dps-cycle-width', `${基准宽度}px`)
    }
    更新宽度()
    let 更新帧 = 0
    const 观察器 = new ResizeObserver(() => {
      cancelAnimationFrame(更新帧)
      更新帧 = requestAnimationFrame(更新宽度)
    })
    观察器.observe(区域)
    观察器.observe(对齐面板)
    return () => {
      观察器.disconnect()
      cancelAnimationFrame(更新帧)
    }
  }, [名称, 备注, 有攻略, 显示木桩提示, 潮生要求提示, 长阶双列])

  if (!有备注 && !查看攻略 && !显示木桩提示 && !潮生要求提示) return null

  return (
    <div className='dps-cycle-context' ref={区域Ref}>
      {有备注 || 查看攻略 ? (
        <section className='dps-cycle-note' aria-label='当前循环说明'>
          <div className='dps-cycle-note-heading'>
            <span className='dps-cycle-note-label'>
              <InfoCircleOutlined /> 循环说明
            </span>
            <span className='dps-cycle-note-name' title={名称}>
              {名称}
            </span>
            {查看攻略 ? (
              <Button
                className='dps-guide-btn'
                size='small'
                icon={<BookOutlined />}
                onClick={查看攻略}
              >
                查看攻略
              </Button>
            ) : null}
          </div>
          {有备注 ? (
            <div
              key={`${名称}-${备注}`}
              className='dps-cycle-note-content'
              tabIndex={0}
              aria-label='循环备注'
              dangerouslySetInnerHTML={{ __html: 备注! }}
            />
          ) : null}
        </section>
      ) : null}
      {潮生要求提示 ? (
        <div className='dps-number-count-gain-tip'>
          <InfoCircleOutlined />
          <span>{潮生要求提示}当前秒伤不适用于此配装。</span>
        </div>
      ) : null}
      {显示木桩提示 ? (
        <div className='dps-number-count-gain-tip'>
          <InfoCircleOutlined />
          <span>
            当前为纯木桩计算，计算属性收益时建议
            <button type='button' className='dps-number-count-gain-action' onClick={打开增益详情}>
              开启增益
            </button>
            。
          </span>
        </div>
      ) : null}
    </div>
  )
}
