import { 文本指纹, 生成协议版本 } from '../身份'
import { 回放通过校验, 提取认证信封, type 回放信封 } from '../结果校验'
import { 获取认证冲突 } from '../任务协议'
import type { 创建生成预言机 } from '../预言机'
import type { 有限求解 } from '../原生压缩/局部求解'
import { 原生样本 } from '../原生压缩/样本'
import { 规范规则, 规则文本 } from '../原生压缩/条件'
import { 原生器灵压缩, type 原生提交结果, type 原生压缩任务 } from '../原生压缩/接入'
import type { 原生压缩回放 } from '../原生压缩/调度'
import type { 原生规则, 原生条件目录, 原生观察行 } from '../原生压缩/类型'
import { 构造候选, 语义替换, 计时载体 } from './构造候选'
import { 修复流, 覆盖流, 计时替换, 优先级流, 定位分歧 } from './修复候选'
import { 公平队列 } from './候选队列'
import { 搜索存储, 请求结果 } from './搜索存储'
import type { 候选流, 候选来源 } from './类型'

type 预言机 = Awaited<ReturnType<typeof 创建生成预言机>>
type 记录 = Record<string, any>
type 搜索回放 = 原生压缩回放 & 回放信封 & 记录
const 复制 = (规则: 原生规则[]) => 规则.map((行) => ({ action: 行.action, ...规范规则(行) }))
const 元组比较 = (左: number[], 右: number[]) => {
  for (let i = 0; i < 左.length; i++) if (左[i] !== 右[i]) return 左[i] > 右[i] ? 1 : -1
  return 0
}

function 扩展阈值(原子: readonly string[], 回放: 搜索回放) {
  const 字段 = new Set(
    原子.filter((项) => /^(t?bufftime):/.test(项)).map((项) => 项.split(/[<>]/)[0]),
  )
  const 已有 = new Set(原子),
    新增 = new Set<string>()
  for (const 行 of 回放.rows ?? []) {
    const 状态 = 行.state as 记录 | undefined
    for (const [前缀, 键] of [
      ['bufftime:', 'buffs'],
      ['tbufftime:', 'target_buffs'],
    ]) {
      for (const 增益 of 状态?.[键] ?? []) {
        const 字段名 = 前缀 + 增益.name,
          剩余 = 增益.remaining ?? 0
        if (!字段.has(字段名) || !Number.isFinite(剩余) || 剩余 <= 0) continue
        const 点 = Math.floor(剩余 * 10 + 1e-8)
        for (let 值 = Math.max(0, 点 - 2); 值 < 点 + 4; 值++)
          for (const 符 of ['<', '>']) {
            const 原子 = 字段名 + 符 + Number((值 / 10).toFixed(1))
            if (!已有.has(原子)) 新增.add(原子)
          }
      }
    }
  }
  return [...原子, ...[...新增].sort()]
}

export class 原生生成任务 implements 原生压缩任务 {
  catalog!: 原生条件目录
  certified!: 原生提交结果
  iteration = 0
  readonly contract: 记录
  readonly compression: 记录 = {
    initial_chars: 0,
    best_chars: 0,
    trial_count: 0,
    accepted_count: 0,
    counterexample_skips: 0,
    counterexample_count: 0,
  }
  readonly report: 记录
  private readonly queue: 公平队列
  private readonly hashes = new Map<string, Promise<string>>()
  private teacher?: 原生样本
  private previousCatalog?: { epoch: number; catalog: 原生条件目录; rows: 原生观察行[] }
  private readonly samples = new Map<
    string,
    { rules: 原生规则[]; replay: 搜索回放; sample: 原生样本 }
  >()
  private best?: 原生提交结果 & { rank: number[]; iteration: number }
  private compressor?: 原生器灵压缩
  private stage = 'generation'
  private catalogEpoch = 0
  private sampleEpoch = 0
  private transitions = 0
  private lastExpansion = 0
  private searchMs = 0
  private pathOrder = 0

