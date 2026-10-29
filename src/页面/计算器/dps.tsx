import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { App as AntdApp, ConfigProvider, notification } from 'antd'
import dayjs from 'dayjs'
import antdZhCN from 'antd/locale/zh_CN'
import { HappyProvider } from '@ant-design/happy-work-theme'

import store from '@/store/index'
import ErrorBoundary from '@/组件/ErrorBoundary'
import Layout from '@/组件/Layout'

import 基础设置 from '@/功能模块/基础设置'
import 系统工具 from '@/功能模块/系统工具'
import 心法切换 from '@/功能模块/心法切换'
import 系统说明 from '@/功能模块/系统说明'
import 计算结果 from '@/功能模块/计算结果'
const 加载新手引导 = () => import('@/功能模块/新手引导')
import 异步内容 from '@/功能模块/功能说明/异步内容'
import 桌宠 from '@/桌宠'
import use移动端 from '@/hooks/use移动端'

import { use心法数据 } from '@/心法模块/心法上下文'

import '@/工具函数/axios'
import 'dayjs/locale/zh-cn'

import './index.css'

dayjs.locale('zh-cn')

// TODO 已更新循环列在这里
const 已完成心法: string[] = [
  '孤锋诀',
  '紫霞功',
  '无方',
  '傲血战意',
  '冰心诀',
  '太玄经',
  '凌海诀',
  '北傲诀',
  '毒经',
  '花间游',
  '易筋经',
  '周天功',
  '无方_悟',
  '分山劲_悟',
  '山海心诀',
  '幽罗引',
  '笑尘诀',
  '分山劲',
  '天罗诡道',
  '焚影圣诀',
  // '周天功_悟',
  // '孤锋诀_悟',
]

function 主页面() {
  const 移动端 = use移动端()
  const { 系统配置, 名称, 邀请使用 } = use心法数据()
  const 主题色 = 系统配置?.主题色 || '#dca53e'

  // 同步 antd 全局静态主题（Modal / notification 等非受控组件）
  useEffect(() => {
    ConfigProvider.config({ theme: { primaryColor: 主题色 } })
  }, [主题色])

  useEffect(() => {
    if (!已完成心法.includes(名称)) {
      notification.error({
        message: `请注意`,
        description: `${名称} 计算器尚未完成开发，仅做功能体验`,
        placement: 'top',
      })
    }
    if (邀请使用 && location.hostname === 'localhost') {
      notification.error({
        message: `内部使用`,
        description: `${名称} 计算器为个人内部学习，不对外开放，请开发者不要在任何公开场合谈论谈论该模块，感谢合作。`,
        placement: 'top',
      })
    }
  }, [名称, 邀请使用])

  return (
    <Provider store={store}>
      <HappyProvider>
        <ConfigProvider
          locale={antdZhCN}
          theme={{
            token: {
              colorPrimary: 主题色,
            },
          }}
        >
          <ErrorBoundary>
            <AntdApp>
              <Layout>
                <系统说明 />
                <基础设置 />
                <计算结果 />
                <系统工具 />
                <心法切换 />
                <异步内容 加载={加载新手引导} 参数={{}} />
                {!移动端 && <桌宠 />}
              </Layout>
            </AntdApp>
          </ErrorBoundary>
        </ConfigProvider>
      </HappyProvider>
    </Provider>
  )
}

export default 主页面
