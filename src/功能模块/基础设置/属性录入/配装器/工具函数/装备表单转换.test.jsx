import React from 'react'
import { act, render } from '@testing-library/react'
import { Form } from 'antd'
import { 装备位置部位枚举 } from '@/@types/装备'
import { 属性类型 } from '@/@types/属性'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取附魔数据 } from '@/数据/附魔/查询'
import { 保存角色配装, 读取角色状态, 角色状态存储键 } from '@/角色/状态'
import 根据表单选项获取装备信息 from './根据表单选项获取装备信息'
import { 根据部位索引获取装备, 表单值转装备列表, 装备信息转表单值 } from './装备表单转换'

jest.mock('@/数据/数据工具/获取当前数据', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  获取当前心法名: () => '回归心法',
}))
jest.mock('@/hooks/use-cycle', () => ({
  __esModule: true,
  default: () => ({ 全部循环: [] }),
}))

const 部位索引列表 = Object.keys(装备位置部位枚举)
const 附魔数据 = 获取附魔数据('内功', '根骨')
const 创建装备 = (部位索引, id = 部位索引列表.indexOf(部位索引) + 100) => ({
  id,
  装备部位: 装备位置部位枚举[部位索引],
  当前精炼等级: 6,
  镶嵌孔数组: [{ 镶嵌类型: 属性类型.全会心等级, 镶嵌宝石等级: 8 }],
  附魔: 附魔数据.find((附魔) => 附魔.附魔支持部位.includes(装备位置部位枚举[部位索引]))?.id,
})
const 创建装备信息 = (装备列表) => ({ 装备列表, 五彩石: '', 装备增益: {} })

