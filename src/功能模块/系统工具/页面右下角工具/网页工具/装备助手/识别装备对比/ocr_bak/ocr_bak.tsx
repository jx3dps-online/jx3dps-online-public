// import { Button, Modal, ModalProps, Spin, message, Upload, Popover, Form, Input, Alert } from 'antd'
// import { InboxOutlined, QuestionCircleOutlined } from '@ant-design/icons'
// import React, { useEffect, useRef, useState } from 'react'
// import * as ocr from '@paddlejs-models/ocr'
// import 获取当前数据 from '@/数据/数据工具/获取当前数据'
// import { 装备属性信息模型 } from '@/@types/装备'
// import { isOnlyOneCharDifferent, keepChineseChars } from './util'
// import { useAppDispatch, useAppSelector } from '@/hooks'
// import 根据装备信息获取基础属性 from '@/功能模块/基础设置/属性录入/配装器/工具函数/根据装备信息获取基础属性'
// import { 角色默认基础属性 } from '@/工具函数/init/默认数据'
// import { 获取最大精炼等级 } from '@/功能模块/基础设置/属性录入/配装器/功能组件/装备选择'
// import { 秒伤计算 } from '@/计算模块/计算函数'
// import './index.css'

// const { Dragger } = Upload

// const { 装备数据 } = 获取当前数据()

// const Ocr识别装备对比: React.FC<ModalProps> = (props) => {
//   const [previewImage, setPreviewImage] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [initLoading, setInitLoading] = useState(false)
//   const [dpsLoading, setDpsLoading] = useState(false)
//   const [initEd, setInitEd] = useState(false)
//   const equipData = useRef<装备属性信息模型[]>([])
//   const [form] = Form.useForm()
//   const [matchRes, setMatchRes] = useState<{ 匹配: string[]; 未匹配: string[] }>({
//     匹配: [],
//     未匹配: [],
//   })
//   const [dpsDiffMap, setDpsDiffMap] = useState<{ [key: string]: number } | undefined>(undefined)
//   const dispatch = useAppDispatch()

//   const 当前计算结果 = useAppSelector((state) => state?.data?.当前计算结果)
//   const 装备信息 = useAppSelector((state) => state?.data?.装备信息)

//   useEffect(() => {
//     if (props.open) {
//       if (!initEd) {
//         initOCR()
//         initEquip()
//       }
//       document.addEventListener('paste', listenerPaste)
//     } else {
//       document.removeEventListener('paste', listenerPaste)
//       reset()
//     }
//   }, [props.open, initEd])

//   const reset = () => {
//     setInitLoading(false)
//     setLoading(false)
//     setDpsLoading(false)
//     setPreviewImage('')
//     setMatchRes({ 匹配: [], 未匹配: [] })
//     setDpsDiffMap(undefined)
//   }

//   // 初始化OCR模块
//   const initOCR = async () => {
//     setInitLoading(true)
//     await ocr.init()
//     setInitEd(true)
//     setInitLoading(false)
//   }

//   // 初始化装备数据
//   const initEquip = () => {
//     const list: 装备属性信息模型[] = []
//     Object.keys(装备数据).map((装备部位) => {
//       const 当前部位数据 = 装备数据[装备部位]
//       当前部位数据.forEach((装备) => {
//         if (!装备?.装备名称?.includes('无封')) {
//           list.push({ ...装备, 装备部位 })
//         }
//       })
//     })
//     equipData.current = list
//   }

//   // 初始化监听粘贴模块
//   const listenerPaste = (event) => {
//     const clipboardData = event.clipboardData || window.clipboardData
//     if (clipboardData && !loading && !initLoading) {
//       const items = clipboardData.items
//       if (items && items.length) {
//         for (let i = 0; i < items.length; i++) {
//           if (items[i].type.indexOf('image') !== -1) {
//             const img = items[i].getAsFile()
//             handleFileChange(img)
//           }
//         }
//       }
//     }
//   }

//   // 上传图片
//   const handleFileChange = (e) => {
//     const file = e
//     const reader = new FileReader()
//     reader.readAsDataURL(file)
//     reader.onload = () => {
//       if (reader.result) {
//         setPreviewImage(reader.result as any)
//       }
//     }
//   }

