import React, { lazy, Suspense, useState } from 'react'
import { Button } from 'antd'

const 装备增益抽屉 = lazy(() => import('./装备增益抽屉'))

function 装备增益() {
  const [打开, 设置打开] = useState(false)
  return (
    <>
      <Button onClick={() => 设置打开(true)}>装备收益分析</Button>
      {打开 && (
        <Suspense fallback={null}>
          <装备增益抽屉 onClose={() => 设置打开(false)} />
        </Suspense>
      )}
    </>
  )
}

export default 装备增益
