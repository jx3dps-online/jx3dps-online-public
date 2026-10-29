import type { 宏块数据 } from '../../../components'

export const 两段宏: 宏块数据[] = [
  {
    标题: '起手宏',
    内容: `/cast bufftime:紫伏>16.8 千枝绽蕊
/cast 紫叶沉疴
/cast yaoxing=-2 沾衣未妨
/cast yaoxing=-5 钩吻断肠
/cast last_skill=沾衣未妨 香繁饮露
/cast 商陆缀寒`,
  },
  {
    标题: '循环宏',
    内容: `/cast yaoxing=-5|yaoxing=2&bufftime:紫伏<5 银光照雪
/cast bufftime:紫伏<3 千枝伏藏
/cast yaoxing=1|buff:香繁饮露&yaoxing<5 川乌射罔
/cast 商陆缀寒`,
  },
]
