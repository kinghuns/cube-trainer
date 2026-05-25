import { useState, useRef, useEffect, useMemo } from 'react'
import { fmt } from '../utils'

/**
 * 可搜索的 case 下拉选择（autocomplete combobox）。
 * - 输入关键字过滤 name / group / desc / id
 * - 键盘 ↑↓ 选择、Enter 确认、Esc 关闭
 * - 列表项显示掌握状态 ✓ 与最佳时间
 *
 * @param {Array}    cases    case 列表
 * @param {object}   progress 进度对象（取掌握/最佳时间）
 * @param {object}   value    当前选中的 case（或 null）
 * @param {Function} onChange (case) => void
 */
export default function CaseSelect({ cases, progress, value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const wrapRef = useRef(null)

  // 选中项变化时同步输入框显示
  useEffect(() => {
    setQuery(value ? value.name : '')
  }, [value])

  // 点击外部关闭
  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    // 输入恰好等于已选名称时不过滤，方便重新浏览全部
    if (!q || (value && q === value.name.toLowerCase())) return cases
    return cases.filter((c) =>
      `${c.name} ${c.group} ${c.desc || ''} ${c.id}`.toLowerCase().includes(q),
    )
  }, [query, cases, value])

  // 过滤结果变化时把高亮重置到顶部
  useEffect(() => {
    setHi(0)
  }, [query])

  function choose(c) {
    onChange(c)
    setQuery(c.name)
    setOpen(false)
  }

  function onKey(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHi((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHi((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[hi]) choose(filtered[hi])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginBottom: 14 }}>
      <input
        value={query}
        placeholder="搜索或选择 case（如 OLL 27 / 鱼形 / sune）…"
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        style={{
          width: '100%',
          fontFamily: 'var(--mono)',
          fontSize: 13,
          padding: '11px 36px 11px 14px',
          background: 'var(--surface)',
          color: 'var(--text)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8,
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
      />
      <span
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--muted)', fontSize: 11, cursor: 'pointer', userSelect: 'none',
        }}
      >
        {open ? '▲' : '▼'}
      </span>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 20,
            maxHeight: 300,
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--accent)',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {filtered.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)' }}>无匹配结果</div>
          )}
          {filtered.map((c, i) => {
            const p = progress[c.id]
            const isHi = i === hi
            const isSel = value?.id === c.id
            return (
              <div
                key={c.id}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(c)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 14px',
                  cursor: 'pointer',
                  background: isHi ? 'var(--surface2)' : 'transparent',
                  borderLeft: `3px solid ${isSel ? 'var(--accent)' : 'transparent'}`,
                }}
              >
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', fontWeight: 700, minWidth: 64 }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 48 }}>{c.group}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.desc}
                </span>
                {p?.best && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent2)' }}>{fmt(p.best)}s</span>
                )}
                {p?.mastered && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--mastered)' }}>✓</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
