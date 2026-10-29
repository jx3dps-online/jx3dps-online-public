import type { JclServiceResponse } from './jclService'

export type JclWasmStage = 'loading-runtime' | 'loading-python' | 'converting'

export interface JclWasmOptions {
  targetLevel: number
  maxTime?: number
  playerId?: string
}

export interface JclWasmInitMessage {
  type: 'init'
  assetBaseUrl: string
  pythonArchivePath: string
  pyodideBasePath: string
}

export interface JclWasmConvertMessage {
  type: 'convert'
  fileBuffer: ArrayBuffer
  options: JclWasmOptions
}

export type JclWasmWorkerRequest = JclWasmInitMessage | JclWasmConvertMessage

export interface JclWasmProgressMessage {
  type: 'progress'
  stage: JclWasmStage
}

export interface JclWasmResultMessage {
  type: 'result'
  payload: JclServiceResponse
}

export interface JclWasmReadyMessage {
  type: 'ready'
}

export interface JclWasmErrorMessage {
  type: 'error'
  message: string
}

export type JclWasmWorkerResponse =
  | JclWasmProgressMessage
  | JclWasmReadyMessage
  | JclWasmResultMessage
  | JclWasmErrorMessage

export interface JclWasmManifest {
  format: 2
  pyodideVersion: string
  version: string
  basePath: string
  worker: {
    path: string
    sha256: string
  }
  pythonArchive: {
    path: string
    sha256: string
    files: string[]
  }
  runtime: Record<string, string>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isSafeRelativePath(value: unknown, allowTrailingSlash = false): value is string {
  const path = typeof value === 'string' ? value : ''
  const normalizedPath = allowTrailingSlash ? path.replace(/\/$/, '') : path
  return (
    normalizedPath.length > 0 &&
    !normalizedPath.startsWith('/') &&
    !normalizedPath.includes('\\') &&
    !normalizedPath.includes(':') &&
    !normalizedPath.includes('%') &&
    !normalizedPath.includes('?') &&
    !normalizedPath.includes('#') &&
    !normalizedPath.split('/').some((part) => part === '..' || part === '')
  )
}

function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || !value) {
    throw new Error(`JCL 本地资源清单字段无效：${name}`)
  }
}

export function validateJclWasmManifest(value: unknown): JclWasmManifest {
  if (!isRecord(value) || value.format !== 2) {
    throw new Error('JCL 本地资源清单版本不受支持')
  }

  assertString(value.pyodideVersion, 'pyodideVersion')
  assertString(value.version, 'version')
  if (!isSafeRelativePath(value.basePath, true) || !value.basePath.endsWith('/')) {
    throw new Error('JCL 本地资源清单路径无效：basePath')
  }
  if (value.basePath !== `versions/${value.version}/`) {
    throw new Error('JCL 本地资源清单版本路径不匹配')
  }

  if (!isRecord(value.worker)) {
    throw new Error('JCL 本地资源清单字段无效：worker')
  }
  if (!isSafeRelativePath(value.worker.path)) {
    throw new Error('JCL 本地资源清单路径无效：worker.path')
  }

  if (!isRecord(value.pythonArchive)) {
    throw new Error('JCL 本地资源清单字段无效：pythonArchive')
  }
  if (!isSafeRelativePath(value.pythonArchive.path)) {
    throw new Error('JCL 本地资源清单路径无效：pythonArchive.path')
  }
  if (
    !Array.isArray(value.pythonArchive.files) ||
    value.pythonArchive.files.some((file) => !isSafeRelativePath(file))
  ) {
    throw new Error('JCL 本地资源清单字段无效：pythonArchive.files')
  }

  if (!isRecord(value.runtime)) {
    throw new Error('JCL 本地资源清单字段无效：runtime')
  }
  for (const file of Object.keys(value.runtime)) {
    if (!isSafeRelativePath(file) || !file.startsWith('pyodide/')) {
      throw new Error(`JCL 本地资源清单路径无效：runtime.${file}`)
    }
  }

  return value as unknown as JclWasmManifest
}

export function normalizeJclWasmError(error: unknown): Error {
  if (error instanceof Error && error.message) {
    return error
  }
  if (typeof error === 'string' && error) {
    return new Error(error)
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message) {
      return new Error(message)
    }
  }
  return new Error('浏览器本地 JCL 转换失败')
}

function ensureDirectoryUrl(baseUri: string): URL {
  const url = new URL(baseUri)
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/'
  }
  return url
}

function getLoadedMainScriptUrl(baseUri: string, mainScriptUrl?: string): URL | undefined {
  const candidates = mainScriptUrl
    ? [mainScriptUrl]
    : typeof document === 'undefined'
      ? []
      : Array.from(document.scripts)
          .reverse()
          .map((script) => script.src)
          .filter(Boolean)

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate, baseUri)
      if (url.pathname.includes('/static/js/')) {
        return url
      }
    } catch {
      // Ignore malformed script URLs and keep the baseURI fallback.
    }
  }

  return undefined
}

export function getJclWasmAssetBaseUrl(
  baseUri = typeof document === 'undefined' ? 'http://localhost/' : document.baseURI,
  publicUrl = process.env.PUBLIC_URL,
  mainScriptUrl?: string,
): string {
  const normalizedPublicUrl = publicUrl?.trim()
  const hasExplicitPublicUrl =
    !!normalizedPublicUrl &&
    normalizedPublicUrl !== '.' &&
    normalizedPublicUrl !== './' &&
    (/^[a-z][a-z\d+.-]*:/i.test(normalizedPublicUrl) || normalizedPublicUrl.startsWith('/'))

  if (hasExplicitPublicUrl && normalizedPublicUrl) {
    if (/^[a-z][a-z\d+.-]*:/i.test(normalizedPublicUrl)) {
      return new URL('jcl-wasm/', ensureDirectoryUrl(normalizedPublicUrl)).toString()
    }

    if (normalizedPublicUrl.startsWith('/')) {
      const origin = new URL(baseUri).origin
      const publicPath = normalizedPublicUrl.replace(/\/+$/, '') || '/'
      return new URL(`${publicPath === '/' ? '' : publicPath}/jcl-wasm/`, `${origin}/`).toString()
    }
  }

  if (!hasExplicitPublicUrl) {
    const scriptUrl = getLoadedMainScriptUrl(baseUri, mainScriptUrl)
    if (scriptUrl) {
      const staticJsIndex = scriptUrl.pathname.indexOf('/static/js/')
      const deploymentRoot = scriptUrl.pathname.slice(0, staticJsIndex) || '/'
      return new URL(
        `${deploymentRoot === '/' ? '' : deploymentRoot}/jcl-wasm/`,
        `${scriptUrl.origin}/`,
      ).toString()
    }
  }

  return new URL('jcl-wasm/', ensureDirectoryUrl(baseUri)).toString()
}

export function getJclWasmManifestUrl(assetBaseUrl: string): string {
  return new URL('manifest.json', ensureDirectoryUrl(assetBaseUrl)).toString()
}

export function getJclWasmVersionBaseUrl(assetBaseUrl: string, manifest: JclWasmManifest): string {
  return new URL(manifest.basePath, ensureDirectoryUrl(assetBaseUrl)).toString()
}
