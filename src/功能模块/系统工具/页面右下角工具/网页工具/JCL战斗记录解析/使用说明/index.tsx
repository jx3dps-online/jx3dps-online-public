import { QuestionCircleOutlined } from '@ant-design/icons'
import { Popover } from 'antd'
import './index.css'

const 使用须知 = () => {
  return (
    <h1 className={'tools-jcl-info-modal-title'}>
      <Popover
        title='使用说明'
        content={
          <div>
            <p>1、录制 JCL 战斗文件，支持 .jcl 和 .txt 格式。</p>
            <p>
              2、无方、冰心诀、紫霞功可直接上传文件；按需填写目标等级、最大时间和玩家 ID，然后点击
              <span className='tools-jcl-info-modal-tip-btn'>转换 JCL</span>。
            </p>
            <p>
              3、转换成功后会自动选择心法并填入 JSON；也可以直接将已有 JSON 粘贴到
              <span className='tools-jcl-info-modal-tip-btn'>数据</span>输入框。
            </p>
            <p>
              4、填写<span className='tools-jcl-info-modal-tip-btn'>战斗时间</span>
              时，建议使用 DPS 统计时间 +1 秒；超过实际战斗时长会自行截断。
            </p>
            <p>
              5、选择团队增益轴计算方式和是否记录伤害数据，然后点击
              <span className='tools-jcl-info-modal-tip-btn'>解析数据</span>生成计算循环。
            </p>
            <p style={{ marginBottom: 8 }}>
              6、确认结果后可点击
              <span className='tools-jcl-info-modal-tip-btn'>保存循环</span>或
              <span className='tools-jcl-info-modal-tip-btn'>复制</span>。
            </p>
          </div>
        }
      >
        <span className={'tools-jcl-info-modal-tip-text'}>
          使用说明
          <QuestionCircleOutlined className={'tools-jcl-info-modal-tip-icon'} />
        </span>
      </Popover>
    </h1>
  )
}

export default 使用须知
