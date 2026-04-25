import { App, Tooltip } from 'antd'
import { AlertOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { ReactSortable } from 'react-sortablejs'
import { 循环基础技能数据类型 } from '../../../../通用/通用框架/类型定义/技能'
import 循环技能显示组件 from '../循环技能显示组件'
import { Buff枚举 } from '../../../../通用/通用框架/类型定义/Buff'
import styles from './index.module.less'
import { useState } from 'react'

interface 循环技能容器组件类型 {
  处理循环结果对象: {
    显示循环: any[][]
    完整循环: 循环基础技能数据类型[]
  }
  模拟信息: any
  cycle: 循环基础技能数据类型[]
  setCycle: (e: any[]) => void
  原始Buff数据: Buff枚举
  点击下拉菜单: (data, index) => void
  允许操作列表?: string[]
  复制本轮至最后?: any
  隐藏显示技能?: string[]
  技能高亮?: (e: any, index: number) => boolean
}

const 循环技能容器组件: React.FC<循环技能容器组件类型> = (props) => {
  const { modal } = App.useApp()

  const {
    处理循环结果对象,
    模拟信息,
    cycle,
    setCycle,
    原始Buff数据,
    点击下拉菜单,
    允许操作列表,
    复制本轮至最后: 复制本轮至最后函数,
    隐藏显示技能 = [],
    技能高亮,
  } = props

  const [buff覆盖数据, 更新buff覆盖数据] = useState<number[]>([])
  const [buff覆盖索引, 更新buff覆盖索引] = useState<number>(0)

  const 拖拽更新循环 = (newList, type) => {
    if (type == '轮次内') {
      // 首先获取被替换轮次的第一个元素的index索引
      const minIndex = newList.reduce(function (min, obj) {
        return Math.min(min, obj.index)
      }, Infinity)
      // 获取最大的索引，判断拖拽生效范围
      const maxIndex = newList.reduce(function (min, obj) {
        return Math.max(min, obj.index)
      }, Number.NEGATIVE_INFINITY)
      // 将数组哪索引范围内跌元素替换为新的数组元素
      const newCycle = cycle.map((item, index) => {
        if (index < minIndex || index > maxIndex) {
          return { ...item }
        } else {
          return newList[index - minIndex]
        }
      })
      // 更新循环
      setCycle(newCycle)
    } else if (type === '整个轮次拖拽') {
      const res: 循环基础技能数据类型[] = []
      newList.forEach((item) => {
        item.forEach((a) => {
          if (a.技能名称) {
            const 当前技能数据 = 模拟信息?.技能基础数据?.find((b) => b?.技能名称 === a.技能名称)
            if (当前技能数据) {
              res.push(当前技能数据)
            }
          }
        })
      })
      setCycle(res)
    }
  }

  // 从循环内删除技能
  const 删除循环技能 = (index) => {
    const newCycle = [...(cycle || [])]
    newCycle.splice(index, 1)
    setCycle(newCycle)
  }

  const 删除后续全部技能 = (index) => {
    const newCycle = [...(cycle || [])]
    newCycle.splice(index + 1, newCycle.length - index + 1)
    setCycle(newCycle)
  }

  // 删除本轮后全部循环
  const 删除本轮后全部循环 = (轮次) => {
    modal.confirm({
      title: '确认删除本轮后全部循环吗？',
      onOk() {
        // 获取最大的索引，判断生效范围
        const maxIndex = 轮次.reduce(function (min, obj) {
          return Math.max(min, obj.index)
        }, Number.NEGATIVE_INFINITY)
        // 将数组哪索引范围内跌元素替换为新的数组元素
        const newCycle = cycle.filter((item, index) => {
          return index <= maxIndex
        })
        // 更新循环
        setCycle(newCycle)
      },
    })
  }

  // 复制本轮到最后
  const 复制本轮至最后 = (轮次) => {
    if (复制本轮至最后函数) {
      复制本轮至最后函数(轮次)
    } else {
      let newCycle: 循环基础技能数据类型[] = []
      newCycle = [...(cycle || [])].concat(轮次)
      setCycle(newCycle)
    }
  }

  // 删除本轮次
  const 删除本轮次 = (轮次) => {
    const minIndex = 轮次.reduce(function (min, obj) {
      return Math.min(min, obj.index)
    }, Infinity)
    // 获取最大的索引，判断拖拽生效范围
    const maxIndex = 轮次.reduce(function (min, obj) {
      return Math.max(min, obj.index)
    }, Number.NEGATIVE_INFINITY)
    // 将数组哪索引范围内跌元素替换为新的数组元素
    const newCycle = cycle.filter((item, index) => {
      return index < minIndex || index > maxIndex
    })
    // 更新循环
    setCycle(newCycle)
  }

  const 修改技能信息 = (技能信息) => {
    const newCycle = cycle.map((item, index) => {
      if (index === 技能信息.index) {
        return { ...技能信息 }
      } else {
        return item
      }
    })
    setCycle(newCycle)
  }

  const 找到上一个实际技能 = (索引) => {
    const 新索引 = 索引 - 1
    let 前一个技能 = cycle?.[新索引]
    if (!前一个技能) {
      return null
    }
    const 找到当前技能释放记录 = 模拟信息?.技能释放记录?.[新索引]
    return {
      ...前一个技能,
      ...找到当前技能释放记录,
    }
    // if (['换行', '触发橙武', '特效腰坠', '弱点击破']?.includes(前一个技能?.技能名称)) {
    //   return 找到上一个实际技能(索引 - 2)
    // } else {
    //   return 前一个技能
    // }
  }

  return (
    <div className={styles.wrap}>
      {处理循环结果对象?.显示循环?.length ? (
        (处理循环结果对象?.显示循环 || []).map((轮次, index) => {
          return 轮次?.length ? (
            <div className={`${styles.settingTurn}`} key={`${index}`}>
              <ReactSortable
                list={轮次.map((i) =>
                  Object.assign(i, { id: `${i?.技能名称}_${index}_${i?.index}` }),
                )}
                setList={(e) => {
                  拖拽更新循环(e, '轮次内')
                }}
                className={styles.settingTurnDrop}
                animation={150}
                draggable={'.cycle-simulator-setting-skill-drag'}
              >
                {(轮次 || []).map((item) => {
                  let 前一个技能 = 找到上一个实际技能(item?.index)
                  return (
                    <循环技能显示组件
                      技能={item as any}
                      前一个技能={前一个技能 as any}
                      模拟信息={模拟信息 as any}
                      删除循环技能={删除循环技能}
                      key={`${item?.技能名称}_${index}_${item?.index}`}
                      buff覆盖数据={buff覆盖数据}
                      buff覆盖索引={buff覆盖索引}
                      原始Buff数据={原始Buff数据}
                      允许操作列表={允许操作列表}
                      隐藏显示技能={隐藏显示技能}
                      技能高亮={技能高亮}
                      更新buff覆盖数据={(e, 索引) => {
                        更新buff覆盖数据(e)
                        更新buff覆盖索引(索引)
                      }}
                      点击下拉菜单={(e) => {
                        if (e?.key === '删除后续') {
                          删除后续全部技能(item?.index)
                        } else {
                          点击下拉菜单(e, item?.index)
                        }
                      }}
                      修改技能信息={修改技能信息}
                    />
                  )
                })}
                <div className={styles.operate}>
                  <Tooltip title='删除本轮后全部循环'>
                    <AlertOutlined
                      className={styles.operateBtn}
                      style={{ color: '#FF0000' }}
                      onClick={() => 删除本轮后全部循环(轮次)}
                    />
                  </Tooltip>
                  <Tooltip title='复制并添加到最后'>
                    <CopyOutlined
                      className={styles.operateBtn}
                      onClick={() => 复制本轮至最后(轮次)}
                    />
                  </Tooltip>
                  <Tooltip title='删除此轮'>
                    <DeleteOutlined
                      className={styles.operateBtn}
                      onClick={() => 删除本轮次(轮次)}
                    />
                  </Tooltip>
                </div>
              </ReactSortable>
            </div>
          ) : (
            <div />
          )
        })
      ) : (
        <p className={styles.settingTip}>请点击下方技能按钮生成模拟技能序列</p>
      )}
    </div>
  )
}

export default 循环技能容器组件
