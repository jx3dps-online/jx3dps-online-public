import React, { useContext, useEffect, useRef, useState } from 'react'
import { App, Button, Space, Tour } from 'antd'
import { useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import CycleSimulatorContext from '@/功能模块/基础设置/公用设置/循环模拟/context'
import type { 模拟信息类型 } from '@/功能模块/基础设置/公用设置/循环模拟/心法循环模拟/通用/通用框架/类型定义/模拟'
import { use引导定位 } from './定位'

const 教学步骤 = [
  {
    title: '确认模拟条件',
    description:
      '这里设置加速、网络延迟、奇穴、秘籍和增益。先核对条件；也可以通过「导入循环」载入已有循环，再观察或调整技能。',
    选择器: '#Guide_模拟设置',
  },
  {
    title: '添加技能并产生结果',
    description:
      '点击下方可用技能加入序列，按循环顺序继续添加。一个起手技能可能还没有战斗用时或伤害；出现有效秒伤后，再点击「查看结果」。',
    选择器: '.cycle-simulator-modal .cycle-simulator-setting-btns',
  },
  {
    title: '查看结果与技能序列',
    description:
      '状态栏展示秒伤、战斗用时、资源和 Buff。当前秒伤只对应这段序列，短序列不能代表完整循环表现。下方技能序列支持拖动排序、复制和删除，调整后会重新模拟。',
    选择器: '.cycle-simulator-modal .cycle-status-bar',
  },
  {
    title: '保存与继续研究',
    description:
      '正式循环用「保存为自定义循环」保存，未完成的序列可存为草稿。完成引导后可继续编辑；关闭模拟器会清空当前序列，自动草稿仍可能保留。',
    选择器: '#Guide_模拟保存',
  },
]

export default function 模拟器引导({
  模拟信息,
  设置工具展开,
}: {
  模拟信息: Pick<模拟信息类型, '当前时间' | '循环执行结果'>
  设置工具展开: (展开: boolean) => void
}) {
  const { 缓存映射 } = use心法数据()
  const { message } = App.useApp()
  const 基础引导开启 = useAppSelector((state) => state.system.新手引导流程状态)
  const { 模拟器弹窗展示, 模拟DPS结果, 截图模式, 设置截图模式 } = useContext(CycleSimulatorContext)
  const [开启, 设置开启] = useState(false)
  const [步骤, 设置步骤] = useState(0)
  const 上次打开 = useRef(false)
  const 已记录展示 = useRef(false)
  const 展示 = 开启 && 模拟器弹窗展示 && !基础引导开启 && !截图模式
  const { 版本, 就绪, 居中 } = use引导定位(教学步骤[步骤].选择器, 展示)
  const 有效结果 =
    模拟信息.循环执行结果 === '成功' &&
    模拟信息.当前时间 > 0 &&
    模拟DPS结果.秒伤计算时间 > 0 &&
    模拟DPS结果.秒伤 > 0

  useEffect(() => {
    if (模拟器弹窗展示 && !上次打开.current && !基础引导开启) {
      try {
        if (localStorage.getItem(缓存映射.循环模拟引导) !== 'true') {
          设置步骤(0)
          设置工具展开(true)
          设置开启(true)
        }
      } catch {
        message.info('无法读取引导记录，可点击「基础引导」开始学习。')
      }
    }
    if (!模拟器弹窗展示) 设置开启(false)
    上次打开.current = 模拟器弹窗展示
  }, [模拟器弹窗展示, 基础引导开启, 缓存映射.循环模拟引导, 设置工具展开, message])

  useEffect(() => {
    if (!展示 || !就绪 || 已记录展示.current) return
    已记录展示.current = true
    try {
      localStorage.setItem(缓存映射.循环模拟引导, 'true')
    } catch {
      message.info('引导记录未能保存，下次打开可能再次显示。')
    }
  }, [展示, 就绪, 缓存映射.循环模拟引导, message])

  useEffect(() => {
    if (开启 && 步骤 === 2 && !有效结果) 设置步骤(1)
  }, [开启, 步骤, 有效结果])

  return (
    <>
      <Button
        type='text'
        size='small'
        disabled={基础引导开启}
        onClick={() => {
          设置截图模式(false)
          设置工具展开(true)
          设置步骤(0)
          设置开启(true)
        }}
      >
        基础引导
      </Button>
      <Tour
        key={版本}
        open={展示 && 就绪}
        current={步骤}
        steps={教学步骤.map((项, 索引) => ({
          title: 项.title,
          description:
            索引 === 1 && 模拟信息.循环执行结果 === '异常'
              ? '当前循环存在异常。请按模拟器提示检查技能顺序和条件，修正后继续添加技能；产生有效秒伤后才能查看结果。'
              : 项.description,
          target: 居中 ? null : () => document.querySelector<HTMLElement>(项.选择器)!,
          placement: 居中 ? undefined : 索引 === 1 ? 'top' : 'bottom',
        }))}
        mask={居中 ? { color: 'transparent', style: { pointerEvents: 'none' } } : false}
        zIndex={1000000000}
        scrollIntoViewOptions={false}
        onClose={() => 设置开启(false)}
        actionsRender={() => (
          <Space wrap>
            <Button size='small' onClick={() => 设置开启(false)}>
              稍后学习
            </Button>
            <Button
              size='small'
              type='primary'
              disabled={!就绪 || (步骤 === 1 && !有效结果)}
              onClick={() => {
                if (步骤 === 教学步骤.length - 1) 设置开启(false)
                else {
                  if (步骤 === 2) 设置工具展开(true)
                  设置步骤(步骤 + 1)
                }
              }}
            >
              {步骤 === 1 ? '查看结果' : 步骤 === 教学步骤.length - 1 ? '完成引导' : '已了解'}
            </Button>
          </Space>
        )}
      />
    </>
  )
}
