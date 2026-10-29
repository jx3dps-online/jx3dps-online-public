import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import { use心法数据 } from '@/心法模块/心法上下文'
import styles from './index.module.less'
import { 奇穴数据类型 } from '@/@types/奇穴'
import { Modal, Popover } from 'antd'

const 兜底图片 = 'https://icon.jx3box.com/icon/13.png'

const 混池奇穴: React.FC<any> = forwardRef((props: any, _) => {
  const { 奇穴数据 = [] } = use心法数据()
  const { value, onChange } = props || {}

  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const [selected, setSelected] = useState<string[]>(value || [])

  useEffect(() => {
    setSelected(value || [])
  }, [value])

  const handleSelect = (奇穴名称) => {
    let newSelected = [...selected]
    if (newSelected.includes(奇穴名称)) {
      newSelected = newSelected.filter((item) => item !== 奇穴名称)
    } else {
      if (newSelected.length < 3) {
        newSelected.push(奇穴名称)
      } else {
        newSelected.shift()
        newSelected.push(奇穴名称)
      }
    }
    setSelected(newSelected)
  }

  const handleSubmit = () => {
    if (onChange) {
      onChange(selected)
    }
    setModalOpen(false)
  }

  const 已选奇穴信息: 奇穴数据类型[] = useMemo(() => {
    const 混池列表 = 奇穴数据?.find((item) => item.是否为混池)?.奇穴列表
    return value?.length
      ? value
          ?.map((item) => {
            return 混池列表?.find((qx) => qx.奇穴名称 === item) || {}
          })
          ?.filter((item, index) => item?.奇穴名称 && index < 3)
      : []
  }, [value, 奇穴数据])

  return (
    <>
      <div className={styles.mixWrap} onClick={() => setModalOpen(true)}>
        {已选奇穴信息?.length
          ? 已选奇穴信息.map((item, index) => {
              return (
                <div className={styles.mixItem} key={`mix_${item.id || index}_${item?.奇穴名称}`}>
                  <img className={styles.mixItemImg} src={item?.奇穴图片 || 兜底图片} />
                  <span className={styles.mixItemText}>{item?.奇穴名称}</span>
                </div>
              )
            })
          : '未选择'}
      </div>
      <Modal
        open={modalOpen}
        title='混池奇穴选择'
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >
        <div className={styles.modalWrap}>
          {奇穴数据
            ?.find((item) => item.是否为混池)
            ?.奇穴列表?.map((item) => {
              const isActive = selected?.some((qx) => qx === item.奇穴名称)
              return (
                <Popover
                  key={`mix_in_${item.id}${item?.奇穴名称}`}
                  title={item?.奇穴名称}
                  content={item?.奇穴描述}
                  styles={{ body: { maxWidth: '500px' } }}
                >
                  <div
                    onClick={() => handleSelect(item?.奇穴名称)}
                    className={`${styles.mixItem} ${styles.modalMixItem} ${
                      isActive ? styles.active : ''
                    }`}
                  >
                    <img className={styles.modalImg} src={item?.奇穴图片 || 兜底图片} />
                    <span className={styles.modalText}>{item?.奇穴名称}</span>
                  </div>
                </Popover>
              )
            })}
        </div>
      </Modal>
    </>
  )
})

export default 混池奇穴
