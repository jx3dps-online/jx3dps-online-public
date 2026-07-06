// 技能循环显示技能单元
import React, { useContext, useMemo, useState } from 'react'
import { Badge, Dropdown, Space, Tooltip } from 'antd'
import { CloseCircleFilled } from '@ant-design/icons'
import classNames from 'classnames'
import { Buff枚举 } from '../../../../通用/通用框架/类型定义/Buff'
import { 模拟信息类型 } from '../../../../通用/通用框架/类型定义/模拟'
import { 显示循环技能类型 } from '../../../../通用/通用框架/类型定义/技能'
import 多段倒读条作用次数弹窗 from '../../../../通用/通用组件/多段倒读条作用次数弹窗'
import 团队覆盖高亮 from '../../../../通用/通用组件/循环技能显示组件/团队覆盖高亮'
import { 每秒郭氏帧 } from '@/数据/常量'
import BuffItem from './BuffItem'
import styles from './index.module.less'

interface CycleSkillItemProps {
  技能: 显示循环技能类型
  前一个技能?: 显示循环技能类型
  删除循环技能: (e: number) => void
  模拟信息: 模拟信息类型
  buff覆盖数据: number[]
  buff覆盖索引: number
  更新buff覆盖数据: (e: number[], 索引: number) => void
  点击下拉菜单: (e: any) => void
  原始Buff数据: Buff枚举
  允许操作列表?: string[]
  修改技能信息?: (e: 显示循环技能类型) => void
  隐藏显示技能?: string[]
  技能高亮?: (e: 显示循环技能类型, index: number) => boolean
}

