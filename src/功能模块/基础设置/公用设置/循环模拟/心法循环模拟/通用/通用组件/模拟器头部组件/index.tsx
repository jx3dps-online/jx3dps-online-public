import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  InputNumber,
  Menu,
  message,
  Popover,
  Select,
  Tooltip,
} from 'antd'
import React, { useContext, useMemo, useState } from 'react'
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
  } = props

  const {
    秘籍信息,
    更新秘籍信息,
    更新起手Buff配置,
    增益启用,
    更新增益启用,
    高亮团队快照,
    更新高亮团队快照,
  } = useContext(CycleSimulatorContext)

  const 自定义循环 = useAppSelector((state) => state?.data?.自定义循环列表)

  const [秘籍选择抽屉展示, 更新秘籍选择抽屉展示] = useState<boolean>(false)

  const 快捷添加循环 = (名称, 类型 = '默认') => {
    const 数据源 = 类型 === '默认' ? 快速导入默认循环 : 自定义循环

    const 当前循环数据: any = 数据源?.find((item) => item.名称 === 名称)

    const 技能序列信息 = (当前循环数据?.技能序列 || [])
      .map((item) => {
        const 实际技能数据 = 获取实际技能数据(item)
        const 技能信息 = 模拟信息?.技能基础数据?.find(
          (a) => a?.技能名称 === 实际技能数据?.实际技能名称,
        ) as 循环基础技能数据类型
        return {
          ...技能信息,
          额外信息: 实际技能数据?.额外信息 as any,
        }
      })
      .filter((item) => item)

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

  const 粘贴导入 = () => {
    navigator.clipboard.readText().then((clipboardData) => {
      if (!clipboardData) {
        message.error('粘贴板内无可导入数据，请检查或重新复制')
      } else {
        const list = clipboardData?.split(',')
        const 技能序列信息 = (list || [])
          .map((item) => {
            const 实际技能数据 = 获取实际技能数据(item)
            const 技能信息 = 模拟信息?.技能基础数据?.find(
              (a) => a?.技能名称 === 实际技能数据?.实际技能名称,
            ) as 循环基础技能数据类型
            return {
              ...技能信息,
              额外信息: 实际技能数据?.额外信息 as any,
            }
          })
          .filter((item) => item)
        if (技能序列信息.length) {
          快速导入循环(技能序列信息)
          message.success('数据已全部导入')
        } else {
          message.error('粘贴板内无可导入数据，请检查或重新复制')
        }
      }
    })
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
    const 加速档位 = 获取档位加速值()
    return Object.keys(加速档位).map((key) => {
      return {
        key,
        label: `${key}段加速`,
        onClick: () => {
          更新加速值(加速档位[key])
        },
      }
    })
  }, [])

  const 切换增益启用状态 = (checked) => {
    更新增益启用(checked)
  }

  return (
    <div className={styles.header}>
      <div className={styles.wrapper}>
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
      </div>
      <div className={styles.btns}>
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
          <span className={styles.btnLabel}>团队增益</span>
          <团队增益快照
            启用={启用团队增益快照}
            设置是否启用={更新启用团队增益快照}
            当前时间={模拟信息?.当前时间 || 0}
            高亮团队快照={高亮团队快照}
            更新高亮团队快照={更新高亮团队快照}
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
        <Dropdown
          overlay={
            <Menu>
              {判断有无橙武循环数据(快速导入默认循环, 大橙武模拟)?.map((item) => {
                return (
                  <Menu.Item key={item?.名称} onClick={() => 快捷添加循环(item?.名称)}>
                    {item?.名称}
                  </Menu.Item>
                )
              })}
              {判断有无橙武循环数据(自定义循环, 大橙武模拟)?.length
                ? 判断有无橙武循环数据(自定义循环, 大橙武模拟).map((item, index) => {
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
        <Tooltip title='自定义循环和原计算器其他循环的dps会心期望计算方式不同。会导致最终数值偏差。请勿进行跨循环比较。'>
          <Button
            size='small'
            type='primary'
            onClick={() => 设置自定义循环保存弹窗(true)}
            disabled={cycle?.length < 1 || 模拟信息?.循环执行结果 === '异常'}
          >
            保存为自定义循环
          </Button>
        </Tooltip>
      </div>
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
