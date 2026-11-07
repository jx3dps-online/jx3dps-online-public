import { forwardRef, type CSSProperties } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { use心法数据 } from '@/心法模块/心法上下文'
import 登阶进度条 from '../../心法展示/进度条'
import { 获取文案 } from '../../文案'
import type { 分享数据, 分享配置 } from './数据'
import 装备对比 from './装备对比'
import 样式 from './分享画面.module.less'

export default forwardRef<HTMLElement, { 数据: 分享数据; 配置: 分享配置; 背景失败: () => void }>(
  function 分享画面({ 数据, 配置, 背景失败 }, ref) {
    const { 系统配置 } = use心法数据()
    const 文案 = 获取文案(数据.心法)
    const 百分比 = 数据.已达成 ? '100' : Math.min(99.9, 数据.完成度).toFixed(1)
    return (
      <article
        ref={ref}
        className={样式.画面}
        style={{ '--分享蒙层': 配置.蒙层 / 100 } as CSSProperties}
      >
        {配置.背景 && (
          <img
            className={样式.背景}
            data-share-background
            src={配置.背景}
            style={{ objectPosition: `${配置.背景横向位置}% 34%` }}
            alt=''
            onError={背景失败}
          />
        )}
        <div className={样式.蒙层} />
        <div className={样式.边框} />
        <header className={样式.页眉}>
          <div>
            <img className={样式.心法图标} src={系统配置.心法图标} alt={数据.心法} />
            <strong>{数据.踏天中 ? 文案['主卡.标题.踏天'] : 文案['登阶.名称']}</strong>
          </div>
          <small>
            {配置.显示署名 && 配置.署名 ? `${配置.署名} · ` : ''}
            {数据.日期}
          </small>
        </header>
        <section className={样式.主视觉}>
          <div className={样式.进度}>
            <登阶进度条
              心法={数据.心法}
              百分比={数据.完成度}
              是否达成={数据.已达成}
              完成数={数据.完成数}
              总数={数据.总数}
            />
          </div>
          <div className={样式.目标}>
            <span>{文案['分享.目标标签']}</span>
            <h2>{数据.目标.名称}</h2>
          </div>
          <div className={样式.完成度}>
            <strong>
              {百分比}
              <small>%</small>
            </strong>
            <span>{文案['分享.完成度']}</span>
          </div>
        </section>
        <装备对比 数据={数据} 养成={配置.养成} />
        {配置.属性 && (
          <section className={样式.属性}>
            <p>{文案['分享.属性口径']}</p>
            {数据.当前属性 && 数据.目标属性 ? (
              <div className={样式.属性列表}>
                {数据.当前属性.map((项, i) => (
                  <div key={项.名称}>
                    <small>{项.名称}</small>
                    <span>{项.值}</span>
                    <em>→ {数据.目标属性![i].值}</em>
                  </div>
                ))}
              </div>
            ) : (
              <p>{文案['分享.属性不可用']}</p>
            )}
          </section>
        )}
        <footer className={样式.页脚}>
          <p>{配置.寄语}</p>
          <div>
            <span>
              {文案['分享.落款']}
              <small>{文案['分享.落款说明']}</small>
            </span>
            {配置.二维码 && (
              <QRCodeSVG
                value='https://jx3box.com/bps/79885'
                size={54}
                marginSize={2}
                fgColor='#1b2330'
                bgColor='#e7ecf3'
              />
            )}
          </div>
        </footer>
      </article>
    )
  },
)