  constructor(
    private readonly oracle: 预言机,
    readonly control: () => Promise<void>,
    readonly check: () => void,
    private readonly candidateHandoff: (消息: any) => Promise<void>,
    private readonly certifiedHandoff: (消息: any) => Promise<void>,
    readonly solve: 有限求解,
    readonly emit: (消息: 记录) => void,
    private readonly storage = new 搜索存储(),
  ) {
    this.queue = new 公平队列(storage, (描述) => this.restore(描述), control)
    this.contract = { ...oracle.合同, contract_id: oracle.合同身份 }
    this.report = {
      schema: 'exact-macro-v2',
      status: 'searching',
      algorithm_version: oracle.合同.algorithm_version,
      contract: this.contract,
      time_tolerance_seconds: oracle.合同.time_tolerance_seconds,
      random_seed: oracle.合同.random_seed,
      relaxations: [],
      compression_stop: null,
    }
  }

  private hash(文本: string) {
    if (!this.hashes.has(文本)) {
      if (this.hashes.size >= 128) this.hashes.delete(this.hashes.keys().next().value!)
      this.hashes.set(文本, 文本指纹(文本))
    }
    return this.hashes.get(文本)!
  }

  render = (规则: readonly 原生规则[]) =>
    规则文本(规则, this.catalog.atoms, this.catalog.actions, this.catalog.empty_macro)

  async 校验证书(文本: string, 回放: 原生压缩回放, 已有?: 原生压缩回放) {
    const 信封 = 回放 as 搜索回放
    if (
      信封.protocol_version !== 生成协议版本 ||
      信封.contract_id !== this.contract.contract_id ||
      信封.candidate_hash !== (await this.hash(文本))
    )
      throw new Error('回放未绑定当前任务和原文候选')
    if (!信封.comparison && 信封.status === 'candidate_rejected') return false
    if (信封.comparison?.time_tolerance_seconds !== this.contract.time_tolerance_seconds)
      throw new Error('回放改变了固定容差')
    const 通过 = 回放通过校验(信封, {
      contract_id: this.contract.contract_id,
      candidate_hash: 信封.candidate_hash,
      horizon: this.contract.horizon,
      time_tolerance_seconds: this.contract.time_tolerance_seconds,
    })
    if (信封.comparison?.reproduced === true && !通过) throw new Error('认证标记与真实结束事实矛盾')
    if (已有) {
      const 冲突 = 获取认证冲突(已有 as unknown as 回放信封, 信封)
      const 键 = [
        'reproduced',
        'target_count',
        'actual_count',
        'order_prefix',
        'exact_prefix',
        'acceptance_prefix',
        'time_tolerance_seconds',
        'first_difference',
        'completed_full_replay',
      ]
      if (
        冲突 ||
        键.some(
          (k) => JSON.stringify(信封.comparison?.[k]) !== JSON.stringify(已有.comparison?.[k]),
        ) ||
        ['actual_fingerprint', 'actual', 'target', 'end'].some(
          (k) => JSON.stringify(信封[k]) !== JSON.stringify(已有[k]),
        )
      )
        throw new Error('独立观察改变了相同候选的执行结果')
    }
    return 通过
  }

  private async call(输入: 记录 = {}): Promise<搜索回放> {
    await this.control()
    const 回放 = (await this.oracle.运行原生({
      horizon: this.contract.horizon,
      time_tolerance_seconds: this.contract.time_tolerance_seconds,
      ...输入,
    })) as unknown as 搜索回放
    if (回放.protocol_version !== 生成协议版本 || 回放.contract_id !== this.contract.contract_id)
      throw new Error('预言机回复不属于当前合同')
    return 回放
  }

