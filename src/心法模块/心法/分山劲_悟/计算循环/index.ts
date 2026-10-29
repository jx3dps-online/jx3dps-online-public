import type { 循环数据 } from '@/@types/循环'

/**
 * @name 用于计算的循环数据
 * 基于体服实测 JCL 技能序列提取构建（2026-09-29，侠客岛实录，单元化重排）
 */

import 武学助手紫武 from './武学助手紫武.json'
import 武学助手橙武 from './武学助手橙武.json'

const 计算循环: 循环数据[] = [武学助手紫武, 武学助手橙武] as 循环数据[]

export default 计算循环
