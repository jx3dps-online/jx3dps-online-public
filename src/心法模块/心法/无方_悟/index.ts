/**
 * @name 心法模块-无方_悟
 * 模块写入者：唐宋
 */
import type { 心法配置类型 } from '@/心法模块/interface'

import 默认数据 from './默认数据'
import 计算循环 from './计算循环'
import 奇穴数据 from './奇穴'
import 技能系数, { 技能增益 } from './技能系数'
import 端游无方数据 from '../无方/index'

const 心法配置: 心法配置类型 = {
  ...端游无方数据,
  模块负责人: '长倦',
  名称: '无方_悟',
  简写: 'w_wf',
  心法所属端: '无界',
  数据提供: '数据：考拉 唐宋；测试：长倦',
  奇穴数据: 奇穴数据,
  技能系数: 技能系数,
  技能增益: 技能增益,
  计算循环: 计算循环,
  默认数据: 默认数据,
  基础GCD: 1,
  系统配置: {
    ...端游无方数据.系统配置,
    心法图标: 'https://icon.jx3box.com/icon/101355.png',
  },
}

export default 心法配置
