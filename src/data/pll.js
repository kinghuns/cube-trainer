// ═══════════════════════════════════════════════════════════════════
// PLL · Permutation of the Last Layer · 21 种顶层排列情况
// 公式参考 algdb.net / J Perm 通用短算法。
// scramble 由 invertAlg(alg) 在运行时自动推导（见 utils.js）。
// ═══════════════════════════════════════════════════════════════════

import { invertAlg } from '../utils'

const m = (id, name, group, alg, desc) => ({
  id, name, group, alg, scramble: invertAlg(alg), desc,
})

export const PLL_CASES = [
  // ── 棱换位（仅 3 棱循环，角已就位） ──
  m('PLL_Ua', 'U-perm a', '棱循环',
    "M2 U M U2 M' U M2",
    '三棱顺时针循环（角已就位）'),
  m('PLL_Ub', 'U-perm b', '棱循环',
    "M2 U' M U2 M' U' M2",
    '三棱逆时针循环（角已就位）'),
  m('PLL_H', 'H-perm', '棱对换',
    "M2 U M2 U2 M2 U M2",
    '两对对面棱互换'),
  m('PLL_Z', 'Z-perm', '棱对换',
    "M' U M2 U M2 U M' U2 M2",
    '两对相邻棱互换'),

  // ── 角换位（仅 3 角循环，棱已就位） ──
  m('PLL_Aa', 'A-perm a', '角循环',
    "x R' U R' D2 R U' R' D2 R2 x'",
    '三角顺时针循环（棱已就位）'),
  m('PLL_Ab', 'A-perm b', '角循环',
    "x R2 D2 R U R' D2 R U' R x'",
    '三角逆时针循环（棱已就位）'),
  m('PLL_E', 'E-perm', '对角换',
    "x' L' U L D' L' U' L D L' U' L D' L' U L D x",
    '两对对角互换（棱已就位）'),

  // ── 相邻角棱互换 ──
  m('PLL_Ja', 'J-perm a', '相邻角棱',
    "L' U' L F L' U' L U L F' L2 U L",
    '相邻一对角 + 一对棱互换'),
  m('PLL_Jb', 'J-perm b', '相邻角棱',
    "R U R' F' R U R' U' R' F R2 U' R'",
    '相邻一对角 + 一对棱互换（镜像）'),
  m('PLL_T', 'T-perm', '相邻角棱',
    "R U R' U' R' F R2 U' R' U' R U R' F'",
    '相邻一对角 + 一对棱互换'),
  m('PLL_F', 'F-perm', '相邻角棱',
    "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    '相邻一对角 + 一对对面棱互换'),
  m('PLL_Ra', 'R-perm a', '相邻角棱',
    "R U' R' U' R U R D R' U' R D' R' U2 R'",
    '相邻角棱（与 J 不同的换法）'),
  m('PLL_Rb', 'R-perm b', '相邻角棱',
    "R' U2 R U2 R' F R U R' U' R' F' R2",
    '相邻角棱（R-perm a 的镜像）'),

  // ── 对角角棱互换 ──
  m('PLL_V', 'V-perm', '对角角棱',
    "R' U R' U' y R' F' R2 U' R' U R' F R F",
    '对角一对角 + 相邻一对棱互换'),
  m('PLL_Y', 'Y-perm', '对角角棱',
    "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    '对角一对角 + 对面一对棱互换'),
  m('PLL_Na', 'N-perm a', '对角角棱',
    "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    '对角一对角 + 一对对面棱互换'),
  m('PLL_Nb', 'N-perm b', '对角角棱',
    "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    '对角一对角 + 一对对面棱互换（镜像）'),

  // ── G 系列（最复杂的循环换位） ──
  m('PLL_Ga', 'G-perm a', 'G 系列',
    "R2 U R' U R' U' R U' R2 U' D R' U R D'",
    '角棱混合循环'),
  m('PLL_Gb', 'G-perm b', 'G 系列',
    "R' U' R U D' R2 U R' U R U' R U' R2 D",
    '角棱混合循环'),
  m('PLL_Gc', 'G-perm c', 'G 系列',
    "R2 U' R U' R U R' U R2 U D' R U' R' D",
    '角棱混合循环'),
  m('PLL_Gd', 'G-perm d', 'G 系列',
    "R U R' U' D R2 U' R U' R' U R' U R2 D'",
    '角棱混合循环'),
]
