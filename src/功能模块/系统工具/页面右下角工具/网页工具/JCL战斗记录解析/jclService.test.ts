declare const describe: (name: string, suite: () => void) => void

declare const test: (name: string, assertion: () => void) => void

declare const expect: any
declare const jest: any

import { 战斗数据转换 } from './tool'
import { message } from 'antd'
import 玳弦增益 from '@/心法模块/心法/冰心诀/技能增益/玳弦急曲'

jest.mock('antd', () => {
  const { jest: mockJest } = require('@jest/globals')
  return { message: { error: mockJest.fn(), info: mockJest.fn() } }
})
jest.mock('@/数据/团队增益/tools', () => ({ __esModule: true, default: () => [] }))

import {
  getJclBattleTime,
  getJclDamage,
  JCL_MAX_FILE_SIZE,
  normalizeJclData,
  resolveJclProvider,
  validateJclInput,
} from './jclService'
import {
  getJclWasmAssetBaseUrl,
  normalizeJclWasmError,
  validateJclWasmManifest,
} from './jclWasmProtocol'

describe('JCL service helpers', () => {
  test('maps Bingxin recorded buffs, Yingxiu levels and Daixian DOT stacks', () => {
    const detail = { timeline: [[16, 0, 100]] }
    const data = {
      '玳弦急曲#6234': {
        '枕上#5788-1-1,霜降#30273-6-1,霜降#30274-6-1,仙姿#28183-1-1,仙姿#28184-1-1,仙姿#28185-1-1,仙姿#28186-1-1||':
          detail,
      },
      '盈袖#33140-2': { '||': detail },
      '急曲(DOT)#2920-1-1(玳弦急曲#3009-1-6)': { '||': detail },
    }
    const result = 战斗数据转换({
      心法: '冰心诀',
      数据: JSON.stringify(data),
      最大时间: 10,
      最小时间: 0,
      团队增益轴: [],
      导入启用团队快照: false,
    })
    expect(message.error).not.toHaveBeenCalled()
    const daixian = result.技能详情.find((skill) => skill.技能名称 === '玳弦急曲·2')
    const gains = daixian?.技能增益列表?.[0]?.增益名称?.split(',')
    expect(gains).toEqual(['枕上', '霜降·6', '仙姿·剑破', '仙姿·玳弦', '仙姿·剑气', '仙姿·剑影'])
    expect(gains?.every((name) => 玳弦增益.some((gain) => gain.增益名称 === name))).toBe(true)
    expect(result.技能详情.find((skill) => skill.技能名称 === '盈袖')?.技能等级).toBe(2)
    expect(result.技能详情.find((skill) => skill.技能名称 === '急曲(DOT)·2')?.伤害层数).toBe(6)
    expect(result.技能详情.every((skill) => skill.技能数量 === 1)).toBe(true)
  })

  test('normalizes empty status keys', () => {
    const detail = { timeline: [[16]], damage: 100 }

    expect(normalizeJclData({ skill: { '': detail } })).toEqual({
      skill: { '||': detail },
    })
  })

  test('prefers hit damage and falls back to damage', () => {
    expect(getJclDamage({ timeline: [], hit_damage: 120, damage: 100 })).toBe(120)
    expect(getJclDamage({ timeline: [], damage: 100 })).toBe(100)
  })

  test('prefers analysis seconds and falls back to frame duration', () => {
    expect(getJclBattleTime({ startFrame: 16, endFrame: 160, analysisSeconds: 12.5 })).toBe(12.5)
    expect(getJclBattleTime({ startFrame: 16, endFrame: 160 })).toBe(9)
  })

  test('validates browser-side JCL input constraints', () => {
    const validFile = { name: 'record.jcl', size: 1 } as File
    expect(() => validateJclInput(validFile, { targetLevel: 134 })).not.toThrow()
    expect(() => validateJclInput(validFile, { targetLevel: 130 })).toThrow('目标等级')
    expect(() => validateJclInput(validFile, { targetLevel: 134, maxTime: 0 })).toThrow('最大时间')
    expect(() =>
      validateJclInput({ name: 'record.lua', size: 1 } as File, { targetLevel: 134 }),
    ).toThrow('.jcl')
    expect(() =>
      validateJclInput({ name: 'record.jcl', size: 0 } as File, { targetLevel: 134 }),
    ).toThrow('不能为空')
    expect(() =>
      validateJclInput({ name: 'record.jcl', size: JCL_MAX_FILE_SIZE + 1 } as File, {
        targetLevel: 134,
      }),
    ).toThrow('50 MiB')
  })

  test('selects the explicit provider before URL compatibility defaults', () => {
    expect(resolveJclProvider('remote', '')).toBe('unavailable')
    expect(resolveJclProvider('wasm', 'https://service.test')).toBe('wasm')
    expect(resolveJclProvider(undefined, 'https://service.test')).toBe('remote')
    expect(resolveJclProvider(undefined, '')).toBe('wasm')
    expect(resolveJclProvider('invalid', 'https://service.test')).toBe('unavailable')
  })

  test('builds static asset roots for routes and deployment prefixes', () => {
    expect(getJclWasmAssetBaseUrl('https://example.test/dps', '/')).toBe(
      'https://example.test/jcl-wasm/',
    )
    expect(getJclWasmAssetBaseUrl('https://example.test/dps/', '/')).toBe(
      'https://example.test/jcl-wasm/',
    )
    expect(getJclWasmAssetBaseUrl('https://example.test/app/dps/', '/app')).toBe(
      'https://example.test/app/jcl-wasm/',
    )
    expect(
      getJclWasmAssetBaseUrl('https://example.test/dps', './', '/static/js/main.hash.js'),
    ).toBe('https://example.test/jcl-wasm/')
    expect(
      getJclWasmAssetBaseUrl('https://example.test/dps/', './', '/static/js/main.hash.js'),
    ).toBe('https://example.test/jcl-wasm/')
    expect(
      getJclWasmAssetBaseUrl('https://example.test/app/dps/', './', '/app/static/js/main.hash.js'),
    ).toBe('https://example.test/app/jcl-wasm/')
    expect(
      getJclWasmAssetBaseUrl('https://example.test/index.html', './', '/static/js/main.hash.js'),
    ).toBe('https://example.test/jcl-wasm/')
    expect(getJclWasmAssetBaseUrl('https://example.test/tools/')).toBe(
      'https://example.test/tools/jcl-wasm/',
    )
  })

  test('validates the versioned WASM manifest shape', () => {
    const hash = 'a'.repeat(64)
    const manifest = {
      format: 2,
      pyodideVersion: '0.29.4',
      version: hash,
      basePath: `versions/${hash}/`,
      worker: { path: 'worker.js', sha256: hash },
      pythonArchive: { path: 'jcl-python.zip', sha256: hash, files: ['app/convert.py'] },
      runtime: { 'pyodide/pyodide.js': hash },
    }
    expect(() => validateJclWasmManifest(manifest)).not.toThrow()
    expect(() => validateJclWasmManifest({ ...manifest, basePath: '../runtime/' })).toThrow(
      '路径无效',
    )
    expect(() => validateJclWasmManifest({ ...manifest, version: 'not-a-hash' })).toThrow(
      '哈希无效',
    )
    expect(() =>
      validateJclWasmManifest({
        ...manifest,
        worker: { ...manifest.worker, path: 'data:text/javascript,alert(1)' },
      }),
    ).toThrow('路径无效')
    expect(() =>
      validateJclWasmManifest({
        ...manifest,
        worker: { ...manifest.worker, path: '%2e%2e/worker.js' },
      }),
    ).toThrow('路径无效')
  })

  test('normalizes worker errors without throwing on unknown values', () => {
    expect(normalizeJclWasmError({ message: 'worker failed' }).message).toBe('worker failed')
    expect(normalizeJclWasmError(undefined).message).toBe('浏览器本地 JCL 转换失败')
  })
})
