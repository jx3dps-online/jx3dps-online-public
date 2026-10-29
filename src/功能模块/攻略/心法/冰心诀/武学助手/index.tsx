import { useRef } from 'react'
import { 攻略容器, 奇穴展示, 配装 } from '../../../components'
import 武学助手循环 from '@/心法模块/心法/冰心诀/计算循环/武学助手.json'
import 十人配装 from '../紫武盈袖/948加速10人.json'
import 普通配装 from '../紫武盈袖/948加速25人普通.json'
import 高加速配装 from '../紫武盈袖/1521加速25人普通.json'
import styles from '../紫武盈袖/index.module.less'

export default function 武学助手攻略() {
  const 正文 = useRef<HTMLElement>(null)

  return (
    <攻略容器 标题='冰心诀 · 武学助手攻略' 模式='计算结果'>
      <article className={styles.攻略} ref={正文}>
        <details className={styles.导航} open>
          <summary>章节导航</summary>
          <nav aria-label='冰心诀攻略章节'>
            {['奇穴', '注意事项', '配装及属性分析', '推荐配装'].map((标题, 序号) => (
              <a
                key={标题}
                href={`#bingxin-section-${序号 + 1}`}
                onClick={(事件) => {
                  事件.preventDefault()
                  const 章节 = 正文.current!.querySelector<HTMLElement>(
                    `#bingxin-section-${序号 + 1}`,
                  )!
                  章节.scrollIntoView({ block: 'start', behavior: 'auto' })
                  章节.focus({ preventScroll: true })
                }}
              >
                {标题}
              </a>
            ))}
          </nav>
        </details>
        <div className={styles.说明}>
          <p>作者：长倦</p>
          <p>最近更新：2026/10/29</p>
        </div>

        <h2 id='bingxin-section-1' tabIndex={-1}>
          奇穴
        </h2>
        <div className={styles.奇穴}>
          <奇穴展示 奇穴={武学助手循环.奇穴} />
        </div>

        <h2 id='bingxin-section-2' tabIndex={-1}>
          注意事项
        </h2>
        <p>待补充</p>

        <h2 id='bingxin-section-3' tabIndex={-1}>
          配装及属性分析
        </h2>
        <h3>属性收益（精简不适用）</h3>
        <p>攻击＞破防 ≈ 会心＞无双＞根骨＞会效</p>
        <h3>五彩石</h3>
        <p>万金油 会破攻</p>
        <p>YX毕业可选 会心/破防 会效 攻击</p>
        <h3>附魔</h3>
        <p>头、脚、戒指：攻击 （不推荐加速附魔）</p>
        <p>衣服、腰带：无双（活动兑换）</p>
        <p>手、裤：破防/会心</p>
        <p>暗器：破防/加速</p>
        <p>武器：攻击/龙血</p>
        <h3>单体</h3>
        <p>2根骨2攻击，根骨/加速大酒，创意食物-气血+攻击，香水破防/会心</p>
        <h3>推荐阵眼</h3>
        <p>T1 莫问 段氏 田螺</p>
        <p>T2 万灵 自己开阵</p>

        <h2 id='bingxin-section-4' tabIndex={-1}>
          推荐配装
        </h2>
        <h3>948加速 · 10人</h3>
        <配装 名称='武学助手 · 948加速 · 10人' 配装数据={十人配装} 视图='配装页面' />
        <h3>948加速 · 25人PT</h3>
        <配装 名称='武学助手 · 948加速 · 25人PT' 配装数据={普通配装} 视图='配装页面' />
        <h3>1521加速 · 25人PT</h3>
        <配装 名称='武学助手 · 1521加速 · 25人PT' 配装数据={高加速配装} 视图='配装页面' />
      </article>
    </攻略容器>
  )
}
