import React, { lazy, Suspense, useState } from 'react'
import { Button } from 'antd'

const 增益收益抽屉 = lazy(() => import('./增益收益抽屉'))

function 心法增益() {
  const [打开, 设置打开] = useState(false)

  return (
    <>
      <Button onClick={() => 设置打开(true)}>心法增益收益</Button>
      {打开 && (
        <Suspense fallback={null}>
          <增益收益抽屉 onClose={() => 设置打开(false)} />
        </Suspense>
      )}
    </>
  )
}

export default 心法增益
