import { 每秒郭氏帧 } from '@/数据/常量'
import { 待生效事件 } from '../../type'
import 技能统一类 from '../../通用类/技能统一类'

class 沁逸 extends 技能统一类 {
  // scripts/skill/万花/沁逸机甲攻击.lua
  // scripts/skill/万花/沁逸机甲npc攻击技能.lua
  // scripts/skill/万花/沁逸机甲快雪时晴伤害.lua

  constructor(模拟循环) {
    super(模拟循环)
  }

  // 快雪时晴读条开始时召唤机甲，每0.5秒造成一次伤害，持续3秒
  // 不吃加速：固定8帧间隔；不快照：每次攻击按当前自身buff结算
  沁逸初始化(召唤时间) {
    const 待生效事件队列: 待生效事件[] = []
    for (let i = 1; i <= 6; i++) {
      待生效事件队列.push({
        事件名称: '沁逸判定',
        事件时间: 召唤时间 + (每秒郭氏帧 / 2) * i,
      })
    }
    this.模拟循环.添加待生效事件队列(待生效事件队列)
  }

  沁逸命中() {
    this?.触发伤害行为('沁逸')
  }
}

export default 沁逸

export const 沁逸类型 = typeof 沁逸
