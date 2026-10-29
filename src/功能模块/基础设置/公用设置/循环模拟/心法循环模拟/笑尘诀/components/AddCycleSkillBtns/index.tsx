import React from 'react'
import { Col, Row, Space, Tag } from 'antd'
import type { 循环基础技能数据类型, 模拟信息类型, 额外信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import { 快捷添加数据 } from './快捷添加'
import './index.css'
import styles from './index.module.less'

interface 技能按钮组属性 {
  新增循环技能: (技能: 循环基础技能数据类型, 额外信息?: 额外信息类型) => void
  批量新增循环: (技能: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  插入技能?: boolean
}

function AddCycleSkillBtns({
  新增循环技能,
  批量新增循环,
  处理循环结果对象,
  模拟信息,
  奇穴信息,
  大橙武模拟,
  插入技能,
}: 技能按钮组属性) {
  return (
    <div className='cycle-simulator-setting-btns'>
      {['打狗棒法', '降龙掌', '逍遥行', '其他'].map((分类) => (
        <div className='cycle-simulator-setting-item' key={分类}>
          <span className={styles.分类}>{分类}</span>
          <Space className='cycle-simulator-setting-skills' size={[8, 16]} wrap>
            {模拟信息.技能基础数据
              .filter(
                (技能) =>
                  技能.技能类型 === 分类 &&
                  (技能.显示类型 !== '大橙武模拟' || 大橙武模拟) &&
                  (!技能.显示类型 ||
                    技能.显示类型 !== '奇穴技能' ||
                    奇穴信息.includes(技能.依赖奇穴名 || 技能.技能名称)),
              )
              .map((技能) => {
                return (
                  <AddCycleSkillBtn
                    key={技能.技能名称}
                    技能={技能}
                    完整循环={处理循环结果对象.完整循环}
                    模拟信息={模拟信息}
                    奇穴信息={奇穴信息}
                    插入技能={插入技能}
                    onClick={(额外信息) => 新增循环技能(技能, 额外信息)}
                  />
                )
              })}
          </Space>
        </div>
      ))}
      <div className='cycle-simulator-setting-item cycle-simulator-setting-quick-wrap'>
        <span className={styles.分类}>快捷添加</span>
        <Row className='cycle-simulator-setting-quick' gutter={[16, 8]}>
          {快捷添加数据.map((组合) => (
            <Col span={12} key={组合.名称}>
              <Tag
                color={组合.color}
                className='cycle-simulator-setting-quick-item'
                onClick={() =>
                  批量新增循环(
                    组合.技能序列.map(
                      (名称) => 模拟信息.技能基础数据.find((技能) => 技能.技能名称 === 名称)!,
                    ),
                  )
                }
              >
                {组合.名称}
              </Tag>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default AddCycleSkillBtns
