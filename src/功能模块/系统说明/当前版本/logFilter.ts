import type { ReactNode } from 'react'
import 心法枚举 from '@/数据/静态数据/心法枚举.json'

const mobilePrefix = '移动端_'

const getCanonicalName = (name: string) => {
  if (name === '丐帮') return '笑尘诀'
  if (name === '花间' || name === '花间诀') return '花间游'
  if (name === '分山') return '分山劲'

  const withoutMobilePrefix = name.startsWith(mobilePrefix) ? name.slice(mobilePrefix.length) : name
  const withoutMobileSuffix = withoutMobilePrefix.replace(/_心法$/, '')
  const isWuName = /[·_]悟$|悟$/.test(withoutMobileSuffix)
  const withoutWuSuffix = withoutMobileSuffix.replace(/[·_]悟$|悟$/, '')

  if (name.startsWith(mobilePrefix)) return `${withoutWuSuffix}_悟`
  return isWuName ? `${withoutWuSuffix}_悟` : withoutMobileSuffix
}

const knownNames = new Set(
  Object.values(心法枚举).flatMap((item) => {
    const canonicalName = getCanonicalName(item.name)
    return [canonicalName, `${canonicalName}_悟`]
  }),
)

const isHeading = (content: ReactNode, nextContent: ReactNode | undefined, names: Set<string>) => {
  if (typeof content !== 'string') return false
  if (content === '综合' || content.startsWith('综合-')) return true
  if (content.split('、').some((name) => names.has(getCanonicalName(name)))) return true
  return nextContent !== undefined && typeof nextContent !== 'string'
}

const isGeneralHeading = (heading: string, names: Set<string>) => {
  if (heading === '综合' || heading.startsWith('综合-')) return true

  const headingNames = heading.split('、').map(getCanonicalName)
  return headingNames.some((name) => !names.has(name))
}

export const filterLogContent = (
  content: ReactNode | ReactNode[],
  currentName: string,
): ReactNode | ReactNode[] => {
  if (!Array.isArray(content)) return content

  const currentCanonicalName = getCanonicalName(currentName)
  const specNames = new Set([...knownNames, currentCanonicalName, `${currentCanonicalName}_悟`])
  const filteredContent: ReactNode[] = []
  let sectionIncluded = true

  content.forEach((item, index) => {
    const nextItem = content[index + 1]
    if (isHeading(item, nextItem, specNames)) {
      const heading = item as string
      const headingNames = heading.split('、').map(getCanonicalName)
      sectionIncluded =
        isGeneralHeading(heading, specNames) ||
        headingNames.some((name) => name === currentCanonicalName)
      if (sectionIncluded) filteredContent.push(item)
      return
    }

    if (sectionIncluded) filteredContent.push(item)
  })

  return filteredContent
}
