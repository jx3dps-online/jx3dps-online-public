import React from 'react'
import { Modal, Result } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { 大附魔部位枚举, 装备位置部位枚举, 装备类型枚举 } from '@/@types/装备'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 全局寻优结果, 变更动作 } from '@/@types/配装指导'
import 装备详情容器 from '../../../功能组件/装备选择/装备部位选择/装备详情容器'
import { 获取装备数据描述 } from '../../../功能组件/装备选择/装备部位选择'
import ImageComponent from '@/组件/图片展示'
import styles from './index.module.less'
import { 根据附魔ID获取附魔数据 } from '@/数据/附魔/查询'
import { 获取槽位小吃, 获取镶嵌等级文本 } from '../附魔与增益'

interface 结果弹窗类型 {
  open: boolean
  onCancel: () => void
  结果: 全局寻优结果 | undefined
  初始表单值: Record<string, any> | undefined
  最优表单值: Record<string, any> | undefined
  替换前秒伤: number
  替换后秒伤: number
  装分上限?: number
  已搜索候选数: number
  onApply: () => void
}

interface 变更子项 {
  类型名: string
  旧?: string
  新?: string
}

const 大附魔等级文本 = ['无', '普通', '英雄']
const 增益类型: 变更动作['类型'][] = ['药品', '食品', '家园酒品', '阵眼']

const 获取阵眼标题 = (阵眼名称?: string) => {
  const 阵眼 = 获取当前数据().阵眼?.find((项) => 项.阵眼名称 === 阵眼名称)
  return 阵眼?.阵眼标题 || 阵眼名称
}

const 装备条目 = (部位值: any, 部位名: string, 是旧装备: boolean) => {
  const { 装备数据 } = 获取当前数据()
  const 装备 = 部位值?.id ? 装备数据?.[部位名]?.find((a) => a?.id === 部位值?.id) : undefined
  if (!装备) {
    return <div className={`${styles.装备} ${styles.空装备}`}>空</div>
  }
  const 描述 = 获取装备数据描述(装备) || []
  const 名称 = 装备?.装备名称?.replaceAll('·内', '').replaceAll('·外', '')
  return (
    <装备详情容器 装备数据={装备} 当前装备信息={部位值} wrapClassName=''>
      <div className={`${styles.装备} ${是旧装备 ? styles.旧装备 : styles.新装备}`}>
        <ImageComponent
          src={`https://icon.jx3box.com/icon/${装备?.图标ID}.png`}
          fallback={'https://icon.jx3box.com/icon/13.png'}
          className={styles.图标}
        />
        <div className={styles.装备信息}>
          <div
            className={`${styles.名称} ${装备?.装备类型 === 装备类型枚举.橙武 ? styles.橙武名 : ''}`}
          >
            {名称}
          </div>
          <div className={styles.品级}>
            {装备?.装备品级}
            {描述?.length ? ` · ${描述.join(' ')}` : ''}
          </div>
        </div>
      </div>
    </装备详情容器>
  )
}

