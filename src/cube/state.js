// ═══════════════════════════════════════════════════════════════════
// 三阶魔方状态引擎（纯函数，无外部依赖）
//
// 贴纸模型：54 个贴纸，按 URFDLB 顺序排列，每面 9 个（reading order）。
//   U: 0..8   R: 9..17   F: 18..26   D: 27..35   L: 36..44   B: 45..53
// 状态用长度 54 的颜色字母数组表示，字母即所属面：U R F D L B。
//
// 动作置换表用「3D 几何法」生成：每个贴纸有 3D 坐标 + 法向量，
// 转动一层 = 对该层贴纸的坐标和法向量做 90° 整数旋转，再映射回下标。
// 这样置换表是算出来的，杜绝手写 cycle 的方向 / 对齐错误。
// ═══════════════════════════════════════════════════════════════════

export const FACES = ['U', 'R', 'F', 'D', 'L', 'B']

// 标准配色（可在渲染层覆盖）
export const COLORS = {
  U: '#f5f5f5', // 白
  R: '#ec4b4b', // 红
  F: '#4ade80', // 绿
  D: '#facc15', // 黄
  L: '#ff8c42', // 橙
  B: '#4aa3ff', // 蓝
}

// ── 下标 → 3D 坐标 + 法向量 ──────────────────────────
// 坐标各分量 ∈ {-1,0,1}。法向量为该面朝外的单位向量。
function idxToCoord(i) {
  const face = Math.floor(i / 9)
  const local = i % 9
  const r = Math.floor(local / 3)
  const c = local % 3
  switch (face) {
    case 0: return { pos: [c - 1, 1, r - 1], normal: [0, 1, 0] }   // U +Y
    case 1: return { pos: [1, 1 - r, 1 - c], normal: [1, 0, 0] }   // R +X
    case 2: return { pos: [c - 1, 1 - r, 1], normal: [0, 0, 1] }   // F +Z
    case 3: return { pos: [c - 1, -1, 1 - r], normal: [0, -1, 0] } // D -Y
    case 4: return { pos: [-1, 1 - r, c - 1], normal: [-1, 0, 0] } // L -X
    case 5: return { pos: [1 - c, 1 - r, -1], normal: [0, 0, -1] } // B -Z
    default: throw new Error('bad index ' + i)
  }
}

// ── 3D 坐标 + 法向量 → 下标 ──────────────────────────
function coordToIdx([x, y, z], [nx, ny, nz]) {
  let face, r, c
  if (ny === 1)      { face = 0; c = x + 1; r = z + 1 }       // U
  else if (nx === 1) { face = 1; r = 1 - y; c = 1 - z }       // R
  else if (nz === 1) { face = 2; c = x + 1; r = 1 - y }       // F
  else if (ny === -1){ face = 3; c = x + 1; r = 1 - z }       // D
  else if (nx === -1){ face = 4; r = 1 - y; c = z + 1 }       // L
  else               { face = 5; c = 1 - x; r = 1 - y }       // B
  return face * 9 + r * 3 + c
}

// ── 90° 整数旋转函数（按各面顺时针方向，同时作用于坐标和法向量）──
const ROT = {
  X_CW:  ([x, y, z]) => [x, z, -y],  // R 方向
  X_CCW: ([x, y, z]) => [x, -z, y],  // L 方向
  Y_CW:  ([x, y, z]) => [-z, y, x],  // U 方向
  Y_CCW: ([x, y, z]) => [z, y, -x],  // D 方向
  Z_CW:  ([x, y, z]) => [y, -x, z],  // F 方向
  Z_CCW: ([x, y, z]) => [-y, x, z],  // B 方向
}

