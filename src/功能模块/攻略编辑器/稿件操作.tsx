import React, { useRef } from 'react'
import { Alert, Button, message, Modal, Space, Tooltip } from 'antd'
import {
  FileTextOutlined,
  UndoOutlined,
  RedoOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { 草稿键 } from './草稿'
import { 下载文件 } from './导出'
import styles from './index.module.less'

export default function 稿件操作({
  新建,
  导入,
  导出,
  保存,
  保存状态,
  错误,
  可撤销,
  可重做,
  撤销重做,
}: {
  新建: () => void
  导入: (文件: File) => Promise<void>
  导出: () => void
  保存: (覆盖?: boolean) => void
  保存状态: string
  错误: string
  可撤销: boolean
  可重做: boolean
  撤销重做: (重做?: boolean) => void
}) {
  const 文件 = useRef<HTMLInputElement>(null)
  return (
    <>
      <header className={styles.顶栏}>
        <div className={styles.品牌}>
          <span className={styles.标志}>
            <FileTextOutlined />
          </span>
          <div>
            <h1>攻略编辑器</h1>
            <span>编写、预览与交付，一处完成</span>
          </div>
        </div>
        <Space wrap className={styles.主操作}>
          <span className={styles.保存状态}>{保存状态}</span>
          <Tooltip title='撤销 Ctrl+Z'>
            <Button icon={<UndoOutlined />} disabled={!可撤销} onClick={() => 撤销重做()} />
          </Tooltip>
          <Tooltip title='重做 Ctrl+Y'>
            <Button icon={<RedoOutlined />} disabled={!可重做} onClick={() => 撤销重做(true)} />
          </Tooltip>
          <Button onClick={() => 新建()}>新建</Button>
          <Button icon={<UploadOutlined />} onClick={() => 文件.current?.click()}>
            导入
          </Button>
          <Button type='primary' icon={<DownloadOutlined />} onClick={() => 导出()}>
            导出稿件
          </Button>
        </Space>
      </header>
      <input
        hidden
        ref={文件}
        type='file'
        accept='.json,application/json'
        onChange={(事件) => {
          const 选中 = 事件.target.files?.[0]
          事件.target.value = ''
          if (选中) void 导入(选中)
        }}
      />
      {错误 && (
        <Alert
          type='warning'
          showIcon
          message={错误}
          action={
            <Space>
              <Button
                size='small'
                onClick={() => {
                  try {
                    下载文件(
                      '原草稿备份.json',
                      localStorage.getItem(草稿键) || '{}',
                      'application/json',
                    )
                  } catch {
                    message.error('无法读取原草稿')
                  }
                }}
              >
                备份原稿
              </Button>
              <Button
                size='small'
                onClick={() =>
                  Modal.confirm({
                    title: '覆盖浏览器中的草稿？',
                    content: '请先备份原稿。确认后将用当前稿件替换。',
                    onOk: () => 保存(true),
                  })
                }
              >
                覆盖保存
              </Button>
            </Space>
          }
        />
      )}
    </>
  )
}
