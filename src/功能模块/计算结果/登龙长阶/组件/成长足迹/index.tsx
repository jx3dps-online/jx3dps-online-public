import React from 'react'
import { Button, Modal, Spin, Tooltip } from 'antd'
import { ArrowRightOutlined, QuestionCircleOutlined, RiseOutlined } from '@ant-design/icons'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 登阶武器类型, 同一登阶循环 } from '../../领域/循环'
import { 生成足迹摘要, 计算足迹收益 } from '../../领域/足迹'
import type { 角色计划, 配装循环 } from '@/角色/类型'
import type { 装备信息数据类型 } from '@/@types/装备'
import { 数字, 增量 } from '../../领域/格式化'
import { 获取文案, 填充文案 } from '../../文案'

interface 成长足迹属性 {
  显示足迹: boolean
  设置显示足迹: (显示: boolean) => void
  主题样式: React.CSSProperties
  计划: 角色计划
  足迹?: ReturnType<typeof 计算足迹收益>
  另存试配: (装备: 装备信息数据类型, 标签: string, 循环?: 配装循环) => void
}
export default function 成长足迹({
  显示足迹,
  设置显示足迹,
  主题样式,
  计划,
  足迹,
  另存试配,
}: 成长足迹属性) {
  const { 名称 } = use心法数据()
  const 文案 = 获取文案(名称)
  return (
    <Modal
      open={显示足迹}
      onCancel={() => 设置显示足迹(false)}
      footer={null}
      width={680}
      className='dragon-detail-modal dragon-history-modal'
      style={主题样式}
      centered
      title={
        <div className='dragon-modal-title'>
          <span>{文案['通用.成长足迹']}</span>
          <p>{文案['足迹.副标题']}</p>
        </div>
      }
    >
      <div className='dragon-history-toolbar'>
        <span>{填充文案(文案['足迹.记录数'], { 数量: 计划.历史.length })}</span>
        <Tooltip title={文案['足迹.重算提示']}>
          <span>
            {文案['足迹.DPS说明']} <QuestionCircleOutlined />
          </span>
        </Tooltip>
      </div>
      <div className='dragon-history'>
        {!足迹 && 计划.历史.length > 0 ? (
          <div className='dragon-history-loading'>
            <Spin /> {文案['足迹.加载中']}
          </div>
        ) : (
          [...(足迹 || [])].reverse().map((item, i) => {
            const 摘要 = 生成足迹摘要(计划.历史[item.索引 - 1]?.装备, item.快照.装备, 文案)
            return (
              <article
                className={i === 0 ? 'is-latest' : ''}
                key={`${item.快照.时间}-${item.索引}`}
              >
                <span className='dragon-history-dot'>{i === 0 ? <RiseOutlined /> : null}</span>
                <div className='dragon-history-entry'>
                  <div className='dragon-history-meta'>
                    <time>
                      {new Date(item.快照.时间).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    {i === 0 && <span>{文案['足迹.最近一步']}</span>}
                  </div>
                  <div className='dragon-history-headline'>
                    <h4>
                      {登阶武器类型(计划.历史[item.索引 - 1]?.装备) === '紫武' &&
                      登阶武器类型(item.快照.装备) === '橙武'
                        ? 文案['足迹.橙武新阶']
                        : 摘要.标题}
                    </h4>
                    {item.提升 !== undefined && (
                      <b
                        className={
                          item.提升 > 0 ? 'is-positive' : item.提升 < 0 ? 'is-negative' : 'is-flat'
                        }
                      >
                        {item.提升 > 0 ? '↑ ' : ''}
                        {增量(item.提升, 文案['通用.待评估'])}
                        <small> DPS</small>
                      </b>
                    )}
                  </div>
                  <p className='dragon-history-summary'>
                    {摘要.摘要.join('；')}
                    {item.快照.循环 && !同一登阶循环(计划.历史[item.索引 - 1]?.循环, item.快照.循环)
                      ? 填充文案(文案['足迹.循环'], { 名称: item.快照.循环.名称 })
                      : ''}
                  </p>
                  <div className='dragon-history-bottom'>
                    <span title={item.快照.名称}>
                      {item.快照.名称} · {数字(item.秒伤, 文案['通用.待评估'])} DPS
                    </span>
                    <Button
                      type='text'
                      size='small'
                      onClick={() => {
                        设置显示足迹(false)
                        另存试配(item.快照.装备, item.快照.名称, item.快照.循环)
                      }}
                    >
                      {文案['足迹.回看']} <ArrowRightOutlined />
                    </Button>
                  </div>
                </div>
              </article>
            )
          })
        )}
        {!计划.历史.length && <p className='dragon-detail-empty'>{文案['足迹.空态']}</p>}
      </div>
      <p className='dragon-modal-note'>{文案['足迹.说明']}</p>
    </Modal>
  )
}
