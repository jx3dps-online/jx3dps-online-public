import React, { useEffect } from 'react'
import { Button, Drawer, Form, Select, Tooltip } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { 更新方案数据 } from '@/store/data'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 触发秒伤计算 } from '@/计算模块/计算函数'
import 混池奇穴 from './混池奇穴'
import './index.css'

const { 奇穴数据 = [] } = 获取当前数据()

const 兜底图片 = 'https://icon.jx3box.com/icon/13.png'

const 奇穴选择抽屉: React.FC<any> = (props?: any) => {
  const { value, onChange, open, onClose, ...rest } = props || {}
  const [form] = Form.useForm()

  const dispatch = useAppDispatch()
  const 当前奇穴信息 = value ? value : useAppSelector((state) => state?.data?.当前奇穴信息)

  const handleChangeQixue = (_, values) => {
    const 特殊奇穴索引 = 奇穴数据.findIndex((item) => item.是否为特殊奇穴)

    const newArray = Object.keys(values)
      ?.filter((key, index) => {
        // 排除 'mix' 和特殊奇穴的索引
        if (key === 'mix') return false
        if (特殊奇穴索引 !== -1 && +key === 特殊奇穴索引) return false
        // 只保留常规奇穴（索引 0-5）
        return +key < 6
      })
      .map((key) => {
        return values[key]
      })

    if (values?.mix) {
      newArray.push(...(values?.mix || []))
    }

    // 特殊奇穴（索引10，只有1个）
    if (特殊奇穴索引 !== -1 && values[特殊奇穴索引]) {
      newArray.push(values[特殊奇穴索引])
    }

    if (onChange) {
      onChange(newArray)
    } else {
      dispatch(更新方案数据({ 数据: newArray, 属性: '当前奇穴信息' }))
      dispatch(触发秒伤计算({ 是否更新显示计算结果: true }))
    }
  }

  const 清空奇穴 = () => {
    const newValues = { mix: [] }

    奇穴数据.forEach((重, index) => {
      if (!重.是否为混池) {
        newValues[index] = undefined
      }
    })
    handleChangeQixue({}, newValues)
  }

  // 监听表单变化
  useEffect(() => {
    const 特殊奇穴索引 = 奇穴数据.findIndex((item) => item.是否为特殊奇穴)

    const obj = {}
    const misList: string[] = []
    当前奇穴信息?.forEach((item, index) => {
      if (index >= 6 && index < 10) {
        // 混池奇穴 (索引6-9)
        misList.push(item)
      } else if (特殊奇穴索引 !== -1 && index === 10) {
        // 特殊奇穴（索引8，但实际在数组中的位置）
        obj[特殊奇穴索引] = item
      } else {
        // 常规奇穴 (索引0-5)
        obj[index] = item || undefined
      }
    })
    form?.setFieldsValue({
      ...obj,
      mix: misList,
    })
  }, [当前奇穴信息, form])

  return (
    <Drawer
      title={
        <div className={'qixue-set-drawer-title-wrap'}>
          <div>
            <span>奇穴设置</span>
            <span className={'qixue-set-drawer-title-tip'}>部分循环请勿切换核心奇穴</span>
          </div>
          <Button danger size='small' onClick={清空奇穴}>
            清空奇穴
          </Button>
        </div>
      }
      onClose={() => onClose()}
      open={open}
      placement='bottom'
      height={200}
      className={'qixue-set-drawer'}
      {...rest}
    >
      <Form
        onValuesChange={handleChangeQixue}
        form={form}
        className={`qixue-set-drawer-wrap ${
          奇穴数据?.length === 4 ? 'qixue-set-drawer-wrap-small' : ''
        }`}
      >
        {奇穴数据.map((重, index) => {
          return 重?.是否为混池 ? (
            <Form.Item className={'qixue-set-item'} name={'mix'} key='fix_1'>
              <混池奇穴 />
            </Form.Item>
          ) : (
            <Form.Item
              className={'qixue-set-item'}
              style={{
                ...(index === 0 || index === 5 ? { marginRight: 24 } : {}),
                ...(重?.是否为特殊奇穴 ? { marginLeft: 240 } : {}), // 特殊奇穴右移至混池奇穴栏右侧
              }}
              name={index}
              key={index + 1}
            >
              <Select
                className={'qixue-set-item-select'}
                disabled={重?.是否不可编辑}
                // onChange={handleChangeQixue}
                popupMatchSelectWidth={false}
                optionLabelProp='label'
                // showArrow={false}
                classNames={{
                  popup: { root: 'qixue-set-item-select-popup' },
                }}
              >
                {重?.奇穴列表.map((奇穴) => {
                  return (
                    <Select.Option
                      value={奇穴?.奇穴名称}
                      key={奇穴?.奇穴名称}
                      disabled={奇穴?.是否不可编辑}
                      className={'qixue-set-item-select-option'}
                      label={
                        <div className={'qixue-label'}>
                          <img className={'qixue-label-img'} src={奇穴?.奇穴图片 || 兜底图片} />
                          <span className={'qixue-label-text'}>{奇穴?.奇穴名称}</span>
                        </div>
                      }
                    >
                      <div className='qixue-set-item-select-img-wrap'>
                        <img
                          className={'qixue-set-item-select-img'}
                          src={奇穴?.奇穴图片 || 兜底图片}
                        />
                      </div>
                      <Tooltip title={奇穴?.奇穴描述 || ''} placement='right'>
                        <span className={'qixue-set-item-select-text'}>{奇穴?.奇穴名称}</span>
                      </Tooltip>
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
          )
        })}
      </Form>
    </Drawer>
  )
}

export default 奇穴选择抽屉
