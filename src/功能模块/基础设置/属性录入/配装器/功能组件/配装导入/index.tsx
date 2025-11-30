import { Modal, Tabs } from 'antd'
import React, { useMemo, useState } from 'react'

import Jx3BoxImport from './Jx3BoxImport'
import JCL装备导入 from './JCL装备导入'
import 配装器装备导入 from './配装器装备导入'
import Generator装备导入 from './Generator装备导入'
import './index.css'
import MYImport from './MYImport'

function 配装方案导入({ visible, onClose, onOk }) {
  const [active, setActive] = useState('my')

  const beforeClose = () => {
    onClose()
  }

  const beforeOk = (e) => {
    onOk(e)
    beforeClose()
  }

  const items = [
    { label: '插件导入', key: 'my' },
    { label: '角色导入', key: 'account' },
    { label: '魔盒导入', key: 'jx3box' },
    { label: 'JCL导入', key: 'jcl' },
    { label: '配装器导入', key: 'jx3dps' },
    { label: 'Generator', key: 'Generator' },
  ]

  const CycleComponent = useMemo(() => {
    const CycleMap = {
      jx3box: <Jx3BoxImport onOk={beforeOk} />,
      my: <MYImport onOk={beforeOk} />,
      jcl: <JCL装备导入 onOk={beforeOk} />,
      jx3dps: <配装器装备导入 onOk={beforeOk} />,
      Generator: <Generator装备导入 onOk={beforeOk} />,
    }
    return visible ? CycleMap[active] || <></> : null
  }, [active, visible, beforeOk])

  return (
    <Modal
      className={'pz-daoru-modal'}
      title={
        <div>
          <Tabs className={'pz-daoru-tabs'} items={items} onChange={setActive} />
        </div>
      }
      open={visible}
      centered
      onCancel={() => beforeClose()}
      footer={null}
      width={600}
    >
      {CycleComponent}
    </Modal>
  )
}

export default 配装方案导入