function CycleSkillItem(props: CycleSkillItemProps) {
  const {
    技能,
    前一个技能,
    删除循环技能,
    模拟信息,
    buff覆盖数据,
    buff覆盖索引,
    更新buff覆盖数据,
    原始Buff数据,
    点击下拉菜单,
    修改技能信息,
    允许操作列表 = ['插入技能', '删除后续'],
    隐藏显示技能 = [],
    技能高亮,
  } = props

  const 判断开始释放时间 = (技能?.开始读条时间 ? 技能.开始读条时间 : 技能.实际释放时间) || 0
  const 读条时间 = 技能?.开始读条时间
    ? Math.round((((技能.实际释放时间 || 0) - (技能.开始读条时间 || 0)) / 每秒郭氏帧) * 100) / 100
    : 0

  const 技能索引 = 技能?.index || 0

  const 技能释放时间 = Math.round(((判断开始释放时间 || 0) / 每秒郭氏帧) * 100) / 100
  const 间隔CD = (判断开始释放时间 || 0) - (技能.计划释放时间 || 0)
  // 把帧转成秒，保留两位小数
  const 剩余秒 = Math.round((间隔CD / 每秒郭氏帧) * 100) / 100
  // 是否异常
  // 存在异常索引
  const 索引 = (模拟信息?.循环异常信息?.异常索引 || 0) + -1
  const 是否异常 = 模拟信息?.循环执行结果 === '异常' ? (技能?.index || 0) >= 索引 : false
  const 当前异常 = 模拟信息?.循环执行结果 === '异常' ? (技能?.index || 0) === 索引 : false

  const 技能释放结果 = 技能?.技能释放记录结果 || {}

  const [多段作用次数弹窗, 修改多段作用次数弹窗] = useState(false)

  const 判断有无重要buff标记 = () => {
    if (技能释放结果?.造成buff数据?.buff名称) {
      更新buff覆盖数据(
        [技能释放结果?.造成buff数据?.buff开始时间, 技能释放结果?.造成buff数据?.buff结束时间],
        技能索引,
      )
    }
  }

  const 判断特殊buff标记 = () => {
    const buffList = 技能释放结果?.重要buff列表 || []
    const buffName = 技能释放结果?.造成buff数据?.buff名称

    const 降厄 = buffList.includes('降厄') || buffName === '降厄'
    const 引魂 = buffList.includes('引魂') || buffName === '引魂'
    const 圣蝎 = buffList.includes('圣蝎献祭') || buffName === '圣蝎献祭'

    const isStart = (() => {
      if (前一个技能 == null || 前一个技能?.技能名称 === '换行') {
        return true
      }
      const previousBuffList = 前一个技能?.技能释放记录结果?.重要buff列表 || []
      return !!buffName && previousBuffList.length === 0
    })()
    const isEnd = (() => {
      const 下一个技能 = 模拟信息?.技能释放记录?.[技能索引 + 1]
      if (!下一个技能) {
        return true
      }

      const nextBuffList = 下一个技能?.技能释放记录结果?.重要buff列表 || []
      /* 完全匹配。不太美观，先不用。
      if (nextBuffList.length === buffList.length && nextBuffList.every((v, i) => v === buffList[i])) return false;
      */
      if (nextBuffList.length === 0) return true
      return false
    })()

    let result = ''

    if (降厄 && 引魂) {
      result = ' skill-background-jiange-yinhun'
    } else if (降厄) {
      result = ' skill-background-jiange'
    } else if (引魂) {
      result = ' skill-background-yinhun'
    } else if (圣蝎) {
      result = ' skill-background-shengxie'
    }

    if (!result) return ''

    if (isStart) result += ' start'
    if (isEnd) result += ' end'
    if (圣蝎 && result.indexOf('shengxie') === -1) {
      result += ' skill-background-shengxie'
    }

    return result
  }

  const 判断橙武技能 = () => {
    if (技能释放结果?.重要buff列表?.includes('橙武')) {
      return ' skill-shadow-orange'
    }
    return ''
  }

  const 卸除重要buff标记 = () => {
    更新buff覆盖数据([], 0)
  }

  const 当前是否需要高亮展示在buff覆盖中 = useMemo(() => {
    if (技能?.技能名称 === '换行') {
      return false
    }
    if (
      (技能?.实际释放时间 || 0) <= buff覆盖数据?.[1] &&
      (技能?.实际释放时间 || 0) >= buff覆盖数据?.[0] &&
      技能索引 >= buff覆盖索引
    ) {
      return true
    } else {
      return false
    }
  }, [buff覆盖数据, buff覆盖索引, 技能索引, 技能])

  const 当前技能是否需要持续高亮 = useMemo(() => {
    if (!技能高亮) {
      return false
    }
    if (技能?.技能名称 === '换行') {
      return false
    }
    if (技能高亮(技能, 技能索引)) {
      return true
    } else {
      return false
    }
  }, [技能, 技能索引, 技能释放结果, 技能高亮])

  const cls = classNames(
    styles.skill,
    是否异常 ? styles.error : '',
    当前是否需要高亮展示在buff覆盖中 ? styles.highlight : '',
    当前技能是否需要持续高亮 ? styles.defaultHighLight : '',
  )

  const 图标 = useMemo(() => {
    return 技能释放结果?.实际图标 || 技能.图标
  }, [技能, 技能释放结果])

  const 下拉菜单 = useMemo(() => {
    const list = [
      {
        key: '前部插入',
        disabled: !允许操作列表?.includes('插入技能'),
        label: (
          <span>
            在<span className={styles.tipBefore}>前部</span>添加技能
          </span>
        ),
      },
      {
        key: '后部插入',
        disabled: !允许操作列表?.includes('插入技能'),
        label: (
          <span>
            在<span className={styles.tipAfter}>后部</span>添加技能
          </span>
        ),
      },
      {
        key: '删除后续',
        disabled: !允许操作列表?.includes('删除后续'),
        label: (
          <span>
            删除<span className={styles.tipAfter}>后续</span>全部技能
          </span>
        ),
      },
      {
        key: '设置延迟时间',
        disabled: !允许操作列表?.includes('设置延迟'),
        label: (
          <span>
            设置技能<span className={styles.tipAfter}>延迟</span>时间
          </span>
        ),
      },
      {
        key: '修改作用次数',
        disabled: !技能?.可中断倒读条最大跳数,
        label: (
          <span>
            修改
            <span className={styles.tipBefore}>倒读条</span>作用
            <span className={styles.tipAfter}>跳数</span>
          </span>
        ),
      },
    ]
    return list.filter((item) => !item?.disabled)
  }, [])

  const beforeOnClick = (e) => {
    if (e.key === '修改作用次数') {
      修改多段作用次数弹窗(true)
    } else {
      点击下拉菜单(e)
    }
  }

  const 修改多段作用次数 = (e) => {
    修改技能信息?.({
      ...技能,
      额外信息: {
        ...技能?.额外信息,
        作用次数: e,
      },
    })
  }

  const 是否隐藏 = useMemo(() => {
    return 隐藏显示技能?.includes(技能?.技能名称)
  }, [隐藏显示技能, 技能?.技能名称])
  return 是否隐藏 ? (
    <></>
  ) : (
    <Badge
      count={剩余秒}
      offset={[-52, 8]}
      className={'cycle-simulator-setting-skill-drag' + `${判断特殊buff标记()}`}
    >
      <Dropdown menu={{ items: 下拉菜单, onClick: beforeOnClick }} trigger={['contextMenu']}>
        <div
          className={cls + `${判断橙武技能()}`}
          onMouseEnter={判断有无重要buff标记}
          onMouseLeave={卸除重要buff标记}
        >
          <Tooltip
            title={
              <div>
                <p>{技能?.技能名称}</p>
                {技能释放时间 !== undefined ? <p>释放时间：{技能释放时间}秒</p> : null}
                {技能释放结果.实际伤害技能 ? <p>伤害名称：{技能释放结果.实际伤害技能}</p> : null}
                {剩余秒 ? <p>释放等待CD：{剩余秒}秒</p> : null}
                {读条时间 ? <p>读条：{读条时间}秒</p> : null}
                {技能释放结果?.重要buff列表?.length ? (
                  <Space className={styles.settingBuff} size={[8, 8]} wrap>
                    {技能释放结果?.重要buff列表.map((item) => {
                      return (
                        <BuffItem
                          原始Buff数据={原始Buff数据}
                          data={item}
                          key={item}
                          className={styles.settingBuffItem}
                        />
                      )
                    })}
                  </Space>
                ) : null}
                {技能?.额外信息
                  ? Object.keys(技能?.额外信息)?.map((key) => {
                      return (
                        <p key={`${技能?.技能名称}_${索引}_${技能?.额外信息?.[key]}`}>
                          <span>{key}：</span>
                          <span>{技能?.额外信息?.[key]}</span>
                        </p>
                      )
                    })
                  : null}
                {是否异常 ? (
                  当前异常 ? (
                    <p>异常：{模拟信息?.循环异常信息?.异常信息?.信息}</p>
                  ) : (
                    <p>前置技能异常</p>
                  )
                ) : null}
              </div>
            }
          >
            <img className={styles.skillImage} src={图标} />
          </Tooltip>
          <CloseCircleFilled
            className={styles.close}
            onClick={() => 删除循环技能(技能?.index || 0)}
          />
          {技能释放结果?.伤害段数 ? (
            <span
              className={`${styles.count} ${styles[`count${技能释放结果?.伤害段数}`]} ${`damage-count${技能释放结果?.伤害段数}`}`}
            >
              {技能释放结果?.伤害段数}
            </span>
          ) : null}
          {技能释放结果?.特殊标记 !== undefined ? (
            <span className={`${styles.countTip} ${styles[`count${技能释放结果?.特殊标记}`]}`}>
              {技能释放结果?.特殊标记 || 0}
            </span>
          ) : null}
          <团队覆盖高亮 技能={技能} 前一个技能={前一个技能} />
        </div>
      </Dropdown>
      <多段倒读条作用次数弹窗
        key='in-cycle-wrapper-modal'
        open={多段作用次数弹窗}
        defaulValue={技能?.额外信息?.作用次数 || 0}
        onCancel={() => 修改多段作用次数弹窗(false)}
        onSubmit={修改多段作用次数}
        maxHit={技能?.可中断倒读条最大跳数 || 1}
      />
    </Badge>
  )
}

export default React.memo(CycleSkillItem)
