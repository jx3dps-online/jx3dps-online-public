import { 通知引导保存 } from '@/功能模块/新手引导/界面状态'
import { CloseOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { App, Button, Dropdown, Form, Input, message, Modal, ModalProps, Typography } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { 装备信息数据类型, 装备位置部位枚举, 装备选择范围类型, 大附魔部位枚举 } from '@/@types/装备'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 秒伤计算, 触发秒伤计算 } from '@/计算模块/计算函数'
import type { 计算循环覆盖类型 } from '@/计算模块/计算函数'
import { 更新角色数据, 应用角色状态, 获取角色状态, 加载角色 } from '@/store/data'
import { 更新网页设置 } from '@/store/system'
import { 事件名, 全局事件 } from '@/事件'
import { 获取页面参数 } from '@/工具函数/help'
import { 数据埋点 } from '@/工具函数/tools/log'
import { 保存角色配装 } from '@/角色/状态'
import { 复制角色 } from '@/角色/注册表'
import { use目标池 } from '@/角色/use目标池'
import type { 配装循环, 角色元数据 } from '@/角色/类型'
import { 读取目标JSON, 导出目标JSON } from '@/角色/目标导入导出'
import 登阶循环选择 from '@/功能模块/计算结果/登龙长阶/组件/循环选择/index'
import 角色另存为弹窗 from '@/功能模块/基础设置/公用设置/角色另存为弹窗'

import { 提取配装循环, 登阶循环限制 } from '@/功能模块/计算结果/登龙长阶/领域/循环'
import { 获取文案 } from '@/功能模块/计算结果/登龙长阶/文案'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 加载缓存装备选择范围 } from '@/工具函数/init/缓存函数'

import 根据表单选项获取装备信息 from './工具函数/根据表单选项获取装备信息'
import { 获取品级范围外部位索引 } from './工具函数/获取品级范围外部位'
import { 装备信息转表单值 } from './工具函数/装备表单转换'
import 配装导入 from './功能组件/配装导入'
import 配装组件标题 from './功能组件/配装组件标题'
import 五彩石选择 from './功能组件/五彩石选择'
import 装备选择 from './功能组件/装备选择'
import 面板展示 from './功能组件/面板展示'
import 装备增益展示 from './功能组件/装备增益展示'
import 秒伤结果对比 from './功能组件/秒伤结果对比'
// 方案对比暂时隐藏：角色/方案重构与登龙长阶开发期间不开放入口，模块不再被打包。
// 恢复时打开本行、弹窗状态、工具菜单项与底部组件四处注释。
// import 方案对比 from './功能组件/方案对比'
import 配装导出 from './功能组件/配装导出'
import 配装起内切换循环 from './功能组件/配装起内切换循环'
import 大附魔选择 from './功能组件/大附魔选择'
import 渐变特效文字 from './功能组件/装备选择/装备部位选择/渐变特效文字'

import 头部组件 from './头部组件'
import 心法数据 from '@/数据/静态数据/心法数据.json'
import 手机样式 from './index.module.less'
import 平板样式 from './平板.module.less'
import use移动端 from '@/hooks/use移动端'
import './index.css'

