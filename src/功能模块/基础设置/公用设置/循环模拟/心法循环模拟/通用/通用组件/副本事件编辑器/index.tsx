import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Drawer, InputNumber, message, Modal, Select, Switch, Tooltip } from 'antd'
import {
  DownloadOutlined,
  FileImageOutlined,
  ImportOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新副本事件方案列表 } from '@/store/data'
import CycleSimulatorContext from '@/功能模块/基础设置/公用设置/循环模拟/context'
import {
  副本事件定义类型,
  副本事件实例类型,
  副本事件方案类型,
  副本事件阶段类型,
} from '@/@types/副本事件'
import 事件定义原始 from './事件定义.json'
import {
  副本事件方案版本,
  默认事件颜色,
  默认方案名称,
  帧转分秒帧,
  获取事件定义,
  创建副本事件实例,
  自动填充实例,
  检测重叠实例,
  判断实例是否重叠,
  生成默认填充实例列表,
  生成事件CD映射,
} from './utils'
import 时间轴, { 时间轴行类型, 时间轴Ref类型 } from './时间轴'
import { 导出时间轴图片 } from './导出图片'
import 方案选择器 from './方案选择器'
import 实例编辑面板 from './实例编辑面板'
import 实例详情列表 from './实例详情列表'
import 自动填充弹窗 from './自动填充弹窗'
import 重命名弹窗 from './重命名弹窗'
import 导入弹窗 from './导入弹窗'
import 事件详情弹窗 from './事件详情弹窗'
import { 战斗曲线 } from '../战斗曲线弹窗'
import { 计算副本事件泳道 } from '../战斗曲线弹窗/增益泳道'
import { 曲线数据点 } from '../战斗曲线弹窗/use战斗曲线'
import styles from './index.module.less'

const 事件定义列表 = 事件定义原始 as 副本事件定义类型[]

interface 副本事件编辑器Props {
  open: boolean
  onCancel: () => void
  默认总时间?: number // 当前循环战斗时长（帧）
  战斗曲线数据?: 曲线数据点[]
  on生成战斗曲线?: () => void
}

