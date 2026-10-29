import React, { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { 装备信息数据类型 } from '@/@types/装备'
import { 角色基础属性类型 } from '@/@types/角色'
import ExportContext from '../context'
import 图标区 from '../图标区'
import 版本区 from '../版本区'
import 标题区 from '../标题区'
import 属性区 from '../属性区'
import 奇穴区 from '../奇穴区'
import 装备区 from '../装备区'
import 二维码区 from '../二维码区'
import { 获取配装背景图片 } from '../util'
import styles from './index.module.less'

const 秒伤区 = lazy(() => import('../秒伤区'))

export interface 配装页面入参 {
  方案名称?: string
  方案备注?: string
  方案创建人?: string
  /** 已计算好的角色面板展示数据（属性区/图标区使用） */
  显示数据?: Partial<角色基础属性类型>
  /** 配装原始数据（装备区使用） */
  当前装备信息?: 装备信息数据类型
  /** 是否渲染左下角秒伤区，配装器内展示、攻略内默认不展示 */
  是否展示伤害?: boolean
  更换装备后秒伤?: number
  自定义二维码链接?: string
  自定义二维码标题?: string
  获取表单信息?: () => void
  /** 缩放比例，默认 1（1120x630） */
  缩放?: number
  /** 是否按容器宽度自适应缩放（覆盖 缩放），用于大屏弹窗内随宽度变化 */
  自适应宽度?: boolean
  /** 背景图片地址，缺省按当前门派获取 */
  背景图片?: string
  /** 截图锚点 id，仅配装导出截图时使用 */
  id?: string
}

function 配装页面(props: 配装页面入参) {
  const {
    方案名称,
    方案备注,
    方案创建人,
    显示数据 = {},
    当前装备信息,
    是否展示伤害 = false,
    更换装备后秒伤,
    自定义二维码链接,
    自定义二维码标题,
    获取表单信息,
    缩放 = 1,
    自适应宽度 = false,
    背景图片,
    id,
  } = props

  const 容器Ref = useRef<HTMLDivElement>(null)
  const [实际缩放, 设置实际缩放] = useState(缩放)

  useLayoutEffect(() => {
    if (!自适应宽度) {
      设置实际缩放(缩放)
      return
    }
    const 容器 = 容器Ref.current
    if (!容器) return
    const 更新缩放 = () => 设置实际缩放(容器.clientWidth / 1120)
    更新缩放()
    const 观察器 = new ResizeObserver(更新缩放)
    观察器.observe(容器)
    return () => 观察器.disconnect()
  }, [自适应宽度, 缩放])

  const 当前缩放 = 自适应宽度 ? 实际缩放 : 缩放
  const 实际背景图片 = 背景图片 || 获取配装背景图片()

  return (
    <ExportContext.Provider
      value={{
        方案名称,
        设置方案名称: () => {},
        方案备注,
        设置方案备注: () => {},
        方案创建人,
        设置方案创建人: () => {},
        是否展示伤害,
        设置是否展示伤害: () => {},
        显示数据,
        当前装备信息: 当前装备信息 || ({} as 装备信息数据类型),
        更换装备后秒伤: 更换装备后秒伤 || 0,
        自定义二维码链接,
        设置自定义二维码链接: () => {},
        自定义二维码标题,
        设置自定义二维码标题: () => {},
        获取表单信息: 获取表单信息 || (() => {}),
      }}
    >
      <div
        ref={容器Ref}
        className={styles.wrap}
        style={{
          width: 自适应宽度 ? '100%' : 1120 * 当前缩放,
          height: 630 * 当前缩放,
        }}
      >
        <div
          className={styles.page}
          id={id}
          style={{ backgroundImage: `url(${实际背景图片})`, transform: `scale(${当前缩放})` }}
        >
          <图标区 />
          <版本区 />
          <标题区 />
          <属性区 />
          <奇穴区 />
          {是否展示伤害 ? (
            <Suspense fallback={null}>
              <秒伤区 />
            </Suspense>
          ) : null}
          <装备区 />
          <二维码区 />
        </div>
      </div>
    </ExportContext.Provider>
  )
}

export default 配装页面
