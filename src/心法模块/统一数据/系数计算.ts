// 属性系数.破招

export const 获取全局伤害因子 = (系数) => {
  return ((Math.floor(系数) + (系数 < 0 ? 1 : 0)) / 1024 + 1024) / 1024
}

export const 获取破招实际系数 = (系数) => {
  return 获取全局伤害因子(系数) * 8.534
}

export const 从Generator获取破招实际系数 = (系数: number) => {
  return 系数 * 8.534
}
