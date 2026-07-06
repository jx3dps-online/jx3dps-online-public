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
  // 用来隐藏盾飞和盾回，只有擎盾的时候显示盾飞，擎刀的时候显示盾回
  // const 判断当前体态 = (当前体态: string) => {
  //   return 模拟信息?.角色状态信息?.体态 === 当前体态
  // }

  return (
    <div className={'cycle-simulator-setting-btns'}>
      <div className={'cycle-simulator-setting-item'}>
        <span className={'daozong-cycle-btn-type'}>云城盾</span>
        <Space className={'cycle-simulator-setting-skills'} size={[6, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              if (item?.显示类型 === '奇穴技能') {
                const 依赖名称 = item?.依赖奇穴名 || item?.技能名称
                return 奇穴信息?.includes(依赖名称)
              }
              return !item?.创建循环不可选
            })
            ?.filter((item) => !item?.创建循环不可选 && item?.技能类型 === '云城盾')
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
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={(data) => 新增循环技能(data)}
                  key={item?.技能名称}
                  className={'daozong-cycle-simulator-setting-btn'}
                  完整循环={处理循环结果对象?.完整循环 || []}
                  技能={item}
                  模拟信息={模拟信息}
                  插入技能={插入技能}
                />
              )
            })}
        </Space>
      </div>
      <div className={'cycle-simulator-setting-item'}>
        <span className={'daozong-cycle-btn-type'}>苍雪刀</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              if (item?.显示类型 === '奇穴技能') {
                const 依赖名称 = item?.依赖奇穴名 || item?.技能名称
                return 奇穴信息?.includes(依赖名称)
              }
              return !item?.创建循环不可选
            })
            ?.filter((item) => !item?.创建循环不可选 && item?.技能类型 === '苍雪刀')
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
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={(data) => 新增循环技能(data)}
                  key={item?.技能名称}
                  className={'daozong-cycle-simulator-setting-btn'}
                  完整循环={处理循环结果对象?.完整循环 || []}
                  技能={item}
                  模拟信息={模拟信息}
                  插入技能={插入技能}
                />
              )
            })}
        </Space>
      </div>
      <div className={'cycle-simulator-setting-item'}>
        <span className={'daozong-cycle-btn-type'}>通用</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              if (item?.显示类型 === '奇穴技能') {
                const 依赖名称 = item?.依赖奇穴名 || item?.技能名称
                return 奇穴信息?.includes(依赖名称)
              }
              return !item?.创建循环不可选
            })
            ?.filter((item) => !item?.创建循环不可选 && item?.技能类型 === '通用')
            ?.filter((item) => {
              // 未点出阵云结晦时，不显示月照连营和雁门迢递
              if (
                (item.技能名称 === '月照连营' || item.技能名称 === '雁门迢递') &&
                !奇穴信息?.includes('阵云结晦')
              ) {
                return false
              }
              // 未点出陷阵时，不显示撼地
              if (item.技能名称 === '撼地' && !奇穴信息?.includes('陷阵')) {
                return false
              }
              // 先做隐藏的铁骨技能，放在一个分山必不可能点的奇穴里，方便攻略组的铁骨兄弟用来排轴
              if (
                (item.技能名称 === '寒啸千军' || item.技能名称 === '盾挡') &&
                !奇穴信息?.includes('肃驾')
              ) {
                return false
              }
              if (插入技能) {
                return true
              }
              // 用来隐藏盾飞和盾回，只有擎盾的时候显示盾飞，擎刀的时候显示盾回
              // if (item?.体态 && !判断当前体态(item?.体态)) {
              //   return false
              // }
              if (item?.释放依赖Buff) {
                return 判断技能依赖buff存在(item?.释放依赖Buff)
              } else if (item?.Buff存在不可释放) {
                return !判断技能依赖buff存在(item?.Buff存在不可释放)
              } else {
                return true
              }
            })
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={(data) => 新增循环技能(data)}
                  key={item?.技能名称}
                  className={'daozong-cycle-simulator-setting-btn'}
                  完整循环={处理循环结果对象?.完整循环 || []}
                  技能={item}
                  模拟信息={模拟信息}
                  插入技能={插入技能}
                />
              )
            })}
        </Space>
      </div>

      <div className={'cycle-simulator-setting-item'}>
        <span className={'daozong-cycle-btn-type'}>其他</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
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
              return !item?.创建循环不可选 && item?.技能类型 === '其他'
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
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={(data) => 新增循环技能(data)}
                  key={item?.技能名称}
                  style={大橙武模拟 ? { padding: '0 6px' } : { padding: '0 8px' }}
                  className={'daozong-cycle-simulator-setting-btn'}
                  完整循环={处理循环结果对象?.完整循环 || []}
                  技能={item}
                  模拟信息={模拟信息}
                  插入技能={插入技能}
                />
              )
            })}
        </Space>
      </div>
      <div className={'cycle-simulator-setting-item cycle-simulator-setting-quick-wrap'}>
        <span className={'daozong-cycle-btn-type'}>快捷添加</span>
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
