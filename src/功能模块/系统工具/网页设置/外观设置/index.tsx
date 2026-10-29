import React, { useEffect, useState } from 'react'
import { Switch } from 'antd'
import { 获取桌宠隐藏状态, 切换桌宠隐藏 } from '@/桌宠/工具/隐藏'
import 设置项 from '../设置项'

function 外观设置(props) {
  const { open } = props
  const [桌宠显示, 设置桌宠显示] = useState<boolean>(!获取桌宠隐藏状态())

  useEffect(() => {
    if (open) {
      设置桌宠显示(!获取桌宠隐藏状态())
    }
  }, [open])

  const 切换桌宠显示 = (checked) => {
    if (checked !== !获取桌宠隐藏状态()) {
      切换桌宠隐藏()
    }
    设置桌宠显示(checked)
  }

  return (
    <>
      <设置项 标题='展示桌宠' 说明='隐藏或显示当前心法的桌宠，按心法分别记忆。'>
        <Switch checked={桌宠显示} onChange={切换桌宠显示} />
      </设置项>
    </>
  )
}

export default 外观设置
