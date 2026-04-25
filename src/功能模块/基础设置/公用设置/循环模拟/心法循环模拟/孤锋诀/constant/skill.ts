import { Buff枚举, 循环基础技能数据类型, 日志类型 } from '../simulator/type'
import { 基础GCD帧 } from '.'
import { 每秒郭氏帧 } from '@/数据/常量'

// 技能图标引入
import cang from '../assets/Skill/cang.png'
// import chifeng from '../assets/Skill/chifeng.png'
import duan from '../assets/Skill/duan.png'
import gu from '../assets/Skill/gu.png'
import heng from '../assets/Skill/heng.png'
import jue from '../assets/Skill/jue.png'
import liu from '../assets/Skill/liu.png'
import mie from '../assets/Skill/mie.png'
import ting from '../assets/Skill/ting.png'
// import you from '../assets/Skill/you.png'
import xing from '../assets/Skill/xing.png'
import cw from '../assets/Skill/cw.png'
import cw_quxiao from '../assets/Skill/cw_quxiao.png'

// Buff图标引入

import shipo from '../assets/Buff/shipo.png'
import yuji from '../assets/Buff/yuji.png'
import qiangfeng from '../assets/Buff/qiangfeng.png'
import lianfeng from '../assets/Buff/lianfeng.png'
import mieying from '../assets/Buff/mieying.png'
import pozhan from '../assets/Buff/pozhan.png'
import changsuo from '../assets/Buff/changsuo.png'
import xinglian from '../assets/Buff/xinglian.png'
import canglian from '../assets/Buff/canglian.png'
// import shenxing from '../assets/Buff/shenxing.png'
import liulan from '../assets/Buff/liulan.png'
import liuxue from '../assets/Buff/liuxue.png'
import liangen from '../assets/Buff/liangen.png'
import jieyuan from '../assets/Buff/jieyuan.png'
import { 通用Buff数据, 通用循环模拟技能基础数据 } from '../../通用/通用技能/通用技能定义'

