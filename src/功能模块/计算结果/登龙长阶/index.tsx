import React from 'react'
import { use报告引导界面 } from '@/功能模块/新手引导/界面状态'
import 详情弹窗 from './组件/详情弹窗'
import { lazy, Suspense, useState } from 'react'
import { Button, Select, Spin, Tag, Tooltip } from 'antd'
import {
  AimOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  FlagOutlined,
  HistoryOutlined,
  RiseOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  TrophyOutlined,
  WarningFilled,
} from '@ant-design/icons'
import 管理弹窗 from './组件/管理弹窗/index'
import 新建目标弹窗 from './组件/新建目标弹窗/index'
import 登阶成长展示 from './心法展示'
import { 可主动踏天 } from './踏天/计算'
import { 踏天目标id } from './踏天/类型'
import use登阶页面 from './hooks/use登阶页面'
import 成长足迹 from './组件/成长足迹'
import 提升建议 from './组件/提升建议'
import type { 登阶建议 } from './领域/类型'
import { 数字 } from './领域/格式化'
import { 获取文案, 填充文案, 武器类型显示 } from './文案'
import './index.less'
import './踏天/index.less'

const 踏天境界 = lazy(() => import('./踏天/境界'))

// 筛选值与领域比较保持代码常量，展示文案由字典提供，避免心法覆盖后联动失效。
const 建议筛选列表 = [
  { 值: '全部', 键: '通用.全部' },
  { 值: '养成补强', 键: '主卡.建议.筛选.养成补强' },
  { 值: '装备获取', 键: '主卡.建议.筛选.装备获取' },
  { 值: '武器进阶', 键: '主卡.建议.筛选.武器进阶' },
] as const

