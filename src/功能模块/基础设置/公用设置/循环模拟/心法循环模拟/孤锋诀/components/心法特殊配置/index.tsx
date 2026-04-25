import React from 'react'
import styles from './index.module.less'
import { Checkbox, Select, Tooltip } from 'antd'
import { 按数字生成数组 } from '@/工具函数/help'
interface 心法特殊配制类型 {
  起手锐意: number
  设置起手锐意: (e: number) => void
  起手体态: '双刀' | '单刀'
  设置起手体态: (e: '双刀' | '单刀') => void
  显示潋风层数: boolean
  更新显示潋风层数: (e: boolean) => void
  隐藏击破图标: boolean
  设置隐藏击破图标: (e: boolean) => void
  自动击破: boolean
  设置自动击破: (e: boolean) => void
  显示洄涛层数: boolean
  设置显示洄涛层数: (e: boolean) => void
  显示击破技能: boolean
  设置显示击破技能: (e: boolean) => void
  显示锐意: boolean
  设置显示锐意: (e: boolean) => void
  显示倾怒: boolean
  设置显示倾怒: (e: boolean) => void
}

function 心法特殊配置(props: 心法特殊配制类型) {
  const {
    起手锐意,
    设置起手锐意,
    起手体态,
    设置起手体态,
    显示潋风层数,
    更新显示潋风层数,
    隐藏击破图标,
    设置隐藏击破图标,
    自动击破,
    设置自动击破,
    显示洄涛层数,
    设置显示洄涛层数,
    显示击破技能,
    设置显示击破技能,
    显示锐意,
    设置显示锐意,
    显示倾怒,
    设置显示倾怒,
  } = props

  return (
    <>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={自动击破}
        onChange={(e) => 设置自动击破(e?.target?.checked)}
      >
        <Tooltip
          styles={{ body: { width: 350 } }}
          title={
            <div>
              <p>开启后将隐藏弱点击破技能</p>
              <p>弱点一旦出现下一个技能会立刻击破</p>
              <p>倾怒状态下不会自动击破,会延长到倾怒状态后的下一个技能</p>
            </div>
          }
        >
          自动击破
        </Tooltip>
      </Checkbox>
      {自动击破 ? (
        <Checkbox
          style={{ marginLeft: 12 }}
          checked={显示击破技能}
          onChange={(e) => 设置显示击破技能(e?.target?.checked)}
        >
          <Tooltip
            title={
              <div>
                <p>显示由哪个技能触发了击破</p>
              </div>
            }
          >
            高亮击破技能
          </Tooltip>
        </Checkbox>
      ) : (
        <Checkbox
          style={{ marginLeft: 12 }}
          checked={隐藏击破图标}
          onChange={(e) => 设置隐藏击破图标(e?.target?.checked)}
        >
          <Tooltip
            styles={{ body: { width: 350 } }}
            title={
              <div>
                <p>设置隐藏击破图标，便于更工整的查看循环</p>
                <p>仅隐藏显示。技能依然生效</p>
                <p>注意！！！拖动技能前需要关闭，否则拖动会有问题</p>
              </div>
            }
          >
            隐藏击破图标
          </Tooltip>
        </Checkbox>
      )}
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示洄涛层数}
        onChange={(e) => 设置显示洄涛层数(e?.target?.checked)}
      >
        <Tooltip
          styles={{ body: { width: 350 } }}
          title={
            <div>
              <p>在沧浪三叠的右下角显示释放前洄涛层数</p>
            </div>
          }
        >
          显示洄涛
        </Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示潋风层数}
        onChange={(e) => 更新显示潋风层数(e?.target?.checked)}
      >
        <Tooltip title='显示技能开始释放时的破绽层数'>显示潋风回锐</Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示锐意}
        onChange={(e) => 设置显示锐意(e?.target?.checked)}
      >
        <Tooltip
          styles={{ body: { width: 350 } }}
          title={
            <div>
              <p>开启后显示技能释放前锐意</p>
            </div>
          }
        >
          显示锐意
        </Tooltip>
      </Checkbox>
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={显示倾怒}
        onChange={(e) => 设置显示倾怒(e?.target?.checked)}
      >
        <Tooltip
          styles={{ body: { width: 350 } }}
          title={
            <div>
              <p>开启后高亮倾怒覆盖</p>
            </div>
          }
        >
          显示倾怒
        </Tooltip>
      </Checkbox>
      <span className={styles.label}>起手锐意</span>
      <Tooltip title='起手锐意' placement='left'>
        <Select
          size='small'
          className={'cycle-simulator-header-select'}
          value={起手锐意}
          style={{ width: 120 }}
          showSearch
          popupMatchSelectWidth={120}
          filterOption={(input, option) => {
            return option?.value?.toString()?.includes(input) || false
          }}
          onChange={(e) => 设置起手锐意(e)}
          options={按数字生成数组(101).map((a) => {
            return {
              value: a - 1,
              label: `${a - 1} 锐意`,
            }
          })}
        />
      </Tooltip>
      <span className={styles.label}>起手体态</span>
      <Select
        size='small'
        className={'cycle-simulator-header-select'}
        value={起手体态}
        style={{ width: 120 }}
        popupMatchSelectWidth={120}
        onChange={(e) => 设置起手体态(e)}
        options={[
          { value: '单刀', label: '单刀' },
          { value: '双刀', label: '双刀' },
        ]}
      />
    </>
  )
}

export default 心法特殊配置
