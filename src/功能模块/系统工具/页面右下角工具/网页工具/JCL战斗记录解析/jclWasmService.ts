import { JCL_CONVERSION_TIMEOUT, type JclServiceResponse } from './jclService'
import {
  getJclWasmAssetBaseUrl,
  getJclWasmManifestUrl,
  getJclWasmVersionBaseUrl,
  normalizeJclWasmError,
  validateJclWasmManifest,
  type JclWasmOptions,
  type JclWasmManifest,
  type JclWasmProgressMessage,
  type JclWasmWorkerResponse,
} from './jclWasmProtocol'

export type JclWasmProgressCallback = (stage: JclWasmProgressMessage['stage']) => void

type JclWasmWorker = Worker & {
  onmessage: ((event: MessageEvent<JclWasmWorkerResponse>) => void) | null
}

let workerPromise: Promise<JclWasmWorker> | undefined
let conversionQueue = Promise.resolve()
let activeWorker: JclWasmWorker | undefined
let manifestPromise: Promise<JclWasmManifest> | undefined
let workerGeneration = 0

function createWorker(workerUrl: string): JclWasmWorker {
  activeWorker = new Worker(workerUrl) as JclWasmWorker
  return activeWorker
}

function resetWorker(worker?: JclWasmWorker) {
  const target = worker || activeWorker
  target?.terminate()
  if (!worker || worker === activeWorker) {
    workerGeneration += 1
    activeWorker = undefined
    manifestPromise = undefined
    workerPromise = undefined
  }
}

function assertWorkerGeneration(generation: number) {
  if (generation !== workerGeneration) {
    throw new Error('JCL 本地 Worker 初始化已取消')
  }
}

async function getManifest(): Promise<JclWasmManifest> {
  if (!manifestPromise) {
    const request = (async () => {
      const assetBaseUrl = getJclWasmAssetBaseUrl()
      const response = await fetch(getJclWasmManifestUrl(assetBaseUrl), { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('无法加载 JCL 本地资源清单')
      }
      const payload: unknown = await response.json().catch(() => undefined)
      return validateJclWasmManifest(payload)
    })()
    manifestPromise = request
    request.catch(() => {
      if (manifestPromise === request) manifestPromise = undefined
    })
  }
  return manifestPromise
}

async function getWorker(onProgress?: JclWasmProgressCallback): Promise<JclWasmWorker> {
  if (!workerPromise) {
    const generation = workerGeneration
    const initialization = (async () => {
      const manifest = await getManifest()
      assertWorkerGeneration(generation)
      const assetBaseUrl = getJclWasmAssetBaseUrl()
      const versionBaseUrl = getJclWasmVersionBaseUrl(assetBaseUrl, manifest)
      const workerUrl = new URL(manifest.worker.path, versionBaseUrl).toString()
      return new Promise<JclWasmWorker>((resolve, reject) => {
        const worker = createWorker(workerUrl)
        worker.onmessage = (event) => {
          if (generation !== workerGeneration) {
            worker.terminate()
            reject(new Error('JCL 本地 Worker 初始化已取消'))
            return
          }
          if (event.data.type === 'progress') {
            onProgress?.(event.data.stage)
          } else if (event.data.type === 'ready') {
            resolve(worker)
          } else if (event.data.type === 'error') {
            resetWorker(worker)
            reject(new Error(event.data.message))
          }
        }
        worker.onerror = (event) => {
          if (generation !== workerGeneration) return
          resetWorker(worker)
          reject(normalizeJclWasmError(event.error || event.message))
        }
        worker.postMessage({
          type: 'init',
          assetBaseUrl: versionBaseUrl,
          pythonArchivePath: manifest.pythonArchive.path,
          pyodideBasePath: 'pyodide/',
        })
      })
    })()
    workerPromise = initialization
    initialization.catch(() => {
      if (generation === workerGeneration) resetWorker()
    })
  }
  return workerPromise
}

export async function convertJclFileWithWasm(
  fileBuffer: ArrayBuffer,
  options: JclWasmOptions,
  onProgress?: JclWasmProgressCallback,
): Promise<JclServiceResponse> {
  const conversion = conversionQueue.then(async () => {
    let timeoutId: number | undefined
    let rejectTimeout: ((error: Error) => void) | undefined
    const timeoutPromise = new Promise<JclServiceResponse>((_, reject) => {
      rejectTimeout = reject
      timeoutId = window.setTimeout(() => {
        resetWorker()
        rejectTimeout?.(new Error('JCL 转换超时（90 秒）'))
      }, JCL_CONVERSION_TIMEOUT)
    })
    const workPromise = (async () => {
      const worker = await getWorker(onProgress)
      return new Promise<JclServiceResponse>((resolve, reject) => {
        let settled = false

        worker.onmessage = (event) => {
          if (event.data.type === 'progress') {
            onProgress?.(event.data.stage)
            return
          }
          if (event.data.type === 'ready') return
          if (settled) return
          settled = true
          if (event.data.type === 'result') {
            resolve(event.data.payload)
          } else {
            resetWorker(worker)
            reject(new Error(event.data.message))
          }
        }
        worker.onerror = (event) => {
          if (settled) return
          settled = true
          resetWorker(worker)
          reject(normalizeJclWasmError(event.error || event.message))
        }
        worker.postMessage({ type: 'convert', fileBuffer, options }, [fileBuffer])
      })
    })()

    try {
      return await Promise.race([workPromise, timeoutPromise])
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  })
  conversionQueue = conversion.then(
    () => undefined,
    () => undefined,
  )
  return conversion
}

export function resetJclWasmServiceForTests() {
  resetWorker()
  conversionQueue = Promise.resolve()
}
