import type { PyodideInterface } from 'pyodide'
import type { 有限求解 } from './原生压缩/局部求解'
import { 文本指纹 } from './身份'

export interface 器灵运行环境 {
  版本: { 算法: string; Python: string; 求解器: string }
  求解: 有限求解
}

const 求解器指纹 = 'd49a91527dc4f65e4a5a938b86a16937decadcbdbd806833d28ce25eb24cd3a9'

export const 加载器灵运行时 = async (
  记录?: (消息: Record<string, unknown>) => void,
): Promise<器灵运行环境> => {
  let 求解器: Promise<{ Python: PyodideInterface; 求解: any }> | undefined
  const 加载求解器 = async () => {
    const 开始 = performance.now()
    const 根地址 = new URL(
      (process.env.PUBLIC_URL || '').replace(/\/$/, '') + '/jcl-wasm/',
      self.location.origin,
    )
    const 清单响应 = await fetch(new URL('manifest.json', 根地址))
    if (!清单响应.ok) throw new Error('无法加载宏求解器运行时清单')
    const 清单 = await 清单响应.json()
    const 运行地址 = new URL('pyodide/', new URL(清单.basePath, 根地址))
    const 线程 = self as unknown as {
      importScripts: (...地址: string[]) => void
      loadPyodide: (设置: { indexURL: string }) => Promise<PyodideInterface>
    }
    线程.importScripts(new URL('pyodide.js', 运行地址).toString())
    const Python = await 线程.loadPyodide({ indexURL: 运行地址.toString() })
    const 响应 = await fetch(
      new URL(
        './运行依赖/z3_solver-5.1.0.0-py3-none-pyemscripten_2026_0_wasm32.whl',
        import.meta.url,
      ),
    )
    if (!响应.ok) throw new Error('无法加载宏压缩求解器')
    const 内容 = await 响应.arrayBuffer()
    const 指纹 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', 内容)), (项) =>
      项.toString(16).padStart(2, '0'),
    ).join('')
    if (指纹 !== 求解器指纹) throw new Error('宏压缩求解器文件校验失败')
    Python.unpackArchive(内容, 'zip', {
      extractDir: Python.runPython('import site; site.getsitepackages()[0]'),
    })
    const 桥响应 = await fetch(new URL('./有限求解.py', import.meta.url))
    if (!桥响应.ok) throw new Error('无法加载有限求解接口')
    const 源码 = await 桥响应.text()
    await Python.runPythonAsync(源码)
    const 求解 = Python.globals.get('求解有限窗口')
    记录?.({
      phase: 'solver_load_profile',
      loading_ms: performance.now() - 开始,
      python: Python.runPython('import platform; platform.python_version()'),
      pyodide: Python.version,
      bridge_hash: await 文本指纹(源码),
    })
    return { Python, 求解 }
  }
  return {
    版本: {
      算法: 'native-ts-qiling-v1:' + (process.env.REACT_APP_MACRO_BUILD_SHA || 'local'),
      Python: 'lazy-z3-binding',
      求解器: 求解器指纹,
    },
    求解: async (请求) => {
      求解器 ??= 加载求解器()
      const 环境 = await 求解器
      const 开始 = performance.now()
      const 文本 = JSON.stringify(请求)
      const 结果 = JSON.parse(环境.求解(文本))
      记录?.({
        phase: 'solver_profile',
        elapsed_ms: performance.now() - 开始,
        constraint_chars: 请求.smt.length,
        request_chars: 文本.length,
        model_count: 结果.models.length,
      })
      return 结果
    },
  }
}
