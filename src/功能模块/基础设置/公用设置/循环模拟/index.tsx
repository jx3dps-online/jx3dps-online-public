/**
 * 当前只内置了部分心法的循环模拟
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Tooltip } from 'antd'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 数据埋点 } from '@/工具函数/tools/log'
import { 循环基础技能数据类型 } from './心法循环模拟/通用/通用框架/类型定义/技能'
import { useAppSelector } from '@/hooks'
import CycleSimulatorContext from './context'
import { 循环日志数据类型 } from './心法循环模拟/通用/通用框架/类型定义/模拟'
import { 当前计算结果类型 } from '@/@types/输出'
import { 起手Buff配置 } from './心法循环模拟/通用/通用框架/类型定义/Buff'
import { 选中秘籍信息 } from '@/@types/秘籍'
import { 计算增益数据中加速值 } from '@/工具函数/data'

const 山海心诀循环模拟 = React.lazy(() => import('./心法循环模拟/山海心诀'))
const 孤锋诀循环模拟 = React.lazy(() => import('./心法循环模拟/孤锋诀'))
const 孤锋诀_悟循环模拟 = React.lazy(() => import('./心法循环模拟/孤锋诀_悟'))
const 周天功循环模拟 = React.lazy(() => import('./心法循环模拟/周天功'))
const 周天功_悟循环模拟 = React.lazy(() => import('./心法循环模拟/周天功_悟'))
const 凌海诀循环模拟 = React.lazy(() => import('./心法循环模拟/凌海诀'))
const 无方循环模拟 = React.lazy(() => import('./心法循环模拟/无方'))
const 花间游循环模拟 = React.lazy(() => import('./心法循环模拟/花间游'))
const 幽罗引循环模拟 = React.lazy(() => import('./心法循环模拟/幽罗引'))
const 易筋经循环模拟 = React.lazy(() => import('./心法循环模拟/易筋经'))
const 毒经循环模拟 = React.lazy(() => import('./心法循环模拟/毒经'))
const 太玄经循环模拟 = React.lazy(() => import('./心法循环模拟/太玄经'))
const 分山劲循环模拟 = React.lazy(() => import('./心法循环模拟/分山劲'))
// const 焚影圣诀循环模拟 = React.lazy(() => import('./心法循环模拟/焚影圣诀'))
const 天罗诡道循环模拟 = React.lazy(() => import('./心法循环模拟/天罗诡道'))
const 太玄经_悟循环模拟 = React.lazy(() => import('./心法循环模拟/太玄经_悟'))
const 支持循环心法 = {
  山海心诀: '山海心诀',
  孤锋诀: '孤锋诀',
  孤锋诀_悟: '孤锋诀_悟',
  周天功: '周天功',
  周天功_悟: '周天功_悟',
  凌海诀: '凌海诀',
  无方: '无方',
  花间游: '花间游',
  幽罗引: '幽罗引',
  易筋经: '易筋经',
  毒经: '毒经',
  太玄经: '太玄经',
  分山劲: '分山劲',
  // 焚影圣诀: '焚影圣诀',
  天罗诡道: '天罗诡道',
  太玄经_悟: '太玄经_悟',
}

const { 名称 } = 获取当前数据()

function 循环模拟() {
  const [日志信息, 更新日志信息] = useState<循环日志数据类型[]>([])
  const [模拟DPS结果, 更新模拟DPS结果] = useState<当前计算结果类型>({
    秒伤: 0,
    总伤: 0,
    秒伤计算时间: 0,
    计算结果技能列表: [],
  })
  const [模拟器弹窗展示, 更新模拟器弹窗展示] = useState<boolean>(false)
  const [cycle, setCycle] = useState<循环基础技能数据类型[]>([])
  const [自定义循环保存弹窗, 设置自定义循环保存弹窗] = useState<boolean>(false)
  const 大橙武模拟 =
    !!useAppSelector((state) => state?.data?.装备信息?.装备增益)?.大橙武特效 || false
  const [加速值, 更新加速值] = useState<number>(0)
  const [网络延迟, 更新网络延迟] = useState<number>(0)
  const [启用团队增益快照, 更新启用团队增益快照] = useState<boolean>(false)
  const [高亮团队快照, 更新高亮团队快照] = useState<string[]>([])
  const [奇穴信息, 更新奇穴信息] = useState<string[]>([])
  const [秘籍信息, 更新秘籍信息] = useState<选中秘籍信息>({})
  const [奇穴弹窗展示, 更新奇穴弹窗展示] = useState<boolean>(false)
  const [添加技能弹窗显示, 更新添加技能弹窗显示] = useState<boolean>(false)
  const [添加设置, 更新添加设置] = useState<{ 位置: string; 索引 }>({
    位置: '',
    索引: 0,
  })
  const [起手Buff配置, 更新起手Buff配置] = useState<起手Buff配置>({})
  const [增益启用, 更新增益启用] = useState<boolean>(false)

  // 当前面板加速值
  const 外部加速值 = useAppSelector((state) => state?.data?.装备信息?.装备基础属性)?.加速等级 || 0
  const 外部延迟 = useAppSelector((state) => state?.data?.网络延迟) || 0
  const 外部奇穴信息 = useAppSelector((state) => state?.data?.当前奇穴信息)
  const 外部秘籍信息 = useAppSelector((state) => state?.data?.当前秘籍信息)
  const 外部增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)

  useEffect(() => {
    if (模拟器弹窗展示) {
      // 设置外面选择的默认奇穴信息
      const 增益加速值 = 外部增益启用 ? 计算增益数据中加速值(增益数据) : 0
      const 最终加速值 = 外部加速值 + 增益加速值
      更新奇穴信息(外部奇穴信息)
      更新加速值(最终加速值)
      更新秘籍信息(外部秘籍信息)
      更新网络延迟(外部延迟)
      更新增益启用(外部增益启用)
    } else {
      更新日志信息([])
      更新模拟器弹窗展示(false)
      setCycle([])
      更新模拟DPS结果({
        秒伤: 0,
        总伤: 0,
        秒伤计算时间: 0,
        计算结果技能列表: [],
      })
    }
  }, [模拟器弹窗展示, 外部奇穴信息, 外部加速值, 外部秘籍信息, 增益数据, 外部增益启用])

  const 打开循环模拟器 = () => {
    数据埋点('打开循环模拟器')
  }

  const CycleComponent = useMemo(() => {
    const CycleMap = {
      山海心诀: 山海心诀循环模拟,
      孤锋诀: 孤锋诀循环模拟,
      孤锋诀_悟: 孤锋诀_悟循环模拟,
      周天功: 周天功循环模拟,
      周天功_悟: 周天功_悟循环模拟,
      凌海诀: 凌海诀循环模拟,
      无方: 无方循环模拟,
      花间游: 花间游循环模拟,
      幽罗引: 幽罗引循环模拟,
      易筋经: 易筋经循环模拟,
      毒经: 毒经循环模拟,
      太玄经: 太玄经循环模拟,
      分山劲: 分山劲循环模拟,
      天罗诡道: 天罗诡道循环模拟,
      太玄经_悟: 太玄经_悟循环模拟,
      // 焚影圣诀: <焚影圣诀循环模拟 打开循环模拟器={打开循环模拟器} />,
    }
    return CycleMap[名称] || <></>
  }, [名称])

  return 支持循环心法?.[名称] ? (
    <>
      {模拟器弹窗展示 ? (
        <React.Suspense>
          <CycleSimulatorContext.Provider
            value={{
              日志信息,
              更新日志信息,
              模拟DPS结果,
              更新模拟DPS结果,
              模拟器弹窗展示,
              更新模拟器弹窗展示,
              cycle,
              setCycle,
              大橙武模拟,
              加速值,
              更新加速值,
              网络延迟,
              更新网络延迟,
              启用团队增益快照,
              更新启用团队增益快照,
              奇穴信息,
              更新奇穴信息,
              奇穴弹窗展示,
              更新奇穴弹窗展示,
              自定义循环保存弹窗,
              设置自定义循环保存弹窗,
              添加技能弹窗显示,
              更新添加技能弹窗显示,
              添加设置,
              更新添加设置,
              起手Buff配置,
              更新起手Buff配置,
              秘籍信息,
              更新秘籍信息,
              增益启用,
              更新增益启用,
              高亮团队快照,
              更新高亮团队快照,
            }}
          >
            <CycleComponent 打开循环模拟器={打开循环模拟器} />
            {/* {CycleComponent} */}
          </CycleSimulatorContext.Provider>
        </React.Suspense>
      ) : null}
      <Button
        danger
        size='small'
        onClick={() => {
          更新模拟器弹窗展示(true)
          打开循环模拟器()
        }}
      >
        循环模拟
      </Button>
    </>
  ) : (
    <Tooltip title='该心法暂不支持循环模拟功能'>
      <Button danger size='small' disabled className={'cycle-disabled-btn'}>
        循环模拟
      </Button>
    </Tooltip>
  )
}

export default 循环模拟
