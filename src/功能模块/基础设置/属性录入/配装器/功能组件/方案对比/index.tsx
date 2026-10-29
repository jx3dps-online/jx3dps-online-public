// 模块暂时隐藏：因角色/方案重构与登龙长阶开发，配装器工具菜单入口已下线，本模块未被引用、不参与打包。
// 重构完成后按新口径恢复：样本来源 = 当前角色配装 + 本角色目标 + 配装导入 + 粘贴代码。
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, App, Button, Dropdown, Empty, Input, Modal, Switch, Tabs, Tag, Tooltip } from 'antd'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 装备信息数据类型, 装备类型枚举 } from '@/@types/装备'
import { 配装快照, 方案对比结果 } from '@/@types/配装指导'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 数据埋点 } from '@/工具函数/tools/log'
import { use目标池 } from '@/角色/use目标池'
import ImageComponent from '@/组件/图片展示'
import 根据表单选项获取装备信息 from '../../工具函数/根据表单选项获取装备信息'
import 配装导入 from '../配装导入'
import 装备详情容器 from '../装备选择/装备部位选择/装备详情容器'
import { 获取装备数据描述 } from '../装备选择/装备部位选择'
import 对比表格 from './对比表格'
import {
  获取统一属性面板,
  获取装备差异,
  获取装备模型,
  装备信息转表单值,
  生成装备信息签名,
  生成增益签名,
} from './属性diff工具'
import styles from './index.module.less'

interface 方案对比入参 {
  open: boolean
  onCancel: () => void
  form: any
  当前装备信息: 装备信息数据类型
  更换装备计算秒伤: (单个表单值: any, 全部表单值: any) => void
}

const 方案数量上限 = 6

const 生成快照id = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const 深拷贝装备信息 = (装备信息: 装备信息数据类型): 装备信息数据类型 =>
  JSON.parse(JSON.stringify(装备信息))

const 装备条目 = (部位名: string, 装备值?: any) => {
  const 装备 = 获取装备模型(部位名, 装备值)
  if (!装备) {
    return <div className={styles.空装备}>空</div>
  }
  const 图标 = `https://icon.jx3box.com/icon/${装备?.图标ID}.png`
  const 描述 = 获取装备数据描述(装备) || []
  return (
    <装备详情容器 装备数据={装备} 当前装备信息={装备值}>
      <div className={styles.装备条}>
        <ImageComponent
          src={图标}
          fallback={'https://icon.jx3box.com/icon/13.png'}
          className={styles.图标}
        />
        <div className={styles.装备信息}>
          <div className={styles.名称}>
            {装备?.装备类型 === 装备类型枚举.橙武 ? (
              <span className={styles.橙武名}>
                {装备?.装备名称?.replaceAll('·内', '').replaceAll('·外', '')}
              </span>
            ) : (
              装备?.装备名称?.replaceAll('·内', '').replaceAll('·外', '')
            )}
          </div>
          <div className={styles.品级}>
            {装备?.装备品级} 品
            {描述?.length ? <span className={styles.描述}>（{描述.join(' ')}）</span> : null}
          </div>
        </div>
      </div>
    </装备详情容器>
  )
}

