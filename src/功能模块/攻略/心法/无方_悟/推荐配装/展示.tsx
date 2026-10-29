import { lazy, useState } from 'react'
import { Button } from 'antd'
import 攻略弹窗 from '../../../攻略弹窗'

const 无方武学助手攻略 = lazy(() => import('../../无方/武学助手'))

export default function 推荐配装() {
  const [攻略打开, 设置攻略打开] = useState(false)

  return (
    <>
      <p>推荐配装参考旗舰端，加速1段10即可。</p>
      <Button type='link' onClick={() => 设置攻略打开(true)}>
        点击查看旗舰端配装
      </Button>
      <攻略弹窗 攻略组件={无方武学助手攻略} 打开={攻略打开} 关闭={() => 设置攻略打开(false)} />
    </>
  )
}
