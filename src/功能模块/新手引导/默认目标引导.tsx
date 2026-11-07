import React, { useEffect, useState } from 'react'
import { Button, Modal, Tour } from 'antd'
import { useAppSelector } from '@/hooks'
import { use引导界面, 引导遮罩层级 } from './界面状态'
import { use引导定位 } from './定位'
import { use默认目标 } from './use默认目标'
import { use其他操作弹窗 } from './默认目标界面'

function 当前角色目标引导({ 允许 }: { 允许: boolean }) {
  const 界面 = use引导界面()
  const 系统 = useAppSelector((state) => state.system)
  const 其他弹窗打开 = use其他操作弹窗()
  const 操作中 =
    其他弹窗打开 ||
    系统.配装器弹窗显示状态 ||
    系统.增益面板显示状态 ||
    界面.模拟器打开 ||
    界面.目标管理打开 ||
    界面.目标命名打开 ||
    界面.目标库打开 ||
    界面.技能详情打开 ||
    界面.心法阈值打开
  const 可展示 = 允许 && !系统.新手引导流程状态 && !操作中
  const { 目标id, 有效 } = use默认目标(可展示)
  const [阶段, 设置阶段] = useState<'提示' | '关闭提示' | '引导' | '完成'>('提示')
  const 引导打开 = 可展示 && 有效 && 阶段 === '引导'
  const 选择器 = 界面.登阶显示 ? '#Guide_更新目标' : '#Guide_登阶页签'
  const { 版本, 就绪 } = use引导定位(选择器, 引导打开)

  useEffect(() => {
    if (
      阶段 === '引导' &&
      系统.配装器弹窗显示状态 &&
      系统.配装器入口?.类型 === '目标' &&
      系统.配装器入口.目标id === 目标id
    )
      设置阶段('完成')
    if (目标id && !有效) 设置阶段('完成')
  }, [阶段, 系统.配装器弹窗显示状态, 系统.配装器入口, 目标id, 有效])

  return (
    <>
      <Modal
        title='已设置本赛季目标'
        wrapClassName='default-goal-notice'
        open={可展示 && 有效 && 阶段 === '提示'}
        closable={false}
        maskClosable={false}
        keyboard={false}
        centered
        zIndex={引导遮罩层级}
        afterClose={() => {
          if (阶段 === '关闭提示') 设置阶段('引导')
        }}
        footer={
          <Button type='primary' onClick={() => 设置阶段('关闭提示')}>
            确认
          </Button>
        }
      >
        <p>
          识别到您还没有设置本赛季目标，已自动设置为内置的
          <span style={{ color: 'red', fontWeight: 'bold' }}>英雄平民</span>目标。
        </p>
        <p>可自行更新本赛季目标，跟进毕业状态</p>
      </Modal>
      <Tour
        key={`${选择器}:${版本}`}
        open={引导打开 && 就绪}
        closable={false}
        current={0}
        zIndex={引导遮罩层级}
        scrollIntoViewOptions={false}
        steps={[
          {
            title: 界面.登阶显示 ? '以后从这里更新目标' : '先回到目标区域',
            description: 界面.登阶显示
              ? '点击「更新目标」：可以手动修改配装，最后点击「更新目标」保存。'
              : '点击这个页签返回目标区域，接下来会带你找到「更新目标」。',
            target: () => document.querySelector<HTMLElement>(选择器)!,
          },
        ]}
        actionsRender={() => (
          <span>请点击高亮的{界面.登阶显示 ? '「更新目标」按钮' : '目标页签'}</span>
        )}
      />
    </>
  )
}

export default function 默认目标引导({ 允许 }: { 允许: boolean }) {
  const 角色id = useAppSelector((state) => state.data.当前角色?.id)
  return <当前角色目标引导 key={角色id} 允许={允许} />
}
