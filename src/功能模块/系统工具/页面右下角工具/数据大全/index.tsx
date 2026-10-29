import React, { useState, useMemo, useCallback } from 'react'
import {
  Tabs,
  Table,
  Tag,
  Switch,
  Space,
  Select,
  Empty,
  Typography,
  Card,
  Descriptions,
  Drawer,
  Tooltip,
} from 'antd'
import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/lib/table'
import type {
  SearchResult,
  BuffDisplayInfo,
  RecipeDisplayInfo,
  FormulaSegment,
  FormulaVariable,
  SkillItem,
  DotItem,
} from './类型定义'
import {
  searchSkill,
  searchBuff,
  searchRecipe,
  getSkillBuffs,
  getSkillRecipes,
  getBuffSkills,
  getRecipeSkills,
  getSkillFormulaParsed,
  getBuffInfo,
  getRecipeInfo,
  getSkillInfo,
  getKungfuOptions,
} from './数据索引'
import FormulaViewer from './公式查看器'
import styles from './index.module.less'

const { Text } = Typography

const SCHOOL_OPTIONS = getKungfuOptions()

const SEARCH_TYPE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '技能', value: 'skill' },
  { label: 'DOT', value: 'dot' },
  { label: 'Buff', value: 'buff' },
  { label: 'Recipe', value: 'recipe' },
]