const 循环模拟技能基础数据: 循环基础技能数据类型[] = [
  ...(通用循环模拟技能基础数据 as any),
  {
    技能名称: '行',
    技能释放后添加GCD: 基础GCD帧,
    回复锐意: 5,
    造成伤害次数: 1,
    技能CD: 0,
    技能GCD组: '单刀',
    技能类型: '单刀',
    图标: xing,
    技能原始名称: '行云势',
  },
  {
    技能名称: '停',
    技能释放后添加GCD: 基础GCD帧,
    回复锐意: 10,
    造成伤害次数: 1,
    技能CD: 每秒郭氏帧 * 12, // 2本秘籍 -1 -2
    // 技能CD: 每秒郭氏帧 * 12,
    技能GCD组: '单刀',
    技能类型: '单刀',
    图标: ting,
    技能原始名称: '停云势',
  },
  {
    技能名称: '决',
    技能释放后添加GCD: 基础GCD帧,
    回复锐意: 25,
    技能CD: 每秒郭氏帧 * 20,
    造成伤害次数: 1,
    最大充能层数: 3,
    技能GCD组: '单刀',
    技能类型: '单刀',
    图标: jue,
    技能原始名称: '决云势',
  },
  {
    技能名称: '留',
    技能释放后添加GCD: 基础GCD帧,
    回复锐意: 0,
    造成伤害次数: 1,
    技能GCD组: '自身',
    技能类型: '单刀',
    技能CD: 每秒郭氏帧 * 6,
    // 技能CD: 每秒郭氏帧 * 1,
    图标: liu,
    技能原始名称: '留客雨',
  },
  {
    技能名称: '断',
    技能释放后添加GCD: 基础GCD帧,
    造成伤害次数: 1,
    消耗锐意: 100,
    技能GCD组: '单刀',
    技能类型: '单刀',
    图标: duan,
    技能原始名称: '断云势',
  },
  {
    技能名称: '沧',
    技能释放后添加GCD: 基础GCD帧,
    造成伤害次数: 1,
    技能GCD组: '双刀',
    技能类型: '双刀',
    图标: cang,
    技能原始名称: '沧浪三叠',
  },
  {
    技能名称: '横',
    技能释放后添加GCD: 基础GCD帧,
    技能CD: 每秒郭氏帧 * 15,
    造成伤害次数: 1,
    技能GCD组: '双刀',
    技能类型: '双刀',
    图标: heng,
    技能原始名称: '横云断浪',
  },
  {
    技能名称: '孤',
    技能释放后添加GCD: 基础GCD帧,
    造成伤害次数: 1,
    技能GCD组: '双刀',
    技能类型: '双刀',
    图标: gu,
    技能原始名称: '孤锋破浪',
  },
  {
    技能名称: '灭',
    技能释放后添加GCD: 0,
    造成伤害次数: 0,
    技能CD: 每秒郭氏帧 * 20,
    技能GCD组: '自身',
    技能类型: '其他',
    图标: mie,
    技能原始名称: '灭影追风',
  },
  {
    技能名称: '弱点击破',
    技能释放后添加GCD: 0,
    造成伤害次数: 0,
    技能GCD组: '自身',
    技能类型: '其他',
    图标: pozhan,
    说明: '该技能代表下一个技能会触发击破',
  },
  {
    技能名称: '裂海横天',
    技能释放后添加GCD: 每秒郭氏帧,
    技能CD: 每秒郭氏帧 * 10,
    最大充能层数: 2,
    造成伤害次数: 0,
    技能GCD组: '自身',
    技能类型: '其他',
    显示类型: '奇穴技能',
    图标: 'https://icon.jx3box.com/icon/17739.png',
  },
  {
    技能名称: '触发橙武',
    技能释放后添加GCD: 0,
    造成伤害次数: 0,
    技能CD: 每秒郭氏帧 * 50,
    技能GCD组: '自身',
    技能类型: '其他',
    显示类型: '大橙武模拟',
    图标: cw,
  },
  {
    技能名称: '点掉橙武',
    技能释放后添加GCD: 0,
    造成伤害次数: 0,
    技能CD: 0,
    技能GCD组: '自身',
    技能类型: '其他',
    显示类型: '大橙武模拟',
    图标: cw_quxiao,
  },
  {
    技能名称: '换行',
    技能释放后添加GCD: 0,
    技能CD: 0,
    技能GCD组: '自身',
    造成伤害次数: 0,
    技能类型: '其他',
    图标: 'https://icon.jx3box.com/icon/17632.png',
    说明: '插入换行将只以”换行“作为展示换行。 若无"换行"则默认以”断云势“或点了威升的”灭影追风”作为展示换行.',
  },
  // {
  //   技能名称: '呆',
  //   技能释放后添加GCD: 0,
  //   造成伤害次数: 0,
  //   技能类型: '其他',
  // },
]

export default 循环模拟技能基础数据

export const 日志类型数组: 日志类型[] = [
  '释放技能',
  '自身buff变动',
  '目标buff变动',
  '造成伤害',
  '技能释放结果',
  '等CD',
]

export const 技能GCD组 = {
  流云势法: ['行', '停', '决', '断'],
  破浪三式: ['横', '沧', '孤'],
  自身: ['留', '灭', '驰', '游'],
}

