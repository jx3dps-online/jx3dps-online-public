import { useAppSelector } from '@/hooks'
import { Button, Dropdown, Menu, Space } from 'antd'
import React, { useMemo, useState } from 'react'
import { 团队增益数据类型, 增益选项数据类型 } from '@/@types/团队增益'
import { use心法数据 } from '@/心法模块/心法上下文'
import classNames from 'classnames'
// import { 触发秒伤计算 } from '@/计算模块/计算函数'

import 团队增益设置弹窗 from './团队增益设置弹窗'
import 团队增益图标 from './团队增益图标'
// import 团队增益收益弹窗 from './团队增益收益弹窗'
import './index.css'

function 团队增益选择({ 保存数据并计算 }) {
  const { 团队增益 = [], 默认数据 = {} } = use心法数据()
  const { 增益快捷设置数据 = [] } = 默认数据
  const 增益数据 = useAppSelector((state) => state.data.增益数据)
  const 新手引导流程状态 = useAppSelector((state) => state.system.新手引导流程状态)

  const [设置增益弹窗展示, 更新设置增益弹窗展示] = useState<boolean>(false)
  // const [增益收益弹窗展示, 更新增益收益弹窗展示] = useState<boolean>(false)

  const onChangeZengyi = (e: boolean | null, 增益: 团队增益数据类型, 层数?, 覆盖率?) => {
    const exist = 增益数据?.团队增益?.some((item) => item.增益名称 === 增益?.增益名称)
    const newData: 增益选项数据类型 = {
      ...增益数据,
      团队增益: [...(增益数据?.团队增益 || [])],
    }
    if (exist) {
      newData.团队增益 = 增益数据?.团队增益?.map((item) => {
        if (item.增益名称 === 增益?.增益名称) {
          return {
            ...item,
            启用: e === null ? item?.启用 : e,
            层数: 层数 || item?.层数,
            覆盖率: 覆盖率 || item?.覆盖率,
          }
        } else {
          return {
            ...item,
          }
        }
      })
    } else {
      newData.团队增益 = [
        ...newData.团队增益,
        {
          增益名称: 增益?.增益名称,
          启用: e === null ? true : e,
          层数: 层数 || 增益?.层数 || 1,
          覆盖率: 覆盖率 || 增益?.覆盖率 || 100,
        },
      ]
    }

    保存数据并计算(newData)
  }

  const 快捷设置团队增益 = (data) => {
    const newData: 增益选项数据类型 = {
      ...增益数据,
      团队增益: [...(data || [])],
    }
    保存数据并计算(newData)
  }

  const 显示团队增益 = useMemo(() => {
    return (
      团队增益
        .filter((item) => {
          return (
            (增益数据?.团队增益 || []).find((a) => item?.增益名称 === a?.增益名称)?.启用 || false
          )
        })
        .map((item) => {
          const 当前数据 = (增益数据?.团队增益 || []).find((a) => item?.增益名称 === a?.增益名称)
          return {
            ...item,
            当前数据: 当前数据,
          }
        }) || []
    )
  }, [团队增益, 增益数据])

  const cls = classNames('tuandui-list', 新手引导流程状态 ? 'onGuide' : '')

  return (
    <div className='tuandui-zengyi'>
      <div className='tuandui-zengyi-header'>
        <h1 className='tuandui-title'>团队增益</h1>
        {增益快捷设置数据?.length ? (
          <Dropdown
            disabled={新手引导流程状态}
            overlay={
              <Menu>
                {增益快捷设置数据.map((item) => {
                  return (
                    <Menu.Item
                      key={item?.快捷名称}
                      onClick={() => 快捷设置团队增益(item?.团队增益 || [])}
                    >
                      {item?.快捷名称}
                    </Menu.Item>
                  )
                })}
              </Menu>
            }
            placement='topLeft'
          >
            <Button danger className={'tuandui-setting-btn'} size='small'>
              快捷设置
            </Button>
          </Dropdown>
        ) : null}
        <Button
          className={'tuandui-setting-btn'}
          size='small'
          onClick={() => {
            if (新手引导流程状态) {
              return
            }
            更新设置增益弹窗展示(true)
          }}
        >
          增益详情
        </Button>
        {/* <Button
          className={'tuandui-setting-btn'}
          size='small'
          type='dashed'
          onClick={() => {
            if (新手引导流程状态) {
              return
            }
            更新增益收益弹窗展示(true)
          }}
        >
          增益收益
        </Button> */}
      </div>
      <div className={cls}>
        {显示团队增益?.length ? (
          <Space size={[12, 12]} wrap>
            {显示团队增益.map((item) => {
              return <团队增益图标 data={item} key={item?.增益名称} 当前数据={item?.当前数据} />
            })}
          </Space>
        ) : (
          <p className={'tuandui-empty'}>当前无团队增益</p>
        )}
      </div>
      <团队增益设置弹窗
        open={设置增益弹窗展示}
        onCancel={() => 更新设置增益弹窗展示(false)}
        onChangeZengyi={onChangeZengyi}
        快捷设置团队增益={快捷设置团队增益}
      />
      {/* <团队增益收益弹窗 open={增益收益弹窗展示} onCancel={() => 更新增益收益弹窗展示(false)} /> */}
    </div>
  )
}

export default 团队增益选择
