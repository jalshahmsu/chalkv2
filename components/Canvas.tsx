'use client'

import { CanvasState } from '@/lib/types'
import Matrix from './Matrix'
import StepVisualizer from './StepVisualizer'

interface CanvasProps {
  state: CanvasState
}

export default function Canvas({ state }: CanvasProps) {
  const {
    title,
    definedMatrices,
    showDimensions,
    multiplicationSetup,
    computedSteps,
    currentStep,
    showResult,
  } = state

  const showA = definedMatrices.includes('A')
  const showB = definedMatrices.includes('B')
  const showC = multiplicationSetup && showA && showB

  return (
    <div className="w-full max-w-5xl min-h-[28rem] flex flex-col items-center justify-center gap-10 px-4">

      {/* Title */}
      {title && (
        <h1 className="text-5xl font-bold text-white tracking-wide animate-fadeIn">
          {title}
        </h1>
      )}

      {/* Matrices row */}
      {(showA || showB) && (
        <div className="flex items-center justify-center gap-10 flex-wrap">

          {showA && (
            <Matrix
              name="A"
              showDimensions={showDimensions}
              highlightRow={multiplicationSetup && currentStep ? currentStep.row : null}
            />
          )}

          {showC && (
            <span className="text-slate-400 text-5xl font-light select-none">×</span>
          )}

          {showB && (
            <Matrix
              name="B"
              showDimensions={showDimensions}
              highlightCol={multiplicationSetup && currentStep ? currentStep.col : null}
            />
          )}

          {showC && (
            <>
              <span className="text-slate-400 text-5xl font-light select-none">=</span>

              <Matrix
                name="C"
                showDimensions={showDimensions}
                highlightCell={currentStep && !showResult ? currentStep : null}
                revealedCells={computedSteps}
                showAllCells={showResult}
              />
            </>
          )}
        </div>
      )}

      {/* Step computation */}
      {currentStep && !showResult && (
        <StepVisualizer resultRow={currentStep.row} resultCol={currentStep.col} />
      )}

      {/* Idle hint */}
      {!title && (
        <div className="text-center animate-fadeIn">
          <p className="text-slate-600 text-lg">Waiting for presenter...</p>
          <p className="text-slate-700 text-sm mt-2">
            Try: "Today we are learning Matrix Multiplication"
          </p>
        </div>
      )}
    </div>
  )
}
