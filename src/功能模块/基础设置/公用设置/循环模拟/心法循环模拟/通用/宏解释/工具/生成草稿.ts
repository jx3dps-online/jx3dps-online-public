import { 心法说明 } from '../类型'

export const 生成优先级草稿 = (循环: string[], 说明: 心法说明) => {
  const 技能 = Array.from(new Set(循环.map((名称) => 名称.split('%')[0])))
  const 未支持 = 技能.filter((名称) => !说明.技能.includes(名称))
  if (未支持.length) throw new Error('循环包含暂不支持的技能：' + 未支持.join('、'))
  if (!技能.length) throw new Error('当前手动循环为空')
  return (
    '// 按当前循环首次出现顺序生成；请运行并检查优先级\n' +
    技能.map((名称) => '/cast ' + 名称).join('\n')
  )
}