  async replay_candidate(payload: 记录, options: 记录 = {}): Promise<搜索回放> {
    let 结果: 搜索回放
    try {
      结果 = await this.call({
        candidate: payload.candidate,
        atoms: this.catalog.atoms,
        ...options,
      })
    } catch (错误) {
      const failure = {
        protocol_version: 生成协议版本,
        contract_id: this.contract.contract_id,
        candidate_hash: payload.candidate_hash,
        status: 'fatal_error',
        end: null,
        comparison: null,
        error: { message: String(错误), stage: 'native_oracle' },
        truncated: false,
      }
      await this.candidateHandoff({ ...payload, result: failure })
      throw 错误
    }
    await this.candidateHandoff({ ...payload, result: 提取认证信封(结果) })
    if (结果.status === 'resource_exhausted')
      throw Object.assign(new Error(JSON.stringify(结果.end ?? 结果.probe_failure)), {
        resource_exhausted: true,
      })
    if (结果.status === 'fatal_error')
      throw new Error('原生回放失败：' + JSON.stringify(结果.error ?? 结果.probe_failure))
    return 结果
  }

  private matrix(回放: 搜索回放, 身份: string) {
    const 开始 = performance.now()
    const 样本 = new 原生样本(
      回放.rows ?? [],
      this.catalog.atoms,
      this.catalog.actions,
      this.check,
      { contract_id: this.contract.contract_id, path_id: 身份, epoch: ++this.sampleEpoch },
      this.catalog,
    )
    this.emit({
      phase: 'matrix_profile',
      rows: 样本.rows.length,
      atoms: 样本.atoms.length,
      elapsed_ms: performance.now() - 开始,
    })
    return 样本
  }

  private async installCatalog(回放: 搜索回放) {
    this.previousCatalog = undefined
    this.catalog = {
      atoms: 回放.atoms,
      actions: 回放.actions,
      metadata: 回放.atom_semantics,
      clock: new Set<number>(
        回放.atom_semantics.flatMap((项, i) => (项.wake_dependencies?.length ? [i] : [])),
      ),
      empty_macro: this.oracle.场景.empty_macro,
    }
    this.teacher = this.matrix(回放, 'teacher')
    await this.storage.保存(['catalog', this.catalogEpoch], {
      catalog: this.catalog,
      rows: 回放.rows,
    })
  }

  private async restore(描述: 记录): Promise<候选流> {
    if (描述.kind === 'recheck') return [{ rules: 描述.rules }]
    if (描述.kind === 'expand') {
      const 任务 = this
      return (function* (): 候选流 {
        while (任务.iteration - 任务.lastExpansion < 32 && 任务.queue.pending > 1) yield null
        yield { expand_atoms: 描述.atoms }
      })()
    }
    if (描述.epoch !== this.catalogEpoch && this.previousCatalog?.epoch !== 描述.epoch)
      this.previousCatalog = {
        ...(await this.storage.读取<{ catalog: 原生条件目录; rows: 原生观察行[] }>([
          'catalog',
          描述.epoch,
        ]))!,
        epoch: 描述.epoch,
      }
    const 目录 =
      描述.epoch === this.catalogEpoch
        ? { catalog: this.catalog, rows: this.teacher!.rows }
        : this.previousCatalog!
    if (描述.kind === 'teacher') {
      const 教师 =
        描述.epoch === this.catalogEpoch
          ? this.teacher!
          : new 原生样本(
              目录.rows,
              目录.catalog.atoms,
              目录.catalog.actions,
              this.check,
              {},
              目录.catalog,
            )
      return 构造候选(教师, undefined, 描述.stable ? 'stable' : 'semantic')
    }
    const 键 = `${描述.epoch}:${描述.parent}`
    let 路径 = this.samples.get(键)
    if (!路径) {
      if (this.samples.size >= 2) this.samples.delete(this.samples.keys().next().value!)
      const 保存 = (await this.storage.读取<{ rules: 原生规则[]; replay: 搜索回放 }>(['path', 键]))!
      路径 = {
        ...保存,
        sample: new 原生样本(
          保存.replay.rows ?? [],
          目录.catalog.atoms,
          目录.catalog.actions,
          this.check,
          { path_id: 键 },
          目录.catalog,
        ),
      }
      this.samples.set(键, 路径)
    }
    const { rules: 规则, replay: 回放, sample: 样本 } = 路径
    const 种子 = 规则.every((行) => !行.ops?.includes('|')) ? 规则 : undefined
    if (描述.strategy === 'continuation_construct') {
      const 尾部 = 目录.rows.filter(
        (行) => (行.cursor ?? 0) >= (回放.comparison?.acceptance_prefix ?? 0) && 行.allowed?.length,
      )
      const 引导 = new 原生样本(
        [...样本.rows, ...尾部],
        目录.catalog.atoms,
        目录.catalog.actions,
        this.check,
        { conditional_guide: true },
        目录.catalog,
      )
      return 构造候选(引导, 种子)
    }
    const 流: Record<string, () => 候选流> = {
      causal_priority: () => 优先级流(规则, 样本, 回放),
      priority_repair: () => 优先级流(规则, 样本, 回放),
      repair: () => 修复流(规则, 样本, 回放),
      coverage: () => 覆盖流(规则, 样本, 回放),
      timing: () => 计时替换(规则, 样本, 回放),
      semantic: () => 语义替换(规则, 样本),
      clock_carrier: () => 计时载体(规则, 样本),
      path_construct: () => 构造候选(样本, 种子),
    }
    return 流[描述.strategy]()
  }