beforeEach(() => {
  localStorage.clear()
  获取当前数据.mockReturnValue({
    缓存映射: {
      全部方案数据: '回归心法_全部方案数据',
      当前方案名称: '回归心法_当前方案名称',
    },
    装备数据: Object.fromEntries(
      部位索引列表.map((key) => [
        装备位置部位枚举[key],
        部位索引列表
          .filter((候选) => 装备位置部位枚举[候选] === 装备位置部位枚举[key])
          .map((候选) => ({
            ...创建装备(候选),
            装备品级: 30000,
            装备增益: [{ 属性: 属性类型.全基础攻击, 值: 100 }],
          })),
      ]),
    ),
    镶嵌孔: [{ 镶嵌类型: 属性类型.全会心等级, 各等级增益数据: { 8: { 增益数值: 100 } } }],
    附魔: 附魔数据,
  })
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => jest.restoreAllMocks())

describe('装备槽位恢复', () => {
  test('旧缓存前方部位缺失、暗器和武器顺序颠倒时仍完整回填', () => {
    const 暗器 = 创建装备('_11')
    const 武器 = 创建装备('_12')
    const 表单 = 装备信息转表单值(创建装备信息([武器, 创建装备('_2'), 暗器]))
    expect(表单._11).toEqual(暗器)
    expect(表单._12).toEqual(武器)
    expect(表单._1).toBeUndefined()
    expect(Object.hasOwn(表单, '_1')).toBe(true)
  })

  test('旧缓存两枚不同戒指保持各自装备和附魔', () => {
    const 戒指一 = 创建装备('_9')
    const 戒指二 = { ...创建装备('_10'), 附魔: undefined }
    const 装备列表 = [创建装备('_12'), 戒指一, 创建装备('_11'), 戒指二]
    expect(根据部位索引获取装备(装备列表, '_9')).toEqual(戒指一)
    expect(根据部位索引获取装备(装备列表, '_10')).toEqual(戒指二)
  })

  test('旧缓存戒指空占位不让第二枚戒指前移', () => {
    const 空戒指 = { ...创建装备('_9'), id: undefined }
    const 戒指二 = 创建装备('_10')
    const 装备列表 = [空戒指, 戒指二, 创建装备('_12')]
    expect(根据部位索引获取装备(装备列表, '_9')).toEqual(空戒指)
    expect(根据部位索引获取装备(装备列表, '_10')).toEqual(戒指二)
  })

  test('新保存只有第二枚戒指时，JSON 往返及列表乱序都不会复制到第一槽', () => {
    const 列表 = 表单值转装备列表({ _12: 创建装备('_12'), _10: 创建装备('_10') })
    const 回读 = JSON.parse(JSON.stringify(列表)).reverse()
    const 表单 = 装备信息转表单值(创建装备信息(回读))
    expect(表单._9).toBeUndefined()
    expect(表单._10.id).toBe(109)
    expect(表单._12.id).toBe(111)
  })

  test('保存按槽位排序，表单键覆盖装备上遗留的槽位标记且不修改原值', () => {
    const 戒指 = { ...创建装备('_9'), 装备部位索引: '_9' }
    const 列表 = 表单值转装备列表({ _12: 创建装备('_12'), _10: 戒指, _2: 创建装备('_2') })
    expect(列表.map((装备) => 装备.装备部位索引)).toEqual(['_2', '_10', '_12'])
    expect(戒指.装备部位索引).toBe('_9')
  })

  test('重开表单会清除取消前选中的装备与附魔', () => {
    let 表单
    function 测试表单() {
      const [form] = Form.useForm()
      表单 = form
      return <Form form={form} component={false} />
    }
    render(<测试表单 />)
    act(() => {
      表单.setFieldsValue({ _11: 创建装备('_11'), _12: 创建装备('_12') })
    })
    const 无附魔武器 = 创建装备('_12')
    delete 无附魔武器.附魔
    act(() => {
      表单.setFieldsValue(装备信息转表单值(创建装备信息([无附魔武器])))
    })
    expect(表单.getFieldValue('_11')).toBeUndefined()
    expect(表单.getFieldValue(['_12', '附魔'])).toBeUndefined()
    expect(表单.getFieldValue(['_12', 'id'])).toBe(111)
  })
})

describe('保存至浏览器缓存后刷新读取', () => {
  test.each([
    ['完整配装', 部位索引列表],
    ['缺少前方部位及第一枚戒指', ['_11', '_12', '_10', '_2']],
  ])('%s：装备、精炼、镶嵌和附魔保持一致', (_, 槽位) => {
    const 表单 = {
      ...装备信息转表单值(创建装备信息([])),
      ...Object.fromEntries(槽位.map((key) => [key, 创建装备(key)])),
    }
    const 待保存 = 根据表单选项获取装备信息(表单)
    const 角色 = {
      id: '回归角色',
      心法: '回归心法',
      名称: '回归角色',
      创建时间: 1,
      更新时间: 1,
    }
    const 保存后 = 保存角色配装(角色, {
      装备信息: 待保存,
      当前计算循环名称: '',
      当前奇穴信息: [],
      当前秘籍信息: {},
      角色增益: { 阵眼: '', 小吃: [] },
      更新时间: 1,
    })
    const 缓存 = JSON.parse(localStorage.getItem(角色状态存储键(角色.id)))
    expect(缓存.装备信息.装备列表).toHaveLength(槽位.length)

    const { 状态: 刷新后 } = 读取角色状态(角色)
    const 回填表单 = 装备信息转表单值(刷新后.装备信息)
    槽位.forEach((key) => {
      expect(回填表单[key]).toMatchObject(表单[key])
      expect(回填表单[key].装备部位索引).toBe(key)
    })
    部位索引列表
      .filter((key) => !槽位.includes(key))
      .forEach((key) => {
        expect(回填表单[key]).toBeUndefined()
      })
    expect(刷新后.装备信息.装备基础属性).toEqual(保存后.状态.装备信息.装备基础属性)
    expect(刷新后.装备信息.装备基础属性.基础攻击).toBeGreaterThan(0)

    const 再次保存 = 根据表单选项获取装备信息(回填表单)
    expect(再次保存).toEqual(刷新后.装备信息)
  })
})
