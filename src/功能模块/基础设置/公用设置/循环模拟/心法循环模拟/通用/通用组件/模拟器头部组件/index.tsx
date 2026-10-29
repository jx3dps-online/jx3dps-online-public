import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Input,
  InputNumber,
  Menu,
  message,
  Modal,
  Popover,
  Select,
  Tooltip,
} from 'antd'
import React, { useContext, useId, useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks'
import { 延迟设定 } from '@/数据/常量'
import 秘籍选择抽屉 from '@/功能模块/基础设置/公用设置/秘籍选择/drawer'
import 团队增益快照 from '../../../通用/通用组件/团队增益快照'
import { 判断有无橙武循环数据, 生成实际技能序列, 获取实际技能数据 } from '../../../通用/通用函数'
import { 循环基础技能数据类型 } from '../../通用框架/类型定义/技能'
import { 循环数据 } from '@/@types/循环'
import styles from './index.module.less'
import { 获取档位加速值 } from '@/工具函数/data'
import CycleSimulatorContext from '../../../../context'
import { 曲线数据点 } from '../战斗曲线弹窗/use战斗曲线'
import 循环草稿 from '../循环草稿'
import 异步内容 from '@/功能模块/功能说明/异步内容'

const 加载模拟器引导 = () => import('@/功能模块/新手引导/模拟器引导')

interface CycleModalHeaderProps {
  cycle: 循环基础技能数据类型[]
  设置自定义循环保存弹窗: (e: boolean) => void
  清空循环: () => void
  快速导入循环: (e: any[], 额外信息?) => void
  更新奇穴弹窗展示?: (e: boolean) => void
  更新奇穴信息?: (e: string[]) => void
  加速值: number
  更新加速值: (e: number) => void
  网络延迟: number
  更新网络延迟: (e: number) => void
  启用团队增益快照: boolean
  更新启用团队增益快照: (e: boolean) => void
  模拟信息: any
  大橙武模拟: boolean
  快速导入默认循环: Partial<循环数据>[]
  加速档位配置?: { 加速档位: number; 加速值: number }[]
  战斗曲线数据?: 曲线数据点[]
  on生成战斗曲线?: () => void
  拆分循环文本?: (文本: string) => string[]
  转换技能序列?: (节点: string[]) => 循环基础技能数据类型[]
  筛选循环?: (列表: Partial<循环数据>[], 大橙武模拟: boolean) => Partial<循环数据>[]
  保存禁止原因?: string
  前置操作?: React.ReactNode
}

function CycleModalHeader(props: CycleModalHeaderProps) {
  const {
    cycle,
    设置自定义循环保存弹窗,
    清空循环,
    快速导入循环,
    更新奇穴弹窗展示,
    更新奇穴信息,
    加速值,
    更新加速值,
    网络延迟,
    更新网络延迟,
    模拟信息,
    大橙武模拟,
    启用团队增益快照,
    更新启用团队增益快照,
    快速导入默认循环 = [],
    加速档位配置,
    战斗曲线数据,
    on生成战斗曲线,
    拆分循环文本,
    转换技能序列,
    筛选循环 = 判断有无橙武循环数据,
    保存禁止原因,
    前置操作,
  } = props

  const {
    秘籍信息,
    更新秘籍信息,
    更新起手Buff配置,
    增益启用,
    更新增益启用,
    高亮团队快照,
    更新高亮团队快照,
    截图模式,
    设置截图模式,
  } = useContext(CycleSimulatorContext)

  const 自定义循环 = useAppSelector((state) => state?.data?.自定义循环列表)

  const [秘籍选择抽屉展示, 更新秘籍选择抽屉展示] = useState<boolean>(false)
  const [工具展开, 设置工具展开] = useState(true)
  const [手动导入展示, 设置手动导入展示] = useState(false)
  const [导入文本, 设置导入文本] = useState('')
  const 工具区域编号 = useId()

  const 默认循环选项 = 筛选循环(快速导入默认循环, 大橙武模拟)
  const 自定义循环选项 = 筛选循环(自定义循环, 大橙武模拟)

  const 默认转换技能序列 = (节点: string[]) =>
    节点
      .map((item) => {
        const 实际技能数据 = 获取实际技能数据(item)
        const 技能信息 = 模拟信息?.技能基础数据?.find(
          (a) => a?.技能名称 === 实际技能数据?.实际技能名称,
        ) as 循环基础技能数据类型
        return { ...技能信息, 额外信息: 实际技能数据?.额外信息 as any }
      })
      .filter((item) => item)

  const 快捷添加循环 = (名称, 类型 = '默认') => {
    const 数据源 = 类型 === '默认' ? 快速导入默认循环 : 自定义循环

    const 当前循环数据: any = 数据源?.find((item) => item.名称 === 名称)

    let 技能序列信息: 循环基础技能数据类型[]
    if (转换技能序列) {
      try {
        技能序列信息 = 转换技能序列(当前循环数据?.技能序列 || [])
      } catch (异常) {
        message.error((异常 as Error).message)
        return
      }
    } else {
      技能序列信息 = 默认转换技能序列(当前循环数据?.技能序列 || [])
    }

    let 额外配置信息 = {}
    if (当前循环数据?.额外配置信息) {
      额外配置信息 = 当前循环数据?.额外配置信息
    }
    快速导入循环(技能序列信息, { ...额外配置信息 })
    if (当前循环数据?.奇穴) {
      更新奇穴信息?.(当前循环数据?.奇穴)
    }
    if (当前循环数据?.秘籍) {
      更新秘籍信息?.(当前循环数据?.秘籍)
    }
    if (当前循环数据?.起手Buff配置) {
      更新起手Buff配置?.(当前循环数据?.起手Buff配置)
    }
  }

  const 导入循环文本 = (clipboardData: string) => {
    if (!clipboardData) {
      message.error('粘贴板内无可导入数据，请检查或重新复制')
    } else {
      let list: string[]
      if (拆分循环文本) {
        try {
          list = 拆分循环文本(clipboardData)
        } catch (异常) {
          message.error((异常 as Error).message)
          return
        }
      } else {
        list = clipboardData.split(',')
      }
      let 技能序列信息: 循环基础技能数据类型[]
      if (转换技能序列) {
        try {
          技能序列信息 = 转换技能序列(list)
        } catch (异常) {
          message.error((异常 as Error).message)
          return
        }
      } else {
        技能序列信息 = 默认转换技能序列(list)
      }
      if (技能序列信息.length) {
        快速导入循环(技能序列信息)
        message.success('数据已全部导入')
        return true
      } else {
        message.error('粘贴板内无可导入数据，请检查或重新复制')
      }
    }
  }

  const 粘贴导入 = async () => {
    let 文本: string
    try {
      文本 = await navigator.clipboard.readText()
    } catch {
      设置手动导入展示(true)
      return
    }
    导入循环文本(文本)
  }

  const 导出循环 = () => {
    // 将数据转换为字符串格式
    const 实际技能序列 = 生成实际技能序列(cycle)
    const cycleString = 实际技能序列.join(',')
    // 创建一个文本域元素，用于复制内容到粘贴板
    const textarea = document.createElement('textarea')
    textarea.value = cycleString
    document.body.appendChild(textarea)
    // 选中文本域中的内容并复制到粘贴板
    textarea.select()
    document.execCommand('copy')
    // 移除文本域元素
    document.body.removeChild(textarea)
    message.success('数据已复制到粘贴板')
  }

  const 快速设置加速菜单 = useMemo(() => {
    const 加速档位 =
      加速档位配置 ||
      Object.entries(获取档位加速值()).map(([档位, 加速值]) => ({
        加速档位: Number(档位),
        加速值,
      }))
    return 加速档位.map((item) => {
      return {
        key: String(item.加速档位),
        label: `${item.加速档位}段（${item.加速值}）`,
        onClick: () => {
          更新加速值(item.加速值)
        },
      }
    })
  }, [加速档位配置, 更新加速值])

  const 切换增益启用状态 = (checked) => {
    更新增益启用(checked)
  }

  return (
    <div id='Guide_模拟设置' className={styles.header}>
      <div className={styles.wrapper} style={{ flexShrink: 0 }}>
        <h1 className={styles.title}>循环模拟</h1>
        <Popover
          content={
            <div>
              <p>1、点击下方技能按钮添加至循环内</p>
              <p>2、可以整行删除、复制本行到最后一行</p>
              <p>3、可以在单行内拖动改变技能顺序</p>
              <p>
                更多使用说明详见：
                <a href='https://www.jx3box.com/tool/75292' target='_blank' rel='noreferrer'>
                  使用手册及FAQ
                </a>
              </p>
            </div>
          }
        >
          <span className={styles.help}>如何使用</span>
        </Popover>
        <异步内容 加载={加载模拟器引导} 参数={{ 模拟信息, 设置工具展开 }} />
        <Button
          size='small'
          type='text'
          aria-expanded={工具展开}
          aria-controls={工具区域编号}
          onClick={() => 设置工具展开(!工具展开)}
        >
          {工具展开 ? '收起设置' : '展开设置'}
        </Button>
      </div>
      <div
        id={工具区域编号}
        className={styles.btns}
        hidden={!工具展开}
        style={工具展开 ? undefined : { display: 'none' }}
      >
        <div className={styles.btnItem}>
          <Checkbox
            style={{ fontWeight: 400 }}
            checked={!!增益启用}
            onChange={(e) => 切换增益启用状态(e?.target?.checked)}
          >
            增益启用
          </Checkbox>
        </div>
        <div className={styles.btnItem}>
          <团队增益快照
            启用={启用团队增益快照}
            设置是否启用={更新启用团队增益快照}
            当前时间={模拟信息?.当前时间 || 0}
            高亮团队快照={高亮团队快照}
            更新高亮团队快照={更新高亮团队快照}
            默认总时间={模拟信息?.当前时间 || 0}
            战斗曲线数据={战斗曲线数据}
            on生成战斗曲线={on生成战斗曲线}
          />
        </div>
        <div className={styles.btnItem}>
          <span className={styles.btnLabel}>加速值</span>
          <InputNumber
            size='small'
            value={加速值}
            onChange={(e: any) => 更新加速值(e)}
            precision={0}
            className={styles.input}
            min={0}
            max={200000}
          />
          <Dropdown menu={{ items: 快速设置加速菜单 }}>
            <a style={{ marginLeft: 8 }}>档位设置</a>
          </Dropdown>
        </div>
        <div className={styles.btnItem}>
          <span className={styles.btnLabel}>网络延迟</span>
          <Select
            size='small'
            className={styles.select}
            value={网络延迟}
            onChange={更新网络延迟}
            options={延迟设定}
          />
        </div>
        <div className={styles.btnItem}>
          <Checkbox
            style={{ fontWeight: 400 }}
            checked={!!截图模式}
            onChange={(e) => 设置截图模式(e?.target?.checked)}
          >
            截图模式
          </Checkbox>
        </div>
        {前置操作}
        <Dropdown
          overlay={
            <Menu>
              {默认循环选项?.map((item) => {
                return (
                  <Menu.Item key={item?.名称} onClick={() => 快捷添加循环(item?.名称)}>
                    {item?.名称}
                  </Menu.Item>
                )
              })}
              {自定义循环选项?.length
                ? 自定义循环选项.map((item, index) => {
                    return (
                      <Menu.Item key={index} onClick={() => 快捷添加循环(item?.名称, '自定义')}>
                        {item?.名称}
                      </Menu.Item>
                    )
                  })
                : null}
              <Divider style={{ margin: '4px 0' }} />
              <Menu.Item key='ctrlv' onClick={粘贴导入}>
                粘贴导入
              </Menu.Item>
            </Menu>
          }
        >
          <Button size='small'>导入循环</Button>
        </Dropdown>
        <Button size='small' onClick={() => 导出循环()} disabled={cycle?.length < 1}>
          导出循环
        </Button>
        <循环草稿 技能基础数据={模拟信息.技能基础数据} />
        {更新奇穴弹窗展示 ? (
          <Tooltip title={'本奇穴设置只会在循环模拟器内生效，不影响外部'}>
            <Button size='small' onClick={() => 更新奇穴弹窗展示?.(true)}>
              奇穴设置
            </Button>
          </Tooltip>
        ) : null}
        <Button size='small' onClick={() => 更新秘籍选择抽屉展示(true)}>
          秘籍设置
        </Button>
        <Button size='small' onClick={() => 清空循环()} danger>
          清空循环
        </Button>
        <Tooltip
          title={
            保存禁止原因 ||
            '自定义循环和原计算器其他循环的dps会心期望计算方式不同。会导致最终数值偏差。请勿进行跨循环比较。'
          }
        >
          <Button
            size='small'
            type='primary'
            id='Guide_模拟保存'
            onClick={() => 设置自定义循环保存弹窗(true)}
            disabled={cycle?.length < 1 || 模拟信息?.循环执行结果 === '异常' || !!保存禁止原因}
          >
            保存为自定义循环
          </Button>
        </Tooltip>
      </div>
      <Modal
        title='手动粘贴导入'
        open={手动导入展示}
        okText='导入'
        cancelText='取消'
        onOk={() => {
          if (导入循环文本(导入文本)) {
            设置手动导入展示(false)
            设置导入文本('')
          }
        }}
        onCancel={() => {
          设置手动导入展示(false)
          设置导入文本('')
        }}
      >
        <p>无法自动读取剪贴板，请点击下方输入框，按 Ctrl+V 粘贴循环文本后导入。</p>
        <Input.TextArea
          aria-label='循环文本'
          value={导入文本}
          onChange={(e) => 设置导入文本(e.target.value)}
          rows={6}
          placeholder='在此粘贴导出的循环文本'
        />
      </Modal>
      <秘籍选择抽屉
        value={秘籍信息}
        onChange={更新秘籍信息}
        open={秘籍选择抽屉展示}
        onClose={() => 更新秘籍选择抽屉展示(false)}
      />
    </div>
  )
}

export default CycleModalHeader
