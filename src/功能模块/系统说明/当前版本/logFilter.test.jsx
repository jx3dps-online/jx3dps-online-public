/** @jest-environment node */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import logData from '@/更新日志'
import specNames from '@/心法模块/简写映射.json'
import { filterLogContent } from './logFilter'

const asHtml = (content) => renderToStaticMarkup(<>{React.Children.toArray(content)}</>)

describe('更新日志心法筛选', () => {
  test.each(Object.values(specNames))('%s 只显示综合和自己的测试记录', (name) => {
    const result = asHtml(filterLogContent(logData[0].content, name))
    expect(result).toContain('综合')
    expect(result).toContain(`【测试记录】${name}更新日志筛选测试`)
    expect(result.match(/【测试记录】/g)).toHaveLength(1)
  })

  test('完整最新日志保留全部 24 个心法的测试记录', () => {
    const result = asHtml(logData[0].content)
    expect(result.match(/【测试记录】/g)).toHaveLength(24)
    Object.values(specNames).forEach((name) => {
      expect(result).toContain(`【测试记录】${name}更新日志筛选测试`)
    })
  })

  test('一个标题下的多个内容块一起筛选', () => {
    const content = [
      '毒经',
      <p key='1'>其他一</p>,
      <p key='2'>其他二</p>,
      '综合',
      <p key='3'>通用内容</p>,
      '无方',
      <p key='4'>本心法一</p>,
      <p key='5'>本心法二</p>,
    ]
    const result = asHtml(filterLogContent(content, '无方'))
    expect(result).not.toContain('其他')
    expect(result).toContain('通用内容')
    expect(result).toContain('本心法一')
    expect(result).toContain('本心法二')
  })

  test.each(['无方·悟', '无方悟', '移动端_无方', '无方_悟'])(
    '旧名称 %s 归入悟心法，不归入普通心法',
    (heading) => {
      const content = [heading, <p key='w'>悟更新</p>]
      expect(asHtml(filterLogContent(content, '无方_悟'))).toContain('悟更新')
      expect(filterLogContent(content, '无方')).toEqual([])
    },
  )

  test('保留综合子分类并识别多心法标题', () => {
    const content = [
      '综合-Bug',
      <p key='g'>综合修复</p>,
      '北傲诀、凌海诀、分山劲',
      <p key='m'>联合更新</p>,
    ]
    expect(asHtml(filterLogContent(content, '凌海诀'))).toContain('联合更新')
    expect(asHtml(filterLogContent(content, '无方'))).toContain('综合修复')
    expect(asHtml(filterLogContent(content, '无方'))).not.toContain('联合更新')
  })

  test('无相关内容的版本得到空数组', () => {
    expect(filterLogContent(['毒经', <p key='d'>毒经更新</p>], '无方')).toEqual([])
  })

  test.each([
    ['丐帮', '笑尘诀'],
    ['花间', '花间游'],
    ['花间诀', '花间游'],
    ['分山', '分山劲'],
  ])('旧标题 %s 仅归入 %s', (heading, name) => {
    const content = [heading, <p key='old'>旧心法更新</p>]
    expect(asHtml(filterLogContent(content, name))).toContain('旧心法更新')
    expect(filterLogContent(content, '无方')).toEqual([])
  })

  test('保留没有心法分组的旧日志和分组前的链接', () => {
    const legacy = ['合并万灵/刀宗计算器', '项目代码重构']
    expect(filterLogContent(legacy, '无方')).toEqual(legacy)
    const link = (
      <a key='link' href='/'>
        技改链接
      </a>
    )
    expect(filterLogContent([link, '毒经', <p key='d'>毒经更新</p>], '无方')).toEqual([link])
  })
})