  private async offerSources(规则: 原生规则[], 原回放: 搜索回放, 来源: 候选来源) {
    const 回放 = Object.fromEntries(
      [
        'rows',
        'actual',
        'target',
        'comparison',
        'probe_failure',
        'actual_fingerprint',
        'timing_diagnostics',
      ]
        .filter((k) => k in 原回放)
        .map((k) => [k, 原回放[k]]),
    ) as 搜索回放
    const 父 = await this.hash(this.render(规则))
    const 路径 = `${this.catalogEpoch}:${父}:${回放.actual_fingerprint}`
    const 样本 = this.matrix(回放, 路径),
      目录 = this.catalog
    const 缓存键 = `${this.catalogEpoch}:${父}`
    const 保存 = { rules: 复制(规则), replay: 回放 }
    const { 上游, order } = await this.storage.事务(
      ['data'],
      async (事务) => {
        const 数据 = 事务.objectStore('data')
        const 历史: { order: number } | undefined = await 请求结果(数据.get(['parent', 父]))
        const order = 历史?.order ?? this.pathOrder + 1
        await 请求结果(数据.put(保存, ['path', 缓存键]))
        await 请求结果(数据.put({ rules: 保存.rules }, ['latest', order]))
        await 请求结果(
          数据.put({ order, comparison: 回放.comparison, probe_failure: 回放.probe_failure }, [
            'parent',
            父,
          ]),
        )
        const 上游: 搜索回放 | undefined = await 请求结果(
          数据.get(['parent', 来源.parent_hash ?? '']),
        )
        return { 上游, order }
      },
      true,
    )
    this.pathOrder = Math.max(this.pathOrder, order)
    if (this.samples.size >= 2) this.samples.delete(this.samples.keys().next().value!)
    this.samples.set(缓存键, { ...保存, sample: 样本 })
    const 批次: Parameters<公平队列['登记批次']>[0] = []
    const 登记 = (身份: unknown, 描述: 记录, 来源: 候选来源) => 批次.push({ 身份, 描述, 来源 })
    if (
      上游 &&
      ['upstream_gate', 'upstream_combination', 'combined_edit'].includes(
        来源.proposal_source ?? '',
      )
    ) {
      const 之前 = 上游,
        前 = 之前.comparison as 记录,
        后 = 回放.comparison as 记录
      if (
        ['late', 'missed_window'].includes(定位分歧(之前).kind) &&
        定位分歧(回放).kind === 'wrong_action' &&
        (后?.acceptance_prefix ?? 0) < (前?.acceptance_prefix ?? 0) &&
        (后?.max_time_error_on_order_prefix ?? Infinity) <
          (前?.max_time_error_on_order_prefix ?? Infinity)
      )
        登记(
          [this.catalogEpoch, 父, 路径, 'causal_priority'],
          { kind: 'path', epoch: this.catalogEpoch, parent: 父, strategy: 'causal_priority' },
          {
            parent_hash: 父,
            strategy: 'causal_priority',
            catalog_epoch: this.catalogEpoch,
            path_id: 路径,
            priority: Math.max(来源.priority ?? 0, (前?.acceptance_prefix ?? 0) * 100 + 26),
          },
        )
    }
    const 前缀 = 回放.comparison?.acceptance_prefix ?? 0
    const 分歧 = 回放.comparison?.first_difference as 记录 | undefined
    const 缺允许 = 样本.rows.some(
      (行, i) =>
        行.cursor === 分歧?.index &&
        (行.allowed ?? []).some(
          (a) =>
            (!分歧?.expected?.name || 目录.actions[a].name === 分歧.expected.name) &&
            !规则.some(
              (规则) => 规则.action === a && !!(样本.命中(规则) & (BigInt(1) << BigInt(i))),
            ),
        ),
    )
    const 权重 = {
      priority_repair: 28,
      repair: 20,
      coverage: 缺允许 ? 24 : 16,
      timing: 8,
      continuation_construct: 12,
      path_construct: 4,
      semantic: 3,
      clock_carrier: 2,
    }
    for (const strategy of [
      'priority_repair',
      'repair',
      'coverage',
      'timing',
      'semantic',
      'clock_carrier',
      'path_construct',
      'continuation_construct',
    ])
      登记(
        [this.catalogEpoch, 父, 路径, strategy],
        { kind: 'path', epoch: this.catalogEpoch, parent: 父, strategy },
        {
          parent_hash: 父,
          strategy,
          catalog_epoch: this.catalogEpoch,
          path_id: 路径,
          priority: 前缀 * 100 + 权重[strategy],
        },
      )
    const 扩展 = 扩展阈值(this.catalog.atoms, 回放)
    if (扩展.length > this.catalog.atoms.length) {
      登记(
        [this.catalogEpoch, 扩展, 'expand'],
        { kind: 'expand', atoms: 扩展 },
        {
          parent_hash: 父,
          strategy: 'threshold_expansion',
        },
      )
    }
    await this.queue.登记批次(批次)
  }

