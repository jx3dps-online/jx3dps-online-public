import React, { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Button, Form, message, Modal, ModalProps } from 'antd'
import { 装备信息数据类型, 装备位置部位枚举, 装备选择范围类型 } from '@/@types/装备'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 秒伤计算, 触发秒伤计算 } from '@/计算模块/计算函数'
import { 更新方案数据 } from '@/store/data'
import { 获取页面参数 } from '@/工具函数/help'
import { 数据埋点 } from '@/工具函数/tools/log'

import 根据表单选项获取装备信息 from './工具函数/根据表单选项获取装备信息'
import 配装导入 from './功能组件/配装导入'
import 配装组件标题 from './功能组件/配装组件标题'
import 五彩石选择 from './功能组件/五彩石选择'
import 装备选择 from './功能组件/装备选择'
import 面板展示 from './功能组件/面板展示'
import 装备增益展示 from './功能组件/装备增益展示'
import 秒伤结果对比 from './功能组件/秒伤结果对比'
import 配装导出 from './功能组件/配装导出'
import 配装起内切换循环 from './功能组件/配装起内切换循环'
import 大附魔选择 from './功能组件/大附魔选择'
import 渐变特效文字 from './功能组件/装备选择/装备部位选择/渐变特效文字'
import { 普通至英雄 } from './功能组件/配装组件标题/装备选择范围设置'

import 头部组件 from './头部组件'
import styles from './index.module.less'
import './index.css'

