import type { 装备信息数据类型, 装备选择范围类型 } from './装备'
import type { 增益选项数据类型 } from './团队增益'
import type { 附魔类型 } from './附魔'

export interface 附魔分配结果 {
  [部位索引: string]: number
}

export interface 配装快照 {
  id: string
  名称: string
  来源: '当前' | '目标' | '导入' | '代码'
  装备信息: 装备信息数据类型
  创建时间: number
  循环名称?: string
  增益启用?: boolean
  增益数据?: 增益选项数据类型
}

export interface 方案对比结果 {
  基准id: string
  列表: Array<{
    快照: 配装快照
    秒伤: number
    秒伤差: number
    秒伤百分比: number
    属性面板: Record<string, number>
    装分: number
    加速不匹配: boolean
    循环不同: boolean
    增益不同: boolean
  }>
}

export interface 变更动作 {
  类型:
    | '装备'
    | '附魔'
    | '五彩石'
    | '精炼'
    | '镶嵌'
    | '大附魔'
    | '散件套套装'
    | '药品'
    | '食品'
    | '家园酒品'
    | '阵眼'
  部位?: string
  目标值: string | number
  预估秒伤增益: number
  预估成本铜: number
}

export interface 全局寻优配置 {
  算法: '模拟退火'
  参与小附魔?: boolean
  参与大附魔?: boolean
  参与五彩石?: boolean
  参与药品?: boolean
  参与食品?: boolean
  参与家园酒品?: boolean
  参与阵眼?: boolean
  不使用橙武?: boolean
  /** 仅在参与小附魔时生效 */
  排除附魔类型?: 附魔类型[]
  迭代次数: number
  循环轮数?: number
  装备扰动数量?: number
  约束: {
    加速段位?: number
    加速值范围?: [number, number]
    套装件数?: number
    预算铜?: number
    装分上限?: number
  }
  锁定部位: string[]
  装备选择范围: 装备选择范围类型
}

export interface 全局寻优结果 {
  替换前装备信息: 装备信息数据类型
  替换后装备信息: 装备信息数据类型
  替换前增益数据?: 增益选项数据类型
  替换后增益数据?: 增益选项数据类型
  变更动作列表: 变更动作[]
  秒伤提升: number
  总成本铜?: number
  /** 是否找到满足全部约束的配装 */
  有效: boolean
  替换前装分: number
  替换后装分: number
}

export interface 对比结果条目 {
  id: string
  dpsUp: number
  dpsPercent: number
  属性差: Record<string, number>
  装分差: number
  加速不匹配: boolean
  已收藏: boolean
  成本铜?: number
}

export interface 网页设置类型 {
  外观: {
    背景图片显示: boolean
    桌宠显示: boolean
  }
  数据: {
    默认区服: string
  }
  行为偏好: {
    智能对比默认开启: boolean
    对比默认显示百分比: boolean
    跨加速对比默认: boolean
    点击心法图标行为: '回到首页' | '快速切换'
    配装器高亮属性: boolean
    宏允许数字IDBuff: boolean
  }
}

export type 部分网页设置类型 = {
  外观?: Partial<网页设置类型['外观']>
  数据?: Partial<网页设置类型['数据']>
  行为偏好?: Partial<网页设置类型['行为偏好']>
}
