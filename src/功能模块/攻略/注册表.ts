import { ComponentType, LazyExoticComponent, lazy } from 'react'

declare const require: {
  context(
    directory: string,
    recursive: boolean,
    pattern: RegExp,
    mode: 'lazy',
  ): {
    (file: string): Promise<{ default: ComponentType }>
    keys(): string[]
  }
}

/**
 * 攻略注册表
 * key 与循环 JSON 中的「攻略key」字段对应，命中后渲染对应攻略组件。
 * 攻略组件统一使用 React.lazy 懒加载，未命中不会加载对应资源。
 *
 * 目录示例：心法/孤锋诀/一键宏/index.tsx -> 孤锋诀/一键宏。
 */
// 所有攻略使用同一目录约定与 index.tsx，新增攻略无需手工登记。
const 攻略文件 = require.context('./心法', true, /^\.\/[^/]+\/[^/]+\/index\.tsx$/, 'lazy')
const 攻略注册表: Record<string, LazyExoticComponent<ComponentType>> = Object.create(null)
攻略文件.keys().forEach((文件: string) => {
  const key = 文件.slice(2, -'/index.tsx'.length)
  攻略注册表[key] = lazy(() => 攻略文件(文件))
})
export const 获取攻略组件 = (key?: string): ComponentType | undefined => {
  return key ? 攻略注册表[key] : undefined
}

export default 攻略注册表