const 副本事件编辑器: React.FC<副本事件编辑器Props> = (props) => {
  const { open, onCancel, 默认总时间 = 4800, 战斗曲线数据, on生成战斗曲线 } = props
  const dispatch = useAppDispatch()
  const { 当前副本事件方案名称, 更新当前副本事件方案名称, 当前副本事件方案 } =
    useContext(CycleSimulatorContext)
  const 方案列表 = useAppSelector((state) => state?.data?.副本事件方案列表)

  const [选中实例id, 设置选中实例id] = useState<string | undefined>(undefined)
  const [缩放比例, 设置缩放比例] = useState<number>(0.4)
  const [添加事件名称, 设置添加事件名称] = useState<string | undefined>(undefined)
  const [自动填充弹窗展示, 设置自动填充弹窗展示] = useState<boolean>(false)
  const [首次施放时间, 设置首次施放时间] = useState<number>(0)
  const [方案名称编辑弹窗, 设置方案名称编辑弹窗] = useState<{
    open: boolean
    值: string
    原名称?: string
  }>({ open: false, 值: '' })
  const [导入弹窗展示, 设置导入弹窗展示] = useState<boolean>(false)
  const [导入文本, 设置导入文本] = useState<string>('')
  const [同步拖动开关, 设置同步拖动开关] = useState<boolean>(false)
  const [事件详情展开, 设置事件详情展开] = useState<boolean>(true)
  const [抽屉位置, 设置抽屉位置] = useState<'left' | 'right' | 'bottom'>('bottom')

  const 详情区Ref = useRef<HTMLDivElement>(null)
  const 时间轴Ref = useRef<时间轴Ref类型>(null)

  const 当前方案 = 当前副本事件方案

  const 当前方案名称 = 当前副本事件方案名称

  // 内置默认方案只读：不可重命名/删除，也不可修改实例
  const 只读 = 当前方案名称 === 默认方案名称

  // 事件名称 -> CD 映射（用于时间轴间隔提示）
  const 事件CD映射 = useMemo(() => 生成事件CD映射(事件定义列表), [])

  // 打开时重置选中实例
  useEffect(() => {
    if (open) {
      设置选中实例id(undefined)
    }
  }, [open])

  const 更新当前方案字段 = (部分: Partial<副本事件方案类型>) => {
    if (!当前方案 || 只读) {
      return
    }
    const 新方案 = { ...当前方案, ...部分 }
    const 新列表 = (方案列表 || []).map((item) => (item?.方案名称 === 当前方案名称 ? 新方案 : item))
    dispatch(更新副本事件方案列表(新列表))
  }

  const 获取当前实例列表 = () => 当前方案?.事件实例列表 || []

  // 行列表（事件定义顺序 + 实例中额外事件）；仅显示当前有实例数据的事件行
  const 行列表: 时间轴行类型[] = useMemo(() => {
    const 行: 时间轴行类型[] = []
    const 有数据事件名称 = new Set(
      (获取当前实例列表() || []).map((实例) => 实例?.事件名称).filter(Boolean),
    )
    ;(事件定义列表 || []).forEach((定义) => {
      if (!有数据事件名称.has(定义?.事件名称)) {
        return
      }
      行.push({
        事件名称: 定义?.事件名称,
        图标: 定义?.图标,
        颜色: 定义?.颜色 || 默认事件颜色,
        支持拖拽边缘: !!定义?.支持拖拽边缘,
      })
    })
    ;(获取当前实例列表() || []).forEach((实例) => {
      if (!行.some((a) => a.事件名称 === 实例?.事件名称)) {
        行.push({ 事件名称: 实例?.事件名称, 颜色: 默认事件颜色, 支持拖拽边缘: false })
      }
    })
    return 行
  }, [当前方案?.事件实例列表])

  // 重叠实例 id 集合
  const 重叠实例idSet = useMemo(() => {
    const set = new Set<string>()
    const 重叠对 = 检测重叠实例(获取当前实例列表())
    重叠对.forEach((对) => {
      set.add(对.实例A.id)
      set.add(对.实例B.id)
    })
    return set
  }, [当前方案?.事件实例列表])

  const 选中实例 = useMemo(() => {
    return 获取当前实例列表().find((实例) => 实例.id === 选中实例id)
  }, [当前方案?.事件实例列表, 选中实例id])

  // 排序后的实例列表（用于详情）
  const 排序实例列表 = useMemo(() => {
    return [...(当前方案?.事件实例列表 || [])].sort((a, b) => {
      if (a.事件名称 === b.事件名称) {
        return a.释放时间 - b.释放时间
      }
      return a.事件名称.localeCompare(b.事件名称)
    })
  }, [当前方案?.事件实例列表])

  // 真正添加实例
  const 真正添加实例 = (新实例列表: 副本事件实例类型[]) => {
    if (!新实例列表?.length) {
      return
    }
    更新当前方案字段({
      事件实例列表: [...(当前方案?.事件实例列表 || []), ...新实例列表],
    })
    设置选中实例id(新实例列表[0]?.id)
  }

  // 添加（含重叠二次确认）
  const 执行添加 = (新实例列表: 副本事件实例类型[]) => {
    const 现有列表 = 获取当前实例列表()
    const 是否重叠 = (新实例列表 || []).some((实例) => 判断实例是否重叠(现有列表, 实例))
    if (是否重叠) {
      const 首个 = 新实例列表[0]
      Modal.confirm({
        title: '事件重叠提示',
        content: `该事件在 ${帧转分秒帧(首个?.释放时间 || 0).文本} 与已有实例时间重叠，仍要添加吗？`,
        okText: '仍要添加',
        cancelText: '取消',
        onOk: () => 真正添加实例(新实例列表),
      })
    } else {
      真正添加实例(新实例列表)
    }
  }

  // 普通添加
  const 添加单个 = () => {
    const 定义 = 获取事件定义(添加事件名称 || '', 事件定义列表)
    if (!定义) {
      message.warning('请先选择要添加的事件')
      return
    }
    执行添加([创建副本事件实例(定义, 0)])
  }

  // 自动填充
  const 打开自动填充 = () => {
    const 定义 = 获取事件定义(添加事件名称 || '', 事件定义列表)
    if (!定义) {
      message.warning('请先选择要添加的事件')
      return
    }
    设置首次施放时间(0)
    设置自动填充弹窗展示(true)
  }

  const 确认自动填充 = () => {
    const 定义 = 获取事件定义(添加事件名称 || '', 事件定义列表)
    if (!定义) {
      return
    }
    const 实例列表 = 自动填充实例(定义, 首次施放时间, 当前方案?.总时间 || 0)
    执行添加(实例列表)
    设置自动填充弹窗展示(false)
  }

  // 重置为默认填充：把所有「默认参与」的事件从 0 帧起按 CD 填充满，覆盖现有所有实例
  const 重置为默认填充 = () => {
    if (!当前方案) {
      return
    }
    Modal.confirm({
      title: '重置为默认填充',
      content:
        '将清空当前所有事件，并按默认参与的事件（默认 CD）从 0 帧开始自动填充满，确认重置吗？',
      okText: '重置',
      cancelText: '取消',
      onOk: () => {
        const 实例列表 = 生成默认填充实例列表(事件定义列表, 当前方案?.总时间 || 0)
        更新当前方案字段({ 事件实例列表: 实例列表 })
        设置选中实例id(undefined)
        message.success('已重置为默认填充')
      },
    })
  }

  // 时间轴更新/删除
  const onUpdateInstance = (
    id: string,
    更新: { 释放时间?: number; 阶段列表?: 副本事件阶段类型[] },
  ) => {
    const 新实例列表 = 获取当前实例列表().map((实例) =>
      实例.id === id ? { ...实例, ...更新 } : 实例,
    )
    更新当前方案字段({ 事件实例列表: 新实例列表 })
  }

  // 拖动结束一次性提交整个实例列表（拖动过程用本地临时状态，避免频繁触发外部重渲染/重新模拟）
  const onCommitInstanceList = (列表: 副本事件实例类型[]) => {
    更新当前方案字段({ 事件实例列表: 列表 })
  }

  const onDeleteInstance = (id: string) => {
    更新当前方案字段({
      事件实例列表: 获取当前实例列表().filter((实例) => 实例.id !== id),
    })
    if (选中实例id === id) {
      设置选中实例id(undefined)
    }
  }

  // 行右键菜单：添加某个事件的一个实例（默认释放时间 0，可传右击帧）
  const 添加事件实例 = (事件名称: string, 释放时间 = 0) => {
    const 定义 = 获取事件定义(事件名称, 事件定义列表)
    if (!定义) {
      message.warning(`未找到事件【${事件名称}】的定义`)
      return
    }
    执行添加([创建副本事件实例(定义, Math.max(0, Math.round(释放时间)))])
  }

  // 行右键菜单：清空某个事件的所有实例
  const 清空事件 = (事件名称: string) => {
    更新当前方案字段({
      事件实例列表: 获取当前实例列表().filter((实例) => 实例.事件名称 !== 事件名称),
    })
    if (选中实例?.事件名称 === 事件名称) {
      设置选中实例id(undefined)
    }
  }

  // 精确编辑面板：更新阶段持续时间
  const onUpdate阶段持续时间 = (阶段索引: number, 值: number) => {
    if (!选中实例) {
      return
    }
    const 阶段列表 = (选中实例.阶段列表 || []).map((阶段, index) =>
      index === 阶段索引 ? { ...阶段, 持续时间: 值 || 0 } : 阶段,
    )
    onUpdateInstance(选中实例.id, { 阶段列表 })
  }

  const onUpdate释放时间 = (值: number) => {
    if (!选中实例) {
      return
    }
    onUpdateInstance(选中实例.id, { 释放时间: 值 || 0 })
  }

  // 方案管理
  const 新建方案 = (名称: string) => {
    const 名 = 名称?.trim()
    if (!名) {
      message.warning('请输入方案名称')
      return
    }
    if (名 === 默认方案名称) {
      message.warning('常规增益为内置方案名称，请使用其他名称')
      return
    }
    if ((方案列表 || []).some((item) => item?.方案名称 === 名)) {
      message.warning('方案名称已存在')
      return
    }
    const 新方案: 副本事件方案类型 = {
      方案名称: 名,
      总时间: 默认总时间 || 4800,
      事件实例列表: 生成默认填充实例列表(事件定义列表, 默认总时间 || 4800),
      版本: 副本事件方案版本,
      创建时间: Date.now(),
    }
    dispatch(更新副本事件方案列表([...(方案列表 || []), 新方案]))
    更新当前副本事件方案名称(名)
    message.success('已创建方案')
  }

  const 重命名方案 = (名称: string) => {
    设置方案名称编辑弹窗({ open: true, 值: 名称, 原名称: 名称 })
  }

  const 确认方案名称 = () => {
    const 名称 = 方案名称编辑弹窗.值?.trim()
    if (!名称) {
      message.warning('请输入方案名称')
      return
    }
    if (名称 === 默认方案名称) {
      message.warning('常规增益为内置方案名称，请使用其他名称')
      return
    }
    const 原名称 = 方案名称编辑弹窗.原名称 || ''
    if (名称 !== 原名称 && (方案列表 || []).some((item) => item?.方案名称 === 名称)) {
      message.warning('方案名称已存在')
      return
    }
    const 新列表 = (方案列表 || []).map((item) =>
      item?.方案名称 === 原名称 ? { ...item, 方案名称: 名称 } : item,
    )
    dispatch(更新副本事件方案列表(新列表))
    更新当前副本事件方案名称(名称)
    设置方案名称编辑弹窗({ open: false, 值: '' })
  }

  const 删除方案 = (名称: string) => {
    Modal.confirm({
      title: '删除方案',
      content: `确认删除方案【${名称}】吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        const 新列表 = (方案列表 || []).filter((item) => item?.方案名称 !== 名称)
        dispatch(更新副本事件方案列表(新列表))
        if (当前方案名称 === 名称) {
          更新当前副本事件方案名称(默认方案名称)
        }
      },
    })
  }

  // 导出 JSON
  const 导出JSON = () => {
    if (!当前方案) {
      return
    }
    const 文本 = JSON.stringify(当前方案)
    const textarea = document.createElement('textarea')
    textarea.value = 文本
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    const blob = new Blob([文本], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${当前方案.方案名称}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    message.success('已复制到剪贴板并下载 JSON 文件')
  }

  // 导入 JSON
  const 确认导入 = () => {
    try {
      const 数据 = JSON.parse(导入文本)
      if (
        typeof 数据?.方案名称 !== 'string' ||
        !数据.方案名称.trim() ||
        !Array.isArray(数据?.事件实例列表) ||
        typeof 数据?.总时间 !== 'number'
      ) {
        message.error('导入数据格式不正确')
        return
      }
      const 导入方案: 副本事件方案类型 = {
        方案名称: 数据.方案名称.trim(),
        总时间: 数据.总时间,
        事件实例列表: 数据.事件实例列表,
        版本: 数据.版本 || 副本事件方案版本,
        创建时间: 数据.创建时间 || Date.now(),
        备注: 数据.备注,
      }
      let 名称 = 导入方案.方案名称
      let 序号 = 2
      while (名称 === 默认方案名称 || (方案列表 || []).some((item) => item?.方案名称 === 名称)) {
        名称 = `${导入方案.方案名称}(${序号})`
        序号++
      }
      导入方案.方案名称 = 名称
      dispatch(更新副本事件方案列表([...(方案列表 || []), 导入方案]))
      更新当前副本事件方案名称(名称)
      message.success('导入成功')
      设置导入弹窗展示(false)
      设置导入文本('')
    } catch (e) {
      console.error('导入副本事件方案失败', e)
      message.error('JSON 解析失败，请检查内容')
    }
  }

  const 导出图片 = () => {
    if (!当前方案) {
      return
    }
    导出时间轴图片({ 方案: 当前方案, 事件定义列表 })
  }

  const 缩放适配 = () => {
    时间轴Ref.current?.适配()
  }

  const onWheelZoom = (deltaY: number) => {
    设置缩放比例((s) => {
      const 系数 = deltaY > 0 ? 0.9 : 1.1
      return Math.max(0.05, s * 系数)
    })
  }

  const 重叠数量 = 重叠实例idSet.size

  const 定位重叠详情 = () => {
    详情区Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const 首个重叠 = 当前方案?.事件实例列表?.find((实例) => 重叠实例idSet.has(实例.id))
    if (首个重叠) {
      设置选中实例id(首个重叠.id)
    }
  }

  const 获取实例图标 = (事件名称: string) => {
    return 事件定义列表?.find((item) => item?.事件名称 === 事件名称)?.图标
  }

  // 团队增益泳道（随当前方案实例列表实时变化）
  const 团队增益泳道列表 = useMemo(() => {
    if (!当前方案?.事件实例列表?.length) {
      return []
    }
    return 计算副本事件泳道(当前方案?.事件实例列表)
  }, [当前方案?.事件实例列表])

  return (
    <Drawer
      className={styles.drawer}
      open={open}
      onClose={onCancel}
      title={
        <div className={styles.drawerTitle}>
          <span>副本事件编辑器</span>
          <span className={styles.drawerPlacement}>
            <Button
              size='small'
              type={抽屉位置 === 'left' ? 'primary' : 'default'}
              onClick={() => 设置抽屉位置('left')}
            >
              左
            </Button>
            <Button
              size='small'
              type={抽屉位置 === 'right' ? 'primary' : 'default'}
              onClick={() => 设置抽屉位置('right')}
            >
              右
            </Button>
            <Button
              size='small'
              type={抽屉位置 === 'bottom' ? 'primary' : 'default'}
              onClick={() => 设置抽屉位置('bottom')}
            >
              下
            </Button>
          </span>
        </div>
      }
      width={'80%'}
      height={'80%'}
      placement={抽屉位置}
      destroyOnClose
    >
      <div className={styles.body}>
        {/* 模块：方案 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>方案</span>
            <span className={styles.sectionActions}>
              <Tooltip title='导出方案 JSON（复制并下载）'>
                <Button
                  size='small'
                  icon={<DownloadOutlined />}
                  onClick={导出JSON}
                  disabled={!当前方案}
                >
                  导出
                </Button>
              </Tooltip>
              <Tooltip title='从 JSON 导入方案'>
                <Button
                  size='small'
                  icon={<ImportOutlined />}
                  onClick={() => 设置导入弹窗展示(true)}
                >
                  导入
                </Button>
              </Tooltip>
              <Tooltip title='导出为可视化图片'>
                <Button
                  size='small'
                  icon={<FileImageOutlined />}
                  onClick={导出图片}
                  disabled={!当前方案}
                >
                  图片
                </Button>
              </Tooltip>
            </span>
          </div>
          <方案选择器
            方案列表={方案列表 || []}
            当前方案名称={当前方案名称}
            onChange={(e) => {
              更新当前副本事件方案名称(e)
              设置选中实例id(undefined)
            }}
            onNew={新建方案}
            onRename={重命名方案}
            onDelete={删除方案}
          />
        </div>

        {当前方案 ? (
          <>
            {/* 模块：时间与缩放 */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>时间与缩放</span>
              </div>
              <div className={styles.settingRow}>
                <span className={styles.settingLabel}>总时间（帧）</span>
                <InputNumber
                  size='small'
                  min={1}
                  precision={0}
                  value={当前方案?.总时间}
                  disabled={只读}
                  onChange={(e) => 更新当前方案字段({ 总时间: e || 1 })}
                />
                <span className={styles.timeText}>{帧转分秒帧(当前方案?.总时间 || 0).文本}</span>
                <span className={styles.settingDivider} />
                <span className={styles.settingLabel}>缩放</span>
                <Tooltip title='缩小时间轴（也可按住 Alt + 滚轮缩放）'>
                  <Button size='small' onClick={() => 设置缩放比例((s) => Math.max(0.05, s / 1.5))}>
                    缩小
                  </Button>
                </Tooltip>
                <Tooltip title='放大时间轴（也可按住 Alt + 滚轮缩放）'>
                  <Button size='small' onClick={() => 设置缩放比例((s) => s * 1.5)}>
                    放大
                  </Button>
                </Tooltip>
                <Button size='small' onClick={缩放适配}>
                  适配
                </Button>
              </div>
            </div>

            {/* 模块：添加事件 */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>添加事件</span>
                {重叠数量 > 0 ? (
                  <span className={styles.overlapWarn} onClick={定位重叠详情}>
                    存在 {重叠数量} 处重叠，点击查看
                  </span>
                ) : null}
              </div>
              <div className={styles.addRow}>
                <Select
                  className={styles.addSelect}
                  value={添加事件名称}
                  onChange={设置添加事件名称}
                  disabled={只读}
                  placeholder='选择要添加的团队增益'
                  options={事件定义列表.map((定义) => ({
                    value: 定义.事件名称,
                    label: 定义.事件名称,
                  }))}
                  optionRender={(option) => {
                    const 定义 = 获取事件定义(option.value as string, 事件定义列表)
                    if (!定义) {
                      return option.label
                    }
                    return (
                      <事件详情弹窗 事件定义={定义}>
                        <div className={styles.addOptionWrap}>
                          <img className={styles.addIcon} src={定义.图标} alt='' />
                          <span>{定义.事件名称}</span>
                          <span className={styles.addDesc}>
                            CD {定义.默认CD > 0 ? 帧转分秒帧(定义.默认CD).文本 : '一次性'} / 持续{' '}
                            {(定义.阶段列表 || []).reduce((s, a) => s + a.持续时间, 0) / 16}s
                          </span>
                        </div>
                      </事件详情弹窗>
                    )
                  }}
                />
                <Button size='small' type='primary' onClick={添加单个} disabled={只读}>
                  添加
                </Button>
                <Button size='small' onClick={打开自动填充} disabled={只读}>
                  自动填充
                </Button>
                <Tooltip title='清空当前所有事件，并把默认参与的事件从 0 帧按 CD 自动填充满（相当于重置为最基础的默认轴）'>
                  <Button size='small' onClick={重置为默认填充} disabled={只读}>
                    重置为默认填充
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* 模块：时间轴 */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>时间轴</span>
                <span className={styles.sectionActions}>
                  <span className={styles.sectionTip}>
                    {只读
                      ? '默认方案只读，如需调整请在「方案」中新建方案'
                      : '拖动块移动，拖边调时长'}
                  </span>
                  {只读 ? null : (
                    <Tooltip title='开启后拖动某实例会按 CD 间隔同步移动该事件的所有实例（也可在拖动时按住 Shift 临时启用）'>
                      <span className={styles.syncToggle}>
                        <span className={styles.syncToggleLabel}>同步拖动</span>
                        <Switch size='small' checked={同步拖动开关} onChange={设置同步拖动开关} />
                      </span>
                    </Tooltip>
                  )}
                </span>
              </div>
              <div className={styles.timelineWrap}>
                <时间轴
                  ref={时间轴Ref}
                  总时间={当前方案?.总时间 || 1}
                  行列表={行列表}
                  实例列表={当前方案?.事件实例列表 || []}
                  选中实例id={选中实例id}
                  缩放比例={缩放比例}
                  只读={只读}
                  onSelect={设置选中实例id}
                  onCommitInstanceList={onCommitInstanceList}
                  onDeleteInstance={onDeleteInstance}
                  重叠实例idSet={重叠实例idSet}
                  onWheelZoom={onWheelZoom}
                  onZoomChange={设置缩放比例}
                  事件CD映射={事件CD映射}
                  同步拖动模式={同步拖动开关}
                  onAddEventInstance={添加事件实例}
                  onClearEvent={清空事件}
                />
              </div>

              {/* 选中实例的精确编辑（独立于事件详情列表） */}
              {选中实例 ? (
                <实例编辑面板
                  实例={选中实例}
                  只读={只读}
                  onUpdate释放时间={onUpdate释放时间}
                  onUpdate阶段持续时间={onUpdate阶段持续时间}
                  onDelete={() => onDeleteInstance(选中实例.id)}
                />
              ) : null}
            </div>

            {/* 模块：战斗曲线预览（对比团队增益对曲线的影响） */}
            {战斗曲线数据?.length || on生成战斗曲线 ? (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>战斗曲线</span>
                  <span className={styles.sectionTip}>
                    拖动上方事件，查看增益覆盖与秒伤曲线的关系
                  </span>
                </div>
                {战斗曲线数据?.length ? (
                  <>
                    <战斗曲线 曲线数据={战斗曲线数据} 增益泳道列表={团队增益泳道列表} 高度={360} />
                    {on生成战斗曲线 ? (
                      <div className={styles.settingRow}>
                        <Button size='small' onClick={on生成战斗曲线}>
                          刷新曲线
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className={styles.empty}>
                    <p>暂无战斗曲线数据</p>
                    {on生成战斗曲线 ? (
                      <Button size='small' type='primary' onClick={on生成战斗曲线}>
                        生成战斗曲线
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            {/* 模块：事件详情 */}
            <div className={styles.section} ref={详情区Ref}>
              <div
                className={`${styles.sectionHeader} ${styles.sectionHeaderClickable}`}
                onClick={() => 设置事件详情展开((e) => !e)}
              >
                <span className={styles.sectionTitle}>
                  {事件详情展开 ? <DownOutlined /> : <RightOutlined />} 事件详情
                </span>
                <span className={styles.sectionTip}>
                  {事件详情展开 ? '点击收起' : '点击展开'} · 点击下方条目可选中
                  {只读 ? '查看' : '并编辑'}
                </span>
              </div>

              {事件详情展开 ? (
                <实例详情列表
                  排序实例列表={排序实例列表}
                  重叠实例idSet={重叠实例idSet}
                  选中实例id={选中实例id}
                  只读={只读}
                  onSelect={设置选中实例id}
                  onDelete={onDeleteInstance}
                  获取图标={获取实例图标}
                />
              ) : null}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <p>暂无方案，请在「方案」下拉框中新建方案</p>
          </div>
        )}
      </div>

      {/* 自动填充弹窗 */}
      <自动填充弹窗
        open={自动填充弹窗展示}
        事件名称={添加事件名称}
        首次施放时间={首次施放时间}
        on首次施放时间变化={设置首次施放时间}
        onCancel={() => 设置自动填充弹窗展示(false)}
        onOk={确认自动填充}
      />

      {/* 方案重命名弹窗 */}
      <重命名弹窗
        open={方案名称编辑弹窗.open}
        值={方案名称编辑弹窗.值}
        onChange={(值) => 设置方案名称编辑弹窗({ ...方案名称编辑弹窗, 值 })}
        onCancel={() => 设置方案名称编辑弹窗({ open: false, 值: '' })}
        onOk={确认方案名称}
      />

      {/* 导入弹窗 */}
      <导入弹窗
        open={导入弹窗展示}
        文本={导入文本}
        on文本变化={设置导入文本}
        onCancel={() => {
          设置导入弹窗展示(false)
          设置导入文本('')
        }}
        onOk={确认导入}
      />
    </Drawer>
  )
}

export default React.memo(副本事件编辑器)
