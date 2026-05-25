import { useState, useEffect, useRef } from 'react'
import AlgRow from './AlgRow'
import AlgPlayer from './AlgPlayer'
import CubeView from './CubeView'
import { solvedState, applyAlg } from '../cube/state'
import { speak, fmt, parseMoves, randomScramble } from '../utils'

/**
 * 层先法单步详情：学习视图（公式播放）+ 练习视图（计时器 + 打乱）。
 */
export default function LBLStep({ step, progress, onUpdate }) {
  const [view, setView] = useState('learn')
  const [litMove, setLitMove] = useState(-1)
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(false)
  const [lastTime, setLastTime] = useState(null)
  const [scramble, setScramble] = useState(step.scramble)

  const tRef = useRef()
  const t0 = useRef()
  const playTimeouts = useRef([])

  const p = progress[step.id] || { reps: 0, mastered: false, best: null }

  // 计时器：每次启动从 0 开始计时，避免对 timer 的过期闭包依赖
  useEffect(() => {
    if (running) {
      t0.current = Date.now()
      tRef.current = setInterval(() => setTimer(Date.now() - t0.current), 50)
    } else {
      clearInterval(tRef.current)
    }
    return () => clearInterval(tRef.current)
  }, [running])

  // 卸载时清理所有播放 timeout
  useEffect(() => () => playTimeouts.current.forEach(clearTimeout), [])

  function playStep() {
    playTimeouts.current.forEach(clearTimeout)
    playTimeouts.current = []
    const ms = parseMoves(step.alg)
    ms.forEach((m, i) => {
      const id = setTimeout(() => {
        setLitMove(i)
        speak(m)
        if (i === ms.length - 1) {
          const cid = setTimeout(() => setLitMove(-1), 900)
          playTimeouts.current.push(cid)
        }
      }, i * 950)
      playTimeouts.current.push(id)
    })
  }

  function toggleTimer() {
    if (!running) {
      setTimer(0)
      setRunning(true)
    } else {
      setRunning(false)
      setLastTime(timer)
    }
  }

  function mark(mastered) {
    const best = lastTime
      ? p.best ? Math.min(p.best, lastTime) : lastTime
      : p.best
    onUpdate(step.id, { reps: p.reps + 1, mastered, best })
    setLastTime(null)
    setTimer(0)
    setRunning(false)
  }

  const S = {
    fontFamily: 'var(--mono)', fontSize: 11, padding: '7px 14px', borderRadius: 6,
    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid var(--border)', background: 'transparent',
  }

  return (
    <div style={{ padding: 22, background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>

      {/* 目标 */}
      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75, marginBottom: 16 }}>{step.goal}</div>

      {/* 给孩子说 */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#e8ff4709', border: '1px solid #e8ff4730', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>👦</span>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 4 }}>跟孩子说</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>{step.hint_for_child}</div>
        </div>
      </div>

      {/* 警告 */}
      {step.warning && (
        <div style={{ display: 'flex', gap: 8, background: '#ff6b6b0f', border: '1px solid #ff6b6b40', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#ffaaaa' }}>
          <span>⚠️</span><span>{step.warning}</span>
        </div>
      )}

      {/* 学习 / 练习 模式切换 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[['learn', '📖 学习'], ['practice', '🏃 练习']].map(([m, label]) => (
          <button
            key={m}
            onClick={() => setView(m)}
            style={{
              ...S,
              background: view === m ? 'var(--accent)' : 'transparent',
              color: view === m ? '#000' : 'var(--muted)',
              border: view === m ? 'none' : '1px solid var(--border)',
              fontWeight: view === m ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 学习视图 ── */}
      {view === 'learn' && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.7 }}>💡 {step.tip}</div>

          {step.alg ? (
            <>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                {step.alg_name}
              </div>
              <AlgRow alg={step.alg} lit={litMove} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button onClick={playStep} style={{ ...S, color: 'var(--accent2)' }}>▶ 逐步朗读</button>
                <button onClick={() => speak(step.alg)} style={{ ...S, color: 'var(--muted)' }}>🔊 整体朗读</button>
              </div>

              {/* 公式对复原态的效果演示 */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 10 }}>
                  公式效果（从复原态演示，看这条公式会怎样改变魔方）
                </div>
                <AlgPlayer key={step.id} scramble="" alg={step.alg} size={14} />
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', background: 'var(--surface2)', padding: '12px 16px', borderRadius: 8, borderLeft: '3px solid var(--accent2)' }}>
              这一步没有固定公式，靠观察和逻辑推断完成。
            </div>
          )}

          {step.alg2 && (
            <>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, marginTop: 18 }}>
                {step.alg2_name}
              </div>
              <AlgRow alg={step.alg2} lit={-1} />
              <button onClick={() => speak(step.alg2)} style={{ ...S, color: 'var(--muted)', marginTop: 8 }}>🔊 朗读</button>
            </>
          )}
        </div>
      )}

      {/* ── 练习视图 ── */}
      {view === 'practice' && (
        <div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 8 }}>练习说明</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75 }}>{step.practice_desc}</div>

            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em' }}>打乱公式</div>
                <button onClick={() => setScramble(randomScramble())} style={{ ...S, padding: '4px 10px', fontSize: 10, color: 'var(--accent2)' }}>↻ 随机</button>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)', background: 'var(--surface)', padding: '10px 14px', borderRadius: 6, borderLeft: '3px solid var(--accent)', lineHeight: 1.8 }}>
                {scramble}
              </div>
              <button onClick={() => speak(scramble)} style={{ ...S, color: 'var(--muted)', marginTop: 8 }}>🔊 朗读打乱</button>

              {/* 打乱后的目标练习状态（可切 2D/3D） */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <CubeView state={applyAlg(solvedState(), scramble)} size={14} />
              </div>
            </div>
          </div>

          {step.alg && (
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 4 }}>公式提示</div>
              <AlgRow alg={step.alg} lit={-1} />
              {step.alg2 && (
                <>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginTop: 10, marginBottom: 4 }}>{step.alg2_name}</div>
                  <AlgRow alg={step.alg2} lit={-1} />
                </>
              )}
            </div>
          )}

          {/* 计时器 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 0' }}>
            <div
              onClick={toggleTimer}
              style={{
                fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 700, cursor: 'pointer',
                userSelect: 'none', color: running ? 'var(--accent)' : 'var(--text)', transition: 'color 0.1s',
              }}
            >
              {fmt(timer)}
            </div>
            {lastTime && <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent2)' }}>本次 {fmt(lastTime)}s</div>}
            {p.best && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--mastered)' }}>最佳 {fmt(p.best)}s</div>}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>点击计时器 开始 / 停止</div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => mark(false)} style={{ fontFamily: 'var(--mono)', fontSize: 13, padding: '12px 28px', background: 'var(--surface2)', color: 'var(--accent3)', border: '1px solid var(--accent3)', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✗ 还不熟</button>
            <button onClick={() => mark(true)} style={{ fontFamily: 'var(--mono)', fontSize: 13, padding: '12px 28px', background: 'var(--mastered)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✓ 掌握了</button>
          </div>
        </div>
      )}
    </div>
  )
}
