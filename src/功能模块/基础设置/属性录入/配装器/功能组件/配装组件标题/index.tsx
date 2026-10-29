import React, { useState } from 'react'
import { Button, Dropdown } from 'antd'
import 装备选择范围设置 from './装备选择范围设置'
import use移动端 from '@/hooks/use移动端'

function 配装组件标题({
  form,
  设置默认镶嵌宝石等级,
  保存数据并计算,
  装备选择范围,
  设置装备选择范围,
}) {
  const 移动端 = use移动端()
  const [装备细节已展开, 设置装备细节已展开] = useState(false)

  // 一键展开/收起所有部位的装备细节折叠区
  const 切换装备细节展开 = () => {
    const 折叠区列表 = Array.from(
      document.querySelectorAll<HTMLDetailsElement>('#equip-modal-content details.装备细节'),
    )
    const 目标展开 = !折叠区列表.every((item) => item.open)
    折叠区列表.forEach((item) => {
      item.open = 目标展开
    })
    设置装备细节已展开(目标展开)
  }

  // 设置所有镶嵌为6/8级
  const setAllXiangQian = (number) => {
    form?.validateFields().then((values) => {
      const res = { ...values }
      Object.keys(values)
        .filter(
          (item) =>
            res[item] &&
            ![
              '五彩石',
              '大附魔_伤帽',
              '大附魔_伤衣',
              '大附魔_伤腰',
              '大附魔_伤腕',
              '大附魔_伤鞋',
            ].includes(item),
        )
        .map((item) => {
          return {
            ...values[item],
            key: item,
            镶嵌孔数组: values[item]?.镶嵌孔数组?.map((a) => {
              return {
                ...a,
                镶嵌宝石等级: number,
              }
            }),
          }
        })
        .forEach((item) => {
          if (res[item.key]) {
            const newObj = { ...item }
            delete newObj.key
            res[item.key] = { ...newObj }
          }
        })
      设置默认镶嵌宝石等级(number)
      保存数据并计算(res)
    })
  }

  // 设置所有大附魔
  const setDafumo = (target) => {
    form?.validateFields().then((values) => {
      const res = {
        ...values,
        大附魔_伤帽: target,
        大附魔_伤衣: target,
        大附魔_伤腰: target,
        大附魔_伤腕: target,
        大附魔_伤鞋: target,
      }
      保存数据并计算(res)
    })
  }

  if (移动端) {
    return (
      <>
        <Button
          type='primary'
          onClick={切换装备细节展开}
          aria-expanded={装备细节已展开}
          title={装备细节已展开 ? '收起全部装备细节' : '展开全部装备细节'}
        >
          装备细节
        </Button>
        <装备选择范围设置
          装备选择范围={装备选择范围}
          设置装备选择范围={设置装备选择范围}
          按钮模式
        />
      </>
    )
  }

  return (
    <div className='zhuangbei-form-header'>
      <div className='zhuangbei-form-left-1'>
        <h1 className='zhuangbei-form-title'>装备</h1>
        <装备选择范围设置 装备选择范围={装备选择范围} 设置装备选择范围={设置装备选择范围} />
      </div>
      <div className='zhuangbei-form-left-2'>
        <h1 className='zhuangbei-form-title'>附魔</h1>
      </div>
      <div className='zhuangbei-form-left-3'>
        <h1 className='zhuangbei-form-title'>精炼</h1>
      </div>
      <div className='zhuangbei-form-left-4'>
        <h1 className='zhuangbei-form-title'>镶嵌</h1>
        <Dropdown
          menu={{
            items: [
              { label: '6级', key: '6', onClick: () => setAllXiangQian(6) },
              { label: '7级', key: '7', onClick: () => setAllXiangQian(7) },
              { label: '8级', key: '8', onClick: () => setAllXiangQian(8) },
            ],
          }}
        >
          <Button size='small' className={'zhuangbei-form-set-btn'}>
            一键镶嵌
          </Button>
        </Dropdown>
      </div>
      <div className='zhuangbei-form-left-5'>
        <h1 className='zhuangbei-form-title'>大附魔</h1>
        <Dropdown
          menu={{
            items: [
              { label: '英雄', key: 'dafumo_2', onClick: () => setDafumo(2) },
              { label: '普通', key: 'dafumo_1', onClick: () => setDafumo(1) },
              { label: '清空', key: 'dafumo_0', onClick: () => setDafumo(undefined) },
            ],
          }}
        >
          <Button size='small' style={{ marginLeft: 32 }}>
            一键
          </Button>
        </Dropdown>
      </div>
      <div className='zhuangbei-form-left-6'>
        <h1 className='zhuangbei-form-title'>五彩石</h1>
      </div>
    </div>
  )
}

export default 配装组件标题
