import React from 'react'
import { Checkbox, Tooltip } from 'antd'
import { useAppSelector } from '@/hooks'
import { CloseCircleFilled } from '@ant-design/icons'
import 团队增益图标 from './团队增益图标'
import './index.css'

interface 团队增益快照类型 {
  启用: boolean
  设置是否启用: (e: boolean) => void
  当前时间: number // 当前时间 用于buff的展示
  高亮团队快照: string[]
  更新高亮团队快照: (e: string[]) => void
}

const 团队增益快照: React.FC<团队增益快照类型> = (props) => {
  const { 启用, 设置是否启用, 当前时间, 高亮团队快照, 更新高亮团队快照 } = props
  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)

  const handleChangeHightlight = (增益名称) => {
    const newArray = [...高亮团队快照]
    if (newArray.includes(增益名称)) {
      const index = newArray.indexOf(增益名称)
      if (index > -1) {
        newArray.splice(index, 1)
      }
    } else {
      newArray.push(增益名称)
    }
    更新高亮团队快照(newArray)
  }

  const 设置启用 = (e) => {
    设置是否启用(e)
    if (!e) {
      更新高亮团队快照([])
    }
  }

  return (
    <div className={'cycle-simulator-team-buff-checkbox'}>
      <Checkbox checked={启用} onChange={(e) => 设置启用(e.target.checked)}>
        启用团队增益快照
      </Checkbox>
      {启用 ? (
        <div className='cycle-simulator-team-buff-wrap'>
          {Object.keys(团队增益轴)
            ?.filter((key) => key !== '弘法')
            ?.map((增益名称) => {
              return (
                <Tooltip title={增益名称} key={`快照时间轴${增益名称}`}>
                  <div
                    onClick={() => handleChangeHightlight(增益名称)}
                    // key={`快照时间轴${增益名称}`}
                    className={`cycle-simulator-team-buff-img ${高亮团队快照?.includes(增益名称) ? 'cycle-simulator-team-buff-highlight' : ''}`}
                  >
                    <团队增益图标
                      增益轴数据={团队增益轴[增益名称]}
                      增益名称={增益名称}
                      当前时间={当前时间}
                    />
                    <div className='cycle-simulator-team-buff-highlight-border' />
                  </div>
                </Tooltip>
              )
            })}
          <CloseCircleFilled
            className='cycle-simulator-team-buff-icon'
            onClick={() => 设置启用(false)}
          />
        </div>
      ) : null}
    </div>
  )
}

export default React.memo(团队增益快照)
