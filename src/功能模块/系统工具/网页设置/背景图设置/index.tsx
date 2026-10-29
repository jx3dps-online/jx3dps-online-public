import React, { useEffect, useState } from 'react'
import { App, Button, Input, Modal, Select, Spin, Switch, Upload } from 'antd'
import { CheckOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新背景图片显示状态, 更新背景图选择, 更新自定义背景图 } from '@/store/system'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import {
  生成本地背景图id,
  是否为本地背景图,
  删除本地背景图,
  存储本地背景图,
  使用背景图地址,
} from '@/工具函数/本地背景图'
import 设置项 from '../设置项'
import {
  获取全部心法列表,
  读取心法背景图选择,
  保存心法背景图选择,
  读取心法自定义背景图,
  保存心法自定义背景图,
  加载心法内置背景图,
} from './工具函数'
import { 背景图选择一致, 校准背景图选择 } from './校准背景图选择'
import styles from './index.module.less'

function 背景图缩略图(props) {
  const { url } = props
  const 地址 = 使用背景图地址(url)
  return <img className={styles.背景图缩略图} src={地址} alt='' />
}

function 背景图设置(props) {
  const { open } = props
  const dispatch = useAppDispatch()
  const { modal, message } = App.useApp()
  const 背景图片显示状态 = useAppSelector((state) => state?.system?.背景图片显示状态)
  const redux背景图选择 = useAppSelector((state) => state?.system?.背景图选择)
  const redux自定义背景图 = useAppSelector((state) => state?.system?.自定义背景图)

  const { 名称: 当前使用心法, 系统配置 = {} as any } = 获取当前数据()
  const 当前内置背景图 = 系统配置?.背景图 || []

  const 全部心法列表 = 获取全部心法列表()

  const [当前配置心法, 设置当前配置心法] = useState<string>(当前使用心法)
  const [内置背景图, 设置内置背景图] = useState<string[]>(当前内置背景图)
  const [自定义背景图, 设置自定义背景图] = useState<string[]>(redux自定义背景图 || [])
  const [背景图选择, 设置背景图选择] = useState<string[]>(
    校准背景图选择(redux背景图选择 || [], [...当前内置背景图, ...(redux自定义背景图 || [])]),
  )
  const [加载中, 设置加载中] = useState<boolean>(false)
  const [添加弹窗, 设置添加弹窗] = useState<boolean>(false)
  const [自定义图地址, 设置自定义图地址] = useState<string>('')

  const 全部背景图 = [...内置背景图, ...自定义背景图]

  useEffect(() => {
    if (open) {
      设置当前配置心法(当前使用心法)
      设置内置背景图(当前内置背景图)
      设置自定义背景图(redux自定义背景图 || [])
      const 校准后选择 = 校准背景图选择(redux背景图选择 || [], [
        ...当前内置背景图,
        ...(redux自定义背景图 || []),
      ])
      设置背景图选择(校准后选择)
      if (!背景图选择一致(校准后选择, redux背景图选择 || [])) {
        dispatch(更新背景图选择(校准后选择))
      }
    }
  }, [open])

  const 是否当前心法 = 当前配置心法 === 当前使用心法

  const 持久化选择 = (列表: string[]) => {
    设置背景图选择(列表)
    if (是否当前心法) {
      dispatch(更新背景图选择(列表))
    } else {
      保存心法背景图选择(当前配置心法, 列表)
    }
  }

  const 持久化自定义 = (列表: string[]) => {
    设置自定义背景图(列表)
    if (是否当前心法) {
      dispatch(更新自定义背景图(列表))
    } else {
      保存心法自定义背景图(当前配置心法, 列表)
    }
  }

  const 切换心法 = async (心法名称: string) => {
    设置当前配置心法(心法名称)
    设置加载中(true)
    const 内置 = await 加载心法内置背景图(心法名称)
    const 自定义 = 读取心法自定义背景图(心法名称)
    const 选择 = 读取心法背景图选择(心法名称)
    const 校准后选择 = 校准背景图选择(选择, [...内置, ...自定义])
    设置内置背景图(内置)
    设置自定义背景图(自定义)
    设置背景图选择(校准后选择)
    if (!背景图选择一致(校准后选择, 选择)) {
      保存心法背景图选择(心法名称, 校准后选择)
    }
    设置加载中(false)
  }

  const 切换选中 = (url: string) => {
    const 已选中 = 背景图选择?.includes(url)
    if (已选中 && 背景图选择?.length <= 1) {
      modal.info({
        title: '至少保留一张背景图',
        content: '需要保留至少一张背景图参与随机展示，无法全部取消。',
      })
      return
    }
    const 新列表 = 已选中 ? 背景图选择.filter((item) => item !== url) : [...背景图选择, url]
    持久化选择(新列表)
  }

  const 添加自定义图 = (url: string) => {
    const 地址 = url?.trim()
    if (!地址) {
      return
    }
    if (自定义背景图?.includes(地址)) {
      message.warning('该背景图已存在')
      return
    }
    const 新自定义 = [...自定义背景图, 地址]
    持久化自定义(新自定义)
    const 新选择 = 背景图选择?.length ? [...背景图选择, 地址] : 背景图选择
    持久化选择(新选择)
    设置自定义图地址('')
    设置添加弹窗(false)
  }

  const 删除自定义图 = (url: string) => {
    modal.confirm({
      title: '确认删除该背景图？',
      content: '删除后不可恢复。',
      onOk: () => {
        if (是否为本地背景图(url)) {
          删除本地背景图(url.slice('local:'.length))
        }
        const 新自定义 = 自定义背景图.filter((item) => item !== url)
        const 新选择 = 背景图选择.filter((item) => item !== url)
        持久化自定义(新自定义)
        持久化选择(新选择?.length ? 新选择 : 内置背景图)
      },
    })
  }

  const 处理本地图片 = (file) => {
    const id = 生成本地背景图id()
    存储本地背景图(id, file)
      .then(() => {
        添加自定义图(`local:${id}`)
      })
      .catch(() => {
        message.error('本地图片保存失败')
      })
    return false
  }

  return (
    <>
      <设置项 标题='背景图片开关' 说明='开启后页面展示背景图，关闭后使用纯色背景。'>
        <Switch
          checked={背景图片显示状态}
          onChange={(checked) => dispatch(更新背景图片显示状态(checked))}
        />
      </设置项>
      <设置项 标题='配置心法' 说明='选择要设置背景图的心法，各心法的背景图设置相互独立。'>
        <Select
          style={{ width: 180 }}
          value={当前配置心法}
          onChange={切换心法}
          options={全部心法列表.map((item) => ({ value: item, label: item }))}
        />
      </设置项>
      <Spin spinning={加载中}>
        <设置项
          标题='背景图'
          说明='勾选希望参与随机展示的背景图，刷新页面时从中随机一张，至少保留一张；点击加号可添加网络或本地背景图。'
        >
          <div className={styles.背景图列表}>
            {全部背景图.map((url) => {
              const 选中 = 背景图选择?.includes(url)
              const 是否自定义 = 自定义背景图?.includes(url)
              return (
                <div
                  key={url}
                  className={选中 ? styles.背景图项激活 : styles.背景图项}
                  onClick={() => 切换选中(url)}
                >
                  <背景图缩略图 url={url} />
                  {是否自定义 ? <span className={styles.自定义标记}>自定义</span> : null}
                  {选中 ? (
                    <span className={styles.选中标记}>
                      <CheckOutlined />
                    </span>
                  ) : null}
                  {是否自定义 ? (
                    <DeleteOutlined
                      className={styles.删除标记}
                      onClick={(e) => {
                        e?.stopPropagation()
                        删除自定义图(url)
                      }}
                    />
                  ) : null}
                </div>
              )
            })}
            <div className={styles.添加项} onClick={() => 设置添加弹窗(true)}>
              <PlusOutlined />
            </div>
          </div>
        </设置项>
      </Spin>
      <Modal
        open={添加弹窗}
        title='添加背景图'
        footer={null}
        width={480}
        onCancel={() => 设置添加弹窗(false)}
      >
        <div className={styles.添加弹窗内容}>
          <Input
            placeholder='粘贴网络图片地址'
            value={自定义图地址}
            onChange={(e) => 设置自定义图地址(e?.target?.value)}
            onPressEnter={() => 添加自定义图(自定义图地址)}
          />
          <Button type='primary' icon={<PlusOutlined />} onClick={() => 添加自定义图(自定义图地址)}>
            添加
          </Button>
          <Upload accept='image/*' showUploadList={false} beforeUpload={处理本地图片}>
            <Button icon={<UploadOutlined />}>上传本地图片</Button>
          </Upload>
        </div>
      </Modal>
    </>
  )
}

export default 背景图设置
