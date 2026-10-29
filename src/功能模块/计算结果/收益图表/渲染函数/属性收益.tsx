import 获取当前数据 from '@/数据/数据工具/获取当前数据'

export const 附魔单点收益信息 = [
  {
    label: '附魔',
    tip: (
      <div>
        <p>X轴：在现有装备基础上额外增加本赛季紫色附魔属性的对应属性</p>
        <p>会效暂无附魔，按会心的附魔数值计算</p>
        <p>Y轴：增加对应属性后秒伤和原装备秒伤的差值</p>
        <p>收益部分采用【郭氏计算】仅供参考</p>
        <p>按收益高低从左到右排序</p>
      </div>
    ),
  },
  {
    label: '单点',
    tip: (
      <div>
        <p>X轴：在现有装备基础上额外增加1点对应属性</p>
        <p>Y轴：增加对应属性后秒伤和原装备秒伤的差值</p>
        <p>由于【郭氏计算】增益不线性</p>
        <p>收益部分采用【非郭氏计算】仅供参考</p>
        <p>按收益高低从左到右排序</p>
      </div>
    ),
  },
]

export const 渲染属性收益柱状图 = (chart) => {
  const { 系统配置 } = 获取当前数据()
  chart.axis('收益', {
    grid: {
      line: {
        style: {
          opacity: 0.3,
        },
      },
    },
    label: {
      style: {
        textAlign: 'center', // 文本对齐方向，可取值为： start middle end
        fill: '#ffffff', // 文本的颜色
        fontSize: 12, // 文本大小
      },
      offset: 16,
    },
  })
  chart.axis('key', {
    label: {
      style: {
        textAlign: 'center', // 文本对齐方向，可取值为： start middle end
        fill: '#ffffff', // 文本的颜色
        fontSize: 16, // 文本大小
      },
    },
  })
  chart
    .interval()
    .position('key*收益')
    .color(系统配置?.收益柱形图颜色 || 系统配置?.主题色)
    .label('收益', {
      offset: 16,
      style: {
        fill: '#ffffff',
        fontSize: 16,
      },
    })
}

export const 获取属性收益柱状图数据 = (
  data,
  旧秒伤,
  装备信息,
  收益增益属性计算,
  计算增加后收益,
  是否郭氏计算,
) => {
  const list = data

  const sortList = list.map((item) => {
    const 增益后装备基础数据 = 收益增益属性计算(item?.收益, item?.值, 装备信息?.装备基础属性)
    const { 秒伤: 新秒伤 } = 计算增加后收益(增益后装备基础数据, 是否郭氏计算)
    const 收益 = Number(新秒伤 - 旧秒伤)
    // const 收益结果 = 增益面板显示状态 ? Number(收益.toFixed(3)) : Number(收益.toFixed(1))
    const 收益结果 = Number(收益.toFixed(1))
    return {
      // key: `${item.收益}${item?.值 !== 1 ? item?.值 : ''}`,
      key: `${item.收益}`,
      收益: 收益结果,
    }
  })
  sortList.sort((a, b) => b.收益 - a.收益)
  return sortList
}
