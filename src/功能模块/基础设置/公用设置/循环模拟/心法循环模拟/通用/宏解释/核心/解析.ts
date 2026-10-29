import type { 比较符, 宏条件, 宏配置, 宏语句, 心法说明 } from '../类型'
import { 获取增益能力 } from './条件能力'

const 比较式 = /^(.+?)(>=|<=|~=|=|>|<)([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/
const 资源比较式 = /^(.+?)(>=|<=|~=|=|>|<)([a-z_]+)$/

export class 宏解析错误 extends Error {
  constructor(
    public 行号: number,
    public 列号: number,
    内容: string,
  ) {
    super('第 ' + 行号 + ' 行，第 ' + 列号 + ' 列：' + 内容)
    this.name = '宏解析错误'
  }
}

const 绑定名称 = (文本: string, 名称列表: string[], 映射: Record<string, string>, 对象: string) => {
  const 输入 = /^\d+$/.test(文本) ? String(Number(文本)) : 文本
  if (/^\d+$/.test(文本) && (!Number.isSafeInteger(Number(文本)) || Number(文本) > 4294967295)) {
    throw new Error(对象 + ' ID 超出范围：' + 文本)
  }
  const 名称 = Object.prototype.hasOwnProperty.call(映射, 输入) ? 映射[输入] : 输入
  if (!名称列表.includes(名称)) throw new Error('未知或未映射的' + 对象 + '：' + 文本)
  return 名称
}

const 解析原子 = (文本: string, 说明: 心法说明): 宏条件 => {
  if (/[[\]!]/.test(文本)) throw new Error('不支持括号分组或 !；请使用 &、| 和否定条件')
  if ((说明.充盈字段 || []).includes(文本)) return { 类型: '充盈', 字段: 文本 }
  const 条件字段 = 文本.split(/[:<>=~]/)[0]
  if (说明.未支持条件?.[条件字段]) throw new Error(说明.未支持条件[条件字段])
  const 资源比较 = 文本.match(资源比较式)
  if (资源比较 && 说明.数值字段.includes(资源比较[1])) {
    if (!['sun', 'moon'].includes(资源比较[1]) || !['sun', 'moon'].includes(资源比较[3]))
      throw new Error('资源之间的比较仅支持 sun 与 moon')
    if (!说明.数值字段.includes(资源比较[3])) throw new Error('该心法没有资源：' + 资源比较[3])
    return { 类型: '数值', 字段: 资源比较[1], 比较: 资源比较[2] as 比较符, 值: 资源比较[3] }
  }
  const 比较 = 文本.match(比较式)
  const 字段 = 比较 && (说明.映射.字段[比较[1]] || 比较[1])
  const 运算 = 比较?.[2] as 比较符
  const 数值 = Number(比较?.[3])
  if (比较 && !Number.isFinite(数值)) throw new Error('比较数值必须有限')
  if (字段 && 说明.数值字段.includes(字段)) {
    if (
      !说明.小数字段.includes(字段) &&
      (!Number.isSafeInteger(数值) || 数值 < -2147483648 || 数值 > 2147483647)
    ) {
      throw new Error('字段 ' + 字段 + ' 只接受 32 位整数')
    }
    return { 类型: '数值', 字段, 比较: 运算, 值: 数值 }
  }
  const 上个技能 = 文本.match(/^last_skill(=|~=)(.+)$/)
  if (上个技能) {
    return {
      类型: '上个技能',
      名称: 绑定名称(上个技能[2], 说明.技能, 说明.映射.技能, '技能'),
      取反: 上个技能[1] === '~=',
    }
  }
  const 奇穴 = 文本.match(/^(skill|noskill):(.+)$/)
  if (奇穴) {
    const 输入 = /^\d+$/.test(奇穴[2]) ? String(Number(奇穴[2])) : 奇穴[2]
    if (
      说明.映射.技能[输入] &&
      说明.映射.奇穴[输入] &&
      说明.映射.技能[输入] !== 说明.映射.奇穴[输入]
    )
      throw new Error('技能与奇穴 ID 对应不同名称，需核对耦合表：' + 输入)
    return {
      类型: '奇穴',
      名称: 绑定名称(
        奇穴[2],
        [...Object.values(说明.映射.奇穴), ...说明.技能],
        { ...说明.映射.技能, ...说明.映射.奇穴 },
        '技能或奇穴',
      ),
      取反: 奇穴[1] === 'noskill',
    }
  }
  const 增益 = 文本.match(/^(bufftime|tbufftime|buff|tbuff|nobuff|tnobuff):(.+)$/)
  if (增益) {
    const 前缀 = 增益[1]
    const 带比较 = 增益[2].match(比较式)
    const 对象 = 前缀.startsWith('t') ? '目标' : '自身'
    const 输入 = 带比较?.[1] || 增益[2]
    const 能力 = 获取增益能力(说明, 对象, 输入)
    const 同ID名称 = 说明.增益ID?.[能力.名称]?.[对象] ? 能力.实体 : undefined
    const 名称 = 能力.名称
    const 时间 = 前缀.endsWith('time')
    if (时间 && 能力.无计时)
      throw new Error('原模拟器未提供增益倒计时：' + 输入 + '；请使用存在或层数条件')
    if (时间 && 能力.永久)
      throw new Error('永久增益不支持 ' + 前缀 + ' 判断：' + 输入 + '；请使用存在或层数条件')
    const 取反 = 前缀.includes('nobuff')
    if ((时间 && !带比较) || (取反 && 带比较)) throw new Error('增益条件格式不正确')
    const 值 = 带比较 ? Number(带比较[3]) : 0
    if (!Number.isFinite(值) || 值 < 0) throw new Error('增益比较数值必须有限且非负')
    if (!时间 && (!Number.isSafeInteger(值) || 值 > 4294967295))
      throw new Error('增益层数只接受非负 32 位整数')
    return {
      类型: '增益',
      对象,
      名称,
      ...(同ID名称 ? { 同ID名称 } : {}),
      时间,
      取反,
      比较: (带比较?.[2] || '>') as 比较符,
      值,
    }
  }
  const 技能 = 文本.match(/^(skill_notin_cd|skill_energy):(.+)$/)
  if (技能) {
    const 充能 = 技能[1] === 'skill_energy'
    const 带比较 = 技能[2].match(比较式) || 技能[2].match(/^(.+?)(>=|<=|~=|=|>|<)(max)$/)
    if (充能 && !带比较) throw new Error('技能充能条件缺少比较值')
    const 名称 = 绑定名称(
      充能 ? 带比较![1] : 技能[2],
      充能 ? 说明.技能 : [...说明.技能, ...(说明.调息查询技能 || [])],
      说明.映射.技能,
      '技能',
    )
    const 值 = 充能 && 带比较![3] === 'max' ? 'max' : 充能 ? Number(带比较![3]) : 0
    if (值 !== 'max' && (!Number.isSafeInteger(值) || 值 < 0 || 值 > 4294967295))
      throw new Error('技能充能只接受非负 32 位整数')
    return {
      类型: '技能',
      名称,
      字段: 充能 ? '充能' : '冷却帧',
      比较: 充能 ? (带比较![2] as 比较符) : '=',
      值,
      ...(充能 ? { 充能技能: 说明.充能技能?.includes(名称) ?? false } : {}),
    }
  }
  throw new Error('不支持的条件或格式：' + 文本)
}

export const 解析条件 = (文本: string, 说明: 心法说明): 宏条件 => {
  const 分段 = 文本.replace(/\s+/g, '').split(/([&|])/)
  if (分段.some((片段) => !片段)) throw new Error('条件为空或含连续运算符')
  let 条件 = 解析原子(分段[分段.length - 1], 说明)
  // 与器灵当前解析器一致：& 与 | 等优先级、右结合。
  for (let 索引 = 分段.length - 3; 索引 >= 0; 索引 -= 2) {
    条件 = { 类型: 分段[索引 + 1] === '&' ? '且' : '或', 左: 解析原子(分段[索引], 说明), 右: 条件 }
  }
  return 条件
}

export const 解析宏 = (文本: string, 说明: 心法说明): 宏配置 => {
  const 行 = 文本.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/)
  const 页: 宏配置['页'] = []
  let 体态: number | undefined
  let 已分页 = false
  let 语句: 宏语句[] = []
  行.forEach((内容, 索引) => {
    const 文本 = 内容.trim()
    if (!文本 || 文本.startsWith('//')) return
    let 列号 = 内容.indexOf(文本) + 1
    try {
      const 分页 = 文本.match(/^#page(?:\s+(\S+))?$/)
      if (分页) {
        const 名称 = 分页[1]
        if (名称 && Object.prototype.hasOwnProperty.call(说明.映射.禁用体态, 名称))
          throw new Error(说明.映射.禁用体态[名称])
        if (名称 && !Object.prototype.hasOwnProperty.call(说明.体态别名, 名称))
          throw new Error('未知分页体态：' + 名称)
        if (语句.length || 已分页) 页.push({ 体态, 语句 })
        语句 = []
        已分页 = true
        体态 = 名称 ? 说明.体态别名[名称] : undefined
        return
      }
      const 命令 = 文本.match(/^\/(cast|fcast|mcast)\s+(.+)$/)
      if (!命令) throw new Error('格式应为 /cast、/fcast [条件] 技能名或 /mcast [条件] 宏名')
      if (命令[1] !== 'mcast' && /&amp;|&lt;|&gt;/.test(文本))
        throw new Error('文本含 HTML 转义，请粘贴纯文本宏')
      let 技能 = 命令[2].trim()
      let 条件文本: string | undefined
      if (技能.startsWith('[')) {
        const 结束 = 技能.indexOf(']')
        if (结束 < 0) throw new Error('缺少 ]')
        条件文本 = 技能.slice(1, 结束)
        技能 = 技能.slice(结束 + 1).trim()
      } else if (命令[1] !== 'mcast' && /\s/.test(技能)) {
        const 位置 = 技能.search(/\s+\S+$/)
        条件文本 = 技能.slice(0, 位置)
        技能 = 技能.slice(位置).trim()
      }
      let 条件: 宏条件 | undefined
      if (条件文本 !== undefined) {
        列号 = 内容.indexOf(条件文本) + 1
        if (/&amp;|&lt;|&gt;/.test(条件文本)) throw new Error('条件含 HTML 转义，请粘贴纯文本宏')
        条件 = 解析条件(条件文本, 说明)
      }
      if (命令[1] === 'mcast') {
        列号 = 内容.indexOf(技能) + 1
        if (技能.startsWith('"')) {
          try {
            技能 = JSON.parse(技能)
          } catch {
            throw new Error('宏名引号格式不正确；双引号内的引号和反斜杠需用 JSON 转义')
          }
        }
        if (!技能) throw new Error('调用宏名不能为空')
        语句.push({ 行号: 索引 + 1, 命令: 'mcast', 宏: 技能, 条件 })
      } else {
        const 名称 = 绑定名称(技能, 说明.技能, 说明.映射.技能, '动作技能')
        语句.push({
          行号: 索引 + 1,
          命令: 命令[1] === 'fcast' && 说明.支持打断 !== false ? 'fcast' : 'cast',
          技能: 名称,
          条件,
        })
      }
    } catch (错误) {
      throw new 宏解析错误(索引 + 1, 列号, (错误 as Error).message)
    }
  })
  if (语句.length || 已分页) 页.push({ 体态, 语句 })
  if (页.every((当前页) => !当前页.语句.length)) throw new 宏解析错误(1, 1, '宏文本为空')
  return { 页 }
}
