import { use心法数据 } from '@/心法模块/心法上下文'
import { CheckOutlined } from '@ant-design/icons'
import { 大附魔部位枚举, 装备类型枚举 } from '@/@types/装备'
import type { 装备位置部位枚举 } from '@/@types/装备'
import { 获取附魔显示名称 } from '@/数据/附魔/查询'
import 图标 from '@/数据/静态数据/图标.json'
import { 获取装备数据描述 } from '@/功能模块/基础设置/属性录入/配装器/工具函数/获取装备数据描述'
import { 大附魔档位名称 } from '../../领域/文案'
import { 获取文案, 填充文案 } from '../../文案'
import type { 分享数据, 分享装备对 } from './数据'
import 样式 from './装备对比.module.less'

function 装备项({
  项,
  侧,
  养成,
  数据,
}: {
  项: 分享装备对
  侧: '当前' | '目标'
  养成: boolean
  数据: 分享数据
}) {
  const { 装备数据 } = use心法数据()
  const 文案 = 获取文案(数据.心法)
  const 选择 = 项[侧]
  const 装备 = 选择 && 装备数据[选择.装备部位]?.find((装备) => 装备.id === 选择.id)
  const 名称 =
    装备?.装备名称 ||
    (选择?.id
      ? `${文案['分享.数据不可用']} #${选择.id}`
      : 侧 === '目标'
        ? 文案['分享.状态.未设目标']
        : 文案['通用.未装备'])
  const 精炼 = `${选择?.当前精炼等级 || 0}/${装备?.装备类型 === 装备类型枚举.橙武 ? 8 : 6}`
  const 装备边框 = 装备?.装备类型 === 装备类型枚举.橙武 ? 图标.橙色装备边框 : 图标.紫色装备边框
  const 装备描述 = 装备
    ? [...(装备.装备类型 === 装备类型枚举.门派套装 ? ['套装'] : []), ...获取装备数据描述(装备)]
    : []
  const 部位 = 项.部位.split(' ')[0] as 装备位置部位枚举
  const 大附魔键 = 大附魔部位枚举[部位]
  const 档位 = 大附魔键 && 数据[侧].装备.装备增益?.[大附魔键]
  const 状态 = 文案[`分享.状态.${项.状态}`]
  return (
    <div
      className={`${样式.装备} ${侧 === '当前' ? 样式[项.状态] : 样式.目标装备}`}
      aria-label={`${项.部位}，${名称}，${状态}`}
    >
      <div className={样式.图标}>
        {装备?.图标ID ? (
          <img src={`https://icon.jx3box.com/icon/${装备.图标ID}.png`} alt='' />
        ) : (
          <span>◇</span>
        )}
        {装备 && <img className={样式.装备边框} src={装备边框} alt='' />}
        {养成 && 选择?.id && (
          <small aria-label={填充文案(文案['分享.精炼'], { 等级: 精炼 })}>{精炼}</small>
        )}
      </div>
      <div className={样式.信息}>
        <div className={样式.名称}>
          <span>{名称}</span>
          {装备 && <small>{填充文案(文案['分享.品级'], { 品级: 装备.装备品级 })}</small>}
        </div>
        {!!装备描述.length && (
          <div className={样式.特征}>
            {装备描述.map((描述, i) => (
              <span className={样式[描述]} key={`${描述}-${i}`}>
                {描述}
              </span>
            ))}
          </div>
        )}
        {养成 && 选择?.id && (
          <div className={样式.明细}>
            <span>
              {选择.附魔 && <img src={图标.附魔} alt='' />}
              {选择.附魔 ? 获取附魔显示名称(选择.附魔) : 文案['通用.未附魔']}
            </span>
            {!!档位 && (
              <span>
                <img src={图标.大附魔} alt='' />
                {填充文案(文案['分享.大附魔'], {
                  档位: 大附魔档位名称(文案, 档位).replace(/档$/, ''),
                })}
              </span>
            )}
          </div>
        )}
      </div>
      <div className={样式.部位镶嵌}>
        <span className={样式.部位}>
          {项.部位}
          {侧 === '当前' && 项.状态 === '已认可' ? ` · ${状态}` : ''}
        </span>
        {养成 && 选择?.id && (
          <div className={样式.镶嵌} aria-label={文案['分享.镶嵌']}>
            {选择.镶嵌孔数组?.map((孔, i) =>
              孔.镶嵌宝石等级 ? (
                <img
                  key={i}
                  src={图标.五行石[孔.镶嵌宝石等级]}
                  alt={填充文案(文案['分享.五行石等级'], { 等级: 孔.镶嵌宝石等级 })}
                />
              ) : (
                <span key={i} className={样式.空孔} aria-label={文案['分享.空孔']} />
              ),
            )}
          </div>
        )}
      </div>
      {侧 === '当前' && 项.状态 === '已达成' && (
        <span className={样式.达成标记} aria-hidden='true'>
          <CheckOutlined />
        </span>
      )}
    </div>
  )
}

export default function 装备对比({ 数据, 养成 }: { 数据: 分享数据; 养成: boolean }) {
  const 文案 = 获取文案(数据.心法)
  return (
    <section className={样式.对比}>
      <div className={样式.对比行}>
        {(['当前', '目标'] as const).map((侧) => {
          const 装分 = 数据[侧].装备.装备基础属性.装分
          return (
            <header className={`${样式.标题} ${侧 === '目标' ? 样式.目标标题 : ''}`} key={侧}>
              <h3>{文案[`分享.${侧}`]}</h3>
              <span>
                {装分 === undefined ? '—' : 装分.toLocaleString('zh-CN')}
                <small>{文案['分享.装分']}</small>
              </span>
            </header>
          )
        })}
      </div>
      <div className={样式.装备列表}>
        {数据.装备对.map((项) => (
          <div className={样式.对比行} key={项.部位}>
            {(['当前', '目标'] as const).map((侧) => (
              <装备项 key={侧} 项={项} 侧={侧} 数据={数据} 养成={养成} />
            ))}
          </div>
        ))}
      </div>
      {养成 && (
        <div className={样式.对比行}>
          {(['当前', '目标'] as const).map((侧) => {
            const 五彩石 = 数据[侧].装备.五彩石
            return (
              <div className={样式.五彩石} key={侧}>
                {五彩石 && (
                  <img src={五彩石.includes('陆') ? 图标.六级五彩石 : 图标.五级五彩石} alt='' />
                )}
                <span>{五彩石 || 文案['分享.无五彩石']}</span>
                {侧 === '当前' && (
                  <small>
                    {数据.五彩状态 === '已达成' ? '✓ ' : ''}
                    {文案[`分享.状态.${数据.五彩状态}`]}
                  </small>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
