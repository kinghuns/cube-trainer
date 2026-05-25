// ═══════════════════════════════════════════════════════════════════
// 数据汇总（barrel）
// 组件通过 `import { ... } from '../data'` 拿到全部数据集。
// ═══════════════════════════════════════════════════════════════════

export { LAYER_BY_LAYER } from './lbl'
export { OLL_CASES } from './oll'
export { PLL_CASES } from './pll'
export { F2L_CASES } from './f2l'

import { OLL_CASES } from './oll'
import { PLL_CASES } from './pll'
import { F2L_CASES } from './f2l'

export const CFOP_DATA = {
  OLL: OLL_CASES,
  PLL: PLL_CASES,
  F2L: F2L_CASES,
}
