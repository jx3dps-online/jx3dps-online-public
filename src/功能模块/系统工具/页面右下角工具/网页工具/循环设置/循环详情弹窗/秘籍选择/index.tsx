import { 选中秘籍信息 } from '@/@types/秘籍'
import 秘籍选择抽屉 from '@/功能模块/基础设置/公用设置/秘籍选择/drawer'
import { forwardRef, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'
import { Button } from 'antd'
import './indes.css'

interface 秘籍选择类型 {
  value?: 选中秘籍信息
  onChange?: (e?: 选中秘籍信息) => void
}

const 秘籍选择 = (props: 秘籍选择类型, ref) => {
  const { value, onChange } = props
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <div className='cycle-setting-miji-wrap' ref={ref}>
        {value ? (
          Object.keys(value)?.map((item) => {
            return (
              <span key={uuidV4()} className='cycle-setting-miji-item'>
                {item}：{Object.keys(value[item])?.length}
              </span>
            )
          })
        ) : (
          <span className={'cycle-setting-miji-empty'}>无秘籍</span>
        )}
        {/* <Button className={'cycle-setting-miji-btn'} type='link' onClick={() => setOpen(true)}>
          设置秘籍
        </Button> */}
        {/* {value ? (
          <Button
            className={'cycle-setting-miji-btn'}
            danger
            type='link'
            onClick={() => onChange?.(undefined)}
          >
            清除
          </Button>
        ) : null} */}
      </div>
      <秘籍选择抽屉
        value={value || {}}
        onChange={onChange}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default forwardRef(秘籍选择)
