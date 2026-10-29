import axios from 'axios'

const spiderApi = axios.create({
  baseURL: 'https://spider2.jx3box.com',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
})

const jxBoxApi2 = axios.create({
  baseURL: '/nextApi/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 根据配装ID获取配装方案
export const getPzDataById = (params) =>
  axios.get(`/api/cms/app/pz/${params.id}`, { params: params })

// 根据附魔ID获取附魔
export const getFumoDataById = (params) => axios.get(`/enchant/primary`, { params })

// 根据五彩石ID获取五彩石
export const getWuCaiShiDataById = (params) => axios.get(`/enchant/stone`, { params })

// 获取当前区服列表
export const getServerList = (params?) =>
  spiderApi.get(`/api/spider/server/server_state`, { params: params })

// 获取交易行装备价格
export const getEquipPriceList = (params?) =>
  jxBoxApi2.get(`/api/item-price/list`, { params })
