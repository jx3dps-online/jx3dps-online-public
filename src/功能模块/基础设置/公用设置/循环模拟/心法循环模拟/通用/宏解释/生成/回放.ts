import type { 心法运行接口, 技能宏语句, 宏状态, 宏条件 } from '../类型'
import { 运行宏, 分批运行宏, 宏运行错误, 选择宏语句, 获取条件变化时间 } from '../核心/运行'
import { 解析条件 } from '../核心/解析'
import { 编译宏调用 } from '../核心/宏调用'
import { 判定条件 } from '../核心/判定'
import type { 生成动作, 教师结果, 回放观察, 观察记录 } from './类型'
import { 观察释放窗口 } from './释放窗口'

export const 更新等待条件 = (
  行: 观察记录,
  下个时间: number,
  固有时间: number,
  原子: 宏条件[],
  每秒帧: number,
) => {
  行.下次等待 = 下个时间 / 每秒帧
  行.固有等待 = 固有时间
  行.等待条件 =
    固有时间 > 下个时间
      ? 原子.flatMap((项, 索引) => (获取条件变化时间(项, 行.状态) === 下个时间 ? [索引] : []))
      : undefined
  行.唤醒条件 =
    行.释放期限 !== undefined && 行.下次等待 > 行.释放期限 + 1e-7
      ? 原子.flatMap((项, 索引) => {
          const 唤醒 = Math.min(固有时间, 获取条件变化时间(项, 行.状态))
          return 唤醒 > 行.状态.时间 && 唤醒 / 每秒帧 <= 行.释放期限! + 1e-7 ? [索引] : []
        })
      : []
}

