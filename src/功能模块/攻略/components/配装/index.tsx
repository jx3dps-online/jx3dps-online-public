import React, { useContext, useMemo, useState } from 'react'
import { Button, message, Modal } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 打开配装器 } from '@/store/system'
import { 攻略展示上下文 } from '../../展示上下文'
import { 获取角色需要展示的面板数据 } from '@/功能模块/基础设置/面板信息/工具'
import 根据表单选项获取装备信息 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据表单选项获取装备信息'
import 配装页面 from '@/功能模块/基础设置/属性录入/配装器/功能组件/配装导出/配装页面'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 创建目标池存储 } from '@/角色/目标池'
import type { 装备信息数据类型 } from '@/@types/装备'
import { 提取配装循环, 登阶循环限制 } from '@/功能模块/计算结果/登龙长阶/领域/循环'
import { 获取文案 } from '@/功能模块/计算结果/登龙长阶/文案'
import styles from './index.module.less'

export interface 配装原始镶嵌孔 {
  镶嵌类型?: string
  镶嵌宝石等级?: number
}

export interface 配装原始装备 {
  id?: number
  当前精炼等级?: number
  镶嵌孔数组?: 配装原始镶嵌孔[]
  附魔?: number
  装备部位?: string
}

/** 配装器「配装导出」代码 JSON 格式 */
export interface 配装原始数据 {
  _1?: 配装原始装备
  _2?: 配装原始装备
  _3?: 配装原始装备
  _4?: 配装原始装备
  _5?: 配装原始装备
  _6?: 配装原始装备
  _7?: 配装原始装备
  _8?: 配装原始装备
  _9?: 配装原始装备
  _10?: 配装原始装备
  _11?: 配装原始装备
  _12?: 配装原始装备
  五彩石?: string
  大附魔_伤帽?: number
  大附魔_伤衣?: number
  大附魔_伤腰?: number
  大附魔_伤腕?: number
  大附魔_伤鞋?: number
}

export interface 配装组件入参 {
  /** 配装原始数据（配装器「配装导出」代码 JSON 格式） */
  配装数据?: 配装原始数据
  /** 配装名称，用于文字视图与配装页面标题 */
  名称?: string
  /** 配装备注 */
  备注?: string
  /** 配装创建人 */
  创建人?: string
  /** 默认视图，children 传入时忽略 */
  视图?: '文字' | '配装页面'
  /** 自定义内容，传入后替换默认视图 */
  children?: React.ReactNode
  /** 应用配装按钮点击回调，缺省执行内置「应用配装到配装器」逻辑 */
  应用配装?: () => void
  /** 是否隐藏「应用配装到配装器」按钮 */
  隐藏应用按钮?: boolean
  /** 配装页面缩放（默认 1，对应 1120x630） */
  缩放?: number
}

function 配装组件(props: 配装组件入参) {
  const {
    配装数据,
    名称,
    备注,
    创建人,
    视图 = '文字',
    children,
    应用配装,
    隐藏应用按钮 = false,
    缩放 = 1,
  } = props

  const dispatch = useAppDispatch()
  const { 名称: 心法, 计算循环 } = use心法数据()
  const 数据 = useAppSelector((state) => state.data)
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const { 关闭: 关闭攻略, 只读预览 } = useContext(攻略展示上下文)
  const [大屏查看, 设置大屏查看] = useState(false)

  const 装备信息 = useMemo(
    () => (配装数据 ? 根据表单选项获取装备信息(配装数据) : undefined),
    [配装数据],
  )

  const 显示数据 = 装备信息
    ? 获取角色需要展示的面板数据({
        装备信息,
        当前奇穴信息,
        增益数据,
        增益启用,
        显示增益后面板: false,
      })
    : {}

  const 点击应用 = () => {
    if (只读预览) return
    if (应用配装) {
      应用配装()
      return
    }
    if (!装备信息) {
      message.warning('未提供配装数据')
      return
    }
    dispatch(打开配装器({ 草稿: { 名称, 装备: 装备信息 } }))
    关闭攻略?.()
    message.success('配装已填入配装器，确认后可保存角色')
  }

  const 添加到赛季目标 = (装备: 装备信息数据类型) => {
    if (只读预览) return
    try {
      const 循环 = 提取配装循环(数据)
      const 原因 = 登阶循环限制(
        装备,
        [...计算循环, ...数据.自定义循环列表].find((项) => 项.名称 === 循环?.名称),
        获取文案(心法),
      )
      if (原因) throw new Error(原因)
      创建目标池存储(心法).新增目标(装备, 名称 || '攻略推荐配装', 循环)
      message.success('已添加到赛季目标')
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '添加赛季目标失败')
    }
  }

  const 默认内容 =
    children ??
    (视图 === '配装页面' ? (
      <配装页面
        方案名称={名称}
        方案备注={备注}
        方案创建人={创建人}
        显示数据={显示数据}
        当前装备信息={装备信息}
        缩放={缩放}
      />
    ) : (
      <span className={styles['guide-setup-name']}>{名称 || '未命名配装'}</span>
    ))

  return (
    <div className={styles['guide-setup']}>
      <div className={styles['guide-setup-body']}>{默认内容}</div>
      {装备信息 || !隐藏应用按钮 ? (
        <div className={styles['guide-setup-footer']}>
          {装备信息 ? (
            <Button size='small' onClick={() => 设置大屏查看(true)}>
              大屏查看
            </Button>
          ) : null}
          {装备信息 ? (
            <Button
              size='small'
              disabled={只读预览}
              title={只读预览 ? '编辑预览不会修改赛季目标' : undefined}
              onClick={() => 添加到赛季目标(装备信息)}
            >
              添加到赛季目标
            </Button>
          ) : null}
          {!隐藏应用按钮 ? (
            <Button
              type='primary'
              size='small'
              disabled={只读预览}
              title={只读预览 ? '编辑预览不会修改角色配装' : undefined}
              onClick={点击应用}
            >
              应用配装到配装器
            </Button>
          ) : null}
        </div>
      ) : null}

      <Modal
        title={名称 || '配装'}
        open={大屏查看}
        centered
        footer={null}
        width={'70%'}
        zIndex={2200}
        onCancel={() => 设置大屏查看(false)}
      >
        <div className={styles['guide-setup-full']}>
          <配装页面
            方案名称={名称}
            方案备注={备注}
            方案创建人={创建人}
            显示数据={显示数据}
            当前装备信息={装备信息}
            自适应宽度
          />
        </div>
      </Modal>
    </div>
  )
}

export default 配装组件
