import { useState } from 'react'
import CubeView2D from './CubeView2D'
import CubeView3D from './CubeView3D'

const PREF_KEY = 'cube_view_3d'

function loadPref() {
  try {
    return localStorage.getItem(PREF_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * 魔方视图统一入口：在 2D 展开图 / 3D 等距图之间切换。
 * 偏好存 localStorage，新挂载的视图默认沿用上次选择。
 *
 * @param {string[]} state  长度 54 颜色数组
 * @param {number}   size   贴纸边长(px)
 * @param {boolean}  toggle 是否显示切换按钮（默认 true）
 */
export default function CubeView({ state, size = 15, toggle = true }) {
  const [is3d, setIs3d] = useState(loadPref)

  function flip() {
    const v = !is3d
    setIs3d(v)
    try {
      localStorage.setItem(PREF_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {is3d ? <CubeView3D state={state} size={size + 7} /> : <CubeView2D state={state} size={size} />}
      {toggle && (
        <button
          onClick={flip}
          style={{
            fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 12px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--muted)', borderRadius: 6, cursor: 'pointer',
          }}
        >
          {is3d ? '◳ 切到 2D 展开' : '⬚ 切到 3D 立体'}
        </button>
      )}
    </div>
  )
}
