import { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Collapse, InputNumber, Modal, Space, Tag, Tooltip } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 获取心法加速阈值 } from '@/数据/加速阈值'
import { 解析加速阈值 } from '@/工具函数/加速阈值'
import styles from './index.module.less'
import { use报告引导界面 } from '@/功能模块/新手引导/界面状态'

const 初始参数 = { 额外加速值: 0, 郭氏加速等级: 0, 郭氏不受限加速: 0 }
const 参数字段 = ['额外加速值', '郭氏加速等级', '郭氏不受限加速'] as const

function 加速阈值详情({ 当前加速, onCancel }: { 当前加速: number; onCancel: () => void }) {
  use报告引导界面('心法阈值打开', true)
  const 心法 = use心法数据()
  const 分组 = useMemo(() => 获取心法加速阈值(心法), [心法])
  const [展开分组, 设置展开分组] = useState<Record<string, boolean>>({})
  const [每行数量, 设置每行数量] = useState(1)
  const 列表观察器 = useRef<ResizeObserver>()
  const 观察列表 = useCallback((元素: HTMLDivElement | null) => {
    列表观察器.current?.disconnect()
    if (!元素) return
    const 更新列数 = (宽度: number) => 设置每行数量(Math.max(1, Math.floor((宽度 + 8) / 80)))
    更新列数(元素.clientWidth)
    列表观察器.current = new ResizeObserver(([项]) => 更新列数(项.contentRect.width))
    列表观察器.current.observe(元素)
  }, [])
  const [参数启用, 设置参数启用] = useState(false)
  const [临时参数, 设置临时参数] = useState(初始参数)
  const 展示分组 = useMemo(
    () =>
      分组.map((组) => ({
        ...组,
        档位: 参数启用
          ? 解析加速阈值({
              ...组.配置,
              额外加速值: (组.配置.额外加速值 ?? 0) + 临时参数.额外加速值,
              郭氏加速等级: (组.配置.郭氏加速等级 ?? 0) + 临时参数.郭氏加速等级,
              郭氏不受限加速: (组.配置.郭氏不受限加速 ?? 0) + 临时参数.郭氏不受限加速,
            })
          : 组.档位,
      })),
    [分组, 参数启用, 临时参数],
  )

  return (
    <Modal title={'心法阈值'} open onCancel={onCancel} footer={null} width={960}>
      <div className={styles.工具栏}>
        <span>当前数值加速：{当前加速}</span>
      </div>
      <div className={styles.列表} ref={观察列表}>
        {展示分组.map((组) => {
          const 全部档位 = 组.档位
          const 需要展开 = 全部档位.length > 每行数量 * 3
          const 已展开 = !!展开分组[组.配置.标识]
          const 可见档位 = 已展开 ? 全部档位 : 全部档位.slice(0, 每行数量 * 3)
          return (
            <section className={styles.行} key={组.配置.标识}>
              <div className={styles.分组标题}>
                <div className={styles.名称}>
                  <strong>{组.配置.名称}</strong>
                  {组.配置.类型 && <Tag>{组.配置.类型}</Tag>}
                  {组.配置.备注 && <div className={styles.备注}>{组.配置.备注}</div>}
                </div>
                {需要展开 && (
                  <Button
                    type='link'
                    size='small'
                    className={styles.展开按钮}
                    aria-expanded={已展开}
                    onClick={() => 设置展开分组((当前) => ({ ...当前, [组.配置.标识]: !已展开 }))}
                  >
                    {已展开 ? '收起' : '展开'}
                  </Button>
                )}
              </div>
              <div className={styles.阈值列表}>
                {可见档位.map((项) => {
                  const 当前区间 = 当前加速 >= 项.加速值 && 当前加速 < 项.下一加速值
                  return (
                    <Tooltip
                      key={项.标识}
                      trigger={['hover', 'focus']}
                      title={
                        <>
                          {当前区间 && <div>当前区间</div>}
                          <div>
                            加速 {项.加速值} ≤ 数值
                            {Number.isFinite(项.下一加速值) ? ` < ${项.下一加速值}` : ''}
                          </div>
                          {项.单次帧数 !== undefined && <div>单跳 {项.单次帧数} 帧</div>}
                          {项.作用分布 && <div>各次间隔（帧）：{项.作用分布.join('、')}</div>}
                        </>
                      }
                    >
                      <div
                        tabIndex={0}
                        className={`${styles.阈值} ${当前区间 ? styles.当前区间 : ''}`}
                      >
                        <strong>{项.加速值}</strong>
                        <small>{(项.实际帧数 / 16).toFixed(2)} 秒</small>
                      </div>
                    </Tooltip>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <Collapse
        className={styles.参数}
        activeKey={参数启用 ? ['参数'] : []}
        onChange={(键) => 设置参数启用(键.includes('参数'))}
        items={[
          {
            key: '参数',
            label: '模拟身上存在额外加速Buff，查看阈值变化',
            children: (
              <Space direction='vertical' className={styles.参数内容}>
                <Space wrap>
                  {参数字段.map((字段) => (
                    <label key={字段}>
                      {字段}
                      <InputNumber
                        style={{ marginLeft: 8 }}
                        min={0}
                        max={99999}
                        precision={0}
                        value={临时参数[字段]}
                        onChange={(值) => {
                          if (值 === null || (Number.isSafeInteger(值) && 值 >= 0 && 值 <= 99999)) {
                            设置临时参数({ ...临时参数, [字段]: 值 ?? 0 })
                          }
                        }}
                      />
                    </label>
                  ))}
                  <a onClick={() => 设置临时参数(初始参数)}>重置参数</a>
                </Space>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  )
}

export default 加速阈值详情
