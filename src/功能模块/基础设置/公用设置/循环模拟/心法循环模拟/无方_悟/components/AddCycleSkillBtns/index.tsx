import { Space } from 'antd'
import { 循环基础技能数据类型, 模拟信息类型 } from '../../simulator/type'
import AddCycleSkillBtn from './AddCycleSkillBtn'
import './index.css'

interface AddCycleSkillBtnsProps {
  新增循环技能: (data: 循环基础技能数据类型) => void
  批量新增循环: (data: 循环基础技能数据类型[]) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  插入技能?: boolean
}

function AddCycleSkillBtns(props: AddCycleSkillBtnsProps) {
  const { 新增循环技能, 处理循环结果对象, 模拟信息, 大橙武模拟, 奇穴信息, 插入技能 } = props

  return (
    <div className={'cycle-simulator-setting-btns'}>
      <div className={'cycle-simulator-setting-item'}>
        <span className={'ztg-cycle-btn-type'}>傍身招式</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              return !item?.创建循环不可选 && item?.技能类型 === '傍身招式'
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
        <span className={'ztg-cycle-btn-type'}>对阵招式</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              return !item?.创建循环不可选 && item?.技能类型 === '对阵招式'
            })
            .map((item) => {
              return (
                <AddCycleSkillBtn
                  onClick={() => 新增循环技能(item)}
                  新增循环技能={新增循环技能}
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
        <span className={'ztg-cycle-btn-type'}>绝技技能</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
              return !item?.创建循环不可选 && item?.技能类型 === '绝技技能'
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
        <span className={'ztg-cycle-btn-type'}>其他</span>
        <Space className={'cycle-simulator-setting-skills'} size={[8, 16]} wrap>
          {模拟信息?.技能基础数据
            ?.filter((item) => {
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
    </div>
  )
}

export default AddCycleSkillBtns
