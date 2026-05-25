// ═══════════════════════════════════════════════════════════════════
// 进度持久化
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'cube_trainer_v3'

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveProgress(d) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
  } catch {
    /* quota or privacy mode — ignore */
  }
}

// ═══════════════════════════════════════════════════════════════════
// 文本转语音（朗读公式）
// ═══════════════════════════════════════════════════════════════════

export function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = text
    .replace(/([RLUDFBMESrludfbxyz])2'/g, '$1 2 ')
    .replace(/([RLUDFBMESrludfbxyz])'/g, '$1 prime ')
    .replace(/([RLUDFBMESrludfbxyz])2/g, '$1 2 ')
    .replace(/([RLUDFBMESrludfbxyz])/g, '$1 ')
  const u = new SpeechSynthesisUtterance(clean)
  u.lang = 'en-US'
  u.rate = 0.78
  window.speechSynthesis.speak(u)
}

// ═══════════════════════════════════════════════════════════════════
// 通用
// ═══════════════════════════════════════════════════════════════════

export function fmt(ms) {
  return ms ? (ms / 1000).toFixed(2) : '0.00'
}

// 规范化公式：去掉视觉分组括号，合并多余空白。
// "U (R U' R')" → "U R U' R'"
export function normalizeAlg(alg) {
  if (!alg) return ''
  return alg.replace(/[()]/g, ' ').trim().split(/\s+/).join(' ')
}

export function parseMoves(alg) {
  if (!alg) return []
  return normalizeAlg(alg).split(/\s+/).filter(Boolean)
}

// 反转公式：每个动作方向取反并整体倒序。
// R U R' → R U' R'   ·   R2 是 180° 自逆，保持不变。
// 用于由解法 alg 推导对应的 scramble。
export function invertAlg(alg) {
  if (!alg) return ''
  return normalizeAlg(alg)
    .split(/\s+/)
    .reverse()
    .map((m) => {
      if (!m) return m
      if (m.endsWith("2'")) return m.slice(0, -1) // R2' → R2
      if (m.endsWith("'")) return m.slice(0, -1)  // R'  → R
      if (m.endsWith('2')) return m               // R2  → R2
      return m + "'"                              // R   → R'
    })
    .join(' ')
}

// 随机生成 n 步打乱序列（不允许相邻同面，避免 R R' 这种无效连续）
export function randomScramble(n = 20) {
  const faces = ['R', 'L', 'U', 'D', 'F', 'B']
  const sfx = ['', "'", '2']
  const moves = []
  let last = ''
  for (let i = 0; i < n; i++) {
    let f
    do {
      f = faces[Math.floor(Math.random() * faces.length)]
    } while (f === last)
    last = f
    moves.push(f + sfx[Math.floor(Math.random() * sfx.length)])
  }
  return moves.join(' ')
}