const 技能增益查询: React.FC = () => {
  const [mode, setMode] = useState<'skill' | 'gain' | 'formula'>('skill')
  const [searchQuery, setSearchQuery] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [conciseMode, setConciseMode] = useState(true)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailDrawer, setDetailDrawer] = useState<{
    type: 'buff' | 'recipe'
    id: string
  } | null>(null)
  const [formulaDetailInfo, setFormulaDetailInfo] = useState<{
    name: string
    desc: string
    attrs?: { label: string; value: number }[]
  } | null>(null)
  const [suggestions, setSuggestions] = useState<{ label: string; value: string; type: string }[]>(
    [],
  )

  const handleAutoComplete = useCallback(
    (q: string) => {
      setSearchQuery(q)
      if (!q.trim()) {
        setSuggestions([])
        setSearchResults([])
        setSelectedItem(null)
        return
      }

      let results: SearchResult[] = []
      if (mode === 'skill' || mode === 'formula') {
        results = searchSkill(q)
      } else {
        const buffR = searchBuff(q)
        const recipeR = searchRecipe(q)
        results = [...buffR, ...recipeR].sort((a, b) => b.score - a.score)
      }

      const opts = results.slice(0, 8).map((r) => ({
        label: `${r.name} ${r.id}`,
        value: r.id,
        type: r.type,
      }))
      setSuggestions(opts)
    },
    [mode],
  )

  const handleSelectSuggestion = (value: string) => {
    handleSearch(value)
    setSelectedItem(value)
  }

  const handleSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setSearchResults([])
        setSelectedItem(null)
        return
      }
      setLoading(true)
      setSearchQuery(q)
      setSelectedItem(null)

      let results: SearchResult[] = []

      if (mode === 'skill') {
        results = searchSkill(q)
      } else if (mode === 'gain') {
        const buffR = searchBuff(q)
        const recipeR = searchRecipe(q)
        results = [...buffR, ...recipeR].sort((a, b) => b.score - a.score)
      } else if (mode === 'formula') {
        results = searchSkill(q)
      }

      if (typeFilter) {
        results = results.filter((r) => r.type === typeFilter)
      }
      if (schoolFilter) {
        results = results.filter((r) => r.schoolId === schoolFilter)
      }

      setSearchResults(results.slice(0, 30))
      setLoading(false)
    },
    [mode, typeFilter, schoolFilter],
  )

  const handleSelectItem = (item: SearchResult) => {
    setSelectedItem(item.id)
  }

  const formatDisplayName = (name: string, id: string, source?: string) => {
    if (conciseMode && name && name !== id) return name
    if (!name || name === id) return id
    return `${name} (${id})`
  }

  // --- 模式1: 按技能查增益 ---
  const renderSkillDetail = () => {
    if (!selectedItem) return <Empty description='请搜索并选择一个技能' />

    const skill = getSkillInfo(selectedItem)
    if (!skill) return <Empty description='技能数据未找到' />

    const parsed = getSkillFormulaParsed(selectedItem)
    const buffs = getSkillBuffs(selectedItem, parsed.recipeContributions as any)
    const recipes = getSkillRecipes(selectedItem)

    const buffColumns: ColumnsType<BuffDisplayInfo> = [
      {
        title: '类型',
        dataIndex: 'gainType',
        width: 90,
        render: (type: string, record) => <Tag color={record.gainTypeColor}>{type}</Tag>,
      },
      {
        title: '名称',
        dataIndex: 'name',
        width: 160,
        render: (text, record) => formatDisplayName(text, record.id),
      },
      {
        title: '属性/效果',
        dataIndex: 'attributes',
        render: (attrs, record) => {
          const hasRecipes = record.providedRecipes && record.providedRecipes.length > 0
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {attrs &&
                attrs.length > 0 &&
                attrs
                  .filter((a: any) => a.label && a.value !== undefined)
                  .map((a: { label: string; value: number }) => (
                    <Tag key={a.label} color='green' style={{ margin: 0 }}>
                      {a.label}
                      {typeof a.value === 'number' && !isNaN(a.value) && a.value > 0
                        ? `+${a.value}`
                        : ''}
                    </Tag>
                  ))}
              {(!attrs || attrs.length === 0) && hasRecipes && (
                <Space wrap size={[4, 2]}>
                  {record.providedRecipes?.map(
                    (pr: { key: string; name: string; desc: string }) => (
                      <Tooltip key={pr.key} title={pr.desc}>
                        <Tag color='orange' style={{ cursor: 'pointer', margin: 0 }}>
                          {pr.name}
                        </Tag>
                      </Tooltip>
                    ),
                  )}
                </Space>
              )}
              {(!attrs || attrs.length === 0) && !hasRecipes && (
                <Text type='secondary' style={{ fontSize: 12 }}>
                  无属性数据
                </Text>
              )}
            </div>
          )
        },
      },
      {
        title: '堆叠',
        key: 'stack',
        width: 100,
        render: (_, record) =>
          record.maxStack > 1 ? `${record.maxStack}层` : record.maxTick > 1 ? '可刷新' : '不可堆叠',
      },
      {
        title: '操作',
        key: 'action',
        width: 80,
        render: (_, record) => (
          <a onClick={() => setDetailDrawer({ type: 'buff', id: record.id })}>详情</a>
        ),
      },
    ]

    const recipeColumns: ColumnsType<RecipeDisplayInfo> = [
      {
        title: '秘籍名称',
        dataIndex: 'name',
        width: 300,
        render: (text, record) => formatDisplayName(text, record.key),
      },
      {
        title: '效果描述',
        dataIndex: 'desc',
        ellipsis: true,
      },
      {
        title: '操作',
        key: 'action',
        width: 80,
        render: (_, record) => (
          <a onClick={() => setDetailDrawer({ type: 'recipe', id: record.key })}>详情</a>
        ),
      },
    ]

    return (
      <div>
        <div className={styles.skillHeader}>
          <Text strong style={{ fontSize: 18 }}>
            {skill.name}
          </Text>
          <Space>
            <Tag>{skill.type === 'skill' ? '技能' : 'DOT'}</Tag>
            <Tag>{skill.id}</Tag>
          </Space>
        </div>

        <div className={styles.section}>
          <Text strong className={styles.sectionTitle}>
            ◆ 增益效果 (Buffs) — {buffs.length}个
          </Text>
          {buffs.length > 0 ? (
            <Table
              dataSource={buffs}
              columns={buffColumns}
              rowKey='id'
              size='small'
              pagination={false}
              className={styles.table}
            />
          ) : (
            <Empty description='该技能没有相关Buff' image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>

        <div className={styles.section}>
          <Text strong className={styles.sectionTitle}>
            ◆ 秘籍效果 (Recipes) — {recipes.length}个
          </Text>
          {recipes.length > 0 ? (
            <Table
              dataSource={recipes}
              columns={recipeColumns}
              rowKey='key'
              size='small'
              pagination={false}
              className={styles.table}
            />
          ) : (
            <Empty description='该技能没有相关秘籍' image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </div>
    )
  }

  // --- 模式2: 按增益查技能 ---
  const renderGainDetail = () => {
    if (!selectedItem) return <Empty description='请搜索并选择一个增益' />

    const isBuff = !selectedItem.startsWith('recipe_')
    const selectedResult = searchResults.find((r) => r.id === selectedItem)
    const isRecipeType = selectedResult?.type === 'recipe'

    if (isRecipeType) {
      const recipe = getRecipeInfo(selectedItem)
      const skills = getRecipeSkills(selectedItem)
      const skillInfoList = skills.map((s) => s)

      const skillColumns: ColumnsType<SkillItem | DotItem> = [
        {
          title: '技能名称',
          dataIndex: 'name',
          width: 300,
          render: (text, record) => formatDisplayName(text, record.id),
        },
        {
          title: '类型',
          dataIndex: 'type',
          width: 80,
          render: (t) => <Tag>{t === 'skill' ? '主动技能' : 'DOT'}</Tag>,
        },
        { title: 'ID', dataIndex: 'id', width: 100 },
        {
          title: '操作',
          key: 'action',
          width: 100,
          render: (_, record) => (
            <a
              onClick={() => {
                setMode('formula')
                setSelectedItem(record.id)
                setSearchQuery(record.id)
              }}
            >
              查看公式
            </a>
          ),
        },
      ]

      return (
        <div>
          <Card size='small' className={styles.gainCard}>
            <Descriptions column={1} size='small'>
              <Descriptions.Item label='秘籍名称'>{recipe?.name || selectedItem}</Descriptions.Item>
              <Descriptions.Item label='Key'>{selectedItem}</Descriptions.Item>
              <Descriptions.Item label='效果'>{recipe?.desc || '无描述'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <div className={styles.section}>
            <Text strong className={styles.sectionTitle}>
              ◆ 作用的技能 — {skillInfoList.length}个
            </Text>
            <Table
              dataSource={skillInfoList}
              columns={skillColumns}
              rowKey='id'
              size='small'
              pagination={false}
              className={styles.table}
            />
          </div>
        </div>
      )
    }

    const buff = getBuffInfo(selectedItem)
    const skills = getBuffSkills(selectedItem)
    const skillInfoList = skills.map((s) => s)

    const skillColumns: ColumnsType<SkillItem | DotItem> = [
      {
        title: '技能名称',
        dataIndex: 'name',
        width: 300,
        render: (text, record) => formatDisplayName(text, record.id),
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: 80,
        render: (t) => <Tag>{t === 'skill' ? '主动技能' : 'DOT'}</Tag>,
      },
      { title: 'ID', dataIndex: 'id', width: 100 },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (_, record) => (
          <a
            onClick={() => {
              setMode('formula')
              setSelectedItem(record.id)
              setSearchQuery(record.id)
            }}
          >
            查看公式
          </a>
        ),
      },
    ]

    return (
      <div>
        <Card size='small' className={styles.gainCard}>
          <Descriptions column={2} size='small'>
            <Descriptions.Item label='名称'>{buff?.name || selectedItem}</Descriptions.Item>
            <Descriptions.Item label='ID'>{selectedItem}</Descriptions.Item>
            <Descriptions.Item label='叠加上限'>{buff?.max_stack || 1}层</Descriptions.Item>
            <Descriptions.Item label='持续时间'>
              {buff?.max_tick ? `${buff.max_tick}跳` : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
          {buff?.attrs && Object.keys(buff.attrs).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {Object.entries(buff.attrs).map(([k, v]) => (
                  <Tag key={k} color='green'>
                    {k}={v}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Card>
        <div className={styles.section}>
          <Text strong className={styles.sectionTitle}>
            ◆ 作用的技能 — {skillInfoList.length}个
          </Text>
          <Table
            dataSource={skillInfoList}
            columns={skillColumns}
            rowKey='id'
            size='small'
            pagination={false}
            className={styles.table}
          />
        </div>
      </div>
    )
  }

  // --- 模式3: 计算公式 ---
  const renderFormulaDetail = () => {
    if (!selectedItem) return <Empty description='请搜索并选择一个技能' />

    const parsed = getSkillFormulaParsed(selectedItem)
    if (!parsed.skill) return <Empty description='技能数据未找到' />

    const handleVariableClick = (v: FormulaVariable) => {
      if (v.type === 'recipe') {
        const recipe = getRecipeInfo(v.name)
        setFormulaDetailInfo({
          name: v.displayName,
          desc: recipe?.desc || v.description || '',
        })
      } else if (v.type === 'buff') {
        const buffId = v.name.match(/\d+/)?.[0]
        if (buffId) {
          const buff = getBuffInfo(buffId)
          const attrs = buff?.attrs
            ? Object.entries(buff.attrs).map(([k, val]) => ({ label: k, value: Number(val) }))
            : []
          setFormulaDetailInfo({
            name: v.displayName,
            desc: v.description || buff?.comment || '',
            attrs,
          })
        }
      } else {
        setFormulaDetailInfo({
          name: v.displayName,
          desc: `类型: ${v.type}`,
        })
      }
    }

    return (
      <FormulaViewer
        skillName={parsed.skill.name}
        skillId={parsed.skill.id}
        formulaSegments={parsed.formulaSegments}
        criticalSegments={parsed.criticalSegments}
        attrs={parsed.skill.attrs as unknown as Record<string, string>}
        formulaRaw={parsed.formulaRaw}
        criticalRaw={parsed.criticalRaw}
        onVariableClick={handleVariableClick}
        detailInfo={formulaDetailInfo}
        onCloseDetail={() => setFormulaDetailInfo(null)}
      />
    )
  }

  // --- 搜索结果列表 ---
  const renderSearchResults = () => (
    <div className={styles.resultList}>
      {searchResults.map((item) => (
        <div
          key={item.id}
          className={`${styles.resultItem} ${selectedItem === item.id ? styles.resultItemActive : ''}`}
          onClick={() => handleSelectItem(item)}
        >
          <Space>
            <Tag
              color={
                item.type === 'skill'
                  ? 'blue'
                  : item.type === 'dot'
                    ? 'purple'
                    : item.type === 'buff'
                      ? 'green'
                      : 'orange'
              }
            >
              {item.type === 'skill'
                ? '技能'
                : item.type === 'dot'
                  ? 'DOT'
                  : item.type === 'buff'
                    ? 'Buff'
                    : '秘籍'}
            </Tag>
            <Text>{item.name}</Text>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {item.id.length > 20 ? `${item.id.slice(0, 20)}...` : item.id}
            </Text>
          </Space>
        </div>
      ))}
      {searchResults.length === 0 && searchQuery && (
        <Empty
          description={`未找到匹配的${mode === 'gain' ? '增益' : '技能'}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  )

  const detailDrawerContent = useMemo(() => {
    if (!detailDrawer) return null
    if (detailDrawer.type === 'recipe') {
      const recipe = getRecipeInfo(detailDrawer.id)
      return (
        <Descriptions column={1} bordered size='small'>
          <Descriptions.Item label='名称'>{recipe?.name || detailDrawer.id}</Descriptions.Item>
          <Descriptions.Item label='Key'>{detailDrawer.id}</Descriptions.Item>
          <Descriptions.Item label='效果'>{recipe?.desc || '-'}</Descriptions.Item>
          <Descriptions.Item label='归属技能ID'>{recipe?.skill_id || '-'}</Descriptions.Item>
        </Descriptions>
      )
    }
    const buff = getBuffInfo(detailDrawer.id)
    return (
      <div>
        <Descriptions column={1} bordered size='small'>
          <Descriptions.Item label='名称'>{buff?.name || detailDrawer.id}</Descriptions.Item>
          <Descriptions.Item label='ID'>{detailDrawer.id}</Descriptions.Item>
          <Descriptions.Item label='堆叠'>{buff?.max_stack || 1}层</Descriptions.Item>
          <Descriptions.Item label='跳数'>{buff?.max_tick || 1}</Descriptions.Item>
          <Descriptions.Item label='间隔'>{buff?.interval || '-'}</Descriptions.Item>
        </Descriptions>
        {buff?.attrs && Object.keys(buff.attrs).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>属性加成:</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {Object.entries(buff.attrs).map(([k, v]) => (
                <Tag key={k} color='green'>
                  {k}: {v}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }, [detailDrawer])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Tabs
          activeKey={mode}
          onChange={(k) => {
            setMode(k as typeof mode)
            setSearchQuery('')
            setSearchResults([])
            setSelectedItem(null)
          }}
          items={[
            {
              label: (
                <>
                  <SearchOutlined /> 按技能查
                </>
              ),
              key: 'skill',
            },
            {
              label: (
                <>
                  <SearchOutlined /> 按增益查
                </>
              ),
              key: 'gain',
            },
            {
              label: (
                <>
                  <ThunderboltOutlined /> 计算公式
                </>
              ),
              key: 'formula',
            },
          ]}
          className={styles.tabs}
        />
        <Space className={styles.headerRight}>
          <Text style={{ fontSize: 12 }}>简洁模式</Text>
          <Switch size='small' checked={conciseMode} onChange={setConciseMode} />
        </Space>
      </div>

      <div className={styles.controls}>
        <Select
          showSearch
          value={selectedItem || undefined}
          placeholder={
            mode === 'gain' ? '输入增益名称、ID 或 recipe_key...' : '输入技能名称或ID...'
          }
          filterOption={false}
          onSearch={(val) => {
            handleAutoComplete(val)
          }}
          onSelect={(val, option) => {
            handleSelectSuggestion(val)
          }}
          onClear={() => {
            setSuggestions([])
            setSearchQuery('')
            setSearchResults([])
            setSelectedItem(null)
          }}
          allowClear
          notFoundContent={
            searchQuery ? (
              <Empty description='无匹配结果' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : null
          }
          className={styles.searchInput}
          options={suggestions.map((s) => ({
            label: (
              <Space>
                <Tag
                  color={
                    s.type === 'skill'
                      ? 'blue'
                      : s.type === 'dot'
                        ? 'purple'
                        : s.type === 'buff'
                          ? 'green'
                          : 'orange'
                  }
                  style={{ fontSize: 10, lineHeight: '16px' }}
                >
                  {s.type === 'skill'
                    ? '技能'
                    : s.type === 'dot'
                      ? 'DOT'
                      : s.type === 'buff'
                        ? 'Buff'
                        : '秘籍'}
                </Tag>
                <Text>{s.label}</Text>
              </Space>
            ),
            value: s.value,
          }))}
        />
        <Select
          placeholder='门派'
          options={SCHOOL_OPTIONS}
          value={schoolFilter}
          onChange={setSchoolFilter}
          allowClear
          style={{ width: 120 }}
        />
        {mode !== 'formula' && (
          <Select
            placeholder='类型'
            options={SEARCH_TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
            style={{ width: 100 }}
          />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>{renderSearchResults()}</div>
        <div className={styles.rightPanel}>
          {mode === 'skill' && renderSkillDetail()}
          {mode === 'gain' && renderGainDetail()}
          {mode === 'formula' && renderFormulaDetail()}
        </div>
      </div>

      <Drawer
        title='增益详情'
        open={!!detailDrawer}
        onClose={() => setDetailDrawer(null)}
        width={480}
      >
        {detailDrawerContent}
      </Drawer>
    </div>
  )
}

export default 技能增益查询
