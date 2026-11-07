import { Tag } from 'antd'
import { 属性简写枚举 } from '@/@types/枚举'
import 装备详情容器 from '../../../属性录入/配装器/功能组件/装备选择/装备部位选择/装备详情容器'
import 来源名称 from '../来源名称'
import type { 候选效用结果 } from './计算'
import styles from './index.module.less'

const 属性名称 = new Set(Object.values(属性简写枚举))
const 属性颜色: Record<string, string> = {
  攻击: 'red',
  力道: 'volcano',
  身法: 'volcano',
  根骨: 'volcano',
  元气: 'volcano',
  会心: 'orange',
  会效: 'gold',
  破防: 'lime',
  无双: 'cyan',
  加速: 'blue',
  全能: 'purple',
}

export function 装备名称({ 装备 }: { 装备: 候选效用结果 }) {
  return (
    <装备详情容器
      装备数据={装备.装备数据}
      当前装备信息={{ 当前精炼等级: 装备.精炼等级 }}
      wrapClassName={styles.装备名称}
    >
      <div>
        <来源名称
          来源={{
            ...装备,
            装备品级: undefined,
            特征属性: 装备.特征属性?.filter((项) => !属性名称.has(项)),
          }}
          显示分类={false}
          显示部位={false}
          名称后缀={装备.当前装备 && <span className={styles.当前标记}>当前</span>}
        />
      </div>
    </装备详情容器>
  )
}

export function 属性简介({ 装备 }: { 装备: 候选效用结果 }) {
  const 属性列表 = 装备.装备数据.装备增益
    .map((项) => 属性简写枚举[项.属性])
    .filter((名称) => 名称 !== '武伤' && 名称 !== '体质')
  return (
    <div className={styles.属性简介}>
      {[...new Set(属性列表)].map((名称) => (
        <Tag key={名称} color={属性颜色[名称]}>
          {名称}
        </Tag>
      ))}
    </div>
  )
}
