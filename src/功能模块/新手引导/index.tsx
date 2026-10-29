import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { App, Button, Modal, Space, Tour } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新当前引导步骤, 更新新手引导流程状态, 更新增益面板显示状态 } from '@/store/system'
import { use目标池 } from '@/角色/use目标池'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 切换桌宠隐藏 } from '@/桌宠/工具/隐藏'
import { use引导界面 } from './界面状态'
import { 获取引导步骤 } from './步骤'
import { use引导定位 } from './定位'

const 引导遮罩层级 = 1000000000

export default function 新手引导() {
  const { 缓存映射, 名称 } = use心法数据()
  const { 池 } = use目标池(名称)
  const { modal } = App.useApp()
  const dispatch = useAppDispatch()
  const 开启 = useAppSelector((state) => state.system.新手引导流程状态)
  const 步骤 = useAppSelector((state) => state.system.当前引导步骤)
  const 配装打开 = useAppSelector((state) => state.system.配装器弹窗显示状态)
  const 配装入口 = useAppSelector((state) => state.system.配装器入口)
  const 增益打开 = useAppSelector((state) => state.system.增益面板显示状态)
  const 增益启用 = useAppSelector((state) => state.data.增益启用)
  const 当前角色id = useAppSelector((state) => state.data.当前角色?.id)
  const 有计算结果 = useAppSelector((state) => !!state.data.当前计算结果?.秒伤)
  const 界面 = use引导界面()
  const 上次开启 = useRef(false)
  const [已有编辑, 设置已有编辑] = useState(false)
  const 基线 = useRef({
    角色保存次数: 0,
    目标保存次数: 0,
    已有目标id: [] as string[],
    编辑目标id: '',
  })
  const 进入增益时已启用 = useRef(false)
  const 目标编辑 = 配装打开 && 配装入口?.类型 === '目标'
  const 详情打开 = 界面.技能详情打开 || 界面.心法阈值打开
  const 步骤列表 = 获取引导步骤(界面, 有计算结果, 增益打开, 增益启用, 目标编辑)
  const 当前步骤 = 步骤列表[Math.min(步骤, 步骤列表.length - 1)]
  const 标识 = 当前步骤.标识
  const { 版本, 就绪, 居中 } = use引导定位(当前步骤.选择器, 开启 && !已有编辑 && !详情打开)

  useLayoutEffect(() => {
    if (开启 && !上次开启.current) {
      设置已有编辑(
        配装打开 || 界面.模拟器打开 || 界面.目标命名打开 || 界面.目标管理打开 || 详情打开,
      )
      基线.current = {
        角色保存次数: 界面.角色保存.次数,
        目标保存次数: 界面.目标保存.次数,
        已有目标id: 池.目标.map((目标) => 目标.id),
        编辑目标id: '',
      }
      dispatch(更新当前引导步骤(0))
    }
    上次开启.current = 开启
  }, [开启, 配装打开, 界面, 池, 详情打开, dispatch])

  const 结束 = (记录完成 = true) => {
    if (记录完成) localStorage.setItem(缓存映射.新手引导, 'true')
    dispatch(更新新手引导流程状态(false))
    dispatch(更新当前引导步骤(0))
  }
  const 前往 = (下一步: string) =>
    dispatch(更新当前引导步骤(步骤列表.findIndex((项) => 项.标识 === 下一步)))
  const 继续 = () => {
    if (标识 === '增益设置') dispatch(更新增益面板显示状态(false))
    if (步骤 >= 步骤列表.length - 1) 结束()
    else dispatch(更新当前引导步骤(步骤 + 1))
  }
  const 目标之后 = () => {
    if (界面.桌宠挂载) 前往('桌宠')
    else 结束()
  }

  useEffect(() => {
    if (!开启 || 已有编辑) return
    if (配装打开 && 配装入口?.类型 === '目标') 基线.current.编辑目标id = 配装入口.目标id
    const 角色已保存 =
      界面.角色保存.次数 > 基线.current.角色保存次数 && 界面.角色保存.id === 当前角色id
    const 目标已保存 =
      界面.目标保存.次数 > 基线.current.目标保存次数 && 界面.目标保存.id === 基线.current.编辑目标id
    if (标识 === '打开配装器' && 配装打开) 前往('保存角色')
    if (标识 === '保存角色' && !配装打开) {
      前往(角色已保存 ? '预设循环' : '打开配装器')
    }
    if (标识 === '增益设置') {
      if (!增益启用) 进入增益时已启用.current = false
      else if (!进入增益时已启用.current) 继续()
    } else {
      进入增益时已启用.current = 增益启用
    }
    if (标识 === '目标设置' && 目标已保存 && !配装打开) 目标之后()
    if (标识 === '桌宠' && 界面.桌宠问题状态 === '答案') 结束()
  }, [开启, 已有编辑, 标识, 配装打开, 配装入口, 增益打开, 增益启用, 当前角色id, 界面])

  const 退出确认 = () =>
    modal.confirm({
      title: '结束这次引导？',
      content: '之后可以从网页设置重新打开引导，也可以随时阅读功能说明。',
      zIndex: 引导遮罩层级 + 1,
      okText: '结束引导',
      cancelText: '继续学习',
      onOk: () => 结束(),
    })
  if (已有编辑 && 开启)
    return (
      <Modal
        open
        title='先完成当前操作'
        footer={
          <Button type='primary' onClick={() => 结束(false)}>
            返回当前操作
          </Button>
        }
        closable={false}
        maskClosable={false}
        zIndex={引导遮罩层级}
      >
        <p>请先自行保存或关闭当前配装器、模拟器或其他操作窗口，再从网页设置重放引导。</p>
      </Modal>
    )
  return (
    <Tour
      key={版本}
      open={开启 && 就绪 && !详情打开}
      current={Math.min(步骤, 步骤列表.length - 1)}
      steps={步骤列表.map((项) => ({
        title: 项.标题,
        description: 项.说明,
        placement: 居中 ? undefined : 项.位置,
        target: 居中 ? null : () => document.querySelector<HTMLElement>(项.选择器)!,
        mask: 居中
          ? { color: 'transparent', style: { pointerEvents: 'none' as const } }
          : 项.开放界面
            ? false
            : undefined,
      }))}
      zIndex={引导遮罩层级}
      disabledInteraction={!当前步骤.等待操作 && !当前步骤.开放界面}
      scrollIntoViewOptions={false}
      onClose={退出确认}
      onFinish={() => 结束()}
      actionsRender={() => (
        <Space wrap>
          {标识 === '目标设置' &&
            !目标编辑 &&
            !界面.目标管理打开 &&
            !界面.目标命名打开 &&
            基线.current.已有目标id.includes(界面.可沿用目标) && (
              <Button size='small' onClick={目标之后}>
                沿用当前目标
              </Button>
            )}
          {标识 === '桌宠' &&
            !界面.桌宠显示 &&
            (界面.桌宠可用 ? (
              <Button size='small' onClick={切换桌宠隐藏}>
                显示桌宠并继续
              </Button>
            ) : (
              <Button size='small' onClick={() => 结束()}>
                完成引导
              </Button>
            ))}
          {当前步骤.等待操作 ? (
            <span>
              {标识 === '保存角色'
                ? '点击保存角色'
                : 标识 === '目标设置' && 目标编辑
                  ? '配装后保存目标'
                  : '请点击高亮按钮'}
            </span>
          ) : (
            <Button
              size='small'
              type='primary'
              disabled={!就绪 || (标识 === '技能图表' && !有计算结果)}
              onClick={继续}
            >
              {步骤 === 步骤列表.length - 1 ? '完成引导' : '已了解'}
            </Button>
          )}
        </Space>
      )}
    />
  )
}
