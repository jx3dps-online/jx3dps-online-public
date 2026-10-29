import type { 宏任务, 宏任务回复, 心法运行接口 } from '../类型'
import { 运行宏 } from '../核心/运行'
import { 创建原生宏接口 } from '../通用/原生回放'
import { 包含分页声明 } from '../工具/分页编辑'
import { 观察回放 } from '../生成/回放'
import { 重建宏教师 } from '../生成/教师'
import { 宏解析错误 } from '../核心/解析'

const 加载接口: Record<
  string,
  (
    参数: Record<string, unknown>,
    气血: number,
    环境: Record<string, number>,
  ) => Promise<心法运行接口>
> = {
  北傲诀: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/北傲诀/耦合表'),
      import('../心法/北傲诀/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  紫霞功: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/紫霞功/耦合表'),
      import('../心法/紫霞功/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  傲血战意: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/傲血战意/耦合表'),
      import('../心法/傲血战意/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  冰心诀: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/冰心诀/耦合表'),
      import('../心法/冰心诀/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  凌海诀: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/凌海诀/耦合表'),
      import('../心法/凌海诀/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  周天功: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/周天功/耦合表'),
      import('../心法/周天功/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  天罗诡道: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/天罗诡道/耦合表'),
      import('../心法/天罗诡道/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  太玄经: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/太玄经/耦合表'),
      import('../心法/太玄经/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  孤锋诀: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/孤锋诀/耦合表'),
      import('../心法/孤锋诀/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  山海心诀: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/山海心诀/耦合表'),
      import('../心法/山海心诀/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  幽罗引: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/幽罗引/耦合表'),
      import('../心法/幽罗引/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  无方: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/无方/耦合表'),
      import('../心法/无方/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  易筋经: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/易筋经/耦合表'),
      import('../心法/易筋经/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  毒经: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/毒经/耦合表'),
      import('../心法/毒经/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  花间游: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/花间游/耦合表'),
      import('../心法/花间游/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  焚影圣诀: async (参数, 气血, 环境) => {
    const [{ 耦合表 }, { 特殊规则 }] = await Promise.all([
      import('../心法/焚影圣诀/耦合表'),
      import('../心法/焚影圣诀/特殊规则'),
    ])
    return 创建原生宏接口(耦合表, 特殊规则, 参数, 气血, 环境)
  },
  分山劲: async (参数, 气血, 环境) => {
    const [{ 分山耦合表 }, { 分山特殊规则 }] = await Promise.all([
      import('../心法/分山劲/耦合表'),
      import('../心法/分山劲/特殊规则'),
    ])
    return 创建原生宏接口(分山耦合表, 分山特殊规则, 参数, 气血, 环境)
  },
}

export const 执行任务 = async (
  任务: 宏任务,
  控制?: () => Promise<unknown>,
): Promise<宏任务回复> => {
  const 开始 = performance.now()
  const 原随机 = Math.random
  let 控制失败 = false
  const 控制回调 =
    控制 &&
    (async () => {
      try {
        await 控制()
      } catch (错误) {
        控制失败 = true
        throw 错误
      }
    })
  try {
    if (任务.类型 === '教师' && (!任务.当前循环?.length || 任务.当前循环.length > 6000))
      throw new Error('精确生成需要 1–6000 个手动循环动作')
    const 重置随机 = () => {
      if (任务.随机种子 === undefined) return
      let 种子 = 任务.随机种子 >>> 0
      Math.random = () => {
        种子 = (Math.imul(种子, 1664525) + 1013904223) >>> 0
        return 种子 / 4294967296
      }
    }
    重置随机()
    if (!加载接口[任务.心法]) throw new Error('尚未接入该心法：' + 任务.心法)
    const 气血 = 任务.气血比例 ?? 1
    if (!Number.isFinite(气血) || 气血 < 0 || 气血 > 1) throw new Error('气血比例应在 0 到 1 之间')
    const 环境: Record<string, number> = {}
    const 接口 = await 加载接口[任务.心法](
      {
        ...任务.参数,
        测试循环: 任务.类型 === '运行' ? 任务.当前循环 || [] : [],
        宏等待标注: 任务.类型 === '运行',
        宏延后提交快照: 任务.类型 === '观察' && !任务.仅比较回放,
        宏上个技能: 任务.上个技能 || '',
      },
      气血,
      环境,
    )
    for (const 字段 of Object.keys(任务.环境 || {})) {
      if (!Object.prototype.hasOwnProperty.call(接口.说明.环境字段, 字段))
        throw new Error('未知宏环境字段：' + 字段)
    }
    for (const [字段, 配置] of Object.entries(接口.说明.环境字段)) {
      const 值 = 任务.环境?.[字段] ?? 配置.默认值
      if (
        !Number.isFinite(值) ||
        值 < (配置.最小值 || 0) ||
        值 > 配置.最大值 ||
        (!接口.说明.小数字段.includes(字段) && !Number.isInteger(值))
      )
        throw new Error(配置.名称 + '超出范围或数值格式不正确')
      环境[字段] = 值
    }
    if (任务.类型 === '说明') return { 成功: true, 说明: 接口.说明 }
    if (任务.类型 === '教师') {
      const 初始化结束 = performance.now()
      const 教师 = 重建宏教师(接口, 任务.当前循环!)
      return {
        成功: true,
        说明: 接口.说明,
        教师,
        耗时: {
          初始化毫秒: 初始化结束 - 开始,
          模拟毫秒: performance.now() - 初始化结束,
        },
      }
    }
    if (任务.类型 === '观察') {
      const 初始化结束 = performance.now()
      const 观察 = await 观察回放(
        任务.文本 || '',
        接口,
        { ...任务.观察目标!, 截止时间: 任务.观察截止 ?? 任务.观察目标!.截止时间 },
        任务.观察动作!,
        !!任务.强制教师,
        任务.观察条件,
        任务.时间容差,
        任务.分歧停止,
        任务.观察释放窗口,
        任务.仅比较回放,
        控制回调,
      )
      return {
        成功: true,
        说明: 接口.说明,
        观察,
        耗时: {
          初始化毫秒: 初始化结束 - 开始,
          模拟毫秒: performance.now() - 初始化结束,
        },
      }
    }
    if (包含分页声明(任务.文本 || '') && !接口.说明.翻页体态)
      throw new Error('当前心法仅支持不翻页宏，请移除 #page')
    const 结果 = 运行宏(任务.文本 || '', 任务.秒数 || 0, 接口, 任务.单次, 任务.宏列表)
    return { 成功: true, 说明: 接口.说明, 结果 }
  } catch (错误) {
    if (控制失败) throw 错误
    const 内容 = 错误 instanceof Error ? 错误 : new Error(String(错误))
    return {
      成功: false,
      错误: 内容.message,
      类型: 错误 instanceof 宏解析错误 ? 'candidate_rejected' : 'fatal_error',
      原始错误: { name: 内容.name, message: 内容.message, stack: 内容.stack },
    }
  } finally {
    Math.random = 原随机
  }
}
