import { Button, Input, Segmented, Slider, Switch } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { 分享配置 } from './数据'
import type { 登阶文案 } from '../../文案'
import 样式 from './index.module.less'

export default function 分享设置({
  配置,
  更新,
  背景列表,
  文案,
}: {
  配置: 分享配置
  更新: (配置: 分享配置) => void
  背景列表: string[]
  文案: 登阶文案
}) {
  const 换背景 = () => {
    const 候选 = 背景列表.filter((项) => 项 !== 配置.背景)
    更新({ ...配置, 背景: 候选[Math.floor(Math.random() * 候选.length)] || 背景列表[0] })
  }
  return (
    <>
      <div className={样式.背景标题}>
        <span>{文案['分享.背景']}</span>
        <Button size='small' icon={<ReloadOutlined />} onClick={换背景}>
          {文案['分享.换背景']}
        </Button>
      </div>
      <div className={样式.背景列表}>
        {背景列表.map((地址, i) => (
          <button
            key={地址}
            type='button'
            aria-label={`${文案['分享.背景']} ${i + 1}`}
            aria-pressed={配置.背景 === 地址}
            onClick={() => 更新({ ...配置, 背景: 地址 })}
          >
            <img src={地址} alt='' loading='lazy' />
          </button>
        ))}
      </div>
      <label className={样式.标签} htmlFor='分享背景位置'>
        {文案['分享.背景位置']}
        <b>{配置.背景横向位置}%</b>
      </label>
      <div className={样式.背景位置}>
        <Slider
          id='分享背景位置'
          ariaLabelForHandle={文案['分享.背景位置']}
          value={配置.背景横向位置}
          min={0}
          max={100}
          marks={{
            0: 文案['分享.背景靠左'],
            50: 文案['分享.背景居中'],
            100: 文案['分享.背景靠右'],
          }}
          onChange={(背景横向位置) => 更新({ ...配置, 背景横向位置 })}
        />
      </div>
      <label className={样式.标签} htmlFor='分享蒙层'>
        {文案['分享.蒙层']}
        <b>{配置.蒙层}%</b>
      </label>
      <Slider
        id='分享蒙层'
        value={配置.蒙层}
        min={0}
        max={100}
        onChange={(蒙层) => 更新({ ...配置, 蒙层 })}
      />
      <label className={样式.标签} htmlFor='分享署名'>
        {文案['分享.署名']}
      </label>
      <Input
        id='分享署名'
        value={配置.署名}
        maxLength={24}
        onChange={(事件) => 更新({ ...配置, 署名: 事件.target.value })}
      />
      <label className={样式.标签} htmlFor='分享寄语'>
        {文案['分享.寄语']}
      </label>
      <Input.TextArea
        id='分享寄语'
        value={配置.寄语}
        maxLength={60}
        autoSize={{ minRows: 2, maxRows: 3 }}
        onChange={(事件) => 更新({ ...配置, 寄语: 事件.target.value })}
      />
      <div className={样式.开关组}>
        {(
          [
            ['养成', '分享.养成明细'],
            ['属性', '分享.属性对比'],
            ['显示署名', '分享.显示署名'],
            ['二维码', '分享.二维码'],
          ] as const
        ).map(([键, 文案键]) => (
          <label key={键}>
            <span>{文案[文案键]}</span>
            <Switch
              size='small'
              aria-label={文案[文案键]}
              checked={配置[键]}
              onChange={(值) => 更新({ ...配置, [键]: 值 })}
            />
          </label>
        ))}
      </div>
      <label className={样式.标签}>{文案['分享.清晰度']}</label>
      <Segmented
        block
        value={配置.清晰度}
        options={[
          { label: 文案['分享.标准'], value: 1 },
          { label: 文案['分享.高清'], value: 2 },
        ]}
        onChange={(清晰度) => 更新({ ...配置, 清晰度: Number(清晰度) })}
      />
    </>
  )
}
