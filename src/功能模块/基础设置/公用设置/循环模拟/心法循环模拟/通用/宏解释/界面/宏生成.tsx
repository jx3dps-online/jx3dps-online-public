import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Input, Space, Switch, Typography } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新网页设置 } from '@/store/system'
import type { 生成进度, 生成请求, 生成起点 } from '../生成/类型'
import type { 保存的宏 } from '../工具/配置存储'
import type { 生成任务诊断, 生成任务快照 } from '../生成/任务协议'
import { 创建生成任务 } from '../生成/任务控制'
import { 生成结果可应用 } from '../生成/结果校验'
import 异常反馈 from './异常反馈'

const 规范请求文本 = (文本?: string) => {
  if (!文本) return undefined
  try {
    const 值 = JSON.parse(文本)
    return JSON.stringify(
      {
        ...值,
        容差: 值.容差 ?? 0.125,
        随机种子: 值.随机种子 ?? 20261010,
        允许数字IDBuff: 值.允许数字IDBuff === true,
      },
      (_, 项) =>
        项 && typeof 项 === 'object' && !Array.isArray(项)
          ? Object.fromEntries(
              Object.keys(项)
                .sort()
                .map((键) => [键, 项[键]]),
            )
          : 项,
    )
  } catch {
    return undefined
  }
}

const 读取保存进度 = (进度?: 生成进度): 生成进度 | undefined =>
  进度?.已认证
    ? { ...进度, 已认证: false, 状态: '未完成', 说明: '保存结果需按当前合同重新认证，原文本已保留' }
    : 进度

