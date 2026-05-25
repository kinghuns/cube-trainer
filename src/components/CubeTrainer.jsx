import { useState, useEffect } from 'react'
import LBLStep from './LBLStep'
import CFOPTrainer from './CFOPTrainer'
import { LAYER_BY_LAYER, CFOP_DATA } from '../data'
import { loadProgress, saveProgress, fmt } from '../utils'

/**
 * 主壳：标签页（层先法 / CFOP）+ 全局进度 + 重置入口。
 */
export default function CubeTrainer() {
  const [tab, setTab] = useState('LBL')
  const [progress, setProgress] = useState(loadProgress)
  const [openStep, setOpenStep] = useState(null)
  const [cfopSub, setCfopSub] = useState('OLL')
  const [showReset, setShowReset] = useState(false)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  function upd(id, data) {
    setProgress((p) => ({ ...p, [id]: data }))
  }

  function resetProgress() {
    setProgress({})
    setShowReset(false)
  }

  const lblDone = LAYER_BY_LAYER.filter((s) => progress[s.id]?.mastered).length

  return (
    <div className="app">
      {/* ── 顶部栏 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0 18px', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: '0.15em' }}>
          CUBE<span style={{ color: 'var(--muted)' }}>/</span>TRAINER
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
            {[['LBL', '层先法 🟡'], ['CFOP', 'CFOP ⚡']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 18px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', transition: 'all 0.15s',
                  background: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? '#000' : 'var(--muted)',
                  fontWeight: tab === t ? 700 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowReset((r) => !r)}
            title="设置 / 重置进度"
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer', padding: '8px 10px', fontSize: 14 }}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* 重置确认条 */}
      {showReset && (
        <div style={{ background: '#ff6b6b0f', border: '1px solid #ff6b6b40', borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: '#ffaaaa' }}>确定要清空所有进度数据吗？此操作不可恢复。</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={resetProgress} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 16px', background: 'var(--accent3)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>清空</button>
            <button onClick={() => setShowReset(false)} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 16px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>取消</button>
          </div>
        </div>
      )}

      {/* ══ 层先法 ══ */}
      {tab === 'LBL' && (
        <div>
          {/* 进度条 */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 26, color: 'var(--accent)', fontWeight: 700 }}>
                {lblDone}<span style={{ fontSize: 13, color: 'var(--muted)' }}> / {LAYER_BY_LAYER.length}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 2 }}>步骤已掌握</div>
            </div>
            <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(lblDone / LAYER_BY_LAYER.length) * 100}%`, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)' }}>{Math.round((lblDone / LAYER_BY_LAYER.length) * 100)}%</div>
          </div>

          {/* 手风琴步骤 */}
          {LAYER_BY_LAYER.map((step) => {
            const p = progress[step.id]
            const open = openStep === step.id
            return (
              <div key={step.id} style={{ marginBottom: 8 }}>
                <div
                  onClick={() => setOpenStep(open ? null : step.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px',
                    background: 'var(--surface)',
                    border: `1px solid ${
                      open ? 'var(--accent)' : p?.mastered ? 'var(--mastered)' : 'var(--border)'
                    }`,
                    borderRadius: open ? '10px 10px 0 0' : 10,
                    cursor: 'pointer', transition: 'all 0.15s',
                    borderBottom: open ? 'none' : undefined,
                  }}
                >
                  <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{step.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>第{step.step}步</span>
                      <span style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700 }}>{step.name}</span>
                      {p?.mastered && <span style={{ fontSize: 10, color: 'var(--mastered)', fontFamily: 'var(--mono)' }}>✓ 掌握</span>}
                      {p?.reps > 0 && !p?.mastered && <span style={{ fontSize: 10, color: 'var(--accent2)', fontFamily: 'var(--mono)' }}>练了{p.reps}次</span>}
                      {p?.best && <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>最佳 {fmt(p.best)}s</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
                </div>
                {open && (
                  <div style={{ border: '1px solid var(--accent)', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                    <LBLStep step={step} progress={progress} onUpdate={upd} />
                  </div>
                )}
              </div>
            )
          })}

          {/* 完成横幅 */}
          {lblDone === LAYER_BY_LAYER.length && (
            <div style={{ marginTop: 20, padding: '22px 24px', background: 'linear-gradient(135deg,#e8ff4712,#47c8ff12)', border: '1px solid var(--accent)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--accent)', marginBottom: 8 }}>🎉 层先法已全部掌握！</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>可以开始学习 CFOP 速拧方法了。</div>
              <button onClick={() => setTab('CFOP')} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '10px 22px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>进入 CFOP →</button>
            </div>
          )}
        </div>
      )}

      {/* ══ CFOP ══ */}
      {tab === 'CFOP' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>
            💡 CFOP 流程：<span style={{ color: 'var(--text)' }}>F2L</span>（前两层）→ <span style={{ color: 'var(--text)' }}>OLL</span>（顶层朝向）→ <span style={{ color: 'var(--text)' }}>PLL</span>（顶层排列）。建议先从 OLL 开始，掌握几个高频 case。
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
            {['OLL', 'PLL', 'F2L'].map((t) => (
              <button
                key={t}
                onClick={() => setCfopSub(t)}
                style={{
                  fontFamily: 'var(--mono)', fontSize: 12, padding: '7px 18px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', transition: 'all 0.15s',
                  background: cfopSub === t ? 'var(--accent)' : 'transparent',
                  color: cfopSub === t ? '#000' : 'var(--muted)',
                  fontWeight: cfopSub === t ? 700 : 400,
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <CFOPTrainer key={cfopSub} cases={CFOP_DATA[cfopSub]} progress={progress} onUpdate={upd} />
        </div>
      )}
    </div>
  )
}
