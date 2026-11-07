import { Col, Row, Space, Tag } from 'antd'
import React from 'react'
import { 循环基础技能数据类型, 模拟信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import { 快捷添加数据, 快捷添加数据类型 } from './快捷添加'
import './index.css'
import { 获取实际技能数据 } from '../../../通用/通用函数'
import { useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'

interface AddCycleSkillBtnsProps {
  新增循环技能: (data: 循环基础技能数据类型) => void
  批量新增循环: (data: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  插入技能?: boolean // 插入技能时不禁用技能
  // 宠物顺序: string[]
  // 更新宠物顺序: (e: string[]) => void
}

function AddCycleSkillBtns(props: AddCycleSkillBtnsProps) {
  const 武器ID = useAppSelector(
    (state) => state.data.装备信息.装备列表.find((装备) => 装备.装备部位 === '武器')?.id,
  )
  const { 装备数据 } = use心法数据()
  const 已装备大扇子 =
    装备数据.武器.find((装备) => 装备.id === 武器ID)?.装备名称 === '血影天宇舞姬'
  const {
    新增循环技能,
    批量新增循环,
    处理循环结果对象,
    模拟信息,
    大橙武模拟,
    奇穴信息,
    插入技能,
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

  return (
    <div className={'cycle-simulator-setting-btns'}>
      <div className={'cycle-simulator-setting-item'}>
        <span className={'ztg-cycle-btn-type'}>猿公剑法</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              return !item?.创建循环不可选 && item?.技能类型 === '猿公剑法'
            })
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={() => 新增循环技能(item)}
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
        <span className={'ztg-cycle-btn-type'}>西河剑器</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => !item?.创建循环不可选 && item?.技能类型 === '西河剑器')
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={() => 新增循环技能(item)}
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
        <span className={'ztg-cycle-btn-type'}>剑器浑脱</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => !item?.创建循环不可选 && item?.技能类型 === '剑器浑脱')
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={() => 新增循环技能(item)}
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
      {已装备大扇子 && (
        <div className={'cycle-simulator-setting-item'}>
          <span className={'ztg-cycle-btn-type'}>大扇子</span>
          <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
            {模拟信息?.技能基础数据
              ?.filter((item) => !item?.创建循环不可选 && item?.技能类型 === '大扇子')
              .filter((item) => {
                if (item.技能名称 === '退出大扇子') return true
                if (模拟信息.当前自身buff列表['大扇子·P2']?.当前层数) {
                  return item.大扇子阶段 === 'P2'
                }
                if (模拟信息.当前自身buff列表.大扇子?.当前层数) {
                  return item.大扇子阶段 === 'P1'
                }
                return item.技能名称 === '使用大扇子'
              })
              .map((item) => (
                <AddCycleSkillBtn
                  onClick={() => 新增循环技能(item)}
                  key={item.技能名称}
                  className={'ztg-cycle-simulator-setting-btn'}
                  完整循环={处理循环结果对象?.完整循环 || []}
                  技能={item}
                  模拟信息={模拟信息}
                  插入技能={插入技能}
                />
              ))}
          </Space>
        </div>
      )}
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
                return 奇穴信息?.includes(依赖名称)
              }
              return !item?.创建循环不可选 && item?.技能类型 === '其他'
            })
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={() => 新增循环技能(item)}
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
      {快捷添加数据.length > 0 && (
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
      )}
    </div>
  )
}

export default AddCycleSkillBtns
