import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useQuery from '@/hooks/use-query'
import { Modal, ModalProps, Radio } from 'antd'
import { use心法数据 } from '@/心法模块/心法上下文'
import 黑名单邀请码 from '@/数据/静态数据/邀请码/黑名单.json'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import { 数据埋点 } from '@/工具函数/tools/log'
import { jwtDecode } from 'jwt-decode'

import './index.css'

const 心法切换弹窗: React.FC<ModalProps> = (props) => {
  const 当前数据 = use心法数据()
  const navigate = useNavigate()
  const [所有心法数据, 更新所有心法数据] = useState<any>({})

  const urlCode = useQuery('code')

  useEffect(() => {
    初始化所有心法数据?.()
  }, [心法数据])

  const 初始化所有心法数据 = async () => {
    const res = 心法数据
    const 可看到心法: string[] = []
    const 可邀请心法: { [key: string]: string } = {}
    const hrefDev = location.href?.includes('localhost')
    const DEV = hrefDev

    Object.keys(res).forEach((key) => {
      if (DEV) {
        可看到心法.push(key)
      } else {
        if (res[key]?.邀请使用) {
          if (res[key]?.简写) {
            可邀请心法[res[key]?.简写] = key
          }
        } else {
          可看到心法.push(key)
        }
      }
    })

    try {
      const storageCcode = localStorage.getItem('邀请码')
      const code = urlCode || storageCcode
      if (code && !(黑名单邀请码 as string[])?.includes(code)) {
        const decode = jwtDecode(code) as { 心法: string; 邀请人: string }
        const 邀请心法列表 = decode?.心法
          ?.split(',')
          ?.filter((i) => i !== 'bxj')
          ?.map((i) => {
            if (i === 'fhs') {
              return 可邀请心法['bxj']
            }
            return 可邀请心法?.[i]
          })
          ?.filter((i) => i)
        if (decode?.心法 && 邀请心法列表?.length) {
          可看到心法.push(...邀请心法列表)
          if (!storageCcode || storageCcode !== urlCode) {
            localStorage.setItem('邀请码', code)
          }
        }
      }
    } catch {
      // 忽略错误
    }
    更新所有心法数据(可看到心法.reduce((c, i) => ({ ...c, [i]: res[i] }), {}))
  }

  const 切换至对应心法 = (目标心法) => {
    数据埋点('切换心法')
    const 目标心法简写 = 所有心法数据?.[目标心法]?.简写
    // SPA 切换，不刷新；切心法后关闭弹窗（web 与本地打包 MemoryRouter 保持一致）
    props.onCancel?.({} as any)
    navigate(`/dps/${目标心法简写}`)
  }

  const [当前平台, 设置当前平台] = useState<'旗舰' | '无界'>(
    当前数据?.心法所属端 === '无界' ? '无界' : '旗舰',
  )

  // 切心法后重置平台为新心法所属端
  useEffect(() => {
    设置当前平台(当前数据?.心法所属端 === '无界' ? '无界' : '旗舰')
  }, [当前数据?.心法所属端])

  // const hrefDev = location.href?.includes('localhost')
  // const DEV = hrefDev

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
