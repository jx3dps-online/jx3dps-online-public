import { Alert, Button, message, Modal, ModalProps, Spin } from 'antd'
import ServerCascader from '@/组件/ServerCascader'
import { useEffect, useState } from 'react'
import { getEquipPriceList } from '@/api'
import { 展示装备数据列表类型 } from '../interface'
import './index.css'

interface 导入交易行价格弹窗类型 extends ModalProps {
  展示装备数据列表: 展示装备数据列表类型[]
  导入价格: (e: any[]) => void
}

const 导入交易行价格弹窗: React.FC<导入交易行价格弹窗类型> = (props) => {
  const { 展示装备数据列表, 导入价格, ...rest } = props
  const [server, changeServer] = useState<string>()
  const [结果数据, 更新结果数据] = useState<any[]>([])
  const [结果总结, 更新结果总结] = useState({ 成功: 0, 失败: 0 })
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!props.open) {
      更新结果数据([])
      setLoading(false)
      更新结果总结({ 成功: 0, 失败: 0 })
      changeServer(undefined)
    }
  }, [props.open])

  const 查询交易行数据 = async () => {
    setLoading(true)
    // const res = demo
    try {
      // const res = demo
      const res = await getEquipPriceList({
        itemIds: 展示装备数据列表
          ?.map((item) => `${装备位置映射[item?.装备部位]}_${item?.id}`)
          ?.join(','),
        server: server?.[1],
      })

      const resData = 展示装备数据列表
        .map((item) => {
          const 价格数据 =
            res?.data?.data?.[`${装备位置映射[item?.装备部位]}_${item?.id}`] || undefined
          return {
            ...item,
            价格数据,
          }
        })
        .filter((item) => item?.价格数据)

      if (!resData?.length) {
        message.error('获取价格错误')
      }

      setLoading(false)
      更新结果数据(resData)
      // const 成功条数 = Object.keys(res?.data)?.length
      更新结果总结({
        成功: resData?.length,
        失败: 展示装备数据列表.length - resData?.length,
      })
    } catch (e) {
      message.error('获取价格错误')
      setLoading(false)
    }
  }

  const 导入 = () => {
    if (!结果数据?.length) {
      return
    }
    导入价格?.(结果数据.filter((item) => item?.价格数据))
  }

  return (
    <Modal
      title='导入交易行价格'
      okText='导入'
      onOk={导入}
      okButtonProps={{ disabled: !结果总结?.成功 }}
      {...rest}
    >
      <Spin spinning={loading}>
        <div className={'wufeng-daoru-wrap'}>
          <Alert message='获取该服务器交易行昨日最低价，和商人价格有出入，仅供参考。' />
          <div className={'wufeng-daoru-form-content'}>
            <ServerCascader
              className={'wufeng-daoru-form-item'}
              value={server}
              onChange={(e) => {
                changeServer(e)
              }}
            />
            <Button type='primary' onClick={() => 查询交易行数据()}>
              查询价格
            </Button>
          </div>
          {结果总结?.成功 ? (
            <div className='wufeng-daru-res-warp'>
              <p className='wufeng-daru-res-text'>
                已成功获取
                <span className='wufeng-daru-res-text-count wufeng-daru-res-success'>
                  {结果总结?.成功}
                </span>
                件装备价格数据
              </p>
              <p className='wufeng-daru-res-text'>
                获取失败
                <span className='wufeng-daru-res-text-count wufeng-daru-res-error'>
                  {结果总结?.失败}
                </span>
                件装备价格数据
              </p>
            </div>
          ) : null}
        </div>
      </Spin>
    </Modal>
  )
}

export default 导入交易行价格弹窗

const 装备位置映射 = {
  暗器: 6,
  帽子: 7,
  项链: 8,
  腰坠: 8,
  下装: 7,
  鞋子: 7,
  护腕: 7,
}
