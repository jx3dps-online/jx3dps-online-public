import 心法数据 from '../../src/数据/静态数据/心法枚举.json' with { type: 'json' }
import Boss数据 from './data.json' with { type: 'json' }
import fs from 'fs'


const 获取对应Boss全心法数据 = async () => {
  let 心法统计 = {}
  Boss数据?.data?.forEach((data, ) => {
    const 团队列表数据 = data?.teammate
    if (团队列表数据) {
      const 团队成员列表 = 团队列表数据?.split(';')
      if (团队成员列表?.length) {
        团队成员列表?.forEach((成员) => {
          const 心法ID = 成员?.split(',')?.[1]
          if (心法ID) {
            const 实际心法数据 = 心法数据?.[心法ID]
            if (实际心法数据)  {
              if (心法统计?.[实际心法数据?.name]) {
                心法统计[实际心法数据?.name] = 心法统计[实际心法数据?.name] + 1
              } else {
                心法统计[实际心法数据?.name] = 1
              }
            } else {
              console.log("未匹配", 心法ID)
            }
          }
        })
      }
    }
  })
  Object.keys(心法数据)?.forEach((key) => {
    const name = 心法数据[key]?.name
    if (!name?.includes('移动端')) {
      if (!心法统计[name]) {
        console.log('心法统计',心法统计)
        心法统计[name] = 0
      }
    }
  })
  导出成文件(心法统计)
}

function 导出成文件(心法统计) {
  // 判断文件夹是否存在
  if (!fs.existsSync('百强Boss心法统计')) {
    fs.mkdirSync('百强Boss心法统计', { recursive: true });
  }

  const 最终数据 = Object.keys(心法统计).map((key) => {
    return {
      name: key,
      value: 心法统计[key]
    }
  })

  const headers = Object.keys(最终数据[0]).join(',') + '\n';

  const rows = 最终数据.map(item => 
    Object.values(item)
      .map(val => `"${String(val).replace(/"/g, '""')}"`) // 处理引号
      .join(',')
  ).join('\n');

  const csvContent = headers + rows;

  
  const 文件名称 = `百强Boss心法统计/index.csv`
  
  // console.info(`${部位}文件已创建`)
  fs.writeFile(文件名称, csvContent, err => {
    if (err) {
      console.info('err',err)
    }
  })

  console.info(`Boss数据导入成功`)
}

async function  获取百强Boss心法统计数据() {
  await 获取对应Boss全心法数据()
}

获取百强Boss心法统计数据()

