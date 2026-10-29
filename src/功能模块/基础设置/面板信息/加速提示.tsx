import { lazy, Suspense, useState } from 'react'
import { Button, Spin } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取心法加速阈值, 获取主要加速阈值 } from '@/数据/加速阈值'
import styles from './加速提示.module.less'

const 加速阈值详情 = lazy(() => import('@/组件/加速阈值详情'))

function 加速提示({ 当前加速 }: { 当前加速: number }) {
  const 心法 = use心法数据()
  const [显示详情, 设置显示详情] = useState(false)
  const 分组 = 获取主要加速阈值(获取心法加速阈值(心法))
  return (
    <>
      {分组.map((组, index) => {
        const 下一档 = 组.档位.find((项) => 项.加速值 > 当前加速)
        const 当前档 = 组.档位.find((项) => 当前加速 >= 项.加速值 && 当前加速 < 项.下一加速值)!
        return (
          <section className={styles.分组} key={组.配置.标识}>
            <div className={styles.标题行}>
              <span className={styles.类型标签}>{组.配置.名称}</span>
              {index === 0 && (
                <Button
                  type='link'
                  size='small'
                  className={styles.查看按钮}
                  onMouseDown={(事件) => 事件.preventDefault()}
                  onClick={() => 设置显示详情(true)}
                >
                  查看阈值
                </Button>
              )}
            </div>
            {组.配置.备注 && <div className={styles.备注}>{组.配置.备注}</div>}
            <table className={styles.加速表格}>
              <thead>
                <tr>
                  <th>当前阈值</th>
                  <th>当前加速</th>
                  <th>下一阈值</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div>{当前档.加速值}</div>
                    <div className={styles.阈值时间}>{(当前档.实际帧数 / 16).toFixed(2)} 秒</div>
                  </td>
                  <td>
                    <div>{当前加速}</div>
                    <div className={styles.阈值时间}>{(当前档.实际帧数 / 16).toFixed(2)} 秒</div>
                  </td>
                  <td>
                    {下一档 ? (
                      <>
                        <div>{下一档.加速值}</div>
                        <div className={styles.阈值时间}>
                          {(下一档.实际帧数 / 16).toFixed(2)} 秒
                        </div>
                      </>
                    ) : (
                      '已达上限'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )
      })}
      {显示详情 && (
        <Suspense fallback={<Spin size='small' />}>
          <加速阈值详情 key={心法.名称} 当前加速={当前加速} onCancel={() => 设置显示详情(false)} />
        </Suspense>
      )}
    </>
  )
}
export default 加速提示
