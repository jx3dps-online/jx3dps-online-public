import { Alert, App, Button, message, Modal, ModalProps } from 'antd'
import './index.css'

const 数据迁移: React.FC<ModalProps> = (props) => {
  const { modal } = App.useApp()

  const 复制当前数据 = (type: '复制' | '下载') => {
    const localStorageData = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key: string = localStorage.key(i) as string
      if (key) {
        const value = localStorage.getItem(key)
        localStorageData[key] = value
      }
    }

    // 将数据转换为字符串格式
    const localStorageString = JSON.stringify(localStorageData)

    if (type === '复制') {
      // 创建一个文本域元素，用于复制内容到粘贴板
      const textarea = document.createElement('textarea')
      textarea.value = localStorageString
      document.body.appendChild(textarea)

      // 选中文本域中的内容并复制到粘贴板
      textarea.select()
      document.execCommand('copy')

      // 移除文本域元素
      document.body.removeChild(textarea)

      message.success('数据已复制到粘贴板')
    } else {
      const element = document.createElement('a')
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorageString),
      )
      element.setAttribute('download', '计算器数据迁移.txt')

      element.style.display = 'none'
      document.body.appendChild(element)

      element.click()

      document.body.removeChild(element)
      message.success('数据已下载')
    }
  }

  const 导入数据前确认 = () => {
    modal.confirm({
      title: `确定要导入数据吗？导入成功后会刷新当前页面。`,
      content: '导入后将覆盖您原有的数据，且无法恢复。导入前请确认您已复制要导入的内容至粘贴板',
      okText: '我要导入',
      onOk: async () => {
        导入数据()
      },
    })
  }

  const 导入数据 = () => {
    navigator.clipboard.readText().then((clipboardData) => {
      if (!clipboardData) {
        message.error('粘贴板内无可导入数据，请检查或重新复制')
      } else {
        const localStorageData = JSON.parse(clipboardData)

        // 将数据写入localStorage
        for (const key in localStorageData) {
          localStorage.setItem(key, localStorageData[key])
        }

        message.success('数据已全部导入')
        window?.location?.reload()
      }
    })
  }

  return (
    <Modal title='数据迁移' {...props} footer={null}>
      <Alert
        style={{ marginBottom: 24 }}
        message={
          <div>
            <p>
              在当前域名点击
              <span style={{ color: 'red' }}>「下载当前数据」</span>
              按钮，下载迁移文件。用记事本打开后，复制数据至剪切板
            </p>
            <p>
              在你要迁移数据的域名点击
              <span style={{ color: 'red' }}>「导入数据」</span>
              按钮，完成导入
            </p>
          </div>
        }
      />
      <div className='copy-data-wrap'>
        {/* <Button block style={{ marginBottom: 24 }} onClick={() => 复制当前数据('复制')}>
          复制当前数据
        </Button> */}
        <Button block onClick={() => 复制当前数据('下载')}>
          下载当前数据
        </Button>
        <Button block type='primary' onClick={导入数据前确认}>
          导入粘贴板数据
        </Button>
      </div>
    </Modal>
  )
}

export default 数据迁移