  async submit(规则: 原生规则[], 来源: Record<string, any>): Promise<原生提交结果 | null> {
    const 文本 = this.render(规则),
      哈希 = await this.hash(文本),
      身份 = `${this.catalogEpoch}:${哈希}`
    if (this.stage === 'generation' && (await this.storage.读取(['seen', 身份]))) return null
    if (this.stage === 'generation') await this.storage.保存(['seen', 身份], true)
    const payload = {
      candidate: 文本,
      candidate_hash: 哈希,
      parent_hash: 来源.parent_hash,
      source: 来源.strategy ?? 'candidate',
      iteration: ++this.iteration,
    }
    await this.candidateHandoff(payload)
    this.emit({
      phase: 'candidate',
      macro: 文本,
      iteration: this.iteration,
      stage: this.stage,
      time_tolerance_seconds: this.contract.time_tolerance_seconds,
    })
    this.emit({ phase: 'replaying', iteration: this.iteration, stage: this.stage })
    const 筛选 = this.stage === 'compression' || 来源.strategy === 'resume_compression'
    let 回放 = await this.replay_candidate(payload, {
      observation: 筛选 ? 'none' : 'path',
      stop_on_divergence: true,
    })
    const 通过 = await this.校验证书(文本, 回放)
    if (通过) await this.certifiedHandoff({ ...payload, result: 提取认证信封(回放) })
    else if (筛选 && this.stage === 'generation' && 回放.comparison?.first_difference) {
      const 完整 = await this.replay_candidate(payload, {
        observation: 'path',
        stop_on_divergence: true,
      })
      await this.校验证书(文本, 完整, 回放)
      回放 = 完整
    }
    this.emit({
      phase: 'replayed',
      iteration: this.iteration,
      comparison: 回放.comparison,
      stage: this.stage,
      compression: this.compressor ? this.compression : undefined,
    })
    return { rules: 复制(规则), macro: 文本, replay: 回放, passed: 通过, source: 来源, payload }
  }

