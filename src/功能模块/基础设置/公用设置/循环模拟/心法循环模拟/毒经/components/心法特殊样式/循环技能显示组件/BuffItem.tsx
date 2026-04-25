import React from 'react'

function BuffItem({ data, 原始Buff数据, ...rest }) {
  const buff = 原始Buff数据?.[data]
  return buff ? <img src={buff.图标} {...rest} /> : null
}

export default BuffItem
