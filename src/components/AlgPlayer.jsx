import { useState, useRef, useEffect, useMemo } from 'react'
import CubeView from './CubeView'
import AlgRow from './AlgRow'
import { solvedState, applyAlg, applyMove, isSolved } from '../cube/state'
import { parseMoves, speak } from '../utils'

/**
 * 公式播放器：把魔方从打乱态出发，逐步应用公式并动画展示。
 * - 魔方视图随当前进度实时渲染
 * - MoveChip 高亮当前刚执行的动作
 * - 播放 / 暂停 / 单步前后 / 复位
 *
 * @param {string} scramble 打乱公式（决定初始态）
 * @param {string} alg      解法公式（被逐步播放）
 * @param {number} size     贴纸边长(px)
 * @param {number} speakMoves 是否朗读每一步（默认 false）
 * @param {number} resetKey  外部递增该值即可让播放器一次性归位到打乱初始态
 */
export default function AlgPlayer({ scramble, alg, size = 15, speakMoves = false, resetKey = 0 }) {
  const moves = useMemo(() => parseMoves(alg), [alg])
  const scrambled = useMemo(
    () => applyAlg(solvedState(), scramble || ''),
    [scramble],
  )

  const [step, setStep] = useState(0) // 已执行动作数 0..moves.length
  const [playing, setPlaying] = useState(false)
  const timer = useRef()

  // 切换 case、或外部触发 resetKey 时，归位到打乱初始态
  useEffect(() => {
    setStep(0)
    setPlaying(false)
  }, [scramble, alg, resetKey])

  // 当前状态 = 打乱态 + 前 step 个动作
  const state = useMemo(() => {
    let s = scrambled
    for (let i = 0; i < step; i++) s = applyMove(s, moves[i])
    return s
  }, [scrambled, step, moves])

  // 自动播放
  useEffect(() => {
    if (!playing) return
    if (step >= moves.length) {
      setPlaying(false)
      return
    }
    timer.current = setTimeout(() => {
      if (speakMoves) speak(moves[step])
      setStep((s) => s + 1)
    }, 650)
    return () => clearTimeout(timer.current)
  }, [playing, step, moves, speakMoves])

  const done = step >= moves.length
  const solved = done && isSolved(state)
  const lit = step > 0 && step <= moves.length ? step - 1 : -1

  const btn = {
    fontFamily: 'var(--mono)', fontSize: 12, padding: '7px 12px',
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text)', borderRadius: 6, cursor: 'pointer', minWidth: 40,
  }

  return (
    <div>
      {/* 魔方视图（可切 2D / 3D） */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <CubeView state={state} size={size} />
      </div>

      {/* 进度 + 还原提示 */}
      <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: solved ? 'var(--mastered)' : 'var(--muted)', marginBottom: 8 }}>
        {step} / {moves.length} 步
        {solved && ' · ✓ 已还原'}
        {done && !solved && ' · 播放完毕'}
      </div>

      {/* 公式（高亮当前步） */}
      <AlgRow alg={alg} lit={lit} />

      {/* 控制条 */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
        <button style={btn} title="复位" onClick={() => { setPlaying(false); setStep(0) }}>↺</button>
        <button style={btn} title="上一步" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)) }}>◀</button>
        <button
          style={{ ...btn, color: 'var(--accent)', minWidth: 70 }}
          onClick={() => {
            if (done) setStep(0)
            setPlaying((p) => !p)
          }}
        >
          {playing ? '⏸ 暂停' : done ? '↻ 重放' : '▶ 播放'}
        </button>
        <button style={btn} title="下一步" onClick={() => { setPlaying(false); setStep((s) => Math.min(moves.length, s + 1)) }}>▶</button>
      </div>
    </div>
  )
}
