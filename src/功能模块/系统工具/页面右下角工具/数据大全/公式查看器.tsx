import { useState } from 'react'
import { Switch, Drawer, Descriptions, Typography, Space, Collapse } from 'antd'
import type { FormulaSegment, FormulaVariable } from './类型定义'
import { getAttributeLabel } from './属性映射'

const { Text } = Typography

interface FormulaViewerProps {
  skillName: string
  skillId: string
  formulaSegments: FormulaSegment[]
  criticalSegments: FormulaSegment[]
  attrs: Record<string, string>
  formulaRaw: string
  criticalRaw: string
  onVariableClick?: (variable: FormulaVariable) => void
  detailInfo?: { name: string; desc: string; attrs?: { label: string; value: number }[] } | null
  onCloseDetail?: () => void
}

const varColors: Record<string, string> = {
  recipe: '#d46b08',
  buff: '#096dd9',
  attribute: '#595959',
  function: '#531dab',
  constant: '#389e0d',
}
const varBgs: Record<string, string> = {
  recipe: '#fff7e6',
  buff: '#e6f7ff',
  attribute: '#f5f5f5',
  function: '#f9f0ff',
  constant: '#f6ffed',
}
const monoFont = "'Cascadia Code','Fira Code','Consolas',monospace"
const monoStyle: React.CSSProperties = { fontFamily: monoFont, fontSize: 13, lineHeight: '1.9' }