export default function 登龙长阶() {
  const {
    名称,
    计划,
    聚焦目标,
    切换聚焦,
    创建目标,
    读取错误,
    当前,
    踏天中,
    推荐,
    参考,
    目标,
    可切换目标,
    管理,
    设置管理,
    入境中,
    主卡,
    显示足迹,
    设置显示足迹,
    详情,
    设置详情,
    差异筛选,
    设置差异筛选,
    查看认可差异,
    设置查看认可差异,
    筛选,
    设置筛选,
    结果,
    目标循环显示名,
    当前武器类型,
    不匹配原因,
    结果匹配,
    分析,
    错误,
    忙碌,
    完成度结果,
    当前秒伤,
    目标秒伤,
    秒伤可比,
    差距,
    起点秒伤,
    本程提升,
    主动完成记录,
    主动完成有效,
    踏天已完成,
    展示完成度,
    展示达成,
    可开启,
    初窥门径,
    达成文案,
    待评估原因,
    差距样式,
    差距文案,
    建议,
    展示建议,
    建议上限,
    安全操作,
    打开配装器,
    编辑目标,
    计划有变,
    拿下,
    计算差异提升,
    替换目标,
    另存试配,
    开启踏天,
    标记合意,
    坚持本心,
    撤销合意,
    我已踏天,
    确认离开,
    更新踏天路线,
    主题样式,
    足迹,
    差异分组,
    当前与目标循环不一致,
  } = use登阶页面()
  const 文案 = 获取文案(名称)
  const [新建目标弹窗展示, 设置新建目标弹窗展示] = useState(false)
  use报告引导界面('目标管理打开', 管理)
  use报告引导界面('目标命名打开', 新建目标弹窗展示)
  use报告引导界面(
    '可沿用目标',
    当前 && 目标 && !踏天中 && !不匹配原因 && !读取错误 && !待评估原因 && !错误 ? 目标.id : '',
  )
  const 渲染建议 = (item: 登阶建议, i: number) => (
    <提升建议
      key={item.id}
      item={item}
      i={i}
      踏天中={踏天中}
      当前秒伤={当前秒伤}
      忙碌={忙碌}
      拿下={拿下}
      计划有变={计划有变}
      替换目标={替换目标}
      坚持本心={坚持本心}
    />
  )
  return (
    <section
      id='Guide_目标进度'
      ref={主卡}
      className={'dragon-stair' + (踏天中 ? ' dragon-heaven' : '')}
      aria-label={踏天中 ? 文案['主卡.标题.踏天'] : 文案['登阶.名称']}
      style={主题样式}
    >
      <header className='dragon-header'>
        <div className='dragon-heading'>
          <span className='dragon-seal' aria-hidden='true'>
            <RiseOutlined />
          </span>
          <div>
            <h2>{踏天中 ? 文案['主卡.标题.踏天'] : 文案['登阶.名称']}</h2>
            {/* <p>{踏天中 ? '此去无定式，一刃问天高。' : '每一步，都更近一步。'}</p> */}
          </div>
        </div>
        <div className='dragon-header-actions'>
          {可切换目标.length > 0 && (
            <Select
              aria-label={文案['主卡.目标选择.aria']}
              value={计划.聚焦id || 目标?.id}
              popupMatchSelectWidth={false}
              className='dragon-target-select'
              showSearch
              filterOption={(输入, 选项) => !!选项 && ((选项 as any).搜索文本 || '').includes(输入)}
              options={[
                ...可切换目标.map((项) => ({
                  value: 项.id,
                  搜索文本: 项.名称,
                  label: (
                    <span className='dragon-target-option'>
                      {武器类型显示(文案, 项.标记)} · {项.名称}
                      {项.循环失效 ? <Tag color='red'>{文案['主卡.目标选择.循环失效']}</Tag> : null}
                    </span>
                  ),
                })),
                ...(计划.踏天
                  ? [
                      {
                        value: 踏天目标id(计划.踏天.路线),
                        label: (
                          <span className='dragon-target-option'>
                            {填充文案(文案['主卡.目标选择.踏天参考'], {
                              路线: 武器类型显示(文案, 计划.踏天.路线),
                            })}
                          </span>
                        ),
                      },
                    ]
                  : []),
              ]}
              onChange={(id) => 切换聚焦(id)}
            />
          )}
          {当前 && 目标 && !不匹配原因 && !踏天中 && (
            <Button ghost onClick={计划有变}>
              {文案['通用.更新目标']}
            </Button>
          )}
          <Button
            id='Guide_目标管理'
            ghost
            icon={<SettingOutlined />}
            onClick={() => 设置管理(true)}
          >
            {文案['通用.目标管理']}
          </Button>
        </div>
      </header>
      {读取错误 && (
        <p className='dragon-warning' role='alert'>
          {读取错误}
        </p>
      )}
      {踏天中 && !目标 ? (
        <div className='dragon-onboarding' role='status'>
          <h3>
            {推荐.加载中 ? 文案['主卡.踏天空态.标题.加载中'] : 文案['主卡.踏天空态.标题.待维护']}
          </h3>
          <p>{推荐.错误 || 文案['主卡.踏天空态.说明']}</p>
          <Button ghost onClick={() => 设置管理(true)}>
            {文案['主卡.按钮.管理目标']}
          </Button>
        </div>
      ) : !当前 || !目标 ? (
        <div className='dragon-onboarding'>
          <div className='dragon-empty-art' aria-hidden='true'>
            <i />
            <i />
            <i />
            <FlagOutlined />
          </div>
          <h3>{当前 ? 文案['主卡.空态.标题.有当前'] : 文案['主卡.空态.标题.无当前']}</h3>
          <p>{文案['主卡.空态.说明']}</p>
          <div className='dragon-onboarding-steps'>
            <div className={当前 ? 'is-done' : ''}>
              <b>{当前 ? <CheckOutlined /> : '01'}</b>
              <span>
                {文案['主卡.空态.步骤1.标题']}
                <small>{文案['主卡.空态.步骤1.说明']}</small>
              </span>
            </div>
            <ArrowRightOutlined />
            <div className={目标 ? 'is-done' : ''}>
              <b>{目标 ? <CheckOutlined /> : '02'}</b>
              <span>
                {文案['主卡.空态.步骤2.标题']}
                <small>{文案['主卡.空态.步骤2.说明']}</small>
              </span>
            </div>
          </div>
          <Button
            type='primary'
            size='large'
            icon={<AimOutlined />}
            onClick={() => (当前 ? 设置新建目标弹窗展示(true) : 打开配装器())}
          >
            {当前 ? 文案['主卡.按钮.新建目标'] : 文案['主卡.按钮.去配装器']}
          </Button>
          <Button type='link' onClick={() => 设置管理(true)}>
            {文案['主卡.按钮.查看与管理目标']}
          </Button>
          <div className='dragon-local-note'>{文案['主卡.空态.本地说明']}</div>
        </div>
      ) : (
        <>
          {不匹配原因 ? (
            <div className='dragon-onboarding dragon-mismatch' role='status'>
              <div className='dragon-empty-art' aria-hidden='true'>
                <i />
                <i />
                <i />
                <FlagOutlined />
              </div>
              <span className='dragon-eyebrow'>{文案['主卡.不匹配.眉题']}</span>
              <h3>{文案['主卡.不匹配.标题']}</h3>
              <p>{不匹配原因}</p>
              <Button
                type='primary'
                size='large'
                icon={<AimOutlined />}
                onClick={() => 设置管理(true)}
              >
                {文案['主卡.按钮.前往管理目标']}
              </Button>
              <Button type='link' onClick={打开配装器}>
                {文案['主卡.按钮.更新配装']}
              </Button>
            </div>
          ) : (
            <>
              <登阶成长展示
                心法={名称}
                目标名称={目标.名称}
                目标循环显示名={目标循环显示名}
                当前名称={当前.名称}
                更新时间={当前.时间}
                完成数={分析?.完成数 || 0}
                总数={分析?.总数 || 0}
                忙碌={忙碌}
                本程提升={本程提升}
                完成度={展示完成度}
                是否达成={展示达成}
              />
              {忙碌 && !分析 && (
                <div className='dragon-calculating' role='status'>
                  <Spin size='small' /> {文案['主卡.计算中']}
                </div>
              )}
              {错误 && (
                <p className='dragon-warning' role='alert'>
                  {错误}
                </p>
              )}
              {踏天中 && 参考 && (
                <Suspense fallback={<p className='dragon-muted'>{文案['主卡.境界加载中']}</p>}>
                  <踏天境界
                    比例={结果匹配 && !不匹配原因 ? 完成度结果?.秒伤比例 : undefined}
                    门槛秒伤={结果匹配 ? 结果?.门槛秒伤 : undefined}
                    门槛循环={参考.门槛.循环?.名称 || ''}
                    已完成={!!踏天已完成}
                    主动完成时间={主动完成有效 ? 主动完成记录?.时间 : undefined}
                    历史完成时间={!主动完成有效 ? 主动完成记录?.时间 : undefined}
                    可完成={
                      结果匹配 && !不匹配原因 && !踏天已完成 && 可主动踏天(当前秒伤, 目标秒伤)
                    }
                    on完成={我已踏天}
                  />
                </Suspense>
              )}
              {分析 && (
                <>
                  <div className='dragon-metrics'>
                    <div>
                      <span className='dragon-metrics-title'>{文案['主卡.指标.当前DPS']}</span>
                      <strong>
                        {数字(当前秒伤, 文案['通用.待评估'])}
                        {当前与目标循环不一致 ? (
                          <span>
                            <Tooltip
                              title={
                                <div>
                                  <p>{文案['主卡.循环提示.第一行']}</p>
                                  <p>{文案['主卡.循环提示.第二行']}</p>
                                  {踏天中 ? (
                                    <p>{文案['主卡.循环提示.踏天中']}</p>
                                  ) : (
                                    <p>{文案['主卡.循环提示.普通']}</p>
                                  )}
                                </div>
                              }
                            >
                              <WarningFilled
                                style={{ fontSize: 24, color: 'orange', marginLeft: 12 }}
                              />
                            </Tooltip>
                          </span>
                        ) : null}
                      </strong>
                    </div>
                    <div>
                      <span className='dragon-metrics-title'>
                        {踏天中 ? 文案['主卡.指标.踏天境'] : 文案['主卡.指标.目标DPS']}
                      </span>
                      <strong>
                        {踏天中 ? 文案['主卡.指标.踏天未知'] : 数字(目标秒伤, 文案['通用.待评估'])}
                      </strong>
                    </div>
                    <div className={`dragon-metric-gold ${差距样式}`}>
                      <span className='dragon-metrics-title'>
                        {踏天中 ? 文案['主卡.指标.距参考秒伤'] : 差距文案.标题}
                      </span>
                      <strong>
                        {踏天中
                          ? 秒伤可比
                            ? 当前秒伤! >= 目标秒伤!
                              ? 文案['主卡.指标.超越']
                              : ((1 - 当前秒伤! / 目标秒伤!) * 100).toFixed(1) + '%'
                            : 文案['通用.待评估']
                          : 差距文案.值}
                      </strong>
                    </div>
                  </div>
                  {待评估原因 && (
                    <p className='dragon-warning' role='status'>
                      {待评估原因}
                    </p>
                  )}
                  {秒伤可比 && 完成度结果?.秒伤比例 !== undefined && (
                    <p className='dragon-legacy-route'>
                      {填充文案(文案['主卡.进度.提升进度'], {
                        比例: 完成度结果.秒伤比例.toFixed(1),
                      })}
                    </p>
                  )}
                  <div className='dragon-categories' aria-label={文案['主卡.进度.aria']}>
                    {分析.分类进度.map((item) => (
                      <button
                        key={item.名称}
                        className={item.总数 > 0 && item.完成数 === item.总数 ? 'is-done' : ''}
                        onClick={() => {
                          设置差异筛选(item.名称)
                          设置详情('差异')
                        }}
                      >
                        <span>{item.名称}</span>
                        <b>
                          {item.总数 ? `${item.完成数}/${item.总数}` : '—'}
                          {item.总数 > 0 && item.完成数 === item.总数 && <CheckOutlined />}
                        </b>
                        <div>
                          <i
                            style={{ width: `${item.总数 ? (item.完成数 / item.总数) * 100 : 0}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                  {展示达成 ? (
                    <div className='dragon-achievement' role='status'>
                      <TrophyOutlined />
                      <div>
                        <b>
                          {踏天中
                            ? 文案['主卡.达成.踏天']
                            : 初窥门径
                              ? 文案['主卡.达成.初窥']
                              : 文案['主卡.达成.普通']}
                        </b>
                        <p>{达成文案}</p>
                      </div>
                      {!踏天中 && 可开启 && (
                        <Button ghost loading={入境中} onClick={开启踏天}>
                          {文案['主卡.按钮.开启踏天']}
                        </Button>
                      )}
                      {!踏天中 && 计划.踏天 && (
                        <Button
                          ghost
                          onClick={() =>
                            安全操作(
                              () => 聚焦目标(踏天目标id(计划.踏天!.路线)),
                              文案['通用.已回到踏天之路'],
                            )
                          }
                        >
                          {文案['主卡.按钮.回到踏天']}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className='dragon-recommendations'>
                      <div className='dragon-section-heading'>
                        <div className='dragon-section-heading-main'>
                          <h3>{文案['主卡.建议.标题']}</h3>
                          <button
                            className='dragon-text-button'
                            onClick={() => {
                              设置差异筛选('全部')
                              设置详情('差异')
                            }}
                          >
                            <UnorderedListOutlined />
                            {文案['通用.目标差异']}
                            <span className='dragon-count'>{分析.差异.length}</span>
                          </button>
                        </div>
                        <Select
                          aria-label={文案['主卡.建议.筛选.aria']}
                          value={筛选}
                          onChange={设置筛选}
                          options={建议筛选列表.map((项) => ({
                            value: 项.值,
                            label: 文案[项.键],
                          }))}
                        />
                      </div>
                      {展示建议.length ? (
                        <div className='dragon-suggestion-grid'>{展示建议.map(渲染建议)}</div>
                      ) : (
                        <p className='dragon-muted'>{文案['主卡.建议.空态']}</p>
                      )}
                      <div className='dragon-more-row'>
                        {建议.length > 建议上限 && (
                          <button
                            className='dragon-text-button dragon-more'
                            onClick={() => 设置详情('建议')}
                          >
                            {填充文案(文案['主卡.建议.更多'], { 数量: 建议.length })}{' '}
                            <ArrowRightOutlined />
                          </button>
                        )}
                        <button
                          className='dragon-text-button dragon-more'
                          onClick={() => 设置显示足迹(true)}
                        >
                          <HistoryOutlined />
                          {文案['通用.成长足迹']}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      <新建目标弹窗
        open={新建目标弹窗展示}
        onClose={() => 设置新建目标弹窗展示(false)}
        创建目标={创建目标}
      />
      <管理弹窗
        open={管理}
        onClose={() => 设置管理(false)}
        新增目标={() => {
          设置管理(false)
          设置新建目标弹窗展示(true)
        }}
        编辑目标={编辑目标}
        切换聚焦={切换聚焦}
        踏天目标区域={
          计划.踏天 ? (
            <article className='dragon-manager-goal dragon-heaven-goal'>
              <div className='dragon-manager-goal-copy'>
                <Tag color={'red'}>{文案['主卡.踏天管理.标签']}</Tag>
                <strong>
                  {' '}
                  {填充文案(文案['主卡.踏天管理.锁定'], {
                    路线: 武器类型显示(文案, 计划.踏天.路线),
                  })}
                </strong>
                <p>
                  {推荐.错误 ? 文案['主卡.踏天空态.标题.待维护'] : 推荐.配置?.版本} ·{' '}
                  {推荐.配置?.维护人}
                </p>
                <small>
                  {/* {推荐.配置?.校验时间} ·  */}
                  {填充文案(文案['主卡.踏天管理.进入'], {
                    日期: new Date(计划.踏天.进入时间).toLocaleDateString('zh-CN'),
                  })}
                </small>
              </div>
              <div className='dragon-manager-goal-actions'>
                {!踏天中 && (
                  <Button
                    size='small'
                    type='primary'
                    danger
                    onClick={() =>
                      安全操作(
                        () => 聚焦目标(踏天目标id(计划.踏天!.路线)),
                        文案['通用.已切换到该目标'],
                      )
                    }
                  >
                    {文案['通用.切换到该目标']}
                  </Button>
                )}
                {参考 && (
                  <Button
                    size='small'
                    onClick={() => 另存试配(参考.目标.装备, 参考.目标.名称, 参考.目标.循环)}
                  >
                    {文案['主卡.踏天管理.载入']}
                  </Button>
                )}
                {当前 && (当前武器类型 === '橙武' ? '橙武' : '紫武') !== 计划.踏天.路线 && (
                  <Button size='small' onClick={更新踏天路线}>
                    {文案['主卡.踏天管理.更新路线']}
                  </Button>
                )}
                <Button size='small' type='text' onClick={确认离开}>
                  {文案['主卡.踏天管理.离开']}
                </Button>
              </div>
            </article>
          ) : undefined
        }
      />

      <详情弹窗
        当前={当前}
        踏天中={踏天中}
        目标={目标}
        详情={详情}
        设置详情={设置详情}
        差异筛选={差异筛选}
        设置差异筛选={设置差异筛选}
        查看认可差异={查看认可差异}
        设置查看认可差异={设置查看认可差异}
        结果={结果}
        不匹配原因={不匹配原因}
        分析={分析}
        错误={错误}
        忙碌={忙碌}
        当前秒伤={当前秒伤}
        建议={建议}
        计划有变={计划有变}
        拿下={拿下}
        计算差异提升={计算差异提升}
        替换目标={替换目标}
        标记合意={标记合意}
        撤销合意={撤销合意}
        主题样式={主题样式}
        差异分组={差异分组}
        渲染建议={渲染建议}
      />

      <成长足迹
        显示足迹={显示足迹}
        设置显示足迹={设置显示足迹}
        主题样式={主题样式}
        计划={计划}
        足迹={足迹}
        另存试配={另存试配}
      />
    </section>
  )
}
