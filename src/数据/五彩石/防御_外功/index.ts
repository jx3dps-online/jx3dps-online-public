import 五级 from './五级'
import 六级 from './六级'
import 通用_五级 from '../防御_通用/五级'
import 通用_六级 from '../防御_通用/六级'

const 五彩石数据 = {
  5: [...五级, ...通用_五级],
  6: [...六级, ...通用_六级],
}

export default 五彩石数据

export type 完整五彩石数据类型 = typeof 五彩石数据
