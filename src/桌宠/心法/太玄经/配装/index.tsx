import { Flex } from 'antd'
import { useLayoutEffect, useRef, useState } from 'react'
import 配装 from '@/功能模块/攻略/components/配装'
import 子不语十人毕业 from './子不语十人毕业.json'
import 子不语普通毕业 from './子不语PT毕业.json'
import 子不语英雄毕业 from './子不语YX毕业.json'
import 紫武十人毕业 from './紫武十人毕业.json'
import 紫武普通毕业 from './紫武PT毕业.json'
import 紫武英雄毕业 from './紫武YX毕业.json'
import styles from './index.module.less'

export default function 推荐配装({ 标题边框 = false }: { 标题边框?: boolean } = {}) {
  const 内容容器 = useRef<HTMLDivElement>(null)
  const [配装缩放, 设置配装缩放] = useState(0.38)
  const 标题类名 = 标题边框 ? styles.边框标题 : styles.分组标题

  useLayoutEffect(() => {
    const 容器 = 内容容器.current
    if (!容器) return
    const 更新缩放 = () => {
      if (!容器.clientWidth) return
      设置配装缩放(Math.min(1, (容器.clientWidth - 2 * (12 + 1)) / 1120))
    }
    更新缩放()
    const 观察器 = new ResizeObserver(更新缩放)
    观察器.observe(容器)
    return () => 观察器.disconnect()
  }, [])

  return (
    <div ref={内容容器} className={styles.推荐配装}>
      <p>配装推荐：</p>
      <p>yx精简和无封装备可能还会改，这里仅供参考</p>
      <p>还是推荐根据自己实际情况去按计算器，推荐配装仅供参考</p>
      <Flex vertical gap='middle'>
        <section>
          <h3 className={标题类名}>子不语</h3>
          <Flex vertical gap='middle'>
            {[
              {
                名称: '子不语十人毕业',
                数据: 子不语十人毕业,
                备注: '药都吃攻击，阵眼：和尚>段氏（风籁）>莫问>田螺>段氏（蛰微）',
              },
              {
                名称: '子不语PT毕业',
                数据: 子不语普通毕业,
                备注: '药都吃攻击，阵眼：和尚>段氏（风籁）>莫问>田螺>段氏（蛰微）',
              },
              {
                名称: '子不语YX毕业',
                数据: 子不语英雄毕业,
                备注: '药都吃攻击，阵眼：和尚>田螺>莫问>段氏（风籁）>万灵',
                阵眼收益:
                  '易筋阵 100.00% > 天罗阵 99.44% > 莫问阵 99.27% > 段氏阵（风籁）98.75% > 万灵阵 98.27%',
              },
            ].map(({ 名称, 数据, 备注, 阵眼收益 }) => (
              <Flex key={名称} vertical gap='small'>
                <strong>{名称}</strong>
                {阵眼收益 ? <span>阵眼收益：{阵眼收益}</span> : null}
                <配装
                  名称={名称}
                  创建人='小满胜万全'
                  备注={备注}
                  视图='配装页面'
                  缩放={配装缩放}
                  配装数据={数据}
                />
              </Flex>
            ))}
          </Flex>
        </section>
        <section>
          <h3 className={标题类名}>紫武</h3>
          <Flex vertical gap='middle'>
            {[
              {
                名称: '紫武十人毕业',
                数据: 紫武十人毕业,
                备注: '药都吃攻击，阵眼：和尚>段氏（风籁）>莫问>段氏（蛰微）>花间',
              },
              {
                名称: '紫武PT毕业',
                数据: 紫武普通毕业,
                备注: '药都吃攻击，阵眼：和尚>段氏（风籁）>莫问>田螺>段氏（蛰微）',
              },
              {
                名称: '紫武YX毕业',
                数据: 紫武英雄毕业,
                备注: '药都吃攻击，阵眼：和尚>田螺>莫问>段氏（风籁）>万灵',
                阵眼收益:
                  '易筋阵 100.00% > 天罗阵 99.35% > 莫问阵 99.24% > 段氏阵（风籁）98.70% > 万灵阵 98.25%',
              },
            ].map(({ 名称, 数据, 备注, 阵眼收益 }) => (
              <Flex key={名称} vertical gap='small'>
                <strong>{名称}</strong>
                {阵眼收益 ? <span>阵眼收益：{阵眼收益}</span> : null}
                <配装
                  名称={名称}
                  创建人='小满胜万全'
                  备注={备注}
                  视图='配装页面'
                  缩放={配装缩放}
                  配装数据={数据}
                />
              </Flex>
            ))}
          </Flex>
        </section>
      </Flex>
    </div>
  )
}