function 配装器(props: ModalProps) {
  const { open, onCancel } = props
  const [平板, 设置平板] = useState(
    () =>
      window.matchMedia('(min-width: 761px) and (max-width: 1024px) and (any-pointer: coarse)')
        .matches,
  )
  const 手机 = use移动端()
  const 移动端 = 手机 || 平板
  const styles = 平板 ? 平板样式 : 手机样式

  useEffect(() => {
    const 查询 = window.matchMedia(
      '(min-width: 761px) and (max-width: 1024px) and (any-pointer: coarse)',
    )
    const 更新 = () => 设置平板(查询.matches)
    查询.addEventListener('change', 更新)
    return () => 查询.removeEventListener('change', 更新)
  }, [])
  const dispatch = useAppDispatch()
  const { 名称: 心法, 计算循环, 装备数据, 缓存映射 } = use心法数据()
  const { modal } = App.useApp()
  const 页面数据 = useAppSelector((state) => state.data)
  const 当前角色 = 页面数据.当前角色
  const 入口 = useAppSelector((state) => state.system.配装器入口)
  const 配装器草稿 = useAppSelector((state) => state.system.配装器草稿)
  const { 池, 存储: 目标池存储 } = use目标池(当前角色?.心法)
  const [目标] = useState(() =>
    入口?.类型 === '目标' && 入口.角色id === 当前角色?.id
      ? 池.目标.find((项) => 项.id === 入口.目标id)
      : undefined,
  )
  const 目标编辑 = 目标 && 入口?.类型 === '目标' ? { 角色id: 入口.角色id, 目标 } : undefined
  const [编辑循环, 设置编辑循环] = useState<配装循环 | undefined>(
    目标?.循环 || 配装器草稿?.循环 || 提取配装循环(页面数据),
  )
  const [目标保存中, 设置目标保存中] = useState(false)
  const 循环覆盖 = useMemo<计算循环覆盖类型 | undefined>(
    () =>
      目标编辑 && 编辑循环
        ? {
            更新计算循环名称: 编辑循环.名称,
            更新奇穴数据: 编辑循环.奇穴,
            更新秘籍信息: 编辑循环.秘籍,
          }
        : undefined,
    [目标编辑, 编辑循环],
  )

  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 入口装备 = 目标编辑?.目标.装备 ?? 配装器草稿?.装备 ?? 装备信息
  const 角色图标 = 当前角色 ? (心法数据 as any)[当前角色.心法]?.系统配置?.心法图标 : undefined
  const 角色卡片 = 当前角色 ? (
    <div className='zhuangbei-role-card' title={当前角色.区服 || undefined}>
      {角色图标 ? <img className='zhuangbei-role-avatar' src={角色图标} alt='' /> : null}
      <span className='zhuangbei-role-name'>{当前角色.名称}</span>
      {当前角色.区服 ? <span className='zhuangbei-role-server'>{当前角色.区服}</span> : null}
    </div>
  ) : null
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const 行为偏好 = useAppSelector((state) => state?.system?.网页设置?.行为偏好)

  const [初始化, 设置初始化] = useState<boolean>(false)
  const [当前装备信息, 更新当前装备信息] = useState<装备信息数据类型>()
  const [配装器内动态新秒伤, 设置配装器内动态新秒伤] = useState<number | undefined>(undefined)
  const [打开配装器时秒伤, 设置打开配装器时秒伤] = useState<number>(0)
  const [导入弹窗, 设置导入弹窗] = useState(false)
  const [导出弹窗, 设置导出弹窗] = useState(false)
  const [目标JSON操作, 设置目标JSON操作] = useState<'导入' | '导出'>()
  const [目标JSON文本, 设置目标JSON文本] = useState('')
  const [另存为弹窗, 设置另存为弹窗] = useState(false)
  // 方案对比暂时隐藏（见文件顶部说明）
  // const [方案对比弹窗展示, 设置方案对比弹窗展示] = useState(false)
  const [开启装备智能对比, 设置开启装备智能对比] = useState<boolean>(
    行为偏好?.智能对比默认开启 ?? false,
  )
  const 切换装备智能对比 = (开启: boolean) => {
    设置开启装备智能对比(开启)
    dispatch(更新网页设置({ 行为偏好: { 智能对比默认开启: 开启 } }))
  }
  const [默认镶嵌宝石等级, 设置默认镶嵌宝石等级] = useState<number>(8)
  const [装备选择范围, 内部设置装备选择范围] = useState<装备选择范围类型>(() =>
    加载缓存装备选择范围(),
  )
  // 装备选择范围持久化到本地缓存，刷新页面后保留
  const 设置装备选择范围 = (范围: 装备选择范围类型) => {
    内部设置装备选择范围(范围)
    localStorage?.setItem(缓存映射?.装备选择范围, JSON.stringify(范围 || {}))
  }
  const [对比显示百分比, 设置对比显示百分比] = useState<boolean>(
    行为偏好?.对比默认显示百分比 ?? false,
  )
  const [对比加速, 设置对比加速] = useState<boolean>(行为偏好?.跨加速对比默认 ?? true)
  const [候选按收益排序, 设置候选按收益排序] = useState<boolean>(true)
  const 装备部位组件调用索引 = useRef<Array<React.RefObject<any>>>([])
  const 上一次品级范围签名 = useRef<string>('')

  useEffect(() => {
    装备部位组件调用索引.current = Object.keys(装备位置部位枚举).map(
      (_, i) => 装备部位组件调用索引.current[i] ?? React.createRef(),
    )
  }, [装备位置部位枚举])

  useEffect(() => {
    if (!open) {
      设置初始化(false)
      设置导入弹窗(false)
      设置目标JSON操作(undefined)
      设置另存为弹窗(false)
    }
  }, [open])

  useEffect(() => {
    if (open && !初始化) {
      设置初始化(true)
      全局事件.emit(事件名.打开配装器, undefined)
      更新当前装备信息(入口装备)
      设置配装器内动态新秒伤(undefined)
      设置默认镶嵌宝石等级(8)
      设置开启装备智能对比(行为偏好?.智能对比默认开启 ?? false)
      设置对比显示百分比(行为偏好?.对比默认显示百分比 ?? false)
      设置对比加速(行为偏好?.跨加速对比默认 ?? true)
      初始化表单(入口装备)
      if (目标编辑) {
        // 计划有变：以打开时的目标（同一表单值、同一目标循环）为对比基准，
        // 这样「替换前/替换后」只反映本次对目标的修改。
        设置打开配装器时秒伤(0)
        window.setTimeout(() => {
          form
            .validateFields()
            .then((value) => {
              const 装备信息 = 根据表单选项获取装备信息(value)
              const { 秒伤 } = dispatch(秒伤计算({ 更新装备信息: 装备信息, ...循环覆盖 }))
              设置打开配装器时秒伤(秒伤 || 0)
            })
            .catch(() => {})
        }, 0)
      } else {
        设置打开配装器时秒伤(当前计算结果?.秒伤 || 0)
      }
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
  }, [当前计算循环名称, 编辑循环])

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
    form.setFieldsValue(装备信息转表单值(装备信息))
  }

  const 更换装备计算秒伤 = (_, value) => {
    try {
      const 装备信息 = 根据表单选项获取装备信息(value)
      const { 秒伤 } = dispatch(秒伤计算({ 更新装备信息: 装备信息, ...循环覆盖 }))
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
        const { 秒伤 } = dispatch(秒伤计算({ 更新装备信息: 装备信息, ...循环覆盖 }))
        设置配装器内动态新秒伤(秒伤)
      })
    }, 100)
  }

  const 检查导入品级范围 = (表单值: Record<string, any>) => {
    if (获取品级范围外部位索引(表单值, 装备选择范围.品级范围, 装备数据).length) {
      设置装备选择范围({ ...装备选择范围, 品级范围: [] })
      message.info('导入装备超出当前品级范围，已自动取消品级筛选。')
    }
  }

  // 导入配装数据
  const 保存数据并计算 = (e) => {
    form.setFieldsValue({ ...e })
    更换装备计算秒伤(undefined, e)
  }

  const onOk = () => {
    数据埋点('保存角色')
    if (!增益启用) {
      全局事件.emit(事件名.没开增益就计算, undefined)
    }
    form
      .validateFields()
      .then((value) => {
        const 装备信息 = 根据表单选项获取装备信息(value)
        const 角色 = 页面数据.当前角色
        const 状态 = 获取角色状态(页面数据)
        if (!角色 || !状态) {
          message.error('角色数据尚未就绪，请刷新后重试。')
          return
        }
        const 结果 = 保存角色配装(角色, { ...状态, 装备信息 })
        dispatch(应用角色状态(结果.状态))
        通知引导保存('角色保存', 角色.id)
        if (结果.警告) message.warning(结果.警告)
        dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
        onCancel?.({} as any)
      })
      .catch((错误) => {
        if (错误?.errorFields) return
        message.error(错误 instanceof Error ? 错误.message : '请检查装备后再保存。')
      })
  }

  const 保存编辑目标 = async () => {
    if (!目标编辑 || 目标保存中) return
    if (!目标池存储) {
      message.error('目标池尚未就绪，请刷新后重试。')
      return
    }
    设置目标保存中(true)
    try {
      const 装备 = 根据表单选项获取装备信息(await form.validateFields())
      const 原因 = 登阶循环限制(
        装备,
        [...计算循环, ...页面数据.自定义循环列表].find((项) => 项.名称 === 编辑循环?.名称),
        获取文案(心法),
      )
      if (原因) throw new Error(原因)
      目标池存储.更新目标(目标编辑.目标.id, 装备, 编辑循环, 目标编辑.目标)
      通知引导保存('目标保存', 目标编辑.目标.id)
      message.success('目标已更新，按新的计划继续登阶。')
      onCancel?.({} as any)
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '请检查装备后再保存。')
    } finally {
      设置目标保存中(false)
    }
  }

  const 导入目标配装 = () => {
    try {
      const 导入 = 读取目标JSON(目标JSON文本, 心法)
      检查导入品级范围(装备信息转表单值(导入.装备))
      初始化表单(导入.装备)
      更新当前装备信息(导入.装备)
      if (导入.循环) 设置编辑循环(导入.循环)
      else 更换循环计算新秒伤()
      设置目标JSON操作(undefined)
      message.success('目标配装已导入，点击保存或更新目标后生效。')
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '导入失败，请检查 JSON 字符串。')
    }
  }

  const 导出目标配装 = async () => {
    try {
      const 装备 = 根据表单选项获取装备信息(await form.validateFields())
      设置目标JSON文本(导出目标JSON(心法, { 名称: 目标!.名称, 装备, 循环: 编辑循环 }))
      设置目标JSON操作('导出')
    } catch (错误) {
      message.error(错误 instanceof Error ? 错误.message : '请检查装备后再导出。')
    }
  }

  const 另存为新角色 = async (源: 角色元数据, 名称: string) => {
    const 值 = await form.validateFields()
    const 状态 = 获取角色状态(页面数据)
    if (!状态) throw new Error('角色数据尚未就绪，请刷新后重试。')
    const { 角色, 警告 } = 复制角色(源, 名称, {
      ...状态,
      装备信息: 根据表单选项获取装备信息(值),
    })
    if (警告) message.warning(警告)
    return 角色
  }

  const 获取表单信息 = async () => {
    const values = await form.validateFields()
    return values
  }

  const 返回顶部 = () => {
    document
      .getElementById('equip-modal-content')
      ?.closest<HTMLElement>('.ant-modal-body')
      ?.scrollTo({ top: 0, behavior: 'smooth' })
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

  // 品级范围变更后，把范围外的当前装备替换为范围内最优，避免后续寻优被范围外装备锚定
  const 替换范围外装备 = async (部位索引列表: string[]) => {
    const 全部部位索引 = Object.keys(装备位置部位枚举)
    let 成功数 = 0
    for (const 部位索引 of 部位索引列表) {
      const 排序索引 = 全部部位索引.indexOf(部位索引)
      const ref = 装备部位组件调用索引.current?.[排序索引]
      const 替换结果 = await ref?.current?.选择最佳装备()
      // 等待状态更新完成
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (替换结果) {
        成功数++
      }
    }
    const 失败数 = 部位索引列表.length - 成功数
    if (成功数 && 失败数) {
      message.warning(`已替换 ${成功数} 个部位，${失败数} 个部位未找到可替换的范围内装备`)
    } else if (成功数) {
      message.success(`已替换 ${成功数} 个部位的装备`)
    } else {
      message.warning('未找到可替换的范围内装备')
    }
  }

  useEffect(() => {
    const 品级范围签名 = JSON.stringify(装备选择范围?.品级范围 || [])
    if (上一次品级范围签名.current === 品级范围签名) {
      return
    }
    const 是否首次 = 上一次品级范围签名.current === ''
    上一次品级范围签名.current = 品级范围签名
    if (是否首次) {
      return
    }
    const 范围外部位索引 = 获取品级范围外部位索引(
      form.getFieldsValue(),
      装备选择范围?.品级范围,
      装备数据,
    )
    if (!范围外部位索引.length) {
      return
    }
    const 部位名称 = 范围外部位索引.map((部位索引) => 装备位置部位枚举[部位索引]).join('、')
    modal.confirm({
      title: '替换范围外装备',
      content: `当前有 ${范围外部位索引.length} 个部位的装备不在新的品级范围内：${部位名称}。是否替换为范围内最优装备？替换后秒伤可能下降。`,
      okText: '替换',
      cancelText: '暂不替换',
      onOk: () => 替换范围外装备(范围外部位索引),
    })
  }, [装备选择范围])

  const 渲染大附魔 = (部位: string) => (
    <Form.Item key={部位} name={`大附魔_伤${部位}`}>
      <大附魔选择
        开启装备智能对比={开启装备智能对比}
        对比显示百分比={对比显示百分比}
        候选按收益排序={候选按收益排序}
        循环覆盖={循环覆盖}
        form={form}
        type={部位}
      />
    </Form.Item>
  )
  const 五彩石表单 = (
    <Form.Item name='五彩石'>
      <五彩石选择 标题={移动端 ? '五彩石' : undefined} />
    </Form.Item>
  )

  const 秒伤对比 = (
    <秒伤结果对比 配装器内动态新秒伤={配装器内动态新秒伤} 打开配装器时秒伤={打开配装器时秒伤} />
  )
  const 装备操作 = (
    <配装组件标题
      装备选择范围={装备选择范围}
      设置装备选择范围={设置装备选择范围}
      设置默认镶嵌宝石等级={设置默认镶嵌宝石等级}
      保存数据并计算={保存数据并计算}
      form={form}
    />
  )

  return (
    <Modal
      maskClosable={false}
      // keyboard={false}
      closeIcon={<CloseOutlined id='Guide_配装关闭' />}
      title={
        <头部组件
          开启装备智能对比={开启装备智能对比}
          设置开启装备智能对比={切换装备智能对比}
          对比显示百分比={对比显示百分比}
          设置对比显示百分比={设置对比显示百分比}
          更换装备计算秒伤={更换装备计算秒伤}
          对比秒伤={配装器内动态新秒伤 ?? 打开配装器时秒伤}
          对比装备信息={当前装备信息 ?? 入口装备}
          form={form}
          遍历寻优={遍历寻优}
          对比加速={对比加速}
          设置对比加速={设置对比加速}
          候选按收益排序={候选按收益排序}
          设置候选按收益排序={设置候选按收益排序}
          装备选择范围={装备选择范围}
          默认镶嵌宝石等级={默认镶嵌宝石等级}
          循环覆盖={循环覆盖}
          允许规划增益={!目标编辑}
          移动装备操作={移动端 ? 装备操作 : null}
        />
      }
      className={`zhuangbei-input-set-modal ${styles.弹窗}`}
      wrapClassName={styles.弹窗滚动容器}
      open={open}
      width={移动端 ? 'calc(100% - 16px)' : 1258}
      // destroyOnClose
      footer={
        <>
          {移动端 && <div className={styles.固定秒伤}>{秒伤对比}</div>}
          <div className={styles.footer} translate='no'>
            <div className='zhuangbei-footer-cycle'>
              {目标编辑 ? (
                <div className='zhuangbei-target-info'>
                  <登阶循环选择 装备={当前装备信息} value={编辑循环} onChange={设置编辑循环} />
                </div>
              ) : (
                <配装起内切换循环 />
              )}
              {移动端 ? (
                <Button danger type='dashed' onClick={返回顶部}>
                  返回顶部
                </Button>
              ) : null}
            </div>
            <div className='zhuangbei-footer-actions'>
              {!目标编辑 ? 角色卡片 : null}
              {目标编辑 ? (
                <div className='zhuangbei-target-operation'>
                  <div className='zhuangbei-target-card'>
                    <span className='zhuangbei-target-card-title'>
                      <b>正在调整目标</b>：
                    </span>
                    {目标编辑.目标.名称}
                  </div>
                  <Button
                    onClick={() => {
                      设置目标JSON文本('')
                      设置目标JSON操作('导入')
                    }}
                  >
                    导入目标配装
                  </Button>
                  <Button onClick={导出目标配装}>导出目标配装</Button>
                  <Button
                    id='Guide_保存目标'
                    type='primary'
                    danger
                    loading={目标保存中}
                    onClick={保存编辑目标}
                  >
                    {入口?.类型 === '目标' && 入口.新建 ? '保存目标' : '更新目标'}
                  </Button>
                </div>
              ) : (
                <>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        {
                          key: '配装截图',
                          label: '配装截图',
                          onClick: 一键截图,
                        },
                        {
                          key: '另存为新角色',
                          label: '另存为新角色',
                          onClick: () => {
                            数据埋点('另存为新角色')
                            设置另存为弹窗(true)
                          },
                        },
                        // 方案对比暂时隐藏（见文件顶部说明）
                        // {
                        //   key: '方案对比',
                        //   label: '方案对比',
                        //   onClick: () => {
                        //     数据埋点('打开方案对比弹窗')
                        //     设置方案对比弹窗展示(true)
                        //   },
                        // },
                        {
                          key: '配装导出',
                          label: '配装导出',
                          danger: true,
                          onClick: () => {
                            数据埋点('打开配装导出弹窗')
                            设置导出弹窗(true)
                          },
                        },
                        {
                          key: '配装导入',
                          label: '配装导入',
                          onClick: () => {
                            数据埋点('打开配装导入弹窗')
                            设置导入弹窗(true)
                          },
                        },
                      ].filter((项) => !移动端 || 项.key !== '配装导出'),
                    }}
                  >
                    <Button id='Guide_2'>
                      工具 <DownOutlined />
                    </Button>
                  </Dropdown>
                  <Button
                    id='Guide_7'
                    style={{ marginLeft: 12 }}
                    type='primary'
                    onClick={() => onOk()}
                  >
                    保存角色
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      }
      centered={!移动端}
      onCancel={(e) => onCancel?.(e)}
    >
      <div id='equip-modal-content' translate='no'>
        {!移动端 && 装备操作}
        <Form
          colon={false}
          onValuesChange={更换装备计算秒伤}
          className='zhuangbei-input-set-modal-form'
          form={form}
        >
          {移动端 && <div className={styles.五彩石}>{五彩石表单}</div>}
          <div className='zhuangbei-input-set-modal-form-left'>
            {Object.keys(装备位置部位枚举).map((部位索引, 排序索引) => {
              const 部位名称 = 装备位置部位枚举[部位索引]
              return (
                <div className={styles.部位卡片} key={部位索引}>
                  <Form.Item label={移动端 ? undefined : 部位名称} name={`${部位索引}`}>
                    <装备选择
                      移动端={移动端}
                      form={form}
                      默认镶嵌宝石等级={默认镶嵌宝石等级}
                      部位={部位名称}
                      部位索引={部位索引}
                      排序索引={排序索引}
                      开启装备智能对比={开启装备智能对比}
                      对比显示百分比={对比显示百分比}
                      对比加速={对比加速}
                      候选按收益排序={候选按收益排序}
                      装备选择范围={装备选择范围}
                      循环覆盖={循环覆盖}
                      大附魔区={
                        移动端 && 大附魔部位枚举[部位名称]
                          ? 渲染大附魔(大附魔部位枚举[部位名称].slice(-1))
                          : null
                      }
                      {...(目标编辑 ? { 对比装备信息: 目标编辑.目标.装备 } : {})}
                      ref={装备部位组件调用索引?.current?.[排序索引]}
                    />
                  </Form.Item>
                </div>
              )
            })}
          </div>
          {!移动端 && (
            <div className='zhuangbei-set-dafumo-wrapper'>
              {['帽', '衣', '腰', '腕', '鞋'].map((部位) => 渲染大附魔(部位))}
            </div>
          )}
          <div className='zhuangbei-input-set-modal-form-right'>
            {!移动端 && 五彩石表单}
            <details className={styles.结果面板} open={!移动端}>
              <summary>面板与装备增益</summary>
              <面板展示
                当前装备信息={当前装备信息 ?? 入口装备}
                对比装备信息={目标编辑 ? 入口装备 : undefined}
                循环覆盖={循环覆盖}
              />
              <装备增益展示 装备增益={当前装备信息?.装备增益 ?? 入口装备?.装备增益} />
            </details>
            {!移动端 && 秒伤对比}
          </div>
        </Form>
      </div>

      <Modal
        open={!!目标JSON操作}
        title={目标JSON操作 === '导入' ? '导入目标配装' : '导出目标配装'}
        onCancel={() => 设置目标JSON操作(undefined)}
        onOk={导入目标配装}
        okText='导入'
        cancelText='取消'
        footer={目标JSON操作 === '导出' ? null : undefined}
      >
        {目标JSON操作 === '导出' && (
          <Typography.Paragraph copyable={{ text: 目标JSON文本 }}>
            复制 JSON 字符串
          </Typography.Paragraph>
        )}
        <Input.TextArea
          aria-label='目标配装 JSON 字符串'
          placeholder='请粘贴目标配装 JSON 字符串'
          rows={12}
          value={目标JSON文本}
          readOnly={目标JSON操作 === '导出'}
          onChange={(事件) => 设置目标JSON文本(事件.target.value)}
        />
      </Modal>

      <配装导入
        visible={导入弹窗}
        onClose={() => 设置导入弹窗(false)}
        onOk={(表单值) => {
          检查导入品级范围(表单值)
          保存数据并计算(表单值)
        }}
      />

      <配装导出
        visible={导出弹窗}
        onClose={() => 设置导出弹窗(false)}
        当前装备信息={当前装备信息}
        更换装备后秒伤={配装器内动态新秒伤 ?? 打开配装器时秒伤}
        获取表单信息={获取表单信息}
      />

      <角色另存为弹窗
        源角色={当前角色}
        open={另存为弹窗}
        onCancel={() => 设置另存为弹窗(false)}
        另存为={另存为新角色}
        onSuccess={(新角色) => {
          设置另存为弹窗(false)
          dispatch(加载角色(新角色))
          dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
        }}
      />

      {/* 方案对比暂时隐藏：角色/方案重构与登龙长阶开发期间不开放
      <方案对比
        open={方案对比弹窗展示}
        onCancel={() => 设置方案对比弹窗展示(false)}
        form={form}
        当前装备信息={当前装备信息 ?? 入口装备}
        更换装备计算秒伤={更换装备计算秒伤}
      />
      */}

      {/* 预渲染，避免select特效显示异常 */}
      <div style={{ overflow: 'hidden', width: 0, height: 0 }}>
        <渐变特效文字 text={'预渲染'} />
      </div>
    </Modal>
  )
}

export default React.memo(配装器)
