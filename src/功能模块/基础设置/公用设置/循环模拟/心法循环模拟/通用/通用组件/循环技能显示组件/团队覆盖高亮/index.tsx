// 技能循环显示技能单元
import React, { useContext, useMemo } from 'react'
import { 显示循环技能类型 } from '../../../通用框架/类型定义/技能'
import { useAppSelector } from '@/hooks'
import CycleSimulatorContext from '@/功能模块/基础设置/公用设置/循环模拟/context'
import 判断团队增益快照Buff from '@/数据/团队增益/tools'
import styles from './index.module.less'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

const { 团队增益 = [] } = 获取当前数据()

interface 团队覆盖高亮类型 {
  技能: 显示循环技能类型
  前一个技能?: 显示循环技能类型
}

function 团队覆盖高亮(props: 团队覆盖高亮类型) {
  const { 技能, 前一个技能 } = props
  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)
  const { 高亮团队快照 } = useContext(CycleSimulatorContext)
  const 获取技能团队增益buff列表 = (技能) => {
    if (!高亮团队快照?.length || !技能) {
      return []
    }
    const 技能释放时间 = 技能?.实际释放时间 || 0
    let 实际计算轴 = {}
    Object.keys(团队增益轴)?.forEach((增益名称) => {
      if (高亮团队快照?.includes(增益名称)) {
        实际计算轴[增益名称] = 团队增益轴[增益名称]
      }
    })
    const 团队增益buff列表 = 判断团队增益快照Buff({
      团队增益轴: 实际计算轴,
      判定帧: 技能释放时间,
    })
    return 团队增益buff列表
  }

  const 当前团队增益buff列表 = useMemo(() => {
    return 获取技能团队增益buff列表(技能)
  }, [团队增益轴, 技能, 高亮团队快照])

  // console.log('当前团队增益buff列表', 当前团队增益buff列表)
  const 首次增益出现 = useMemo(() => {
    const buff转换 = (增益) => {
      return 增益.replaceAll('_快照', '').replaceAll('_一鼓', '').replaceAll('_二鼓', '')
    }
    const 前一个技能团队增益 = 获取技能团队增益buff列表(前一个技能).map((buff) => buff转换(buff))
    const 当前团队增益buff = 当前团队增益buff列表.map((buff) => buff转换(buff))
    const 当前第一次出现增益 = 当前团队增益buff?.filter(
      (buff) => !前一个技能团队增益?.includes(buff),
    )

    return 当前第一次出现增益
  }, [团队增益轴, 技能, 前一个技能, 高亮团队快照, 当前团队增益buff列表])

  const 获取增益图标 = (增益名称) => {
    return 团队增益?.find((item) => item?.增益名称 === 增益名称)?.增益图片
  }

  return 当前团队增益buff列表?.length ? (
    <div className={styles.heightlightWrap}>
      {/* 高亮横线 */}
      <div className={styles.heightlightLine}></div>
      {首次增益出现?.length ? (
        <div className={styles.heightlightImgWrap}>
          {首次增益出现?.map((增益名称) => {
            return <img className={styles.heightlightImg} src={获取增益图标(增益名称)} alt='' />
          })}
        </div>
      ) : null}
    </div>
  ) : (
    <></>
  )
}

export default React.memo(团队覆盖高亮)
