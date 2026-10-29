import { 心法配置类型 } from '@/心法模块/interface'
import { 装备属性信息模型 } from '@/@types/装备'

export const 获取当前心法对应的装备数据 = async (功法, 心法数据: 心法配置类型) => {
  const 实际功法 = 功法 === '内功' || 功法 === '天罗诡道' ? '内功' : '外功'
  const { default: 该功法数据 } =
    实际功法 === '内功' ? await import('./内功') : await import('./外功')

  const 结果数据 = {}

  Object.keys(该功法数据).forEach((部位) => {
    const 该部位装备数据 = (该功法数据?.[部位] || []).filter((装备: 装备属性信息模型) => {
      if (装备?.所属门派 === 心法数据?.所属门派) {
        return true
      }
      if (装备?.所属门派 !== '通用' && 装备?.所属门派 !== 心法数据?.所属门派) {
        return false
      }
      if (装备?.装备主属性 !== '通用' && 装备?.装备主属性 !== 心法数据?.主属性) {
        return false
      }
      return true
    })
    //模拟下赛季装备代码
    // 该部位装备数据 = 模拟下赛季装备代码(该部位装备数据)

    结果数据[部位] = 该部位装备数据
  })

  return 结果数据
}

export const 根据id获取装备数据 = (装备数据, 部位, id) => {
  const 该部位列表 = 装备数据?.[部位] || []
  const 找到装备 = 该部位列表.find((item) => +item?.id === +id)
  if (找到装备?.重复装备id) {
    return 该部位列表.find((item) => +item?.id === +找到装备.重复装备id) || 找到装备
  }
  return 找到装备
}