// 每个记号：旋转轴(0=x,1=y,2=z) + 参与的层(坐标值集合) + 旋转方向。
// 支持：6 面转、3 中层(M/E/S)、6 宽层(r/l/u/d/f/b)、3 转体(x/y/z)。
const MOVE_DEF = {
  // 面转（单层）
  U: { axis: 1, layers: [1],        rot: ROT.Y_CW },
  D: { axis: 1, layers: [-1],       rot: ROT.Y_CCW },
  R: { axis: 0, layers: [1],        rot: ROT.X_CW },
  L: { axis: 0, layers: [-1],       rot: ROT.X_CCW },
  F: { axis: 2, layers: [1],        rot: ROT.Z_CW },
  B: { axis: 2, layers: [-1],       rot: ROT.Z_CCW },
  // 中层（跟随相邻面方向）
  M: { axis: 0, layers: [0],        rot: ROT.X_CCW }, // 跟 L
  E: { axis: 1, layers: [0],        rot: ROT.Y_CCW }, // 跟 D
  S: { axis: 2, layers: [0],        rot: ROT.Z_CW },  // 跟 F
  // 宽层（外层 + 中层）
  r: { axis: 0, layers: [1, 0],     rot: ROT.X_CW },
  l: { axis: 0, layers: [-1, 0],    rot: ROT.X_CCW },
  u: { axis: 1, layers: [1, 0],     rot: ROT.Y_CW },
  d: { axis: 1, layers: [-1, 0],    rot: ROT.Y_CCW },
  f: { axis: 2, layers: [1, 0],     rot: ROT.Z_CW },
  b: { axis: 2, layers: [-1, 0],    rot: ROT.Z_CCW },
  // 转体（整只魔方）
  x: { axis: 0, layers: [1, 0, -1], rot: ROT.X_CW },
  y: { axis: 1, layers: [1, 0, -1], rot: ROT.Y_CW },
  z: { axis: 2, layers: [1, 0, -1], rot: ROT.Z_CW },
}

// 为某个记号（顺时针一次）生成置换数组 perm：newState[j] = oldState[perm[j]]
function buildPerm({ axis, layers, rot }) {
  const perm = new Array(54)
  for (let i = 0; i < 54; i++) {
    const { pos, normal } = idxToCoord(i)
    let np = pos
    let nn = normal
    if (layers.includes(pos[axis])) {
      np = rot(pos)
      nn = rot(normal)
    }
    const j = coordToIdx(np, nn)
    perm[j] = i
  }
  return perm
}

// 预计算所有记号的置换表（大小写敏感：d≠D, x 为转体）
const PERM = {}
for (const k in MOVE_DEF) PERM[k] = buildPerm(MOVE_DEF[k])

// ── 公开 API ─────────────────────────────────────────

export function solvedState() {
  const s = new Array(54)
  for (let f = 0; f < 6; f++)
    for (let k = 0; k < 9; k++) s[f * 9 + k] = FACES[f]
  return s
}

function applyPerm(state, perm) {
  const out = new Array(54)
  for (let j = 0; j < 54; j++) out[j] = state[perm[j]]
  return out
}

// 应用单个动作记号：U / U' / U2 / R' / M2 / x / r' / d ...
// 大小写敏感：d 是宽层、D 是面转、x/y/z 是转体。
export function applyMove(state, move) {
  if (!move) return state
  const base = move[0]
  const suffix = move.slice(1)

  const perm = PERM[base] // 大小写敏感查表
  if (!perm) return state // 不认识的记号：保持不变（不破坏状态）

  let times = 1
  if (suffix === "'") times = 3
  else if (suffix.startsWith('2')) times = 2 // 2 或 2'

  let s = state
  for (let t = 0; t < times; t++) s = applyPerm(s, perm)
  return s
}

// 应用整条公式（空格分隔）。括号、宽层、转体等非基本记号会被规整或忽略。
export function applyAlg(state, alg) {
  if (!alg) return state
  const moves = alg.replace(/[()]/g, ' ').trim().split(/\s+/).filter(Boolean)
  let s = state
  for (const m of moves) s = applyMove(s, m)
  return s
}

export function isSolved(state) {
  for (let f = 0; f < 6; f++)
    for (let k = 0; k < 9; k++) if (state[f * 9 + k] !== FACES[f]) return false
  return true
}
