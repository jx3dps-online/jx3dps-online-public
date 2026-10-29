import { Button, Modal, Select } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { use心法数据 } from '@/心法模块/心法上下文'
import { 拿下登阶差异 } from '../../领域/计算'
import { 合意显示名 } from '../../踏天/计算'
import { 获取文案, 填充文案 } from '../../文案'
import 目标差异展示 from '../../组件/目标差异/index'
import type React from 'react'
import type use登阶页面 from '../../hooks/use登阶页面'
import type { 登阶建议 } from '../../领域/类型'

type 详情属性 = Pick<
  ReturnType<typeof use登阶页面>,
  | '当前'
  | '踏天中'
  | '目标'
  | '详情'
  | '设置详情'
  | '差异筛选'
  | '设置差异筛选'
  | '查看认可差异'
  | '设置查看认可差异'
  | '结果'
  | '不匹配原因'
  | '分析'
  | '错误'
  | '忙碌'
  | '当前秒伤'
  | '建议'
  | '计划有变'
  | '拿下'
  | '计算差异提升'
  | '替换目标'
  | '标记合意'
  | '撤销合意'
  | '主题样式'
  | '差异分组'
> & { 渲染建议: (项: 登阶建议, 索引: number) => React.ReactNode }
export default function 详情弹窗({
  当前,
  踏天中,
  目标,
  详情,
  设置详情,
  差异筛选,
  设置差异筛选,
  查看认可差异,
  设置查看认可差异,
  结果,
  不匹配原因,
  分析,
  错误,
  忙碌,
  当前秒伤,
  建议,
  计划有变,
  拿下,
  计算差异提升,
  替换目标,
  标记合意,
  撤销合意,
  主题样式,
  差异分组,
  渲染建议,
}: 详情属性) {
  const { 名称 } = use心法数据()
  const 文案 = 获取文案(名称)
  return (
    <Modal
      open={!!详情}
      onCancel={() => 设置详情(undefined)}
      footer={null}
      width={840}
      className='dragon-detail-modal'
      style={主题样式}
      centered
      title={
        <div className='dragon-modal-title'>
          <span>{详情 === '差异' ? 文案['通用.目标差异'] : 文案['详情.标题.建议']}</span>
          <p>{目标?.名称}</p>
        </div>
      }
    >
      {详情 === '差异' ? (
        <>
          <div className='dragon-detail-toolbar'>
            <span>
              {查看认可差异 ? 文案['详情.工具栏.含认可'] : 文案['详情.工具栏.只看未完成']}
            </span>
            {踏天中 && (
              <Button size='small' onClick={() => 设置查看认可差异(!查看认可差异)}>
                {查看认可差异 ? 文案['详情.按钮.只看待完成'] : 文案['详情.按钮.查看全部']}
              </Button>
            )}
            <Select
              aria-label={文案['详情.aria.差异类别']}
              value={差异筛选}
              onChange={设置差异筛选}
              options={[
                { label: 文案['通用.全部'], value: '全部' },
                ...(分析?.分类进度.map((item) => ({ label: item.名称, value: item.名称 })) || []),
              ]}
            />
          </div>
          <div className='dragon-diff-scroll'>
            {分析 ? (
              <>
                {!!差异分组.size && (
                  <目标差异展示
                    分组={差异分组}
                    忙碌={忙碌 || (踏天中 && !!不匹配原因)}
                    计算提升={计算差异提升}
                    当前秒伤={当前秒伤}
                    踏天中={踏天中}
                    on拿下={(项) => 拿下(() => 拿下登阶差异(当前!.装备, 目标!.装备, 项, 文案))}
                    on计划有变={踏天中 ? undefined : 计划有变}
                    on合意={踏天中 ? 标记合意 : undefined}
                    on替换目标={踏天中 ? undefined : 替换目标}
                  />
                )}
                {!差异分组.size && (
                  <div className='dragon-detail-empty'>
                    <CheckOutlined />
                    <b>{文案['详情.空态.标题']}</b>
                    <p>{文案['详情.空态.说明']}</p>
                  </div>
                )}
              </>
            ) : (
              <div className='dragon-detail-empty'>
                <b>{错误 || 文案['详情.加载中']}</b>
              </div>
            )}
          </div>
          {踏天中 && !!结果?.有效认可?.length && (
            <div className='dragon-accepted'>
              <p>{文案['详情.已认可']}</p>
              {结果.有效认可.map((键) => (
                <Button key={键} size='small' disabled={忙碌} onClick={() => 撤销合意(键)}>
                  {填充文案(文案['详情.撤销认可'], { 名称: 合意显示名(键, 文案) })}
                </Button>
              ))}
            </div>
          )}
          <p className='dragon-modal-note'>
            {踏天中 ? 文案['详情.说明.踏天'] : 文案['详情.说明.普通']}
          </p>
        </>
      ) : (
        <>
          <p className='dragon-modal-note'>{文案['详情.说明.建议']}</p>
          <div className='dragon-all-suggestions'>{建议.map(渲染建议)}</div>
        </>
      )}
    </Modal>
  )
}
