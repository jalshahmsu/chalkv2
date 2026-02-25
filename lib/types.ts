export type MatrixName = 'A' | 'B' | 'C'

export type Action =
  | { type: 'SHOW_TITLE'; text: string }
  | { type: 'DEFINE_MATRIX'; name: 'A' | 'B' }
  | { type: 'SHOW_DIMENSIONS' }
  | { type: 'SHOW_MULTIPLICATION_SETUP' }
  | { type: 'SHOW_STEP'; resultRow: number; resultCol: number }
  | { type: 'SHOW_RESULT' }
  | { type: 'NONE' }

export interface Step {
  row: number
  col: number
}

export interface CanvasState {
  title: string | null
  definedMatrices: Array<'A' | 'B'>
  showDimensions: boolean
  multiplicationSetup: boolean
  computedSteps: Step[]
  currentStep: Step | null
  showResult: boolean
}

export const initialCanvasState: CanvasState = {
  title: null,
  definedMatrices: [],
  showDimensions: false,
  multiplicationSetup: false,
  computedSteps: [],
  currentStep: null,
  showResult: false,
}
