import type { 循环技能详情 } from '@/@types/循环'

interface 模拟模块 {
  default: (参数: any) => any
}
interface 日志模块 {
  getDpsCycle: (日志: any[], 时间?: number, 橙武?: boolean) => 循环技能详情[]
}

export const 模拟器加载表: Record<string, () => Promise<[模拟模块, 日志模块]>> = {
  傲血战意: () =>
    Promise.all([import('../../../傲血战意/simulator'), import('../../../傲血战意/utils')]),
  冰心诀: () => Promise.all([import('../../../冰心诀/simulator'), import('../../../冰心诀/utils')]),
  凌海诀: () => Promise.all([import('../../../凌海诀/simulator'), import('../../../凌海诀/utils')]),
  分山劲: () => Promise.all([import('../../../分山劲/simulator'), import('../../../分山劲/utils')]),
  分山劲_悟: () =>
    Promise.all([import('../../../分山劲_悟/simulator'), import('../../../分山劲_悟/utils')]),
  北傲诀: () => Promise.all([import('../../../北傲诀/simulator'), import('../../../北傲诀/utils')]),
  周天功: () => Promise.all([import('../../../周天功/simulator'), import('../../../周天功/utils')]),
  周天功_悟: () =>
    Promise.all([import('../../../周天功_悟/simulator'), import('../../../周天功_悟/utils')]),
  天罗诡道: () =>
    Promise.all([import('../../../天罗诡道/simulator'), import('../../../天罗诡道/utils')]),
  太玄经: () => Promise.all([import('../../../太玄经/simulator'), import('../../../太玄经/utils')]),
  太玄经_悟: () =>
    Promise.all([import('../../../太玄经_悟/simulator'), import('../../../太玄经_悟/utils')]),
  孤锋诀: () => Promise.all([import('../../../孤锋诀/simulator'), import('../../../孤锋诀/utils')]),
  孤锋诀_悟: () =>
    Promise.all([import('../../../孤锋诀_悟/simulator'), import('../../../孤锋诀_悟/utils')]),
  山海心诀: () =>
    Promise.all([import('../../../山海心诀/simulator'), import('../../../山海心诀/utils')]),
  幽罗引: () => Promise.all([import('../../../幽罗引/simulator'), import('../../../幽罗引/utils')]),
  无方: () => Promise.all([import('../../../无方/simulator'), import('../../../无方/utils')]),
  无方_悟: () =>
    Promise.all([import('../../../无方_悟/simulator'), import('../../../无方_悟/utils')]),
  易筋经: () => Promise.all([import('../../../易筋经/simulator'), import('../../../易筋经/utils')]),
  毒经: () => Promise.all([import('../../../毒经/simulator'), import('../../../毒经/utils')]),
  焚影圣诀: () =>
    Promise.all([import('../../../焚影圣诀/simulator'), import('../../../焚影圣诀/utils')]),
  笑尘诀: () => Promise.all([import('../../../笑尘诀/simulator'), import('../../../笑尘诀/utils')]),
  紫霞功: () => Promise.all([import('../../../紫霞功/simulator'), import('../../../紫霞功/utils')]),
  花间游: () => Promise.all([import('../../../花间游/simulator'), import('../../../花间游/utils')]),
}