//   // 开始OCR解析图片文字
//   const handleOcrImage = async () => {
//     if (loading) {
//       return
//     }
//     setLoading(true)
//     try {
//       const ImgDocument = document.getElementById('ocr_img')
//       const res = await ocr.recognize(ImgDocument)
//       const list = res.text.filter((item) => item)
//       if (list.length) {
//         handleGetEquip(list)
//       } else {
//         message.error('未解析到装备，请根据使用说明检查图片情况，重新上传。')
//         setLoading(false)
//       }
//     } catch {
//       message.error('解析发生异常错误，请重试')
//       setLoading(false)
//       reset()
//     }
//   }

//   // 根据图片文字解析装备列表
//   const handleGetEquip = (list) => {
//     const res: string[] = []
//     const notMatch: string[] = []
//     for (let i = 0; i < list.length; i++) {
//       // 匹配必须包含中文才进行计算匹配
//       if (/[\u4e00-\u9fa5]/.test(list[i])) {
//         let match = false
//         // 匹配名字完全相同的装备
//         for (let j = 0; j < equipData?.current?.length; j++) {
//           if (equipData?.current?.[j]?.装备名称 === list[i] && !res?.includes(list[i])) {
//             res.push(list[i])
//             match = true
//             break
//           }
//         }
//         // 匹配名字包含文字的
//         if (!match) {
//           for (let j = 0; j < equipData?.current?.length; j++) {
//             if (
//               (equipData?.current?.[j]?.装备名称?.includes(list[i]) ||
//                 list[i]?.includes(equipData?.current?.[j]?.装备名称)) &&
//               !res?.includes(equipData?.current?.[j]?.装备名称)
//             ) {
//               res.push(equipData?.current?.[j]?.装备名称)
//               match = true
//               break
//             }
//           }
//         }
//         // 匹配名字中只有一个字不匹配的
//         if (!match) {
//           for (let j = 0; j < equipData?.current?.length; j++) {
//             if (
//               isOnlyOneCharDifferent(equipData?.current?.[j]?.装备名称, list[i]) &&
//               !res?.includes(equipData?.current?.[j]?.装备名称)
//             ) {
//               res.push(equipData?.current?.[j]?.装备名称)
//               match = true
//               break
//             }
//           }
//         }
//         if (!match && keepChineseChars(list[i])?.length > 1 && !notMatch?.includes(list[i])) {
//           notMatch.push(keepChineseChars(list[i]))
//         }
//       }
//     }

//     const matchList = res.filter((item) => !item?.includes('无封'))

//     if (matchList?.length) {
//       setMatchRes({
//         匹配: matchList,
//         未匹配: notMatch,
//       })
//       const obj = {}
//       matchList.forEach((i, index) => {
//         obj[`match_${index}`] = i
//       })
//       notMatch.forEach((i, index) => {
//         obj[`not_match_${index}`] = i
//       })
//       form.setFieldsValue({
//         ...obj,
//       })
//       getDpsDiff(matchList)
//     } else {
//       setLoading(false)
//       message.error('未解析到装备，请根据使用说明检查图片情况，重新上传。')
//       return
//     }
//   }

//   // 获取dps对比列表
//   const getDpsDiff = (list) => {
//     const obj: { [key: string]: number } = {}
//     setLoading(false)
//     setDpsLoading(true)
//     list.forEach((item) => {
//       const afterDpsDiff = getEquipDiffDps(item)
//       if (afterDpsDiff !== undefined) {
//         obj[item] = afterDpsDiff
//       }
//     })
//     setDpsLoading(false)
//     setDpsDiffMap(obj)
//   }

//   // 获取装备dps差
//   const getEquipDiffDps = (name): number | undefined => {
//     const 找到对应装备数据 = equipData?.current?.find((item) => item?.装备名称 === name)
//     if (找到对应装备数据 && !name?.includes('无封')) {
//       const 被替换的装备 = 装备信息.装备列表.find(
//         (item) => item.装备部位 === 找到对应装备数据?.装备部位
//       )
//       const 装备最大精炼等级 = 获取最大精炼等级(找到对应装备数据)

