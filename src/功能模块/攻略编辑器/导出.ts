import { 构建正文, 导入文档 } from './文档'
import type { 攻略文档, 内容节点 } from './类型'

export function 生成TSX(输入: 攻略文档): string {
  const 文档 = 导入文档(JSON.stringify(输入))
  if (!文档.攻略名.trim() || !文档.标题.trim()) throw new Error('请填写攻略目录名和标题')
  if (
    /[\\/:*?"<>|]|\.\.|[\x00-\x1f]/.test(文档.攻略名) ||
    /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(文档.攻略名) ||
    /[. ]$/.test(文档.攻略名)
  )
    throw new Error('攻略目录名包含无效字符或保留名称')
  const 用到 = new Set(['攻略容器', '攻略正文'])
  const 配装常量: string[] = []
  const 序列化 = (项: 内容节点 | string): string => {
    if (typeof 项 === 'string') return `{${JSON.stringify(项)}}`
    if (!/^[a-z][a-z\d-]*$/.test(项.标签)) 用到.add(项.标签)
    const 属性 = Object.entries(项.属性 || {})
      .filter(([, 值]) => 值 !== undefined)
      .map(([键, 值]) => {
        if (项.标签 === '配装' && 键 === '配装数据') {
          const 名称 = `配装数据${配装常量.length + 1}`
          配装常量.push(`const ${名称} = ${JSON.stringify(值, null, 2)}`)
          return ` ${键}={${名称}}`
        }
        return ` ${键}={${JSON.stringify(值)}}`
      })
      .join('')
    return 项.子?.length
      ? `<${项.标签}${属性}>${项.子.map(序列化).join('')}</${项.标签}>`
      : `<${项.标签}${属性} />`
  }
  const 正文 = 构建正文(文档).map(序列化).join('\n        ')
  return `import { ${[...用到].join(', ')} } from '../../../components'\n\n${配装常量.length ? 配装常量.join('\n\n') + '\n\n' : ''}export default function 攻略() {\n  return (\n    <攻略容器 标题={${JSON.stringify(文档.标题)}} 模式={${JSON.stringify(文档.模式)}}>\n      <攻略正文 心法={${JSON.stringify(文档.心法)}}>\n        ${正文}\n      </攻略正文>\n    </攻略容器>\n  )\n}\n`
}

export function 交接说明(文档: 攻略文档): string {
  return `攻略：${文档.标题}\n作者：${文档.作者}\n来源：${文档.原文}\n攻略 key：${文档.心法}/${文档.攻略名}\n\n将 TSX 改名为 index.tsx，放入 src/功能模块/攻略/心法/${文档.心法}/${文档.攻略名}/。\nJSON 是可继续编辑的稿件，请一起保留。\n需要项目包含攻略正文组件（编辑器配套版本）。\n\n待绑定循环（由开发者核对后修改攻略key）：\n${文档.绑定循环.join('\n') || '尚未选择'}\n\n预览循环：${文档.预览循环 || '未指定'}\n发布前请核对同名攻略、引用、主题和循环绑定；下载文件不会自动发布。`
}

export function 下载文件(名称: string, 内容: string, 类型 = 'text/plain;charset=utf-8') {
  const 地址 = URL.createObjectURL(new Blob([内容], { type: 类型 }))
  const 链接 = document.createElement('a')
  链接.href = 地址
  链接.download = 名称.replace(/[\\/:*?"<>|]/g, '-')
  链接.click()
  setTimeout(() => URL.revokeObjectURL(地址), 1000)
}
