import React from 'react'
import styles from './index.module.less'
import { Checkbox, Select, Tooltip } from 'antd'
import { 按数字生成数组 } from '@/工具函数/help'
interface 心法特殊配制类型 {
  起手怒气: number
  设置起手怒气: (e: number) => void
  起手暴怒值: number
  设置起手暴怒值: (e: number) => void
  暴怒值上限: number
  显示暴怒值: boolean
  // 起手体态: '擎盾' | '擎刀'
  // 设置起手体态: (e: '擎盾' | '擎刀') => void
  // 显示绝刀怒气: boolean
  // 更新显示绝刀怒气: (e: boolean) => void
  // 苍生铸世技改：援戈已移除，隐藏显示释放时援戈层数按钮，注释保留
  // 显示释放时援戈层数: boolean
  // 更新释放时援戈层数: (e: boolean) => void
  显示怒气: boolean
  设置显示怒气: (e: boolean) => void
  忽略延迟技能: string[]
  更新忽略延迟技能: (e: string[]) => void
  周期性忽略延迟: number
  更新周期性忽略延迟: (e: number) => void
  盾压重置方式: '期望' | '概率' | '手动'
  更新盾压重置方式: (e: '期望' | '概率' | '手动') => void
  体态不符自动切换: boolean
  设置体态不符自动切换: (e: boolean) => void
  显示释放时暴怒值: boolean
  设置显示释放时暴怒值: (e: boolean) => void
  显示绝刀怒气等级: boolean
  设置显示绝刀怒气等级: (e: boolean) => void
  显示盾猛威压层数: boolean
  设置显示盾猛威压层数: (e: boolean) => void
  显示血怒覆盖: boolean
  设置显示血怒覆盖: (e: boolean) => void
}

const 盾压重置方式选项: { value: '期望' | '概率' | '手动'; label: string }[] = [
  { value: '期望', label: '期望' },
  { value: '概率', label: '概率' },
  { value: '手动', label: '手动' },
]

