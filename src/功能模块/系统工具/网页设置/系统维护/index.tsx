import React from 'react'
import { App, Button } from 'antd'
import { useAppDispatch } from '@/hooks'
import {
  更新新手引导流程状态,
  更新当前引导步骤,
  更新背景图选择,
  更新自定义背景图,
} from '@/store/system'
import { ClearLocalStorage } from '@/工具函数/tools/log'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import {
  清理所有本地背景图,
  读取心法背景图选择,
  读取心法自定义背景图,
} from '@/功能模块/系统工具/网页设置/背景图设置/工具函数'
import 设置项 from '../设置项'

function 系统维护(props) {
  const { onClose } = props
  const dispatch = useAppDispatch()
  const { modal } = App.useApp()

  const 清空缓存 = () => {
    modal.confirm({
      title:
        '⚠️警告，清除缓存将清空你的配装、增益等设置。清除后需重新配装。同时会清除在线链接其他门派的相同信息，请谨慎使用。',
      content: '仅作为计算数据异常、页面异常时使用。',
      onOk: () => {
        ClearLocalStorage()
      },
    })
  }

  const 清理本地图片 = () => {
    modal.confirm({
      title: '确认清理本地背景图？',
      content: '将删除所有门派下已上传的本地背景图片，删除后不可恢复。',
      onOk: () => {
        清理所有本地背景图().then(() => {
          const 心法名称 = 获取当前数据()?.名称
          if (心法名称) {
            dispatch(更新自定义背景图(读取心法自定义背景图(心法名称)))
            dispatch(更新背景图选择(读取心法背景图选择(心法名称)))
          }
        })
      },
    })
  }

  const 重放新手引导 = () => {
    dispatch(更新新手引导流程状态(true))
    dispatch(更新当前引导步骤(0))
    onClose?.()
  }

  return (
    <>
      <设置项 标题='清空缓存' 说明='清除本网站所有本地缓存数据（保留部分关键配置）。'>
        <Button danger onClick={清空缓存}>
          清空缓存
        </Button>
      </设置项>
      <设置项 标题='清理本地背景图' 说明='删除所有门派下已上传的本地背景图片，删除后不可恢复。'>
        <Button onClick={清理本地图片}>清理本地背景图</Button>
      </设置项>
      <设置项 标题='新手引导重放' 说明='重新播放一次新手引导流程。'>
        <Button onClick={重放新手引导}>重放</Button>
      </设置项>
    </>
  )
}

export default 系统维护
