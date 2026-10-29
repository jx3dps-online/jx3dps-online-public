import { lazy, Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { 登阶进度属性 } from './类型'

// 注册进度条实现；默认值与孤锋诀共用同一懒加载实例，不重复加载。
const 孤锋诀 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-gfj" */ './孤锋诀'))
const 太玄经 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-txj" */ './太玄经'))
const 分山劲 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-fsj" */ './分山劲'))
const 焚影圣诀 = lazy(
  () => import(/* webpackChunkName: "dragon-stair-progress-fysj" */ './焚影圣诀'),
)
const 紫霞功 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-zxg" */ './紫霞功'))
const 冰心诀 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-bxj" */ './冰心诀'))
const 无方 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-wf" */ './无方'))
const 天罗诡道 = lazy(
  () => import(/* webpackChunkName: "dragon-stair-progress-tlgd" */ './天罗诡道'),
)
const 笑尘诀 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-xcj" */ './笑尘诀'))
const 北傲诀 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-baj" */ './北傲诀'))
const 傲血战意 = lazy(
  () => import(/* webpackChunkName: "dragon-stair-progress-axzy" */ './傲血战意'),
)
const 易筋经 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-yjj" */ './易筋经'))
const 周天功 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-ztg" */ './周天功'))
const 花间游 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-hjy" */ './花间游'))
const 凌海诀 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-lhj" */ './凌海诀'))
const 山海心诀 = lazy(
  () => import(/* webpackChunkName: "dragon-stair-progress-shxj" */ './山海心诀'),
)
const 幽罗引 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-yly" */ './幽罗引'))
const 毒经 = lazy(() => import(/* webpackChunkName: "dragon-stair-progress-dj" */ './毒经'))
const 进度条: Record<string, LazyExoticComponent<ComponentType<登阶进度属性>>> = {
  孤锋诀,
  太玄经,
  分山劲,
  焚影圣诀,
  紫霞功,
  冰心诀,
  无方,
  无方_悟: 无方,
  天罗诡道,
  笑尘诀,
  周天功,
  花间游,
  凌海诀,
  山海心诀,
  幽罗引,
  毒经,
  北傲诀,
  傲血战意,
  易筋经,
  // 分山劲_悟 与分山劲共用同一懒加载实例
  分山劲_悟: 分山劲,
  孤锋诀_悟: 孤锋诀,
}

export default function 登阶进度条(props: 登阶进度属性 & { 心法?: string }) {
  const { 心法, ...进度属性 } = props
  const 展示 = (心法 && 进度条[心法]) || 孤锋诀
  return (
    <Suspense fallback={<div className='dragon-blade dragon-art-loading' aria-busy='true' />}>
      <展示 {...进度属性} />
    </Suspense>
  )
}
