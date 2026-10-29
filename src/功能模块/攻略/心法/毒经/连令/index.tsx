import { 攻略容器, 图片, 宏, 标签 } from '../../../components'
import { 连令宏列表 } from './宏'
import 样式 from './index.module.less'

/**
 * 毒经「连缘」两段宏 · 紫武通用部分（暗影千机）
 * 原文：https://www.jx3box.com/macro/107317
 * 作者：莴苣
 * 本攻略只收录原文「通用」部分，大橙武、目标循环与常见问题见原文。
 */

const 宏图标 = {
  爆发宏: 'https://icon.jx3box.com/icon/21980.png',
  循环宏: 'https://icon.jx3box.com/icon/21981.png',
  凤凰蛊: 'https://icon.jx3box.com/icon/2782.png',
}

const 切宏示意图 = 'https://cdn.jx3box.com/upload/post/2026/10/12/125668_2652506.png'

export default function 连令攻略() {
  return (
    <攻略容器 标题='「连缘」两段宏（紫武）' 模式='计算结果'>
      <div className={样式.正文}>
        <div className={样式.来源}>
          <标签 左='作者' 右='莴苣' />
        </div>

        <p className={样式.提示}>
          理论可达连缘循环 100% 理论 DPS，比武学助手高 8%（含长按连放损失）。
        </p>

        <h3>准备</h3>
        <ul>
          <li>
            <b>奇穴 &amp; 秘籍</b>：武学指导「一键设置」即可。
          </li>
          <li>
            <b>起手开怪前</b>：先挂凤凰
            <img className={样式.技能图标} src={宏图标.凤凰蛊} alt='凤凰蛊' />
          </li>
        </ul>

        <h3>加速推荐</h3>
        <table className={样式.表格}>
          <thead>
            <tr>
              <th>延迟</th>
              <th>加速</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0 ~ 45 ms</td>
              <td>
                <b>一段加速</b> <span className={样式.次要}>(10)</span>
              </td>
            </tr>
            <tr>
              <td>45+ ms</td>
              <td>
                <b>二段加速</b> <span className={样式.次要}>(445)</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p className={样式.次要}>
          不同加速、延迟均可使用，但多数情况只仍推荐一/二段加速。如有部分蛇影晚放的情况，尝试将「循环宏」更换为「连缘早千循环宏」。
        </p>

        <h3>两段宏</h3>
        <div className={样式.宏组}>
          <span className={样式.宏标签}>
            <img src={宏图标.爆发宏} alt='' />
            爆发宏
          </span>
          +
          <span className={`${样式.宏标签} ${样式.循环}`}>
            <img src={宏图标.循环宏} alt='' />
            循环宏
          </span>
        </div>
        <宏 宏列表={连令宏列表} />

        <h3>按宏流程</h3>
        <div className={样式.步骤}>
          <div className={样式.步骤行}>
            <span className={样式.时机}>起手</span>
            <span>倒数 2 转 1 预读蝎心</span>
          </div>
          <div className={样式.步骤行}>
            <span className={样式.时机}>灵蛇引已转好</span>
            <span>
              <b>一直按</b> <span className={样式.宏名}>爆发宏</span>
            </span>
          </div>
          <div className={样式.步骤行}>
            <span className={样式.时机}>连缘开始读条</span>
            <span>
              改按 <span className={`${样式.宏名} ${样式.循环}`}>循环宏</span>
            </span>
          </div>
          <div className={样式.步骤行}>
            <span className={样式.时机}>灵蛇引即将转好</span>
            <span>
              改按 <span className={样式.宏名}>爆发宏</span>，回到第 2 步
            </span>
          </div>
        </div>
        <p className={样式.次要}>每 3 分钟需在非引魂阶段手动补一次凤凰。</p>

        <h4>示意图</h4>
        <图片 src={切宏示意图} alt='爆发宏 / 循环宏切宏示意图' width={860} />

        <div className={样式.须知}>
          <div className={样式.须知标题}>按宏须知</div>
          <ol>
            <li>
              <b>一直按到切宏节点</b>
              <span>例如爆发宏要一直按到连缘开始读条；别按一下就切，也别等连缘读完很久才切。</span>
            </li>
            <li>
              <b>不要错过切宏节点</b>
              <span>
                <i className={样式.错}>×</i>灵蛇引转好了还在按循环宏　<i className={样式.错}>×</i>
                连缘打完了还在按爆发宏
                <br />
                照说明按，不要自由发挥。
              </span>
            </li>
            <li>
              <b>不要两个宏一起按</b>
              <span>两段宏轮流切换，同一时间只按一个。</span>
            </li>
            <li>
              <b>大部分时间都在打蝎心？</b>
              <span>正常，循环本身就是如此。</span>
            </li>
          </ol>
        </div>
      </div>
    </攻略容器>
  )
}
