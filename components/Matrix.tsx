'use client'

import { MATRIX_A, MATRIX_B, MATRIX_C } from '@/lib/matrixData'
import { Step } from '@/lib/types'

interface MatrixProps {
  name: 'A' | 'B' | 'C'
  showDimensions?: boolean
  highlightRow?: number | null
  highlightCol?: number | null
  highlightCell?: Step | null
  revealedCells?: Step[]
  showAllCells?: boolean
}

const DATA = { A: MATRIX_A, B: MATRIX_B, C: MATRIX_C }

export default function Matrix({
  name,
  showDimensions,
  highlightRow,
  highlightCol,
  highlightCell,
  revealedCells = [],
  showAllCells = false,
}: MatrixProps) {
  const matrix = DATA[name]

  const isRevealed = (i: number, j: number) => {
    if (name !== 'C') return true
    if (showAllCells) return true
    return revealedCells.some((c) => c.row === i && c.col === j)
  }

  const cellStyle = (i: number, j: number) => {
    const rowHit = highlightRow !== null && highlightRow !== undefined && i === highlightRow
    const colHit = highlightCol !== null && highlightCol !== undefined && j === highlightCol
    const cellHit =
      highlightCell !== null &&
      highlightCell !== undefined &&
      highlightCell.row === i &&
      highlightCell.col === j

    if (cellHit) return 'bg-cyan-400/30 text-cyan-200 ring-2 ring-cyan-400'
    if (rowHit) return 'bg-yellow-400/25 text-yellow-200'
    if (colHit) return 'bg-yellow-400/25 text-yellow-200'
    return 'text-white'
  }

  return (
    <div className="flex flex-col items-center gap-2 animate-popIn">
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 text-xl font-bold font-mono">{name}</span>
        {showDimensions && (
          <span className="text-slate-400 text-sm">
            ({matrix.rows}×{matrix.cols})
          </span>
        )}
      </div>

      <div className="matrix-bracket">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${matrix.cols}, minmax(2.75rem, auto))`,
          }}
        >
          {matrix.values.map((row, i) =>
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className={`
                  flex items-center justify-center w-11 h-11
                  rounded text-lg font-mono font-semibold
                  transition-all duration-300
                  ${cellStyle(i, j)}
                `}
              >
                {isRevealed(i, j) ? val : '?'}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
