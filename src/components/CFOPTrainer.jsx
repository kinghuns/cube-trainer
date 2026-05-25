import { useState, useEffect, useRef, useCallback } from 'react'
import AlgRow from './AlgRow'
import CaseSelect from './CaseSelect'
import AlgPlayer from './AlgPlayer'
import CubeView2D from './CubeView2D'
import { solvedState, applyAlg } from '../cube/state'
import { speak, fmt } from '../utils'

/**
 * CFOP Case 训练器：网格选择 + 顺序抽测 + 计时 + 进度记录。
 * 支持空格键开始/停止计时。
 */
export default function CFOPTrainer({ cases, progress, onUpdate }) {
  const [sel, setSel] = useState(null)
  const [scrambleResetKey, setScrambleResetKey] = useState(0)
  const [inTrain, setInTrain] = useState(false)
  const [done, setDone] = useState(false)
  const [queue, setQueue] = useState([])
  const [idx, setIdx] = useState(0)
  const [showAlg, setShowAlg] = useState(false)
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(false)
  const [lastTime, setLastTime] = useState(null)
  const tRef = useRef()
  const t0 = useRef()

  useEffect(() => {
    if (running) {
      t0.current = Date.now()
      tRef.current = setInterval(() => setTimer(Date.now() - t0.current), 50)
    } else {
      clearInterval(tRef.current)
    }
    return () => clearInterval(tRef.current)
  }, [running])

  const handleKey = useCallback(
    (e) => {
      if (e.code === 'Space' && inTrain) {
        e.preventDefault()
        if (!running) {
          setTimer(0)
          setRunning(true)
        } else {
          setRunning(false)
          setLastTime(timer)
        }
      }
    },
    [inTrain, running, timer],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function startTrain(list) {
    const q = [...list].sort(() => Math.random() - 0.5)
    setQueue(q)
    setIdx(0)
    setShowAlg(false)
    setInTrain(true)
    setDone(false)
    setLastTime(null)
    setTimer(0)
    setRunning(false)
    speak(q[0]?.scramble || '')
  }

  function markResult(mastered) {
    const c = queue[idx]
    const p = progress[c.id] || { attempts: 0, mastered: false, best: null }
    const best = lastTime
      ? p.best ? Math.min(p.best, lastTime) : lastTime
      : p.best
    onUpdate(c.id, { attempts: p.attempts + 1, mastered, best })
    const next = idx + 1
    if (next >= queue.length) {
      setInTrain(false)
      setDone(true)
    } else {
      setIdx(next)
      setShowAlg(false)
      setLastTime(null)
      setTimer(0)
      setRunning(false)
      speak(queue[next]?.scramble || '')
    }
  }

  const mastered = cases.filter((c) => progress[c.id]?.mastered).length
  const tc = queue[idx]
  const S = {
    fontFamily: 'var(--mono)', fontSize: 11, padding: '6px 12px',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--muted)', borderRadius: 6, cursor: 'pointer',
  }

  // ── 训练完成 ──
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 20, color: 'var(--accent)', marginBottom: 8 }}>本轮训练完成！</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>{mastered} / {cases.length} 已掌握</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => startTrain(cases)} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '10px 24px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>再来一轮</button>
          <button onClick={() => { setDone(false); setSel(null) }} style={{ ...S, padding: '10px 24px' }}>返回列表</button>
        </div>
      </div>
    )
  }

  // ── 训练中 ──
  if (inTrain && tc) {
    return (
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{idx + 1} / {queue.length}</div>
          <button onClick={() => { setInTrain(false); window.speechSynthesis?.cancel() }} style={S}>退出训练</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--accent)', fontWeight: 700 }}>{tc.name}</div>
          {tc.desc && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{tc.desc}</div>}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 24px', textAlign: 'center', width: '100%', maxWidth: 480 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 8 }}>打乱公式</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--text)', lineHeight: 1.8 }}>{tc.scramble}</div>
            <button onClick={() => speak(tc.scramble)} style={{ ...S, marginTop: 10 }}>🔊 重新朗读</button>

            {/* 打乱后的魔方状态（随题目同步更新） */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <CubeView2D state={applyAlg(solvedState(), tc.scramble)} size={14} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              onClick={() => {
                if (!running) {
                  setTimer(0)
                  setRunning(true)
                } else {
                  setRunning(false)
                  setLastTime(timer)
                }
              }}
              style={{
                fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 700,
                cursor: 'pointer', userSelect: 'none',
                color: running ? 'var(--accent)' : 'var(--text)',
              }}
            >
              {fmt(timer)}
            </div>
            {lastTime && <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent2)' }}>本次 {fmt(lastTime)}s</div>}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>SPACE 或点击 开始/停止</div>
          </div>

          <div style={{ width: '100%', maxWidth: 480 }}>
            {!showAlg ? (
              <button
                onClick={() => setShowAlg(true)}
                style={{
                  width: '100%', fontFamily: 'var(--mono)', fontSize: 12,
                  padding: 14, border: '1px dashed var(--border)', borderRadius: 8,
                  background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                }}
              >
                点击显示算法 →
              </button>
            ) : (
              <AlgRow alg={tc.alg} lit={-1} />
            )}
          </div>

          {showAlg && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => markResult(false)} style={{ fontFamily: 'var(--mono)', fontSize: 13, padding: '12px 28px', background: 'var(--surface2)', color: 'var(--accent3)', border: '1px solid var(--accent3)', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✗ 再练</button>
              <button onClick={() => markResult(true)} style={{ fontFamily: 'var(--mono)', fontSize: 13, padding: '12px 28px', background: 'var(--mastered)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✓ 掌握</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Case 列表 ──
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)' }}>{mastered} / {cases.length} 已掌握</div>
          <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, marginTop: 6, overflow: 'hidden', width: 120 }}>
            <div style={{ height: '100%', width: `${(mastered / cases.length) * 100}%`, background: 'var(--mastered)', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => startTrain(cases)} style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '8px 16px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>▶ 全部训练</button>
          <button
            onClick={() => {
              const w = cases.filter((c) => !progress[c.id]?.mastered)
              if (w.length) startTrain(w)
            }}
            style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '8px 16px', background: 'transparent', color: 'var(--accent3)', border: '1px solid var(--accent3)', borderRadius: 6, cursor: 'pointer' }}
          >
            ✗ 弱项
          </button>
        </div>
      </div>

      <CaseSelect cases={cases} progress={progress} value={sel} onChange={setSel} />

      {sel && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 22, marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 700 }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{sel.desc}</div>
            </div>
            <button onClick={() => setSel(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 6 }}>打乱公式</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', background: 'var(--surface2)', padding: '8px 12px', borderRadius: 6, borderLeft: '3px solid var(--accent2)', marginBottom: 16 }}>{sel.scramble}</div>

          {/* 魔方视图 + 逐步播放 */}
          <AlgPlayer key={sel.id} scramble={sel.scramble} alg={sel.alg} size={15} resetKey={scrambleResetKey} />

          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <button onClick={() => startTrain([sel])} style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '9px 16px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>▶ 单独训练</button>
            <button onClick={() => { speak(sel.scramble); setScrambleResetKey((k) => k + 1) }} style={{ ...S, padding: '9px 14px', color: 'var(--text)' }}>🔊 打乱</button>
            <button onClick={() => speak(sel.alg)} style={{ ...S, padding: '9px 14px', color: 'var(--text)' }}>🔊 算法</button>
          </div>
        </div>
      )}
    </div>
  )
}
