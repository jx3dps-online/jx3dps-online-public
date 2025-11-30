/**
 * 属性置换收益
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Col, Popover, Row, Switch, Tooltip } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 秒伤计算 } from '@/计算模块/计算函数'
import { 收益增益属性计算, 获取当前各属性最大附魔 } from '../../工具'
import { 置换数据信息类型, 置换结果数据类型 } from './interface'
import { CrownFilled } from '@ant-design/icons'
import './index.css'

// 会效收益从175%至300%
const 收益列表 = 获取当前各属性最大附魔()?.filter((item) => !['武伤', '会效']?.includes(item?.收益))
// 过滤武伤和会效

function 属性置换收益() {
  const [置换结果数据, 更新置换结果数据] = useState<置换结果数据类型[]>([])
  const [置换数据信息, 更新置换数据信息] = useState<置换数据信息类型>({
    最大值: 0,
    最小值: 0,
    每行收益最高对象: {},
  })
  const [详细颜色显示, 更新详细颜色显示] = useState<boolean>(false)
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)

  const dispatch = useAppDispatch()

  useEffect(() => {
    初始化置换结果数据()
  }, [当前计算结果?.秒伤])

  const 初始化置换结果数据 = () => {
    const 结果数据 = 获取属性置换图表数据()
    更新置换结果数据(结果数据)
    const 收益结果数组 = 结果数据
      .filter((obj) => obj.收益 !== undefined)
      .map((obj) => obj.收益 || 0)
    const 最大值 = Math.max(...收益结果数组)
    const 最小值 = Math.min(...收益结果数组)

    const 每行收益最高对象 = {}

    结果数据.forEach((obj) => {
      if (obj.减少属性) {
        if (!每行收益最高对象?.[obj.减少属性]) {
          let 最大值对象: 置换结果数据类型 = {
            增加属性: '',
            减少属性: '',
            收益: 0,
          }
          结果数据.forEach((item) => {
            if (item.减少属性 === obj.减少属性 && (item.收益 || 0) > (最大值对象?.收益 || 0)) {
              最大值对象 = item
            }
          })
          每行收益最高对象[obj.减少属性] = 最大值对象
        }
      }
    })

    更新置换数据信息({
      最大值,
      最小值,
      每行收益最高对象,
    })
  }

  // 计算单点增益
  const 计算增加后收益 = (装备基础属性) => {
    const 计算结果 = dispatch(
      秒伤计算({
        是否郭氏计算: true,
        更新装备信息: {
          ...装备信息,
          装备基础属性: {
            ...装备信息?.装备基础属性,
            ...装备基础属性,
          },
        },
        计算技能详情: false,
      }),
    )
    return 计算结果
  }

  const 获取属性置换图表数据 = () => {
    const 结果数组: 置换结果数据类型[] = []
    收益列表.forEach((增加数据) => {
      收益列表.forEach((减少数据) => {
        // 增加对应数值
        const 增益后装备基础数据 = 收益增益属性计算(
          增加数据?.收益,
          增加数据?.值,
          装备信息?.装备基础属性,
        )
        // 减少对应数值
        const 减少数据后装备基础数据 = 收益增益属性计算(
          减少数据?.收益,
          -减少数据?.值,
          增益后装备基础数据,
        )
        const { 秒伤: 新秒伤 } = 计算增加后收益(减少数据后装备基础数据)
        const 收益 = Number(新秒伤 - 当前计算结果?.秒伤)
        const 收益结果 = Number(收益.toFixed(0))
        结果数组.push({
          增加属性: `+${增加数据?.收益}`,
          减少属性: `-${减少数据?.收益}`,
          收益: 收益结果 == 0 ? undefined : 收益结果,
        })
      })
    })

    return 结果数组
  }

  // 根据数值判断
  const 获取具体样式函数 = (显示结果?: 置换结果数据类型) => {
    if (!显示结果 || !详细颜色显示) {
      return {}
    }
    const 亮度最大值 = 45
    const 亮度最小值 = 15
    const 收益 = 显示结果?.收益 || 0
    if (收益 === 置换数据信息?.最大值) {
      return {
        backgroundColor: `hsl(140 60% 12% / 1)`,
        border: `2px solid rgba(255,255,255,0.9)`,
      }
    } else if (收益 > 0) {
      // 获取三个等级的数值
      const 亮度 = 亮度最大值 - (收益 / 置换数据信息?.最大值) * (亮度最大值 - 亮度最小值)
      return {
        backgroundColor: `hsl(140 60% ${亮度}% / 1)`,
      }
    } else if (收益 < 0) {
      const 亮度 = 亮度最大值 - (收益 / 置换数据信息?.最小值) * (亮度最大值 - 亮度最小值)
      return {
        backgroundColor: `hsl(0 60% ${亮度}% / 0.9)`,
      }
    }
  }

  // 根据数值判断
  const 获取颜色样式名函数 = (显示结果?: 置换结果数据类型) => {
    const 收益 = 显示结果?.收益 || 0
    if (!显示结果 || 详细颜色显示) {
      return ''
    } else if (收益 === 置换数据信息?.最大值) {
      return 'attr-value-max'
    } else if (收益 === 置换数据信息?.最小值) {
      return 'attr-value-min'
    } else if (收益 > 0) {
      // 获取三个等级的数值
      const 一级数据 = 置换数据信息?.最大值 / 2.5
      if (收益 < 一级数据) {
        return 'attr-value-up-1'
      } else {
        return 'attr-value-up-2'
      }
    } else if (收益 < 0) {
      // 获取三个等级的数值
      const 一级数据 = 置换数据信息?.最小值 / 2.5
      if (收益 > 一级数据) {
        return 'attr-value-low-1'
      } else {
        return 'attr-value-low-2'
      }
    }
  }

  const 获取是否为单行最高值 = (显示结果?: 置换结果数据类型) => {
    if (!显示结果) {
      return false
    }
    const 该行数据 = 置换数据信息?.每行收益最高对象?.[显示结果?.减少属性] || undefined
    if (该行数据) {
      return 该行数据?.增加属性 === 显示结果?.增加属性
    } else {
      return false
    }
  }

  const 获取属性置换排序展示 = (减少属性) => {
    const 结果数据 = useMemo(() => {
      const 全部该属性数据 = 置换结果数据?.filter(
        (item) => item?.减少属性 === `-${减少属性?.收益}` && item?.收益 !== undefined,
      )
      全部该属性数据.sort((a, b) => {
        return (b.收益 || 0) - (a.收益 || 0)
      })
      return 全部该属性数据 || []
    }, [置换结果数据, 减少属性])

    return (
      <div>
        {结果数据?.map((item, index) => {
          return (
            <div className='attr-replace-tip-item' key={`减少属性_${减少属性?.收益}_${index}`}>
              <span
                className={`attr-replace-tip-label ${
                  item?.收益 && item?.收益 > 0 ? 'attr-replace-tip-label-up' : ''
                }`}
              >
                {item?.增加属性}
              </span>
              <span
                className={`attr-replace-tip-num ${
                  item?.收益 && item?.收益 > 0 ? 'attr-replace-tip-num-up' : ''
                }`}
              >
                {item?.收益 && item?.收益 > 0 ? '+' : ''}
                {item?.收益}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className='attr-replace'>
      <div className='attr-replace-btns'>
        <Tooltip title='切换图表的颜色展示模式，详细颜色模式和简易颜色模式'>
          <Switch
            size='small'
            checkedChildren={'详细'}
            unCheckedChildren={'简易'}
            value={详细颜色显示}
            onChange={(e) => 更新详细颜色显示(e)}
          />
        </Tooltip>
      </div>
      <Row className='attr-replace-table'>
        <Col className='attr-replace-header'>收益</Col>
        {收益列表.map((附魔) => {
          return (
            <Col className='attr-replace-header-item' key={`header_${附魔?.收益}`}>
              <div>
                <h1 className='attr-replace-name'>{附魔?.收益}</h1>
                <p className='attr-replace-name-value'>+{附魔?.值}</p>
              </div>
            </Col>
          )
        })}
      </Row>
      {收益列表.map((减少属性, 索引) => {
        return (
          <Row key={`减少属性_${索引}`}>
            <Col className='attr-replace-item attr-replace-sider'>
              <Popover
                overlayStyle={{ width: 130 }}
                title='属性置换排序'
                content={获取属性置换排序展示(减少属性)}
              >
                <div>
                  <h1 className='attr-replace-name'>{减少属性?.收益}</h1>
                  <p className='attr-replace-name-value'>-{减少属性?.值}</p>
                </div>
              </Popover>
            </Col>
            {收益列表.map((增加属性) => {
              const 显示结果 = 置换结果数据?.find(
                (item) =>
                  item?.增加属性 === `+${增加属性?.收益}` &&
                  item?.减少属性 === `-${减少属性?.收益}`,
              )
              const 颜色样式名函数 = 获取颜色样式名函数(显示结果)
              const 具体样式函数 = 获取具体样式函数(显示结果)
              // 是否为单行最高值
              const 单行最高值 = 获取是否为单行最高值(显示结果)
              return (
                <Col
                  className={`attr-replace-item attr-replace-res`}
                  key={`减少属性_${增加属性?.收益}_${索引}`}
                >
                  {单行最高值 ? (
                    <CrownFilled className='attr-repace-icon attr-repace-item-icon' />
                  ) : null}
                  <div className={`attr-replace-res-text`}>
                    {显示结果?.收益 && 显示结果?.收益 > 0 ? '+' : ''}
                    {显示结果?.收益 || '-'}
                  </div>
                  <div className={`attr-replace-res-bg ${颜色样式名函数}`} style={具体样式函数} />
                </Col>
              )
            })}
          </Row>
        )
      })}
    </div>
  )
}

export default React.memo(属性置换收益)

export const 附魔属性置换收益信息 = [
  {
    label: '属性置换',
    list: [],
    tip: (
      <div>
        <p>既同分容量下，该属性替换为另一个属性后秒伤变化展示</p>
        <p>用于局部分析当前某属性收益较其他属性收益低的情况</p>
        <p>也可用于分析某附魔汰换的收益期望</p>
        <p>X轴：增加对应属性附魔数值</p>
        <p>Y轴：减少增加对应属性附魔数值</p>
        <p>
          <CrownFilled className='attr-repace-icon' />： 同行内提升最高的数值
        </p>
        <p>表格数值不共轭的原因为：计算采用游戏内的郭氏算法进行计算，各属性存在计算阈值。</p>
      </div>
    ),
  },
]