function 配装器(props: ModalProps) {
  const { open, onCancel } = props
  const dispatch = useAppDispatch()

  const 新手引导流程状态 = useAppSelector((state) => state.system.新手引导流程状态)
  const 当前引导步骤 = useAppSelector((state) => state.system.当前引导步骤)
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)

  const [初始化, 设置初始化] = useState<boolean>(false)
  const [当前装备信息, 更新当前装备信息] = useState<装备信息数据类型>()
  const [配装器内动态新秒伤, 设置配装器内动态新秒伤] = useState<number | undefined>(undefined)
  const [打开配装器时秒伤, 设置打开配装器时秒伤] = useState<number>(0)
  const [导入弹窗, 设置导入弹窗] = useState(false)
  const [导出弹窗, 设置导出弹窗] = useState(false)
  const [开启装备智能对比, 设置开启装备智能对比] = useState<boolean>(false)
  const [默认镶嵌宝石等级, 设置默认镶嵌宝石等级] = useState<number>(8)
  const [装备选择范围, 设置装备选择范围] = useState<装备选择范围类型>({
    品级范围: 普通至英雄,
  })
  const [对比显示百分比, 设置对比显示百分比] = useState<boolean>(false)
  const [对比加速, 设置对比加速] = useState<boolean>(true)
  const 装备部位组件调用索引 = useRef<Array<React.RefObject<any>>>([])

  useEffect(() => {
    装备部位组件调用索引.current = Object.keys(装备位置部位枚举).map(
      (_, i) => 装备部位组件调用索引.current[i] ?? React.createRef(),
    )
  }, [装备位置部位枚举])

  useEffect(() => {
    if (!open) {
      设置初始化(false)
      设置导入弹窗(false)
    }
  }, [open])

  useEffect(() => {
    if (open && !初始化) {
      设置初始化(true)
      更新当前装备信息(装备信息)
      设置配装器内动态新秒伤(undefined)
      设置默认镶嵌宝石等级(8)
      初始化表单(装备信息)
      设置打开配装器时秒伤(当前计算结果?.秒伤 || 0)
    } else {
      设置导入弹窗(false)
    }
  }, [open, 当前计算结果?.秒伤])

  useEffect(() => {
    if (open) {
      if (当前计算循环名称) {
        更换循环计算新秒伤()
      }
    }
  }, [当前计算循环名称])

  const urlServer = 获取页面参数('server')
  const urlName = 获取页面参数('name')

  useEffect(() => {
    if (urlServer && urlName) {
      设置导入弹窗(true)
    }
  }, [urlServer, urlName])

  const [form] = Form.useForm()

  const 初始化表单 = (装备信息: 装备信息数据类型) => {
    if (!装备信息) {
      return
    }
    const newObj = {
      五彩石: 装备信息.五彩石,
      大附魔_伤帽: 装备信息?.装备增益?.大附魔_伤帽 || 0,
      大附魔_伤衣: 装备信息?.装备增益?.大附魔_伤衣 || 0,
      大附魔_伤腰: 装备信息?.装备增益?.大附魔_伤腰 || 0,
      大附魔_伤腕: 装备信息?.装备增益?.大附魔_伤腕 || 0,
      大附魔_伤鞋: 装备信息?.装备增益?.大附魔_伤鞋 || 0,
    }
    Object.keys(装备位置部位枚举).map((item, index) => {
      const o = 装备信息.装备列表?.find(
        (a, i) => a.装备部位 === 装备位置部位枚举[item] && index === i,
      )
      if (o) {
        newObj[`${item}`] = o
      }
    })

    form.setFieldsValue(newObj)
  }

  const 更换装备计算秒伤 = (_, value) => {
    try {
      const 装备信息 = 根据表单选项获取装备信息(value)
      const { 秒伤 } = dispatch(秒伤计算({ 更新装备信息: 装备信息 }))
      设置配装器内动态新秒伤(秒伤)
      更新当前装备信息(装备信息)
    } catch (_) {
      更新当前装备信息(undefined)
      设置配装器内动态新秒伤(0)
    }
  }

  const 更换循环计算新秒伤 = () => {
    setTimeout(() => {
      form.validateFields().then((value) => {
        const 装备信息 = 根据表单选项获取装备信息(value)
        const { 秒伤 } = dispatch(秒伤计算({ 更新装备信息: 装备信息 }))
        设置配装器内动态新秒伤(秒伤)
      })
    }, 100)
  }

  // 导入配装数据
  const 保存数据并计算 = (e) => {
    form.setFieldsValue({ ...e })
    更换装备计算秒伤(undefined, e)
  }

  const onOk = () => {
    数据埋点('保存配装计算')
    form.validateFields().then((value) => {
      const 装备信息 = 根据表单选项获取装备信息(value)
      dispatch(更新方案数据({ 数据: 装备信息, 属性: '装备信息' }))
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
      onCancel?.({} as any)
    })
  }

  const 获取表单信息 = async () => {
    const values = await form.validateFields()
    return values
  }

  const 一键截图 = () => {
    const element: any = document.getElementById('equip-modal-content') // 获取要截图的元素
    html2canvas(element, { useCORS: true }).then((canvas) => {
      // 创建一个新的Canvas，并设置宽高
      const borderWidth = 20 // 设置白边的宽度
      const newCanvas = document.createElement('canvas')
      newCanvas.width = canvas.width + borderWidth * 2 // 加上左右的边框
      newCanvas.height = canvas.height + borderWidth * 2 // 加上上下的边框

      const ctx: any = newCanvas.getContext('2d')

      // 绘制白色背景
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)

      ctx.drawImage(canvas, borderWidth, borderWidth) // 在新的canvas中绘制原始canvas

      newCanvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob })
          navigator.clipboard
            .write([item])
            .then(() => {
              message.success('截图已复制到剪贴板！')
            })
            .catch((err) => {
              console.error('复制到剪贴板失败:', err)
            })
        }
      })
    })
  }

  // 遍历寻优函数，依次调用子组件的获取最佳函数
  const 遍历寻优 = async (当前选择计算部位) => {
    const 最大遍历次数 = 5
    const 开始计算时间 = new Date().valueOf()
    for (let i = 0; i < 最大遍历次数; i++) {
      let 该次遍历替换次数 = 0
      for (let j = 0; j < 装备部位组件调用索引.current.length; j++) {
        const ref = 装备部位组件调用索引.current?.[j]
        if (!ref?.current) continue
        const 当前计算部位索引 = `_${j + 1}`
        if (!当前选择计算部位?.includes(当前计算部位索引)) {
          continue
        }
        // 等待当前组件处理完成
        const 替换结果 = await ref?.current?.选择最佳装备()
        // 等待状态更新完成
        await new Promise((resolve) => setTimeout(resolve, 0))
        if (替换结果) {
          该次遍历替换次数++
        }
      }
      if (该次遍历替换次数 === 0) {
        if (i === 0) {
          message.warning(`当前已经为局部最优，未找到可替换的装备`)
        } else {
          const 结束计算时间 = new Date().valueOf()
          const 计算用时 = 结束计算时间 - 开始计算时间
          message.success(`替换完成，用时${计算用时}ms`)
        }
        break
      }
    }
  }

  return (
    <Modal
      maskClosable={false}
      // keyboard={false}
      closable={![1, 2, 3, 4, 5]?.includes(当前引导步骤) || !新手引导流程状态}
      title={
        <头部组件
          开启装备智能对比={开启装备智能对比}
          设置开启装备智能对比={设置开启装备智能对比}
          对比显示百分比={对比显示百分比}
          设置对比显示百分比={设置对比显示百分比}
          更换装备计算秒伤={更换装备计算秒伤}
          对比秒伤={配装器内动态新秒伤 || 打开配装器时秒伤}
          对比装备信息={当前装备信息 || 装备信息}
          form={form}
          遍历寻优={遍历寻优}
          对比加速={对比加速}
          设置对比加速={设置对比加速}
        />
      }
      className={'zhuangbei-input-set-modal'}
      open={open}
      width={1258}
      // destroyOnClose
      footer={
        <div className={styles.footer} translate='no'>
          <配装起内切换循环 />
          <div>
            <Button onClick={一键截图}>配装截图</Button>
            <Button
              danger
              style={{ marginLeft: 12 }}
              onClick={() => {
                数据埋点('打开配装导出弹窗')
                设置导出弹窗(true)
              }}
            >
              配装导出
            </Button>
            <Button
              id='Guide_2'
              style={{ marginLeft: 12 }}
              onClick={() => {
                if (新手引导流程状态) {
                  return
                }
                数据埋点('打开配装导入弹窗')
                设置导入弹窗(true)
              }}
            >
              配装导入
            </Button>
            <Button id='Guide_7' style={{ marginLeft: 12 }} type='primary' onClick={() => onOk()}>
              保存并计算
            </Button>
          </div>
        </div>
      }
      centered
      onCancel={(e) => onCancel?.(e)}
    >
      <div id='equip-modal-content' translate='no'>
        <配装组件标题
          装备选择范围={装备选择范围}
          设置装备选择范围={设置装备选择范围}
          设置默认镶嵌宝石等级={设置默认镶嵌宝石等级}
          保存数据并计算={保存数据并计算}
          form={form}
        />
        <Form
          colon={false}
          onValuesChange={更换装备计算秒伤}
          className='zhuangbei-input-set-modal-form'
          form={form}
        >
          <div className='zhuangbei-input-set-modal-form-left'>
            {Object.keys(装备位置部位枚举).map((部位索引, 排序索引) => {
              const 部位名称 = 装备位置部位枚举[部位索引]
              return (
                <Form.Item label={部位名称} name={`${部位索引}`} key={`${部位索引}`}>
                  <装备选择
                    form={form}
                    默认镶嵌宝石等级={默认镶嵌宝石等级}
                    部位={部位名称}
                    部位索引={部位索引}
                    排序索引={排序索引}
                    开启装备智能对比={开启装备智能对比}
                    对比显示百分比={对比显示百分比}
                    对比加速={对比加速}
                    装备选择范围={装备选择范围}
                    ref={装备部位组件调用索引?.current?.[排序索引]}
                  />
                </Form.Item>
              )
            })}
          </div>
          <div className='zhuangbei-set-dafumo-wrapper'>
            <Form.Item name={`大附魔_伤帽`}>
              <大附魔选择 开启装备智能对比={开启装备智能对比} form={form} type='帽' />
            </Form.Item>
            <Form.Item name={`大附魔_伤衣`}>
              <大附魔选择 开启装备智能对比={开启装备智能对比} form={form} type='衣' />
            </Form.Item>
            <Form.Item name={`大附魔_伤腰`}>
              <大附魔选择 开启装备智能对比={开启装备智能对比} form={form} type='腰' />
            </Form.Item>
            <Form.Item name={`大附魔_伤腕`}>
              <大附魔选择 开启装备智能对比={开启装备智能对比} form={form} type='腕' />
            </Form.Item>
            <Form.Item name={`大附魔_伤鞋`}>
              <大附魔选择 开启装备智能对比={开启装备智能对比} form={form} type='鞋' />
            </Form.Item>
          </div>
          <div className='zhuangbei-input-set-modal-form-right'>
            <Form.Item name={`五彩石`}>
              <五彩石选择 />
            </Form.Item>
            <面板展示 当前装备信息={当前装备信息 || 装备信息} />
            <装备增益展示 装备增益={当前装备信息?.装备增益 || 装备信息?.装备增益} />
            <秒伤结果对比
              配装器内动态新秒伤={配装器内动态新秒伤}
              打开配装器时秒伤={打开配装器时秒伤}
            />
          </div>
        </Form>
      </div>

      <配装导入
        visible={导入弹窗}
        onClose={() => 设置导入弹窗(false)}
        onOk={(e) => 保存数据并计算(e)}
      />

      <配装导出
        visible={导出弹窗}
        onClose={() => 设置导出弹窗(false)}
        当前装备信息={当前装备信息}
        配装器内动态新秒伤={配装器内动态新秒伤}
        获取表单信息={获取表单信息}
      />

      {/* 预渲染，避免select特效显示异常 */}
      <div style={{ overflow: 'hidden', width: 0, height: 0 }}>
        <渐变特效文字 text={'预渲染'} />
      </div>
    </Modal>
  )
}

export default React.memo(配装器)
