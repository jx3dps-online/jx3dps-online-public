import { FloatButton } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReadOutlined,
  FieldTimeOutlined,
  HomeOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  SlidersOutlined,
  ToolOutlined,
} from '@ant-design/icons'

import DeveloperModal from './网页工具'
import 数据统计弹窗 from './数据统计弹窗'
import 网页设置 from '@/功能模块/系统工具/网页设置'
import { 注册行为, 注销行为 } from '@/桌宠/工具/行为注册表'

import 功能说明入口 from '@/功能模块/功能说明/入口'
import { use心法数据 } from '@/心法模块/心法上下文'
import styles from './index.module.less'

const 技能增益查询弹窗 = React.lazy(() => import('./数据大全/技能增益查询弹窗'))

function 页面右下角工具() {
  const navigate = useNavigate()
  const { 名称 } = use心法数据()
  const isLocalBuild = process.env.REACT_APP_BUILD_TYPE === 'local'
  const [网页工具弹窗, 设置网页工具弹窗] = useState(false)
  const [网页工具当前标签, 设置网页工具当前标签] = useState<string>('Generator解析')
  const [数据统计弹窗展示, 设置数据统计弹窗] = useState(false)
  const [悬浮弹窗展示, 设置悬浮弹窗展示] = useState(false)
  const [技能增益弹窗展示, 设置技能增益弹窗展示] = useState(false)
  const [网页设置弹窗展示, 设置网页设置弹窗展示] = useState(false)

  const 打开网页工具 = useCallback((activeKey?: string) => {
    设置悬浮弹窗展示(false)
    if (activeKey) {
      设置网页工具当前标签(activeKey)
    }
    设置网页工具弹窗(true)
  }, [])

  const 打开JCL战斗记录解析 = useCallback(() => {
    打开网页工具('JCL战斗记录解析')
  }, [打开网页工具])

  useEffect(() => {
    注册行为('打开JCL战斗记录解析', 打开JCL战斗记录解析)
    return () => 注销行为('打开JCL战斗记录解析')
  }, [打开JCL战斗记录解析])

  return (
    <>
      <功能说明入口
        心法={名称}
        渲染入口={(打开) => (
          <FloatButton.Group
            trigger='click'
            className={styles.floatBtnGroup}
            shape='square'
            open={悬浮弹窗展示}
            onOpenChange={(e) => 设置悬浮弹窗展示(e)}
            icon={<SettingOutlined id='Guide_15' />}
            style={{
              width: 100,
              insetInlineEnd: 24,
              bottom: 24,
              fontSize: 12,
              opacity: 0.95,
            }}
          >
            <FloatButton
              className={styles.floatBtn}
              icon={<SettingOutlined />}
              description='网页设置'
              onClick={() => {
                设置悬浮弹窗展示(false)
                设置网页设置弹窗展示(true)
              }}
            />
            <FloatButton
              className={styles.floatBtn}
              icon={<ToolOutlined />}
              description='网页工具'
              onClick={() => {
                打开网页工具()
              }}
            />
            <FloatButton
              className={styles.floatBtn}
              icon={<SlidersOutlined />}
              description='数据统计'
              onClick={() => {
                设置悬浮弹窗展示(false)
                设置数据统计弹窗(true)
              }}
            />
            <FloatButton
              className={styles.floatBtn}
              icon={<FieldTimeOutlined />}
              description='加速工具'
              onClick={() => (isLocalBuild ? navigate('/haste') : window?.open('/haste'))}
            />
            <FloatButton
              className={styles.floatBtn}
              icon={<QuestionCircleOutlined />}
              description='问题反馈'
              onClick={() => window?.open('https://www.jx3box.com/bps/79885')}
            />
            <FloatButton
              className={styles.floatBtn}
              icon={<ReadOutlined id='Guide_功能说明' />}
              description='功能说明'
              onClick={() => {
                设置悬浮弹窗展示(false)
                打开()
              }}
            />
            <FloatButton
              className={styles.floatBtn}
              icon={<SearchOutlined />}
              description='数据大全'
              onClick={() => {
                设置悬浮弹窗展示(false)
                设置技能增益弹窗展示(true)
              }}
            />
            <FloatButton
              className={styles.floatBtn}
              icon={<HomeOutlined />}
              description='回到首页'
              onClick={() => {
                设置悬浮弹窗展示(false)
                navigate('/')
              }}
            />
          </FloatButton.Group>
        )}
      />
      <网页设置 open={网页设置弹窗展示} onCancel={() => 设置网页设置弹窗展示(false)} />
      <DeveloperModal
        visible={网页工具弹窗}
        onClose={() => 设置网页工具弹窗(false)}
        activeKey={网页工具当前标签}
        onActiveKeyChange={设置网页工具当前标签}
      />
      {数据统计弹窗展示 ? (
        <数据统计弹窗 open={数据统计弹窗展示} onCancel={() => 设置数据统计弹窗(false)} />
      ) : null}
      {技能增益弹窗展示 ? (
        <React.Suspense fallback={null}>
          <技能增益查询弹窗 open={技能增益弹窗展示} onCancel={() => 设置技能增益弹窗展示(false)} />
        </React.Suspense>
      ) : null}
    </>
  )
}

export default 页面右下角工具