  async consume(结果: 原生提交结果 | null) {
    if (!结果) return
    const { rules: 规则, macro: 文本 } = 结果,
      回放 = 结果.replay as 搜索回放
    if (!结果.passed) {
      if (this.stage === 'generation') {
        const 比较 = (回放.comparison as 记录) ?? {}
        const rank = [
          比较.acceptance_prefix ?? 0,
          比较.exact_prefix ?? 0,
          比较.order_prefix ?? 0,
          -(比较.max_time_error_on_order_prefix ?? Infinity),
        ]
        if (!this.best || 元组比较(rank, this.best.rank) > 0) {
          this.best = { ...结果, rank, iteration: this.iteration }
          this.emit({
            phase: 'best',
            iteration: this.iteration,
            macro: 文本,
            comparison: 比较,
            certificate: null,
            stage: this.stage,
          })
        }
        if (回放.rows?.length) await this.offerSources(规则, 回放, 结果.source as 候选来源)
      }
      return
    }
    if (this.stage === 'generation') {
      if (++this.transitions !== 1) throw new Error('同一任务重复进入压缩')
      this.stage = 'compression'
      this.queue.释放()
      this.samples.clear()
      this.teacher = undefined
      this.previousCatalog = undefined
      this.best = undefined
      this.hashes.clear()
      await this.storage.清空()
      this.certified = 结果
      this.report.status = 'exact'
      this.compression.initial_chars = this.compression.best_chars = 文本.length
      this.compressor = new 原生器灵压缩(this)
    } else {
      if (文本.length >= this.certified.macro.length) return
      this.certified = 结果
      this.compression.accepted_count++
      this.compression.best_chars = 文本.length
    }
    await this.certifiedHandoff({ ...结果.payload, result: 提取认证信封(回放), accepted: true })
    this.report.comparison = 回放.comparison
    this.emit({
      phase: 'best',
      stage: 'compression',
      macro: 文本,
      comparison: 回放.comparison,
      certificate: 提取认证信封(回放),
      iteration: this.iteration,
      compression: { ...this.compression },
    })
  }

  private async expand(新增: string[]) {
    const 原子 = [...new Set([...this.catalog.atoms, ...新增])]
    if (原子.length === this.catalog.atoms.length) return
    const 准备 = await this.call({ atoms: 原子 })
    if (
      准备.atoms
        .slice(0, this.catalog.atoms.length)
        .some((项, i) => 项 !== this.catalog.atoms[i]) ||
      JSON.stringify(准备.actions) !== JSON.stringify(this.catalog.actions)
    )
      throw new Error('目录扩展改变了既有原子或动作索引')
    this.catalogEpoch++
    await this.installCatalog(准备)
    this.lastExpansion = this.iteration
    await this.queue.登记(
      [this.catalogEpoch, 'teacher'],
      { kind: 'teacher', epoch: this.catalogEpoch },
      {
        strategy: 'teacher_construct',
      },
    )
    await this.queue.登记(
      [this.catalogEpoch, 'stable_teacher'],
      { kind: 'teacher', epoch: this.catalogEpoch, stable: true },
      { strategy: 'stable_teacher_construct' },
    )
    for await (const { rules: 规则 } of this.storage.遍历<{ rules: 原生规则[] }>('latest'))
      await this.queue.登记(
        [this.catalogEpoch, 规则, 'recheck'],
        { kind: 'recheck', rules: 规则 },
        {
          strategy: 'catalog_recheck',
        },
      )
    this.emit({
      phase: 'catalog_expanded',
      catalog_epoch: this.catalogEpoch,
      atom_count: 原子.length,
    })
  }

