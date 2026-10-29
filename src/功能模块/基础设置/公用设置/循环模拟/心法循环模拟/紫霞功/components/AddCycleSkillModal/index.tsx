import { Drawer } from 'antd'
import React, { useMemo } from 'react'
import { 循环基础技能数据类型, 模拟信息类型 } from '../../simulator/type'
import AddCycleSkillBtns from '../AddCycleSkillBtns'

interface AddCycleSkillModalProps {
  循环模拟: (配置: { 传入循环: 循环基础技能数据类型[]; 更新展示: boolean }) => 模拟信息类型
  向循环内插入技能: (data: 循环基础技能数据类型[], 插入位置: string, 插入索引: number) => void
  处理循环结果对象: { 完整循环: 循环基础技能数据类型[] }
  模拟信息: 模拟信息类型
  大橙武模拟: boolean
  奇穴信息: string[]
  会心回豆: boolean
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
    奇穴信息,
    会心回豆,
    添加设置,
    添加技能弹窗显示,
    关闭弹窗,
    循环模拟,
  } = props

  const 插入点模拟信息 = useMemo(() => {
    if (!添加技能弹窗显示) return 模拟信息
    const 位置 = 添加设置.索引 + (添加设置.位置 === '前部插入' ? 0 : 1)
    return 循环模拟({
      传入循环: 处理循环结果对象.完整循环.slice(0, 位置),
      更新展示: false,
    })
  }, [添加技能弹窗显示, 添加设置, 处理循环结果对象.完整循环, 循环模拟, 模拟信息])

  const 新增循环技能 = (item: 循环基础技能数据类型) => {
    向循环内插入技能([item], 添加设置?.位置, 添加设置?.索引)
  }

  const 批量新增循环 = (item: 循环基础技能数据类型[]) => {
    向循环内插入技能(item, 添加设置?.位置, 添加设置?.索引)
  }

  return (
    <Drawer
      rootClassName='zxg-simulator'
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
        模拟信息={插入点模拟信息}
        大橙武模拟={大橙武模拟}
        奇穴信息={奇穴信息}
        会心回豆={会心回豆}
        插入技能
      />
    </Drawer>
  )
}

export default AddCycleSkillModal
