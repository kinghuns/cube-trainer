import { memo } from 'react'
import { COLORS } from '../cube/state'

// 6 个面在十字展开图中的网格位置（1-indexed grid line）
//        U
//      L F R B
//        D
const NET = {
  U: { row: 1, col: 2, offset: 0 },
  L: { row: 2, col: 1, offset: 36 },
  F: { row: 2, col: 2, offset: 18 },
  R: { row: 2, col: 3, offset: 9 },
  B: { row: 2, col: 4, offset: 45 },
  D: { row: 3, col: 2, offset: 27 },
}

function Face({ state, offset, sticker, gap }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${sticker}px)`,
        gridTemplateRows: `repeat(3, ${sticker}px)`,
        gap,
      }}
    >
      {Array.from({ length: 9 }, (_, k) => {
        const color = state[offset + k]
        return (
          <div
            key={k}
            style={{
              background: COLORS[color] || '#333',
              borderRadius: Math.max(2, sticker * 0.12),
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)',
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * 2D 十字展开图。
 * @param {string[]} state 长度 54 的颜色字母数组（来自 cube/state）
 * @param {number}   size  单个贴纸边长(px)，默认 18
 */
const CubeView2D = memo(function CubeView2D({ state, size = 18 }) {
  const gap = Math.max(1, Math.round(size * 0.12))
  const faceGap = gap * 3

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, max-content)',
        gridTemplateRows: 'repeat(3, max-content)',
        gap: faceGap,
        justifyContent: 'center',
        padding: faceGap,
        background: 'var(--surface2)',
        borderRadius: 10,
        width: 'fit-content',
      }}
    >
      {Object.entries(NET).map(([face, { row, col, offset }]) => (
        <div key={face} style={{ gridRow: row, gridColumn: col }}>
          <Face state={state} offset={offset} sticker={size} gap={gap} />
        </div>
      ))}
    </div>
  )
})

export default CubeView2D
