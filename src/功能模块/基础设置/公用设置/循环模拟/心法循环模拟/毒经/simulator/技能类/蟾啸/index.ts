import { 获取实际帧数 } from '@/工具函数/data'
import 循环模拟技能基础数据 from '../../../constant/skill'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

class 蟾啸 extends 有CD技能通用类 {
  static 技能数据 = 循环模拟技能基础数据?.find((item) => item.技能名称 === '蟾啸')

  constructor(模拟循环) {
    super(模拟循环)
    蟾啸.技能数据 = 模拟循环?.技能基础数据?.find((item) => item.技能名称 === '蟾啸')
    this.初始化技能运行数据()
  }

  释放() {}

  命中() {
    this.模拟循环.技能类实例集合?.蟾啸DOT?.获得和刷新蟾啸DOT()
    this.触发残香()
    this.圣蝎献祭处理()
    this.触发降厄('蟾啸')
    this.触发荒息('蟾啸')
    this.处理虫魄('蟾啸')
    this.保存释放记录('蟾啸')
  }

  保存释放记录(名称) {
    this.本次释放记录 = {
      实际伤害技能: 名称,
      重要buff列表: this.获取当前重要buff列表(['引魂', '降厄', '圣蝎献祭']),
    }
  }
}

export default 蟾啸

export const 蟾啸类型 = typeof 蟾啸
