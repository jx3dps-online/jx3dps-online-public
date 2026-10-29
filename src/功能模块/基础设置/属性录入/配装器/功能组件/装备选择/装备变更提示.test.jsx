import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import 装备部位选择 from './装备部位选择'
import 附魔选择 from './附魔选择'

jest.mock('@/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}))
jest.mock('../../工具函数/根据表单选项获取装备信息', () => jest.fn())
jest.mock('../../工具函数/计算候选收益', () => ({
  计算候选收益: jest.fn(),
  格式化收益文本: jest.fn(),
}))
jest.mock('./index', () => ({ 获取最大精炼等级: () => 6 }))
jest.mock(
  './装备部位选择/装备详情容器',
  () =>
    ({ children }) =>
      children,
)
jest.mock(
  './装备部位选择/渐变特效文字',
  () =>
    ({ text }) =>
      text,
)
jest.mock('@/组件/图片展示', () => () => null)
jest.mock('./装备部位选择/index.module.less', () => ({}))
jest.mock('./装备部位选择/index.css', () => ({}))
jest.mock('./附魔选择/index.css', () => ({}))

const 暗器 = { id: 11, 装备部位: '暗器', 附魔: 1001 }
const 武器 = { id: 12, 装备部位: '武器', 附魔: 1002 }
const 帽子 = { id: 1, 装备部位: '帽子' }
const 附魔列表 = [
  { id: 1001, 附魔名称: '附魔一', 附魔效果简写: '附魔一', 附魔颜色: '紫' },
  { id: 1002, 附魔名称: '附魔二', 附魔效果简写: '附魔二', 附魔颜色: '紫' },
]

let 当前状态

beforeEach(() => {
  当前状态 = { data: { 装备信息: { 装备列表: [武器, 帽子, 暗器] } } }
  useAppSelector.mockImplementation((selector) => selector(当前状态))
  useAppDispatch.mockReturnValue(jest.fn())
})

const 通用入参 = {
  form: {},
  开启装备智能对比: false,
  对比显示百分比: false,
  候选按收益排序: false,
}

function 选择组件({ value, 部位索引, 部位, onChange }) {
  return (
    <>
      <装备部位选择
        {...通用入参}
        部位索引={部位索引}
        部位={部位}
        value={value?.id}
        allValue={value}
        onChange={(id) => onChange?.({ ...value, id })}
        默认镶嵌宝石等级={8}
        对比加速={true}
        装备选择范围={{}}
        装备数据列表={[
          { id: 11, 装备名称: '已保存暗器', 装备增益: [] },
          { id: 12, 装备名称: '已保存武器', 装备增益: [] },
          { id: 99, 装备名称: '新装备', 装备增益: [] },
        ]}
      />
      <附魔选择
        {...通用入参}
        部位索引={部位索引}
        list={附魔列表}
        value={value?.附魔}
        allValue={value}
        onChange={(附魔) => onChange?.({ ...value, 附魔 })}
      />
    </>
  )
}

function 断言红框(container, 装备红框, 附魔红框) {
  expect(container.querySelector('.zhuangbei-select').classList.contains('equip-diff-change')).toBe(
    装备红框,
  )
  expect(container.querySelector('.fumo-select').classList.contains('equip-diff-change')).toBe(
    附魔红框,
  )
}

test.each([
  ['_11', 暗器],
  ['_12', 武器],
])('乱序且缺少其他部位时，%s 装备和附魔以已保存值为准', (部位索引, 原装备) => {
  const props = { 部位索引, 部位: 原装备.装备部位 }
  const { container, rerender } = render(<选择组件 {...props} value={原装备} />)
  断言红框(container, false, false)

  const 新装备 = { ...原装备, id: 99, 附魔: 原装备.附魔 === 1001 ? 1002 : 1001 }
  rerender(<选择组件 {...props} value={新装备} />)
  断言红框(container, true, true)

  rerender(<选择组件 {...props} value={原装备} />)
  断言红框(container, false, false)

  rerender(<选择组件 {...props} value={{ ...原装备, 附魔: undefined }} />)
  断言红框(container, false, true)

  当前状态 = { data: { 装备信息: { 装备列表: [帽子, 新装备] } } }
  rerender(<选择组件 {...props} value={新装备} />)
  断言红框(container, false, false)
})

test('空槽新增装备及清除已保存装备均提示变化，保存后消除提示', () => {
  const props = { 部位索引: '_12', 部位: '武器' }
  当前状态 = { data: { 装备信息: { 装备列表: [帽子] } } }
  const { container, rerender } = render(<选择组件 {...props} />)
  断言红框(container, false, false)

  rerender(<选择组件 {...props} value={武器} />)
  断言红框(container, true, true)

  当前状态 = { data: { 装备信息: { 装备列表: [武器] } } }
  rerender(<选择组件 {...props} value={武器} />)
  断言红框(container, false, false)

  rerender(<选择组件 {...props} />)
  断言红框(container, true, true)

  当前状态 = { data: { 装备信息: { 装备列表: [] } } }
  rerender(<选择组件 {...props} />)
  断言红框(container, false, false)
})

test('组件切换槽位时重新读取对应装备及附魔基准', () => {
  const { container, rerender } = render(<选择组件 部位索引='_11' 部位='暗器' value={暗器} />)
  断言红框(container, false, false)
  rerender(<选择组件 部位索引='_12' 部位='武器' value={武器} />)
  断言红框(container, false, false)
})

test('实际选择附魔、清除、重新选择已保存附魔时，红框随操作更新', async () => {
  function 编辑器() {
    const [value, setValue] = useState(暗器)
    return <选择组件 部位索引='_11' 部位='暗器' value={value} onChange={setValue} />
  }

  const { container } = render(<编辑器 />)
  断言红框(container, false, false)

  fireEvent.mouseDown(container.querySelector('.fumo-select .ant-select-selector'))
  fireEvent.click(await screen.findByTitle('附魔二 #1002'))
  expect(container.querySelector('.fumo-select .ant-select-selection-item').textContent).toContain(
    '附魔二',
  )
  断言红框(container, false, true)

  fireEvent.mouseDown(container.querySelector('.fumo-select .ant-select-clear'))
  expect(container.querySelector('.fumo-select .ant-select-selection-item')).toBeNull()
  断言红框(container, false, true)

  fireEvent.mouseDown(container.querySelector('.fumo-select .ant-select-selector'))
  fireEvent.click(await screen.findByTitle('附魔一 #1001'))
  expect(container.querySelector('.fumo-select .ant-select-selection-item').textContent).toContain(
    '附魔一',
  )
  断言红框(container, false, false)
})
