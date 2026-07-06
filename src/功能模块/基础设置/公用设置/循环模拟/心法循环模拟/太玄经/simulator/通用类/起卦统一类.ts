import 有CD技能通用类 from './有CD技能通用类'

class 起卦统一类 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)
  }

  延迟起卦(卦象) {
    this.模拟循环.添加待生效事件队列([
      {
        事件名称: `起卦`,
        事件时间: this.模拟循环.当前时间 + 40, // 固定40帧定时器
        事件备注: {
          卦象名称: 卦象,
        },
      },
    ])
  }

  解卦(卦象) {
    if (!卦象) {
      return
    }
    this.卦象清除()
    this.模拟循环.添加buff({ 名称: this.获取卦象映射(卦象), 对象: '自身' })
    this.模拟循环.添加buff({ 名称: '祝由释放允许', 对象: '自身' })
    if (this.模拟循环.校验奇穴是否存在('荧入白')) {
      this.模拟循环.添加buff({ 名称: '荧入白', 对象: '自身' })
    }
    if (卦象 === '山') {
      this.化卦坠符触发判定()
    }
  }

  保存释放记录() {
    const 造成buff数据 = this.获取施加重要buff信息('荧入白')
    this.本次释放记录 = 造成buff数据 ? { 造成buff数据 } : {}
  }
}

export default 起卦统一类

export const 起卦类型 = typeof 起卦统一类