const 结果弹窗 = (props: 结果弹窗类型) => {
  const {
    open,
    onCancel,
    结果,
    初始表单值,
    最优表单值,
    替换前秒伤,
    替换后秒伤,
    装分上限,
    已搜索候选数,
    onApply,
  } = props

  const 变更列表 = 结果?.变更动作列表 || []
  const 有改进 = 变更列表.length > 0
  const 秒伤差 = 替换后秒伤 - 替换前秒伤
  const 百分比 = 替换前秒伤 > 0 ? ((秒伤差 / 替换前秒伤) * 100).toFixed(2) : ''
  const 符号 = 秒伤差 >= 0 ? '+' : ''

  const 有变更 = (类型: 变更动作['类型'], 部位?: string) =>
    变更列表.some((动作) => 动作.类型 === 类型 && 动作.部位 === 部位)

  const 部位分组列表 = Object.keys(装备位置部位枚举)
    .map((部位索引) => {
      const 部位名: string = 装备位置部位枚举[部位索引]
      const 大附魔键 = 大附魔部位枚举[部位名]
      const 子项: 变更子项[] = []
      if (有变更('附魔', 部位索引)) {
        子项.push({
          类型名: '小附魔',
          旧: 根据附魔ID获取附魔数据(初始表单值?.[部位索引]?.附魔)?.附魔名称,
          新: 根据附魔ID获取附魔数据(最优表单值?.[部位索引]?.附魔)?.附魔名称,
        })
      }
      if (大附魔键 && 有变更('大附魔', 大附魔键)) {
        子项.push({
          类型名: '大附魔',
          旧: 大附魔等级文本[初始表单值?.[大附魔键] || 0],
          新: 大附魔等级文本[最优表单值?.[大附魔键] || 0],
        })
      }
      if (有变更('镶嵌', 部位索引)) {
        子项.push({
          类型名: '镶嵌',
          旧: 获取镶嵌等级文本(初始表单值?.[部位索引]),
          新: 获取镶嵌等级文本(最优表单值?.[部位索引]),
        })
      }
      if (部位名 === '武器' && 有变更('五彩石')) {
        子项.push({ 类型名: '五彩石', 旧: 初始表单值?.五彩石, 新: 最优表单值?.五彩石 })
      }
      return { 部位索引, 部位名, 换装: 有变更('装备', 部位索引), 子项 }
    })
    .filter((分组) => 分组.换装 || 分组.子项.length)

  const 增益子项: 变更子项[] = 变更列表
    .filter((动作) => 增益类型.includes(动作.类型))
    .map((动作) =>
      动作.类型 === '阵眼'
        ? {
            类型名: '阵眼',
            旧: 获取阵眼标题(结果?.替换前增益数据?.阵眼),
            新: 获取阵眼标题(结果?.替换后增益数据?.阵眼),
          }
        : {
            类型名: 动作.部位 as string,
            旧: 获取槽位小吃(结果?.替换前增益数据, 动作.部位 as string).join('、'),
            新: 获取槽位小吃(结果?.替换后增益数据, 动作.部位 as string).join('、'),
          },
    )

  const 渲染子项列表 = (子项: 变更子项[]) => (
    <div className={styles.子项列表}>
      {子项.map((项) => (
        <span className={styles.子项} key={项.类型名}>
          <span className={styles.子项类型}>{项.类型名}</span>
          <span className={styles.旧值}>{项.旧 || '无'}</span>
          <ArrowRightOutlined className={styles.箭头} />
          <span className={styles.新值}>{项.新 || '无'}</span>
        </span>
      ))}
    </div>
  )

  return (
    <Modal
      title='全局寻优结果'
      open={open}
      onCancel={onCancel}
      onOk={onApply}
      okText='一键应用'
      width={760}
      cancelText={有改进 ? '关闭' : '知道了'}
      okButtonProps={有改进 ? undefined : { style: { display: 'none' } }}
    >
      {有改进 ? (
        <>
          <div className={`${styles.汇总} ${秒伤差 >= 0 ? styles.提升 : styles.下降}`}>
            <div className={styles.秒伤区}>
              <div className={styles.标签}>秒伤</div>
              <div className={styles.秒伤行}>
                <span className={styles.新秒伤}>{替换后秒伤}</span>
                {替换前秒伤 > 0 && (
                  <span className={styles.差值}>
                    {符号}
                    {秒伤差}
                    {百分比 ? ` (${符号}${百分比}%)` : ''}
                  </span>
                )}
              </div>
              <div className={styles.原秒伤}>
                {替换前秒伤 > 0 ? `原 ${替换前秒伤}` : '原配装不满足循环要求，不计算提升率'}
              </div>
            </div>
            <div className={styles.副指标区}>
              <div className={styles.副指标}>
                <div className={styles.标签}>装分{装分上限 ? ` · 上限 ${装分上限}` : ''}</div>
                <div className={styles.副指标值}>
                  <span className={styles.旧值}>{结果?.替换前装分}</span>
                  <ArrowRightOutlined className={styles.箭头} />
                  {结果?.替换后装分}
                </div>
              </div>
              <div className={styles.副指标}>
                <div className={styles.标签}>变更</div>
                <div className={styles.副指标值}>{变更列表.length} 项</div>
              </div>
              <div className={styles.副指标}>
                <div className={styles.标签}>已评估</div>
                <div className={styles.副指标值}>{已搜索候选数 || 0} 个</div>
              </div>
            </div>
          </div>
          <div className={styles.列表区}>
            {部位分组列表.map((分组) => (
              <div className={styles.部位行} key={分组.部位索引}>
                <div className={styles.部位名}>{分组.部位名}</div>
                <div className={styles.变更区}>
                  {分组.换装 ? (
                    <div className={styles.换装}>
                      {装备条目(初始表单值?.[分组.部位索引], 分组.部位名, true)}
                      <ArrowRightOutlined className={styles.箭头} />
                      {装备条目(最优表单值?.[分组.部位索引], 分组.部位名, false)}
                    </div>
                  ) : null}
                  {分组.子项.length ? 渲染子项列表(分组.子项) : null}
                </div>
              </div>
            ))}
            {增益子项.length ? (
              <div className={styles.部位行}>
                <div className={styles.部位名}>增益</div>
                <div className={styles.变更区}>{渲染子项列表(增益子项)}</div>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <Result
          className={styles.空态}
          status='success'
          title='当前配装已是搜索范围内的最优解'
          subTitle={
            <>
              已评估 {已搜索候选数 || 0} 个候选，当前秒伤 {替换前秒伤}
              <div className={styles.空态提示}>
                可尝试增加搜索轮数、减少锁定部位，或调整装备选择范围后再搜索
              </div>
            </>
          }
        />
      )}
    </Modal>
  )
}

export default 结果弹窗
