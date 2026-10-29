'use strict'

const workerSelf = self

let pyodide
let pythonLoaded = false
let assetBaseUrl = ''
let pythonArchivePath = 'jcl-python.zip'
let pyodideBasePath = 'pyodide/'

function postProgress(stage) {
  workerSelf.postMessage({ type: 'progress', stage })
}

async function fetchAsset(assetPath) {
  const response = await fetch(new URL(assetPath, assetBaseUrl))
  if (!response.ok) {
    throw new Error(`无法加载 JCL 本地资源：${assetPath}`)
  }
  return response.arrayBuffer()
}

async function initRuntime(message) {
  if (pyodide && assetBaseUrl === message.assetBaseUrl) {
    workerSelf.postMessage({ type: 'ready' })
    return
  }

  assetBaseUrl = message.assetBaseUrl
  pythonArchivePath = message.pythonArchivePath || 'jcl-python.zip'
  pyodideBasePath = message.pyodideBasePath || 'pyodide/'
  postProgress('loading-runtime')
  workerSelf.importScripts(new URL(`${pyodideBasePath}pyodide.js`, assetBaseUrl).toString())
  const loadPyodide = workerSelf.loadPyodide
  if (!loadPyodide) {
    throw new Error('Pyodide 运行时未导出 loadPyodide')
  }
  pyodide = await loadPyodide({
    indexURL: new URL(pyodideBasePath, assetBaseUrl).toString(),
  })

  postProgress('loading-python')
  const pythonArchive = await fetchAsset(pythonArchivePath)
  pyodide.unpackArchive(pythonArchive, 'zip', { extractDir: '/' })
  pyodide.runPython("import sys; sys.path.insert(0, '/Formulator'); sys.path.insert(0, '/')")
  pythonLoaded = true
  workerSelf.postMessage({ type: 'ready' })
}

async function convert(message) {
  if (!pyodide || !pythonLoaded) {
    throw new Error('JCL 本地运行环境尚未初始化')
  }

  postProgress('converting')
  const inputPath = `/tmp/jcl-${Date.now()}-${Math.random().toString(16).slice(2)}.jcl`
  pyodide.FS.writeFile(inputPath, new Uint8Array(message.fileBuffer))

  try {
    const globals = pyodide.toPy({
      inputPath,
      playerId: message.options.playerId || '',
      targetLevel: message.options.targetLevel,
      maxTime: message.options.maxTime || 0,
    })
    try {
      const result = pyodide.runPython(
        [
          'import json',
          'from app.convert import convert_jcl',
          'json.dumps(convert_jcl(file_path=inputPath, player_id=playerId or None, target_id="", target_level=targetLevel, max_time=maxTime or None), ensure_ascii=False)',
        ].join('\n'),
        { globals },
      )
      workerSelf.postMessage({ type: 'result', payload: JSON.parse(String(result)) })
    } finally {
      globals.destroy()
    }
  } finally {
    pyodide.FS.unlink(inputPath)
  }
}

let messageQueue = Promise.resolve()

workerSelf.onmessage = (event) => {
  messageQueue = messageQueue
    .then(async () => {
      if (event.data.type === 'init') {
        await initRuntime(event.data)
      } else if (event.data.type === 'convert') {
        await convert(event.data)
      }
    })
    .catch((error) => {
      workerSelf.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : '浏览器本地 JCL 转换失败',
      })
    })
}
