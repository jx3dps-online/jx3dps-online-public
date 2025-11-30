import {map as 数据源} from './liaoli.mjs'
import { attrMap } from './attrMap.mjs'
import { attrSingleName } from '../importLocalEnchants/attrMap.mjs'
import fs from 'fs'

const 生成的名称 = '创意料理·盛'
// 生成id和附魔名称的转换枚举
async function 获取全部创意料理() {  
  let 数据结果 = []
  const 循环数据 = 数据源?.attributes || []
  const 名称数据 = 数据源?.buff_name || []
  循环数据?.forEach((附魔数据, 索引) => {
    const 对应的名字 = 名称数据[索引]
    if (对应的名字 === 生成的名称) {
      let 减少属性信息 = {}
      let 增加属性信息 = {}
      Object.keys(附魔数据)?.forEach((属性) => {
        const 属性名称索引 = attrSingleName[属性]
        const 值 = 附魔数据[属性]
        const 属性实际枚举映射 = attrMap[属性]
        if (值 >0) {
          增加属性信息.名称 = 属性名称索引
          增加属性信息.属性 = 属性实际枚举映射
          增加属性信息.值 = 值
        } else {
          减少属性信息.名称 = 属性名称索引
          减少属性信息.属性 = 属性实际枚举映射
          减少属性信息.值 = 值
        }
      })
      const 创意料理数据 = {
        小吃名称: `创意料理（-${减少属性信息?.名称}+${增加属性信息?.名称}）`,
        小吃部位: `小吃类型枚举.家园菜品`,
        小吃品级: '紫',
        图标: 'https://icon.jx3box.com/icon/549.png',
        增益集合: [
          { 属性: 增加属性信息?.属性, 值: 增加属性信息?.值 },
          { 属性: 减少属性信息?.属性, 值: 减少属性信息?.值  },
        ],
      } 
      数据结果.push(创意料理数据)
    }
  })
  导出成文件(数据结果)
}


function 导出成文件(数据) {
  // 判断文件夹是否存在
  if (!fs.existsSync('导出创意料理')) {
    fs.mkdirSync('导出创意料理', { recursive: true });
  }

  let 创意料理 = [...数据]
  创意料理.sort((a, b) => {
    // 判断是否包含攻击属性
    const aHasAttack = a.增益集合.some(item => 
      item.属性?.includes("攻击")
    )
    const bHasAttack = b.增益集合.some(item => 
      item.属性?.includes("攻击")
    )

    // 优先级1：有攻击属性的排在前面
    if (aHasAttack && !bHasAttack) return -1
    if (!aHasAttack && bHasAttack) return 1

    // 优先级2：都有攻击属性时比较攻击类型
    if (aHasAttack && bHasAttack) {
      const aHasInner = a.增益集合.some(item => item.属性?.includes("属性类型.内功基础攻击"))
      const bHasInner = b.增益集合.some(item => item.属性?.includes("属性类型.内功基础攻击"))
      
      if (aHasInner && !bHasInner) return -1  // 内功优先
      if (!aHasInner && bHasInner) return 1   // 内功优先
    }

    return 0
  })

  const 文件名称 = `导出创意料理/index.ts`
  const 生成文本 = JSON.stringify(创意料理)?.replaceAll(`"`,'')
  .replaceAll(`小吃名称:`,`小吃名称:"`)
  .replaceAll(`,小吃部位:`,`",小吃部位:`)
  .replaceAll(`,小吃品级:`,`,小吃品级:"`)
  .replaceAll(`,图标:`,`",图标:"`)
  .replaceAll(`,增益集合`,`",增益集合`)
  // console.info(`${部位}文件已创建`)
  fs.writeFile(文件名称, `
import { 属性类型 } from '@/@types/属性'

const 创意料理 = ${生成文本}
export default 创意料理
  `, err => {
    if (err) {
      console.info('err',err)
    }
  })
  console.info(`创意料理文件导入成功`)
}

async function  获取装备数据() {
  console.info(`----------开始导入创意料理----------`)
  await 获取全部创意料理()
  console.info(`----------附魔导入结束----------`)
}

获取装备数据()



