import { NextRequest, NextResponse } from 'next/server'
import { CanvasState, Action } from '@/lib/types'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

const SYSTEM_PROMPT = `You are the visualization director for "Chalk" — a real-time teaching tool that renders visuals as a presenter speaks.

The presenter is teaching Matrix Multiplication using these fixed matrices:
  Matrix A (2×3): [[1,2,3],[4,5,6]]
  Matrix B (3×2): [[7,8],[9,10],[11,12]]
  Result C = A×B (2×2): [[58,64],[139,154]]

Given what the presenter just said and the current canvas state, return exactly ONE action as a JSON object.

AVAILABLE ACTIONS:
  {"type":"SHOW_TITLE","text":"<title string>"}
  {"type":"DEFINE_MATRIX","name":"A"}
  {"type":"DEFINE_MATRIX","name":"B"}
  {"type":"SHOW_DIMENSIONS"}
  {"type":"SHOW_MULTIPLICATION_SETUP"}
  {"type":"SHOW_STEP","resultRow":<0 or 1>,"resultCol":<0 or 1>}
  {"type":"SHOW_RESULT"}
  {"type":"NONE"}

WHEN TO TRIGGER EACH:
  SHOW_TITLE      → presenter introduces the topic (matrix multiplication, today's lesson, etc.)
  DEFINE_MATRIX A → presenter mentions "matrix A", "let's take A", "call it A"
  DEFINE_MATRIX B → presenter mentions "matrix B", "another matrix B", "let's take B"
  SHOW_DIMENSIONS → presenter talks about rows/columns/size/order of the matrices
  SHOW_MULTIPLICATION_SETUP → presenter says "multiply", "A times B", "product", "A cross B"
  SHOW_STEP       → presenter mentions computing a specific element of C:
                    "first element" / "C11" / "row 1 col 1" / "top left" → resultRow:0, resultCol:0
                    "C12" / "row 1 col 2" / "first row second column" → resultRow:0, resultCol:1
                    "C21" / "row 2 col 1" / "second row first column" → resultRow:1, resultCol:0
                    "C22" / "row 2 col 2" / "bottom right" → resultRow:1, resultCol:1
  SHOW_RESULT     → presenter reveals the final answer, says "result", "here is C", "and we get"
  NONE            → filler phrases: "so", "now", "okay", "let me", "as we can see", transitions

RULES:
  - Never repeat something already shown (check canvas state)
  - Only advance, never go back
  - Return ONLY valid JSON — no explanation, no markdown, no extra text`

export async function POST(req: NextRequest) {
  const { transcript, canvasState }: { transcript: string; canvasState: CanvasState } =
    await req.json()

  const userMessage = `Canvas state: ${JSON.stringify(canvasState)}

Presenter said: "${transcript}"

Return one action:`

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`)

    const data = await response.json()
    const raw = data.message.content.trim()

    // Strip markdown fences if the model wraps in them
    const jsonText = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim()

    const action: Action = JSON.parse(jsonText)
    return NextResponse.json(action)
  } catch (err) {
    console.error('Director error:', err)
    return NextResponse.json({ type: 'NONE' })
  }
}
