import type { 桌宠配置 as 桌宠配置类型 } from '@/桌宠/interface'
import 分山劲桌宠配置 from '../分山劲/配置'

// 分山劲_悟 桌宠与旗舰端分山劲保持同步（小狮子一套资源），仅名称区分
const 桌宠配置: 桌宠配置类型 = {
  ...分山劲桌宠配置,
  名称: '分山劲_悟',
}

export default 桌宠配置
