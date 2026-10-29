import React from 'react'
import { Space } from 'antd'
import type { 循环基础技能数据类型, 模拟信息类型, 额外信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import './index.css'
interface 按钮组属性 {
  新增循环技能: (技能: 循环基础技能数据类型, 额外信息?: 额外信息类型) => void
  批量新增循环: (技能: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  插入技能?: boolean
}
export default function AddCycleSkillBtns({
  新增循环技能,
  处理循环结果对象,
  模拟信息,
  大橙武模拟,
  奇穴信息,
  插入技能,
}: 按钮组属性) {
  return (
    <div className='cycle-simulator-setting-btns'>
      {['殷雷腿', '秀明尘身', '松烟竹雾', '雪絮金屏', '其他'].map((分组) => (
        <div className='cycle-simulator-setting-item' key={分组}>
          <span className='daozong-cycle-btn-type'>{分组}</span>
          <Space className='cycle-simulator-setting-skills' size={[8, 16]} wrap>
            {模拟信息.技能基础数据
              .filter(
                (技能) =>
                  !技能.创建循环不可选 &&
                  (技能.显示类型 !== '大橙武模拟' || 大橙武模拟) &&
                  (技能.技能名称 !== '橙武四面楚歌' ||
                    (!!模拟信息.当前自身buff列表.橙武 &&
                      !!模拟信息.当前各技能运行状态?.[技能.技能名称]?.额外施展次数)) &&
                  (技能.技能分组 || 技能.技能类型) === 分组 &&
                  (!技能.依赖奇穴名 || 奇穴信息.includes(技能.依赖奇穴名)),
              )
              .map((技能) => (
                <AddCycleSkillBtn
                  key={技能.技能名称}
                  技能={技能}
                  模拟信息={模拟信息}
                  完整循环={处理循环结果对象.完整循环}
                  插入技能={插入技能}
                  onClick={(extra) => 新增循环技能(技能, extra)}
                  className='daozong-cycle-simulator-setting-btn'
                />
              ))}
          </Space>
        </div>
      ))}
    </div>
  )
}
