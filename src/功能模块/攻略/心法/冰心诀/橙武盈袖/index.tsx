import { useRef } from 'react'
import { Typography } from 'antd'
import { 攻略容器, 奇穴展示, 连招, 配装 } from '../../../components'
import 盈袖循环 from '@/心法模块/心法/冰心诀/计算循环/CW盈袖.json'
import 循环序列 from './循环序列.json'
import 十人配装 from './10人.json'
import 普通配装 from './948加速25人普通.json'
import 高加速配装 from './1521加速25人普通.json'
import styles from '../紫武盈袖/index.module.less'

const 章节 = ['奇穴', '芳姿', '加速', '流派', '手动细节', '循环图', '配装及属性分析', '推荐配装']

function 循环展示({ 序列 }: { 序列: string[] }) {
  return (
    <div className={styles.循环}>
      <连招 心法='冰心诀' 技能序列={序列} 显示名称 />
      <details className={styles.序列}>
        <summary>导入序列</summary>
        <Typography.Paragraph copyable={{ text: 序列.join(',') }}>
          {序列.join(',')}
        </Typography.Paragraph>
      </details>
    </div>
  )
}

export default function 橙武盈袖攻略() {
  const 正文 = useRef<HTMLElement>(null)

  return (
    <攻略容器 标题='冰心诀 · 橙武盈袖攻略' 模式='计算结果'>
      <article className={styles.攻略} ref={正文}>
        <details className={styles.导航} open>
          <summary>章节导航</summary>
          <nav aria-label='橙武盈袖攻略章节'>
            {章节.map((标题, 序号) => (
              <a
                key={标题}
                href={`#cw-yingxiu-section-${序号 + 1}`}
                onClick={(事件) => {
                  事件.preventDefault()
                  const 目标 = 正文.current!.querySelector<HTMLElement>(
                    `#cw-yingxiu-section-${序号 + 1}`,
                  )!
                  目标.scrollIntoView({ block: 'start', behavior: 'auto' })
                  目标.focus({ preventScroll: true })
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
        <h2 id='cw-yingxiu-section-1' tabIndex={-1}>
          奇穴
        </h2>
        <div className={styles.奇穴}>
          <奇穴展示 奇穴={盈袖循环.奇穴} />
        </div>
        <h2 id='cw-yingxiu-section-2' tabIndex={-1}>
          芳姿
        </h2>
        <p>由于新赛季破招的删除，攻击的收益大大提高，冰心繁音内的爆发质量也得到了很大的提升。</p>
        <p>
          基于此，对于大部分情况，芳姿的分配都应该优先给繁音，即，对于木桩而言，较优的思路应该是每次3个芳姿都给繁音，我们将其定义为30，繁音内3，繁音外0。
        </p>
        <p>
          而对于实战而言，由于有无敌，转阶段，点名等情况出现，如果无脑把芳姿留给繁音，就会有溢出。因此需要根据BOSS的情况，有选择的在繁音外使用芳姿，通常为31。下一轮繁音会根据不同BOSS的时间轴有3个或2个芳姿，我们打30或者20，然后继续回归繁音给芳姿，直到战斗时间内开不出繁音，把所有芳姿全都交掉。
        </p>
        <p>
          我们将冰心的循环分为繁音内外两个部分，其中繁音外又分为流玉和常规。接下来我们将介绍不同芳姿下这些循环的较优解。
        </p>
        <p style={{ color: 'red' }}>
          在10.29改动了部分系数后，芳姿的分配更为灵活，303030和312121的芳姿分配，理论DPS差距在0.3%以内，因此更加需要实战的理解和排轴，以下30循环仅供参考。
        </p>
        <h2 id='cw-yingxiu-section-3' tabIndex={-1}>
          加速
        </h2>
        <p>
          在YX毕业前，948明显优于1521，YX黄字毕业后，两者差距不大，YX装备堆什么加速可以根据手感、延迟和装备掉落来决定
        </p>
        <h2 id='cw-yingxiu-section-4' tabIndex={-1}>
          流派
        </h2>
        <p>由于朝露削弱后即使CW爆发也不如盈袖，因此不推荐朝露。</p>
        <h2 id='cw-yingxiu-section-5' tabIndex={-1}>
          手动细节
        </h2>
        <h3>起手</h3>
        <p>起手有3个思路</p>
        <h4>直接繁音</h4>
        <p>繁音和CW一起开，正常打紫武的轴，打破玳破气，3层气吞，不卡满堂，快速进入爆发。</p>
        <h4>垫1GCD</h4>
        <p>CW剑破 繁音正常打 破玳破，3层气吞，不卡满堂，考虑实战“人”的因素下的快速进入爆发</p>
        <h4>卡满堂</h4>
        <p>CW破气玳 繁音正常打 破，3层气吞，卡满堂，推迟进入爆发。</p>
        <p>可以根据实战BOSS和团队情况来决定</p>
        <h3>战斗中CW</h3>
        <h4>卡满堂</h4>
        <p>CW破气玳 繁音正常打 破，3层气吞，卡满堂</p>
        <h3>填充循环</h3>
        <p>
          填充循环依然是延迟高敏感性，以下仅供参考，我也看到有其他的填充的打法，DPS差距与我在0.3%以内几乎不计。
        </p>
        <p>
          繁音外剑影玳之前与紫武盈袖完全一致，打完剑破江破影玳后，接两个江破气玳，然后直接开CW破气玳，玳读条结束繁音CD就好了。
        </p>
        <h2 id='cw-yingxiu-section-6' tabIndex={-1}>
          循环图
        </h2>
        <循环展示 序列={循环序列.完整循环} />

        <h2 id='cw-yingxiu-section-7' tabIndex={-1}>
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

        <h2 id='cw-yingxiu-section-8' tabIndex={-1}>
          推荐配装
        </h2>
        <h3>10人</h3>
        <配装 名称='橙武盈袖 · 10人' 配装数据={十人配装} 视图='配装页面' />
        <h3>948加速 · 25人PT</h3>
        <配装 名称='橙武盈袖 · 948加速 · 25人PT' 配装数据={普通配装} 视图='配装页面' />
        <h3>1521加速 · 25人PT</h3>
        <配装 名称='橙武盈袖 · 1521加速 · 25人PT' 配装数据={高加速配装} 视图='配装页面' />
      </article>
    </攻略容器>
  )
}