export const 观察回放 = async (
  文本: string,
  接口: 心法运行接口,
  教师: 教师结果,
  动作: 生成动作[],
  强制教师: boolean,
  条件文本: string[] = [],
  容差秒 = 1 / 16,
  分歧停止 = false,
  释放窗口 = false,
  仅比较回放 = false,
  控制?: () => Promise<unknown>,
): Promise<回放观察> => {
  const 记录: 回放观察['记录'] = []
  const 观察耗时 = {
    动作查询: 0,
    允许预测: 0,
    动作预测: 0,
    等待条件: 0,
    等待未来状态: 0,
    释放窗口: 0,
  }
  // 各项包含其嵌套观察耗时，不相加；计时不进入状态与认证指纹。
  const 计时 = <T>(项: keyof typeof 观察耗时, 执行: () => T): T => {
    const 开始 = performance.now()
    try {
      return 执行()
    } finally {
      观察耗时[项] += performance.now() - 开始
    }
  }
  const 容差 = 容差秒 * 教师.每秒帧
  const 严格 = 1e-7 * 教师.每秒帧
  const 原子 = 仅比较回放 ? [] : 条件文本.map((项) => 解析条件(项, 接口.说明))
  const 原语句 = 编译宏调用(文本, 接口.说明).配置.页[0].语句
  const 语句 = 动作.map((项, 索引): 技能宏语句 => ({ ...项, 行号: 索引 + 1 }))
  let 游标 = 0
  let 对齐 = true
  let 停止 = false
  let 截断 = false
  let 失败: 回放观察['失败']
  let 选中动作 = -1
  let 决策序号 = -1
  let 引导分歧 = false
  type 轨迹项 = ReturnType<typeof 运行宏>['轨迹'][number]
  let 决策末项: 轨迹项 | undefined
  let 决策末态: 宏状态 | undefined
  let 待绑定等待: { 行: 观察记录; 下个时间: number; 末项?: 轨迹项; 末态?: 宏状态 } | undefined
  let 缓存状态: 宏状态 | undefined
  let 可执行: number[] = []
  const 查询 = (状态: 宏状态) =>
    计时('动作查询', () => {
      if (状态 !== 缓存状态) {
        缓存状态 = 状态
        可执行 = 语句.flatMap((行, 索引) => (选择宏语句([行], 状态, 接口) ? [索引] : []))
      }
      return 可执行
    })
  const 引导跳数符合目标 = (状态: 宏状态) => {
    const 前项 = 教师.动作[游标 - 1]
    return (
      !状态.读条 ||
      前项?.作用次数 === undefined ||
      接口.获取引导跳时刻!().filter((帧) => 帧 <= 状态.时间).length === 前项.作用次数
    )
  }
  const 允许 = (状态: 宏状态, 误差 = 容差) =>
    计时('允许预测', () => {
      const 目标 = 教师.动作[游标]
      if (
        !目标 ||
        !引导跳数符合目标(状态) ||
        (强制教师 && Math.abs(状态.时间 - (目标.决策时间 ?? 目标.时间)) > 误差 + 严格)
      )
        return []
      return 查询(状态).filter((索引) => {
        const 选中 = 选择宏语句([语句[索引]], 状态, 接口)!
        const 计划 = 接口.获取释放计划?.(选中.技能)
        const 释放时间 = 计划?.释放时间 ?? 接口.获取技能释放时间?.(选中.技能)
        return (
          释放时间 !== undefined &&
          (计划?.实际技能 ?? 接口.获取实际技能名称?.(选中.技能) ?? 选中.技能) === 目标.技能 &&
          Math.abs(释放时间 - 目标.时间) <= 误差 + 严格
        )
      })
    })
  const 拒绝 = () => {
    const 行 = 记录[记录.length - 1]
    if (行 && 选中动作 >= 0) {
      行.允许 = 行.允许.filter((项) => 项 !== 选中动作)
      if (!行.拒绝动作.includes(选中动作)) 行.拒绝动作.push(选中动作)
      行.未决动作 = 行.未决动作.filter((项) => 项 !== 选中动作)
    }
    对齐 = false
    停止 = 分歧停止 && !强制教师
  }
  let 结果: ReturnType<typeof 运行宏>
  try {
    结果 = await 分批运行宏(文本, 教师.截止时间 / 教师.每秒帧, 接口, false, [], {
      选择: 强制教师
        ? (状态) => {
            if (!对齐) return undefined
            const 索引 = 允许(状态, 严格)[0]
            return 索引 === undefined ? undefined : 选择宏语句([语句[索引]], 状态, 接口)
          }
        : undefined,
      决策: (状态, 选中, 轨迹) => {
        // WAIT 只绑定紧邻的真实决策，任何提前结束或不匹配都保留 unknown。
        const 待绑定 = 待绑定等待
        待绑定等待 = undefined
        决策末项 = 轨迹[轨迹.length - 1]
        决策末态 = 决策末项?.释放后
        决策序号++
        游标 = 轨迹.length
        选中动作 = -1
        引导分歧 = !!选中 && !引导跳数符合目标(状态)
        if (!对齐) return
        const 目标 = 教师.动作[游标]
        const 期限 = 目标 ? 目标.时间 + (强制教师 ? 严格 : 容差) : Infinity
        if (状态.时间 > 期限 + 严格) {
          失败 = {
            index: 游标,
            kind: 'missed_release_window',
            time: 状态.时间 / 教师.每秒帧,
            deadline: 期限 / 教师.每秒帧,
          }
          对齐 = false
          停止 = 分歧停止 && !强制教师
          return
        }
        if (选中) {
          const 原行 = 强制教师 ? 动作[选中.行号 - 1] : 原语句[选中.行号 - 1]
          if (原行 && '技能' in 原行)
            选中动作 = 动作.findIndex((项) => 项.技能 === 原行.技能 && 项.命令 === 原行.命令)
        }
        if (仅比较回放 && !强制教师) return
        const 合法 = 查询(状态)
        const 可选 = 允许(状态)
        const 自动接管 =
          !状态.读条 && 接口.说明.自动技能?.some((项) => 状态.数值[项.资源] === 项.数值)
        记录.push({
          状态,
          决策序号,
          决策动作: 选中 ? 选中动作 : null,
          决策模型:
            !强制教师 &&
            !自动接管 &&
            (!状态.读条 || !!接口.可以释放技能) &&
            (!选中 || 选中动作 >= 0)
              ? 'first_match'
              : 'unsupported',
          可执行: [...合法],
          允许: 可选,
          游标,
          等待状态: 'unknown',
          等待依据: '等待尚未绑定实际下一唤醒时刻',
          必须释放: false,
          释放期限: 目标 ? (目标.时间 + 容差) / 教师.每秒帧 : undefined,
          释放范围: 目标
            ? {
                earliest: (目标.时间 - 容差) / 教师.每秒帧,
                latest: (目标.时间 + 容差) / 教师.每秒帧,
              }
            : undefined,
          动作预测: 计时('动作预测', () =>
            合法.map((索引) => {
              const 选中 = 选择宏语句([语句[索引]], 状态, 接口)!
              const 计划 = 接口.获取释放计划?.(选中.技能)
              const 释放时间 = 计划?.释放时间 ?? 接口.获取技能释放时间?.(选中.技能)
              return {
                action: 索引,
                status: 释放时间 === undefined ? 'unknown' : 'known',
                release_time: 释放时间 === undefined ? undefined : 释放时间 / 教师.每秒帧,
                actual_skill: 计划?.实际技能 ?? 接口.获取实际技能名称?.(选中.技能) ?? 选中.技能,
                plan: 计划,
              }
            }),
          ),
          决策见证: [],
          未决动作: [],
          调度状态: 接口.获取调度摘要?.(),
          唤醒条件: [],
          拒绝动作: [],
        })
        const 行 = 记录[记录.length - 1]
        行.未决动作 = 行.动作预测
          .filter((项) => 项.status === 'unknown' && !可选.includes(项.action))
          .map((项) => 项.action)
        行.拒绝动作 = 合法.filter((项) => !可选.includes(项) && !行.未决动作.includes(项))
        行.决策见证 = 行.动作预测.flatMap((项) =>
          项.release_time === undefined
            ? []
            : [
                {
                  time: 状态.时间 / 教师.每秒帧,
                  release_time: 项.release_time,
                  action: 项.action,
                  allowed: 可选.includes(项.action) ? 'allowed' : 'forbidden',
                },
              ],
        )
        if (
          待绑定 &&
          待绑定.行.决策序号 + 1 === 决策序号 &&
          待绑定.行.游标 === 游标 &&
          轨迹.length === 游标 &&
          待绑定.行.决策动作 === null &&
          !待绑定.行.状态.读条 &&
          !状态.读条 &&
          状态.时间 === 待绑定.下个时间 &&
          决策末项 === 待绑定.末项 &&
          决策末态 === 待绑定.末态
        ) {
          const 前行 = 待绑定.行
          const 矩阵 =
            释放窗口 && 可选.length
              ? {
                  truth: Uint8Array.from(原子, (项) => Number(判定条件(项, 状态))),
                  executable: Uint8Array.from(语句, (_, 索引) => Number(合法.includes(索引))),
                }
              : {}
          // 复制当前已知计划；后续拒绝动作会更新当前行，不能共享允许列表。
          const 见证 = 可选.flatMap((索引) => {
            const 预测 = 行.动作预测.find((项) => 项.action === 索引)
            return 预测?.status === 'known' && 预测.release_time !== undefined
              ? [
                  {
                    time: 待绑定.下个时间 / 教师.每秒帧,
                    release_time: 预测.release_time,
                    action: 索引,
                    allowed: 'allowed' as const,
                    clock_atoms: 前行.等待条件,
                    ...矩阵,
                  },
                ]
              : []
          })
          前行.决策见证.push(...见证)
          前行.等待状态 = 见证.length ? 'allowed' : 'unknown'
          前行.等待依据 = 见证.length
            ? '实际下一决策证明唤醒时刻存在窗口内释放'
            : '下一唤醒点未找到合法释放，后续分支尚未证明'
        }
        if (释放窗口 && !强制教师)
          记录[记录.length - 1].释放窗口 = 计时('释放窗口', () =>
            观察释放窗口(记录[记录.length - 1], 目标, 接口, 语句, 原子, 容差, 教师.截止时间),
          )
      },
      释放后: (项) => {
        if (!对齐) return
        if (引导分歧) {
          // 比较仍指向少跳的引导；修复需使用后一个实际打断动作及其决策观察。
          失败 = { index: 游标 - 1, kind: 'channel_ticks_mismatch', repair_index: 游标 }
          拒绝()
          return
        }
        const 目标 = 教师.动作[游标]
        if (
          !目标 ||
          项.技能 !== 目标.技能 ||
          Math.abs(项.时间 - 目标.时间) > (强制教师 ? 严格 : 容差) + 严格
        ) {
          失败 = {
            index: 游标,
            kind:
              !目标 || 项.技能 !== 目标.技能
                ? 'wrong_action'
                : 项.时间 < 目标.时间
                  ? 'early_release'
                  : 'late_release',
          }
          拒绝()
        } else 游标++
      },
      等待: (状态, 下个时间, 固有时间, 来源) => {
        if (!对齐) return
        const 行 = 记录[记录.length - 1]
        if (!行 || 行.游标 !== 游标 || 行.状态.时间 !== 状态.时间) return
        计时('等待条件', () => 更新等待条件(行, 下个时间, 固有时间, 原子, 教师.每秒帧))
        行.唤醒来源 = 来源
        行.等待作用域 = JSON.stringify([游标, 状态.时间, 下个时间, 来源])
        const 目标 = 教师.动作[游标]
        if (!目标) {
          行.等待状态 = 'allowed'
          行.等待依据 = '目标动作已结束，等待至下一事件或截止'
        } else if (下个时间 > 目标.时间 + 容差 + 严格) {
          行.等待状态 = 'forbidden'
          行.等待依据 = '下一决策时刻已超过释放窗口上界'
        } else if (!状态.读条 && 接口.观察未来状态 && 下个时间 > 状态.时间) {
          if (!强制教师) {
            待绑定等待 = { 行, 下个时间, 末项: 决策末项, 末态: 决策末态 }
            return
          }
          const 见证 = 计时('等待未来状态', () =>
            接口.观察未来状态!(下个时间, (未来) => {
              const 可选 = 允许(未来)
              const 矩阵 =
                释放窗口 && 可选.length
                  ? {
                      truth: Uint8Array.from(原子, (项) => Number(判定条件(项, 未来))),
                      executable: Uint8Array.from(语句, (项) =>
                        Number(!!选择宏语句([项], 未来, 接口)),
                      ),
                    }
                  : {}
              return 可选.map((索引) => {
                const 选中 = 选择宏语句([语句[索引]], 未来, 接口)!
                return {
                  time: 下个时间 / 教师.每秒帧,
                  release_time:
                    (接口.获取释放计划?.(选中.技能)?.释放时间 ??
                      接口.获取技能释放时间?.(选中.技能) ??
                      未来.时间) / 教师.每秒帧,
                  action: 索引,
                  allowed: 'allowed' as const,
                  clock_atoms: 行.等待条件,
                  ...矩阵,
                }
              })
            }),
          )
          行.决策见证.push(...见证)
          行.等待状态 = 见证.length ? 'allowed' : 'unknown'
          行.等待依据 = 见证.length
            ? '隔离观察证明下一唤醒时刻存在窗口内释放'
            : '下一唤醒点未找到合法释放，后续分支尚未证明'
        } else {
          行.等待状态 = 'unknown'
          行.等待依据 = '当前引导或接口能力不足，无法证明等待分支'
        }
        行.必须释放 = 行.等待状态 === 'forbidden'
      },
      下个时间: 强制教师
        ? (状态) => {
            const 前项 = 教师.动作[游标 - 1]
            const 结束 =
              状态.读条 && 前项?.持续帧 !== undefined ? 前项.时间 + 前项.持续帧 : Infinity
            const 当前 = 教师.动作[游标]
            const 时间 = Math.min(当前?.决策时间 ?? 当前?.时间 ?? Infinity, 结束)
            return 对齐 && 时间 > 状态.时间 + 严格 ? 时间 : Infinity
          }
        : undefined,
      打断读条: 强制教师
        ? (状态) => {
            const 前项 = 教师.动作[游标 - 1]
            return (
              对齐 &&
              !!状态.读条 &&
              前项?.持续帧 !== undefined &&
              状态.时间 >= 前项.时间 + 前项.持续帧
            )
          }
        : undefined,
      停止: () => 停止,
      完成尾部读条: false,
      生成范围: true,
      样本动作数: 教师.动作.length,
      控制,
    })
  } catch (错误) {
    if (!(错误 instanceof 宏运行错误)) throw 错误
    结果 = 错误.结果
    截断 = 结果.结束.原因 === '动作上限' || 结果.结束.原因 === '执行步数上限'
    失败 = {
      index: 游标,
      kind: 截断
        ? 'resource_exhausted'
        : 结果.结束.原因 === '事件不推进'
          ? 'event_stall'
          : 'native_error',
    }
    对齐 = false
  }
  const 实际 = 接口.获取循环记录!().动作
  let 匹配 = 0
  let 最大偏差 = 0
  for (; 匹配 < Math.min(实际.length, 教师.动作.length); 匹配++) {
    const 左 = 教师.动作[匹配],
      右 = 实际[匹配]
    const 偏差 = Math.abs(左.时间 - 右.时间)
    if (
      左.技能 !== 右.技能 ||
      偏差 > (强制教师 ? 严格 : 容差) + 严格 ||
      左.作用次数 !== 右.作用次数 ||
      Math.abs((左.持续帧 ?? 0) - (右.持续帧 ?? 0)) > (强制教师 ? 严格 : 容差) + 严格
    )
      break
  }
  for (let 索引 = 0; 索引 < Math.min(实际.length, 教师.动作.length); 索引++) {
    if (实际[索引].技能 !== 教师.动作[索引].技能) break
    最大偏差 = Math.max(最大偏差, Math.abs(实际[索引].时间 - 教师.动作[索引].时间))
  }
  const 完整回放 = 结果.结束.原因 === '正常终点' && 结果.结束.决策区间已结束 && 结果.结束.尾部已结算
  const 完整 =
    完整回放 && 匹配 === 教师.动作.length && 实际.length === 教师.动作.length && !失败 && !截断
  let 首次漂移: number | undefined
  let 最近时刻对齐: number | undefined
  let 首次超容差: number | undefined
  for (let 索引 = 0; 索引 < Math.min(实际.length, 教师.动作.length); 索引++) {
    if (实际[索引].技能 !== 教师.动作[索引].技能) break
    const 偏差 = Math.abs(实际[索引].时间 - 教师.动作[索引].时间)
    if (偏差 > 严格 && 首次漂移 === undefined) 首次漂移 = 索引
    if (偏差 <= 严格) 最近时刻对齐 = 索引
    if (偏差 > 容差 + 严格) {
      首次超容差 = 索引
      break
    }
  }
  return {
    最终状态: 结果.最终状态,
    记录,
    动作: 实际,
    完整,
    匹配,
    最大偏差: 最大偏差 / 教师.每秒帧,
    轨迹: 结果.轨迹,
    失败,
    完整回放,
    结束: 结果.结束,
    观察耗时: 仅比较回放 && !强制教师 ? undefined : 观察耗时,
    时序诊断: {
      首次漂移,
      最近时刻对齐,
      首次超容差,
      回溯起点: 0,
      状态已恢复: false,
      依赖完整性: '部分',
    },
    截断,
    首次分歧: 完整
      ? undefined
      : `第 ${匹配 + 1} 次：目标 ${教师.动作[匹配]?.技能 || '等待至终点'}，实际 ${实际[匹配]?.技能 || '没有释放'}`,
  }
}
