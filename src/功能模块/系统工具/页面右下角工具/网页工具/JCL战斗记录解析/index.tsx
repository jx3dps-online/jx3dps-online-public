import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Upload,
  message,
} from 'antd'
import type { UploadFile } from 'antd'
import type { RcFile } from 'antd/es/upload/interface'
import { InboxOutlined } from '@ant-design/icons'
import { 心法枚举, 战斗数据转换 } from './tool'
import { 循环详情 } from '@/@types/循环'
import { useAppSelector } from '@/hooks'
import { 数据埋点 } from '@/工具函数/tools/log'
import 使用说明 from './使用说明'
import 保存循环弹窗 from './保存循环弹窗'
import './index.css'
import {
  convertJclFile,
  获取JCL直伤截止时间,
  JCL_PROVIDER,
  JCL_PROVIDER_ERROR,
  JCL_PROVIDER_NAME,
  JclServiceResponse,
  normalizeJclData,
} from './jclService'

const 支持导入心法列表 = Object.keys(心法枚举)

function JCL战斗记录解析() {
  const [结果数据, 更新结果数据] = useState<循环详情>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)
  const [导入循环保存弹窗, 设置导入循环保存弹窗] = useState<boolean>(false)
  const [目标心法, 设置目标心法] = useState(支持导入心法列表?.[0])
  const [原始数据, 设置原始数据] = useState<string | undefined>(undefined)
  const [团队增益快照, 设置团队增益快照] = useState<string>('快照')
  const 团队增益轴 = useAppSelector((state) => state?.data?.团队增益轴)
  const [JCL文件, 设置JCL文件] = useState<RcFile>()
  const [JCL预览, 设置JCL预览] = useState<JclServiceResponse>()
  const [JCL目标等级, 设置JCL目标等级] = useState(54)
  const [JCL最大时间, 设置JCL最大时间] = useState<number>()
  const [JCL玩家ID, 设置JCL玩家ID] = useState('')
  const [JCL转换阶段, 设置JCL转换阶段] = useState('')
  const 待提示Buff = JCL预览
    ? (JCL预览.diagnostics?.unknownBuffIds || []).filter(
        (id) => !心法枚举[JCL预览.player.kungfuName]?.不提示Buff?.includes(id),
      )
    : []

  useEffect(() => {
    form?.setFieldsValue({
      目标心法: 支持导入心法列表?.[0],
      战斗时间: 999,
      // 解析方式: '新版',
      截断伤害ID: undefined,
      团队增益轴计算方式: '快照',
      记录伤害数据: '不记录',
    })
    设置团队增益快照('快照')
  }, [form, 支持导入心法列表])

  const 获取远程数据 = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      // values?.解析方式 === '新版' ?
      let 最大时间 = values?.战斗时间
      if (values?.截断伤害ID) {
        const JSONData = JSON.parse(values?.数据 || '{}')
        Object.keys(JSONData).forEach((currentKey) => {
          const key = currentKey?.replaceAll('(', '')?.replaceAll(')', '')?.replaceAll('|', '')
          const 全部技能数据 = key?.split('#')
          const 全部技能 = [
            `${全部技能数据[0]}#${全部技能数据[1]}`,
            全部技能数据[2],
            全部技能数据[3],
          ]?.filter((item) => item)
          const 获取技能数据 = 全部技能?.[0]?.split('#')?.[1]?.split('-')
          const 获取技能ID = 获取技能数据?.[0]
          if (获取技能ID === values?.截断伤害ID) {
            const timeLineData =
              JSONData?.[currentKey]?.['||']?.timeline || JSONData?.[currentKey]?.['']?.timeline
            if (timeLineData?.length) {
              const list = timeLineData?.map((a) => a[0])
              const resTime = Math.max(...list)
              最大时间 = resTime / 16
            }
          }
        })
      }
      const res = await 战斗数据转换({
        心法: values?.目标心法,
        数据: values?.数据,
        最大时间: 最大时间,
        最小时间: 0,
        团队增益轴,
        导入启用团队快照: values?.团队增益轴计算方式 === '快照',
        记录伤害数据: values?.记录伤害数据 === '记录',
      })
      // : await 获取数据({
      //     心法: values?.目标心法,
      //     数据: values?.数据,
      //     最大时间: values?.战斗时间,
      //     最小时间: 0,
      //   })
      if (res?.技能详情?.length && res?.战斗时间) {
        数据埋点('解析JCL')
        更新结果数据(res)
        // 设置解析方式(values?.解析方式)
        message.success(`解析成功，战斗时间为 ${res?.战斗时间}s`)
      } else {
        message.error('解析出错')
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '解析出错')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    const res = document.getElementById('tools-jcl-result')
    if (res) {
      const text = res?.innerHTML
      if (text) {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.setAttribute('value', text)
        input.select()
        document.execCommand('copy') // 执行浏览器复制命令
        if (document.execCommand('copy')) {
          document.execCommand('copy')
          message.success('复制成功')
        }
        // if (text?.includes('未匹配')) {
        //   message.warning('存在未匹配装备')
        // }
        document.body.removeChild(input)
      }
    }
  }

  const save = () => {
    // const 奇穴校验 = 判断奇穴(目标心法, 原始数据)
    // if (奇穴校验?.length) {
    设置导入循环保存弹窗(true)
    // }
  }

  const 转换JCL = async () => {
    const file = JCL文件
    if (!file) {
      message.warning('请先选择 JCL 文件')
      return
    }
    setLoading(true)
    if (JCL_PROVIDER === 'unavailable') {
      message.error(JCL_PROVIDER_ERROR || 'JCL 转换当前不可用')
      setLoading(false)
      return
    }
    设置JCL转换阶段(JCL_PROVIDER === 'wasm' ? '转换 JCL' : '请求远程服务')
    try {
      const result = await convertJclFile(file, {
        targetLevel: JCL目标等级,
        maxTime: JCL最大时间,
        playerId: JCL玩家ID.trim() || undefined,
        onProgress: (stage) => {
          const labels = {
            'loading-runtime': '首次加载运行环境',
            'loading-python': '加载 JCL 解析器',
            converting: '转换 JCL',
          } as const
          设置JCL转换阶段(labels[stage])
        },
      })
      const normalizedData = normalizeJclData(result.data)
      const battleTime = 获取JCL直伤截止时间(normalizedData)
      const json = JSON.stringify(normalizedData, null, 2)
      设置JCL预览(result)
      设置原始数据(json)
      设置目标心法(result.player.kungfuName)
      form.setFieldsValue({ 目标心法: result.player.kungfuName, 战斗时间: battleTime, 数据: json })
      message.success(`转换成功，玩家：${result.player.name}`)
    } catch (error) {
      设置JCL预览(undefined)
      message.error(error instanceof Error ? error.message : 'JCL 转换失败')
    } finally {
      setLoading(false)
      设置JCL转换阶段('')
    }
  }

  return (
    <div>
      <Spin spinning={loading} tip={JCL转换阶段 || undefined}>
        <div className='tools-jcl-upload'>
          <div className='tools-jcl-upload-title'>JCL 文件转换</div>
          <Upload.Dragger
            accept='.jcl,.txt'
            maxCount={1}
            fileList={
              JCL文件
                ? [
                    {
                      uid: JCL文件.uid,
                      name: JCL文件.name,
                      status: 'done',
                      originFileObj: JCL文件,
                    } as UploadFile,
                  ]
                : []
            }
            beforeUpload={(file) => {
              const suffix = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
              if (!['.jcl', '.txt'].includes(suffix)) {
                message.error('只支持 .jcl 或 .txt 文件')
                return Upload.LIST_IGNORE
              }
              if (file.size > 50 * 1024 * 1024) {
                message.error('文件不能超过 50 MiB')
                return Upload.LIST_IGNORE
              }
              设置JCL文件(file)
              设置JCL预览(undefined)
              return false
            }}
            onRemove={() => {
              设置JCL文件(undefined)
              设置JCL预览(undefined)
            }}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>点击或拖拽 JCL 战斗记录到这里</p>
            <p className='ant-upload-hint'>
              {JCL_PROVIDER === 'wasm'
                ? '支持 .jcl / .txt，转换模块在浏览器本地处理，不会主动上传 JCL'
                : JCL_PROVIDER === 'remote'
                  ? '支持 .jcl / .txt，将发送至已配置的远程 JCL 服务'
                  : 'JCL 转换不可用；仍可手动粘贴 JSON 解析'}
            </p>
          </Upload.Dragger>
          <div className='tools-jcl-upload-options'>
            <label>
              目标等级{' '}
              <InputNumber
                min={51}
                max={54}
                value={JCL目标等级}
                onChange={(value) => 设置JCL目标等级(value || 54)}
              />
            </label>
            <label>
              最大时间{' '}
              <InputNumber
                min={0}
                value={JCL最大时间}
                onChange={(value) => 设置JCL最大时间(value ?? undefined)}
                placeholder='自动'
              />
            </label>
            <label>
              玩家 ID{' '}
              <Input
                value={JCL玩家ID}
                onChange={(event) => 设置JCL玩家ID(event.target.value)}
                placeholder='留空自动选择'
              />
            </label>
            <Button
              type='primary'
              onClick={转换JCL}
              disabled={!JCL文件 || JCL_PROVIDER === 'unavailable'}
            >
              转换 JCL
            </Button>
          </div>
          <Alert
            type={JCL_PROVIDER === 'wasm' ? 'info' : 'warning'}
            showIcon
            message={
              JCL_PROVIDER === 'wasm'
                ? `${JCL_PROVIDER_NAME}（无方、冰心诀、紫霞功、太玄经、天罗诡道，转换模块在浏览器本地处理，不会主动上传 JCL）`
                : JCL_PROVIDER === 'remote'
                  ? `${JCL_PROVIDER_NAME}：文件将发送至已配置的转换服务`
                  : `${JCL_PROVIDER_NAME}：${JCL_PROVIDER_ERROR}`
            }
          />
          {JCL预览 && (
            <div className='tools-jcl-preview'>
              <Descriptions size='small' column={3} bordered>
                <Descriptions.Item label='玩家'>{JCL预览.player.name}</Descriptions.Item>
                <Descriptions.Item label='玩家 ID'>{JCL预览.player.id}</Descriptions.Item>
                <Descriptions.Item label='战斗时间'>
                  {获取JCL直伤截止时间(JCL预览.data).toFixed(2)}s
                </Descriptions.Item>
              </Descriptions>
              {(JCL预览.diagnostics?.unknownSkillIds?.length || 0) +
                待提示Buff.length +
                (JCL预览.diagnostics?.unknownTalentIds?.length || 0) >
                0 && (
                <Alert
                  type='warning'
                  showIcon
                  message='转换存在未识别数据'
                  description={`技能 ${JCL预览.diagnostics?.unknownSkillIds?.join(', ') || '无'}；Buff ${待提示Buff.join(', ') || '无'}；奇穴 ${JCL预览.diagnostics?.unknownTalentIds?.join(', ') || '无'}`}
                />
              )}
              <div className='tools-jcl-preview-hint'>
                JSON 已填入下方，确认无误后点击“解析数据”生成循环。
              </div>
            </div>
          )}
        </div>
        <Form form={form} className={'tools-jcl-params'} layout='vertical'>
          <Form.Item className={'tools-jcl-form-item'} name='目标心法' label='心法' required>
            <Select
              value={目标心法}
              onChange={(e) => 设置目标心法(e)}
              className={'tools-jcl-params-select'}
              options={支持导入心法列表.map((item) => ({ value: item, label: item }))}
              placeholder={'请选择解析心法'}
            />
          </Form.Item>
          <Form.Item className={'tools-jcl-form-item'} name='战斗时间' label='战斗时间（MY战斗时间+1s）' required>
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item className={'tools-jcl-form-item'} name='截断伤害ID' label='截断伤害ID'>
            <Input style={{ width: '100%' }} placeholder='不输入则按战斗时间计算' maxLength={10} />
          </Form.Item>
          {/* <Form.Item className={'tools-jcl-form-item-3'} name='解析方式' label='解析方式' required>
            <Select
              className={'tools-jcl-params-select'}
              options={[
                { label: '新版', value: '新版' },
                // { label: '旧版', value: '旧版' },
              ]}
              placeholder={'请选择解析方式'}
            />
          </Form.Item> */}
          <Form.Item
            className={'tools-jcl-form-item'}
            name='团队增益轴计算方式'
            label='团队增益轴计算方式'
            required
          >
            <Select
              className={'tools-jcl-params-select'}
              options={[
                { label: '快照', value: '快照' },
                { label: '均摊', value: '均摊' },
              ]}
              placeholder={'请选择团队增益快照'}
              onChange={(e) => 设置团队增益快照(e)}
            />
          </Form.Item>
          <Form.Item
            className={'tools-jcl-form-item'}
            name='记录伤害数据'
            label='记录伤害数据'
            style={{ paddingRight: 0 }}
            required
          >
            <Select
              className={'tools-jcl-params-select'}
              options={[
                { label: '不记录', value: '不记录' },
                { label: '记录', value: '记录' },
              ]}
              disabled={团队增益快照 === '快照'}
              placeholder={'请选择解析时是否记录伤害数据'}
            />
          </Form.Item>
          <Form.Item
            className={'tools-jcl-form-item-full'}
            name='数据'
            label={
              <div className={'tools-jcl-form-label-3'}>
                <span>数据</span>
                <使用说明 />
              </div>
            }
            required
          >
            <Input.TextArea
              value={原始数据}
              onChange={(e) => 设置原始数据(e?.target?.value)}
              className={'tool-jcl-input-area'}
            />
          </Form.Item>
        </Form>
        <div className={'tools-jcl-btns'}>
          <Button type='primary' className='tools-jcl-btn' onClick={获取远程数据}>
            解析数据
          </Button>
          <Button danger disabled={!结果数据} className='tools-jcl-btn' onClick={save}>
            保存循环
          </Button>
          <Button disabled={!结果数据} className='tools-jcl-btn' onClick={copy}>
            复制
          </Button>
        </div>
        {结果数据 && (
          <div id='tools-jcl-result' className={'tools-jcl-result'}>
            {JSON.stringify(结果数据)}
          </div>
        )}
        <保存循环弹窗
          导入循环保存弹窗={导入循环保存弹窗}
          设置导入循环保存弹窗={设置导入循环保存弹窗}
          结果数据={结果数据}
          目标心法={目标心法}
          原始数据={原始数据}
        />
      </Spin>
    </div>
  )
}

export default JCL战斗记录解析