//       const 新装备列表 = 装备信息.装备列表.map((item) => {
//         if (item.装备部位 !== 找到对应装备数据?.装备部位) {
//           return item
//         } else {
//           return {
//             id: 找到对应装备数据.id,
//             装备名称: 找到对应装备数据.装备名称,
//             装备部位: 找到对应装备数据?.装备部位,
//             当前精炼等级: 装备最大精炼等级,
//             镶嵌孔数组: 找到对应装备数据?.镶嵌孔数组?.map((a, index) => {
//               return {
//                 ...a,
//                 镶嵌宝石等级: 被替换的装备?.镶嵌孔数组?.[index]?.镶嵌宝石等级 || 8,
//               }
//             }),
//             附魔: 被替换的装备?.附魔,
//           } as any
//         }
//       })

//       const 更新后装备信息 = 根据装备信息获取基础属性({
//         ...装备信息,
//         装备基础属性: { ...角色默认基础属性 },
//         装备列表: 新装备列表,
//       })

//       const { 秒伤: 更新后秒伤 } = dispatch(秒伤计算({ 更新装备信息: 更新后装备信息 }))
//       return 更新后秒伤 - 当前计算结果?.秒伤
//     } else {
//       return undefined
//     }
//   }

//   // 对比结果显示组件
//   const DiffDpsRes = ({ data = 0 }) => {
//     return (
//       <div
//         className={`ocr-diff-dps-res-number ${
//           data > 0 ? 'ocr-diff-dps-res-up' : data < 0 ? 'ocr-diff-dps-res-down' : ''
//         }`}
//       >
//         {data > 0 ? `+` : ''}
//         {data == 0 ? undefined : data}
//       </div>
//     )
//   }

//   // 重新获取表单，计算Dps
//   const handleGetDps = () => {
//     form?.validateFields()?.then((values) => {
//       getFormDps(values)
//     })
//   }

//   // 根据表单获取dps
//   const getFormDps = (values) => {
//     getDpsDiff(Object.keys(values).map((key) => values[key]))
//   }

