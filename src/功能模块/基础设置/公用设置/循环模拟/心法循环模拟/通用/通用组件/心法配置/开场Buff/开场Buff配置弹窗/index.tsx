import CycleSimulatorContext from '@/功能模块/基础设置/公用设置/循环模拟/context'
import { Alert, Button, Drawer, DrawerProps, Popover, Select, Space, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { Buff枚举, 起手Buff } from '../../../../通用框架/类型定义/Buff'
import styles from './index.module.less'
import { 按数字生成数组 } from '@/工具函数/help'
import { 每秒郭氏帧 } from '@/数据/常量'
import { QuestionCircleOutlined } from '@ant-design/icons'

interface 开场Buff配置弹窗类型 extends DrawerProps {
  原始Buff数据: Buff枚举
  起手可选DOT?: string[]
}

const 开场Buff配置弹窗: React.FC<开场Buff配置弹窗类型> = (props) => {
  const { open, onClose, 原始Buff数据, 起手可选DOT = [] } = props
  const { 起手Buff配置, 更新起手Buff配置 } = useContext(CycleSimulatorContext)

  const [起手配置编辑对象, 设置起手配置编辑对象] = useState<起手Buff[]>([])

  useEffect(() => {
    if (open) {
      设置起手配置编辑对象(
        Object.values(起手Buff配置).map((item) =>
          item.名称 && 起手可选DOT.includes(item.名称) && item.层数 !== undefined
            ? { ...item, 层数: Math.min(item.层数, 原始Buff数据[item.名称].最大层数) }
            : { ...item },
        ),
      )
    } else {
      设置起手配置编辑对象([])
    }
  }, [open])

  const 新增Buff选项 = () => {
    const 新数组对象 = [...(起手配置编辑对象 || []), {}]
    设置起手配置编辑对象(新数组对象)
  }

  const 设置Buff数据 = (data, type, i) => {
    const 新数组对象 = 起手配置编辑对象.map((item, index) => {
      if (i === index) {
        if (type === '名称') {
          const 该Buff数据 = data ? 原始Buff数据?.[data] : undefined
          const 最大时间的一半 = Math.floor((该Buff数据?.最大持续时间 || 0) / 2)
          return {
            名称: data,
            类型: 该Buff数据?.类型,
            层数: 该Buff数据?.最大层数 || 1,
            获得时间: -最大时间的一半 || -0,
          }
        } else {
          return { ...item, [type]: data }
        }
      } else {
        return { ...item }
      }
    })
    设置起手配置编辑对象(新数组对象)
  }

  const 保存 = (e) => {
    const 新对象: any = {}
    起手配置编辑对象?.forEach((item) => {
      if (item?.名称 && item?.层数 !== undefined && item?.获得时间 !== undefined) {
        新对象[item?.名称] = item
      }
    })
    更新起手Buff配置(新对象)
    onClose?.(e)
  }

  return (
    <Drawer
      title={'起手Buff设置'}
      onClose={onClose}
      open={open}
      placement='right'
      width={720}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type='primary' onClick={保存}>
            保存
          </Button>
        </Space>
      }
    >
      <Alert
        type='error'
        message='重点注意，设置某些Buff时需要考虑获得该buff的技能的冷却时间，请针对冷却时间的影响自行修改循环内该技能的释放时机'
        style={{ marginBottom: 24 }}
      />
      {起手可选DOT.length > 0 && (
        <Alert
          type='info'
          message='起手持续伤害按起手自身Buff生成快照，不还原此前已消失的增益；开始前已跳出的伤害不计入本次模拟。'
          style={{ marginBottom: 24 }}
        />
      )}
      {起手配置编辑对象?.map((item, index) => {
        // 找到该Buff数据
        const 该Buff数据 = item?.名称 ? 原始Buff数据?.[item?.名称] : undefined
        return (
          <div key={`起手Buff配置_${item?.名称}_${index}`} className={styles.content}>
            <div className={`${styles.item} ${styles.name}`}>
              <h1 className={styles.title}>Buff名称</h1>
              <Select
                value={item?.名称 || undefined}
                placeholder='设置起手Buff'
                onChange={(e) => 设置Buff数据(e, '名称', index)}
                allowClear
                size='large'
              >
                {Object.values(原始Buff数据)
                  .filter((buff) => !('伤害频率' in buff) || 起手可选DOT.includes(buff.名称))
                  .map((buff) => {
                    return (
                      <Select.Option
                        key={buff?.名称}
                        value={buff?.名称}
                        disabled={
                          buff?.名称 !== item?.名称 &&
                          起手配置编辑对象?.some((a) => a?.名称 === buff?.名称)
                        }
                      >
                        <Tooltip title={buff?.备注} placement='left'>
                          <div className={styles.nameWrap}>
                            <div className={styles.nameTextWrap}>
                              <img className={styles.img} src={buff?.图标} />
                              <span className={styles.nameText}>
                                {buff.名称}{'伤害频率' in buff ? '（持续伤害）' : ''}
                              </span>
                            </div>
                            <span className={buff?.类型 === '自身' ? styles.self : styles.target}>
                              {buff?.类型}
                            </span>
                          </div>
                        </Tooltip>
                      </Select.Option>
                    )
                  })}
              </Select>
            </div>
            <div className={`${styles.item} ${styles.count}`}>
              <h1 className={styles.title}>层数</h1>
              <Select
                size='large'
                value={item?.层数 || undefined}
                placeholder='设置层数'
                onChange={(e) => 设置Buff数据(e, '层数', index)}
                allowClear
                disabled={!该Buff数据}
                options={按数字生成数组(该Buff数据?.最大层数)?.map((item) => {
                  return {
                    value: item,
                    label: `${item}层`,
                  }
                })}
              />
            </div>
            <div className={`${styles.item} ${styles.time}`}>
              <h1 className={styles.title}>
                获得该Buff时间
                <Popover
                  content={
                    <div>
                      <p>
                        以模拟起点为0秒时计算，预设提前获得该Buff的具体时间点，例：开打前10秒猴戏buff
                        A，则设置为-10秒
                      </p>
                      <p>普通Buff若持续30秒，提前10秒获得，进入战斗后剩余20秒。</p>
                      <p>持续伤害按加速后的剩余跳伤队列计算持续时间。</p>
                      <p>默认值为最大持续时间的一半</p>
                    </div>
                  }
                  title='字段说明'
                >
                  <QuestionCircleOutlined className={styles.icon} />
                </Popover>
              </h1>
              <Select
                size='large'
                value={item.获得时间}
                placeholder='设置提前获得的秒数'
                onChange={(e) => 设置Buff数据(e, '获得时间', index)}
                allowClear
                disabled={!该Buff数据}
                options={[
                  ...(按数字生成数组(该Buff数据?.最大持续时间)?.map((item) => {
                    const 实际帧数 = item - 1
                    const 获得秒数 = (实际帧数 / 每秒郭氏帧).toFixed(2)
                    return {
                      value: -实际帧数,
                      label: `-${获得秒数}秒`,
                    }
                  }) || []),
                ]}
              />
            </div>
          </div>
        )
      })}
      <Button block type='primary' onClick={新增Buff选项}>
        <span style={{ fontSize: 20 }}>+</span>
      </Button>
      <Button block type='dashed' style={{ marginTop: 12 }} danger onClick={保存}>
        保存
      </Button>
    </Drawer>
  )
}

export default 开场Buff配置弹窗
