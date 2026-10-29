import { Badge } from 'antd'
import React from 'react'

interface NewBadge类型 {
  children?: React.ReactNode
  text?: string
  offset?: [number, number]
}

const NewBadge: React.FC<NewBadge类型> = (props) => {
  const { children, text = 'New', offset = [0, 0] } = props
  return (
    <Badge count={text} color='#ff4d4f' offset={offset} size='small'>
      {children}
    </Badge>
  )
}

export default NewBadge
