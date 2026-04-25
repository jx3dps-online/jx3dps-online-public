import { Col, Row, Space, Tag } from 'antd'
import React from 'react'
import { 循环基础技能数据类型, 模拟信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import { 快捷添加数据, 快捷添加数据类型 } from './快捷添加'
import { 获取实际技能数据 } from '../../../通用/通用函数'
import { 选中秘籍信息 } from '@/@types/秘籍'

interface AddCycleSkillBtnsProps {
  新增循环技能: (data: 循环基础技能数据类型) => void
  批量新增循环: (data: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  插入技能?: boolean // 插入技能时不禁用技能
  自动三才?: boolean
  秘籍信息: 选中秘籍信息
  // 宠物顺序: string[]
  // 更新宠物顺序: (e: string[]) => void
}

function AddCycleSkillBtns(props: AddCycleSkillBtnsProps) {
  const {
    新增循环技能,
    批量新增循环,
    处理循环结果对象,
    模拟信息,
    大橙武模拟,
    奇穴信息,
    插入技能,
    自动三才,
    秘籍信息,
    // 宠物顺序,
    // 更新宠物顺序,
  } = props

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

  const 判断奇穴存在 = (奇穴列表) => {
    return 奇穴信息.some((item) => 奇穴列表?.includes(item))
  }

  return (
    <div className={'cycle-simulator-setting-btns'}>
      <div className={'cycle-simulator-setting-item'}>
        <span className={'ztg-cycle-btn-type'}>九字诀</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              return !item?.创建循环不可选 && item?.技能类型 === '九字诀'
            })
            ?.filter((item) => {
              if (插入技能) {
                return true
              }
              if (item?.奇穴存在不可释放) {
                return !判断奇穴存在(item?.奇穴存在不可释放)
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
                  className={'ztg-cycle-simulator-setting-btn'}
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
        <span className={'ztg-cycle-btn-type'}>占术</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              if (item?.技能类型 !== '占术') return false
              const 顺序变卦启用 = 秘籍信息?.['变卦']?.includes('顺序变卦')
              if (item?.技能名称 === '变卦') {
                return 顺序变卦启用
              }
              if (['变水卦', '变山卦', '变火卦'].includes(item?.技能名称)) {
                return !顺序变卦启用
              }
              return !item?.创建循环不可选
            })
            ?.filter((item) => {
              if (插入技能) {
                return true
              }
              if (item?.奇穴存在不可释放) {
                return !判断奇穴存在(item?.奇穴存在不可释放)
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
                  className={'ztg-cycle-simulator-setting-btn'}
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
        <span className={'ztg-cycle-btn-type'}>奇门</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              if (item?.显示类型 === '奇穴技能') {
                const 依赖名称 = item?.依赖奇穴名 || item?.技能名称
                return (
                  奇穴信息?.includes(依赖名称) && !item?.创建循环不可选 && item?.技能类型 === '奇门'
                )
              }
              return !item?.创建循环不可选 && item?.技能类型 === '奇门'
            })
            ?.filter((item) => {
              if (自动三才) {
                return item?.技能名称 !== '纵横三才'
              } else {
                return true
              }
            })
            ?.filter((item) => {
              if (插入技能) {
                return true
              }
              if (item?.奇穴存在不可释放) {
                return !判断奇穴存在(item?.奇穴存在不可释放)
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
                  className={'ztg-cycle-simulator-setting-btn'}
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
        <span className={'ztg-cycle-btn-type'}>其他</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              if (!大橙武模拟 && item?.显示类型 === '大橙武模拟') {
                return false
              }
              if (item?.显示类型 === '奇穴技能') {
                const 依赖名称 = item?.依赖奇穴名 || item?.技能名称
                return (
                  奇穴信息?.includes(依赖名称) && !item?.创建循环不可选 && item?.技能类型 === '其他'
                )
              }
              return !item?.创建循环不可选 && item?.技能类型 === '其他'
            })
            ?.filter((item) => {
              if (插入技能) {
                return true
              }
              if (item?.奇穴存在不可释放) {
                return !判断奇穴存在(item?.奇穴存在不可释放)
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
                  className={'ztg-cycle-simulator-setting-btn'}
                  完整循环={处理循环结果对象?.完整循环 || []}
                  技能={item}
                  模拟信息={模拟信息}
                  插入技能={插入技能}
                />
              )
            })}
        </Space>
      </div>
      <div className={`cycle-simulator-setting-item cycle-simulator-setting-fast-item`}>
        <span className={'ztg-cycle-btn-type'}>快捷添加</span>
        <Row className={'cycle-simulator-setting-quick'} gutter={[16, 8]}>
          {快捷添加数据.map((item) => {
            return (
              <Col span={8} key={item?.名称}>
                {/* <Tooltip title={item?.技能序列?.join(' ')}> */}
                <Tag
                  color={item?.color || 'blue'}
                  onClick={() => 批量新增循环技能(item)}
                  className={'cycle-simulator-setting-quick-item'}
                >
                  {item?.名称}
                </Tag>
                {/* </Tooltip> */}
              </Col>
            )
          })}
        </Row>
      </div>
    </div>
  )
}

export default AddCycleSkillBtns
