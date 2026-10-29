import 通用DOT类 from '../../通用类/通用DOT类'
import type 循环主类 from '../../main'
import type { DOT待生效数据类型 } from '../../type'
import { 获取实际帧数 } from '@/工具函数/data'
import { 初始化起手DOT } from '../../../../通用/通用函数/初始化起手DOT'

class 灼烧 extends 通用DOT类 {
  constructor(模拟循环: 循环主类) {
    super(模拟循环)
  }

  初始化起手灼烧(配置: { 获得时间?: number; 层数?: number }) {
    初始化起手DOT(
      {
        获得时间: 配置.获得时间 || 0,
        当前层数: 1,
        DOT数据: this.获取当前DOT数据('灼烧'),
        快照buff列表: this.获取当前快照buff(),
      },
      this,
    )
  }

  获得灼烧() {
    this.更新待生效数据(1, this.获取当前DOT数据('灼烧'))
  }

  结算灼烧伤害() {
    const 结算数组 = this.结算并更新运行数据()
    结算数组.forEach((数据, 索引) => this.造成灼烧伤害(数据, 索引 === 结算数组.length - 1))
  }

  造成灼烧伤害(数据: DOT待生效数据类型, 最后一跳: boolean) {
    const 伤害名称 = this.模拟循环.校验奇穴是否存在('雨龙') ? '灼烧(DOT)·雨龙' : '灼烧(DOT)'
    this.触发伤害行为(伤害名称, 1, 数据.快照buff列表, 数据.生效时间, true)
    if (this.模拟循环.当前目标buff列表.落水打狗) {
      this.触发伤害行为('醉影·一', 1, [], 数据.生效时间, false, 3)
      this.模拟循环.卸除buff({ 名称: '落水打狗' })
    }
    if (最后一跳 && !this.DOT运行数据.待生效数据.length)
      this.模拟循环.添加战斗日志({
        日志: '目标失去灼烧',
        日志类型: '目标buff变动',
        日志时间: 数据.生效时间,
      })
  }

  提前结算灼烧() {
    const 结算数组 = this.DOT运行数据.待生效数据.slice(0, 2)
    const 剩余数据 = this.DOT运行数据.待生效数据.slice(2)
    if (结算数组.length) {
      this.模拟循环.添加战斗日志({
        日志: `狂龙乱舞提前结算${结算数组.length}跳灼烧，剩余${剩余数据.length}跳`,
        日志类型: '技能释放结果',
      })
    }
    const DOT数据 = this.获取当前DOT数据('灼烧')
    const 间隔 = 获取实际帧数(DOT数据.伤害频率, this.模拟循环.加速值)
    this.更新DOT运行数据({
      待生效数据: 剩余数据.map((数据, 索引) => ({
        ...数据,
        生效时间: this.模拟循环.当前时间 + (索引 + 1) * 间隔,
      })),
    })
    结算数组.forEach((数据, 索引) =>
      this.造成灼烧伤害(
        { ...数据, 生效时间: this.模拟循环.当前时间 },
        索引 === 结算数组.length - 1,
      ),
    )
    this.模拟循环.删除待生效事件队列('灼烧生效')
    this.模拟循环.添加待生效事件队列(
      this.DOT运行数据.待生效数据.map((数据) => ({
        事件名称: '灼烧生效',
        事件时间: 数据.生效时间,
      })),
    )
  }
}

export default 灼烧
