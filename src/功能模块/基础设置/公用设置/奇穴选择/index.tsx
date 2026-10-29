import React, { useState } from 'react'
import { Button, Tooltip } from 'antd'
import 奇穴选择抽屉 from './drawer'
import './index.css'

const 奇穴选择: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

  return (
    <>
      <Tooltip title='奇穴设置'>
        <Button aria-label='奇穴设置' onClick={() => setDrawerOpen(true)}>
          奇穴
        </Button>
      </Tooltip>
      <奇穴选择抽屉 open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

export default 奇穴选择