// Map预备数据
export const 原始Buff数据: Buff枚举 = {
  // Buff
  截流: {
    // 33178
    类型: '自身',
    名称: '截流',
    最大层数: 3,
    最大持续时间: 每秒郭氏帧 * 999,
    图标: changsuo,
  },
  弱点_左: {
    类型: '目标',
    名称: '弱点_左',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 20,
    图标: shipo,
  },
  弱点_右: {
    类型: '目标',
    名称: '弱点_右',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 20,
    图标: shipo,
  },
  寻隙: { 类型: '自身', 名称: '寻隙', 最大层数: 1, 最大持续时间: 每秒郭氏帧 * 10, 图标: shipo },
  灭影追风: {
    类型: '自身',
    名称: '灭影追风',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 12,
    图标: mieying,
  },
  破绽: {
    类型: '目标',
    名称: '破绽',
    最大层数: 4,
    最大持续时间: 每秒郭氏帧 * 60,
    图标: pozhan,
    自然消失失去层数: 1,
  },
  长溯: {
    // 24219
    类型: '目标',
    名称: '长溯',
    最大层数: 9,
    最大持续时间: 每秒郭氏帧 * 300,
    图标: changsuo,
  },
  行链: { 类型: '自身', 名称: '行链', 最大层数: 2, 最大持续时间: 每秒郭氏帧 * 10, 图标: xinglian },
  沧链: { 类型: '自身', 名称: '沧链', 最大层数: 2, 最大持续时间: 每秒郭氏帧 * 3, 图标: canglian },
  流岚: {
    类型: '自身',
    名称: '流岚',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 60,
    图标: liulan,
    自然消失失去层数: 1,
  },
  橙武: { 类型: '自身', 名称: '橙武', 最大层数: 1, 最大持续时间: 每秒郭氏帧 * 6, 图标: cw },
  橙武孤锋: {
    类型: '自身',
    名称: '橙武孤锋',
    最大层数: 8,
    最大持续时间: 每秒郭氏帧 * 42,
    图标: cw,
  },
  威声: {
    类型: '自身',
    名称: '威声',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 2,
    图标: 'https://icon.jx3box.com/icon/17762.png',
  },
  截辕内置CD: {
    // 24747
    类型: '目标',
    名称: '截辕内置CD',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 2,
    图标: jieyuan,
  },
  弱点内置CD: {
    // 24747
    类型: '目标',
    名称: '弱点内置CD',
    最大层数: 1,
    最大持续时间: 1,
    图标: shipo,
  },
  // 千机赛季
  潋风行云势额外锐意: {
    // 33181_1
    类型: '自身',
    名称: '潋风行云势额外锐意',
    备注: '前3次“行云势”额外获得5点锐意',
    最大层数: 3,
    最大持续时间: 每秒郭氏帧 * 40,
    图标: 'https://icon.jx3box.com/icon/19159.png',
  },
  潋风行云势额外伤害: {
    // 33181_2
    类型: '自身',
    名称: '潋风行云势额外伤害',
    备注: '第4次开始行云势额外40%伤害，存在潋风行云势额外锐意时，不生效。',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 40,
    图标: 'https://icon.jx3box.com/icon/20071.png',
  },
  沧逸: {
    // 33184_1
    类型: '自身',
    名称: '沧逸',
    备注: '所有为目标添加的“破绽”会直接转化为自身“洄涛”',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 999,
    图标: 'https://icon.jx3box.com/icon/27096.png',
  },
  倾怒: {
    // 33184_2
    类型: '自身',
    名称: '倾怒',
    备注: '施展“沧浪三叠”时会尝试额外消耗1层“洄涛”并直接打出三段效果，施展“孤锋破浪”命中目标后会根据其“破绽”层数额外造成伤害，随后消耗目标全部“破绽”',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 999,
    图标: 'https://icon.jx3box.com/icon/27097.png',
  },
  洄涛: {
    // 33176
    类型: '自身',
    名称: '洄涛',
    备注: '施展《破浪三式》套路招式命中当前目标时，会尝试消耗1层“洄涛”为其添加1层“破绽”',
    最大层数: 24,
    最大持续时间: 每秒郭氏帧 * 120,
    图标: 'https://icon.jx3box.com/icon/17728.png',
  },
  下一个技能会触发击破: {
    类型: '自身',
    名称: '下一个技能会触发击破',
    备注: '下一个技能会触发击破',
    最大层数: 1,
    最大持续时间: 每秒郭氏帧 * 120,
    图标: pozhan,
  },
  // DOT
  流血: {
    类型: '目标',
    名称: '流血',
    最大层数: 4,
    最大作用次数: 3,
    最大持续时间: 每秒郭氏帧 * 6,
    伤害频率: 32,
    图标: liuxue,
  },
  截辕: {
    类型: '目标',
    名称: '截辕',
    最大层数: 1,
    最大作用次数: 6,
    最大持续时间: 每秒郭氏帧 * 12,
    伤害频率: 32,
    图标: jieyuan,
  },
  ...(通用Buff数据 as any),
}
