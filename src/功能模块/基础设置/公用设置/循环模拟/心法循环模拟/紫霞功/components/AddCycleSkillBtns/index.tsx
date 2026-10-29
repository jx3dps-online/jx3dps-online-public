import React from 'react'
import { Space } from 'antd'
import { 循环基础技能数据类型, 模拟信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import './index.module.less'
interface AddCycleSkillBtnsProps {
  新增循环技能: (技能: 循环基础技能数据类型) => void
  批量新增循环: (技能: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  会心回豆: boolean
  插入技能?: boolean
}
function AddCycleSkillBtns(props: AddCycleSkillBtnsProps) {
  const 有飞剑 = !!props.模拟信息.当前自身buff列表.飞剑?.当前层数
  const 有破势资格 = !!props.模拟信息.当前自身buff列表.破势二段?.当前层数
  const 选中破势 = props.奇穴信息.includes('破势')
  return (
    <div className='cycle-simulator-setting-btns'>
      {(['北冥剑气', '纯阳诀', '坐忘经', '其他'] as const).map((分类) => (
        <div className='cycle-simulator-setting-item' key={分类}>
          <span className='ztg-cycle-btn-type'>{分类}</span>
          <Space className='cycle-simulator-setting-skills' size={[8, 16]} wrap>
            {props.模拟信息.技能基础数据
              .filter((技能) => 技能.技能类型 === 分类)
              .filter((技能) => 技能.显示类型 !== '大橙武模拟' || props.大橙武模拟)
              .filter((技能) => {
                if (技能.技能名称 === '回豆') return !props.会心回豆
                if (技能.技能名称 === '万世不竭') return !有飞剑
                if (技能.技能名称 === '万世不竭二段') return 有飞剑
                if (技能.技能名称 === '镇山河') return !选中破势
                if (技能.技能名称 === '破势') return 选中破势 && !有破势资格
                if (技能.技能名称 === '破势二段') return 选中破势 && 有破势资格
                return true
              })
              .map((技能) => (
                <AddCycleSkillBtn
                  key={技能.技能名称}
                  技能={技能}
                  模拟信息={props.模拟信息}
                  完整循环={props.处理循环结果对象.完整循环}
                  onClick={() => props.新增循环技能(技能)}
                  插入技能={props.插入技能}
                  className='ztg-cycle-simulator-setting-btn'
                />
              ))}
          </Space>
        </div>
      ))}
    </div>
  )
}
export default AddCycleSkillBtns