const FormulaViewer: React.FC<FormulaViewerProps> = ({
  skillName,
  skillId,
  formulaSegments,
  criticalSegments,
  attrs,
  formulaRaw,
  criticalRaw,
  onVariableClick,
  detailInfo,
  onCloseDetail,
}) => {
  const [copied, setCopied] = useState(false)
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [rawMode, setRawMode] = useState(false)

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(formulaRaw).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const levelSuffix = (seg: FormulaSegment) => {
    const groups = new Map<string, number[]>()
    for (const v of seg.variables) {
      const m = v.name.match(/(?:recipe|buff)_(\d+)_(\d+)$/)
      if (m) {
        const id = m[1]
        const lv = parseInt(m[2], 10)
        if (!groups.has(id)) groups.set(id, [])
        groups.get(id)!.push(lv)
      }
    }
    const multi = new Map<string, boolean>()
    for (const [id, lvs] of groups) {
      if (new Set(lvs).size > 1) multi.set(id, true)
    }
    return (v: FormulaVariable) => {
      const m = v.name.match(/(?:recipe|buff)_(\d+)_(\d+)$/)
      if (m && multi.get(m[1])) return ` (Lv${m[2]})`
      return ''
    }
  }

  const renderExpr = (seg: FormulaSegment, segIdx: number) => {
    const getSuffix = levelSuffix(seg)
    const varMap = new Map(seg.variables.map((v) => [v.name, v]))
    const importantVars = seg.variables.filter((v) => v.type === 'recipe' || v.type === 'buff')
    const attrVars = seg.variables.filter((v) => v.type === 'attribute')

    if (!importantVars.length) {
      let text = seg.expression
      if (!rawMode) {
        for (const v of attrVars) {
          if (v.displayName !== v.name) {
            text = text.replace(
              new RegExp('\\b' + v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'),
              v.displayName,
            )
          }
        }
      }
      return <span style={monoStyle}>{text}</span>
    }

    // Build expression with recipe/buff names replaced for non-raw mode
    let working = seg.expression
    if (!rawMode) {
      for (const v of attrVars) {
        if (v.displayName !== v.name) {
          working = working.replace(
            new RegExp('\\b' + v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'),
            v.displayName,
          )
        }
      }
    }

    const parts: React.ReactNode[] = []
    const sorted = importantVars.map((v) => v.name).sort((a, b) => b.length - a.length)
    const pattern = new RegExp(
      '(' + sorted.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')',
      'g',
    )

    let last = 0
    let k = 0
    let m
    while ((m = pattern.exec(working)) !== null) {
      if (m.index > last)
        parts.push(
          <span key={k++} style={monoStyle}>
            {working.slice(last, m.index)}
          </span>,
        )
      const v = varMap.get(m[1])
      const cls = v?.type || 'attribute'
      const suffix = getSuffix(v!)
      const rawName = m[1]
      const displayName = rawMode ? rawName : v?.displayName || rawName

      parts.push(
        <span
          key={k++}
          title={rawMode ? undefined : rawName}
          onClick={() => {
            if (v && (v.type === 'recipe' || v.type === 'buff')) onVariableClick?.(v)
          }}
          onMouseEnter={() => setHoveredSegment(segIdx)}
          style={{
            ...monoStyle,
            backgroundColor: varBgs[cls],
            color: varColors[cls],
            borderRadius: 2,
            padding: '1px 3px',
            cursor: v?.type === 'recipe' || v?.type === 'buff' ? 'pointer' : 'default',
            border: `1px solid ${varColors[cls]}20`,
          }}
        >
          {displayName}
          {!rawMode ? suffix : ''}
        </span>,
      )
      last = m.index + m[1].length
    }
    if (last < working.length)
      parts.push(
        <span key={k++} style={monoStyle}>
          {working.slice(last)}
        </span>,
      )
    return <>{parts}</>
  }

  const collector = (seg: FormulaSegment) =>
    seg.variables.filter((v) => v.type === 'recipe' || v.type === 'buff').length

  const segBlock = (seg: FormulaSegment, idx: number) => {
    const cnt = collector(seg)
    const isHovered = hoveredSegment === idx
    return (
      <div
        key={idx}
        style={{
          marginBottom: 10,
          borderLeft: '3px solid',
          borderLeftColor: isHovered ? '#faad14' : seg.color,
          paddingLeft: 12,
          borderRadius: 4,
          backgroundColor: isHovered ? '#fffbe6' : 'transparent',
          transition: 'background-color 0.2s, border-color 0.2s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 13, color: seg.color }}>{seg.label}</Text>
          {cnt > 0 && (
            <Space size={4}>
              {seg.variables.filter((v) => v.type === 'recipe').length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    color: '#d46b08',
                    background: '#fff7e6',
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}
                >
                  {seg.variables.filter((v) => v.type === 'recipe').length}秘籍
                </span>
              )}
              {seg.variables.filter((v) => v.type === 'buff').length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    color: '#096dd9',
                    background: '#e6f7ff',
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}
                >
                  {seg.variables.filter((v) => v.type === 'buff').length}Buff
                </span>
              )}
            </Space>
          )}
        </div>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 13,
            lineHeight: '1.9',
            padding: '8px 12px',
            backgroundColor: '#fafafa',
            borderRadius: 6,
            wordBreak: 'break-all',
          }}
        >
          {renderExpr(seg, idx)}
        </div>
      </div>
    )
  }

  if (!formulaSegments.length && !criticalSegments.length) {
    return <Text type='secondary'>该技能无伤害公式</Text>
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          {skillName}
          <Text type='secondary' style={{ marginLeft: 8, fontSize: 13 }}>
            (ID: {skillId})
          </Text>
        </Text>
        <Space size={12}>
          <Space size={4}>
            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
              {rawMode ? '原始字段' : '翻译术语'}
            </Text>
            <Switch size='small' checked={rawMode} onChange={setRawMode} />
          </Space>
          <span
            onClick={handleCopyFormula}
            style={{ cursor: 'pointer', color: copied ? '#52c41a' : '#1677ff', fontSize: 13 }}
          >
            {copied ? '已复制' : '复制公式'}
          </span>
        </Space>
      </div>
      <Text type='secondary' style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        {rawMode
          ? '公式中各英文变量即为游戏运行时实际变量名'
          : '橙字 = 秘籍变量，蓝字 = Buff变量。点击变量标签查看详情'}
      </Text>

      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: 14, color: '#f5222d' }}>
          ▸ 伤害公式
        </Text>
        {formulaSegments.map((seg, idx) => segBlock(seg, idx))}
      </div>

      {criticalSegments.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ fontSize: 14, color: '#fa8c16' }}>
            ▸ 会心公式
          </Text>
          {criticalSegments.map((seg, idx) => segBlock(seg, 1000 + idx))}
        </div>
      )}

      {Object.keys(attrs).length > 0 && (
        <Collapse
          ghost
          items={[
            {
              key: 'attrs',
              label: (
                <Text strong style={{ fontSize: 13, color: '#722ed1' }}>
                  ▸ 技能属性
                </Text>
              ),
              children: (
                <Descriptions size='small' column={2} bordered>
                  {Object.entries(attrs).map(([k, v]) => (
                    <Descriptions.Item key={k} label={getAttributeLabel(k)}>
                      {typeof v === 'string' ? v : JSON.stringify(v)}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              ),
            },
          ]}
        />
      )}

      <Collapse
        ghost
        items={[
          {
            key: 'raw',
            label: (
              <Text type='secondary' style={{ fontSize: 12 }}>
                ▸ 原始公式
              </Text>
            ),
            children: (
              <div style={{ marginBottom: 8 }}>
                {formulaRaw && (
                  <pre
                    style={{
                      fontFamily: monoFont,
                      fontSize: 12,
                      lineHeight: 1.6,
                      padding: '8px 12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 6,
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {formulaRaw}
                  </pre>
                )}
                {criticalRaw && criticalRaw !== '0' && (
                  <pre
                    style={{
                      fontFamily: monoFont,
                      fontSize: 12,
                      lineHeight: 1.6,
                      padding: '8px 12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 6,
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                    }}
                  >
                    {criticalRaw}
                  </pre>
                )}
              </div>
            ),
          },
        ]}
      />

      <Drawer title='变量详情' open={!!detailInfo} onClose={onCloseDetail} width={480}>
        {detailInfo && (
          <Descriptions column={1} bordered size='small'>
            <Descriptions.Item label='名称'>{detailInfo.name}</Descriptions.Item>
            {detailInfo.desc && (
              <Descriptions.Item label='效果'>{detailInfo.desc}</Descriptions.Item>
            )}
            {detailInfo.attrs?.map((a) => (
              <Descriptions.Item key={a.label} label={a.label}>
                {a.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default FormulaViewer