export default function 宏生成({
  请求,
  应用,
  禁用,
  已保存,
  更新生成状态,
}: {
  请求: 生成请求
  应用: (文本: string) => void
  禁用: boolean
  已保存: 保存的宏['生成结果']
  更新生成状态: (状态: '运行' | '暂停' | '空闲') => void
}) {
  const dispatch = useAppDispatch()
  const 允许数字IDBuff = useAppSelector(
    (state) => state.system.网页设置.行为偏好.宏允许数字IDBuff === true,
  )
  const [进度, 设置进度] = useState<生成进度 | undefined>(() => 读取保存进度(已保存?.进度))
  const [诊断, 设置诊断] = useState<生成任务诊断 | undefined>(已保存?.诊断)
  const [错误, 设置错误] = useState('')
  const [运行中, 设置运行中] = useState(false)
  const [暂停状态, 设置暂停状态] = useState<生成任务快照['暂停状态']>('运行')
  const 任务 = useRef<ReturnType<typeof 创建生成任务>>()
  const 代次 = useRef(0)
  const 续算中 = useRef(false)
  const 状态回调 = useRef(更新生成状态)
  状态回调.current = 更新生成状态
  const 保存结果 = useRef(已保存)
  const 本次请求 = useRef(已保存?.请求)
  保存结果.current = 已保存
  const 基础请求文本 = JSON.stringify(请求)
  const 请求文本 = JSON.stringify({ ...请求, 允许数字IDBuff })
  const 当前请求文本 = useRef(请求文本)
  当前请求文本.current = 请求文本
  const 可续算 = !!进度?.宏 && 本次请求.current === 请求文本
  useEffect(() => {
    ++代次.current
    任务.current?.取消()
    任务.current = undefined
    设置运行中(false)
    设置暂停状态('运行')
    续算中.current = false
    设置进度(读取保存进度(保存结果.current?.进度))
    设置诊断(保存结果.current?.诊断)
    本次请求.current =
      规范请求文本(保存结果.current?.请求) === 规范请求文本(当前请求文本.current)
        ? 当前请求文本.current
        : 保存结果.current?.请求
    设置错误('')
    return () => {
      ++代次.current
      任务.current?.取消()
    }
  }, [基础请求文本])

  useEffect(() => {
    状态回调.current(运行中 ? (暂停状态 === '已暂停' ? '暂停' : '运行') : '空闲')
  }, [运行中, 暂停状态])
  useEffect(() => () => 状态回调.current('空闲'), [])

  const 开始 = (起点?: 生成起点) => {
    const 本轮 = ++代次.current
    任务.current?.取消()
    设置错误('')
    续算中.current = !!起点
    设置进度((旧) =>
      起点 && 旧
        ? { ...旧, 状态: '准备', 说明: '重新认证当前宏', 已认证: false, 起点已复核: false }
        : undefined,
    )
    设置诊断(undefined)
    设置运行中(true)
    设置暂停状态('运行')
    本次请求.current = 请求文本
    任务.current = 创建生成任务({ 请求: JSON.parse(请求文本), 起点 }, (快照) => {
      if (代次.current !== 本轮) return
      设置诊断(快照.诊断)
      设置暂停状态(快照.暂停状态)
      if (快照.进度) {
        const 新 = 快照.进度
        设置进度((旧) =>
          续算中.current && !新.起点已复核 && 旧 && !新.宏
            ? { ...旧, 状态: 快照.完成 ? '未完成' : '准备', 已认证: false, 说明: 新.说明 }
            : 新,
        )
      }
      if (快照.错误) 设置错误(快照.错误)
      if (快照.完成) {
        设置运行中(false)
        设置暂停状态('运行')
      }
    })
  }
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Typography.Title level={5}>从循环生成宏</Typography.Title>
      <Typography.Text type='secondary'>
        按当前循环生成并压缩宏，保留技能顺序、主动等待和引导跳数。
      </Typography.Text>
      <Alert
        type='warning'
        showIcon
        message='使用须知'
        description='当前生成算法仍在优化中，建议使用 180 秒以内的循环进行生成。'
      />
      <Typography.Text type='secondary'>
        关闭宏设置后继续计算，可随时重新打开查看。关闭循环模拟器或刷新页面会结束任务。
      </Typography.Text>
      <Space>
        <span>允许数字 ID Buff 条件（全门派）</span>
        <Switch
          aria-label='允许数字 ID Buff 条件（全门派）'
          checked={允许数字IDBuff}
          disabled={禁用 || 运行中}
          onChange={(允许) => dispatch(更新网页设置({ 行为偏好: { 宏允许数字IDBuff: 允许 } }))}
        />
      </Space>
      <Typography.Text type='secondary'>
        默认关闭，生成与压缩使用同一设置；修改后对新任务生效。
      </Typography.Text>
      <Space wrap>
        <Button onClick={() => 开始()} loading={运行中} disabled={禁用 || !请求.当前循环.length}>
          {进度?.宏 ? '重新生成' : '开始生成'}
        </Button>
        {可续算 && !运行中 && (
          <Button
            type='primary'
            disabled={禁用 || !请求.当前循环.length}
            onClick={() =>
              开始({
                宏: 进度!.宏,
                轮数: 进度!.轮数,
                阶段:
                  进度!.已认证 || !!进度!.认证 || !!进度!.压缩 || 进度!.宏.includes('|')
                    ? '压缩'
                    : '生成',
              })
            }
          >
            从当前宏继续
          </Button>
        )}
        {运行中 && (
          <Button
            onClick={() => (暂停状态 === '运行' ? 任务.current?.暂停() : 任务.current?.继续())}
          >
            {暂停状态 === '运行' ? '暂停' : '继续'}
          </Button>
        )}
        {运行中 && <Button onClick={() => 任务.current?.取消()}>取消</Button>}
      </Space>
      {可续算 && !运行中 && (
        <Typography.Text type='secondary'>
          继续时按当前固定合同重新认证；搜索历史会重建，可能再次尝试旧候选。
        </Typography.Text>
      )}
      {错误 && <Alert type='error' message={错误} />}
      {暂停状态 !== '运行' && (
        <Typography.Text type='secondary'>
          {暂停状态 === '已暂停'
            ? '已暂停，继续时保留当前搜索位置。'
            : '等待暂停边界；取消可直接终止当前工作。'}
        </Typography.Text>
      )}
      <异常反馈
        请求文本={本次请求.current || 请求文本}
        进度={进度}
        诊断={诊断}
        运行中={运行中}
        暂停={暂停状态 !== '运行'}
        停止中={false}
        错误={错误}
      />
      {进度 && (
        <>
          {本次请求.current !== 请求文本 && (
            <Alert type='warning' message='循环、参数或生成设置已改变，请重新生成。' />
          )}
          <Alert
            type={进度.状态 === '成功' ? 'success' : 进度.状态 === '错误' ? 'error' : 'info'}
            message={进度.说明}
            description={
              <>
                <div>{`第 ${进度.轮数} 轮 · 历史最佳前缀 ${进度.匹配数}/${进度.目标数}${进度.容差 !== undefined ? ` · 固定容差 ${(进度.容差 * 1000).toFixed(1)}ms` : ''}${进度.最大偏差 !== undefined ? ` · 同序动作最大偏差 ${(进度.最大偏差 * 1000).toFixed(1)}ms（含未匹配动作）` : ''}`}</div>
                {进度.最近回放 && (
                  <div>
                    最近候选：第 {进度.最近回放.轮数} 轮，匹配{' '}
                    {进度.最近回放.比较.acceptance_prefix}/{进度.目标数}
                  </div>
                )}
                {进度.首次分歧 && <div>历史最佳首次分歧：{进度.首次分歧}</div>}
              </>
            }
          />
          {进度.压缩 && (
            <Typography.Text type='secondary'>
              压缩 · UTF-16 字符 {进度.压缩.初始字符} → {进度.压缩.最佳字符} · 试算{' '}
              {进度.压缩.试算次数} 次 · 接受 {进度.压缩.接受次数} 次
            </Typography.Text>
          )}
          <Input.TextArea aria-label='生成宏预览' value={进度.宏} rows={8} readOnly />
          <Space wrap>
            <Button
              disabled={!进度.宏}
              onClick={() => {
                navigator.clipboard
                  .writeText(进度.宏)
                  .catch(() => 设置错误('复制失败，请从预览框手动复制'))
              }}
            >
              复制宏
            </Button>
            <Button
              disabled={运行中 || !生成结果可应用(进度) || 本次请求.current !== 请求文本}
              onClick={() => {
                if (!运行中 && 生成结果可应用(进度) && 本次请求.current === 请求文本) 应用(进度.宏)
              }}
            >
              应用到此宏
            </Button>
          </Space>
        </>
      )}
    </Space>
  )
}
