import type { JclWasmProgressCallback } from './jclWasmService'
import { 技能参与截止时间计算 } from './common'

export interface JclServiceDetail {
  timeline: number[][]
  hit_damage?: number
  damage?: number
  critical_damage?: number
  critical_strike?: number
  expected_damage?: number
  expected_count?: number
  actual_hit_damage?: number | null
  actual_critical_damage?: number | null
  actual_critical_strike?: number
  actual_damage?: number
  [key: string]: unknown
}

export interface JclServiceResponse {
  waistEnchantObserved?: boolean
  player: {
    id: string
    name: string
    kungfuId: number
    kungfuName: string
  }
  battle: {
    startFrame: number
    endFrame: number
    analysisSeconds?: number
  }
  data: Record<string, Record<string, JclServiceDetail>>
  diagnostics?: {
    unknownSkillIds?: number[]
    unknownBuffIds?: number[]
    unknownTalentIds?: number[]
  }
}

export type JclProvider = 'wasm' | 'remote' | 'unavailable'

export interface JclConvertOptions {
  targetLevel: number
  maxTime?: number
  playerId?: string
  onProgress?: JclWasmProgressCallback
}

const configuredServiceUrl = (process.env.REACT_APP_JCL_SERVICE_URL || '').replace(/\/$/, '')
const localSameOriginUrl =
  process.env.REACT_APP_BUILD_TYPE === 'local' &&
  typeof window !== 'undefined' &&
  /^https?:$/.test(window.location.protocol)
    ? window.location.origin
    : ''

export const JCL_SERVICE_URL = configuredServiceUrl || localSameOriginUrl

export function resolveJclProvider(converter: string | undefined, serviceUrl: string): JclProvider {
  const configuredProvider = converter?.trim()
  if (configuredProvider === 'remote') return serviceUrl ? 'remote' : 'unavailable'
  if (configuredProvider === 'wasm') return 'wasm'
  if (configuredProvider) return 'unavailable'
  return serviceUrl ? 'remote' : 'wasm'
}

export const JCL_PROVIDER = resolveJclProvider(process.env.REACT_APP_JCL_CONVERTER, JCL_SERVICE_URL)
export const JCL_PROVIDER_NAME =
  JCL_PROVIDER === 'wasm'
    ? '浏览器本地转换'
    : JCL_PROVIDER === 'remote'
      ? '远程 JCL 服务'
      : 'JCL 转换不可用'
export const JCL_PROVIDER_ERROR =
  JCL_PROVIDER === 'unavailable'
    ? process.env.REACT_APP_JCL_CONVERTER?.trim() === 'remote'
      ? '已显式选择远程转换，但未配置 REACT_APP_JCL_SERVICE_URL'
      : `REACT_APP_JCL_CONVERTER 配置无效：${process.env.REACT_APP_JCL_CONVERTER || '空值'}`
    : ''

export const JCL_MAX_FILE_SIZE = 50 * 1024 * 1024
export const JCL_CONVERSION_TIMEOUT = 90_000
export const JCL_VALID_TARGET_LEVELS = [51, 52, 53, 54] as const

export function normalizeJclData(data: JclServiceResponse['data']): JclServiceResponse['data'] {
  return Object.fromEntries(
    Object.entries(data || {}).map(([skill, statuses]) => [
      skill,
      Object.fromEntries(
        Object.entries(statuses || {}).map(([status, detail]) => [status || '||', detail]),
      ),
    ]),
  )
}

export function getJclBattleTime(battle: JclServiceResponse['battle']) {
  if (typeof battle.analysisSeconds === 'number' && Number.isFinite(battle.analysisSeconds)) {
    return Math.max(0, battle.analysisSeconds)
  }
  return Math.max(0, (battle.endFrame - battle.startFrame) / 16)
}

export function 获取JCL直伤截止时间(data: JclServiceResponse['data']) {
  let 最后直伤帧 = 0
  Object.entries(data).forEach(([技能, 状态列表]) => {
    if (!技能参与截止时间计算(技能)) return
    Object.values(状态列表).forEach((详情) => {
      详情.timeline.forEach(([时间]) => {
        最后直伤帧 = Math.max(最后直伤帧, 时间)
      })
    })
  })
  return 最后直伤帧 / 16
}

