import { 按数字生成数组 } from '@/工具函数/help'
import { 自身属性系数 } from '@/数据/常量'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

const 百分比数组 = 按数字生成数组(101)

export const 会心收益下降点收益信息 = [
  {
    label: '会心收益下降点',
    list: 百分比数组.map((item) => ({
      label: `${item - 1}%`,
      value: item - 1,
    })),
    tip: (
      <div>
        <p>不改变其他属性，只重新覆盖会心值。用于快速计算会心收益曲线</p>
        <p>
          X轴： 重写后的
          <b style={{ color: 获取当前数据()?.系统配置?.主题色 }}> 不吃增益面板会心 </b>
        </p>
        <p>Y轴： 重写会心后的秒伤变化</p>
        <p>比例和结果秒伤为近似值，仅参考作为配装的属性收益趋向参考</p>
        <p style={{ color: 'red' }}>会计算一百次，电脑性能差的慎用</p>
      </div>
    ),
  },
]

export const 渲染会心收益下降点折线图 = (chart, 收益下降点, 当前比例?, 当前收益?) => {
  const { 系统配置 } = 获取当前数据()
  chart.axis('收益', false)

  chart
    .line()
    .position('比例*收益')
    .size(3)
    .color(系统配置?.收益柱形图颜色 || 系统配置?.主题色)

  if (收益下降点) {
    chart.annotation().dataMarker({
      top: true,
      position: 收益下降点,
      text: {
        content: '收益明显下降：' + 收益下降点.比例,
        style: { fill: '#FFF', fontSize: 16, fontWeight: 500 },
      },
      line: {
        length: 100,
      },
    })
  }

  chart.annotation().dataMarker({
    position: [当前比例, 当前收益],
    text: {
      content: '当前比例：' + `${当前比例}%`,
      style: { fill: '#FFF', fontSize: 16, fontWeight: 500 },
    },
    line: {
      length: 50,
    },
  })
}

export const 获取会心收益下降点图表数据 = (type, data, 装备信息, 计算增加后收益, 增益后面板) => {
  if (type === '会心收益下降点') {
    const list = data || []
    const 增益后面板会心 = 增益后面板?.会心等级 || 0
    const 当前面板 = 装备信息?.装备基础属性?.会心等级 || 0
    const 当前增益会心差值 = 增益后面板会心 - 当前面板 || 0

    const res = list.map((item) => {
      const 计算会心等级 = (item?.value / 100) * 自身属性系数.会心
      const 最终计算会心等级 = 计算会心等级 - 当前增益会心差值

      const { 秒伤: 新秒伤 } = 计算增加后收益(
        { ...装备信息?.装备基础属性, 会心等级: 最终计算会心等级 },
        true,
      )

      return {
        比例: item.label,
        收益: Number(新秒伤.toFixed(3)),
      }
    })
    return res
  } else {
    return []
  }
}