function 方案对比(props: 方案对比入参) {
  const { open, onCancel, form, 当前装备信息, 更换装备计算秒伤 } = props
  const dispatch = useAppDispatch()
  const { message, modal } = App.useApp()
  const 当前角色 = useAppSelector((state) => state?.data?.当前角色)
  const { 池 } = use目标池(当前角色?.心法)
  const 当前计算循环名称 = useAppSelector((state) => state?.data?.当前计算循环名称)
  const 当前奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)

  const [快照列表, 设置快照列表] = useState<配装快照[]>([])
  const [基准id, 设置基准id] = useState<string>('')
  const [导入弹窗展示, 设置导入弹窗展示] = useState(false)
  const [代码弹窗展示, 设置代码弹窗展示] = useState(false)
  const [代码文本, 设置代码文本] = useState('')
  const [仅看差异, 设置仅看差异] = useState(false)
  const [重命名快照, 设置重命名快照] = useState<配装快照 | null>(null)
  const [重命名输入, 设置重命名输入] = useState('')

  useEffect(() => {
    if (open && 当前装备信息) {
      const 快照: 配装快照 = {
        id: 生成快照id(),
        名称: '当前配装',
        来源: '当前',
        装备信息: 深拷贝装备信息(当前装备信息),
        创建时间: Date.now(),
        循环名称: 当前计算循环名称,
        增益启用,
        增益数据,
      }
      设置快照列表([快照])
      设置基准id(快照.id)
      设置仅看差异(false)
    }
  }, [open])

  const 计算秒伤 = (装备信息: 装备信息数据类型) => {
    try {
      const { 秒伤 } = dispatch(秒伤计算({ 更新装备信息: 装备信息, 计算技能详情: false }))
      return 秒伤 || 0
    } catch {
      return 0
    }
  }

  const 添加快照 = (快照: 配装快照) => {
    if (快照列表.length >= 方案数量上限) {
      message.warning(`最多支持 ${方案数量上限} 套方案对比`)
      return
    }
    const 签名 = 生成装备信息签名(快照.装备信息)
    const 重复快照 = 快照列表.find((已有) => 生成装备信息签名(已有.装备信息) === 签名)
    if (重复快照) {
      message.warning(`该配装与「${重复快照.名称}」完全一致，无需重复添加`)
      return
    }
    const 新列表 = [...快照列表, 快照]
    设置快照列表(新列表)
    if (!基准id) {
      设置基准id(快照.id)
    }
  }

  const 添加当前方案 = () => {
    if (!当前装备信息) {
      message.warning('当前无装备信息')
      return
    }
    添加快照({
      id: 生成快照id(),
      名称: `当前配装 ${快照列表.length + 1}`,
      来源: '当前',
      装备信息: 深拷贝装备信息(当前装备信息),
      创建时间: Date.now(),
      循环名称: 当前计算循环名称,
      增益启用,
      增益数据,
    })
  }

  const 添加目标 = (目标id: string) => {
    const 目标 = 池.目标.find((项) => 项.id === 目标id)
    if (!目标?.装备) {
      message.warning('该目标无装备信息')
      return
    }
    添加快照({
      id: 生成快照id(),
      名称: 目标.名称,
      来源: '目标',
      装备信息: 深拷贝装备信息(目标.装备),
      创建时间: Date.now(),
      循环名称: 目标.循环?.名称 || 当前计算循环名称,
      增益启用,
      增益数据,
    })
  }

  const 添加导入方案 = (表单值: any) => {
    try {
      const 装备信息 = 根据表单选项获取装备信息(表单值)
      添加快照({
        id: 生成快照id(),
        名称: `导入配装 ${快照列表.length + 1}`,
        来源: '导入',
        装备信息,
        创建时间: Date.now(),
        循环名称: 当前计算循环名称,
        增益启用,
        增益数据,
      })
      设置导入弹窗展示(false)
    } catch {
      message.error('导入配装数据无效')
    }
  }

  const 添加代码方案 = () => {
    try {
      const 数据 = JSON.parse(代码文本)
      const 装备信息 = 根据表单选项获取装备信息(数据)
      添加快照({
        id: 生成快照id(),
        名称: `代码配装 ${快照列表.length + 1}`,
        来源: '代码',
        装备信息,
        创建时间: Date.now(),
        循环名称: 当前计算循环名称,
        增益启用,
        增益数据,
      })
      设置代码文本('')
      设置代码弹窗展示(false)
    } catch {
      message.error('解析失败，请检查代码格式')
    }
  }

  const 添加方案菜单 = {
    items: [
      { key: '当前', label: '当前配装' },
      {
        key: '目标',
        label: '本角色目标',
        children: 池.目标.map((目标) => ({
          key: `目标_${目标.id}`,
          label: 目标.名称,
        })),
      },
      { key: '导入', label: '配装导入' },
      { key: '代码', label: '粘贴代码' },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === '当前') {
        添加当前方案()
      } else if (key === '导入') {
        设置导入弹窗展示(true)
      } else if (key === '代码') {
        设置代码弹窗展示(true)
      } else if (key?.startsWith('目标_')) {
        添加目标(key.slice('目标_'.length))
      }
    },
  }

  const 对比结果: 方案对比结果 = useMemo(() => {
    if (!快照列表.length) {
      return { 基准id: '', 列表: [] }
    }
    const 有效基准id = 快照列表.some((快照) => 快照.id === 基准id) ? 基准id : 快照列表[0].id
    const 基准快照 = 快照列表.find((快照) => 快照.id === 有效基准id) || 快照列表[0]
    const 基准秒伤 = 计算秒伤(基准快照.装备信息)
    const 当前增益签名 = 生成增益签名(增益启用, 增益数据)
    const 列表 = 快照列表.map((快照) => {
      const 秒伤 = 计算秒伤(快照.装备信息)
      const 加速不匹配 = 秒伤 === 0
      const 秒伤差 = 加速不匹配 || 基准秒伤 === 0 ? 0 : 秒伤 - 基准秒伤
      const 秒伤百分比 = 加速不匹配 || 基准秒伤 === 0 ? 0 : (秒伤差 / 基准秒伤) * 100
      const 属性面板 = 获取统一属性面板(快照.装备信息, {
        当前奇穴信息,
        增益数据,
        增益启用,
      })
      return {
        快照,
        秒伤,
        秒伤差,
        秒伤百分比,
        属性面板,
        装分: 属性面板?.装分 || 快照.装备信息?.装备基础属性?.装分 || 0,
        加速不匹配,
        循环不同: (快照.循环名称 || '') !== (当前计算循环名称 || ''),
        增益不同: 生成增益签名(快照.增益启用, 快照.增益数据) !== 当前增益签名,
      }
    })
    return { 基准id: 有效基准id, 列表 }
  }, [快照列表, 基准id, 当前奇穴信息, 增益数据, 增益启用, 当前计算循环名称])

  const 存在跨上下文 = 对比结果?.列表?.some((条目) => 条目?.循环不同 || 条目?.增益不同)

  const 装备差异数据 = useMemo(() => {
    const 基准快照 = 快照列表.find((快照) => 快照.id === 对比结果?.基准id)
    if (!基准快照 || 快照列表.length < 2) {
      return []
    }
    return 快照列表
      .filter((快照) => 快照.id !== 对比结果?.基准id)
      .map((快照) => ({
        快照,
        差异: 获取装备差异(基准快照.装备信息, 快照.装备信息),
      }))
      .filter((item) => item?.差异?.length)
  }, [快照列表, 对比结果?.基准id])

  const 设为基准 = (id: string) => {
    设置基准id(id)
  }

  const 移除快照 = (id: string) => {
    modal.confirm({
      title: '移除方案',
      content: '确定从对比中移除该方案吗？',
      onOk: () => {
        const 新列表 = 快照列表.filter((快照) => 快照.id !== id)
        设置快照列表(新列表)
        if (基准id === id) {
          设置基准id(新列表?.[0]?.id || '')
        }
      },
    })
  }

  const 采用快照 = (快照: 配装快照) => {
    const 表单值 = 装备信息转表单值(快照.装备信息)
    form?.setFieldsValue(表单值)
    更换装备计算秒伤(undefined, 表单值)
    数据埋点('方案对比采用方案')
    message.success(`已采用「${快照.名称}」，可点击「保存角色」写入当前角色`)
  }

  const 确认重命名 = () => {
    if (!重命名快照 || !重命名输入?.trim()) {
      设置重命名快照(null)
      return
    }
    设置快照列表(
      快照列表.map((快照) =>
        快照.id === 重命名快照.id ? { ...快照, 名称: 重命名输入.trim() } : 快照,
      ),
    )
    设置重命名快照(null)
  }

  const 渲染方案卡片 = (条目) => {
    const { 快照, 秒伤, 秒伤差, 秒伤百分比, 加速不匹配, 循环不同, 增益不同 } = 条目
    const 是基准 = 快照.id === 对比结果?.基准id
    return (
      <div className={styles.方案卡片} key={快照.id}>
        <div className={styles.卡片头部}>
          <span className={styles.卡片名称} title={快照.名称}>
            {快照.名称}
          </span>
          {是基准 ? <Tag color='blue'>基准</Tag> : null}
          <Dropdown
            menu={{
              items: [
                { key: '基准', label: '设为基准', disabled: 是基准 },
                { key: '改名', label: '重命名' },
                { key: '移除', label: '移除' },
              ],
              onClick: ({ key }) => {
                if (key === '基准') {
                  设为基准(快照.id)
                } else if (key === '改名') {
                  设置重命名快照(快照)
                  设置重命名输入(快照.名称)
                } else if (key === '移除') {
                  移除快照(快照.id)
                }
              },
            }}
          >
            <Button size='small' type='text' icon={<EllipsisOutlined />} />
          </Dropdown>
        </div>
        <div className={styles.卡片信息行}>
          <span className={styles.卡片标签}>循环</span>
          <span className={styles.卡片值}>{快照.循环名称 || '—'}</span>
          {循环不同 ? (
            <Tooltip
              title={`该方案原循环与当前不同，已按当前循环「${当前计算循环名称 || '—'}」重新计算`}
            >
              <Tag color='orange'>循环不同</Tag>
            </Tooltip>
          ) : null}
        </div>
        <div className={styles.卡片信息行}>
          <span className={styles.卡片标签}>增益</span>
          <span className={styles.卡片值}>{快照.增益启用 ? '已开启' : '未开启'}</span>
          {增益不同 ? (
            <Tooltip title='该方案原增益配置与当前不一致，已按当前增益重新计算'>
              <Tag color='orange'>增益不同</Tag>
            </Tooltip>
          ) : null}
        </div>
        <div className={styles.卡片秒伤区}>
          <div className={styles.卡片秒伤}>
            {加速不匹配 ? (
              <span className={styles.加速不匹配}>加速不匹配</span>
            ) : (
              <>
                秒伤{' '}
                <span
                  className={
                    !是基准 ? (秒伤差 >= 0 ? styles.卡片秒伤升 : styles.卡片秒伤降) : undefined
                  }
                >
                  {秒伤}
                </span>
                {!是基准 ? (
                  <span className={秒伤百分比 >= 0 ? styles.卡片秒伤差升 : styles.卡片秒伤差降}>
                    （{秒伤百分比 >= 0 ? '+' : ''}
                    {秒伤百分比?.toFixed(2)}%）
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>
        <Button type='primary' size='small' block onClick={() => 采用快照(快照)}>
          采用该方案
        </Button>
      </div>
    )
  }

  const 渲染装备差异 = () => {
    if (!装备差异数据.length) {
      return (
        <Empty description='各方案装备与基准一致，无差异' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )
    }
    return (
      <div className={styles.差异区}>
        {装备差异数据.map(({ 快照, 差异 }) => (
          <div key={快照.id} className={styles.差异组}>
            <div className={styles.差异标题}>{快照.名称} 装备差异</div>
            <div className={styles.差异列表}>
              {差异.map((项) => (
                <div key={项.部位索引} className={styles.差异行}>
                  <div className={styles.差异部位}>{项.部位名}</div>
                  <div className={styles.差异对比}>
                    <div className={styles.差异旧}>{装备条目(项.部位名, 项.基准装备)}</div>
                    <div className={styles.差异箭头}>→</div>
                    <div className={styles.差异新}>{装备条目(项.部位名, 项.对比装备)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Modal title='方案对比' open={open} onCancel={onCancel} width={1100} footer={null}>
      <div className={styles.工具栏}>
        <Dropdown menu={添加方案菜单} trigger={['click']}>
          <Button type='primary' icon={<PlusOutlined />}>
            添加方案
          </Button>
        </Dropdown>
        <div className={styles.仅看差异}>
          <span>仅看差异</span>
          <Switch size='small' checked={仅看差异} onChange={设置仅看差异} />
        </div>
      </div>

      {快照列表.length ? (
        <>
          <div className={styles.计算口径}>
            统一计算口径：当前循环「{当前计算循环名称 || '—'}」· 增益
            {增益启用 ? '已开启' : '未开启'}
          </div>
          {存在跨上下文 ? (
            <Alert
              type='warning'
              showIcon
              className={styles.跨上下文提示}
              message='部分方案与当前循环 / 增益不一致'
              description='标有「循环不同」「增益不同」的方案，其装备原本针对其他循环或增益搭配，当前计算值可能非其最优表现，仅供参考。'
            />
          ) : null}
          <div className={styles.方案卡片行}>{对比结果?.列表?.map(渲染方案卡片)}</div>
          <Tabs
            defaultActiveKey='属性'
            items={[
              {
                key: '属性',
                label: '属性对比',
                children: <对比表格 对比结果={对比结果} 仅看差异={仅看差异} />,
              },
              {
                key: '装备',
                label: '装备差异',
                children: 渲染装备差异(),
              },
            ]}
          />
        </>
      ) : (
        <Empty description='请先添加方案' style={{ padding: '40px 0' }} />
      )}

      <配装导入
        visible={导入弹窗展示}
        onClose={() => 设置导入弹窗展示(false)}
        onOk={(e) => 添加导入方案(e)}
      />

      <Modal
        title='粘贴配装代码'
        open={代码弹窗展示}
        onOk={添加代码方案}
        onCancel={() => 设置代码弹窗展示(false)}
        okText='解析并添加'
        width={600}
      >
        <Input.TextArea
          value={代码文本}
          onChange={(e) => 设置代码文本(e?.target?.value)}
          placeholder='请粘贴由「配装导出 - 导出代码」生成的 JSON 代码'
          style={{ height: 200 }}
        />
      </Modal>

      <Modal
        title='重命名方案'
        open={!!重命名快照}
        onOk={确认重命名}
        onCancel={() => 设置重命名快照(null)}
        okText='确定'
        width={400}
      >
        <Input
          value={重命名输入}
          onChange={(e) => 设置重命名输入(e?.target?.value)}
          maxLength={20}
          onPressEnter={确认重命名}
        />
      </Modal>
    </Modal>
  )
}

export default 方案对比
