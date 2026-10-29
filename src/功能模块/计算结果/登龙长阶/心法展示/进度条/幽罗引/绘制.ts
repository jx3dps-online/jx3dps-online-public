import 创建画面, { 获取人物布局 } from './画面结构'
export interface 绘制状态 {
  进度: number
  时间: number
  亮相时间: number
  动态: boolean
  达成: boolean
}
const 旋转坐标 = (映射坐标: number[], 原点: number[], 角度: number, 纵向偏移 = 0) => {
  const 起点 = (角度 * Math.PI) / 180,
    横向差 = 映射坐标[0] - 原点[0],
    纵坐标 = 映射坐标[1] - 原点[1]
  return [
    原点[0] + 横向差 * Math.cos(起点) - 纵坐标 * Math.sin(起点),
    原点[1] + 横向差 * Math.sin(起点) + 纵坐标 * Math.cos(起点) + 纵向偏移,
  ]
}
const 指尖坐标 = [
  [297, 73],
  [290, 90],
  [274, 84],
  [266, 77],
  [255, 68],
]
const 曲线坐标 = (曲线: number[][], 位置比例: number) => {
  const 反向比例 = 1 - 位置比例
  return [0, 1].map(
    (轴) =>
      反向比例 * 反向比例 * 反向比例 * 曲线[0][轴] +
      3 * 反向比例 * 反向比例 * 位置比例 * 曲线[1][轴] +
      3 * 反向比例 * 位置比例 * 位置比例 * 曲线[2][轴] +
      位置比例 * 位置比例 * 位置比例 * 曲线[3][轴],
  )
}
export default function 更新画面(画面: ReturnType<typeof 创建画面>, 状态: 绘制状态) {
  const 进度比例 = 状态.进度 / 100,
    时间 = 状态.时间,
    入场时长 = 时间 - 状态.亮相时间,
    布局 = 获取人物布局(),
    人物轴心 = 布局.映射坐标(布局.人物轴心)
  const 点亮前沿 = 80 + 940 * 进度比例
  const 位置亮度 = (横坐标: number) => Math.max(0, Math.min(1, (点亮前沿 - 横坐标) / 70))
  const 显色比例 = Math.max(0, Math.min(1, (进度比例 - 0.66) / 0.32))
  const 人物亮度 = 显色比例 * 显色比例 * (3 - 2 * 显色比例)
  const 显色起点 = 布局.映射坐标([布局.显色起点, 0])[0],
    显色终点 = 布局.映射坐标([布局.显色终点, 0])[0]
  const 人物位置亮度 = (横坐标: number) => {
    const 混合比例 = Math.max(0, Math.min(1, (横坐标 - 显色起点) / (显色终点 - 显色起点)))
    return 位置亮度(横坐标) * (1 - 混合比例) + 人物亮度 * 混合比例
  }
  const 揭示位置 = [
    0,
    点亮前沿 - 70,
    点亮前沿 - 35,
    点亮前沿,
    显色起点,
    (显色起点 + 显色终点) / 2,
    显色终点,
    1000,
  ]
    .map((横坐标) => Math.max(0, Math.min(1000, 横坐标)))
    .sort((起点, 终点) => 起点 - 终点)
  const 入场强度 =
    状态.达成 && 状态.动态 && 入场时长 >= 0 && 入场时长 < 3.8
      ? Math.sin((Math.PI * 入场时长) / 3.8)
      : 0
  const 手部转角 = 状态.动态 && 进度比例 > 0 ? Math.sin(时间 * 0.65) * 0.35 * 进度比例 : 0
  const 人物转角 = 状态.动态 ? Math.sin(时间 * 0.5 + 0.7) * 0.35 * 人物亮度 - 入场强度 * 0.6 : 0
  const 人物起伏 = 状态.动态 ? Math.sin(时间 * 0.6) * 0.4 * 人物亮度 - 入场强度 * 1.8 : 0
  画面.揭示渐变.setAttribute('x1', String(点亮前沿 - 70))
  画面.揭示渐变.setAttribute('x2', String(点亮前沿))
  画面.人物揭示节点.forEach((节点, 序号) => {
    节点.setAttribute('offset', String(揭示位置[序号] / 1000))
    节点.setAttribute('stop-opacity', String(人物位置亮度(揭示位置[序号])))
  })
  const 波动 = Math.sin(时间 * 0.38) * 3 * 进度比例,
    呼吸 = 0.86 + Math.sin(时间 * 0.8) * 0.14 * 进度比例
  const 后纱轮廓 = `M 55 ${47 + 波动} C 182 13 290 ${28 - 波动} 410 46 S 617 ${75 + 波动} 785 39 L 785 111 C 638 151 521 ${115 - 波动} 398 125 S 170 ${150 + 波动} 55 115 Z`
  const 前纱轮廓 = `M 55 94 C 215 ${47 + 波动} 300 81 423 65 S 626 ${34 - 波动} 785 73 L 785 129 C 630 ${108 + 波动} 536 153 411 137 S 184 ${110 - 波动} 55 145 Z`
  画面.薄纱.setAttribute('opacity', String(0.045 + 0.155 * 进度比例))
  画面.后纱.setAttribute('d', String(后纱轮廓))
  画面.前纱.setAttribute('d', String(前纱轮廓))
  画面.纱纹.setAttribute('d', String(后纱轮廓))
  画面.薄纱轮廓.setAttribute('d', String(后纱轮廓 + ' ' + 前纱轮廓))
  画面.纱缘.setAttribute(
    'd',
    String(
      `M 55 ${47 + 波动} C 182 13 290 ${28 - 波动} 410 46 S 617 ${75 + 波动} 785 39 M 55 145 C 184 ${110 - 波动} 286 121 411 137 S 630 ${108 + 波动} 785 129`,
    ),
  )
  const 掠光进度 = 入场时长 >= 0 && 入场时长 < 3.8 ? 入场时长 / 3.8 : (时间 / 12) % 1
  const 掠光位置 = -100 + 掠光进度 * 1000
  画面.穿行渐变.setAttribute('x1', String(掠光位置 - 80))
  画面.穿行渐变.setAttribute('x2', String(掠光位置 + 100))
  画面.纱光.setAttribute('opacity', String(进度比例 === 1 ? 0.75 : 0))
  画面.虚影层.setAttribute(
    'opacity',
    String(
      (0.03 + (0.12 + 0.03 * 进度比例) * Math.min(1, 进度比例 / 0.24)) *
        (0.92 + Math.sin(时间 * 0.48) * 0.08 * 进度比例),
    ),
  )
  画面.手部虚影.setAttribute(
    'transform',
    String(
      `translate(0 ${状态.动态 ? Math.sin(时间 * 0.4) * 1.2 * 进度比例 : 0}) rotate(${-4 + 手部转角 * 0.5} 110 65)`,
    ),
  )
  画面.青莲.setAttribute('opacity', String(位置亮度(248) * (0.32 + 0.14 * 进度比例) * 呼吸))
  画面.青莲.setAttribute(
    'transform',
    String(
      `translate(248 102) rotate(${Math.sin(时间 * 0.32) * 1.2 * 进度比例}) scale(${0.92 + 0.08 * 进度比例})`,
    ),
  )
  画面.莲瓣.forEach((花瓣, 序号) =>
    花瓣.setAttribute('opacity', String(Math.max(0, Math.min(1, (进度比例 - 序号 * 0.025) * 4)))),
  )
  画面.执轮手.setAttribute('transform', String(`rotate(${手部转角} 214 69)`))
  画面.人物.setAttribute(
    'transform',
    String(`translate(0 ${人物起伏}) rotate(${人物转角} ${人物轴心[0]} ${人物轴心[1]})`),
  )
  画面.手部成品.setAttribute('opacity', String(0.72 + 0.08 * 进度比例))
  画面.人物成品.setAttribute('opacity', String(0.8 + 0.1 * 进度比例))
  画面.人物柔光.setAttribute('opacity', String(人物亮度 * 0.3 + 入场强度 * 0.15))
  const 曲线组: number[][][] = []
  画面.牵丝.forEach((丝线, 序号) => {
    const 起点 = 旋转坐标(指尖坐标[序号], [214, 69], 手部转角),
      终点 = 旋转坐标(布局.映射坐标(布局.连接点[序号]), 人物轴心, 人物转角, 人物起伏)
    const 飘动 = 状态.动态 ? Math.sin(时间 + 序号 * 1.7) * 1.1 * 进度比例 : 0
    const 曲线 = [
      起点,
      [405 + 序号 * 11, 63 + 序号 * 9 + 飘动],
      [612 + 序号 * 10, 49 + 序号 * 8 - 飘动],
      终点,
    ]
    曲线组.push(曲线)
    const 路径 = `M ${起点[0]} ${起点[1]} C ${曲线[1][0]} ${曲线[1][1]} ${曲线[2][0]} ${曲线[2][1]} ${终点[0]} ${终点[1]}`
    for (const 部分 of [丝线.素线, 丝线.线晕, 丝线.亮线, 丝线.游光])
      部分.setAttribute('d', String(路径))
    const 长度 = 丝线.素线.getTotalLength(),
      亮线终点 = 点亮前沿 - 25
    let 距离 = 0
    if (亮线终点 >= 终点[0]) 距离 = 长度
    else if (亮线终点 > 起点[0]) {
      let 下界 = 0,
        上界 = 长度
      for (let 步长 = 0; 步长 < 8; 步长++) {
        const 中点 = (下界 + 上界) / 2
        if (丝线.素线.getPointAtLength(中点).x < 亮线终点) 下界 = 中点
        else 上界 = 中点
      }
      距离 = (下界 + 上界) / 2
    }
    const 进度 = (距离 / 长度) * 100
    丝线.亮线.setAttribute('opacity', String(0.58 + 0.12 * 进度比例))
    丝线.线晕.setAttribute('opacity', String(0.14 + 0.08 * 进度比例))
    const 行进距离 = ((时间 / (5.6 + 序号 * 0.65) + 序号 * 0.23) % 1) * 进度
    const 光尾长度 = Math.min(行进距离, 5 + 4 * 进度比例)
    丝线.游光.setAttribute(
      'stroke-dasharray',
      String(`0 ${Math.max(0, 行进距离 - 光尾长度)} ${光尾长度} 200`),
    )
    const 脉冲 =
      状态.动态 && 进度 > 0
        ? (0.38 + 0.45 * 进度比例) * Math.sin(Math.PI * Math.min(1, 行进距离 / Math.max(1, 进度)))
        : 0
    丝线.游光.setAttribute('opacity', String(脉冲))
    const 光点坐标 = 丝线.素线.getPointAtLength((长度 * 行进距离) / 100)
    丝线.光点.setAttribute('cx', String(光点坐标.x))
    丝线.光点.setAttribute('cy', String(光点坐标.y))
    丝线.光点.setAttribute('opacity', String(脉冲))
    const 末端坐标 = 丝线.素线.getPointAtLength(距离)
    丝线.端点.setAttribute('cx', String(末端坐标.x))
    丝线.端点.setAttribute('cy', String(末端坐标.y))
    丝线.端点.setAttribute('opacity', String(进度 > 0 ? 0.45 + 0.25 * 进度比例 : 0))
  })
  画面.织光层.setAttribute('opacity', String(0.55 + 0.45 * 进度比例))
  画面.织光.forEach(({ 织线, 织光点 }, 序号) => {
    const 位置比例 = 0.08 + 序号 * 0.029,
      步长 = 0.024
    const 上端 = 曲线坐标(曲线组[0], 位置比例),
      下端 = 曲线坐标(曲线组[4], 位置比例)
    const 下一上端 = 曲线坐标(曲线组[0], 位置比例 + 步长),
      下一下端 = 曲线坐标(曲线组[4], 位置比例 + 步长)
    const 光峰 = Math.exp(-Math.pow((位置比例 - ((时间 / 8) % 1) * 0.85) / 0.085, 2))
    织线.setAttribute(
      'd',
      String(
        `M ${上端[0]} ${上端[1]} L ${下一下端[0]} ${下一下端[1]} M ${下端[0]} ${下端[1]} L ${下一上端[0]} ${下一上端[1]}`,
      ),
    )
    织线.setAttribute('opacity', String(0.18 + 0.58 * 光峰))
    织光点.setAttribute('cx', String((上端[0] + 下一下端[0]) / 2))
    织光点.setAttribute('cy', String((上端[1] + 下一下端[1]) / 2))
    织光点.setAttribute('opacity', String(光峰 * (序号 % 4 === 0 ? 0.8 : 0.25)))
  })
  画面.涟漪.forEach((光环, 序号) => {
    const 相位 = (时间 / 6.5 + 序号 / 3) % 1
    光环.setAttribute('rx', String(27 + 相位 * 18))
    光环.setAttribute('ry', String(13 + 相位 * 8))
    光环.setAttribute(
      'opacity',
      String(位置亮度(235) * (0.14 + 0.076 * 进度比例) * Math.sin(相位 * Math.PI)),
    )
  })
  画面.星屑.forEach((光屑, 序号) => {
    const 是否手部 = 序号 < 4
    const 手部星屑 = [
      [234, 103],
      [251, 124],
      [194, 58],
      [250, 53],
    ]
    const 坐标 = 是否手部
      ? 旋转坐标(手部星屑[序号], [214, 69], 手部转角)
      : 旋转坐标(布局.映射坐标(布局.星屑[序号 - 4]), 人物轴心, 人物转角, 人物起伏)
    const 相位 = (Math.sin(时间 * 1.2 + 序号 * 2.3) + 1) / 2
    const 光屑强度 =
      Math.pow(相位, 7) * 0.7 * (是否手部 ? 位置亮度(坐标[0]) * 0.65 : 人物位置亮度(坐标[0]) * 0.95)
    光屑.setAttribute(
      'transform',
      String(`translate(${坐标[0]} ${坐标[1]}) rotate(45) scale(${0.6 + 相位 * 0.65})`),
    )
    光屑.setAttribute('opacity', String(状态.动态 ? 光屑强度 : 0))
  })
  画面.亮相光环.setAttribute('opacity', String(入场强度 * 0.18))
  画面.亮相光环.setAttribute('rx', String(26 + Math.max(0, Math.min(1, 入场时长 / 3.8)) * 65))
}
