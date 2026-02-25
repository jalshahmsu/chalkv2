'use client'

import { useCallback, useRef, useState } from 'react'
import Canvas from '@/components/Canvas'
import VoiceListener from '@/components/VoiceListener'
import { Action, CanvasState, initialCanvasState } from '@/lib/types'

function applyAction(state: CanvasState, action: Action): CanvasState {
  switch (action.type) {
    case 'SHOW_TITLE':
      return { ...state, title: action.text }

    case 'DEFINE_MATRIX':
      if (state.definedMatrices.includes(action.name)) return state
      return { ...state, definedMatrices: [...state.definedMatrices, action.name] }

    case 'SHOW_DIMENSIONS':
      return { ...state, showDimensions: true }

    case 'SHOW_MULTIPLICATION_SETUP':
      return { ...state, multiplicationSetup: true }

    case 'SHOW_STEP': {
      const { resultRow, resultCol } = action
      const alreadyDone = state.computedSteps.some(
        (s) => s.row === resultRow && s.col === resultCol
      )
      if (alreadyDone) return state
      return {
        ...state,
        computedSteps: [...state.computedSteps, { row: resultRow, col: resultCol }],
        currentStep: { row: resultRow, col: resultCol },
      }
    }

    case 'SHOW_RESULT':
      return {
        ...state,
        showResult: true,
        currentStep: null,
        // Reveal all cells
        computedSteps: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 1, col: 0 },
          { row: 1, col: 1 },
        ],
      }

    case 'NONE':
    default:
      return state
  }
}

export default function Home() {
  const [canvasState, setCanvasState] = useState<CanvasState>(initialCanvasState)
  const [lastTranscript, setLastTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef('')
  const canvasStateRef = useRef(canvasState)
  canvasStateRef.current = canvasState

  const sendToDirector = useCallback(async (transcript: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, canvasState: canvasStateRef.current }),
      })
      if (!res.ok) throw new Error('Director API failed')
      const action: Action = await res.json()
      setCanvasState((prev) => applyAction(prev, action))
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleTranscript = useCallback((transcript: string) => {
    setLastTranscript(transcript)
    pendingRef.current += ' ' + transcript

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const text = pendingRef.current.trim()
      pendingRef.current = ''
      if (text) sendToDirector(text)
    }, 1500)
  }, [sendToDirector])

  return (
    <main className="min-h-screen flex flex-col">
      {/* Chalk wordmark */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <span className="text-slate-500 font-semibold tracking-widest text-sm uppercase">
          Chalk
        </span>
        <button
          onClick={() => {
            setCanvasState(initialCanvasState)
            setLastTranscript('')
          }}
          className="text-slate-700 hover:text-slate-500 text-sm transition-colors"
        >
          Reset
        </button>
      </header>

      {/* Main canvas — takes all available space */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Canvas state={canvasState} />
      </div>

      {/* Voice bar — anchored to bottom */}
      <VoiceListener
        onTranscript={handleTranscript}
        lastTranscript={lastTranscript}
        isProcessing={isProcessing}
      />
    </main>
  )
}
