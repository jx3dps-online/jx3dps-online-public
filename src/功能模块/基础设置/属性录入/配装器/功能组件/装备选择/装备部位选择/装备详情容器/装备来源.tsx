import { 装备属性信息模型, 装备特效枚举 } from '@/@types/装备'
import styles from './index.module.less'
import { memo, useMemo } from 'react'
import 装备来源映射 from '@/数据/常量/装备来源映射.json'
import { 试炼装备名称匹配 } from '@/数据/常量/装备常量'
import { Tag } from 'antd'

interface 装备来源类型 {
  装备数据: 装备属性信息模型
}

const 装备来源: React.FC<装备来源类型> = (props) => {
  const { 装备数据 } = props
  const 来源数据 = useMemo(() => {
    const key = `${装备数据?.id}_${装备数据?.装备品级}`
    if (装备数据?.装备特效 === 装备特效枚举.大橙武特效) {
      return [{ 来源类型: '稀世神兵', 来源描述: '玄晶' }]
    } else if (试炼装备名称匹配.test(装备数据.装备名称)) {
      return [{ 来源类型: '试炼', 来源描述: '试炼之地' }]
    } else if (装备数据?.装备名称?.includes('寻踪觅宝')) {
      return [{ 来源类型: '挖宝', 来源描述: '寻踪觅宝' }]
    }
    return 装备来源映射[key]
  }, [装备数据, 装备来源映射])

  return (
    <div className={styles.source}>
      <h1 className={styles.title}>来源</h1>
      <div className={styles.sourceContent}>
        {来源数据?.length ? (
          来源数据?.map((item, index) => {
            return (
              <div key={index} className={styles.sourceItem}>
                <div className={styles.sourceItemTitle}>
                  {item.来源类型 === '副本' ? '副本掉落' : item.来源类型}
                </div>
                <div className={styles.sourceItemContent}>
                  {item?.来源类型 === '副本' ? (
                    <div className={styles.mapSource}>
                      {item.来源描述?.map((a, i) => {
                        return (
                          <div key={`${index}_source_${i}`} className={styles.mapSourceItem}>
                            <h2 className={styles.mapSourceTitle}>{a?.掉落地图}</h2>
                            <div className={styles.normalSource}>
                              {a.掉落描述
                                ?.split(',')
                                ?.filter((a) => a)
                                ?.map((a) => {
                                  return (
                                    <Tag className={styles.sourceTag} key={`${a.掉落描述}_${a}`}>
                                      {a}
                                    </Tag>
                                  )
                                })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className={styles.normalSource}>
                      {item.来源描述
                        ?.split(',')
                        ?.filter((a) => a)
                        ?.map((a) => {
                          return (
                            <Tag className={styles.sourceTag} key={`${item.来源描述}_${a}`}>
                              {a}
                            </Tag>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <p className={styles.noData}>该物品无法获取来源</p>
        )}
      </div>
    </div>
  )
}

export default memo(装备来源)
