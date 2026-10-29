import React, { CSSProperties } from 'react'
import 阵眼数据 from '@/数据/阵眼'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import styles from './index.module.less'

const 阵眼心法映射: Record<string, string> = {
  刀宗阵: '孤锋诀',
  鲸鱼阵: '惊羽诀',
  天策阵: '傲血战意',
  霸刀阵: '北傲诀',
  剑纯阵: '太虚剑意',
  藏剑阵: '问水诀',
  凌雪阵: '傲血战意',
  苍云阵: '分山劲',
  蓬莱阵: '凌海诀',
  丐帮阵: '笑尘诀',
  天罗阵: '天罗诡道',
  无相阵: '易筋经',
  段氏阵: '周天功',
  冰心阵: '冰心诀',
  花间阵: '花间游',
  莫问阵: '莫问',
  易筋阵: '易筋经',
  气纯阵: '紫霞功',
  毒经阵: '毒经',
  焚影阵: '焚影圣诀',
  衍天阵: '太玄经',
  无方阵: '无方',
  万灵阵: '山海心诀',
}

const 兜底颜色 = '#7a7a7a'

const 心法主题色数据 = 心法数据 as Record<string, { 系统配置?: { 主题色?: string } }>

const 阵眼图标映射 = Object.values(阵眼数据)
  .flat()
  .reduce<Record<string, string>>((映射, 阵眼) => {
    if (!阵眼.图标) return 映射
    映射[阵眼.阵眼名称] = 阵眼.图标
    if (阵眼.阵眼标题) 映射[阵眼.阵眼标题] = 阵眼.图标
    return 映射
  }, {})

interface 阵眼类型 {
  /** 按梯队传入阵眼名称，外层数组顺序即推荐顺序 */
  配置: string[][]
  /** 按阵眼名称覆盖颜色；可写完整名称或括号前的基础名称 */
  颜色?: Record<string, string>
  /** 梯队之间的分隔符；传数组时按间隙依次使用，缺省为 `>` */
  层级分隔符?: string | string[]
  /** 是否在阵眼前显示图标，默认开启 */
  显示图标?: boolean
}

function 获取基础名称(名称: string) {
  return 名称.replace(/[（(].*$/, '').trim()
}

function 获取主题色(基础名称: string) {
  const 心法名 = 阵眼心法映射[基础名称]
  if (!心法名) return 兜底颜色
  return 心法主题色数据[心法名]?.系统配置?.主题色 || 兜底颜色
}

function 获取颜色(名称: string, 颜色?: Record<string, string>) {
  const 基础名称 = 获取基础名称(名称)
  return 颜色?.[名称] || 颜色?.[基础名称] || 获取主题色(基础名称)
}

function 获取图标(名称: string) {
  return 阵眼图标映射[名称] || 阵眼图标映射[获取基础名称(名称)]
}

function 阵眼(props: 阵眼类型) {
  const { 配置, 颜色, 层级分隔符 = '>', 显示图标 = true } = props

  const 获取层级分隔符 = (梯队索引: number) => {
    if (!Array.isArray(层级分隔符)) return 层级分隔符
    return 层级分隔符[梯队索引 - 1] ?? 层级分隔符[层级分隔符.length - 1] ?? '>'
  }

  return (
    <span className={styles['guide-formation']}>
      {配置.map((梯队, 梯队索引) => (
        <React.Fragment key={梯队索引}>
          {梯队索引 > 0 ? (
            <span
              className={`${styles['guide-formation-separator']} ${styles['guide-formation-tier-separator']}`}
            >
              {获取层级分隔符(梯队索引)}
            </span>
          ) : null}
          {梯队.map((名称, 名称索引) => {
            const 图标 = 显示图标 ? 获取图标(名称) : undefined
            return (
              <React.Fragment key={`${梯队索引}-${名称索引}`}>
                {名称索引 > 0 ? (
                  <span className={styles['guide-formation-separator']}>≈</span>
                ) : null}
                <span
                  className={styles['guide-formation-item']}
                  style={{ '--guide-formation-color': 获取颜色(名称, 颜色) } as CSSProperties}
                >
                  {图标 ? (
                    <img className={styles['guide-formation-icon']} src={图标} alt='' />
                  ) : null}
                  {名称}
                </span>
              </React.Fragment>
            )
          })}
        </React.Fragment>
      ))}
    </span>
  )
}

export default 阵眼
