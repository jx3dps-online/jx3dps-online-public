import 目标监控 from '../目标监控'
import { 攻略容器, 奇穴展示 } from '../../../components'
import 武学助手循环 from '@/心法模块/心法/无方/计算循环/武学助手.json'
import 无方攻略排版 from '../统一样式'
import 推荐配装 from '../推荐配装/展示'
import styles from './index.module.less'

export default function 武学助手攻略() {
  return (
    <攻略容器 标题='无方 · 武学助手攻略' 模式='计算结果'>
      <无方攻略排版>
        <blockquote>
          <p>
            来源：
            <a href='https://docs.qq.com/aio/DT3NraHdFRGFVYVZM' target='_blank'>
              无方PVE绿皮书
            </a>
          </p>
          <strong>作者：长倦</strong>
        </blockquote>
        <p>最近更新：2026-10-29</p>
        <h2>奇穴</h2>
        <奇穴展示 奇穴={武学助手循环.奇穴} />

        <h2>注意事项</h2>
        <p>一键选择奇穴秘籍后：</p>
        <ul>
          <li>
            将川乌2%伤害改为
            <strong>
              <span className={styles.回蓝提醒}>川乌回蓝</span>
            </strong>
            ！
          </li>
          <li>将银光2%伤害改为银光超过10尺默认对自己释放。</li>
        </ul>

        <h2>目标监控</h2>
        <目标监控 />

        <h2>配装指导</h2>
        <推荐配装 />
      </无方攻略排版>
    </攻略容器>
  )
}
