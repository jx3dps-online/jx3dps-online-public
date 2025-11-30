// import 心法数据 from '../../src/数据/静态数据/心法枚举.json' assert { type: 'json' }
import axios from 'axios'
import fs from 'fs'
import { transformToBoxData } from './util.mjs'
import { readFileSync } from 'fs'

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const 心法数据 = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../src/数据/静态数据/心法枚举.json'), 'utf-8')
)

const 获取有效心法ID = Object.keys(心法数据)
  .filter((key) => {
    return !心法数据[key].name?.includes('移动端')
  })
  .filter((key) => {
    return ![
      '云裳心经',
      '离经易道',
      '补天诀',
      '灵素',
      '相知',
      '铁牢律',
      '洗髓经',
      '明尊琉璃体',
      '铁骨衣',
    ]?.includes(心法数据[key].name)
  })
  ?.map((key) => {
    return {
      id: key,
      name: 心法数据[key].name,
    }
  })

const teamApi = axios.create({
  baseURL: 'https://team.jx3box.com', // 设置 baseURL 为您的服务器地址
  timeout: 5000, // 设置超时时间
  headers: { 'Content-Type': 'application/json' },
})

export const 获取百强数据api = (params) =>
  teamApi.get(`/api/team/achieve/${params?.bossId}/mount/top`, { params })

// 获取百强统计数据
const Boss列表 = [
  { id: '12372', name: '巴图仁钦' },
  { id: '12373', name: '竭勒' },
  { id: '12374', name: '图南子' },
  { id: '12375', name: '叶葵' },
  { id: '12376', name: '尹雪尘' },
]

let Boss箱形图统计 = {}

const 获取对应Boss全心法数据 = async (Boss信息) => {
  const { id: bossId, name: BossName } = Boss信息
  if (bossId) {
    let Boss统计 = []
    const 参数列表 = []
    获取有效心法ID?.forEach(async (心法) => {
      try {
        const params = {
          mount: 心法?.id,
          limit: 200,
          order_by: 'dps',
          belong_team: 1,
          bossId: bossId,
        }
        参数列表.push(params)
        console.info(`----------${BossName} ${心法?.name} 获取成功----------`)
      } catch (e) {
        console.log('e', e)
        console.info(`----------${BossName} ${心法?.name} 导入失败失败失败失败失败----------`)
      }
    })
    const res = await Promise.all(参数列表?.map((params) => 获取百强数据api(params)))
    res?.forEach((data, index) => {
      const 该心法该Boss数据列表 = (data?.data?.data || [])?.map((a) => a?.dps)?.filter((a) => a)
      Boss统计.push({
        心法名称: 获取有效心法ID?.[index]?.name,
        心法统计: 该心法该Boss数据列表,
      })
    })
    Boss箱形图统计[`百强榜-${Boss信息?.name}`] = transformToBoxData([...Boss统计])
    导出成文件(Boss信息, Boss统计)
  }
}

function 导出成文件(Boss信息, Boss统计) {
  // 判断文件夹是否存在
  if (!fs.existsSync('百强数据')) {
    fs.mkdirSync('百强数据', { recursive: true })
  }

  const 文件名称 = `百强数据/${Boss信息?.name}.json`
  const 生成文本 = JSON.stringify(Boss统计)
  // console.info(`${部位}文件已创建`)
  fs.writeFile(文件名称, `${生成文本}`, (err) => {
    if (err) {
      console.info('err', err)
    }
  })

  console.info(`【${Boss信息?.name}】Boss数据导入成功`)
}

function 导出成箱型图数据() {
  const 文件名称 = `百强数据/箱型图数据.json`
  console.log('Boss箱形图统计', Boss箱形图统计)
  const 生成文本 = JSON.stringify(Boss箱形图统计)
  // console.info(`${部位}文件已创建`)
  fs.writeFile(文件名称, `${生成文本}`, (err) => {
    if (err) {
      console.info('err', err)
    }
  })
}

async function 获取百战数据() {
  Boss箱形图统计 = {}
  for (let i = 0; i < Boss列表.length; i++) {
    console.info(`----------${Boss列表[i]?.name}数据 --- 开始导入----------`)
    await 获取对应Boss全心法数据(Boss列表[i])
  }
  await 导出成箱型图数据()
}

获取百战数据()