function 心法特殊配置(props: 心法特殊配制类型) {
  // const { 显示绝刀怒气, 更新显示绝刀怒气, 起手怒气, 设置起手怒气 } = props
  const {
    // 苍生铸世技改：援戈已移除，注释保留
    // 显示释放时援戈层数,
    // 更新释放时援戈层数,
    显示怒气,
    设置显示怒气,
    起手怒气,
    设置起手怒气,
    起手暴怒值,
    设置起手暴怒值,
    暴怒值上限,
    显示暴怒值,
    忽略延迟技能,
    更新忽略延迟技能,
    周期性忽略延迟,
    更新周期性忽略延迟,
    盾压重置方式,
    更新盾压重置方式,
    体态不符自动切换,
    设置体态不符自动切换,
    显示释放时暴怒值,
    设置显示释放时暴怒值,
    显示绝刀怒气等级,
    设置显示绝刀怒气等级,
    显示盾猛威压层数,
    设置显示盾猛威压层数,
    显示血怒覆盖,
    设置显示血怒覆盖,
  } = props

  return (
    <div className={styles.配置组}>
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
              options={['血怒', '触发橙武', '特效腰坠', '斩刀', '绝刀', '盾击', '盾刀'].map((a) => {
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
        <Tooltip title='按GCD衔接周期豁免网络延迟：每 N+1 次衔接免 1 次延迟、其余保留（选项百分数为免延迟的衔接占比）'>
          <Select
            size='small'
            className={'cycle-simulator-header-select'}
            value={周期性忽略延迟}
            style={{ width: 90 }}
            placeholder={'关闭'}
            popupMatchSelectWidth={90}
            onChange={(value) => 更新周期性忽略延迟(value ? Number(value) : 0)}
            options={[0, 3, 2, 1, 0.5, 0.25].map((num) => ({
              value: num,
              label: num === 0 ? '关闭' : `${Number((100 / (num + 1)).toFixed(1))}%`,
            }))}
          />
        </Tooltip>
      </div>
      <div className={styles.配置项}>
        <span className={styles.label}>盾压重置</span>
        <Tooltip title='【期望】云城盾平均每 1/p 次释放重置一次盾压。【概率】云城盾每次释放有35%概率重置盾压，会导致每次模拟和排轴的盾压CD不一样。【手动】自行决定盾压重置。'>
          <Select
            size='small'
            className={'cycle-simulator-header-select'}
            value={盾压重置方式}
            style={{ width: 120 }}
            popupMatchSelectWidth={120}
            onChange={(e) => 更新盾压重置方式(e)}
            options={盾压重置方式选项}
          />
        </Tooltip>
      </div>
      {/* 苍生铸世技改：援戈已移除，隐藏显示释放时援戈层数按钮，注释保留 */}
      {/* <Checkbox
        style={{ marginLeft: 12 }}
        // checked={显示绝刀怒气}
        // onChange={(e) => 更新显示绝刀怒气(e?.target?.checked)}
        checked={显示释放时援戈层数}
        onChange={(e) => 更新释放时援戈层数(e?.target?.checked)}
      >
        <Tooltip title='开启后显示技能释放之时的援戈层数'>显示释放时援戈层数</Tooltip>
      </Checkbox> */}
      <div className={styles.配置项}>
        <Checkbox
          checked={体态不符自动切换}
          onChange={(e) => 设置体态不符自动切换(e?.target?.checked)}
        >
          <Tooltip title='擎刀时按到擎盾技能自动盾回后释放，擎盾时按到擎刀技能自动盾飞后释放；盾回/盾飞与手动按键同样计费（盾飞系GCD、网络延迟、盾飞充能），无法切换时循环照常报错终止'>
            体态不符自动切换
          </Tooltip>
        </Checkbox>
      </div>
      <div className={styles.配置项}>
        <Checkbox checked={显示怒气} onChange={(e) => 设置显示怒气(e?.target?.checked)}>
          <Tooltip title='开启后显示技能释放之时的怒气'>显示释放时怒气</Tooltip>
        </Checkbox>
      </div>
      <div className={styles.配置项}>
        <Checkbox checked={显示血怒覆盖} onChange={(e) => 设置显示血怒覆盖(e?.target?.checked)}>
          <Tooltip title='开启后在技能时间轴标记血怒生效期间'>显示血怒覆盖</Tooltip>
        </Checkbox>
      </div>
      {显示暴怒值 && (
        <div className={styles.配置项}>
          <Checkbox
            checked={显示释放时暴怒值}
            onChange={(e) => 设置显示释放时暴怒值(e?.target?.checked)}
          >
            <Tooltip title='开启后显示技能释放之时的武烈值（深蓝）；与显示释放时怒气同时开启时两者并排展示'>
              显示释放时武烈值
            </Tooltip>
          </Checkbox>
        </div>
      )}
      <div className={styles.配置项}>
        <Checkbox
          checked={显示绝刀怒气等级}
          onChange={(e) => 设置显示绝刀怒气等级(e?.target?.checked)}
        >
          <Tooltip title='开启后在绝刀技能格显示怒气档位角标（伤害段数=绝破等级1-5）'>
            显示绝刀怒气等级
          </Tooltip>
        </Checkbox>
      </div>
      <div className={styles.配置项}>
        <Checkbox
          checked={显示盾猛威压层数}
          onChange={(e) => 设置显示盾猛威压层数(e?.target?.checked)}
        >
          <Tooltip title='开启后在盾猛技能格显示释放时（消耗威压前）的威压层数'>
            显示盾猛威压层数
          </Tooltip>
        </Checkbox>
      </div>
      <div className={styles.配置项}>
        <span className={styles.label}>设置起手怒气</span>
        <Tooltip title='起手怒气'>
          <Select
            size='small'
            className={'cycle-simulator-header-select'}
            value={起手怒气}
            style={{ width: 120 }}
            showSearch
            popupMatchSelectWidth={120}
            filterOption={(input, option) => {
              return option?.value?.toString()?.includes(input) || false
            }}
            onChange={(e) => 设置起手怒气(e)}
            options={按数字生成数组(21).map((a) => {
              const value = (a - 1) * 5
              return {
                value: value,
                label: `${value} 怒气`,
              }
            })}
          />
        </Tooltip>
      </div>
      {显示暴怒值 && (
        <div className={styles.配置项}>
          <span className={styles.label}>设置起手武烈值</span>
          <Tooltip title={`起手武烈值，上限${暴怒值上限}点`}>
            <Select
              size='small'
              className={'cycle-simulator-header-select'}
              value={起手暴怒值}
              style={{ width: 120 }}
              showSearch
              popupMatchSelectWidth={120}
              filterOption={(input, option) => {
                return option?.value?.toString()?.includes(input) || false
              }}
              onChange={(e) => 设置起手暴怒值(e)}
              options={按数字生成数组(暴怒值上限 / 5 + 1).map((a) => {
                const value = (a - 1) * 5
                return {
                  value: value,
                  label: `${value} 武烈值`,
                }
              })}
            />
          </Tooltip>
        </div>
      )}
      {/* <span className={styles.label}>起手体态</span> */}
      {/* <Select
        size='small'
        className={'cycle-simulator-header-select'}
        value={起手体态}
        style={{ width: 120 }}
        popupMatchSelectWidth={120}
        onChange={(e) => 设置起手体态(e)}
        options={[
          { value: '擎盾', label: '擎盾' },
          { value: '擎刀', label: '擎刀' },
        ]}
      /> */}
    </div>
  )
}

export default 心法特殊配置
