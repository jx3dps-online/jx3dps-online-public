import React, { useMemo, useState } from 'react'
import { Alert, Button, Input, Modal, Progress, Select, Table, Tooltip } from 'antd'
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { 同部位对比参数 } from './计算'
import type { 同部位对比结果 } from './实际秒伤'
import use同部位对比 from './use同部位对比'
import { 装备名称, 属性简介 } from './装备信息'
import 容量条, { 容量分段 } from './容量条'
import 秒伤条, { 秒伤分段 } from './秒伤条'
import styles from './index.module.less'

const 格式化数值 = (值: number) => 值.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
const 排序选项 = [
  { value: '效用系数', label: '效用系数' },
  { value: '总容量', label: '总容量' },
  { value: '非加速容量', label: '非加速容量' },
  { value: '加速容量', label: '加速容量' },
  { value: '特效容量', label: '特效容量' },
  { value: '属性秒伤贡献', label: '属性秒伤（合计）' },
  { value: '普通属性秒伤', label: '本体属性秒伤' },
  { value: '特效秒伤', label: '特效属性秒伤' },
  { value: '相比当前', label: '属性秒伤差' },
  { value: '实际秒伤差', label: '实际秒伤差' },
  { value: '装备品级', label: '装备品级' },
] as const

function 同部位对比({
  心法,
  参数,
  onClose,
}: {
  心法: string
  参数: 同部位对比参数
  onClose: () => void
}) {
  const 状态 = use同部位对比(心法, 参数)
  const [名称, 设置名称] = useState('')
  const [品级, 设置品级] = useState<number[]>([])
  const [类型, 设置类型] = useState<string[]>([])
  const [属性, 设置属性] = useState<string[]>([])
  const [排序, 设置排序] = useState<(typeof 排序选项)[number]['value']>('效用系数')
  const [降序, 设置降序] = useState(true)
  const 筛选选项 = useMemo(
    () => ({
      品级: [...new Set(状态.结果.map((项) => 项.装备品级!))]
        .sort((a, b) => b - a)
        .map((值) => ({ value: 值, label: `${值}品` })),
      类型: [...new Set(状态.结果.map((项) => 项.装备类型))].map((值) => ({
        value: 值,
        label: 值,
      })),
      属性: [...new Set(状态.结果.flatMap((项) => 项.特征属性 || []))].map((值) => ({
        value: 值,
        label: 值,
      })),
    }),
    [状态.结果],
  )
  const 列表 = useMemo(
    () =>
      状态.结果
        .filter(
          (项) =>
            项.说明.includes(名称.trim()) &&
            (!品级.length || 品级.includes(项.装备品级!)) &&
            (!类型.length || 类型.includes(项.装备类型)) &&
            属性.every((值) => 项.特征属性?.includes(值)),
        )
        .sort((a, b) => {
          const 甲 = a[排序],
            乙 = b[排序]
          if (甲 == null || 乙 == null) return Number(甲 == null) - Number(乙 == null)
          return (甲 - 乙) * (降序 ? -1 : 1) || b.装备品级! - a.装备品级! || a.id - b.id
        }),
    [状态.结果, 名称, 品级, 类型, 属性, 排序, 降序],
  )
  const 当前 = 状态.结果.find((项) => 项.当前装备)
  const 最大容量 = Math.max(1, ...状态.结果.map((项) => 项.总容量))
  const 秒伤范围 = {
    最小: Math.min(
      0,
      ...状态.结果.map((项) => Math.min(0, 项.普通属性秒伤) + Math.min(0, 项.特效秒伤)),
    ),
    最大: Math.max(
      1,
      ...状态.结果.map((项) => Math.max(0, 项.普通属性秒伤) + Math.max(0, 项.特效秒伤)),
    ),
  }
  const 列: ColumnsType<同部位对比结果> = [
    {
      title: '装备',
      key: '装备',
      width: 260,
      render: (_, 项) => <装备名称 装备={项} />,
    },
    {
      title: '品',
      dataIndex: '装备品级',
      key: '装备品级',
      width: 70,
    },
    {
      title: '属性简介',
      key: '属性简介',
      width: 270,
      render: (_, 项) => <属性简介 装备={项} />,
    },
    {
      title: (
        <Tooltip title='普通属性、加速和可折算特效的容量合计，不计体质；特效跟随开关。加速仅参与容量展示，不参与本页属性秒伤和效用计算。'>
          容量 ⓘ
        </Tooltip>
      ),
      dataIndex: '总容量',
      key: '总容量',
      sorter: true,
      sortOrder: 排序 === '总容量' ? (降序 ? 'descend' : 'ascend') : null,
      width: 260,
      render: (_, 项) => <容量条 装备={项} 最大容量={最大容量} />,
    },
    {
      title: (
        <Tooltip title='固定当前循环与总加速，计算该部位本体属性及可折算属性特效的秒伤贡献，特效跟随开关。不含无法折算容量的装备特效，不代表实际换装后的总 DPS。'>
          属性秒伤 ⓘ
        </Tooltip>
      ),
      dataIndex: '属性秒伤贡献',
      key: '属性秒伤贡献',
      sorter: true,
      sortOrder: 排序 === '属性秒伤贡献' ? (降序 ? 'descend' : 'ascend') : null,
      width: 220,
      render: (_, 项) => <秒伤条 装备={项} 范围={秒伤范围} />,
    },
    {
      title: (
        <Tooltip title='候选装备的属性秒伤减去当前装备的属性秒伤。正数表示本页固定条件下的属性贡献更高，不代表换装后的实际 DPS 变化。'>
          属性秒伤差 ⓘ
        </Tooltip>
      ),
      dataIndex: '相比当前',
      key: '相比当前',
      sorter: true,
      sortOrder: 排序 === '相比当前' ? (降序 ? 'descend' : 'ascend') : null,
      width: 140,
      align: 'right',
      render: (值: number) => (
        <span className={值 > 0 ? styles.增加 : 值 < 0 ? styles.减少 : undefined}>
          {值 > 0 ? '+' : ''}
          {格式化数值(值)}
        </span>
      ),
    },
    {
      title: (
        <Tooltip title='按配装器换装规则，计算候选装备相对页面当前配装的总 DPS 变化：计入加速、装备特效及套装变化，按当前所选循环重新匹配加速档位。候选按满精炼，镶嵌按新装备孔属性继承当前等级，缺失等级用 8 级。本列不受属性分析的特效开关影响，也不参与效用系数计算。'>
          实际秒伤差 ⓘ
        </Tooltip>
      ),
      dataIndex: '实际秒伤差',
      key: '实际秒伤差',
      sorter: true,
      sortOrder: 排序 === '实际秒伤差' ? (降序 ? 'descend' : 'ascend') : null,
      width: 140,
      align: 'right',
      render: (值: number | null, 项) =>
        值 === null ? (
          <Tooltip title={项.实际秒伤说明}>无法计算</Tooltip>
        ) : (
          <span className={值 > 0 ? styles.增加 : 值 < 0 ? styles.减少 : undefined}>
            {值 > 0 ? '+' : ''}
            {格式化数值(值)}
          </span>
        ),
    },
    {
      title: '效用系数',
      key: '效用系数',
      sorter: true,
      sortOrder: 排序 === '效用系数' ? (降序 ? 'descend' : 'ascend') : null,
      width: 110,
      align: 'right',
      render: (_, 项) =>
        项.效用系数 === null ? (
          <Tooltip title={项.不可比较原因.join('；')}>—</Tooltip>
        ) : (
          <strong>{项.效用系数.toFixed(2)}</strong>
        ),
    },
  ]
  return (
    <Modal
      open
      title={`${参数.来源.名称} - 同部位装备对比`}
      width={'90%'}
      footer={null}
      centered
      onCancel={onClose}
      className={styles.弹窗}
    >
      <Alert
        type='info'
        showIcon
        message='属性收益与实际换装收益分开比较'
        description={
          <>
            <div>
              属性秒伤、属性秒伤差与效用：固定当前循环与总加速，排除无法折算容量或数值待确认的特效。
              {参数.包含特效 ? '计入可折算的单件属性特效。' : '不计入单件装备特效。'}
              附魔、镶嵌、五彩石、套装保持不变；精炼沿用当前部位等级，超过候选上限时取上限。效用
              1.00 参照当前配装的平均单位容量收益，筛选不改变基准。这些数值不代表实际换装后的 DPS
              变化。
            </div>
            <div>
              实际秒伤差：沿用配装器换装规则，计入加速、装备特效及套装变化，按当前所选循环重算。
              候选按满精炼，镶嵌继承当前等级，缺失等级用 8 级；不受属性分析的特效开关影响。
            </div>
          </>
        }
      />
      <div className={styles.当前装备}>
        <span>当前：</span>
        <strong>{参数.来源.说明}</strong>
        {当前 && (
          <>
            <span>属性秒伤 {格式化数值(当前.属性秒伤贡献)} DPS</span>
            <span>效用 {当前.效用系数?.toFixed(2) ?? '—'}</span>
          </>
        )}
      </div>
      <div className={styles.筛选栏}>
        <Input
          aria-label='搜索装备名称'
          placeholder='搜索装备名称'
          allowClear
          value={名称}
          onChange={(事件) => 设置名称(事件.target.value)}
        />
        <Select
          aria-label='品级筛选'
          mode='multiple'
          placeholder='全部品级'
          allowClear
          maxTagCount='responsive'
          value={品级}
          onChange={设置品级}
          options={筛选选项.品级}
        />
        <Select
          aria-label='类型筛选'
          mode='multiple'
          placeholder='全部类型'
          allowClear
          maxTagCount='responsive'
          value={类型}
          onChange={设置类型}
          options={筛选选项.类型}
        />
        <Select
          aria-label='属性筛选'
          mode='multiple'
          placeholder='包含属性'
          allowClear
          maxTagCount='responsive'
          value={属性}
          onChange={设置属性}
          options={筛选选项.属性}
        />
        <div className={styles.排序栏}>
          <Select
            aria-label='排序依据'
            value={排序}
            onChange={设置排序}
            options={排序选项.map((项) => ({ ...项 }))}
          />
          <Tooltip title={降序 ? '当前降序，点击切换为升序' : '当前升序，点击切换为降序'}>
            <Button
              aria-label={降序 ? '切换为升序' : '切换为降序'}
              icon={降序 ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
              onClick={() => 设置降序(!降序)}
            />
          </Tooltip>
        </div>
      </div>
      {状态.错误 ? (
        <Alert type='error' showIcon message={状态.错误} />
      ) : (
        <>
          <div className={styles.计算进度} aria-live='polite'>
            {状态.计算中
              ? `正在计算 ${状态.结果.length}/${状态.总数}，排序随结果更新`
              : `已计算 ${状态.总数} 件，筛选后 ${列表.length} 件`}
            {状态.计算中 && (
              <Progress
                size='small'
                showInfo={false}
                percent={状态.总数 ? (状态.结果.length / 状态.总数) * 100 : 0}
              />
            )}
          </div>
          <div className={styles.容量图例}>
            {容量分段.map(({ 字段, 名称 }) => (
              <span key={字段}>
                <i className={styles[字段]} />
                {名称}
              </span>
            ))}
            {秒伤分段.map(({ 字段, 名称 }) => (
              <span key={字段}>
                <i className={styles[字段]} />
                {名称}
              </span>
            ))}
          </div>
          <Table
            size='small'
            rowKey='id'
            columns={列}
            dataSource={列表}
            sortDirections={['descend', 'ascend', 'descend']}
            showSorterTooltip={{ target: 'sorter-icon' }}
            onChange={(_分页, _筛选, 结果, { action }) => {
              if (
                action === 'sort' &&
                !Array.isArray(结果) &&
                (结果.columnKey === '相比当前' ||
                  结果.columnKey === '实际秒伤差' ||
                  结果.columnKey === '效用系数' ||
                  结果.columnKey === '总容量' ||
                  结果.columnKey === '属性秒伤贡献')
              ) {
                设置排序(结果.columnKey)
                设置降序(结果.order === 'descend')
              }
            }}
            scroll={{ x: 1470, y: '48vh' }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: [20, 50, 100],
              showTotal: (总数) => `共 ${总数} 件`,
            }}
            locale={{ emptyText: 状态.计算中 ? '正在计算候选装备…' : '没有符合筛选条件的装备' }}
          />
        </>
      )}
    </Modal>
  )
}

export default 同部位对比
