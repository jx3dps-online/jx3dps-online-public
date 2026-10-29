import React, { useState } from 'react'
import { App, Progress } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 装备选择范围类型 } from '@/@types/装备'
import { 秒伤计算 } from '@/计算模块/计算函数'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import { 全局寻优结果 } from '@/@types/配装指导'
import { 增益选项数据类型 } from '@/@types/团队增益'
import { 附魔类型 } from '@/@types/附魔'
import { 更新角色数据 } from '@/store/data'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import {
  五彩石满足潮生要求,
  获取潮生要求提示,
} from '@/功能模块/基础设置/公用设置/循环约束/潮生五彩石'

import { 执行模拟退火, 模拟退火进度 } from './模拟退火'
import 结果弹窗 from './结果弹窗'
import { 合并小吃数据 } from '../加速规划/工具函数/合并小吃'

export interface 寻优搜索控制 {
  是否取消: () => boolean
  /** 用户取消整个搜索，结果直接丢弃 */
  是否放弃: () => boolean
}

interface use模拟退火寻优类型 {
  form: any
  更换装备计算秒伤: (单个表单值: any, 全部表单值: any) => void
  装备选择范围: 装备选择范围类型
  默认镶嵌宝石等级: number
  循环覆盖?: 计算循环覆盖类型
  允许规划增益: boolean
}

