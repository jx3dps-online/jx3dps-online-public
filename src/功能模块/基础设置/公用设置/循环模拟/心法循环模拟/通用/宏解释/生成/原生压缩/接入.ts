import { 文本指纹 } from '../身份'
import type { 原生条件目录, 原生规则 } from './类型'
import { 复制规则 } from './基础候选'
import { 压缩宏, 压缩概要, 原生压缩回放, 高级算子表 } from './调度'
import { 局部重写, 有限求解 } from './局部求解'
import { 创建高级算子 } from './高级算子'

export interface 原生提交结果 {
  rules: 原生规则[]
  macro: string
  replay: 原生压缩回放
  payload: Record<string, unknown>
  passed: boolean
  source?: Record<string, unknown>
}

export interface 原生压缩任务 {
  catalog: 原生条件目录
  contract: Record<string, unknown>
  certified: 原生提交结果
  iteration: number
  compression: Record<string, unknown>
  report: Record<string, unknown>
  submit: (规则: 原生规则[], 来源: Record<string, unknown>) => Promise<原生提交结果 | null>
  replay_candidate: (
    载荷: Record<string, unknown>,
    选项: {
      observation: 'path' | 'windows'
      stop_on_divergence: boolean
    },
  ) => Promise<原生压缩回放>
  consume: (结果: 原生提交结果) => Promise<void>
  emit: (消息: Record<string, unknown>) => void
  check: () => void
  control: () => Promise<void>
  render: (规则: readonly 原生规则[]) => string
  solve: 有限求解
  校验证书: (文本: string, 回放: 原生压缩回放, 筛选?: 原生压缩回放) => Promise<boolean>
}

interface 在线回放 extends 原生压缩回放 {
  _online_certified: boolean
  _online_payload: Record<string, unknown>
  _online_rules: 原生规则[]
}

// 观察缓存仅保存引用；模拟和搜索在同一 Worker 中读取相同数组，不编码、解码或冻结观察数据。
export class 原生器灵压缩 {
  private readonly 观察缓存 = new Map<string, 原生压缩回放>()
  private 概要?: 压缩概要
  private readonly 高级算子: Omit<高级算子表, 'local_sat'>

  constructor(
    readonly task: 原生压缩任务,
    高级算子?: Omit<高级算子表, 'local_sat'>,
  ) {
    this.高级算子 =
      高级算子 ??
      创建高级算子(
        task.catalog,
        (信息) => task.emit({ phase: 'compression_diagnostic', stage: 'compression', ...信息 }),
        { windowFrontier: true },
      )
  }

  private 信封(结果: 原生提交结果): 在线回放 {
    return {
      ...结果.replay,
      comparison: 结果.replay.comparison ?? {},
      _online_certified: 结果.passed,
      _online_payload: 结果.payload,
      _online_rules: 结果.rules,
    }
  }

  private async 认证(文本: string, _轮数: number, 方法: string, 规则: 原生规则[]) {
    if (文本 !== this.task.render(规则)) throw new Error('器灵候选原文与规则不一致')
    const 结果 = await this.task.submit(规则, { strategy: 方法 })
    if (!结果) throw new Error('器灵首次提案被任务去重丢弃')
    return this.信封(结果)
  }

  private async 接受(文本: string, 回放: 原生压缩回放, 概要: 压缩概要) {
    const 在线 = 回放 as 在线回放
    if (在线._online_certified !== true) throw new Error('器灵接受了未独立认证的候选')
    const { _online_certified, _online_payload, _online_rules, ...真实回放 } = 在线
    await this.task.consume({
      rules: 复制规则(_online_rules),
      macro: 文本,
      replay: 真实回放,
      payload: _online_payload,
      passed: true,
      source: { strategy: 概要.method },
    })
  }

