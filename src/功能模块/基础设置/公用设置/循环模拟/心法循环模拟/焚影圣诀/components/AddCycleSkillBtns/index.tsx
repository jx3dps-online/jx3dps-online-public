import { Col, Row, Space, Tag } from 'antd'
import React from 'react'
import { 循环基础技能数据类型, 模拟信息类型, 额外信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import { 快捷添加数据, 快捷添加数据类型 } from './快捷添加'
import './index.css'
import styles from './index.module.less'
import { 获取实际技能数据 } from '../../../通用/通用函数'

interface AddCycleSkillBtnsProps {
  新增循环技能: (data: 循环基础技能数据类型, extra?: 额外信息类型) => void
  批量新增循环: (data: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  插入技能?: boolean // 插入技能时不禁用技能
}

function AddCycleSkillBtns(props: AddCycleSkillBtnsProps) {
  const { 新增循环技能, 批量新增循环, 处理循环结果对象, 模拟信息, 大橙武模拟, 插入技能 } = props

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
      {['日月净世', '幻魔妙相', '御暗烬灭令', '其他'].map((分类) => (
        <div className='cycle-simulator-setting-item' key={分类}>
          <span className='daozong-cycle-btn-type'>{分类}</span>
          <Space className='cycle-simulator-setting-skills' size={[8, 16]} wrap>
            {模拟信息.技能基础数据
              .filter(
                (技能) =>
                  !技能.创建循环不可选 &&
                  技能.技能类型 === 分类 &&
                  (大橙武模拟 || 技能.显示类型 !== '大橙武模拟'),
              )
              .map((技能) => (
                <AddCycleSkillBtn
                  onClick={(extra) => 新增循环技能(技能, extra)}
                  key={技能.技能名称}
                  className={'daozong-cycle-simulator-setting-btn ' + styles.技能按钮}
                  完整循环={处理循环结果对象.完整循环}
                  技能={技能}
                  模拟信息={模拟信息}
                  插入技能={插入技能}
                />
              ))}
          </Space>
        </div>
      ))}
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
