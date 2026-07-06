import 奇穴选择抽屉 from '@/功能模块/基础设置/公用设置/奇穴选择/drawer'
import { forwardRef, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'
import { Button } from 'antd'
import './indes.css'

interface 奇穴选择类型 {
  value?: string[]
  onChange?: (e?: string[]) => void
}

const 奇穴选择 = (props: 奇穴选择类型, ref) => {
  const { value, onChange } = props
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <div className='cycle-setting-qixue-wrap' ref={ref}>
        {value?.length ? (
          value?.map((item) => {
            return item ? (
              <span key={uuidV4()} className='cycle-setting-qixue-item'>
                {item}
              </span>
            ) : null
          })
        ) : (
          <span className={'cycle-setting-qixue-empty'}>无奇穴</span>
        )}
        {/* <Button className={'cycle-setting-qixue-btn'} type='link' onClick={() => setOpen(true)}>
          设置奇穴
        </Button> */}
      </div>
      <奇穴选择抽屉
        value={value || []}
        onChange={onChange}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default forwardRef(奇穴选择)
