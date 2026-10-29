import 心法数据 from '@/数据/静态数据/心法数据.json'
import styles from './index.module.less'

interface 切心法LoadingProps {
  目标心法名: string
}

// 切心法过渡 loading：半透明遮罩保留旧页面在底下，顶部扫光条 + 目标心法图标
const 切心法Loading = ({ 目标心法名 }: 切心法LoadingProps) => {
  const 图标 = 心法数据?.[目标心法名]?.系统配置?.心法图标 || 'https://img.jx3box.com/image/xf/0.png'

  return (
    <div className={styles.遮罩}>
      <div className={styles.扫光条} />
      <div className={styles.中心}>
        <img className={styles.图标} src={图标} />
        <span className={styles.文字}>正在切换至 {目标心法名}</span>
      </div>
    </div>
  )
}

export default 切心法Loading
