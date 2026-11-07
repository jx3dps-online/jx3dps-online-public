import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Alert, Button, ConfigProvider, Modal, message } from 'antd'
import theme from 'antd/es/theme'
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import { use心法数据 } from '@/心法模块/心法上下文'
import 通用背景 from '@/组件/Layout/背景图'
import { 获取文案 } from '../../文案'
import { 生成分享数据, 获取分享标识, 分享不可用原因 } from './数据'
import type { 登阶页面, 分享配置 } from './数据'
import 分享画面 from './分享画面'
import 分享设置 from './分享设置'
import { 生成分享图片, 保存分享图片, 背景加载异常 } from './导出'
import 样式 from './index.module.less'

export default function 进度分享({ 页面, 关闭 }: { 页面: 登阶页面; 关闭: () => void }) {
  const 文案 = 获取文案(页面.名称)
  const 不可用 = 分享不可用原因(页面)
  useEffect(() => {
    if (不可用) {
      message.warning(文案['分享.数据变化'])
      关闭()
    }
  }, [不可用, 关闭, 文案])
  return 不可用 ? null : <分享弹窗 页面={页面} 关闭={关闭} />
}

function 分享弹窗({ 页面, 关闭 }: { 页面: 登阶页面; 关闭: () => void }) {
  const 文案 = 获取文案(页面.名称)
  const { 系统配置 } = use心法数据()
  const [配色] = useState(() => {
    const 画布 = document.createElement('canvas')
    画布.width = 画布.height = 1
    const 画笔 = 画布.getContext('2d')
    if (画笔) {
      画笔.fillStyle = 系统配置.主题色
      画笔.fillRect(0, 0, 1, 1)
    }
    const 通道 = 画笔 ? Array.from(画笔.getImageData(0, 0, 1, 1).data).slice(0, 3) : [130, 140, 155]
    const 浅色 = 通道.map((值) => Math.round(值 * 0.62 + 245 * 0.38)).join(', ')
    return {
      '--share-accent': `rgb(${浅色})`,
      '--share-line': `rgba(${浅色}, 0.25)`,
      '--share-border': `rgba(${浅色}, 0.65)`,
      '--share-tint': `rgba(${浅色}, 0.06)`,
    } as CSSProperties
  })
  const [数据] = useState(() => 生成分享数据(页面))
  const [初始标识] = useState(() => 获取分享标识(页面))
  const [背景列表] = useState(() => [
    ...new Set(系统配置.背景图?.length ? 系统配置.背景图 : 通用背景),
  ])
  const [配置, 更新配置] = useState<分享配置>(() => ({
    背景: 背景列表[Math.floor(Math.random() * 背景列表.length)],
    背景横向位置: 70,
    蒙层: 60,
    署名: 数据.当前.名称 || '',
    寄语: 文案['分享.默认寄语'],
    养成: false,
    属性: false,
    显示署名: true,
    二维码: true,
    清晰度: 2,
  }))
  const [生成中, 设置生成中] = useState(false)
  const [失败背景, 设置失败背景] = useState('')
  const [错误, 设置错误] = useState('')
  const [缩放, 设置缩放] = useState(0.6)
  const [高度, 设置高度] = useState(1500)
  const 容器 = useRef<HTMLDivElement>(null)
  const 画面 = useRef<HTMLElement>(null)
  const 导出控制器 = useRef<AbortController>()
  const 仍有效 = useRef(true)
  const 标识 = 获取分享标识(页面)
  useLayoutEffect(() => {
    仍有效.current = 标识 === 初始标识
    if (标识 !== 初始标识) {
      导出控制器.current?.abort()
      message.warning(文案['分享.数据变化'])
      关闭()
    }
  }, [标识, 初始标识, 关闭, 文案])
  useLayoutEffect(() => {
    return () => {
      仍有效.current = false
      导出控制器.current?.abort()
    }
  }, [])
  useEffect(() => {
    const 观察器 = new ResizeObserver(() => {
      if (容器.current && 画面.current) {
        设置缩放(Math.min(1, 容器.current.clientWidth / 画面.current.offsetWidth))
        设置高度(画面.current.offsetHeight)
      }
    })
    if (容器.current) 观察器.observe(容器.current)
    if (画面.current) 观察器.observe(画面.current)
    return () => 观察器.disconnect()
  }, [])
  const 导出 = async (复制: boolean) => {
    if (!画面.current || 导出控制器.current || 标识 !== 初始标识) return
    if (复制 && (!window.ClipboardItem || !navigator.clipboard?.write)) {
      设置错误(文案['分享.复制不可用'])
      return
    }
    const 控制器 = new AbortController()
    导出控制器.current = 控制器
    设置生成中(true)
    设置错误('')
    let 图片错误 = ''
    try {
      const 图片 = 生成分享图片(画面.current, 配置.清晰度, 控制器.signal, 文案).then((文件) => {
        if (!仍有效.current || 控制器.signal.aborted)
          throw new DOMException('Aborted', 'AbortError')
        return 文件
      })
      void 图片.catch((异常) => {
        图片错误 = 异常 instanceof Error ? 异常.message : 文案['分享.导出失败']
        if (异常 instanceof 背景加载异常 && 仍有效.current) 设置失败背景(配置.背景)
      })
      if (复制) await navigator.clipboard.write([new ClipboardItem({ 'image/png': 图片 })])
      else {
        const 文件 = await 图片
        if (仍有效.current && !控制器.signal.aborted)
          保存分享图片(文件, `${文案['登阶.名称']}-${数据.目标.名称}-${数据.日期}`)
      }
      if (仍有效.current && !控制器.signal.aborted)
        message.success(文案[复制 ? '分享.复制成功' : '分享.保存成功'])
    } catch (异常) {
      if (仍有效.current && !控制器.signal.aborted)
        设置错误(图片错误 || 文案[复制 ? '分享.复制不可用' : '分享.导出失败'])
      控制器.abort()
    } finally {
      if (仍有效.current) 设置生成中(false)
      if (导出控制器.current === 控制器) 导出控制器.current = undefined
    }
  }
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: 系统配置.主题色, colorBgElevated: '#171b20', borderRadius: 8 },
      }}
      componentDisabled={生成中}
    >
      <Modal
        open
        title={文案['分享.标题']}
        onCancel={关闭}
        footer={null}
        width={1260}
        className={样式.弹窗}
        style={配色}
        styles={{ body: { padding: 0 } }}
        maskClosable={!生成中}
      >
        <div className={样式.布局}>
          <div className={样式.预览区}>
            <div ref={容器} className={样式.画面容器} style={{ height: 高度 * 缩放 }}>
              <div className={样式.缩放} style={{ transform: `scale(${缩放})` }}>
                <分享画面
                  ref={画面}
                  数据={数据}
                  配置={{ ...配置, 背景: 配置.背景 === 失败背景 ? '' : 配置.背景 }}
                  背景失败={() => 设置失败背景(配置.背景)}
                />
              </div>
            </div>
          </div>
          <aside className={样式.配置区}>
            <fieldset disabled={生成中}>
              <分享设置 配置={配置} 更新={更新配置} 背景列表={背景列表} 文案={文案} />
            </fieldset>
            {失败背景 === 配置.背景 && (
              <Alert type='warning' message={文案['分享.背景失败']} showIcon />
            )}
            {错误 && <Alert type='error' message={错误} showIcon />}
            <div className={样式.导出按钮}>
              <Button
                type='primary'
                icon={<DownloadOutlined />}
                loading={生成中}
                onClick={() => 导出(false)}
              >
                {文案[生成中 ? '分享.生成中' : '分享.保存图片']}
              </Button>
              <Button icon={<CopyOutlined />} onClick={() => 导出(true)}>
                {文案['分享.复制图片']}
              </Button>
            </div>
          </aside>
        </div>
      </Modal>
    </ConfigProvider>
  )
}
