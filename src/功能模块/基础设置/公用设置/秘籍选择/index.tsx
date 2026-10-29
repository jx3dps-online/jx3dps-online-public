import { GLOBAL_CDN_PREFIX } from '@/工具函数/const'
import { useState } from 'react'
import { use心法数据 } from '@/心法模块/心法上下文'
import { Button, Tooltip } from 'antd'
import 秘籍选择抽屉 from './drawer'
import './index.css'
const miji = `${GLOBAL_CDN_PREFIX}/20261025/miji.png`

function 秘籍选择() {
  const { 心法所属端 } = use心法数据()
  const [visible, setVisible] = useState<boolean>(false)

  return (
    <>
      <Tooltip title='秘籍设置'>
        <Button
          aria-label='秘籍设置'
          onClick={() => setVisible(true)}
          disabled={心法所属端 === '无界'}
          className={'cycle-miji-btn'}
        >
          {/* <img className={'cycle-miji-btn-img'} src={miji} /> */}
          秘籍
        </Button>
      </Tooltip>
      <秘籍选择抽屉 显示秒伤对比 open={visible} onClose={() => setVisible(false)} />
    </>
  )
}

export default 秘籍选择
