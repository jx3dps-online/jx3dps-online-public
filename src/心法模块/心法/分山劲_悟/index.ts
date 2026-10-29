/**
 * @name 心法模块-分山劲_悟
 * 模块写入者：神光毓逍遥
 * 数据来源：无界分山PVE白皮书（jx3box bps/101845，技能及奇穴：神光毓逍遥）
 *          技能系数取自游戏数据 settings/skill_mobile/skills.tab（2026-09-05 数据核对）
 */
import type { 心法配置类型 } from '@/心法模块/interface'

import 默认数据 from './默认数据'
import 加速阈值 from './默认数据/加速阈值'
import 技能系数, { 技能增益 } from './技能系数'
import 奇穴数据 from './奇穴'
import 计算循环 from './计算循环'
import 端游分山劲数据 from '../分山劲/index'

const 心法配置: 心法配置类型 = {
  ...端游分山劲数据,
  加速阈值,
  模块负责人: '神光毓逍遥',
  名称: '分山劲_悟',
  简写: 'w_fsj',
  心法所属端: '无界',
  数据提供: '数据：神光毓逍遥；测试：神光毓逍遥',
  奇穴数据: 奇穴数据,
  技能系数: 技能系数,
  技能增益: 技能增益,
  计算循环: 计算循环,
  默认数据: 默认数据,
  基础GCD: 1,
  系统配置: {
    ...端游分山劲数据.系统配置,
    心法图标: 'https://icon.jx3box.com/icon/101024.png',
  },
}

export default 心法配置
