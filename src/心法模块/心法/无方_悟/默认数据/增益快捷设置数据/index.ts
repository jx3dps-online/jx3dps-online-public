import 无方增益快捷设置数据 from '../../../无方/默认数据/增益快捷设置数据'
import 清空增益 from './清空增益.json'
import 副本不吃药 from './副本不吃药.json'
import 副本常用 from './副本常用.json'
import 开荒拉满 from './开荒拉满.json'

const 增益快捷设置数据 = [清空增益, 副本不吃药, 副本常用, 开荒拉满].map((预设) => {
  const 无方预设 = 无方增益快捷设置数据.find((项) => 项.快捷名称 === 预设.快捷名称)!
  return { ...预设, 阵眼: 无方预设.阵眼, 小吃: 无方预设.小吃 }
})

export default 增益快捷设置数据
