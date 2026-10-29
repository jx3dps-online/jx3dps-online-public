import React from 'react'
import { Collapse } from 'antd'
import type { 心法说明 } from '../类型'
import { 创建增益能力目录 } from '../核心/条件能力'

export default function 支持说明({ 说明 }: { 说明: 心法说明 }) {
  const 增益能力 = 创建增益能力目录(说明)
  return (
    <Collapse
      size='small'
      items={[
        {
          key: '接入说明',
          label: '支持的技能与条件',
          children: (
            <>
              <p>
                可用技能：{说明.技能.map((名称) => 说明.技能显示名称?.[名称] || 名称).join('、')}
              </p>
              <p>
                仅用于 skill_notin_cd 的查询：{说明.调息查询技能?.join('、')}。 查询包含绑定的 GCD
                与独立 CD，有充能仍需检查 GCD，不包含资源或体态限制。 骑御也可用查询 ID
                605；这些查询不开放为释放动作。
              </p>
              <p>
                自身 Buff：
                {增益能力
                  .filter((项) => 项.对象 === '自身')
                  .map((项) => 项.名称)
                  .join('、')}
              </p>
              <p>
                目标 Buff / DOT：
                {增益能力
                  .filter((项) => 项.对象 === '目标')
                  .map((项) => 项.名称)
                  .join('、')}
              </p>
              <p>
                真实充能技能（skill_energy）：
                {说明.充能技能?.map((名称) => 说明.技能显示名称?.[名称] || 名称).join('、') || '无'}
              </p>
              <p>
                Buff 不存在时，正向层数或时间判断为假，不按 0 层判断；nobuff / tnobuff 检查不存在。
              </p>
              {说明.永久增益 && (
                <p>
                  永久 Buff 仅支持存在和层数判断，不支持 bufftime / tbufftime：
                  {Object.entries(说明.永久增益)
                    .map(([对象, 名称]) => 对象 + '：' + 名称.join('、'))
                    .join('；')}
                </p>
              )}
              {说明.无计时增益 && (
                <p>
                  原模拟器仅提供层数，不支持 bufftime / tbufftime：
                  {Object.entries(说明.无计时增益)
                    .map(([对象, 名称]) => 对象 + '：' + 名称.join('、'))
                    .join('；')}
                </p>
              )}
              <p>
                {说明.数值字段.join('、')}、buff / nobuff、tbuff / tnobuff、bufftime /
                tbufftime、skill_energy、skill_notin_cd、last_skill、skill /
                noskill。比较符：=、~=、&gt;、&lt;、&gt;=、&lt;=。&amp; 与 | 等优先级、右结合。
              </p>
              <p>
                {说明.翻页体态 ? '支持不翻页或按体态翻页；宏模式二选一。' : ''}
                sun 与 moon 可互相比较；skill_energy 的 max 表示最大充能数。非充能技能的 =1
                恒真，严格的 &lt;、&gt; 恒假，其他比较沿用原规则。skill / noskill
                检查原模拟器具备的技能或已选奇穴。 数字 ID 仅接受已经核对的映射；未知 ID
                会明确报错。
              </p>
              <p>
                {Object.entries(说明.资源显示)
                  .map(([字段, 名称]) => 字段 + '：' + 名称)
                  .join('；')}
              </p>
              {Object.entries(说明.未支持条件 || {}).map(([字段, 原因]) => (
                <p key={字段}>{原因}</p>
              ))}
              <p>
                已核对的动作 ID / 名称别名：
                {Object.entries(说明.映射.技能)
                  .filter(([, 名称]) => 说明.技能.includes(名称))
                  .map(([ID, 名称]) => ID + '=' + 名称)
                  .join('、')}
              </p>
              <p>
                自身增益别名 / ID：
                {Object.entries(说明.映射.自身增益)
                  .map(([别名, 名称]) => ({ 别名, 实体: 说明.增益ID?.[名称]?.自身 || [名称] }))
                  .filter(
                    ({ 实体 }) => 实体.length && 实体.every((名称) => 说明.自身增益.includes(名称)),
                  )
                  .map(({ 别名, 实体 }) => 别名 + '=' + 实体.join(' / '))
                  .join('、')}
              </p>
              <p>
                目标增益别名 / ID：
                {Object.entries(说明.映射.目标增益)
                  .map(([别名, 名称]) => ({ 别名, 实体: 说明.增益ID?.[名称]?.目标 || [名称] }))
                  .filter(
                    ({ 实体 }) => 实体.length && 实体.every((名称) => 说明.目标增益.includes(名称)),
                  )
                  .map(({ 别名, 实体 }) => 别名 + '=' + 实体.join(' / '))
                  .join('、')}
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
