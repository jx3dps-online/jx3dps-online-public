import { 循环技能详情, 循环数据, 循环详情 } from '@/@types/循环'
import { useAppDispatch } from '@/hooks'
import { useEffect, useState } from 'react'
import { 秒伤计算 } from '@/计算模块/计算函数'
import styles from './index.module.less'
import { 根据循环判断快照计算列表 } from '@/计算模块/统一工具函数/增益计算函数'

interface 校验结果类型 {
  计算循环详情: 循环详情 | undefined
  当前循环信息: 循环数据 | undefined
}

const 校验结果: React.FC<校验结果类型> = (props) => {
  const { 计算循环详情, 当前循环信息 } = props
  const [展示结果数据, 设置展示结果数据] = useState<循环技能详情[]>([])
  const [展开技能, 设置展开技能] = useState<string | undefined>(undefined)
  const [全局异常增益, 设置全局异常增益] = useState<string[]>([])

  useEffect(() => {
    获取当前计算结果()
  }, [计算循环详情, 当前循环信息])
  const dispatch = useAppDispatch()

  const 获取当前计算结果 = () => {
    let 全局异常增益列表: string[] = []
    const 快照计算 = 根据循环判断快照计算列表(计算循环详情?.技能详情)
    const 结果数据 =
      计算循环详情?.技能详情?.map((技能) => {
        let 该技能成功增益列表: any[] = []
        let 该技能通过数量 = 0
        let 该技能异常增益列表: any[] = []
        const 技能增益列表 = 技能?.技能增益列表?.map((增益) => {
          const 循环 = [
            {
              ...技能,
              技能增益列表: [{ ...增益, 增益技能数: 1 }],
              技能数量: 1,
            },
          ]
          const { 计算结果技能列表 } = dispatch(
            秒伤计算({
              更新循环技能列表: 循环,
              更新秘籍信息: 当前循环信息?.秘籍,
              更新奇穴数据: 当前循环信息?.奇穴,
              更新快照计算: 快照计算,
              更新计算循环详情: 计算循环详情,
            }),
          )
          const 实际总伤 = 计算结果技能列表?.find((a) => a?.技能名称 === 技能?.技能名称)?.技能总输出
          if (实际总伤) {
            if (增益?.伤害数据?.期望伤害?.toFixed(4) === 实际总伤?.toFixed(4)) {
              该技能成功增益列表 = 合并数组(该技能成功增益列表, 增益?.增益名称?.split(','))
              该技能通过数量 += 1
            } else {
              console.info('错误数据', 技能, 增益)
            }
          }
          return {
            ...增益,
            计算结果: {
              实际总伤,
            },
          }
        })
        const 附加原因分析技能增益列表 = 技能增益列表?.map((增益) => {
          if (该技能成功增益列表?.length) {
            const 增益列表 = 增益?.增益名称?.split(',')
            const 过滤成功增益列表 = 增益列表?.filter((a) => !该技能成功增益列表?.includes(a))
            if (过滤成功增益列表?.length) {
              该技能异常增益列表 = 合并数组(该技能异常增益列表, 过滤成功增益列表)
              return {
                ...增益,
                异常分析: {
                  标题: '猜测部分增益异常',
                  数据: 过滤成功增益列表,
                },
              }
            } else {
              return {
                ...增益,
                结果: '成功',
              }
            }
          } else {
            const 增益列表 = 增益?.增益名称?.split(',')
            该技能异常增益列表 = 合并数组(该技能异常增益列表, 增益列表)
            return {
              ...增益,
              异常分析: {
                标题: '猜测系数异常',
              },
            }
          }
        })
        if (该技能通过数量) {
          全局异常增益列表 = 合并数组(全局异常增益列表, 该技能异常增益列表)
        }
        return {
          ...技能,
          技能增益列表: 附加原因分析技能增益列表,
          该技能通过数量,
          该技能异常增益列表,
        }
      }) || []

    结果数据.sort((a, b) => {
      // 先比较“该技能通过数量”（pass count），优先将值为0的放在前面
      const passCountDiff = (a.该技能通过数量 === 0 ? -1 : 0) - (b.该技能通过数量 === 0 ? -1 : 0)
      if (passCountDiff !== 0) {
        return passCountDiff // 如果有一个是0，则已经决定顺序
      }

      // 如果“该技能通过数量”相等或不为0，则进行原有逻辑的比较
      return (
        (b?.技能增益列表?.length || 0) -
        b?.该技能通过数量 -
        ((a?.技能增益列表?.length || 0) - a?.该技能通过数量)
      )
    })
    设置展示结果数据(结果数据 as any)
    设置全局异常增益(全局异常增益列表)
  }
  return (
    <div>
      {全局异常增益?.length ? (
        <p className={styles.tip}>推测异常增益: {全局异常增益?.join('、')}</p>
      ) : null}
      {展示结果数据?.map((技能: any) => {
        const 部分异常 =
          技能?.该技能通过数量 > 0 && 技能?.该技能通过数量 < 技能?.技能增益列表?.length
        const key = `${技能?.技能名称}_${技能?.伤害层数 || 1}_${技能?.DOT跳数 || 1}_${
          技能?.技能数量 || 1
        }_${技能?.技能等级 || 1}_校验`
        const 当前展开 = 展开技能 === key
        return (
          <div
            className={`${styles.item} ${部分异常 ? styles.canHover : ''}`}
            key={`${技能?.技能名称}_${技能?.伤害层数 || 1}_${技能?.DOT跳数 || 1}_${
              技能?.技能数量 || 1
            }_${技能?.技能等级 || 1}_校验`}
          >
            <div
              className={styles.header}
              onClick={() => {
                if (!部分异常) {
                  return
                }
                if (当前展开) {
                  设置展开技能(undefined)
                } else {
                  设置展开技能(key)
                }
              }}
            >
              <h1 className={styles.title}>
                {技能?.技能名称}
                <span
                  className={`${styles.num} ${
                    技能?.该技能通过数量 === 技能?.技能增益列表?.length ? styles.success : ''
                  } ${
                    技能?.该技能通过数量 > 0 && 技能?.该技能通过数量 < 技能?.技能增益列表?.length
                      ? styles.warning
                      : ''
                  }`}
                >
                  {技能?.该技能通过数量} / {技能?.技能增益列表?.length}
                </span>
              </h1>
              <div className={styles.content}>
                {!技能?.该技能通过数量 ? (
                  <span className={styles.error}>系数/常驻增益 异常</span>
                ) : 技能?.该技能通过数量 === 技能?.技能增益列表?.length ? (
                  <span className={styles.success}>校验通过</span>
                ) : (
                  <span className={styles.warning}>部分增益异常</span>
                )}
              </div>
            </div>
            {当前展开 ? (
              <div className={styles.expand}>
                <h1 className={styles.expandTitle}>
                  推测异常增益：{技能?.该技能异常增益列表?.join('、')}
                </h1>
                {技能?.技能增益列表
                  ?.filter((增益) => 增益?.结果 !== '成功')
                  ?.map((增益) => {
                    const 增益名称列表 = 增益?.增益名称?.split(',')
                    return (
                      <div className={styles.expandItem} key={增益?.增益名称}>
                        <div className={styles.expandWrap}>
                          {增益名称列表?.map((a) => {
                            const 异常增益 = 技能?.该技能异常增益列表?.includes(a)
                            return (
                              <span className={异常增益 ? styles.expandItemError : ''} key={a}>
                                {a}
                              </span>
                            )
                          })}
                        </div>
                        <div>
                          <span>
                            <span className={styles.error}>计算：</span>
                            {增益?.计算结果?.总伤?.toFixed(4)}
                          </span>
                          <span>
                            <span className={styles.success}>实际：</span>
                            {增益?.伤害数据?.期望伤害?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default 校验结果

function 合并数组(array1, array2) {
  // 创建一个 Set 来存储合并后的结果（自动去重）
  const mergedSet = new Set([...array1, ...array2])

  // 将 Set 转换回数组返回
  return Array.from(mergedSet)
}
