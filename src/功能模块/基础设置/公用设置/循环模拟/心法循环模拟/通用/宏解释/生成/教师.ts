import type { 原生模拟器, 原生读条记录 } from '../通用/类型'
import { 获取实际技能数据 } from '../../通用函数'
import type { 教师结果 } from './类型'
import type { 心法运行接口, 宏状态 } from '../类型'
import { 运行宏, 选择宏语句 } from '../核心/运行'

export const 读取教师结果 = (
  模拟: 原生模拟器,
  输入: string[],
  每秒帧: number,
  引导记录: 原生读条记录 = {},
): 教师结果 => {
  if (模拟.技能释放记录.length !== 输入.length)
    throw new Error('原循环包含跳过的技能或额外自动动作，请先将循环整理为成功释放的主动动作')
  const 动作 = 模拟.技能释放记录.map((记录, 索引) => {
    const { 实际技能名称, 额外信息 } = 获取实际技能数据(输入[索引]) as {
      实际技能名称: string
      额外信息: Record<string, number> | null
    }
    if (实际技能名称 !== 记录.技能名称) throw new Error('原循环动作与实际释放记录不一致')
    const 引导 = 引导记录[索引]
    const 作用次数 =
      引导?.跳数 ??
      (记录.是否为读条技能 ? (额外信息?.作用次数 ?? 记录.技能释放记录结果?.特殊标记) : undefined)
    return {
      技能: 记录.技能名称,
      时间: 记录.开始读条时间 ?? 记录.实际释放时间,
      作用次数,
      持续帧: 引导
        ? 引导.结束帧 - 引导.开始帧
        : 记录.开始读条时间 === undefined
          ? undefined
          : 记录.实际释放时间 - 记录.开始读条时间,
    }
  })
  const 最后动作 = 动作[动作.length - 1]
  const 最后记录 = 模拟.技能释放记录[模拟.技能释放记录.length - 1]
  const 截止时间 = 最后记录?.是否为读条技能
    ? Math.max(模拟.当前时间, 最后动作.时间 + 0.000001)
    : (最后动作?.时间 || 0) + 每秒帧 * 0.125 + 0.000001
  if (截止时间 > 1200 * 每秒帧) throw new Error('当前循环超过精确生成的 1200 秒回放范围')
  return { 动作, 截止时间, 每秒帧 }
}

// 输入只提供动作顺序与显式跳数，默认引导和时间轴直接由宏执行器确定。
export const 重建宏教师 = (接口: 心法运行接口, 原输入: string[]): 教师结果 => {
  const 输入: string[] = []
  const 输入序号: number[] = []
  const 跳过技能: string[] = []
  const 已定义技能 = new Set(接口.说明.技能)
  const 动作 = 接口.读取循环输入!(原输入).filter((项, 索引) => {
    if (!已定义技能.has(项.技能)) {
      跳过技能.push(项.技能)
      return false
    }
    输入.push(原输入[索引])
    输入序号.push(索引 + 1)
    return true
  })
  if (!动作.length) throw new Error('当前循环没有可生成宏的已定义技能')
  let 游标 = 0
  const 展开动作: { 目标: (typeof 动作)[number]; 输入序号: number }[] = []
  let 等待至: number | undefined
  const 打断时刻 = (状态: 宏状态) => {
    if (!状态.读条) return Infinity
    const 次数 = 展开动作[展开动作.length - 1]?.目标.作用次数
    const 跳时刻 = 接口.获取引导跳时刻!()
    return 次数 === undefined || 次数 >= 跳时刻.length
      ? Infinity
      : 次数 === 0
        ? 状态.时间
        : 跳时刻[次数 - 1]
  }
  运行宏(
    [...new Set(动作.map((项) => 项.技能))].map((技能) => '/cast ' + 技能).join('\n'),
    1200,
    接口,
    false,
    [],
    {
      选择: (状态) => {
        if (状态.读条 || 游标 === 动作.length) return undefined
        等待至 ??= 状态.时间 + 接口.获取主动等待!(输入, 游标)
        if (状态.时间 < 等待至) return undefined
        const 选中 = 选择宏语句(
          [{ 命令: 'cast', 技能: 动作[游标].技能, 行号: 游标 + 1 }],
          状态,
          接口,
        )
        return 选中
      },
      下个时间: (状态) =>
        Math.min(
          等待至 !== undefined && 等待至 > 状态.时间 ? 等待至 : Infinity,
          打断时刻(状态) > 状态.时间 ? 打断时刻(状态) : Infinity,
        ),
      打断读条: (状态) => 状态.时间 >= 打断时刻(状态),
      释放后: (项) => {
        const 目标 = 动作[游标]
        if (项.自动技能 && 项.技能 !== 目标.技能) {
          展开动作.push({ 目标: { 技能: 项.技能 }, 输入序号: 输入序号[游标] })
          return
        }
        // 显式跳数控制主动截断，可执行上限由原生技能起读时的事件确定。
        const 原生跳数 = 接口.获取引导跳时刻!().length
        展开动作.push({
          目标:
            目标.作用次数 !== undefined && 项.释放后.读条 && 原生跳数 > 0
              ? { ...目标, 作用次数: Math.min(目标.作用次数, 原生跳数) }
              : 目标,
          输入序号: 输入序号[游标],
        })
        游标++
        等待至 = undefined
      },
      停止: () => 游标 === 动作.length && !接口.获取状态().读条,
      完成尾部读条: true,
      读条期间仅推进: true,
      生成范围: true,
    },
  )
  const 教师 = 接口.获取循环记录!()
  const 分歧 = 展开动作.findIndex(({ 目标 }, 索引) => {
    const 实际 = 教师.动作[索引]
    return (
      !实际 ||
      实际.技能 !== 目标.技能 ||
      (目标.作用次数 !== undefined && 实际.作用次数 !== 目标.作用次数)
    )
  })
  if (教师.动作.length !== 展开动作.length)
    throw new Error('宏实际释放记录与包含自动技能的目标动作数量不一致')
  if (分歧 >= 0)
    throw new Error(
      `宏无法按当前循环的技能顺序和引导跳数执行：第 ${展开动作[分歧].输入序号} 个输入动作不一致`,
    )
  if (游标 !== 动作.length) {
    const 状态 = 接口.获取状态()
    const 资源 = Object.entries(接口.说明.资源显示)
      .map(([字段, 名称]) => `${名称}=${状态.数值[字段]}`)
      .join('，')
    throw new Error(
      `宏无法执行当前循环第 ${输入序号[游标]} 个动作「${动作[游标].技能}」；当前资源：${资源}`,
    )
  }
  return 跳过技能.length ? { ...教师, 跳过技能 } : 教师
}
