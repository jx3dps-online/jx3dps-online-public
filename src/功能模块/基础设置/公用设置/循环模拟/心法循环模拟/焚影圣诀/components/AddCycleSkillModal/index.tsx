import { Drawer } from 'antd'
import React from 'react'
import { 循环基础技能数据类型, 模拟信息类型 } from '../../simulator/type'
import AddCycleSkillBtns from '../AddCycleSkillBtns'

interface AddCycleSkillModalProps {
  向循环内插入技能: (data: 循环基础技能数据类型[], 插入位置: string, 插入索引: number) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  添加设置: { 位置: string; 索引 }
  添加技能弹窗显示: boolean
  关闭弹窗: () => void
}

function AddCycleSkillModal(props: AddCycleSkillModalProps) {
  const {
    向循环内插入技能,
    处理循环结果对象,
    模拟信息,
    大橙武模拟,
    添加设置,
    添加技能弹窗显示,
    关闭弹窗,
  } = props

  const 新增循环技能 = (item: 循环基础技能数据类型) => {
    向循环内插入技能([item], 添加设置?.位置, 添加设置?.索引)
  }

  const 批量新增循环 = (item: 循环基础技能数据类型[]) => {
    向循环内插入技能(item, 添加设置?.位置, 添加设置?.索引)
  }

  return (
    <Drawer
      title='插入技能'
      placement='bottom'
      open={添加技能弹窗显示}
      onClose={关闭弹窗}
      height={180}
    >
      <AddCycleSkillBtns
        新增循环技能={新增循环技能}
        批量新增循环={批量新增循环}
        处理循环结果对象={处理循环结果对象}
        模拟信息={模拟信息}
        大橙武模拟={大橙武模拟}
        插入技能
      />
    </Drawer>
  )
}

export default AddCycleSkillModal
