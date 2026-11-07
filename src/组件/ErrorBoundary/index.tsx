import { Button, Collapse, Modal } from 'antd'
import React from 'react'
import styles from './index.module.less'
import { ClearLocalStorage } from '@/工具函数/tools/log'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, collapse: [] }
  }

  static getDerivedStateFromError(error) {
    // 更新 state 以便下次渲染能够显示回退 UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    console.log('this.state as any).error', error)
  }

  clearCache() {
    Modal.confirm({
      title: (
        <p translate='no'>
          ⚠️警告，清除缓存将清空你的配装、增益等设置。清除后需重新配装。同时会清除在线链接其他门派的相同信息，请谨慎使用。
        </p>
      ),
      content: <p translate='no'>仅作为计算数据异常、页面异常时使用。</p>,
      onOk: () => {
        ClearLocalStorage()
      },
    })
  }

  render() {
    if ((this.state as any).hasError) {
      const 错误 = (this.state as any).error as (Error & { code?: string }) | null
      const 资源加载失败 =
        错误?.name === 'ChunkLoadError' ||
        错误?.code === 'CSS_CHUNK_LOAD_FAILED' ||
        /^Loading (?:CSS )?chunk [\s\S]+ failed\./i.test(错误?.message || '')
      // 自定义的错误信息
      return (
        <div className={styles.main} translate='no'>
          <div>
            <h1 className={styles.title}>{资源加载失败 ? '页面资源加载失败' : '发生错误'}</h1>
            {资源加载失败 ? (
              <>
                <p className={styles.tip}>可能是网站更新或网络异常导致。</p>
                <p className={styles.tip}>
                  请先刷新页面；若仍失败，请按 <strong>Ctrl + F5</strong> 强制刷新。
                </p>
              </>
            ) : (
              <>
                <p className={styles.tip}>建议使用最新版本的 Chrome/Edge 浏览器访问</p>
                <p className={styles.tip} style={{ color: 'red' }}>
                  如果您启用了“翻译”功能，请关闭后再使用
                </p>
              </>
            )}
            <div>
              <Button
                className={styles.btn}
                type='primary'
                onClick={() => {
                  location.reload()
                }}
              >
                刷新页面
              </Button>
              {!资源加载失败 && (
                <Button className={styles.btn} danger onClick={() => this.clearCache()}>
                  清除缓存
                </Button>
              )}
            </div>
            <Collapse defaultActiveKey={['error_info']} className={styles.error}>
              <Collapse.Panel header='错误详情' key='error_info'>
                <p>{(this.state as any).error?.toString()}</p>
              </Collapse.Panel>
            </Collapse>
          </div>
        </div>
      )
    }

    return (this.props as any)?.children
  }
}

export default ErrorBoundary
