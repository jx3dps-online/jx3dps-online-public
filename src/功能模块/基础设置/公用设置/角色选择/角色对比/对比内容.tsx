import React, { useMemo, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  Collapse,
  Empty,
  Progress,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from 'antd'
import {
  AimOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons'
import 主题 from 'antd/es/theme'
import type { 对比数据, 对比筛选 } from './类型'
import { 获取对比列, 列符合筛选 } from './计算'
import { 下载对比表格 } from './导出'
import use对比计算 from './use对比计算'
import 结果表 from './结果表'
import 筛选设置 from './筛选设置'
import 样式 from './index.module.less'

const 空筛选: 对比筛选 = {
  最低加速: null,
  最高加速: null,
  最低延迟: null,
  最高延迟: null,
  未限定延迟: true,
}

export default function 对比内容({ 数据 }: { 数据: 对比数据 }) {
  const { token } = 主题.useToken()
  const 角色选项 = useMemo(
    () =>
      数据.行
        .filter((行) => 行.来源 === '角色')
        .map((行) => ({ label: 行.名称, value: 行.角色id })),
    [数据],
  )
  const [选中角色, 设置选中角色] = useState(角色选项.map((项) => 项.value))
  const [选中目标, 设置选中目标] = useState<string[]>([])
  const [目标增益角色id, 设置目标增益角色id] = useState(选中角色[0])
  const [选中循环, 设置选中循环] = useState<number[]>([])
  const [隐藏列, 设置隐藏列] = useState<string[]>([])
  const [简易显示, 设置简易显示] = useState(false)
  const [正在下载, 设置正在下载] = useState(false)
  const 表格 = useRef<{ 定位最高: () => void }>(null)
  const [筛选, 设置筛选] = useState<对比筛选>(空筛选)
  const 全部列 = useMemo(() => 获取对比列(数据.心法数据, 数据.循环), [数据])
  const 候选列 = useMemo(
    () =>
      全部列.filter((列) => 选中循环.includes(Number(列.id.split(':')[0])) && 列符合筛选(列, 筛选)),
    [全部列, 选中循环, 筛选],
  )
  const 可见列 = useMemo(() => 候选列.filter((列) => !隐藏列.includes(列.id)), [候选列, 隐藏列])
  const 行 = useMemo(
    () =>
      数据.行.filter((行) =>
        行.来源 === '角色'
          ? 选中角色.includes(行.角色id)
          : 行.角色id === 目标增益角色id && 选中目标.includes(行.目标id!),
      ),
    [数据, 选中角色, 选中目标, 目标增益角色id],
  )
  const { 报告, 取消, 重算 } = use对比计算(数据, 行, 可见列)
  const 总格数 = 行.length * 可见列.length
  const 空描述 = !行.length
    ? '选择角色或目标配装'
    : !选中循环.length
      ? '选择要对比的循环'
      : !候选列.length
        ? '当前加速/延迟筛选没有匹配的循环列'
        : '匹配的循环列已全部隐藏'
  const 清除筛选和隐藏 = () => {
    设置筛选(空筛选)
    设置隐藏列([])
  }
  const 已完成 = 报告?.状态 === '已完成'
  const 有有效结果 = Object.values(报告?.结果 || {}).some((格子) => 格子.秒伤 !== undefined)
  const 下载表格 = async () => {
    if (!报告) return
    设置正在下载(true)
    try {
      await 下载对比表格(数据, 行, 可见列, 报告.结果)
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '表格下载失败')
    } finally {
      设置正在下载(false)
    }
  }
  return (
    <div
      className={样式.内容}
      style={
        {
          '--对比-边框': token.colorBorderSecondary,
          '--对比-底色': token.colorFillQuaternary,
          '--对比-背景': token.colorBgContainer,
          '--对比-主色': token.colorPrimary,
          '--对比-主色浅': token.colorPrimaryBg,
          '--对比-次字': token.colorTextSecondary,
          '--对比-成功': token.colorSuccess,
        } as React.CSSProperties
      }
    >
      <div className={样式.配置区}>
        <div className={样式.对象区}>
          <section className={样式.对象分组}>
            <div className={样式.分组标题}>
              角色 <span>{选中角色.length}</span>
            </div>
            <Checkbox.Group
              value={选中角色}
              onChange={(值) => 设置选中角色(值 as string[])}
              className={样式.勾选列表}
            >
              {角色选项.map((项) => (
                <Checkbox key={项.value} value={项.value} className={样式.勾选项}>
                  {项.label}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </section>
          <section className={样式.对象分组}>
            <div className={样式.分组标题}>
              目标配装 <span>{选中目标.length}</span>
            </div>
            {数据.目标.length ? (
              <Checkbox.Group
                value={选中目标}
                onChange={(值) => 设置选中目标(值 as string[])}
                className={样式.勾选列表}
              >
                {数据.目标.map((目标) => (
                  <Checkbox key={目标.id} value={目标.id} className={样式.勾选项}>
                    {目标.名称}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            ) : (
              <Typography.Text type='secondary'>暂无目标配装</Typography.Text>
            )}
            {选中目标.length > 0 && (
              <div className={样式.目标来源}>
                <span>阵眼 / 小药来自</span>
                <Select
                  size='small'
                  value={目标增益角色id}
                  onChange={设置目标增益角色id}
                  aria-label='目标增益来源'
                  options={角色选项}
                  className={样式.来源选择}
                  getPopupContainer={(节点) => 节点.parentElement!}
                  popupMatchSelectWidth={false}
                />
              </div>
            )}
          </section>
        </div>
        <div className={样式.循环区}>
          <span className={样式.分组标题}>对比循环</span>
          <div className={样式.选择框}>
            <Select
              mode='multiple'
              className={样式.选择器}
              placeholder='选择一个或多个循环'
              aria-label='对比循环'
              value={选中循环}
              optionFilterProp='搜索文字'
              optionLabelProp='label'
              onChange={设置选中循环}
              maxTagCount='responsive'
              getPopupContainer={(节点) => 节点.parentElement!}
              options={数据.循环.map((循环, 索引) => ({
                value: 索引,
                label: 循环.标题 || 循环.名称,
                搜索文字: `${循环.标题 || 循环.名称} ${循环.备注 || ''}`,
                备注: 循环.备注,
              }))}
              optionRender={(选项) => (
                <div>
                  <div>{选项.label}</div>
                  {选项.data.备注 && <div className={样式.次要文字}>{选项.data.备注}</div>}
                </div>
              )}
            />
          </div>
        </div>
        <Collapse
          ghost
          size='small'
          items={[
            {
              key: '筛选',
              label: (
                <Space size={6}>
                  <FilterOutlined />
                  加速 / 延迟筛选与隐藏列
                </Space>
              ),
              children: (
                <筛选设置
                  筛选={筛选}
                  设置筛选={设置筛选}
                  列={全部列}
                  隐藏列={隐藏列}
                  设置隐藏列={设置隐藏列}
                />
              ),
            },
          ]}
        />
      </div>
      {总格数 ? (
        <>
          <div className={样式.工具栏}>
            <div className={样式.计算状态}>
              <span className={已完成 ? 样式.完成状态 : undefined}>{报告?.状态 || '准备计算'}</span>
              <span className={样式.次要文字}>
                {报告?.已处理 || 0} / {总格数}
              </span>
              {报告?.状态 === '计算中' ? (
                <Button size='small' icon={<StopOutlined />} onClick={取消}>
                  停止
                </Button>
              ) : (
                <Button size='small' icon={<ReloadOutlined />} onClick={重算}>
                  重算
                </Button>
              )}
            </div>
            <Space wrap size={8}>
              <Tooltip title={简易显示 ? '当前表头：加速档位或区间 | 延迟' : '简化表头并缩小列宽'}>
                <Button
                  size='small'
                  type={简易显示 ? 'primary' : 'default'}
                  aria-pressed={简易显示}
                  onClick={() => 设置简易显示(!简易显示)}
                >
                  简易显示
                </Button>
              </Tooltip>
              <Tooltip title='定位当前表格最高秒伤，并列时依次定位'>
                <Button
                  size='small'
                  icon={<AimOutlined />}
                  disabled={!已完成 || !有有效结果}
                  onClick={() => 表格.current?.定位最高()}
                >
                  定位最高
                </Button>
              </Tooltip>
              <Button
                size='small'
                icon={<DownloadOutlined />}
                disabled={!已完成}
                loading={正在下载}
                onClick={下载表格}
              >
                下载表格
              </Button>
            </Space>
          </div>
          {报告?.状态 === '计算中' && (
            <Progress
              percent={Math.floor(((报告?.已处理 || 0) / 总格数) * 100)}
              showInfo={false}
              size='small'
            />
          )}
          <结果表 ref={表格} 行={行} 列={可见列} 结果={报告?.结果 || {}} 简易显示={简易显示} />
        </>
      ) : (
        <div className={样式.空结果}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={空描述}>
            {行.length > 0 && 选中循环.length > 0 && (
              <Button size='small' onClick={清除筛选和隐藏}>
                清除筛选和隐藏
              </Button>
            )}
          </Empty>
        </div>
      )}
    </div>
  )
}