export function getJclDamage(detail: JclServiceDetail) {
  if (detail.actual_hit_damage !== undefined) return detail.actual_hit_damage
  return detail?.hit_damage ?? detail?.damage
}

export function getJclDamageStats(detail: JclServiceDetail, minFrame: number, maxFrame: number) {
  const timeline = detail.timeline.filter((point) => point[0] >= minFrame && point[0] <= maxFrame)
  if (detail.timeline.length && detail.timeline.every((point) => typeof point[2] === 'number')) {
    const hits = timeline.filter((point) => !point[1])
    const criticals = timeline.filter((point) => point[1])
    const total = timeline.reduce((sum, point) => sum + point[2], 0)
    return {
      命中伤害: hits.length
        ? hits.reduce((sum, point) => sum + point[2], 0) / hits.length
        : undefined,
      会心伤害: criticals.length
        ? criticals.reduce((sum, point) => sum + point[2], 0) / criticals.length
        : undefined,
      会心率: timeline.length ? criticals.length / timeline.length : undefined,
      期望伤害: timeline.length ? total / timeline.length : undefined,
    }
  }
  return {
    命中伤害: getJclDamage(detail),
    会心伤害:
      detail.actual_critical_damage !== undefined
        ? detail.actual_critical_damage
        : detail.critical_damage,
    会心率: detail.actual_critical_strike ?? detail.critical_strike,
    期望伤害: detail.actual_damage ?? detail.expected_damage,
  }
}

export function validateJclInput(file: Pick<File, 'name' | 'size'>, options: JclConvertOptions) {
  const suffix = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!['.jcl', '.txt'].includes(suffix)) {
    throw new Error('只支持 .jcl 或 .txt 文件')
  }
  if (!file.size) {
    throw new Error('JCL 文件不能为空')
  }
  if (file.size > JCL_MAX_FILE_SIZE) {
    throw new Error('文件不能超过 50 MiB')
  }
  if (!(JCL_VALID_TARGET_LEVELS as readonly number[]).includes(options.targetLevel)) {
    throw new Error('目标等级仅支持 51、52、53、54')
  }
  if (
    options.maxTime !== undefined &&
    (!(options.maxTime > 0) || !Number.isFinite(options.maxTime))
  ) {
    throw new Error('最大时间必须大于 0')
  }
}

async function convertJclFileRemote(
  file: File,
  options: JclConvertOptions,
): Promise<JclServiceResponse> {
  if (!JCL_SERVICE_URL) {
    throw new Error('未配置 JCL 转换服务地址')
  }

  const body = new FormData()
  body.append('file', file)
  body.append('target_level', String(options.targetLevel))
  if (options.maxTime !== undefined) body.append('max_time', String(options.maxTime))
  if (options.playerId) body.append('player_id', options.playerId)

  const response = await fetch(`${JCL_SERVICE_URL}/v1/jcl/convert`, {
    method: 'POST',
    body,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = typeof payload?.detail === 'string' ? payload.detail : 'JCL 转换失败'
    throw new Error(detail)
  }
  return payload as JclServiceResponse
}

export async function convertJclFile(
  file: File,
  options: JclConvertOptions,
): Promise<JclServiceResponse> {
  validateJclInput(file, options)
  if (JCL_PROVIDER === 'unavailable') {
    throw new Error(JCL_PROVIDER_ERROR || 'JCL 转换当前不可用')
  }
  if (JCL_PROVIDER === 'remote') {
    return convertJclFileRemote(file, options)
  }

  const fileBuffer = await file.arrayBuffer()
  const { convertJclFileWithWasm } = await import('./jclWasmService')
  return convertJclFileWithWasm(
    fileBuffer,
    {
      targetLevel: options.targetLevel,
      maxTime: options.maxTime,
      playerId: options.playerId,
    },
    options.onProgress,
  )
}
