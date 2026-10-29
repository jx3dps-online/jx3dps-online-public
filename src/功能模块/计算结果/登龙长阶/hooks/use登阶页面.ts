import { 创建踏天操作 } from '../踏天/操作'
import use登阶分析 from './use登阶分析'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { message, Modal } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 装备信息数据类型 } from '@/@types/装备'
import { 应用角色状态, 获取角色状态 } from '@/store/data'
import { 切换配装器弹窗显示状态, 打开配装器 as 打开配装器弹窗 } from '@/store/system'
import { 秒伤计算, 触发秒伤计算 } from '@/计算模块/计算函数'
import type { 配装快照, 配装循环 } from '@/角色/类型'
import { use角色计划 } from '@/角色/use角色计划'
import { use目标池 } from '@/角色/use目标池'
import { 保存角色配装 } from '@/角色/状态'
import { 登阶武器类型, 登阶循环限制, 提取配装循环 } from '../领域/循环'
import {
  重建登阶装备,
  安全计算登阶秒伤,
  拿下登阶差异,
  替换目标部位,
  替换目标项,
} from '../领域/计算'
import type { 登阶差异, 登阶建议 } from '../领域/类型'
import { 计算足迹收益 } from '../领域/足迹'
import { use踏天参考, 解析踏天参考 } from '../踏天/配置'
import { 装备签名 } from '../踏天/计算'
import { 踏天目标id } from '../踏天/类型'
import { 数字 } from '../领域/格式化'
import { 获取达成文案, 获取踏天进度状态文案 } from '../领域/文案'
import { 获取文案, 填充文案 } from '../文案'

