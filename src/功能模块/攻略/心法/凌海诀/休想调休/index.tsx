import { 攻略容器, 标签, 图片, 宏 } from '../../../components'
import 样式 from '../统一样式.module.less'

/**
 * 由「攻略编辑器」生成 · 2026/10/27 23:03:28
 * 攻略 key：凌海诀/休想调休
 * 由「攻略编辑器」生成，直接改这里会被下次保存覆盖。
 * 编辑方案存在仓库外的 攻略编辑器/方案/ 下，不进本仓库。
 */

const 宏1 = [
  '/cast nobuff:物化天行 振翅图南',
  '/cast bufftime:梦悠<7 浮游天地',
  '/cast 物化天行',
  '/cast buff:物化天行 逐波灵游',
  '/cast buff:梦悠 海运南冥',
  '/cast buff:风驰 击水三千',
  '/cast 永远爱你',
].join('\n')

const 宏2 = [
  '/cast 物化天行',
  '/cast bufftime:游仙>13 振翅图南',
  '/cast skill_energy:溟海御波<2 海运南冥',
  '/cast buff:物化天行 溟海御波',
  '/cast bufftime:游仙<12 击水三千',
].join('\n')

const 宏3 = [
  '/cast nobuff:游仙 振翅图南',
  '/cast bufftime:游仙>9|nobuff:游仙 木落雁归',
  '/cast buff:清源 逐波灵游',
  '/cast nobuff:清源 海运南冥',
  '/cast 击水三千',
  '/cast nobuff:清源 浮游天地',
].join('\n')