export default function use模拟退火寻优(props: use模拟退火寻优类型) {
  const { form, 更换装备计算秒伤, 装备选择范围, 默认镶嵌宝石等级, 循环覆盖, 允许规划增益 } = props
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const 自定义循环列表 = useAppSelector((state) => state?.data?.自定义循环列表)

  const [进度, 设置进度] = useState<模拟退火进度>()
  const [结果, 设置结果] = useState<全局寻优结果>()
  const [替换前秒伤, 设置替换前秒伤] = useState(0)
  const [替换后秒伤, 设置替换后秒伤] = useState(0)
  const [初始表单值, 设置初始表单值] = useState<Record<string, any>>()
  const [最优表单值, 设置最优表单值] = useState<Record<string, any>>()
  const [装分上限, 设置装分上限] = useState<number>()
  const [结果弹窗展示, 设置结果弹窗展示] = useState(false)

  const 计算秒伤 = (装备信息, 是否郭氏计算 = true, 搜索增益数据?: 增益选项数据类型) => {
    try {
      const { 秒伤 } = dispatch(
        秒伤计算({
          更新装备信息: 装备信息,
          更新增益数据: 搜索增益数据,
          更新增益启用: 增益启用,
          ...循环覆盖,
          是否郭氏计算,
          计算技能详情: false,
        }),
      )
      return 秒伤 || 0
    } catch {
      return 0
    }
  }

  const 开始搜索 = async (values, 控制: 寻优搜索控制): Promise<boolean> => {
    const 初始表单值 = form?.getFieldsValue()
    const 范围: string[] = values?.额外寻优范围 || []
    const 允许增益 = 允许规划增益 && 增益启用
    const 排除附魔类型: 附魔类型[] = [
      ...(values?.不使用精品及挑战附魔 ? (['精', '挑'] as const) : []),
      ...(values?.不使用蓝色附魔 ? (['蓝'] as const) : []),
    ]
    设置进度(undefined)
    设置初始表单值(初始表单值)
    设置装分上限(values?.上限装分 || undefined)
    const 全部循环 = [...(获取当前数据()?.计算循环 || []), ...(自定义循环列表 || [])]
    const 循环名称 = 循环覆盖?.更新计算循环名称 || 当前计算循环名称
    const 当前循环信息 = 全部循环.find((循环) => 循环?.名称 === 循环名称) || 全部循环[0]
    const 五彩石数据 = 获取当前数据().五彩石
    if (
      !五彩石数据[5].concat(五彩石数据[6]).some((石头) => 五彩石满足潮生要求(石头, 当前循环信息))
    ) {
      message.warning('当前心法没有可选的潮生五彩石，无法使用依赖潮生的循环进行寻优。')
      return false
    }
    const 当前五彩石 = 五彩石数据[5]
      .concat(五彩石数据[6])
      .find((石头) => 石头.五彩石名称 === 初始表单值.五彩石)
    const 武器锁定 = (values?.锁定部位 || []).includes('_12')
    if (!五彩石满足潮生要求(当前五彩石, 当前循环信息) && (!范围.includes('五彩石') || 武器锁定)) {
      message.warning(`${获取潮生要求提示()}如需自动更换，请开启五彩石寻优并解除武器锁定。`)
      return false
    }
    const 输出 = await 执行模拟退火({
      当前循环信息,
      初始表单值,
      配置: {
        算法: '模拟退火',
        参与小附魔: 范围.includes('小附魔'),
        参与大附魔: 范围.includes('大附魔'),
        参与五彩石: 范围.includes('五彩石'),
        参与药品: 允许增益 && 范围.includes('药品'),
        参与食品: 允许增益 && 范围.includes('食品'),
        参与家园酒品: 允许增益 && 范围.includes('家园酒品'),
        参与阵眼: 允许增益 && 范围.includes('阵眼'),
        不使用橙武: !!values?.不使用橙武,
        排除附魔类型,
        迭代次数: values.搜索轮数,
        循环轮数: values.循环轮数,
        装备扰动数量: values.装备扰动数量,
        约束: {
          加速值范围: values?.目标加速值范围,
          套装件数: values?.套装件数,
          装分上限: values?.上限装分 || undefined,
        },
        锁定部位: values?.锁定部位 || [],
        装备选择范围,
      },
      装备选择范围,
      默认镶嵌宝石等级,
      增益数据,
      增益启用,
      允许规划增益,
      计算秒伤,
      是否取消: 控制.是否取消,
      onProgress: (p) => 设置进度(p),
    })
    if (控制.是否放弃()) {
      return false
    }
    if (!输出.结果.有效) {
      message.warning('未找到满足全部约束的配装，请放宽装分上限、加速范围、套装件数等条件后重试')
      return false
    }
    设置结果(输出?.结果)
    设置最优表单值(输出?.最优表单值)
    设置替换前秒伤(输出?.替换前秒伤)
    设置替换后秒伤(输出?.替换后秒伤)
    设置结果弹窗展示(true)
    return true
  }

  const 一键落地 = () => {
    if (!最优表单值) return
    const 增益变更 = (结果?.变更动作列表 || []).filter((动作) =>
      ['药品', '食品', '家园酒品', '阵眼'].includes(动作.类型),
    )
    const 小吃变更 = 增益变更.filter((动作) => 动作.类型 !== '阵眼')
    const 阵眼变更 = 增益变更.find((动作) => 动作.类型 === '阵眼')
    if (增益变更.length) {
      if (!允许规划增益 || !增益启用) {
        message.warning(
          '当前不允许应用药品、食品、家园酒品或阵眼，请开启增益并在角色配装中重新搜索。',
        )
        return
      }
      dispatch(
        更新角色数据({
          属性: '角色增益',
          数据: {
            阵眼: 阵眼变更 ? String(阵眼变更.目标值) : 增益数据.阵眼,
            小吃: 合并小吃数据(
              增益数据.小吃,
              小吃变更.map((动作) => ({ 名称: String(动作.目标值), 类型: 动作.部位 })),
            ),
          },
        }),
      )
    }
    form?.setFieldsValue(最优表单值)
    更换装备计算秒伤(undefined, 最优表单值)
    设置结果弹窗展示(false)
    message.success(
      增益变更.length
        ? '已应用配装并更新所选角色增益，可点击「保存角色」保存装备'
        : '已应用全局寻优结果，可点击「保存角色」持久化',
    )
  }

  const 进度提示 = 进度 ? (
    <div style={{ minWidth: 280 }}>
      <div style={{ marginBottom: 8 }}>
        第 {进度.当前循环轮次} / {进度.循环轮数} 轮循环 · {进度.当前阶段} {进度.阶段序号} /{' '}
        {进度.阶段总数}
      </div>
      <div style={{ marginBottom: 8 }}>
        已评估 {进度.已搜索} 个候选，当前最优 {进度.当前最优秒伤}
      </div>
      <Progress
        percent={Math.min(100, Math.floor((进度.已完成步骤 / (进度.总步骤数 || 1)) * 100))}
        size='small'
      />
    </div>
  ) : (
    '正在搜索全局最优配装，请稍候……'
  )

  return {
    开始搜索,
    进度提示,
    可停止: !!进度 && (进度?.当前最优秒伤 || 0) > (进度?.初始秒伤 || 0),
    结果弹窗: (
      <结果弹窗
        open={结果弹窗展示}
        onCancel={() => 设置结果弹窗展示(false)}
        结果={结果}
        初始表单值={初始表单值}
        最优表单值={最优表单值}
        替换前秒伤={替换前秒伤}
        替换后秒伤={替换后秒伤}
        装分上限={装分上限}
        已搜索候选数={进度?.已搜索 || 0}
        onApply={一键落地}
      />
    ),
  }
}
