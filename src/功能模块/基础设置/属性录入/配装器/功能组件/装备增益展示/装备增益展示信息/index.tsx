import React, { useMemo } from 'react'
import './index.css'

function 装备增益展示信息({ 增益类型 }: { 增益类型: string }) {
  const 增益简写 = useMemo(() => {
    // let newStr = 增益类型
    switch (增益类型) {
      case '套装技能':
      case '冬至套装':
        return 增益类型
      case '特效_38944':
        return '鞋子破防'
      case '特效_38934':
        return '适应之力'
      case '特效_38946':
        return '项链破防'
      case '特效_38950':
        return '暗器特效'
      case '特效_46727':
        return '暗器攻击'
      case '特效_38945':
        return '项链会心'
      case '特效_38939':
        return '鞋子会心'
      // case '特效_40788':
      // case '特效_40790':
      // case '特效_40791':
      // case '特效_40802':
      // case '特效_40803':
      // case '特效_42767':
      //   return '副本黄字'
      case '大橙武特效':
        return '大橙武'
      case '小橙武特效':
        return '小橙武'
      case '切糕会心':
        return '切糕会心'
      case '切糕无双':
        return '切糕无双'
      case '切糕会心_英雄':
        return '切糕会心'
      case '切糕无双_英雄':
        return '切糕无双'
      case '套装会心会效':
      case '常驻套装会心会效':
        return '套装双会'
      case '风特效腰坠':
        return '特效腰坠'
      case '水特效武器':
        return '特效武器'
      case '龙门飞剑武器':
        return '龙门飞剑'
      default:
        return ''
    }
  }, [增益类型])
  return 增益简写 ? <div className='zhuangbei-zengyi-item'>{增益简写}</div> : null
}

export default 装备增益展示信息
