import { memo } from 'react'
import MoveChip from './MoveChip'
import { parseMoves } from '../utils'

/**
 * 把公式字符串渲染为一行 MoveChip。
 * `lit` 表示当前高亮的动作下标（-1 表示不高亮）。
 */
const AlgRow = memo(function AlgRow({ alg, lit }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, margin: '8px 0' }}>
      {parseMoves(alg).map((m, i) => (
        <MoveChip key={i} move={m} lit={lit === i} />
      ))}
    </div>
  )
})

export default AlgRow
