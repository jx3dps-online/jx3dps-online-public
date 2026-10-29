// 根据加速、延迟获取当前用于计算的循环
// import { 获取全部循环 } from '@/数据/计算循环'
import { 增益选项数据类型 } from '@/@types/团队增益'
import { 循环数据, 循环详情 } from '@/@types/循环'
import { 装备信息数据类型 } from '@/@types/装备'
import { useAppSelector } from '@/hooks'
import { 获取加速等级, 计算增益数据中加速值 } from '@/工具函数/data'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

interface UseCycleProps {
  使用内存数据?: boolean
  覆盖数据?: Partial<计算循环依赖数据>
}

interface 计算循环依赖数据 {
  装备信息: 装备信息数据类型
  增益数据: 增益选项数据类型
  增益启用: boolean
  网络延迟: number
  当前计算循环名称: string
  自定义循环列表: 循环数据[]
}

function useCycle(props?: UseCycleProps): 获取计算循环结果 {
  // 注意：useCycle 会被非 React 环境（store 初始化/加载角色时）调用，
  // 因此这里不能用 hook 取心法数据，改用运行时读取当前心法数据。
  const { 计算循环 } = 获取当前数据()
  const { 覆盖数据, 使用内存数据 = true } = props || { 使用内存数据: true, 覆盖数据: {} }
  let 计算数据: 计算循环依赖数据 = 使用内存数据
    ? {
        装备信息: useAppSelector((state) => state?.data?.装备信息),
        增益数据: useAppSelector((state) => state?.data?.增益数据),
        增益启用: useAppSelector((state) => state?.data?.增益启用),
        网络延迟: useAppSelector((state) => state?.data?.网络延迟),
        当前计算循环名称: useAppSelector((state) => state?.data?.当前计算循环名称),
        自定义循环列表: useAppSelector((state) => state?.data?.自定义循环列表),
      }
    : {
        装备信息: {} as any,
        增益数据: { 阵眼: '', 小吃: [], 团队增益: [] },
        增益启用: false,
        网络延迟: 0,
        当前计算循环名称: '',
        自定义循环列表: [],
      }

  if (覆盖数据) {
    计算数据 = { ...计算数据, ...覆盖数据 }
  }

  const 人物属性加速值 = 计算数据?.装备信息?.装备基础属性?.加速等级 || 0
  const 增益加速值 = 计算数据?.增益启用 ? 计算增益数据中加速值(计算数据?.增益数据) : 0
  const 最终加速值 = 人物属性加速值 + 增益加速值
  const 加速等级 = 获取加速等级(最终加速值)

  const 全部循环 = [...(计算循环 || []), ...(计算数据?.自定义循环列表 || [])]

  // 先匹配符合名称的循环
  const 匹配名字的循环 =
    全部循环?.find((item) => item?.名称 === 计算数据?.当前计算循环名称) || 全部循环?.[0]

  // 根据加速、延迟找到勇于计算的循环数据
  // 优先找加速和延迟都匹配的数据
  let 该循环用于计算的循环详情 = 匹配名字的循环?.循环详情?.find((item) => {
    const 延迟是否匹配 =
      item?.循环延迟要求 !== undefined
        ? item?.循环延迟要求?.toString() === 计算数据?.网络延迟?.toString()
        : true
    if (item?.循环加速值范围?.length) {
      return (
        +item?.循环加速值范围?.[0] <= +最终加速值 &&
        +item?.循环加速值范围?.[1] > +最终加速值 &&
        延迟是否匹配
      )
    } else {
      return item?.循环加速等级?.toString() === 加速等级?.toString() && 延迟是否匹配
    }
  })

  // 没有找到匹配加速和延迟的循环，就只匹配加速
  if (!该循环用于计算的循环详情 && !匹配名字的循环?.强制加速要求) {
    该循环用于计算的循环详情 = 匹配名字的循环?.循环详情?.find((item) => {
      if (item?.循环加速值范围?.length) {
        return +item?.循环加速值范围?.[0] <= +最终加速值 && +item?.循环加速值范围?.[1] > +最终加速值
      } else {
        return item?.循环加速等级?.toString() === 加速等级?.toString()
      }
    })
  }

  // 还是没匹配到加速的循环，那就取第一个循环
  if (!该循环用于计算的循环详情 && !匹配名字的循环?.强制加速要求) {
    该循环用于计算的循环详情 = 匹配名字的循环?.循环详情?.[0]
  }

  // 加速也没有匹配到说明没有可以用于计算的循环，不返回

  return {
    全部循环: 全部循环,
    当前循环信息: 匹配名字的循环,
    计算循环详情: 该循环用于计算的循环详情 || undefined,
  }
}

export default useCycle

interface 获取计算循环结果 {
  全部循环: 循环数据[]
  当前循环信息: 循环数据
  计算循环详情: 循环详情 | undefined
}
