import { Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { 登阶成长展示属性 } from './类型'
import { 获取文案 } from '../文案'
import 成长区域 from './成长区域'

// 完整成长区域默认使用共享骨架；当前心法差异都收在 进度条 注册表里。
// 后续若某个心法要整区定制（标题、布局、动效），在这里按心法名懒加载自己的实现即可。
const 心法展示: Record<string, LazyExoticComponent<ComponentType<登阶成长展示属性>>> = {}

export default function 登阶成长展示(props: 登阶成长展示属性) {
  const 文案 = 获取文案(props.心法)
  const 展示 = 心法展示[props.心法]
  return (
    <Suspense
      fallback={
        <div className='dragon-journey dragon-art-loading' aria-busy='true'>
          <div>
            <h3>{props.目标名称}</h3>
            <p>{文案['展示.加载中']}</p>
          </div>
        </div>
      }
    >
      {展示 ? <展示 {...props} /> : <成长区域 {...props} />}
    </Suspense>
  )
}
