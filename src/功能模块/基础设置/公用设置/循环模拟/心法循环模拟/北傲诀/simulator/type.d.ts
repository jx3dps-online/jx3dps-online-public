import type {
  循环基础技能数据类型 as 通用技能,
  技能释放记录数据,
  技能运行数据类型 as 通用技能运行数据,
} from '../../通用/通用框架/类型定义/技能'
import type {
  模拟信息类型 as 通用模拟信息,
  循环日志数据类型 as 通用日志,
} from '../../通用/通用框架/类型定义/模拟'
import type 秀明尘身 from './技能类/秀明尘身'
import type 松烟竹雾 from './技能类/松烟竹雾'
import type 雪絮金屏 from './技能类/雪絮金屏'
import type 上将军印 from './技能类/上将军印'
import type 破釜沉舟 from './技能类/破釜沉舟'
import type 龙骧虎步 from './技能类/龙骧虎步'
import type 雷走风切 from './技能类/雷走风切'
import type 西楚悲歌 from './技能类/西楚悲歌'
import type 坚壁清野 from './技能类/坚壁清野'
import type 刀啸风吟 from './技能类/刀啸风吟'
import type 醉斩白蛇 from './技能类/醉斩白蛇'
import type 闹须弥 from './技能类/闹须弥'
import type 碎江天 from './技能类/碎江天'
import type 擒龙六斩 from './技能类/擒龙六斩'
import type 四面楚歌 from './技能类/四面楚歌'
import type 橙武四面楚歌 from './技能类/橙武四面楚歌'
import type 楚河汉界 from './技能类/楚河汉界'
import type 烽河 from './技能类/烽河'
import type 换行 from './技能类/换行'
import type 闹须弥DOT from './DOT类/闹须弥'
import type 沉舟DOT from './DOT类/沉舟'
import type 触发橙武 from './技能类/触发橙武'
import type 点掉叠霜 from './技能类/点掉叠霜'
import type 特效腰坠 from '../../通用/通用技能/特效腰坠'

export * from '../../通用/通用框架/类型定义/Buff'
export * from '../../通用/通用框架/类型定义/DOT'
export {
  检查运行数据实例类型,
  技能释放记录数据,
  技能释放记录结果,
  额外信息类型,
} from '../../通用/通用框架/类型定义/技能'
export { 待生效事件 } from '../../通用/通用框架/类型定义/模拟'

export interface 技能运行数据类型 extends 通用技能运行数据 {
  额外施展次数?: number
}

export type 体态类型 = '秀明尘身' | '松烟竹雾' | '雪絮金屏'
export type 资源类型 = '狂意' | '刀魂' | '气劲'
export interface 角色状态信息类型 {
  狂意: number
  刀魂: number
  气劲: number
  体态: 体态类型
}
export interface 循环基础技能数据类型 extends 通用技能 {
  技能分组?: '殷雷腿' | 体态类型
  消耗资源?: 资源类型
  消耗数量?: number
  透支?: boolean
}
export type 技能GCD组 = Record<string, number>
export interface 技能类实例集合 {
  [key: string]: any
  秀明尘身: 秀明尘身
  松烟竹雾: 松烟竹雾
  雪絮金屏: 雪絮金屏
  上将军印: 上将军印
  破釜沉舟: 破釜沉舟
  龙骧虎步: 龙骧虎步
  雷走风切: 雷走风切
  西楚悲歌: 西楚悲歌
  坚壁清野: 坚壁清野
  刀啸风吟: 刀啸风吟
  醉斩白蛇: 醉斩白蛇
  闹须弥: 闹须弥
  碎江天: 碎江天
  擒龙六斩: 擒龙六斩
  四面楚歌: 四面楚歌
  橙武四面楚歌: 橙武四面楚歌
  楚河汉界: 楚河汉界
  烽河: 烽河
  换行: 换行
  '闹须弥(DOT)': 闹须弥DOT
  '沉舟(DOT)': 沉舟DOT
  触发橙武: 触发橙武
  点掉叠霜: 点掉叠霜
  特效腰坠: 特效腰坠
}
export interface 模拟信息类型 extends 通用模拟信息 {
  角色状态信息: 角色状态信息类型
  技能基础数据: 循环基础技能数据类型[]
  当前各技能运行状态: Record<string, 技能运行数据类型>
}
export interface ShowCycleSingleSkill extends 循环基础技能数据类型, 技能释放记录数据 {
  index?: number
}
export type 日志类型 = NonNullable<通用日志['日志类型']>
export interface 循环日志数据类型 extends 通用日志 {
  其他数据?: { 伤害次数?: number; 技能等级?: number; 伤害层数?: number }
}
