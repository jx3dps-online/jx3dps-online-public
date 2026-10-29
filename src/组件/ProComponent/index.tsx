import useQuery from '@/hooks/use-query'
import { use心法数据 } from '@/心法模块/心法上下文'
import { forwardRef, ForwardRefExoticComponent, useEffect, useImperativeHandle } from 'react'
import { simpleHashDecrypt, simpleHashEncrypt } from './util'
import { message, Modal } from 'antd'

interface ProComponentProps {
  children: any
  type?: 'admin' | 'normal'
  ref?: any
}

const ProComponent: ForwardRefExoticComponent<ProComponentProps> = forwardRef((props, ref) => {
  const { children, type } = props
  const { 缓存映射 } = use心法数据()

  const queryVersionKey = useQuery('versionKey')

  useImperativeHandle(ref, () => ({
    initKey: initKey,
  }))

  function checkSuperAdmin() {
    return !!localStorage?.getItem(缓存映射.管理员) || location.href?.includes('localhost')
  }

  function initKey() {
    const hourNum = getHourStartTimestamp()
    const res = simpleHashEncrypt(hourNum)
    Modal.success({
      title: '生成成功',
      content: res,
      okText: '复制',
      onOk: () => {
        copyRes(`一个小时内在链接后面加上这个访问计算器 &versionKey=${res} 不要外传`)
      },
    })
  }

  const copyRes = (text) => {
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

      document.body.removeChild(input)
    }
  }

  function checkVersionKey() {
    if (type === 'admin') {
      return checkSuperAdmin()
    }
    if (queryVersionKey) {
      // 获取当前时间戳的小时段
      const hourNum = getHourStartTimestamp()
      const decryptKey = simpleHashDecrypt(queryVersionKey)
      if (decryptKey === hourNum) {
        console.log('校验通过')
        return true
      }
    } else {
      return false
    }
  }

  function getHourStartTimestamp() {
    const date = new Date()
    // 设置分钟、秒和毫秒为0
    date.setMinutes(0, 0, 0)
    // 返回时间戳（毫秒）
    return date.getTime()
  }

  function removeUrlParameter(paramName) {
    const url = new URL(window.location.href)

    // 删除指定的参数
    url.searchParams.delete(paramName)

    // 使用 history.replaceState 更新 URL 而不刷新页面
    history.replaceState(null, '', url.toString())
  }

  function checkLocalStorage() {
    if (type === 'admin') {
      return checkSuperAdmin()
    }
    return localStorage?.getItem(缓存映射.版本) === 'pro'
  }

  // 部分功能隐藏入口
  const isPro = checkVersionKey() || checkLocalStorage() || location.href?.includes('localhost')

  useEffect(() => {
    if (isPro) {
      localStorage.setItem(缓存映射.版本, 'pro')
      removeUrlParameter('versionKey')
    }
  }, [isPro, 缓存映射])

  return isPro ? children : null
})

export default ProComponent
