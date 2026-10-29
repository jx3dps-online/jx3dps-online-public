import { useEffect, useState } from 'react'
import { Button, Checkbox, Radio, Select, Tooltip } from 'antd'
import type { 加速阈值分组, 加速阈值结果 } from '@/@types/加速阈值'
import { 获取主要加速阈值 } from '@/数据/加速阈值'
import styles from './index.module.less'

type 加速阈值选择属性 = {
  阈值列表: 加速阈值分组[]
  展示方式?: '下拉框' | '平铺'
  可清空?: boolean
  disabled?: boolean
} & (
  | { 多选: true; value?: string[]; onChange?: (值: string[]) => void }
  | { 多选?: false; value?: string; onChange?: (值: string | undefined) => void }
)

function 加速阈值选择(props: 加速阈值选择属性) {
  const { 阈值列表, 展示方式 = '下拉框', 可清空 = true, disabled } = props
  const [显示全部, 设置显示全部] = useState(false)

  const 来源标识 = 阈值列表.map((组) => `${组.配置.标识}:${!!组.配置.主要}`).join('|')

  useEffect(() => 设置显示全部(false), [来源标识])

  const 主要分组 = 获取主要加速阈值(阈值列表)

  const 展示分组 = 显示全部
    ? [...主要分组, ...阈值列表.filter((组) => !主要分组.includes(组))]
    : 主要分组

  const 有其他阈值 = 主要分组.length < 阈值列表.length
  const 可见标识 = new Set(展示分组.flatMap((组) => 组.档位.map((项) => 项.标识)))
  const 选项说明 = (组: 加速阈值分组, 项: 加速阈值结果) =>
    `${组.配置.名称}：${(项.实际帧数 / 16).toFixed(2)} 秒；加速 ${项.加速值} ≤ 数值${
      Number.isFinite(项.下一加速值) ? ` < ${项.下一加速值}` : ''
    }${组.配置.备注 ? `；${组.配置.备注}` : ''}`
  const 标签 = (组: 加速阈值分组, 项: 加速阈值结果) =>
    组.标准GCD
      ? `${项.加速值} (${项.加速档位}段)`
      : `${项.加速值} (${(项.实际帧数 / 16).toFixed(2)}秒)`
  const 分组名 = (组: 加速阈值分组) => `${组.配置.名称}`
  const 全部标签 = new Map(
    阈值列表.flatMap((组) =>
      组.档位.map((项) => [项.标识, `${组.配置.名称} · ${标签(组, 项)}`] as const),
    ),
  )
  const 切换按钮 = 有其他阈值 && (
    <Button block type='dashed' disabled={disabled} onClick={() => 设置显示全部(!显示全部)}>
      {显示全部 ? '仅看主要阈值' : '查看全部阈值'}
    </Button>
  )

  if (展示方式 === '下拉框') {
    return (
      <Select
        className={styles.下拉框}
        popupMatchSelectWidth={360}
        classNames={{ popup: { root: styles.下拉列表 } }}
        virtual={false}
        mode={props.多选 ? 'multiple' : undefined}
        value={props.value}
        labelRender={({ value, label }) => 全部标签.get(String(value)) ?? label}
        disabled={disabled}
        allowClear={可清空}
        showSearch
        optionFilterProp='搜索内容'
        placeholder={props.多选 ? '选择需要的阈值' : '选择阈值'}
        popupRender={(菜单) => (
          <>
            {菜单}
            {有其他阈值 && (
              <div className={styles.菜单底部} onMouseDown={(事件) => 事件.preventDefault()}>
                {切换按钮}
              </div>
            )}
          </>
        )}
        onChange={(值) =>
          props.多选 ? props.onChange?.(值 as string[]) : props.onChange?.(值 as string | undefined)
        }
        options={展示分组.map((组) => ({
          label: 分组名(组),
          options: 组.档位.map((项) => ({
            value: 项.标识,
            label: 全部标签.get(项.标识),
            title: 选项说明(组, 项),
            搜索内容: `${组.配置.名称} ${标签(组, 项)} ${组.配置.备注 || ''}`,
          })),
        }))}
      />
    )
  }

  const 内容 = 展示分组.map((组) => (
    <div className={styles.分组} key={组.配置.标识}>
      <div className={styles.标题}>{分组名(组)}</div>
      {组.配置.备注 && <div className={styles.备注}>{组.配置.备注}</div>}
      <div className={styles.选项}>
        {组.档位.map((项) => (
          <Tooltip key={项.标识} title={选项说明(组, 项)}>
            {props.多选 ? (
              <Checkbox value={项.标识}>{标签(组, 项)}</Checkbox>
            ) : (
              <Radio value={项.标识}>{标签(组, 项)}</Radio>
            )}
          </Tooltip>
        ))}
      </div>
    </div>
  ))
  return (
    <>
      {props.多选 ? (
        <Checkbox.Group
          className={styles.平铺}
          disabled={disabled}
          value={props.value}
          onChange={(值) =>
            props.onChange?.([
              ...(props.value || []).filter((标识) => !可见标识.has(标识)),
              ...(值 as string[]),
            ])
          }
        >
          {内容}
        </Checkbox.Group>
      ) : (
        <Radio.Group
          className={styles.平铺}
          disabled={disabled}
          value={props.value}
          onChange={(事件) => props.onChange?.(事件.target.value)}
        >
          {内容}
        </Radio.Group>
      )}
      {有其他阈值 && <div className={styles.切换范围}>{切换按钮}</div>}
    </>
  )
}

export default 加速阈值选择
