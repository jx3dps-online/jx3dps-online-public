import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Collapse,
  Drawer,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Spin,
  Tabs,
  Tooltip,
  Typography,
} from 'antd'
import type { 宏面板属性, 心法说明 } from './类型'
import 支持说明 from './界面/支持说明'
import 使用说明 from './界面/使用说明'
import 分页编辑器 from './界面/分页编辑器'
import 宏文本输入, { 宏字数 } from './界面/宏文本输入'
import 图标选择 from './界面/图标选择'
import 宏生成 from './界面/宏生成'
import { 创建宏任务 } from './工具/运行任务'
import 样式 from './界面/样式.module.less'

export default function 宏面板({
  展示,
  关闭,
  心法,
  模拟参数,
  当前循环,
  配置,
  更新配置,
  清空循环,
  删除,
  执行,
  停止,
  运行中,
  错误,
  更新生成状态,
}: 宏面板属性) {
  const [说明, 设置说明] = useState<心法说明>()
  const [加载错误, 设置加载错误] = useState('')
  const 参数文本 = JSON.stringify(模拟参数)
  useEffect(() => {
    let 有效 = true
    设置说明(undefined)
    设置加载错误('')
    const 任务 = 创建宏任务({ 类型: '说明', 心法, 参数: JSON.parse(参数文本) })
    任务.结果
      .then((回复) => {
        if (有效) 设置说明(回复.说明)
      })
      .catch((错误: Error) => {
        if (有效) 设置加载错误(错误.message)
      })
    return () => {
      有效 = false
      任务.取消()
    }
  }, [心法, 参数文本])
  const { 编辑, 秒数, 气血比例, 环境 } = 配置
  const 宏信息 = (
    <>
      {说明 && (
        <图标选择
          图标={配置.图标}
          图标库={说明.图标库}
          禁用={运行中}
          更新={(图标) => 更新配置({ ...配置, 图标 })}
        />
      )}
      <Input
        className={样式.名称输入框}
        aria-label='宏名称'
        placeholder='输入宏名称'
        maxLength={50}
        value={配置.名称}
        disabled={运行中}
        onChange={(事件) => 更新配置({ ...配置, 名称: 事件.target.value })}
      />
    </>
  )
  return (
    <Drawer title={心法 + ' · 宏'} open={展示} onClose={关闭} width={880}>
      <div className={样式.面板}>
        {(错误 || 加载错误) && <Alert type='error' showIcon message={错误 || 加载错误} />}
        {!说明 && !加载错误 && (
          <Spin tip='正在加载宏模块与心法数据'>
            <div style={{ height: 48 }} />
          </Spin>
        )}
        <Tabs
          defaultActiveKey='设置'
          destroyInactiveTabPane={false}
          items={[
            {
              key: '设置',
              label: '宏设置',
              children: (
                <div className={样式.面板}>
                  {说明?.翻页体态 ? (
                    <分页编辑器
                      宏信息={宏信息}
                      编辑={编辑}
                      说明={说明}
                      更新编辑={(编辑) => 更新配置({ ...配置, 编辑 })}
                      禁用={运行中}
                    />
                  ) : (
                    <>
                      <div className={样式.宏信息}>
                        {宏信息}
                        {说明 && (
                          <div className={样式.字数}>
                            <宏字数 文本={编辑.单页} />
                          </div>
                        )}
                      </div>
                      {说明 && (
                        <宏文本输入
                          aria-label='宏文本'
                          rows={12}
                          value={编辑.单页}
                          显示字数={false}
                          placeholder={说明.示例}
                          disabled={运行中}
                          onChange={(事件) =>
                            更新配置({ ...配置, 编辑: { ...编辑, 单页: 事件.target.value } })
                          }
                        />
                      )}
                    </>
                  )}
                  <Space wrap>
                    <InputNumber
                      className={样式.续跑时长}
                      aria-label='运行时长'
                      min={1}
                      max={300}
                      value={秒数}
                      addonBefore='运行时长'
                      addonAfter='秒'
                      disabled={运行中}
                      onChange={(值) => 更新配置({ ...配置, 秒数: 值 || 300 })}
                    />
                    <Tooltip
                      title={
                        <>
                          {'在当前循环模拟中，运行宏 ' + 秒数 + ' 秒。'}
                          <br />
                          资源、Buff 和调息读取技能运行时状态。
                        </>
                      }
                    >
                      <Button type='primary' disabled={!说明} loading={运行中} onClick={执行}>
                        运行
                      </Button>
                    </Tooltip>
                    {运行中 && <Button onClick={停止}>停止</Button>}
                    <Button disabled={运行中 || !当前循环.length} onClick={清空循环}>
                      清空循环
                    </Button>
                    <Popconfirm
                      title={'确认删除宏「' + (配置.名称 || '未命名宏') + '」？'}
                      description='删除后无法恢复。'
                      okText='确认删除'
                      cancelText='取消'
                      okButtonProps={{ danger: true }}
                      onConfirm={删除}
                      disabled={运行中}
                    >
                      <Button danger disabled={运行中}>
                        删除宏
                      </Button>
                    </Popconfirm>
                  </Space>
                  <Collapse
                    size='small'
                    items={[
                      {
                        key: '更多设置',
                        label: '更多设置',
                        children: (
                          <div className={样式.面板}>
                            <div className={样式.设置}>
                              <InputNumber
                                addonBefore='气血比例'
                                aria-label='气血比例'
                                min={0}
                                max={1}
                                step={0.1}
                                value={气血比例}
                                disabled={运行中}
                                onChange={(值) => 更新配置({ ...配置, 气血比例: 值 ?? 1 })}
                              />
                              {说明 &&
                                Object.entries(说明.环境字段).map(([字段, 设置]) => (
                                  <InputNumber
                                    key={字段}
                                    addonBefore={设置.名称}
                                    aria-label={设置.名称}
                                    min={设置.最小值 || 0}
                                    max={设置.最大值}
                                    disabled={运行中}
                                    precision={说明.小数字段.includes(字段) ? 3 : 0}
                                    step={说明.小数字段.includes(字段) ? 0.1 : 1}
                                    value={环境[字段] ?? 设置.默认值}
                                    onChange={(值) =>
                                      更新配置({
                                        ...配置,
                                        环境: { ...环境, [字段]: 值 ?? 设置.默认值 },
                                      })
                                    }
                                  />
                                ))}
                            </div>
                            <Typography.Text type='secondary'>
                              {说明?.翻页体态 ? '体态翻页按实际状态自动选页。' : ''}
                              固定环境值只参与宏条件；资源、Buff 和调息读取技能运行时状态。
                              {说明?.支持打断 === false
                                ? '当前心法的 /fcast 按 /cast 执行，等待读条结束后释放。'
                                : '/fcast 可打断已接入的引导；可回填跳数取决于原模拟器，无法回填时保留原循环。'}
                            </Typography.Text>
                          </div>
                        ),
                      },
                    ]}
                  />
                  <Typography.Text type='secondary'>
                    单心法最多保存 16 个宏。
                    新技能追加后仍由原循环模拟器计算，原技能序列保留。运行失败时不追加。
                  </Typography.Text>
                  {说明 && <支持说明 说明={说明} />}
                </div>
              ),
            },
            {
              key: '生成',
              label: '生成宏',
              forceRender: true,
              children: (
                <div className={样式.面板}>
                  {说明 && (
                    <宏生成
                      key={配置.id}
                      请求={{
                        心法,
                        参数: 模拟参数,
                        当前循环,
                        气血比例,
                        环境,
                        容差: 0.125,
                        随机种子: 20261010,
                      }}
                      已保存={配置.生成结果}
                      更新生成状态={(状态) => 更新生成状态(配置.id, 状态)}
                      禁用={运行中}
                      应用={(文本) =>
                        更新配置({ ...配置, 编辑: { ...编辑, 模式: '单页', 单页: 文本 } })
                      }
                    />
                  )}
                </div>
              ),
            },
            {
              key: '使用说明',
              label: '使用说明',
              children: <使用说明 />,
            },
          ]}
        />
      </div>
    </Drawer>
  )
}
