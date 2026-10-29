import React from 'react'
import styles from './index.module.less'
import { Checkbox, Select, Tooltip } from 'antd'
interface 心法特殊配制类型 {
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
  // 目标五十血以下: boolean
  // 更新目标五十血以下: (e: boolean) => void
  斩杀模拟: boolean
  更新斩杀模拟: (e: boolean) => void
  斩杀开始秒数?: number
  大橙武模拟: boolean
  橙武降CD方式: '概率' | '期望'
  更新橙武降CD方式: (e: '概率' | '期望') => void
  周期性忽略延迟: number
  更新周期性忽略延迟: (e: number) => void
}

const 橙武降CD方式选项: { value: '概率' | '期望'; label: string }[] = [
  { value: '期望', label: '期望' },
  { value: '概率', label: '概率' },
]

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    忽略延迟技能,
    更新忽略延迟技能,
    // 目标五十血以下,
    // 更新目标五十血以下,
    斩杀模拟,
    更新斩杀模拟,
    斩杀开始秒数,
    大橙武模拟,
    橙武降CD方式,
    更新橙武降CD方式,
    周期性忽略延迟,
    更新周期性忽略延迟,
  } = props

  return (
    <div className={styles.配置组}>
      {/* 目标血量低于50%（全程斩杀）选项已停用：与模拟斩杀时间重复且后者更贴近实战
      <Checkbox checked={目标五十血以下} onChange={(e) => 更新目标五十血以下(e.target.checked)}>
        <b>目标</b>血量低于50%
      </Checkbox>
      */}
      <div className={styles.配置项}>
        <Checkbox checked={斩杀模拟} onChange={(e) => 更新斩杀模拟(e.target.checked)}>
          模拟斩杀
        </Checkbox>
      </div>
      <div className={styles.配置项}>
        <Tooltip title='根据战斗时间推算50%血量斩杀线出现的时间点，从该时间点开始计算绝刀斩杀，该功能仅在当战斗时间≥30秒时生效。'>
          <span className={styles.斩杀时间块}>
            {斩杀开始秒数
              ? `战斗时间第 ${斩杀开始秒数} 秒开始计算斩杀`
              : '战斗时间第 ? 秒开始计算斩杀'}
          </span>
        </Tooltip>
      </div>
      {/* 技能忽略延迟暂停使用：周期性忽略延迟已替代（恢复时取消本段注释）
      {!(周期性忽略延迟 > 0) && (
        <div className={styles.配置项}>
          <span className={styles.label}>技能忽略延迟</span>
          <Tooltip title='勾选的技能计算时完全忽略网络延迟'>
            <Select
              size='small'
              className={'cycle-simulator-header-select'}
              value={忽略延迟技能}
              style={{ minWidth: 120 }}
              showSearch
              popupMatchSelectWidth={120}
              placeholder={'无设置'}
              filterOption={(input, option) => {
                return option?.value?.toString()?.includes(input) || false
              }}
              mode={'multiple'}
              onChange={(e) => 更新忽略延迟技能(e)}
              options={['盾刀·悟', '劫刀·悟', '斩刀·悟', '闪刀·悟', '撼地·悟', '特效腰坠'].map((a) => {
                return {
                  value: a,
                  label: a,
                }
              })}
            />
          </Tooltip>
        </div>
      )}
      */}
      <div className={styles.配置项}>
        <span className={styles.label}>周期性忽略延迟</span>
        <Tooltip title='按GCD衔接周期豁免网络延迟：每 N+1 次衔接保留 1 次延迟、其余全部免延迟（选项百分数为保留延迟的衔接占比）。开启时「技能忽略延迟」列表不生效；关闭时按「技能忽略延迟」列表豁免'>
          <Select
            size='small'
            className={'cycle-simulator-header-select'}
            value={周期性忽略延迟}
            style={{ width: 90 }}
            placeholder={'关闭'}
            popupMatchSelectWidth={90}
            onChange={(value) => 更新周期性忽略延迟(value ? Number(value) : 0)}
            options={[0, 0.25, 0.5, 1, 2, 3].map((num) => ({
              value: num,
              label: num === 0 ? '关闭' : `${Number((100 / (num + 1)).toFixed(1))}%`,
            }))}
          />
        </Tooltip>
      </div>
      {大橙武模拟 && (
        <div className={styles.配置项}>
          <span className={styles.label}>橙武降CD</span>
          <Tooltip title='【期望】每次释放对阵招式固定降低0.3秒绝技招式调息时间。【概率】每次释放对阵招式有30%概率降低1秒绝技招式调息时间，会导致每次模拟和排轴的阵云CD不一样，非常不推荐选择。'>
            <Select
              size='small'
              className={'cycle-simulator-header-select'}
              value={橙武降CD方式}
              style={{ width: 120 }}
              popupMatchSelectWidth={160}
              onChange={(e) => 更新橙武降CD方式(e)}
              options={橙武降CD方式选项}
            />
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export default 心法特殊配置