//   return (
//     <Modal
//       className={'ocr-modal'}
//       width={1024}
//       maskClosable={false}
//       title={
//         <div className={'ocr-modal-header'}>
//           <h1 className={'ocr-modal-title'}>
//             识别装备对比
//             <Popover
//               title='使用须知'
//               content={
//                 <div>
//                   <h1 className={'ocr-modal-tip-title'}>使用注意</h1>
//                   <p>在使用前请在配装器内提前录入您的配装，以便于后续的对比</p>
//                   <p>
//                     您可以打本时后台同步开启本网页弹窗。在打本结束后截图掉落列表，切换到本网页进行粘贴，以进行快速识别
//                   </p>
//                   <p>
//                     该功能本质上是配装器内的智能对比功能，仅作为快速识别掉落列表中多个装备的情况使用
//                   </p>
//                   <p>
//                     本功能使用免费OCR工具解析，解析精度不稳定，可能导致装备识别错误/错位的情况，
//                     <span style={{ color: '#F34242' }}>仅供娱乐</span>
//                   </p>
//                   <p>如果出现识别错误，您可以通过手动修改装备名字/根据下方帮助提高图片识别精度</p>
//                   <h1 className={'ocr-modal-tip-title'}>如何提高识别精度</h1>
//                   <p>1、使用纯色的掉落列表背景，不使用透明度的背景。</p>
//                   <p>2、截图只截图装备列表，去除无用的信息以提高识别精度。</p>
//                   <p>3、使用系统默认的字体，不使用用自定义的字体如楷体等</p>
//                   <p>4、部分门派使用系统内置掉落列表，识别准度高于插件掉落列表</p>
//                 </div>
//               }
//             >
//               <span className={'ocr-modal-tip-text'}>
//                 使用须知
//                 <QuestionCircleOutlined className={'ocr-modal-tip-icon'} />
//               </span>
//             </Popover>
//           </h1>
//           <div className={'ocr-modal-header-operates'}>
//             {previewImage && (
//               <>
//                 <Button onClick={() => reset()}>重新上传</Button>
//                 {matchRes?.匹配?.length ? (
//                   <Button
//                     loading={loading}
//                     type='primary'
//                     onClick={handleGetDps}
//                     style={{ marginLeft: 12 }}
//                   >
//                     重新计算
//                   </Button>
//                 ) : (
//                   <Button
//                     loading={loading}
//                     type='primary'
//                     onClick={handleOcrImage}
//                     style={{ marginLeft: 12 }}
//                   >
//                     开始解析
//                   </Button>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       }
//       centered
//       {...props}
//       footer={false}
//     >
//       <Spin
//         spinning={initLoading || loading || dpsLoading}
//         className={'ocr-spnning'}
//         // spinning={true}
//         tip={
//           initLoading
//             ? 'OCR模块加载中，请耐心等待...'
//             : dpsLoading
//             ? '计算装秒伤中，请稍后...'
//             : '解析秒伤提升中，请稍后...'
//         }
//       >
//         {previewImage ? (
//           matchRes?.匹配?.length ? (
//             <>
//               {matchRes?.未匹配?.length ? (
//                 <Alert
//                   style={{ marginBottom: 12 }}
//                   type='info'
//                   message='存在未识别文字，你可以手动修改未识别文字输入框内的装备名称，失去焦点后自动计算'
//                 />
//               ) : null}
//               <div className={'ocr-res-wrap'}>
//                 <img src={previewImage} className={'ocr-res-img'} />
//                 <div className={'ocr-form'}>
//                   <Form form={form}>
//                     {matchRes?.匹配.map((item, index) => {
//                       const isUpEquip = dpsDiffMap?.[item] && dpsDiffMap?.[item] > 0
//                       return (
//                         <div
//                           className={`ocr-match-item ${isUpEquip ? 'ocr-match-up-item' : ''}`}
//                           key={`match_${index}`}
//                         >
//                           <Form.Item label={null} name={`match_${index}`}>
//                             <Input disabled />
//                           </Form.Item>
//                           {dpsDiffMap?.[item] !== undefined ? (
//                             <DiffDpsRes data={dpsDiffMap?.[item]} />
//                           ) : null}
//                         </div>
//                       )
//                     })}
//                     {matchRes?.未匹配.map((item, index) => {
//                       const currentVal = form?.getFieldsValue()?.[`not_match_${index}`]
//                       const isUpEquip = dpsDiffMap?.[currentVal] && dpsDiffMap?.[currentVal] > 0
//                       return (
//                         <div
//                           className={`ocr-match-item ${isUpEquip ? 'ocr-match-up-item' : ''}`}
//                           key={`not_match_${index}`}
//                         >
//                           <Form.Item label={null} name={`not_match_${index}`}>
//                             <Input
//                               maxLength={10}
//                               placeholder='请输入'
//                               onBlur={() => handleGetDps()}
//                             />
//                           </Form.Item>
//                           {dpsDiffMap?.[currentVal] !== undefined ? (
//                             <DiffDpsRes data={dpsDiffMap?.[currentVal]} />
//                           ) : null}
//                         </div>
//                       )
//                     })}
//                   </Form>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className={'ocr-image-wrap'}>
//               <img
//                 id='ocr_img'
//                 src={previewImage}
//                 className={'ocr-preview-img'}
//                 // className={`${loading ? 'ocr-preview-img-ocring' : ''} ocr-preview-img`}
//                 alt='Preview'
//               />
//             </div>
//           )
//         ) : null}
//         {!previewImage && (
//           <Dragger
//             name='file'
//             beforeUpload={(file) => {
//               handleFileChange(file)
//             }}
//             className={'ocr-upload-dragger'}
//           >
//             <p className='ant-upload-drag-icon'>
//               <InboxOutlined />
//             </p>
//             <p className='ant-upload-text'>点击上传装备掉落列表</p>
//             <p className='ant-upload-hint'>你也可以使用其他截图软件截图并在这里点击ctrl+v粘贴</p>
//           </Dragger>
//         )}
//       </Spin>
//     </Modal>
//   )
// }

// export default React.memo(Ocr识别装备对比)

// 原OCR实现代码
export default {}