export default function 攻略() {
  return (
    <攻略容器 标题='【苍生猪食】1段加速：青冥驾鸾一键宏' 模式='计算结果'>
      <div className={样式.正文}>
        <div className={样式.来源}>
          <标签 左='作者' 右='小鹿辞' />
          <标签 左='循环' 右='休想调休（紫武）·小鹿辞' />
        </div>

        <p className={样式.提示}>循环评价：简单好上手适合萌新；木桩数值最高，但实战上限稍逊。</p>

        <p className={样式.提示}>
          <b>
            <mark>加速要求：一段加速。（推荐喝家园酒）</mark>
          </b>
        </p>

        <p className={样式.提示}>
          <b>
            <mark>奇穴：</mark>
          </b>
          <br />
          <图片 src='https://cdn.jx3box.com/upload/post/2026/10/13/183604_4208952.png' />
        </p>

        <宏
          宏列表={[
            {
              标题: '起手宏：可用可不用（把永远爱你写进宏的结尾，可以送给你喜欢的蓬莱）',
              内容: 宏1,
            },
            { 标题: '天宏：【翼绝云天】爱挂不挂，别在要丢【振翅图南】之前挂就行', 内容: 宏2 },
            { 标题: '地宏：【翼绝云天】爱挂不挂，别在要丢【振翅图南】之前挂就行', 内容: 宏3 },
          ]}
        />

        <p>
          <br />
          <b>
            <mark>用法：</mark>
          </b>
          <br />
          ①不猴：手打逐波击水浮游，然后按键开启天地主宏。
          <br />
          ②微猴：开打前离远浮游飘着不落地，开打手打：物化逐波，然后按键开启天地主宏。
          <br />
          ③猴：开打前离远浮游飘着不落地，开打先按起手宏直至再次起飞，然后按键开启天地主宏。
          <br />
          （实战中停手记得猛抽击水）
          <br />
          （实战中停手过后再次起手：执行①的操作即可）
          <br />
          <mark>
            <br />
            <br />
            <b>循环：</b>
          </mark>
          <br />
          <br />
          <图片 src='https://cdn.jx3box.com/upload/post/2026/10/23/183604_1260805.png' />
          <br />
          <br />
          <br />
          <b>
            <mark>奇穴讲解：</mark>
          </b>
          <br />
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            【梦悠】风车CD-4s。施展逐波获得梦悠buff：无视50%防御。
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            【抟空】浮游后能额外白漂一掌海运，施展此海运也获得梦悠buff。
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            <span style={{ color: 'rgb(255, 0, 0)' }}>【风驰】</span>
            已有梦悠buff时，再次获得梦悠buff，会在周身引爆一次aoe。
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}> 引爆时</span>
          <span style={{ fontWeight: 'bolder' }}>
            若存在风车，则获得风驰buff：提升全部风车45%伤害，可叠3层（3x45=135%）。
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            {' '}
            （风车消失风驰buff会跟着消失；风驰buff消失风车不会跟着消失。）
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            <span style={{ color: 'rgb(255, 0, 0)' }}>【击浪】</span>
            施展击水会为最新诞生的风车、风驰buff增加3s持续时间，风车持续时间上限10s。
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            {' '}
            （所以不要在风车剩余7s以上用击水，俗称“抽爆”了，亏。）
          </span>
          <br />
          <b>
            【驾鸾】风车充能2层，一层25s：
            <span style={{ color: 'rgb(255, 0, 0)' }}>起手无须暖机，且提供了停手后的爆发。</span>
          </b>
          <br />
          <b>
            {' '}
            施展击水或木落减少风车CD2s：
            <span style={{ color: 'rgb(255, 0, 0)' }}>抬高了常态持续输出。</span>
          </b>
          <br />
          <b>
            【青冥】击水会给当前目标上dot（不能群上dot）：
            <span style={{ color: 'rgb(255, 0, 0)' }}>抬高了常态持续输出。</span>
          </b>
          <br />
          <b>
            {' '}
            溟海海运命中身上有dot的，dot会加快一跳，dot持续时间也会缩短。（海运群到有dot的，群到的都会加快）
          </b>
          <br />
          【清源】+10%无双。溟海逐波取消突进和僵直。施展掌法获得清源buff：下次木落伤害+40%，可叠3层（3x40=120%）。
          <br />
          【驰行】风车存在时掌法伤害+10%。风车持续时间+4s（原本6s，+4=10s），更好续风。
          <br />
          【游仙】施展浮游获得游仙buff：攻击力+20%，浮游、物化状态下的掌法+20%双会。
          <br />
          <br />
          <br />
          <b>
            <mark>循环讲解：</mark>
          </b>
          <br />
          <span style={{ color: 'rgb(61, 69, 77)', fontSize: '18px' }}>
            <span style={{ fontWeight: 'bolder' }}>
              <br />
              起手：
            </span>
          </span>
          <span style={{ color: 'rgb(61, 69, 77)', fontSize: '16px' }}></span>
          <图片 src='https://cdn.jx3box.com/upload/post/2026/10/23/183604_2166867.png' />
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            倒数浮游飘着-开打：风车-物化-逐波-海运x2-击水-风车——接空中部分
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>1.</span>倒数时离远浮游起来不落地。
          <br />
          <span style={{ fontWeight: 'bolder' }}>2.</span>开打直接丢风车。
          <br />
          <span style={{ fontWeight: 'bolder' }}>3.</span>
          物化逐波拿梦悠buff。海运立刻炸掉拿风驰buff。再海运打伤害。
          <br />
          <span style={{ fontWeight: 'bolder' }}>4.</span>击水落地，上青冥dot。
          <br />
          <span style={{ fontWeight: 'bolder' }}>5.</span>
          最后丢第二个风，要先击后风！（若先风后击，就直接抽爆了）
          <br />
          <span style={{ fontSize: '18px' }}>
            <span style={{ fontWeight: 'bolder' }}>循环：</span>
          </span>
          <br />
          <图片 src='https://cdn.jx3box.com/upload/post/2026/10/22/183604_9206508.png' />
          <br />
          <span style={{ fontWeight: 'bolder' }}>空中部分：</span>
          <br />
          <图片 src='https://cdn.jx3box.com/upload/post/2026/10/26/183604_5286045.png' />
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            浮游-物化-（风车）-溟海-海运x2-溟海——接走地部分
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>1.</span>
          上天后，风CD少于3s这波就丢风，大于3s就留着下轮再丢双风。
          <br />
          <span style={{ fontWeight: 'bolder' }}>2.</span>由于没有天行，不必强行打物化5掌，
          <br />
          那么逐波可放到循环中间续梦悠buff，以达到全程梦悠buff，且能不间断地炸出风驰。
          <br />
          比起天行循环，此循环少一个逐波少一个GCD，所以不必上物化二段加速，一段加速即可。
          <br />
          <span style={{ fontWeight: 'bolder' }}>3.</span>为什么顺序是溟海海溟？
          <br />
          ——这个位置的海，能在大多数延迟下接到上轮逐波、和后续逐波的梦悠buff炸出风驰，是最佳位置！
          <br />
          <span style={{ fontWeight: 'bolder' }}>走地部分：</span>
          <br />
          <图片 src='https://cdn.jx3box.com/upload/post/2026/10/26/183604_797450.png' />
          <br />
          <span style={{ fontWeight: 'bolder' }}>
            击水-木落-击水-海运-逐波-击水x3-风车-木落——接空中部分
          </span>
          <br />
          <span style={{ fontWeight: 'bolder' }}>1.</span>
          走地击水为风车续命，为了不抽爆风车要穿插木落海运。
          <br />
          <span style={{ fontWeight: 'bolder' }}>2.</span>
          为了不抽爆，所以新风车要在这轮的所有击水都打完才丢。
          <br />
          <span style={{ fontWeight: 'bolder' }}>3.</span>
          击水只能在游仙buff内打，要让青冥dot吃游仙buff（快照机制）。
          <br />
          ——腰坠：
          <br />
          上天开就行，能对齐团辅更好。
        </p>
      </div>
    </攻略容器>
  )
}
