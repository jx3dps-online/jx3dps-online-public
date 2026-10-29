import type { JclServiceResponse } from './jclService'
import { convertJclFileWithWasm, resetJclWasmServiceForTests } from './jclWasmService'

declare const describe: (name: string, suite: () => void) => void
declare const beforeEach: (setup: () => void) => void
declare const afterEach: (cleanup: () => void) => void
declare const test: (name: string, assertion: () => Promise<void> | void) => void
declare const expect: any
declare const jest: any

const hash = '00'.repeat(32)

const responsePayload: JclServiceResponse = {
  player: { id: '1', name: 'tester', kungfuId: 10627, kungfuName: '无方' },
  battle: { startFrame: 0, endFrame: 16, analysisSeconds: 1 },
  data: {},
  diagnostics: { unknownSkillIds: [], unknownBuffIds: [], unknownTalentIds: [] },
}

const manifest = {
  format: 2,
  pyodideVersion: '0.29.4',
  version: hash,
  basePath: `versions/${hash}/`,
  worker: { path: 'worker.js', sha256: hash },
  pythonArchive: { path: 'jcl-python.zip', sha256: hash, files: ['app/convert.py'] },
  runtime: { 'pyodide/pyodide.js': hash },
}

type WorkerOutcome = 'ready' | 'init-error' | 'convert-error' | 'result' | 'manual'

class MockWorker {
  static instances: MockWorker[] = []
  static outcomes: WorkerOutcome[] = []

  onmessage: ((event: MessageEvent<any>) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  terminated = false
  convertPosts = 0
  pendingResult: (() => void) | undefined

  constructor(public url: string) {
    MockWorker.instances.push(this)
  }

  postMessage(message: any) {
    if (message.type === 'init') {
      const outcome = MockWorker.outcomes.shift() || 'ready'
      queueMicrotask(() => {
        if (this.terminated) return
        if (outcome === 'init-error') {
          this.onmessage?.({ data: { type: 'error', message: 'init failed' } } as MessageEvent)
        } else {
          this.onmessage?.({ data: { type: 'ready' } } as MessageEvent)
        }
      })
      return
    }

    this.convertPosts += 1
    const outcome = MockWorker.outcomes.shift() || 'result'
    const finish = () => {
      if (this.terminated) return
      if (outcome === 'convert-error') {
        this.onmessage?.({ data: { type: 'error', message: 'convert failed' } } as MessageEvent)
      } else {
        this.onmessage?.({ data: { type: 'result', payload: responsePayload } } as MessageEvent)
      }
    }
    if (outcome === 'manual') this.pendingResult = finish
    else queueMicrotask(finish)
  }

  terminate() {
    this.terminated = true
  }
}

function mockSuccessfulFetch() {
  return jest.fn(async (url: string) => {
    if (String(url).endsWith('/manifest.json')) {
      return { ok: true, json: async () => manifest }
    }
    return { ok: true, arrayBuffer: async () => new Uint8Array([1]).buffer }
  })
}

async function flushMicrotasks() {
  for (let index = 0; index < 8; index += 1) await Promise.resolve()
}

async function waitUntil(predicate: () => boolean, message: string) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) return
    await new Promise((resolve) => window.setTimeout(resolve, 0))
  }
  throw new Error(message)
}

describe('JCL WASM service lifecycle', () => {
  beforeEach(() => {
    resetJclWasmServiceForTests()
    MockWorker.instances = []
    MockWorker.outcomes = []
    Object.defineProperty(globalThis, 'Worker', { configurable: true, value: MockWorker })
    Object.defineProperty(globalThis, 'fetch', { configurable: true, value: mockSuccessfulFetch() })
    Object.defineProperty(globalThis.crypto, 'subtle', {
      configurable: true,
      value: { digest: async () => new Uint8Array(32).buffer },
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    resetJclWasmServiceForTests()
  })

  test('clears failed initialization state and refetches the manifest', async () => {
    MockWorker.outcomes = ['init-error', 'ready', 'result']

    await expect(convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })).rejects.toThrow(
      'init failed',
    )
    await expect(convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })).resolves.toEqual(
      responsePayload,
    )

    const manifestRequests = (globalThis.fetch as any).mock.calls.filter(([url]: [string]) =>
      String(url).endsWith('/manifest.json'),
    )
    expect(manifestRequests).toHaveLength(2)
    expect(MockWorker.instances).toHaveLength(2)
  })

  test('continues the queue after a conversion failure', async () => {
    MockWorker.outcomes = ['ready', 'convert-error', 'ready', 'result']

    const failed = convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })
    const succeeded = convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })

    await expect(failed).rejects.toThrow('convert failed')
    await expect(succeeded).resolves.toEqual(responsePayload)
    expect(MockWorker.instances).toHaveLength(2)
  })

  test('serializes simultaneous conversions on one worker', async () => {
    MockWorker.outcomes = ['ready', 'manual', 'result']

    const first = convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })
    const second = convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })
    await waitUntil(() => MockWorker.instances[0]?.convertPosts === 1, '首个转换未启动')

    expect(MockWorker.instances).toHaveLength(1)
    expect(MockWorker.instances[0].convertPosts).toBe(1)
    MockWorker.instances[0].pendingResult?.()
    await expect(first).resolves.toEqual(responsePayload)
    await waitUntil(() => MockWorker.instances[0]?.convertPosts === 2, '第二个转换未启动')
    expect(MockWorker.instances[0].convertPosts).toBe(2)
    await expect(second).resolves.toEqual(responsePayload)
  })

  test('prevents a timed-out initialization from creating a stale worker', async () => {
    jest.useFakeTimers()
    let resolveFirstManifest: ((response: unknown) => void) | undefined
    const firstManifest = new Promise((resolve) => {
      resolveFirstManifest = resolve
    })
    const fetchMock = jest
      .fn()
      .mockImplementationOnce(() => firstManifest)
      .mockImplementation(async (url: string) => {
        if (String(url).endsWith('/manifest.json')) {
          return { ok: true, json: async () => manifest }
        }
        return { ok: true, arrayBuffer: async () => new Uint8Array([1]).buffer }
      })
    Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock })

    const timedOut = convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })
    const timeoutAssertion = expect(timedOut).rejects.toThrow('JCL 转换超时')
    await flushMicrotasks()
    await jest.advanceTimersByTimeAsync(90_000)
    await timeoutAssertion

    resolveFirstManifest?.({ ok: true, json: async () => manifest })
    await flushMicrotasks()
    expect(MockWorker.instances).toHaveLength(0)

    jest.useRealTimers()
    MockWorker.outcomes = ['ready', 'result']
    const retried = convertJclFileWithWasm(new ArrayBuffer(1), { targetLevel: 134 })
    await expect(retried).resolves.toEqual(responsePayload)
    expect(MockWorker.instances).toHaveLength(1)
  })
})
