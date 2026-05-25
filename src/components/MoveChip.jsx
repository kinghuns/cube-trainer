import { memo } from 'react'
import { MOVE_INFO } from '../moveInfo'

/**
 * 单个动作芯片：彩色字母 + 中文助记。
 * `lit` 为 true 时显示高亮（用于公式逐步播放）。
 */
const MoveChip = memo(function MoveChip({ move, lit }) {
  const info = MOVE_INFO[move] || { cn: move, c: '#888' }
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: lit ? info.c + '28' : 'var(--surface2)',
        border: `1px solid ${lit ? info.c : 'var(--border)'}`,
        borderRadius: 6,
        padding: '5px 9px',
        margin: 3,
        transition: 'all 0.15s',
        transform: lit ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: info.c, fontWeight: 700 }}>
        {move}
      </span>
      <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{info.cn}</span>
    </span>
  )
})

export default MoveChip
