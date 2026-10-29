import { 获取附魔显示名称 } from '@/数据/附魔/查询'
import React, { useContext } from 'react'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 装备位置部位枚举, 装备增益类型, 装备属性信息模型, 装备类型枚举 } from '@/@types/装备'
import 图标 from '@/数据/静态数据/图标.json'
import styles from './index.module.less'
import ExportContext from '../context'
import { 获取装备数据描述 } from '../../../工具函数/获取装备数据描述'
import { 属性简写枚举 } from '@/@types/枚举'
import classNames from 'classnames'
import ImageComponent from '@/组件/图片展示'

const 装备区 = () => {
  const { 装备数据, 五彩石 } = use心法数据()
  const { 当前装备信息 } = useContext(ExportContext)
  const 五彩石等级 = 当前装备信息?.五彩石?.includes('陆') ? 6 : 5
  const 五彩石图标 = 五彩石等级 === 6 ? 图标?.六级五彩石 : 图标?.五级五彩石
  const 五彩石数据 = 五彩石?.[五彩石等级]?.find((a) => a?.五彩石名称 === 当前装备信息?.五彩石)

  const 五彩石属性 = 五彩石数据?.装备增益?.map((item) => {
    return 属性简写枚举?.[item?.增益类型]
  })

  return (
    <div className={styles.equipWrap}>
      {当前装备信息?.装备列表?.map((当前装备, index) => {
        const 装备: 装备属性信息模型 =
          装备数据?.[当前装备?.装备部位]?.find((a) => a?.id === 当前装备?.id) || ({} as any)
        const 装备图标 = `https://icon.jx3box.com/icon/${装备?.图标ID}.png`
        const 装备背景 =
          装备?.装备类型 === 装备类型枚举?.橙武 ? 图标?.橙色装备边框 : 图标?.紫色装备边框

        const 最大精炼等级 = 装备?.装备类型 === 装备类型枚举?.橙武 ? 8 : 6
        const 装备特征描述 = 获取装备数据描述(装备, true, false)
        const 装备结果描述 = 获取装备数据描述(装备, false, true)
        const 是否有大附魔 = 判断是否存在大附魔(当前装备?.装备部位, 当前装备信息?.装备增益)

        return 装备 ? (
          <div className={styles.equip} key={`导出装备_${装备?.id}_${index}`}>
            <span className={styles.position}>{当前装备?.装备部位}</span>
            <div className={styles.equipIcon}>
              <ImageComponent
                key={`图标_${装备?.id}`}
                src={装备图标}
                fallback={'https://icon.jx3box.com/icon/13.png'}
                className={styles.icon}
              />
              <img className={styles.border} src={装备背景} />
            </div>
            <div className={styles.info}>
              <div className={styles.name}>
                <h1 className={styles.nameText}>{装备?.装备名称}</h1>
                {装备特征描述?.length ? (
                  <span className={styles.desc}>
                    {装备特征描述?.map((item) => {
                      const cls = classNames(
                        styles.descTip,
                        item === '精简' ? styles.jingjian : '',
                        item === '特效' ? styles.texiao : '',
                        item === 'PVX' ? styles.pvx : '',
                      )
                      return (
                        <span className={cls} key={`导出装备_特征_${装备?.id}_${index}_${item}`}>
                          {item}
                        </span>
                      )
                    })}
                  </span>
                ) : null}
                <span className={styles.gainLevel}>
                  ({当前装备?.当前精炼等级}/{最大精炼等级})
                </span>
              </div>
              <div className={styles.text}>
                <span>{装备?.装备品级}</span>
                <span className={styles.desc}>
                  {装备结果描述?.map((item) => {
                    const cls = classNames(
                      styles.descTip,
                      item === '精简' ? styles.jingjian : '',
                      item === '特效' ? styles.texiao : '',
                      item === 'PVX' ? styles.pvx : '',
                    )
                    return (
                      <span className={cls} key={`导出装备_${装备?.id}_${index}_${item}`}>
                        {item}
                      </span>
                    )
                  })}
                </span>
              </div>
            </div>
            <div className={styles.stoneWrap}>
              {当前装备?.镶嵌孔数组?.map((镶嵌孔) => {
                const 图标信息 = 图标?.五行石?.[镶嵌孔?.镶嵌宝石等级 || 8]
                return (
                  <div className={styles.stone} key={`${装备?.id}_${镶嵌孔?.镶嵌类型}`}>
                    <img className={styles.stoneImg} src={图标信息} />
                    <div className={styles.stoneText}>
                      {镶嵌孔?.镶嵌类型 ? 属性简写枚举?.[镶嵌孔?.镶嵌类型] || '未知' : '未知'}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={styles.gainWrap}>
              <div className={styles.gain}>
                <img className={styles.gainIcon} src={图标?.附魔} />
                {获取附魔显示名称(当前装备?.附魔).replace('+', ' +')}
              </div>
              <div className={styles.gainContent}>
                {是否有大附魔 ? (
                  <div className={styles.bigGain}>
                    <img className={styles.gainIcon} src={图标?.大附魔} />
                    <span>{大附魔枚举?.[当前装备?.装备部位]}</span>
                  </div>
                ) : null}
                {当前装备?.装备部位 === 装备位置部位枚举._12 ? (
                  <>
                    <div className={styles.bigGain}>
                      <img className={styles.gainIcon} src={五彩石图标} />
                      <span>{当前装备信息?.五彩石?.replace('彩·', '')}</span>
                    </div>
                    <div className={styles.stoneTip}>{五彩石属性?.join('·')}</div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null
      })}
    </div>
  )
}

export default 装备区

const 大附魔枚举 = {
  帽子: '大附魔·伤帽',
  衣服: '大附魔·伤衣',
  腰带: '大附魔·伤腰',
  护腕: '大附魔·伤腕',
  鞋子: '大附魔·伤鞋',
}

const 判断是否存在大附魔 = (部位: 装备位置部位枚举, 装备增益: 装备增益类型) => {
  if (!大附魔枚举?.[部位]) {
    return false
  } else {
    const 对应大附魔名称 = 大附魔枚举?.[部位]?.replace('·', '_')
    if (装备增益?.[对应大附魔名称]) {
      return true
    } else {
      return false
    }
  }
}
