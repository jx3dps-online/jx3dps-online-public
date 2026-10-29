import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { Alert, Popover, Tooltip } from 'antd'
import { CodeOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons'
import type { 宏入口属性 } from './入口'
import type { 保存的宏, 配置保存结果 } from '../工具/配置存储'
import { 创建宏存储, 宏数量上限 } from '../工具/配置存储'
import { 创建宏任务 } from '../工具/运行任务'
import { 包含分页声明 } from '../工具/分页编辑'
import { 包含宏调用 } from '../核心/宏调用'
import { 生成实际技能序列, 获取实际技能数据 } from '../../通用函数'
import 样式 from './宏栏.module.less'

const 宏面板 = lazy(() => import('..'))

export default function 宏栏({
  心法,
  参数,
  技能数据,
  当前循环,
  更新循环,
}: Omit<宏入口属性, 'children'>) {
  const 存储 = useMemo(() => 创建宏存储(心法), [心法])
  const 缓存 = useSyncExternalStore(存储.订阅, 存储.读取)
  const [编辑id, 设置编辑id] = useState<string>()
  const [已打开宏, 设置已打开宏] = useState<string[]>([])
  const [生成状态, 设置生成状态] = useState<Record<string, '运行' | '暂停'>>({})
  const 更新生成状态 = useCallback((id: string, 状态: '运行' | '暂停' | '空闲') => {
    设置生成状态((旧) => {
      if ((旧[id] ?? '空闲') === 状态) return 旧
      const 新 = { ...旧 }
      if (状态 === '空闲') delete 新[id]
      else 新[id] = 状态
      return 新
    })
  }, [])
  const 打开设置 = (id: string) => {
    设置已打开宏((旧) => (旧.includes(id) ? 旧 : [...旧, id]))
    设置编辑id(id)
  }
  const [错误, 设置错误] = useState('')
  const 外部错误 = 错误 || 存储.读取错误() || ''
  const 编辑中宏 = 缓存.宏.find((宏) => 宏.id === 编辑id)
  const [运行id, 设置运行id] = useState<string>()
  const 任务引用 = useRef<ReturnType<typeof 创建宏任务>>()
  const 修订 = useRef(0)
  const 宏记录 = useRef(new Map<string, { 输入: string[]; 参数: string; 上个技能: string }>())
  const 参数文本 = JSON.stringify(参数)
  const 循环文本 = JSON.stringify(当前循环)
  const 缓存文本 = JSON.stringify(缓存)
  const 停止 = useCallback(() => {
    ++修订.current
    任务引用.current?.取消()
    任务引用.current = undefined
    设置运行id(undefined)
  }, [])
  useEffect(() => {
    停止()
    return () => {
      ++修订.current
      任务引用.current?.取消()
    }
  }, [心法, 参数文本, 循环文本, 缓存文本, 停止])

  const 修改 = (宏: 保存的宏): 配置保存结果 => {
    try {
      存储.更新(宏)
      设置错误('')
      return { 成功: true }
    } catch (错误) {
      const 信息 = 错误 instanceof Error ? 错误.message : String(错误)
      设置错误(信息)
      return { 成功: false, 错误: 信息 }
    }
  }
  const 执行 = async (宏: 保存的宏, 单次: boolean) => {
    if (运行id) return
    设置错误('')
    const 本次修订 = ++修订.current
    try {
      const 文本 = 宏.编辑.模式 === '翻页' ? 宏.编辑.翻页 : 宏.编辑.单页
      if (宏.编辑.模式 === '单页' && 包含分页声明(文本))
        throw new Error('当前为不翻页模式，请移除 #page 或选择体态翻页')
      const 已有输入 = 生成实际技能序列(当前循环)
      const 记录 = 宏记录.current.get(宏.id)
      const 上个技能 =
        记录?.参数 === 参数文本 && 记录.输入.every((输入, 索引) => 已有输入[索引] === 输入)
          ? 记录.上个技能
          : ''
      const 任务 = 创建宏任务({
        类型: '运行',
        心法,
        参数: JSON.parse(参数文本),
        当前循环: 已有输入,
        上个技能,
        单次,
        文本,
        宏列表: 缓存.宏.map((项) => ({
          名称: 项.名称,
          文本: 项.编辑.模式 === '翻页' ? 项.编辑.翻页 : 项.编辑.单页,
          模式: 项.编辑.模式,
        })),
        秒数: 宏.秒数,
        气血比例: 宏.气血比例,
        环境: 宏.环境,
      })
      任务引用.current = 任务
      设置运行id(宏.id)
      const 回复 = await 任务.结果
      if (本次修订 !== 修订.current) return
      const 序列 = 生成实际技能序列(
        回复.结果!.轨迹.map((行) => ({ 技能名称: 行.技能, 额外信息: 行.额外信息 })),
      )
      if (!序列.length) throw new Error('指定时长内没有可释放技能，请检查宏条件和当前循环状态')
      const 追加 = 序列.map((输入) => {
        const { 实际技能名称, 额外信息 } = 获取实际技能数据(输入)
        const 技能 = 技能数据.find((项) => 项.技能名称 === 实际技能名称)
        if (!技能) throw new Error('循环模拟器不支持技能：' + 实际技能名称)
        return 额外信息 ? { ...技能, 额外信息 } : { ...技能 }
      })
      宏记录.current.set(宏.id, {
        输入: [...已有输入, ...序列],
        参数: 参数文本,
        上个技能: 回复.结果!.最终状态.上个技能,
      })
      更新循环([...当前循环, ...追加])
    } catch (错误) {
      if (本次修订 === 修订.current) 设置错误((错误 as Error).message)
    } finally {
      if (本次修订 === 修订.current) {
        任务引用.current = undefined
        设置运行id(undefined)
      }
    }
  }

  return (
    <Popover
      placement='topLeft'
      trigger={[]}
      open={!!外部错误 && !编辑中宏}
      content={<Alert className={样式.警告} type='error' showIcon message={外部错误} />}
    >
      <div>
        <div className={样式.宏栏}>
          <span className={样式.标题}>宏</span>
          <div className={样式.列表}>
            {缓存.宏.map((宏) => (
              <div
                className={
                  样式.宏 +
                  (生成状态[宏.id] ? ' ' + 样式.生成中 : '') +
                  (生成状态[宏.id] === '暂停' ? ' ' + 样式.生成暂停 : '') +
                  (包含宏调用(宏.编辑.模式 === '翻页' ? 宏.编辑.翻页 : 宏.编辑.单页)
                    ? ' ' + 样式.超级宏
                    : '')
                }
                key={宏.id}
              >
                <Tooltip
                  title={
                    生成状态[宏.id]
                      ? 生成状态[宏.id] === '暂停'
                        ? '生成已暂停，点击齿轮继续'
                        : '正在生成宏，关闭设置仍会继续'
                      : 运行id === 宏.id
                        ? '正在运行'
                        : 包含宏调用(宏.编辑.模式 === '翻页' ? 宏.编辑.翻页 : 宏.编辑.单页)
                          ? '超级宏：追加一次成功释放'
                          : '追加一次成功释放'
                  }
                >
                  <button
                    type='button'
                    className={样式.运行按钮}
                    aria-label={'运行宏：' + 宏.名称}
                    aria-busy={生成状态[宏.id] === '运行'}
                    disabled={!!运行id}
                    onClick={() => 执行(宏, true)}
                  >
                    {宏.图标 ? (
                      <img className={样式.图标} src={宏.图标} alt={宏.名称} />
                    ) : (
                      <span className={样式.图标 + ' ' + 样式.占位图标}>
                        <CodeOutlined />
                      </span>
                    )}
                    <span className={样式.名称}>{宏.名称 || '未命名宏'}</span>
                  </button>
                </Tooltip>
                <button
                  type='button'
                  className={样式.齿轮}
                  aria-label={'设置宏：' + 宏.名称}
                  onClick={() => {
                    停止()
                    打开设置(宏.id)
                  }}
                >
                  <SettingOutlined />
                </button>
              </div>
            ))}
            <Tooltip title={缓存.宏.length >= 宏数量上限 ? '当前心法最多 16 个宏' : '新增宏'}>
              <button
                type='button'
                className={样式.新增}
                aria-label='新增宏'
                disabled={!!运行id || 缓存.宏.length >= 宏数量上限}
                onClick={() => {
                  try {
                    打开设置(存储.新增(技能数据.find((项) => 项.图标)?.图标 || ''))
                    设置错误('')
                  } catch (错误) {
                    设置错误((错误 as Error).message)
                  }
                }}
              >
                <PlusOutlined />
              </button>
            </Tooltip>
          </div>
        </div>
        {缓存.宏
          .filter((宏) => 已打开宏.includes(宏.id))
          .map((当前宏) => (
            <Suspense key={当前宏.id} fallback={null}>
              <宏面板
                展示={编辑id === 当前宏.id}
                更新生成状态={更新生成状态}
                心法={心法}
                模拟参数={参数}
                当前循环={生成实际技能序列(当前循环)}
                配置={当前宏}
                更新配置={修改}
                错误={外部错误}
                运行中={!!运行id}
                执行={() => 执行(当前宏, false)}
                停止={停止}
                清空循环={() => {
                  停止()
                  宏记录.current.clear()
                  设置错误('')
                  更新循环([])
                }}
                关闭={() => {
                  停止()
                  设置编辑id(undefined)
                }}
                删除={() => {
                  try {
                    存储.删除(当前宏.id)
                    设置编辑id(undefined)
                    设置错误('')
                  } catch (错误) {
                    设置错误((错误 as Error).message)
                  }
                }}
              />
            </Suspense>
          ))}
      </div>
    </Popover>
  )
}
