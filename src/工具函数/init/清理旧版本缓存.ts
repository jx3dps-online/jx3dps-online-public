import 简写映射 from '@/心法模块/简写映射.json'

const 废弃键 = new Set([
  '新手引导',
  'jx3dps:旧缓存已清理:v1',
  ...[...Object.values(简写映射), '隐龙诀', '问水诀'].flatMap((心法) => [
    ...[
      '全部方案数据',
      '当前方案名称',
      '当前输出计算目标名称',
      '角色基础属性',
      '装备信息',
      '增益启用',
      '增益数据',
      '当前奇穴信息',
      '当前计算循环名称',
      '当前秘籍信息',
    ].map((名称) => `${心法}_${名称}`),
    `jx3dps:登龙长阶:v1:${encodeURIComponent(心法)}`,
  ]),
])

export const 旧缓存匹配 = (键: string) => 废弃键.has(键)

// 每次启动定向清理，导入旧备份后仍能执行；不匹配恢复备份和未知键。
export const 清理旧版本缓存 = () => {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const 键 = localStorage.key(i)
      if (键 && 旧缓存匹配(键)) localStorage.removeItem(键)
    }
  } catch (错误) {
    console.warn('旧版本缓存未清理完，下次启动将重试。', 错误)
  }
}
