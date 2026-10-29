import useCycle from '@/hooks/use-cycle'
import { Alert, Divider, Select } from 'antd'
import { useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks'
import 校验结果 from './校验结果'
import styles from './index.module.less'

const 循环伤害校验 = () => {
  const [当前待校验循环数据, 设置当前待校验循环数据] = useState<string>()
  const 装备信息 = useAppSelector((state) => state?.data?.装备信息)
  const 增益数据 = useAppSelector((state) => state?.data?.增益数据)
  const 增益启用 = useAppSelector((state) => state?.data?.增益启用)
  const 网络延迟 = useAppSelector((state) => state?.data?.网络延迟)

  const { 全部循环 = [] } = useCycle()

  const 支持校验循环列表 = useMemo(() => {
    return 全部循环?.filter((a) => a?.循环详情?.some((b) => b?.支持伤害校验))
  }, [全部循环])

  const 实际计算循环数据 = useMemo(() => {
    if (当前待校验循环数据) {
      const 实际循环数据 = useCycle({
        覆盖数据: {
          装备信息,
          增益数据,
          增益启用,
          网络延迟,
          当前计算循环名称: 当前待校验循环数据,
          自定义循环列表: 支持校验循环列表,
        },
        使用内存数据: false,
      })
      return { 计算循环详情: 实际循环数据?.计算循环详情, 当前循环信息: 实际循环数据?.当前循环信息 }
    } else {
      return null
    }
  }, [当前待校验循环数据, 支持校验循环列表, 装备信息, 增益数据, 增益启用, 网络延迟])

  return (
    <div>
      <Alert
        type='error'
        message={
          <div>
            <p>需先在解析JCL处生成支持校验的循环</p>
            <p>检查秘籍、奇穴、保证属性完全一致、不要携带无封</p>
            <p>
              推测异常增益可能会由于部分增益组合计算导致异常，仅供参考，优先处理出现频率较高的异常增益
            </p>
          </div>
        }
        style={{ marginBottom: 12 }}
      />
      <Select
        className={styles.cycleSelect}
        value={当前待校验循环数据}
        allowClear
        placeholder='请选择要对比的循环'
        notFoundContent={'没有支持校验的循环，请至JCL解析处生成'}
        onChange={(e) => 设置当前待校验循环数据(e)}
        options={支持校验循环列表?.map((a) => {
          return {
            label: a?.标题 || a?.名称,
            value: a?.名称,
          }
        })}
      />
      <Divider style={{ margin: '12px 0' }} />
      {当前待校验循环数据 ? (
        !实际计算循环数据 ? (
          <p className={styles.noData}>未获取可计算循环，请检查循环是否正确保存</p>
        ) : (
          <校验结果
            计算循环详情={实际计算循环数据?.计算循环详情}
            当前循环信息={实际计算循环数据?.当前循环信息}
          />
        )
      ) : (
        <p className={styles.noData}>请先选择要校验的循环</p>
      )}
    </div>
  )
}

export default 循环伤害校验
