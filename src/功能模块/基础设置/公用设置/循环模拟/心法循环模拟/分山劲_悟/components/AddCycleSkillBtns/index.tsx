import { Col, Row, Space, Tag } from 'antd'
import React from 'react'
import { 循环基础技能数据类型, 模拟信息类型, 额外信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import { 快捷添加数据, 快捷添加数据类型 } from './快捷添加'
import './index.css'
import { 获取实际技能数据 } from '../../../通用/通用函数'

interface AddCycleSkillBtnsProps {
  新增循环技能: (data: 循环基础技能数据类型, extra?: 额外信息类型) => void
  批量新增循环: (data: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  插入技能?: boolean // 插入技能时不禁用技能
}

// 技能分组展示：傍身 → 对阵（盾飞在最前）→ 通用 → 其他
const 技能分组列表: { 名称: string; 类型: string }[] = [
  { 名称: '傍身', 类型: '傍身' },
  { 名称: '对阵', 类型: '对阵' },
  { 名称: '绝技', 类型: '绝技' },
  { 名称: '通用', 类型: '通用' },
  { 名称: '其他', 类型: '其他' },
]

function AddCycleSkillBtns(props: AddCycleSkillBtnsProps) {
  const { 新增循环技能, 批量新增循环, 奇穴信息, 处理循环结果对象, 模拟信息, 大橙武模拟, 插入技能 } =
    props

  const 批量新增循环技能 = (数据: 快捷添加数据类型) => {
    const 技能原始数据: 循环基础技能数据类型[] = 数据?.技能序列
      .map((item) => {
        const { 实际技能名称, 额外信息 } = 获取实际技能数据(item)
        const 技能数据 =
          模拟信息?.技能基础数据?.find((a) => a.技能名称 === 实际技能名称) || ({} as any)
        return 技能数据
          ? {
              ...技能数据,
              额外信息,
            }
          : null
      })
      .filter((item) => item)
    if (技能原始数据?.length) {
      批量新增循环(技能原始数据)
    }
  }

  const 判断技能依赖buff存在 = (buff名称: string[]) => {
    let 存在 = false
    buff名称.forEach((item) => {
      if (
        模拟信息?.当前目标buff列表?.[item]?.当前层数 ||
        模拟信息?.当前自身buff列表?.[item]?.当前层数
      ) {
        存在 = true
      }
    })
    return 存在
  }

  const 过滤分组技能 = (技能列表: 循环基础技能数据类型[], 类型: string) => {
    return 技能列表
      ?.filter((item) => {
        if (item?.显示类型 === '奇穴技能') {
          const 依赖名称 = item?.依赖奇穴名 || item?.技能名称
          return 奇穴信息?.includes(依赖名称)
        }
        return !item?.创建循环不可选
      })
      ?.filter((item) => {
        if (!大橙武模拟 && item?.显示类型 === '大橙武模拟') {
          return false
        }
        return !item?.创建循环不可选 && item?.技能类型 === 类型
      })
      ?.filter((item) => {
        if (插入技能) {
          return true
        }
        if (item?.释放依赖Buff) {
          return 判断技能依赖buff存在(item?.释放依赖Buff)
        } else if (item?.Buff存在不可释放) {
          return !判断技能依赖buff存在(item?.Buff存在不可释放)
        } else {
          return true
        }
      })
  }

  return (
    <div className={'cycle-simulator-setting-btns fsjw-cycle-simulator-setting-btns'}>
      {技能分组列表.map((分组) => {
        const 分组技能 = 过滤分组技能(模拟信息?.技能基础数据 || [], 分组.类型)
        if (!分组技能?.length) {
          return null
        }
        return (
          <div className={'cycle-simulator-setting-item'} key={分组.类型}>
            <span className={'fsjw-cycle-btn-type'}>{分组.名称}</span>
            <Space className={'cycle-simulator-setting-skills'} size={[10, 14]} align='start' wrap>
              {分组技能.map((item) => {
                return (
                  <AddCycleSkillBtn
                    onClick={(data) => 新增循环技能(data)}
                    key={item?.技能名称}
                    className={'fsjw-cycle-simulator-setting-btn'}
                    完整循环={处理循环结果对象?.完整循环 || []}
                    技能={item}
                    模拟信息={模拟信息}
                    插入技能={插入技能}
                  />
                )
              })}
            </Space>
          </div>
        )
      })}
      <div className={'cycle-simulator-setting-item cycle-simulator-setting-quick-wrap'}>
        <span className={'fsjw-cycle-btn-type'}>快捷添加</span>
        <Row className={'cycle-simulator-setting-quick'} gutter={[16, 8]}>
          {快捷添加数据.map((item) => {
            return (
              <Col span={12} key={item?.名称}>
                <Tag
                  color={item?.color || 'blue'}
                  onClick={() => 批量新增循环技能(item)}
                  className={'cycle-simulator-setting-quick-item'}
                >
                  {item?.名称}
                </Tag>
              </Col>
            )
          })}
        </Row>
      </div>
    </div>
  )
}

export default AddCycleSkillBtns
