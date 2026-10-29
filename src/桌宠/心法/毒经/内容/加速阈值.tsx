import styles from './加速阈值.module.less'

const 降厄图标 = 'https://icon.jx3box.com/icon/19186.png'
const 狂暴图标 = 'https://icon.jx3box.com/icon/2763.png'

const 图标 = (src: string) => <img className={styles.icon} src={src} alt='' />

const 加速阈值 = () => {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td>加速值</td>
            <td className={styles.gap} rowSpan={11} />
            <td colSpan={2}>基础</td>
            <td className={styles.gap} rowSpan={11} />
            <td colSpan={2}>
              <div className={styles.group}>降厄 {图标(降厄图标)}</div>
            </td>
            <td className={styles.gap} rowSpan={11} />
            <td colSpan={2}>
              <div className={styles.group}>
                降厄狂暴 {图标(降厄图标)}
                {图标(狂暴图标)}
              </div>
            </td>
          </tr>
          <tr>
            <td>0</td>
            <td>1.5s</td>
            <td>24</td>
            <td>1s</td>
            <td>16</td>
            <td>0.9375s</td>
            <td>15</td>
          </tr>
          <tr>
            <td>
              <span className={styles.强调}>10</span>
            </td>
            <td>1.4375s</td>
            <td>23</td>
            <td rowSpan={3}>0.9375s</td>
            <td rowSpan={3}>15</td>
            <td rowSpan={4}>0.875s</td>
            <td rowSpan={4}>13</td>
          </tr>
          <tr>
            <td>445</td>
            <td>1.375s</td>
            <td>22</td>
          </tr>
          <tr>
            <td>928</td>
            <td rowSpan={3}>1.3125s</td>
            <td rowSpan={3}>21</td>
          </tr>
          <tr>
            <td>
              <span className={styles.蓝}>1017</span>
            </td>
            <td rowSpan={4}>0.875s</td>
            <td rowSpan={4}>14</td>
          </tr>
          <tr>
            <td>
              <span className={styles.主题}>1165</span>
            </td>
            <td rowSpan={4}>0.8125s</td>
            <td rowSpan={4}>13</td>
          </tr>
          <tr>
            <td>1452</td>
            <td>1.25s</td>
            <td>20</td>
          </tr>
          <tr>
            <td>2024</td>
            <td rowSpan={3}>1.1875s</td>
            <td rowSpan={3}>19</td>
          </tr>
          <tr>
            <td>
              <span className={styles.蓝}>2172</span>
            </td>
            <td rowSpan={2}>0.8125s</td>
            <td rowSpan={2}>13</td>
          </tr>
          <tr>
            <td>
              <span className={styles.主题}>2498</span>
            </td>
            <td>0.75s</td>
            <td>12</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default 加速阈值
