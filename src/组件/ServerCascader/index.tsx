import { getServerList } from '@/api'
import { 获取页面参数 } from '@/工具函数/help'
import { useRequest } from 'ahooks'
import { Cascader } from 'antd'
import React from 'react'

const filterZoneList = ['國際服', '比赛专区', '缘起大区']

function ServerCascader(props) {
  const { callback, ...options } = props

  const urlServer = 获取页面参数('server')
  const urlName = 获取页面参数('name')

  // 调用接口获取区服信息
  const { data, loading } = useRequest(() =>
    getServerList().then((res) => {
      const list: any[] = []
      let current: string[] = []
      ;(res?.data || [])?.forEach((item) => {
        if (!filterZoneList?.includes(item?.zone_name)) {
          const exist = list?.find((a) => a?.value === item?.zone_name)
          if (exist) {
            exist.children.push({
              value: item?.server_name,
              label: item?.server_name,
            })
          } else {
            list.push({
              value: item?.zone_name,
              label: item?.zone_name,
              children: [
                {
                  value: item?.server_name,
                  label: item?.server_name,
                },
              ],
            })
          }
          if (item?.server_name === urlServer) {
            current = [item?.zone_name, item?.server_name]
          }
        }
      })
      if (current?.length && !options?.value?.length) {
        options.onChange?.(current)
        if (urlName && urlServer) {
          callback(decodeURIComponent(urlName), current)
        }
      }
      return list
    })
  )

  return (
    <Cascader
      showSearch
      placeholder={'请选择服务器'}
      options={data || []}
      loading={loading}
      expandTrigger='hover'
      {...options}
    />
  )
}

export default ServerCascader
