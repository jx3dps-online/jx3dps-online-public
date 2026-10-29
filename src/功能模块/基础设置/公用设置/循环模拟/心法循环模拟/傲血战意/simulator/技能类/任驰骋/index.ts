import { 获取实际帧数 } from '@/工具函数/data'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 任驰骋 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '任驰骋')
  static 原始读条时间 = 12
  static 读条时间 = 12

  constructor(模拟循环) {
    super(模拟循环)
    任驰骋.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '任驰骋')
    const 循环加速值 = this.模拟循环.加速值
    // 始终按原始读条时间计算，避免在已加速的静态值上反复加速
    任驰骋.读条时间 = 获取实际帧数(任驰骋.原始读条时间, 循环加速值)
    this.初始化技能运行数据()
  }

  释放后() {
    // this.模拟循环.GCD组['公共'] = Math.max(this.模拟循环.GCD组?.['公共'] || 0, 任驰骋.读条时间)
    // this.模拟循环.GCD组['下马'] = (this.模拟循环.GCD组?.['下马'] || 0) + 任驰骋.读条时间
    // this.模拟循环.GCD组['撼如雷'] = (this.模拟循环.GCD组?.['撼如雷'] || 0) + 任驰骋.读条时间
  }

  命中() {
    this.模拟循环.技能类实例集合.梅花枪法.延后读条期间普攻(this.模拟循环.当前时间 + 任驰骋.读条时间)
    let buff名称 = '驰骋·1'
    if (this.模拟循环.校验奇穴是否存在('驰骋')) {
      buff名称 = '驰骋·2'
    }
    this.模拟循环.添加buff?.({
      名称: buff名称,
      对象: '自身',
      新增层数: 1,
      事件时间: this.模拟循环.当前时间 + 任驰骋.读条时间,
    })
    this.模拟循环.角色状态信息.体态 = '骑乘'

    this.模拟循环.技能类实例集合?.断魂刺?.重置调息时间?.()

    this.获得龙驭判定(6)

    this.保存释放记录()
  }

  保存释放记录() {
    let buff名称 = '驰骋·1'
    if (this.模拟循环.校验奇穴是否存在('驰骋')) {
      buff名称 = '驰骋·2'
    }
    const 造成buff数据 = this.获取施加重要buff信息(buff名称)
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 任驰骋

export const 任驰骋类型 = typeof 任驰骋
