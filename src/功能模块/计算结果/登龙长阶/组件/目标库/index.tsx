import React, { useMemo, useRef, useState } from 'react'
import { Alert, Button, ConfigProvider, Empty, Modal, Spin, Tag, message } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import { useAppSelector } from '@/hooks'
import type { 目标JSON数据 } from '@/角色/目标导入导出'
import { use报告引导界面 } from '@/功能模块/新手引导/界面状态'
import { 解析内置目标, use目标库 } from '../../目标库/配置'
import type { 目标标签 } from '../../目标库/类型'
import { 获取文案, 填充文案 } from '../../文案'
import 样式 from './index.module.less'

const 标签颜色: Record<目标标签, string> = {
  紫武: 'purple',
  橙武: 'orange',
  新手推荐: 'blue',
  高手进阶: 'geekblue',
  平民配装: 'green',
  性价比: 'cyan',
  土豪专用: 'gold',
}

export default function 目标库弹窗({
  用途,
  onClose,
  onSelect,
}: {
  用途: '复制' | '编辑'
  onClose: () => void
  onSelect: (目标: 目标JSON数据) => boolean | Promise<boolean>
}) {
  const 心法 = use心法数据()
  const 数据 = useAppSelector((state) => state.data)
  const 文案 = 获取文案(心法.名称)
  const { 目标, 加载中, 错误, 重试 } = use目标库(心法)
  const [处理中, 设置处理中] = useState<string>()
  const 操作中 = useRef(false)
  const 条目 = useMemo(
    () =>
      目标.map((配置) => {
        try {
          return { 配置, 数据: 解析内置目标(配置, 心法, 数据), 错误: undefined }
        } catch (错误) {
          return {
            配置,
            数据: undefined,
            错误: 错误 instanceof Error ? 错误.message : 文案['目标库.错误.配装'],
          }
        }
      }),
    [目标, 心法, 数据.增益数据, 数据.增益启用, 数据.网络延迟, 数据.自定义循环列表, 文案],
  )
  const 推荐 = 条目.find((项) => 项.配置.推荐 && 项.数据)
  use报告引导界面('目标库打开', true)
  use报告引导界面('目标库加载中', 加载中)
  use报告引导界面('目标库有推荐', !!推荐)

  const 选择 = async (标识: string, 目标: 目标JSON数据) => {
    if (操作中.current) return
    操作中.current = true
    设置处理中(标识)
    try {
      if (await onSelect(目标)) onClose()
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : 文案['通用.保存失败'])
    } finally {
      操作中.current = false
      设置处理中(undefined)
    }
  }
  return (
    <ConfigProvider theme={{ token: { colorPrimary: 心法.系统配置.主题色 } }}>
      <Modal
        open
        title={文案['目标库.标题']}
        onCancel={() => {
          if (!操作中.current) onClose()
        }}
        footer={null}
        width={720}
        className='guide-goal-library'
      >
        <p style={{ marginBottom: 12 }}>
          {文案[用途 === '复制' ? '目标库.说明' : '目标库.编辑说明']}
        </p>
        {加载中 ? (
          <Spin />
        ) : 错误 ? (
          <Alert
            type='error'
            showIcon
            message={错误}
            action={<Button onClick={重试}>{文案['目标库.重试']}</Button>}
          />
        ) : !条目.length ? (
          <Empty description={文案['目标库.空态']} />
        ) : (
          <div className={样式.列表}>
            {条目.map((项) => (
              <article className={样式.条目} key={项.配置.标识}>
                <div className={样式.标题}>
                  <strong>{项.配置.名称}</strong>
                  {项.配置.标签.map((标签) => (
                    <Tag key={标签} color={标签颜色[标签]} style={{ margin: 0 }}>
                      {标签}
                    </Tag>
                  ))}
                </div>
                <Button
                  className={样式.选择}
                  id={推荐 === 项 ? 'Guide_复制推荐目标' : undefined}
                  type='primary'
                  size='small'
                  disabled={!项.数据 || !!处理中}
                  loading={处理中 === 项.配置.标识}
                  onClick={() => 项.数据 && 选择(项.配置.标识, 项.数据)}
                >
                  {文案[用途 === '复制' ? '目标库.复制' : '目标库.使用']}
                </Button>
                <p className={样式.描述}>{项.配置.说明}</p>
                <div className={样式.来源}>
                  {项.配置.来源链接?.startsWith('https://') ? (
                    <a href={项.配置.来源链接} target='_blank' rel='noreferrer'>
                      {填充文案(文案['目标库.提供者'], { 名称: 项.配置.提供者 })}
                    </a>
                  ) : (
                    <span>{填充文案(文案['目标库.提供者'], { 名称: 项.配置.提供者 })}</span>
                  )}
                  <span>{填充文案(文案['目标库.更新日期'], { 日期: 项.配置.更新日期 })}</span>
                </div>
                {项.错误 && (
                  <Alert className={样式.错误} type='warning' showIcon message={项.错误} />
                )}
              </article>
            ))}
          </div>
        )}
      </Modal>
    </ConfigProvider>
  )
}