/** 编排计划、计算状态与用户操作；展示组件不直接写入计划。 */
export default function use登阶页面() {
  const 心法数据 = use心法数据()
  const { 名称, 系统配置, 计算循环 } = 心法数据
  const 文案 = 获取文案(名称)
  const dispatch = useAppDispatch()
  const 数据 = useAppSelector((state) => state.data)
  const 当前角色 = 数据.当前角色
  const { 计划, 存储: 计划存储, 读取错误 } = use角色计划(当前角色?.id)
  const { 池, 存储: 目标池存储 } = use目标池(名称)
  const 读取 = () => 计划存储?.读取() || 计划
  const 更新踏天: NonNullable<typeof 计划存储>['更新踏天'] = (预期, 踏天, 聚焦) => {
    if (!计划存储) throw new Error(文案['通用.角色计划未就绪'])
    计划存储.更新踏天(预期, 踏天, 聚焦)
  }
  const 离开踏天: NonNullable<typeof 计划存储>['离开踏天'] = (预期, 返回目标id) => {
    if (!计划存储) throw new Error(文案['通用.角色计划未就绪'])
    计划存储.离开踏天(预期, 返回目标id)
  }
  const 聚焦目标 = (id: string) => {
    if (!计划存储) throw new Error(文案['通用.角色计划未就绪'])
    计划存储.聚焦目标(id)
  }
  const 页面循环 = 提取配装循环(数据)
  const 当前: 配装快照 | undefined = 当前角色
    ? {
        装备: 数据.装备信息,
        名称: 当前角色.名称,
        时间: 数据.角色更新时间,
        循环: 页面循环,
      }
    : undefined
  const 普通目标 = 池.目标.find((item) => item.id === 计划.聚焦id) || 池.目标[0]
  const 普通目标绑定 = 计划.绑定.find((绑定) => 绑定.目标id === 普通目标?.id)
  const 踏天中 = !!计划.踏天 && 计划.聚焦id === 踏天目标id(计划.踏天.路线)
  const 推荐 = use踏天参考(
    心法数据,
    计划.踏天?.路线 || (登阶武器类型(当前?.装备) === '橙武' ? '橙武' : '紫武'),
  )
  const 参考 = 推荐.参考
  const 目标 = 踏天中 ? 参考?.目标 : 普通目标
  const 全部循环 = useMemo(
    () => [...计算循环, ...(数据.自定义循环列表 || [])],
    [计算循环, 数据.自定义循环列表],
  )
  const 可切换目标 = 池.目标.map((项) => ({
    id: 项.id,
    名称: 项.名称,
    循环失效: !!项.循环 && !全部循环.some((循环) => 循环.名称 === 项.循环?.名称),
    标记: 全部循环.find((循环) => 循环.名称 === 项.循环?.名称)?.标记,
  }))
  const [管理, 设置管理] = useState(false)
  const [入境中, 设置入境中] = useState(false)
  const 入境控制 = useRef<AbortController>()
  const 主卡 = useRef<HTMLElement>(null)
  useEffect(
    () => () => {
      入境控制.current?.abort()
    },
    [名称],
  )
  const [显示足迹, 设置显示足迹] = useState(false)
  const [详情, 设置详情] = useState<'建议' | '差异'>()
  const [差异筛选, 设置差异筛选] = useState('全部')
  const [查看认可差异, 设置查看认可差异] = useState(false)
  const [足迹结果, 设置足迹结果] = useState<{
    key: string
    列表: ReturnType<typeof 计算足迹收益>
  }>()
  const [筛选, 设置筛选] = useState('全部')
  // 建议区窄屏（<1921px）一行一个，只展示 3 条控制长度；宽屏最多 6 条。
  // 与 index.less 的 .dragon-suggestion-grid 断点保持一致。
  const [宽屏建议, 设置宽屏建议] = useState(() => window.matchMedia('(min-width: 1921px)').matches)
  useEffect(() => {
    const 媒体 = window.matchMedia('(min-width: 1921px)')
    const 同步 = () => 设置宽屏建议(媒体.matches)
    同步()
    媒体.addEventListener('change', 同步)
    return () => 媒体.removeEventListener('change', 同步)
  }, [])

  useEffect(() => {
    设置详情(undefined)
    设置管理(false)
    设置显示足迹(false)
    设置筛选('全部')
  }, [名称])
  useEffect(() => {
    设置差异筛选('全部')
    设置查看认可差异(false)
  }, [目标?.id])

  // 仅计算环境与快照变化触发重算；首页草稿 DPS 变化不重复计算整份计划。
  const 环境 = useMemo(
    () =>
      JSON.stringify([
        数据.当前计算循环名称,
        数据.当前奇穴信息,
        数据.当前秘籍信息,
        数据.增益数据,
        数据.增益启用,
        数据.当前输出计算目标名称,
        数据.网络延迟,
        数据.自定义循环列表,
        数据.团队增益轴,
      ]),
    [
      数据.当前计算循环名称,
      数据.当前奇穴信息,
      数据.当前秘籍信息,
      数据.增益数据,
      数据.增益启用,
      数据.当前输出计算目标名称,
      数据.网络延迟,
      数据.自定义循环列表,
      数据.团队增益轴,
    ],
  )
  const 结果范围 = JSON.stringify([名称, 目标?.id, 踏天中])
  const 计算key = JSON.stringify([
    名称,
    环境,
    当前,
    目标,
    普通目标绑定?.起点,
    参考?.签名,
    推荐.配置?.开启进度阈值,
    计划.踏天,
    踏天中,
  ])

  useEffect(
    () => () => {
      入境控制.current?.abort()
    },
    [计算key],
  )

  const 目标循环 = 目标?.循环
  // 页面循环用于角色快照与成长足迹：主卡片对比一律使用目标循环。
  const 当前循环 = 页面循环
  const 目标循环数据 = 目标循环 ? 全部循环.find((项) => 项.名称 === 目标循环.名称) : undefined
  const 目标循环显示名 = 目标循环数据?.标题 || 目标循环?.名称 || 文案['页面.目标循环.未设置']
  const 目标循环失效 = !!目标循环 && !目标循环数据
  const 当前武器类型 = 登阶武器类型(当前?.装备)
  const 目标武器类型 = 登阶武器类型(目标?.装备)
  const 跨大橙武 = (当前武器类型 === '橙武') !== (目标武器类型 === '橙武')
  const 不匹配原因 =
    当前 && 目标
      ? 跨大橙武
        ? 目标武器类型 === '橙武'
          ? 文案['页面.错误.目标橙武']
          : 文案['页面.错误.当前橙武']
        : 目标循环数据
          ? 登阶循环限制(当前.装备, 目标循环数据, 文案)
          : undefined
      : undefined
  const 目标循环限制 =
    目标循环数据 && 目标 ? 登阶循环限制(目标.装备, 目标循环数据, 文案) : undefined

  const 按循环计算 = (装备: 装备信息数据类型, 配置?: 配装循环) => {
    if (!配置) return undefined
    const 循环 = 全部循环.find((项) => 项.名称 === 配置.名称)
    if (登阶循环限制(装备, 循环, 文案)) return undefined
    const 值 = dispatch(
      秒伤计算({
        更新装备信息: 装备,
        更新计算循环名称: 配置.名称,
        更新奇穴数据: 配置.奇穴,
        更新秘籍信息: 配置.秘籍,
        计算技能详情: false,
      }),
    )?.秒伤
    return Number.isFinite(值) && 值 > 0 ? 值 : undefined
  }

  /** 切换聚焦：目标池内的目标建立/复用绑定（首次记起点），跨大橙武先确认；
   *  踏天虚拟目标不在池内，直接聚焦。 */
  const 切换聚焦 = (id: string) => {
    const 目标项 = 池.目标.find((项) => 项.id === id)
    if (!目标项) {
      安全操作(() => 聚焦目标(id), 文案['通用.已切换到该目标'])
      return
    }
    const 跨类型 = (当前武器类型 === '橙武') !== (登阶武器类型(目标项.装备) === '橙武')
    const 执行 = () => {
      if (!计划存储) {
        message.error(文案['通用.角色计划未就绪'])
        return
      }
      try {
        计划存储.聚焦目标(id, { 装备: 数据.装备信息, 循环: 页面循环 })
        message.success(文案['通用.已切换到该目标'])
      } catch (错误) {
        message.error(错误 instanceof Error ? 错误.message : 文案['通用.切换目标失败'])
      }
    }
    if (跨类型) {
      Modal.confirm({
        title: 文案['页面.确认.跨橙武.标题'],
        content: 文案['页面.确认.跨橙武.内容'],
        okText: 文案['页面.确认.跨橙武.确定'],
        cancelText: 文案['通用.取消'],
        onOk: 执行,
      })
      return
    }
    执行()
  }

  /** 新建目标：入池、聚焦（记起点）并打开配装器目标编辑。 */
  const 创建目标 = (名称: string, 循环: 配装循环 | undefined, 装备: 装备信息数据类型) => {
    if (!当前角色) throw new Error(文案['通用.角色未就绪'])
    if (!目标池存储) throw new Error(文案['通用.目标池未就绪'])
    if (!计划存储) throw new Error(文案['通用.角色计划未就绪'])
    const id = 目标池存储.新增目标(装备, 名称, 循环)
    计划存储.聚焦目标(id, { 装备: 数据.装备信息, 循环: 页面循环 })
    dispatch(
      打开配装器弹窗({ 入口: { 类型: '目标', 角色id: 当前角色.id, 目标id: id, 新建: true } }),
    )
    dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
  }

  const 结果 = use登阶分析({
    名称,
    当前,
    目标,
    起点: 踏天中 ? undefined : 普通目标绑定?.起点,
    目标循环,
    参考,
    计划,
    踏天中,
    跨大橙武,
    计算key,
    结果范围,
    按循环计算,
  })

  // 旧结果保留到新结果就绪（stale-while-revalidate），避免整块卸载造成高度抖动。
  const 结果匹配 = 结果?.key === 计算key
  const 分析 = 结果?.范围 === 结果范围 ? 结果?.分析 : undefined
  const 错误 = 结果匹配 ? 结果.错误 : undefined
  const 忙碌 = !!当前 && !!目标 && !结果匹配
  const 已达成 = !!分析?.总数 && 分析.完成数 === 分析.总数
  const 完成度结果 = 结果?.范围 === 结果范围 ? 结果?.完成度 : undefined
  const 完成度可算 = 完成度结果?.完成度 !== undefined
  // 目标循环缺失 / 失效 / 不满足时，差异照常展示，只把原因用于 DPS 与完成度的待评估说明。
  const 循环问题 = !目标循环
    ? 文案['页面.循环问题.未保存']
    : 目标循环失效
      ? 文案['页面.循环问题.已失效']
      : 目标循环限制
        ? 填充文案(文案['页面.循环问题.限制'], { 限制: 目标循环限制 })
        : undefined
  const 当前秒伤 = 分析?.当前秒伤
  const 目标秒伤 = 分析?.目标秒伤
  const 秒伤可比 = 当前秒伤 !== undefined && 目标秒伤 !== undefined
  const 差距 = 秒伤可比 ? 目标秒伤! - 当前秒伤! : undefined
  const 还差百分比 =
    差距 !== undefined && 差距 > 0 && 目标秒伤 ? (差距 / 目标秒伤) * 100 : undefined
  const 起点秒伤 = 结果?.起点秒伤
  const 本程提升 = 秒伤可比 && 起点秒伤 !== undefined ? 当前秒伤! - 起点秒伤 : undefined
  // 当前 / 目标 DPS 有任一方待评估（或容量不可算）时，共享层统一给 0 且不放行达成；
  // 各心法进度条只负责展示，不再自行判断待评估。
  const 主动完成记录 = 计划.踏天?.主动完成
  const 主动完成有效 =
    踏天中 &&
    !!当前 &&
    主动完成记录?.参考签名 === 参考?.签名 &&
    主动完成记录?.路线 === 计划.踏天?.路线 &&
    !!主动完成记录 &&
    装备签名(主动完成记录.配装.装备) === 装备签名(当前.装备)
  // 归真只认「我已踏天」留下的主动完成记录：进度实时计算可以到 100%，
  // 但不替代玩家点击；参考签名或配装变化时记录失效，重新评定。
  const 踏天已完成 = 踏天中 && !不匹配原因 && 主动完成有效
  const 展示完成度 = 完成度可算
    ? 踏天中
      ? Math.min(踏天已完成 ? 100 : 99.99, 完成度结果!.完成度!)
      : 已达成
        ? 100
        : Math.min(99.99, 完成度结果!.完成度!)
    : 0
  const 展示达成 = 踏天中 ? !!踏天已完成 : 已达成 && 完成度可算
  // 与 分析/完成度 同用「结果范围」守卫：重算期间沿用旧结果，按钮与文案不闪。
  const 开启进度 = 结果?.范围 === 结果范围 ? 结果?.开启进度 : undefined
  const 踏天进度状态 = 结果?.范围 === 结果范围 ? 结果?.踏天进度状态 : undefined
  const 踏天达标 = !!参考 && 开启进度 !== undefined && 开启进度 > 参考.阈值
  const 踏天未满 =
    !!参考 && ((开启进度 !== undefined && 开启进度 <= 参考.阈值) || 踏天进度状态 === '已达参考终点')
  const 可开启 = !计划.踏天 && 踏天达标
  const 初窥门径 = !计划.踏天 && 踏天未满
  const 踏天原因 =
    推荐.错误 || (踏天进度状态 ? 获取踏天进度状态文案(文案, 踏天进度状态) : undefined)
  // 达成区只保留单行文案：先按踏天进度取词（已进入踏天时也要能看出旧目标是否达标），配置异常时显示原因。
  const 达成文案 = 获取达成文案(文案, { 踏天中, 踏天达标, 踏天未满, 踏天原因 })
  const 待评估原因 = !错误 ? 循环问题 || 完成度结果?.待评估原因 : undefined
  const 差距样式 =
    差距 === undefined
      ? ''
      : 差距 < 0
        ? 'is-gold'
        : 还差百分比 === undefined
          ? ''
          : 还差百分比 > 30
            ? 'is-remain-high'
            : 还差百分比 >= 10
              ? 'is-remain-mid'
              : 'is-gold'
  const 差距文案 =
    差距 === undefined
      ? { 标题: 文案['页面.差距.还差'], 值: 文案['通用.待评估'] }
      : 差距 === 0
        ? { 标题: 文案['页面.差距.达到'], 值: '0' }
        : 差距 < 0
          ? { 标题: 文案['页面.差距.超过'], 值: '+' + 数字(Math.abs(差距), 文案['通用.待评估']) }
          : {
              标题: 文案['页面.差距.距离'],
              值:
                还差百分比 !== undefined
                  ? 填充文案(文案['页面.差距.值含百分比'], {
                      数值: 数字(差距, 文案['通用.待评估']),
                      百分比: 还差百分比.toFixed(1),
                    })
                  : 填充文案(文案['页面.差距.值'], {
                      数值: 数字(差距, 文案['通用.待评估']),
                    }),
            }
  const 建议 = (分析?.建议 || []).filter(
    (item) =>
      筛选 === '全部' ||
      (筛选 === '养成补强'
        ? !['装备', '组合', '武器'].includes(item.类别)
        : 筛选 === '武器进阶'
          ? item.类别 === '武器'
          : ['装备', '组合'].includes(item.类别)),
  )
  const 建议上限 = 宽屏建议 ? 6 : 3
  const 展示建议 = 建议.slice(0, 建议上限)
  const 安全操作 = (操作: () => unknown, 提示: string) => {
    try {
      操作()
      message.success(提示)
    } catch (e) {
      message.error(e instanceof Error ? e.message : 文案['通用.保存失败'])
    }
  }
  const 打开配装器 = () => {
    设置管理(false)
    dispatch(
      打开配装器弹窗({
        入口: 当前角色 ? { 类型: '配装', 角色id: 当前角色.id } : undefined,
      }),
    )
  }
  const 编辑目标 = (id: string) => {
    if (踏天中 || !当前角色) return
    设置详情(undefined)
    设置管理(false)
    dispatch(
      打开配装器弹窗({
        入口: { 类型: '目标', 角色id: 当前角色.id, 目标id: id },
      }),
    )
  }
  const 计划有变 = () => {
    if (!目标) return
    编辑目标(目标.id)
  }
  const 拿下 = (获取装备: () => 装备信息数据类型) => {
    if (!当前 || !目标 || !当前角色) return false
    if (忙碌) {
      message.info(文案['页面.提示.重算中'])
      return false
    }
    try {
      const 最新 = 读取()
      const 最新参考 =
        踏天中 && 推荐.配置 && 最新.踏天
          ? 解析踏天参考(推荐.配置, 心法数据, 最新.踏天.路线)
          : undefined
      const 最新目标 = 踏天中
        ? 最新参考?.目标
        : 目标池存储?.读取().目标.find((x) => x.id === 目标.id)
      if (
        JSON.stringify(最新) !== JSON.stringify(计划) ||
        JSON.stringify(最新目标) !== JSON.stringify(目标) ||
        (踏天中 && 最新参考?.签名 !== 参考?.签名)
      ) {
        message.info(文案['页面.提示.目标更新'])
        return false
      }
      const 状态 = 获取角色状态(数据)
      if (!状态) return false
      const 结果 = 保存角色配装(当前角色, {
        ...状态,
        装备信息: 重建登阶装备(获取装备()),
      })
      dispatch(应用角色状态(结果.状态))
      if (结果.警告) message.warning(结果.警告)
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
      message.success(文案['页面.提示.已达成'])
      return true
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : 文案['页面.错误.更新未保存'])
      return false
    }
  }
  /** 目标差异弹窗逐行试算：只应用该行差异后的秒伤相对当前身装的增量。 */
  const 计算差异提升 = (项: 登阶差异) => {
    if (!当前 || !目标 || 分析?.当前秒伤 === undefined) return undefined
    try {
      const 秒伤 = 安全计算登阶秒伤(拿下登阶差异(当前.装备, 目标.装备, 项, 文案), (装备) =>
        按循环计算(装备, 目标循环),
      )
      return 秒伤 !== undefined ? 秒伤 - 分析.当前秒伤 : undefined
    } catch {
      return undefined
    }
  }
  /** 当前身装已超过计划时，用身装对应部位/事项直接替换目标。 */
  const 替换目标 = (项: 登阶建议 | 登阶差异) => {
    const 存储 = 目标池存储
    if (踏天中 || !当前 || !目标 || !存储 || 忙碌) return
    const 是建议 = '装备信息' in 项
    if (是建议 && !项.id.startsWith('equip-')) return
    const 部位 = 是建议 ? 项.id.slice('equip-'.length) : 项.部位
    安全操作(
      () => {
        const 新目标 = 是建议
          ? 替换目标部位(目标.装备, 当前.装备, 部位, 文案)
          : 替换目标项(目标.装备, 当前.装备, 项, 文案)
        存储.更新目标(目标.id, 新目标, 目标.循环, 目标)
      },
      填充文案(文案['页面.提示.已替换目标'], { 部位 }),
    )
  }
  const 另存试配 = (装备: 装备信息数据类型, 标签: string, 循环?: 配装循环) => {
    try {
      const 新装备 = 重建登阶装备(装备)
      设置管理(false)
      dispatch(
        打开配装器弹窗({
          入口: 当前角色 ? { 类型: '配装', 角色id: 当前角色.id } : undefined,
          草稿: { 名称: 标签, 装备: 新装备, 循环 },
        }),
      )
      message.success(文案['页面.提示.已载入配装器'])
    } catch {
      message.error(文案['页面.错误.载入配装器'])
    }
  }

  const 检查最新计划 = () => {
    if (!结果匹配 || JSON.stringify(读取()) !== JSON.stringify(计划))
      throw new Error(文案['页面.错误.等待最新结果'])
  }
  const { 开启踏天, 标记合意, 坚持本心, 撤销合意, 我已踏天, 确认离开, 更新踏天路线 } = 创建踏天操作(
    {
      入境控制,
      设置入境中,
      检查最新计划,
      可开启,
      参考,
      推荐,
      主卡,
      更新踏天,
      计划,
      当前,
      普通目标,
      安全操作,
      踏天中,
      目标,
      不匹配原因,
      主动完成有效,
      按循环计算,
      离开踏天,
      设置管理,
      心法数据,
    },
  )
  const 上次配装 = useRef<{ 心法: string; 时间?: number; 武器: string }>()
  useEffect(() => {
    const 上次 = 上次配装.current
    if (
      上次?.心法 === 名称 &&
      上次.时间 !== 当前?.时间 &&
      上次.武器 !== '橙武' &&
      上次.武器 !== '未装备' &&
      当前武器类型 === '橙武'
    )
      message.info(文案['页面.提示.橙武更新目标'], 8)
    上次配装.current = { 心法: 名称, 时间: 当前?.时间, 武器: 当前武器类型 }
  }, [名称, 当前?.时间, 当前武器类型])
  const 主题样式 = { '--dragon-theme': 踏天中 ? '#bc934f' : 系统配置.主题色 } as React.CSSProperties
  const 足迹key = JSON.stringify([名称, 环境, 计划.历史])
  useEffect(() => {
    if (!显示足迹) return
    const timer = window.setTimeout(() => {
      // 足迹是历史记录：每份配装沿用各自保存的循环；旧记录缺失时用页面循环。
      const 列表 = 计算足迹收益(计划.历史, (装备, 快照) => 按循环计算(装备, 快照.循环 || 页面循环))
      设置足迹结果({ key: 足迹key, 列表 })
    }, 60)
    return () => window.clearTimeout(timer)
  }, [显示足迹, 足迹key])
  const 足迹 = 足迹结果?.key === 足迹key ? 足迹结果.列表 : undefined
  const 差异分组 = new Map<string, NonNullable<typeof 分析>['差异']>()
  ;(踏天中 && 查看认可差异 && 结果?.范围 === 结果范围 ? 结果?.原始差异 : 分析?.差异)
    ?.filter((item) => 差异筛选 === '全部' || item.类别 === 差异筛选)
    .forEach((item) => {
      差异分组.set(item.部位, [...(差异分组.get(item.部位) || []), item])
    })

  const 当前与目标循环不一致 = 目标循环数据 && 当前循环?.名称 !== 目标循环数据.名称

  return {
    名称,
    数据,
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
  }
}
