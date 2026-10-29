const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const crypto = require('node:crypto')

// 仅在独立 Node 进程中读取原模拟器元数据，不运行循环、不写浏览器存储。
const 输出 = process.argv[2]
if (!输出) throw new Error('用法：node 导出原模拟器名单.cjs 输出.json [心法参数.json]')
const 宏目录 = path.resolve(__dirname, '../../..')
let 项目 = 宏目录
while (!fs.existsSync(path.join(项目, 'package.json'))) {
  const 上级 = path.dirname(项目)
  if (项目 === 上级) throw new Error('找不到项目 package.json')
  项目 = 上级
}
const ts = require(path.join(项目, 'node_modules/typescript'))
const 输出相对路径 = path.relative(项目, path.resolve(输出))
if (!path.isAbsolute(输出相对路径) && !输出相对路径.startsWith('..' + path.sep))
  throw new Error('输出必须放在项目目录外')
const 原解析 = Module._resolveFilename
Module._resolveFilename = function (名称, 父模块, ...参数) {
  return 原解析.call(
    this,
    名称.startsWith('@/') ? path.join(项目, 'src', 名称.slice(2)) : 名称,
    父模块,
    ...参数,
  )
}
for (const 后缀 of ['.ts', '.tsx']) {
  require.extensions[后缀] = (模块, 文件) =>
    模块._compile(
      ts.transpileModule(fs.readFileSync(文件, 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      }).outputText,
      文件,
    )
}
for (const 后缀 of ['.less', '.css', '.svg', '.png', '.jpg'])
  require.extensions[后缀] = (模块) => {
    模块.exports = {}
  }
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
global.window = { location: { pathname: '/dps/fsj' }, localStorage }
const { 初始化工作线程数据 } = require(path.join(宏目录, '通用/创建接口'))
const { 创建心法说明 } = require(path.join(宏目录, '通用/说明'))
const { default: 获取当前数据 } = require(path.join(项目, 'src/数据/数据工具/获取当前数据'))
const 参数覆盖 = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : {}

;(async () => {
  const 心法列表 = []
  for (const 名称 of fs.readdirSync(path.join(宏目录, '心法')).sort()) {
    const 表路径 = path.join(宏目录, '心法', 名称, '耦合表.ts')
    const 规则路径 = path.join(宏目录, '心法', 名称, '特殊规则.ts')
    const 表导出 = require(表路径),
      规则导出 = require(规则路径)
    const 表 = 表导出.耦合表 || 表导出.分山耦合表
    const 规则 = 规则导出.特殊规则 || 规则导出.分山特殊规则
    await 初始化工作线程数据(表.名称)
    const 参数 = {
      奇穴: [],
      秘籍: {},
      加速值: 0,
      网络延迟: 0,
      测试循环: [],
      角色状态信息: {},
      起手能量: {},
      ...参数覆盖[名称],
    }
    const 模拟 = 规则.加载构造器
      ? (await 规则.加载构造器())(参数)
      : (await 规则.创建模拟器(参数)).模拟
    const 完整表 = {
      ...表,
      DOT: Object.keys(模拟.技能类实例集合).filter((名) => 模拟.技能类实例集合[名].DOT运行数据),
    }
    const 说明 = 创建心法说明(模拟, 完整表, 获取当前数据().奇穴数据)
    心法列表.push({
      heart: 名称,
      skills: 说明.技能,
      self: 说明.自身增益,
      target: 说明.目标增益,
      aliases: 说明.映射,
      original: 模拟.技能基础数据.map((技能) => ({ name: 技能.技能名称, raw: 技能.技能原始名称 })),
      buff: 模拟.Buff和Dot数据,
      sources: [
        表路径,
        规则路径,
        path.join(宏目录, '../../', 名称, 'constant/skill.ts'),
        path.join(宏目录, '../../', 名称, 'simulator/main.ts'),
      ].map((文件) => ({
        path: path.relative(项目, 文件).replaceAll('\\', '/'),
        sha256: crypto.createHash('sha256').update(fs.readFileSync(文件)).digest('hex'),
      })),
    })
  }
  fs.mkdirSync(path.dirname(path.resolve(输出)), { recursive: true })
  fs.writeFileSync(输出, JSON.stringify({ schema: 1, hearts: 心法列表 }, null, 2), 'utf8')
  console.log(JSON.stringify({ hearts: 心法列表.length, output: path.resolve(输出) }))
})().catch((错误) => {
  console.error(错误)
  process.exitCode = 1
})
