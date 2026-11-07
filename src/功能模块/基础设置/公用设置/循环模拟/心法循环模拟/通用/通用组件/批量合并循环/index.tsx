import { Alert, Button, Checkbox, Drawer, Form, Input, message, Progress, Space } from 'antd'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from 'react-redux'
import type { RootState } from '@/store'
import { useAppSelector } from '@/hooks'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 获取心法加速阈值, 获取主要加速阈值 } from '@/数据/加速阈值'
import { use心法数据 } from '@/心法模块/心法上下文'
import type { 循环基础技能数据类型 } from '../../通用框架/类型定义/技能'
import CycleSimulatorContext from '../../../../context'
import { 生成实际技能序列 } from '../../通用函数'
import { 执行批量计算, 准备模拟任务, 筛选导出循环 } from './计算'
import type { 批量模拟配置, 待合并序列, 批量计算结果, 计算进度 } from './类型'
import 序列编辑 from './序列编辑'
import 计算结果 from './计算结果'
import styles from './index.module.less'

export default function 批量合并循环({
  配置,
  技能数据,
  onClose,
}: {
  配置: 批量模拟配置
  技能数据: 循环基础技能数据类型[]
  onClose: () => void
}) {
  const 上下文 = useContext(CycleSimulatorContext)
  const 心法 = use心法数据()
  const store = useStore<RootState>()
  const 装备信息 = useAppSelector((state) => state.data.装备信息)
  const 增益数据 = useAppSelector((state) => state.data.增益数据)
  const 团队增益轴 = useAppSelector((state) => state.data.团队增益轴)
  const 特殊配置 = useAppSelector((state) => state.data.特殊配置)
  const 输出目标 = useAppSelector((state) => state.data.当前输出计算目标名称)
  const 阈值列表 = useMemo(() => 获取心法加速阈值(心法), [心法])
  const [名称, 设置名称] = useState('')
  const [序列列表, 设置序列列表] = useState<待合并序列[]>([])
  const [校验腰坠, 设置校验腰坠] = useState(true)
  const [计算中, 设置计算中] = useState(false)
  const [总轮次, 设置总轮次] = useState(0)
  const [记录, 设置记录] = useState<计算进度[]>([])
  const [结果, 设置结果] = useState<批量计算结果>()
  const [选中结果索引, 设置选中结果索引] = useState<number[]>([])
  const 下载循环 = useMemo(
    () => 结果 && 筛选导出循环(结果.循环, 选中结果索引),
    [结果, 选中结果索引],
  )
  const [错误, 设置错误] = useState('')
  const 序号 = useRef(0)
  const 运行任务 = useRef<{ worker: Worker; 控制器: AbortController }>()

  const 取消计算 = () => {
    运行任务.current?.控制器.abort()
    运行任务.current?.worker.terminate()
    运行任务.current = undefined
    设置计算中(false)
  }
  useEffect(() => {
    取消计算()
    设置结果(undefined)
    设置记录([])
    return () => {
      运行任务.current?.控制器.abort()
      运行任务.current?.worker.terminate()
    }
  }, [
    配置.心法,
    装备信息,
    增益数据,
    团队增益轴,
    特殊配置,
    输出目标,
    上下文.奇穴信息,
    上下文.秘籍信息,
    上下文.增益启用,
    上下文.启用团队增益快照,
    上下文.当前副本事件实例列表,
  ])

  const 更新序列 = (列表: 待合并序列[]) => {
    设置序列列表(列表)
    设置结果(undefined)
    设置记录([])
    设置错误('')
  }
  const 添加序列 = (当前 = false) => {
    const 编号 = ++序号.current
    更新序列([
      ...序列列表,
      {
        编号,
        名称: `序列${编号}`,
        文本: 当前 ? 生成实际技能序列(上下文.cycle).join(',') : '',
        起手Buff配置: structuredClone(上下文.起手Buff配置),
        心法配置: structuredClone(配置.参数),
        按阈值选择: true,
        选中阈值: 获取主要加速阈值(阈值列表).flatMap((组) =>
          组.档位.slice(0, 3).map((项) => 项.标识),
        ),
        加速输入: String(上下文.加速值),
        延迟: [0, 1, 2],
      },
    ])
  }

  const 开始计算 = async () => {
    if (运行任务.current) return
    设置错误('')
    设置结果(undefined)
    设置记录([])
    try {
      if (!名称.trim()) throw new Error('请输入最终循环名称')
      const 任务 = 准备模拟任务(
        序列列表,
        阈值列表,
        技能数据,
        上下文.大橙武模拟,
        校验腰坠,
        心法.心法所属端 === '无界',
      )
      const 基准状态 = store.getState()
      const 当前任务 = {
        worker: new Worker(new URL('./worker.ts', import.meta.url)),
        控制器: new AbortController(),
      }
      运行任务.current = 当前任务
      设置总轮次(任务.length)
      设置计算中(true)
      try {
        const 合并结果 = await 执行批量计算({
          心法: 配置.心法,
          名称: 名称.trim(),
          任务,
          公共参数: {
            奇穴: structuredClone(上下文.奇穴信息),
            秘籍: structuredClone(上下文.秘籍信息),
            大橙武模拟: 上下文.大橙武模拟,
            启用团队增益快照: 上下文.启用团队增益快照,
            团队增益轴: structuredClone(团队增益轴),
            副本事件实例列表: structuredClone(上下文.当前副本事件实例列表),
          },
          worker: 当前任务.worker,
          signal: 当前任务.控制器.signal,
          更新进度: 设置记录,
          计算秒伤: (详情) =>
            秒伤计算({
              更新循环技能列表: 详情.技能详情,
              更新计算时间: 详情.战斗时间,
              更新奇穴数据: 上下文.奇穴信息,
              更新秘籍信息: 上下文.秘籍信息,
              更新增益启用: 上下文.增益启用,
              计算技能详情: false,
            })(undefined, () => 基准状态).秒伤,
        })
        if (运行任务.current === 当前任务) {
          设置选中结果索引(合并结果.循环.循环详情.map((_, 索引) => 索引))
          设置结果(合并结果)
        }
      } finally {
        当前任务.worker.terminate()
        if (运行任务.current === 当前任务) {
          运行任务.current = undefined
          设置计算中(false)
        }
      }
    } catch (异常) {
      if (异常 instanceof DOMException && 异常.name === 'AbortError') return
      设置错误(异常 instanceof Error ? 异常.message : '批量计算失败')
    }
  }

  const 下载 = () => {
    if (!下载循环) return
    const 地址 = URL.createObjectURL(
      new Blob([JSON.stringify(下载循环, null, 2)], { type: 'application/json' }),
    )
    const 链接 = document.createElement('a')
    链接.href = 地址
    链接.download = `${下载循环.名称.replace(/[<>:"/\\|?*]/g, '_')}.json`
    链接.click()
    setTimeout(() => URL.revokeObjectURL(地址), 1000)
    message.success('已下载合并循环 JSON')
  }
  return (
    <Drawer
      title='批量合并计算循环'
      open
      width='min(1120px, 100vw)'
      maskClosable={false}
      onClose={() => {
        取消计算()
        onClose()
      }}
      extra={
        <Space>
          {计算中 && <Button onClick={取消计算}>取消计算</Button>}
          <Button type='primary' disabled={计算中 || !下载循环} onClick={下载}>
            下载 JSON
          </Button>
        </Space>
      }
    >
      <div className={styles.表单}>
        <Alert
          type='info'
          showIcon
          message='每条序列分别模拟所选加速和延迟，同加速、同延迟选取快照 DPS 最高的一项，合并胜出序列。'
          description={`使用当前配装、奇穴、秘籍、增益和副本事件；当前武器：${上下文.大橙武模拟 ? '橙武' : '紫武'}。加速按范围下限采样，包含下限、不含上限，最终上限为 99999。`}
        />
        <Form disabled={计算中}>
          <div className={styles.表单}>
            <label>
              最终循环名称
              <Input
                value={名称}
                onChange={(e) => {
                  设置名称(e.target.value)
                  设置结果(undefined)
                }}
                placeholder='用于导出的循环名称'
              />
            </label>
            <Checkbox
              checked={校验腰坠}
              onChange={(e) => {
                设置校验腰坠(e.target.checked)
                设置结果(undefined)
              }}
            >
              校验特效腰坠
            </Checkbox>
            {序列列表.map((序列) => (
              <序列编辑
                key={序列.编号}
                序列={序列}
                配置={配置}
                阈值列表={阈值列表}
                onChange={(值) =>
                  更新序列(序列列表.map((项) => (项.编号 === 序列.编号 ? { ...项, ...值 } : 项)))
                }
                onDelete={() => 更新序列(序列列表.filter((项) => 项.编号 !== 序列.编号))}
                onCopy={() =>
                  更新序列([
                    ...序列列表,
                    {
                      ...structuredClone(序列),
                      编号: ++序号.current,
                      名称: `${序列.名称}_副本${序号.current}`,
                    },
                  ])
                }
              />
            ))}
            <Space>
              <Button onClick={() => 添加序列()}>添加序列</Button>
              <Button onClick={() => 添加序列(true)}>添加当前模拟器序列</Button>
            </Space>
          </div>
        </Form>
        <Button type='primary' loading={计算中} onClick={开始计算} disabled={!序列列表.length}>
          一键合并计算循环
        </Button>
        {(计算中 || 记录.length > 0) && (
          <Progress
            percent={总轮次 ? Math.round((记录.length / 总轮次) * 100) : 0}
            format={() => `${记录.length} / ${总轮次}`}
          />
        )}
        {错误 && <Alert type='error' showIcon message={错误} />}
        <计算结果 结果={结果} 记录={记录} 选中索引={选中结果索引} 更新选中索引={设置选中结果索引} />
      </div>
    </Drawer>
  )
}
