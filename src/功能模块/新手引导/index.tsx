import { App, message, Modal, Tour } from 'antd'
import { useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  切换配装器弹窗显示状态,
  更新增益面板显示状态,
  更新当前引导步骤,
  更新新手引导流程状态,
} from '@/store/system'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'

const { 缓存映射 } = 获取当前数据()

const 新手引导 = () => {
  const { modal } = App.useApp()

  const 新手引导流程状态 = useAppSelector((state) => state.system.新手引导流程状态)
  const 当前引导步骤 = useAppSelector((state) => state.system.当前引导步骤)
  const dispatch = useAppDispatch()

  const 修改引导状态 = (e) => {
    dispatch(更新新手引导流程状态(e))
  }

  const skipCount = useRef<number>(0)
  const tipCount = useRef<number>(0)

  const 修改引导步骤 = (e) => {
    if (当前引导步骤 === 15 && e === 0) {
      return
    }
    // 如果点击进入第二步
    if (e === 0) {
      dispatch(切换配装器弹窗显示状态(false))
      dispatch(更新当前引导步骤(e))
    } else if (当前引导步骤 === 0 && e === 1) {
      dispatch(切换配装器弹窗显示状态(true))
      setTimeout(() => {
        dispatch(更新当前引导步骤(e))
      }, 650)
    } else if (当前引导步骤 === 7 && e === 6) {
      dispatch(切换配装器弹窗显示状态(true))
      setTimeout(() => {
        dispatch(更新当前引导步骤(e))
      }, 200)
    } else if (当前引导步骤 === 6 && e === 7) {
      dispatch(切换配装器弹窗显示状态(false))
      dispatch(更新当前引导步骤(e))
    } else if (当前引导步骤 === 11 && e === 12) {
      dispatch(更新增益面板显示状态(true))
      setTimeout(() => {
        dispatch(更新当前引导步骤(e))
      }, 200)
    } else if (当前引导步骤 === 12 && e === 13) {
      setTimeout(() => {
        dispatch(更新当前引导步骤(e))
      }, 200)
    } else {
      dispatch(更新当前引导步骤(e))
    }
  }

  const steps = useMemo(() => {
    return [
      {
        title: '1.点击打开配装器',
        description: '配装器内置本赛季装备，仅支持选择本心法和通用装备',
        target: () => document.getElementById('Guide_1') as any,
      },
      {
        title: '2.配装导入',
        description: '您可以在这里直接导入游戏角色配装/魔盒配装方案',
        target: () => document.getElementById('Guide_2') as any,
      },
      {
        title: '3.手动修改配装',
        description: '在这里手动修改对应的装备、精炼、镶嵌、附魔',
        target: () => document.getElementById('Guide_3') as any,
      },
      {
        title: '4.装备搜索',
        description: '装备选择额外支持输入装备名、属性、品级进行搜索',
        target: () => document.getElementById('Guide_4') as any,
      },
      {
        title: '5.装备范围',
        description: (
          <div>
            <p>在这里配置范围，帮助你快速选择想要的装备</p>
          </div>
        ),
        target: () => document.getElementById('Guide_Equip_Scope') as any,
      },
      {
        title: '6.智能对比',
        description: (
          <div>
            <p>开启智能对比功能可以帮助你快速的在同位置进行比较</p>
            <p>注意，比较时橙武不会自动切换循环</p>
          </div>
        ),
        target: () => document.getElementById('Guide_6') as any,
      },
      {
        title: '7.保存并计算',
        description: (
          <div>
            <p>修改装备后，点击「保存并计算」更新装备和进行伤害计算</p>
            <p>注意，如未保存直接关闭弹窗，您修改的装备不会保存</p>
          </div>
        ),
        target: () => document.getElementById('Guide_7') as any,
      },
      {
        title: '8.计算结果秒伤',
        description: (
          <div>
            <p>这里显示当前计算出的每伤伤害期望</p>
          </div>
        ),
        target: () => document.getElementById('Guide_8') as any,
      },
      {
        title: '9.属性收益',
        description: (
          <div>
            <p>表示当前情况下各属性的收益，从左到右收益由高到低。</p>
          </div>
        ),
        target: () => document.getElementById('Guide_9') as any,
      },
      {
        title: '10.保存方案',
        description: (
          <div>
            <p>你可以在这里创建多个配置方案</p>
          </div>
        ),
        target: () => document.getElementById('Guide_10') as any,
      },
      {
        title: '11.方案切换',
        description: (
          <div>
            <p>在这里可以在不同方案间进行切换对比</p>
          </div>
        ),
        target: () => document.getElementById('Guide_11') as any,
      },
      {
        title: '12.增益详情',
        description: (
          <div>
            <p>点击此按钮可以展开/收起增益详情</p>
            <p style={{ color: 'red' }}>建议你在进行配装时开启增益，避免只当木桩战神</p>
          </div>
        ),
        target: () => document.getElementById('Guide_12') as any,
      },
      {
        title: '13.增益面板',
        description: (
          <div>
            <p>增益面板包含小吃小药、阵眼、团队增益等。</p>
          </div>
        ),
        placement: 'right',
        target: () => document.getElementById('Guide_13') as any,
      },
      {
        title: '14.启用增益',
        description: (
          <div>
            <p>注意，要开启「启用增益」才会在计算时计算增益</p>
          </div>
        ),
        placement: 'right',
        target: () => document.getElementById('Guide_14') as any,
      },
      {
        title: '15.更多工具',
        description: (
          <div>
            <p>在这里你可以找到更多配套的工具</p>
            <p>更多功能等着你去发现</p>
          </div>
        ),
        target: () => document.getElementById('Guide_15') as any,
        placement: 'leftTop',
      },
      {
        title: '16.切换心法',
        description: (
          <div>
            <p>最后，如何你想要计算其他心法，可以在这里进行切换</p>
            <p>新手引导完毕，祝您使用愉快，希望对您有所帮助。</p>
            <p>在使用中遇到问题，请至魔盒计算器帖下留言反馈</p>
          </div>
        ),
        target: () => document.getElementById('Guide_16') as any,
        placement: 'leftTop',
        nextButtonProps: {
          children: '教程结束',
        },
      },
    ] as any
  }, [])

  const 记录跳过 = () => {
    if (skipCount.current >= 5) {
      修改引导状态(false)
      修改引导步骤(0)
      localStorage.setItem(缓存映射.新手引导, 'true')
      skipCount.current = 0
      tipCount.current = 0
      Modal.destroyAll()
    }
    skipCount.current++
  }

  const 关闭前确认 = () => {
    skipCount.current = 0
    modal.confirm({
      title: '确认跳过引导吗？',
      content: (
        <div onClick={记录跳过}>
          <p style={{ userSelect: 'none' }}>跳过引导视为你已熟悉或有能力快速找到对应功能</p>
          <p style={{ userSelect: 'none' }}>跳过了就别再问哪里可以切心法，哪里开增益了</p>
          <p style={{ userSelect: 'none' }}>为确保认真阅读文字，点击这行文字十次后跳过引导</p>
        </div>
      ),
      onOk() {
        tipCount.current++
        if (tipCount.current < 3) {
          message.error('你再看看')
        } else {
          message.error('请仔细阅读提示')
        }
        return
      },
      okText: '知道了',
      cancelText: '再看看',
    })
  }

  return (
    <Tour
      current={当前引导步骤}
      open={新手引导流程状态}
      onChange={修改引导步骤}
      onClose={() => {
        关闭前确认()
      }}
      onFinish={() => {
        修改引导步骤(0)
        localStorage.setItem(缓存映射.新手引导, 'true')
      }}
      steps={steps}
    />
  )
}

export default 新手引导