  private async 反馈(文本: string, 回放: 原生压缩回放) {
    const 在线 = 回放 as 在线回放
    const 观察 = await this.task.replay_candidate(在线._online_payload, {
      observation: 'path',
      stop_on_divergence: true,
    })
    await this.task.校验证书(文本, 观察, 回放)
    return {
      ...观察,
      _online_certified: 在线._online_certified,
      _online_payload: 在线._online_payload,
      _online_rules: 在线._online_rules,
    }
  }

  private async 观察(回放: 原生压缩回放, 规则: 原生规则[], 类型: string) {
    const 在线 = 回放 as 在线回放
    const 文本 = this.task.render(规则)
    if (回放.candidate_hash !== (await 文本指纹(文本))) throw new Error('器灵观察未绑定当前候选')
    if (!在线._online_certified) {
      if (!回放.rows?.length) throw new Error('器灵修复缺少该失败候选的实际前缀')
      return 回放
    }
    const 级别 = 类型 === 'certified_windows' ? 'windows' : 'path'
    const 指纹 = 回放.candidate_hash
    let 键 = 指纹 + ':' + 级别
    if (级别 === 'path' && this.观察缓存.has(指纹 + ':windows')) 键 = 指纹 + ':windows'
    let 观察 = this.观察缓存.get(键)
    if (!观察) {
      观察 = await this.task.replay_candidate(在线._online_payload, {
        observation: 级别,
        stop_on_divergence: false,
      })
      if (
        !(await this.task.校验证书(文本, 观察, 回放)) ||
        !观察.rows?.length ||
        观察.decision_prefix_complete !== true ||
        观察.observation_level !== 级别
      ) {
        throw new Error('器灵基线缺少自身所请求的完整观察')
      }
      if (级别 === 'windows') this.观察缓存.delete(指纹 + ':path')
      this.观察缓存.set(键, 观察)
      while (this.观察缓存.size > 2) this.观察缓存.delete(this.观察缓存.keys().next().value!)
    } else {
      await this.task.校验证书(文本, 观察, 回放)
      this.观察缓存.delete(键)
      this.观察缓存.set(键, 观察)
    }
    return {
      ...观察,
      _online_certified: 在线._online_certified,
      _online_payload: 在线._online_payload,
      _online_rules: 在线._online_rules,
    }
  }

  private 进度(概要: 压缩概要) {
    this.概要 = 概要
    Object.assign(this.task.compression, 概要)
    this.task.emit({
      phase: 'compressing',
      stage: 'compression',
      iteration: this.task.iteration,
      compression: { ...this.task.compression },
    })
  }

  diagnostic() {
    return {
      pipeline: 'qiling-native',
      status: this.概要?.status ?? 'running',
      method: this.概要?.method,
      route: this.概要?.route,
      observation_cache: this.观察缓存.size,
    }
  }

  async run() {
    const 任务 = this.task
    const 诊断 = (信息: Record<string, unknown>) =>
      任务.emit({ phase: 'compression_diagnostic', stage: 'compression', ...信息 })
    const 结果 = await 压缩宏({
      规则: 任务.certified.rules,
      原子: 任务.catalog.atoms,
      动作: 任务.catalog.actions,
      目录: 任务.catalog,
      基线: this.信封(任务.certified),
      渲染: (规则) => 任务.render(规则),
      认证: (文本, 轮数, 方法, 规则) => this.认证(文本, 轮数, 方法, 规则),
      观察: (回放, 规则, 类型) => this.观察(回放, 规则, 类型),
      反馈: (文本, 回放) => this.反馈(文本, 回放),
      检查: () => 任务.check(),
      控制: () => 任务.control(),
      接受: (文本, 回放, 概要) => this.接受(文本, 回放, 概要),
      进度: (概要) => this.进度(概要),
      诊断,
      算子: {
        ...this.高级算子,
        local_sat: (规则, 样本) =>
          局部重写(规则, 样本, (规则) => 任务.render(规则), 任务.solve, 诊断),
      },
    })
    任务.report.compression_stop = 结果.概要.status
    return 结果
  }
}
