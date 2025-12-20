import { useEffect, useState } from 'react'
import { Modal, ModalProps, Radio } from 'antd'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import { 数据埋点 } from '@/工具函数/tools/log'

import './index.css'

const 当前数据 = 获取当前数据()

const 心法切换弹窗: React.FC<ModalProps> = (props) => {
  const [所有心法数据, 更新所有心法数据] = useState<any>({})

  useEffect(() => {
    初始化所有心法数据?.()
  }, [心法数据])

  const 初始化所有心法数据 = async () => {
    const res = 心法数据
    const 可看到心法: string[] = []

    Object.keys(res).forEach((key) => {
      可看到心法.push(key)
    })

    更新所有心法数据(可看到心法.reduce((c, i) => ({ ...c, [i]: res[i] }), {}))
  }

  const 切换至对应心法 = (目标心法) => {
    数据埋点('切换心法')
    const 目标心法简写 = 所有心法数据?.[目标心法]?.简写
    if (window) {
      // 兼容本地打包跳转
      const href = window.location.href
      const search = window.location.search
      const baseHref = href?.replace(search, '')
      const newHref = `${baseHref}?xf=${目标心法简写}`
      window.location.href = newHref
    }
  }

  const [当前平台, 设置当前平台] = useState<'旗舰' | '无界'>(
    当前数据?.心法所属端 === '无界' ? '无界' : '旗舰',
  )

  return (
    <Modal
      title={
        <div className='school-switch-wrap'>
          <h1 className='school-switch-title'>心法切换</h1>
          <div className='school-switch-tabs'>
            <Radio.Group
              value={当前平台}
              onChange={(e) => 设置当前平台(e?.target?.value)}
              buttonStyle='solid'
            >
              <Radio.Button value={'旗舰'} key={'旗舰'}>
                旗舰
              </Radio.Button>
              <Radio.Button value={'无界'} key={'无界'}>
                无界
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      }
      {...props}
      footer={null}
      width={660}
      className='school-switch-modal-wrap'
    >
      <div className='school-switch-modal'>
        {Object.keys(所有心法数据)
          // ?.filter((key) => {
          //   if (DEV) {
          //     return true
          //   } else {
          //     const 心法: any = 所有心法数据[key]
          //     return !心法?.内部测试
          //   }
          // })
          ?.filter((key) => {
            const 心法: any = 所有心法数据[key]
            return 心法?.心法所属端 === '无界' ? 当前平台 === '无界' : 当前平台 === '旗舰'
          })
          ?.map((key) => {
            const 心法: any = 所有心法数据[key]
            const 是当前心法 = 心法.名称 === 当前数据.名称
            return (
              <div
                className={`school-switch-item ${是当前心法 ? 'school-switch-item-active' : ''}`}
                key={心法?.名称}
                onClick={() => 切换至对应心法(key)}
              >
                <div className='school-switch-item-content'>
                  <img className='school-switch-item-img' src={心法?.系统配置?.心法图标} />
                  <span
                    className={`school-switch-item-text ${
                      是当前心法 ? 'school-switch-list-active' : ''
                    }`}
                  >
                    {心法?.名称?.replace('_悟', '')}
                  </span>
                </div>
                <img className='school-switch-item-img-bg' src={心法?.系统配置?.心法图标} />
                <div
                  className='school-switch-item-bg'
                  style={{ backgroundColor: 心法?.系统配置?.主题色 }}
                />
              </div>
            )
          })}
      </div>
    </Modal>
  )
}

export default 心法切换弹窗
