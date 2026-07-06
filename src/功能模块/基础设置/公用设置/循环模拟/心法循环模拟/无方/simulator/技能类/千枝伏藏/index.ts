import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 千枝伏藏 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '千枝伏藏')
  static 本次释放前内力 = 0

  constructor(模拟循环) {
    super(模拟循环)
  }

  释放() {
    this.获得千枝伏藏()
    this.模拟循环.卸除buff({ 名称: '千枝绽蕊', 对象: '自身' })
    千枝伏藏.本次释放前内力 = Math.floor(this.模拟循环.角色状态信息?.内力 || 0)
    this.保存释放记录()
    return
  }

  保存释放记录() {
    this.本次释放记录 = {
      底部标识: 千枝伏藏.本次释放前内力,
    }
  }

  获得千枝伏藏() {
    this.模拟循环.添加buff?.({ 名称: '千枝伏藏', 对象: '自身' })
  }

  千枝伏藏状态校验() {
    return !!this?.模拟循环?.当前自身buff列表?.['千枝伏藏']?.当前层数
  }
}

export default 千枝伏藏

export const 千枝伏藏类型 = typeof 千枝伏藏
