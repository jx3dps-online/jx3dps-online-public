declare const describe: (name: string, suite: () => void) => void
declare const test: (name: string, assertion: () => void) => void
declare const expect: any

import { 战斗数据转换 } from './tool'

describe('无方 JCL 技能增益映射', () => {
  test('解析君佐和臣使增益到技能循环', () => {
    const 数据 = JSON.stringify({
      '无方中和#28081-1-1': {
        '君佐#34585-1-1||': { timeline: [[16], [32]] },
      },
      '川乌射罔#27557-1-1': {
        '臣使#34586-1-1||': { timeline: [[48]] },
      },
      '沾衣未妨#27579-1-1': {
        '臣使#34586-1-1||': { timeline: [[64]] },
      },
    })

    const 结果 = 战斗数据转换({
      心法: '无方',
      数据,
      最大时间: 10,
      最小时间: 0,
      团队增益轴: {},
      导入启用团队快照: false,
    })

    expect(结果.技能详情).toEqual([
      {
        技能名称: '川乌射罔',
        技能数量: 1,
        技能增益列表: [{ 增益名称: '臣使', 增益技能数: 1 }],
      },
      {
        技能名称: '无方中和',
        技能数量: 2,
        技能增益列表: [{ 增益名称: '君佐', 增益技能数: 2 }],
      },
      {
        技能名称: '沾衣未妨',
        技能数量: 1,
        技能增益列表: [{ 增益名称: '臣使', 增益技能数: 1 }],
      },
    ])
    expect(结果.技能详情.reduce((总数, 项) => 总数 + 项.技能数量, 0)).toBe(4)
  })
})
