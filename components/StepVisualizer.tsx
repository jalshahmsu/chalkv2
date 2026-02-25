'use client'

import { computeStep } from '@/lib/matrixData'

interface StepVisualizerProps {
  resultRow: number
  resultCol: number
}

export default function StepVisualizer({ resultRow, resultCol }: StepVisualizerProps) {
  const { rowValues, colValues, products, result } = computeStep(resultRow, resultCol)

  return (
    <div className="mt-6 text-center animate-fadeIn">
      <p className="text-slate-500 text-sm mb-4 tracking-wide uppercase">
        Computing C[{resultRow + 1}][{resultCol + 1}] — Row {resultRow + 1} of A · Col {resultCol + 1} of B
      </p>

      {/* Dot product expression */}
      <div className="flex items-center justify-center gap-3 text-xl font-mono flex-wrap">
        {rowValues.map((rv, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-500 mx-1">+</span>}
            <span className="text-yellow-300">{rv}</span>
            <span className="text-slate-500">×</span>
            <span className="text-yellow-300">{colValues[i]}</span>
          </span>
        ))}
        <span className="text-slate-400 mx-2">=</span>
        {products.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-500 mx-1">+</span>}
            <span className="text-emerald-300">{p}</span>
          </span>
        ))}
        <span className="text-slate-400 mx-2">=</span>
        <span className="text-cyan-300 text-3xl font-bold">{result}</span>
      </div>
    </div>
  )
}
