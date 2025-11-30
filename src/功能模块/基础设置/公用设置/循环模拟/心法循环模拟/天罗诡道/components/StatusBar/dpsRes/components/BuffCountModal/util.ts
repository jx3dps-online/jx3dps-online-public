import { 循环日志数据类型 } from '../../../../../simulator/type'

const 过滤的buff列表 = ['劲风簇追', '饮羽簇追']

export const 获取Buff覆盖率 = (日志: 循环日志数据类型[], 总战斗用时: number) => {
  // 以buff个体分类，组成数字数组代表buff持续时间段
  const Buff枚举: {
    [key: string]: number[][]
  } = {}
  const 覆盖率 = {}

  // 遍历日志塞入数组
  for (let i = 0; i < 日志.length; i++) {
    if (
      (日志[i]?.日志类型 === '目标buff变动' || 日志[i]?.日志类型 === '自身buff变动') &&
      (日志[i]?.日志?.includes('获得') || 日志[i]?.日志?.includes('失去'))
    ) {
      // 当前buff信息
      const logName = 日志[i]?.日志
      const type = logName?.includes('获得') ? 'get' : 'lose'
      const buffName = type === 'get' ? logName?.split('获得')?.[1] : logName?.split('失去')?.[1]
      const currentTime: number = 日志[i]?.日志时间 || 0
      if (buffName && !过滤的buff列表?.includes(buffName)) {
        if (type === 'get') {
          if (Buff枚举?.[buffName]) {
            // 判断当前最后一个数组的长度，如果为1代表还没结束，不处理。为2再塞入新的起始时间
            if (Buff枚举[buffName][Buff枚举[buffName].length - 1]?.length > 1) {
              Buff枚举[buffName].push([currentTime])
            }
          } else {
            Buff枚举[buffName] = [[currentTime]]
          }
        } else if (type === 'lose') {
          if (Buff枚举?.[buffName]) {
            if (Buff枚举?.[buffName]?.[Buff枚举?.[buffName]?.length - 1]) {
              Buff枚举[buffName][Buff枚举[buffName].length - 1].push(currentTime)
            }
          }
        }
      }
    }
  }

  // 循环结束，对没有结束时间的buff做补充，塞入总战斗用时作为结束时间
  // 同时，计算各buff的覆盖率
  Object.keys(Buff枚举).forEach((key) => {
    if (Buff枚举[key]?.length) {
      if (
        Buff枚举[key]?.[Buff枚举[key]?.length - 1] &&
        Buff枚举[key]?.[Buff枚举[key]?.length - 1]?.length < 2
      ) {
        Buff枚举[key][Buff枚举[key].length - 1].push(总战斗用时)
      }

      let 总持续时间 = 0
      for (let i = 0; i < Buff枚举[key].length; i++) {
        if (Buff枚举[key][i] && Buff枚举[key][i].length === 2) {
          总持续时间 = 总持续时间 + Buff枚举[key][i][1] - Buff枚举[key][i][0]
        }
      }
      覆盖率[key] = ((总持续时间 / 总战斗用时) * 100)?.toFixed(3)
    }
  })

  return {
    Buff枚举,
    覆盖率,
  }
}

export const 格式化buff覆盖数组 = (Buff枚举) => {
  const res: any[] = []
  Object.keys(Buff枚举).forEach((key) => {
    if (Buff枚举[key]?.length) {
      Buff枚举[key].forEach((range) => {
        res.push({ type: key, range: range })
      })
    }
  })
  return res
}