  async run(种子?: 原生规则[]) {
    try {
      this.emit({ phase: 'preparing', stage: 'extraction' })
      const 准备 = await this.call()
      if (准备.status !== 'ok') {
        Object.assign(this.report, {
          status: 'preparation_failed',
          preparation_comparison: 准备.comparison,
          reason: 准备.probe_failure ?? 准备.error,
        })
        return this.finish()
      }
      await this.installCatalog(准备)
      this.report.preparation_comparison = 准备.comparison
      this.emit({
        phase: 'prepared',
        target_count: 准备.target?.length,
        atom_count: this.catalog.atoms.length,
      })
      if (种子)
        await this.consume(
          await this.submit(种子, { strategy: 'resume_' + this.oracle.场景.resume_stage }),
        )
      if (this.stage === 'generation') {
        await this.queue.登记(
          [this.catalogEpoch, 'teacher'],
          { kind: 'teacher', epoch: this.catalogEpoch },
          {
            strategy: 'teacher_construct',
          },
        )
        await this.queue.登记(
          [this.catalogEpoch, 'stable_teacher'],
          { kind: 'teacher', epoch: this.catalogEpoch, stable: true },
          { strategy: 'stable_teacher_construct' },
        )
      }
      while (true) {
        await this.control()
        if (this.stage === 'compression') {
          await this.compressor!.run()
          break
        }
        const 开始 = performance.now(),
          值 = await this.queue.推进()
        this.searchMs += performance.now() - 开始
        if (值.scope_exhausted) {
          Object.assign(this.report, {
            status: 'search_exhausted',
            reason: '当前登记候选范围耗尽；没有全局无解证明',
          })
          break
        }
        const 项 = 值.item
        if (!项) continue
        if (项.expand_atoms) {
          await this.expand(项.expand_atoms)
          continue
        }
        let 规则 = 项.rules
        if (!规则) {
          this.emit({ phase: 'search_scope', ...项 })
          if (!项.partial_rules) continue
          规则 = 项.partial_rules
          项.source = 'partial_construct'
        }
        this.emit({ phase: 'generation_search_profile', candidate_ms: this.searchMs })
        this.searchMs = 0
        await this.consume(await this.submit(规则, { ...值.source!, proposal_source: 项.source }))
      }
    } catch (错误) {
      const 信息 = 错误 as Error & { cancelled?: boolean; resource_exhausted?: boolean }
      Object.assign(this.report, {
        status: this.certified
          ? 'exact'
          : 信息.cancelled
            ? 'cancelled'
            : 信息.resource_exhausted
              ? 'resource_exhausted'
              : 'fatal_error',
        reason: 信息.message,
        compression_stop: 信息.cancelled
          ? 'cancelled'
          : 信息.resource_exhausted
            ? 'resource_exhausted'
            : 'error',
      })
      if (!this.certified && !信息.cancelled && !信息.resource_exhausted) throw 错误
    }
    return this.finish()
  }

  private async finish() {
    const 值 = this.certified ?? this.best,
      回放 = 值?.replay as 搜索回放 | undefined
    Object.assign(this.report, {
      comparison: 回放?.comparison,
      candidate_hash: 回放?.candidate_hash,
      candidate_iteration: 值?.payload?.iteration ?? this.best?.iteration,
      iteration_count: this.iteration,
      catalog_epoch: this.catalogEpoch,
      successful_transitions: this.transitions,
      compression: this.compression,
      queue: this.compressor ? this.compressor.diagnostic() : this.queue.诊断(),
    })
    const 结果 = {
      macro: 值?.macro ?? '',
      report: this.report,
      certificate: this.certified
        ? 提取认证信封(this.certified.replay as unknown as 回放信封)
        : undefined,
    }
    this.queue.释放()
    this.samples.clear()
    this.teacher = undefined
    this.previousCatalog = undefined
    this.hashes.clear()
    await this.storage.关闭()
    return 结果
  }
}
