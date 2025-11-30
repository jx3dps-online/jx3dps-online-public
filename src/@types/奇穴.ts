/**
 * @name 奇穴列表数据类型
 */

export interface 奇穴列表数据类型 {
  /**
   * @name 是否不可编辑
   */
  是否不可编辑?: boolean
  /**
   * @name 是否为混池
   */
  是否为混池?: boolean
  /**
   * @name 是否为特殊奇穴
   */
  是否为特殊奇穴?: boolean
  /**
   * @name 奇穴详情
   */
  奇穴列表: 奇穴数据类型[]
}

/**
 * @name 奇穴数据类型
 */
export interface 奇穴数据类型 {
  /**
   * @name id
   */
  id?: string
  /**
   * @name 奇穴名称
   */
  奇穴名称: string
  /**
   * @name 是否不可编辑
   */
  是否不可编辑?: boolean
  /**
   * @name 奇穴图片
   */
  奇穴图片: string
  /**
   * @name 奇穴描述
   */
  奇穴描述?: string
}
