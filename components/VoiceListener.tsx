'use client'

import { useEffect, useRef, useState } from 'react'

interface VoiceListenerProps {
  onTranscript: (transcript: string) => void
  lastTranscript: string
  isProcessing: boolean
}

export default function VoiceListener({
  onTranscript,
  lastTranscript,
  isProcessing,
}: VoiceListenerProps) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interim = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText += text
        } else {
          interim += text
        }
      }

      setInterimText(interim)

      if (finalText.trim()) {
        onTranscript(finalText.trim())
        setInterimText('')
      }
    }

    recognition.onerror = () => {
      isListeningRef.current = false
      setIsListening(false)
    }

    recognition.onend = () => {
      // Auto-restart if still meant to be listening
      if (isListeningRef.current) {
        recognition.start()
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    isListeningRef.current = true
    setIsListening(true)
  }

  const stopListening = () => {
    isListeningRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }

  return (
    <div className="bg-slate-800/80 border-t border-slate-700 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-5">

        {/* Start/Stop button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!supported}
          className={`
            flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full
            font-medium text-sm transition-all duration-200 select-none
            ${!supported
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : isListening
              ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50 hover:bg-red-500/30'
              : 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 hover:bg-emerald-500/30'
            }
          `}
        >
          {isListening ? (
            <>
              <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
              Stop
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              {supported ? 'Start Session' : 'Not supported'}
            </>
          )}
        </button>

        {/* Transcript display */}
        <div className="flex-1 min-w-0">
          {interimText && (
            <p className="text-slate-500 italic text-sm truncate">{interimText}</p>
          )}
          {!interimText && lastTranscript && (
            <p className="text-slate-400 text-sm truncate">
              <span className="text-slate-600 mr-2">Heard:</span>
              "{lastTranscript}"
            </p>
          )}
          {!interimText && !lastTranscript && isListening && (
            <p className="text-slate-600 text-sm">Listening — start speaking...</p>
          )}
          {!isListening && !lastTranscript && (
            <p className="text-slate-700 text-sm">Press Start Session and begin presenting</p>
          )}
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex-shrink-0 flex items-center gap-2 text-emerald-500 text-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            Visualizing
          </div>
        )}
      </div>
    </div>
  )
}
