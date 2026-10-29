import { ERROR_ACTION } from '../../utils'
import 有CD技能通用类 from '../../通用类/有CD技能通用类'

// 闪刀·悟·贰式：命中添加[流血]，降低阵云结晦·悟调息1秒
class 闪刀悟贰式 extends 有CD技能通用类 {
  constructor(模拟循环) {
    super(模拟循环)

    this.初始化技能运行数据()
  }

  释放() {
    const 有标记 = this.模拟循环.当前自身buff列表?.['闪刀贰式标记']?.当前层数
    if (!有标记) {
      return {
        可以释放: false,
        异常信息: ERROR_ACTION.BUFF错误,
      }
    }
    return { 可以释放: true }
  }

  命中() {
    // 刀系招式命中消耗1层[血怒·悟]（碎甲·悟下不消耗）
    this.消耗血怒一层()
    // 消耗贰式标记
    this.模拟循环.卸除buff?.({ 名称: '闪刀贰式标记', 对象: '自身', 卸除层数: 1 })
    // 命中添加[流血]
    this.模拟循环.技能类实例集合?.流血?.获得和刷新流血?.()
    // 降低阵云结晦·悟调息1秒
    this.尝试橙武降低阵云调息(16)
  }

  造成伤害() {
    this.触发伤害行为('闪刀·悟·贰式', 1, this.获取橙武额外增伤(true))
  }

  释放后() {
    this.保存释放记录()
  }

  保存释放记录() {
    this.本次释放记录 = {
      重要buff列表: this.获取当前重要buff列表(['血怒·悟', '擎刀']),
    }
  }
}

export default 闪刀悟贰式
export const 闪刀悟贰式类型 = typeof 闪刀悟贰式
