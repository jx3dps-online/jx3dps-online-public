import { Alert, Collapse, Table, Tag } from 'antd'
import type { 批量计算结果, 计算进度 } from './类型'
import styles from './index.module.less'

const 序列配色 = [
  'blue',
  'purple',
  'orange',
  'cyan',
  'magenta',
  'green',
  'geekblue',
  'volcano',
  'gold',
  'red',
]

export default function 计算结果({
  结果,
  记录,
  选中索引,
  更新选中索引,
}: {
  结果?: 批量计算结果
  记录: 计算进度[]
  选中索引: number[]
  更新选中索引: (索引: number[]) => void
}) {
  const 失败数 = 记录.filter((项) => 项.错误).length
  const 最终详情 = 结果?.循环.循环详情 || []
  const 序列颜色 = new Map(
    [...new Set(记录.map((项) => 项.序列名称))].map((名称, 索引) => [
      名称,
      序列配色[索引 % 序列配色.length],
    ]),
  )
  return (
    <>
      {失败数 > 0 && (
        <Alert
          type='warning'
          showIcon
          message={`${失败数} 轮模拟失败，已排除；下载仅包含成功且胜出的档位。`}
        />
      )}
      {结果 && (
        <>
          <span>
            已选择 {选中索引.length} / {最终详情.length} 项。取消勾选的结果不会导出，可重新勾选。
          </span>
          <Table
            className={styles.结果表}
            size='small'
            pagination={false}
            dataSource={最终详情.map((详情, 索引) => ({ ...详情, key: 索引 }))}
            rowKey='key'
            rowSelection={{
              selectedRowKeys: 选中索引,
              onChange: (键) => 更新选中索引(键 as number[]),
            }}
            columns={[
              {
                title: '胜出序列',
                dataIndex: '技能序列名称',
                render: (名称: string) => <Tag color={序列颜色.get(名称)}>{名称}</Tag>,
              },
              { title: '保存加速范围', render: (_, 项) => `[${项.循环加速值范围?.join(', ')})` },
              { title: '保存延迟（帧）', dataIndex: '循环延迟要求' },
              {
                title: '快照 DPS',
                dataIndex: '模拟器快照秒伤',
                render: (值) => 值?.toLocaleString('zh-CN'),
              },
            ]}
          />
        </>
      )}
      {记录.length > 0 && (
        <Collapse
          items={[
            {
              key: 'log',
              label: '全部模拟记录与失败原因',
              children: (
                <Table
                  size='small'
                  dataSource={记录}
                  rowKey={(_, i) => String(i)}
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: '序列',
                      dataIndex: '序列名称',
                      render: (名称: string) => <Tag color={序列颜色.get(名称)}>{名称}</Tag>,
                    },
                    { title: '采样加速', dataIndex: '加速' },
                    { title: '延迟（帧）', dataIndex: '延迟' },
                    {
                      title: '快照 DPS',
                      render: (_, 项) => 项.详情?.模拟器快照秒伤?.toLocaleString('zh-CN') || '—',
                    },
                    {
                      title: '结果',
                      render: (_, 项) => {
                        if (项.错误) return 项.错误
                        const 索引 = 最终详情.findIndex(
                          (详情) =>
                            详情.技能序列名称 === 项.序列名称 &&
                            Number(详情.循环加速值范围?.[0]) === 项.加速 &&
                            Number(详情.循环延迟要求) === 项.延迟,
                        )
                        const 保留 = 选中索引.includes(索引)
                        return (
                          <Tag color={索引 < 0 ? 'blue' : 保留 ? 'green' : 'default'}>
                            {索引 < 0 ? '成功' : 保留 ? '已选用' : '已排除'}
                          </Tag>
                        )
                      },
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      )}
    </>
  )
}
