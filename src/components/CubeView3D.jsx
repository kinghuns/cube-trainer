import { memo } from 'react'
import { COLORS } from '../cube/state'

// 各面在 state 数组中的起始下标
const FACE_OFFSET = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 }

function FaceTiles({ state, offset, s, g }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${s}px)`,
        gridTemplateRows: `repeat(3, ${s}px)`,
        gap: g,
        width: '100%',
        height: '100%',
        padding: g,
        boxSizing: 'border-box',
        background: '#0a0a0c',
        borderRadius: 4,
      }}
    >
      {Array.from({ length: 9 }, (_, k) => (
        <div
          key={k}
          style={{
            background: COLORS[state[offset + k]] || '#333',
            borderRadius: Math.max(2, s * 0.12),
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.45)',
          }}
        />
      ))}
    </div>
  )
}

/**
 * 3D 等距视图。CSS transforms 拼出立方体，默认角度展示 U / F / R 三面。
 * 配色与朝向语义同 cube/state（U 顶行=后, R 列0=前 等）。
 * @param {string[]} state 长度 54 颜色数组
 * @param {number}   size  贴纸边长(px)
 */
const CubeView3D = memo(function CubeView3D({ state, size = 22 }) {
  const s = size
  const g = Math.max(1, Math.round(s * 0.12))
  const n = s * 3 + g * 4 // 3 贴纸 + 贴纸间隙*2 + 内边距*2
  const half = n / 2

  // 标准 CSS 立方体六面变换
  const T = {
    F: `translateZ(${half}px)`,
    B: `rotateY(180deg) translateZ(${half}px)`,
    R: `rotateY(90deg) translateZ(${half}px)`,
    L: `rotateY(-90deg) translateZ(${half}px)`,
    U: `rotateX(90deg) translateZ(${half}px)`,
    D: `rotateX(-90deg) translateZ(${half}px)`,
  }

  return (
    <div
      style={{
        perspective: n * 4,
        width: n * 1.7,
        height: n * 1.7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: n,
          height: n,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-28deg) rotateY(-38deg)',
        }}
      >
        {Object.entries(T).map(([face, t]) => (
          <div
            key={face}
            style={{
              position: 'absolute',
              width: n,
              height: n,
              left: 0,
              top: 0,
              transform: t,
              backfaceVisibility: 'hidden',
            }}
          >
            <FaceTiles state={state} offset={FACE_OFFSET[face]} s={s} g={g} />
          </div>
        ))}
      </div>
    </div>
  )
})

export default CubeView3D
