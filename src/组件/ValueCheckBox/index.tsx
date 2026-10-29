import { Checkbox } from 'antd'
import React from 'react'

function ValueCheckBox(props) {
  const { value, onChange, ...options } = props
  const beforeOnChange = (e) => {
    onChange?.(e?.target?.checked ? 1 : 0)
  }
  return <Checkbox checked={!!value} onChange={beforeOnChange} {...options} />
}

export default ValueCheckBox
