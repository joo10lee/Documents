"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"

const EMOTION_COLOR = "#8B5CF6"

// Box breathing: 4s in, 4s hold, 4s out, 4s hold = 16s per round
const PHASE_DURATION = 4000 // ms per phase
const PHASES = ["Breathe In...", "Hold...", "Breathe Out...", "Hold..."] as const
const TOTAL_ROUNDS = 4
const ROUND_DURATION = PHASE_DURATION * PHASES.length // 16s
const TOTAL_TIME = ROUND_DURATION * TOTAL_ROUNDS // 64s

export function BreathingActivity() {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)

  // Tick every 50ms for smooth progress
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= TOTAL_TIME) {
          clearInterval(id)
          return TOTAL_TIME
        }
        return prev + 50
      })
    }, 50)
    return () => clearInterval(id)
  }, [running])

  const isComplete = elapsed >= TOTAL_TIME

  // Current round (0-indexed)
  const currentRound = Math.min(Math.floor(elapsed / ROUND_DURATION), TOTAL_ROUNDS - 1)
  const completedRounds = Math.min(Math.floor(elapsed / ROUND_DURATION), TOTAL_ROUNDS)

  // Current phase within the round
  const timeInRound = elapsed % ROUND_DURATION
  const phaseIndex = Math.min(Math.floor(timeInRound / PHASE_DURATION), PHASES.length - 1)
  const phaseLabel = isComplete ? "Well Done" : PHASES[phaseIndex]

  // Overall progress 0..1
  const progress = Math.min(elapsed / TOTAL_TIME, 1)

  // Timer remaining
  const remainingMs = Math.max(TOTAL_TIME - elapsed, 0)
  const remainingMin = Math.floor(remainingMs / 60000)
  const remainingSec = Math.floor((remainingMs % 60000) / 1000)
  const remainingStr = `${remainingMin}:${String(remainingSec).padStart(2, "0")} remaining`

  // SVG ring values
  const ringRadius = 98
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - progress)

  // Breathing scale: map phase to scale value for smooth CSS
  const getBreathScale = useCallback(() => {
    if (isComplete) return 1
    const phaseProgress = (timeInRound % PHASE_DURATION) / PHASE_DURATION
    switch (phaseIndex) {
      case 0: return 0.85 + 0.15 * phaseProgress       // in: grow
      case 1: return 1.0                                  // hold big
      case 2: return 1.0 - 0.15 * phaseProgress          // out: shrink
      case 3: return 0.85                                 // hold small
      default: return 1
    }
  }, [isComplete, timeInRound, phaseIndex])

  const scale = getBreathScale()

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: `radial-gradient(circle at 50% 40%, rgba(139,92,246,0.03) 0%, transparent 70%)`,
      }}
    >
      {/* ---- Top Bar (minimal 48px) ---- */}
      <div className="flex items-center px-4 h-12 shrink-0">
        <button
          className="flex items-center justify-center w-12 h-12 -ml-2 text-[#1A1A2E]"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
      </div>

      {/* ---- Breathing Circle (centered, hero) ---- */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
        {/* Circle container */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {/* Timer progress ring (outermost) */}
          <svg
            className="absolute inset-0"
            width="200"
            height="200"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r={ringRadius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="2"
            />
            {/* Progress fill */}
            <circle
              cx="100"
              cy="100"
              r={ringRadius}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                transition: "stroke-dashoffset 100ms linear",
              }}
            />
          </svg>

          {/* Breathing circle (animates scale) */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 180,
              height: 180,
              border: `4px solid ${EMOTION_COLOR}`,
              backgroundColor: `${EMOTION_COLOR}0D`,
              boxShadow: `0 0 30px rgba(139,92,246,0.15)`,
              transform: `scale(${scale})`,
              transition: "transform 200ms ease-in-out",
            }}
          >
            <span className="text-[1.1rem] font-bold text-[#1A1A2E] select-none">
              {phaseLabel}
            </span>
          </div>
        </div>

        {/* Round counter + dots */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[0.85rem] font-semibold text-[#6B7280]">
            {isComplete
              ? `${TOTAL_ROUNDS} of ${TOTAL_ROUNDS} complete`
              : `Round ${currentRound + 1} of ${TOTAL_ROUNDS}`}
          </span>
          <div className="flex items-center gap-2" role="group" aria-label="Round progress">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: i < completedRounds ? EMOTION_COLOR : "#D1D5DB",
                }}
              />
            ))}
          </div>
        </div>

        {/* Instruction text */}
        <p className="text-[0.95rem] text-[#6B7280] text-center leading-relaxed max-w-[260px]">
          {isComplete
            ? "Great job. Take a moment before moving on."
            : "Follow the circle. Breathe with it."}
        </p>

        {/* Timer remaining */}
        {!isComplete && (
          <span className="text-[0.8rem] text-[#9CA3AF]">{remainingStr}</span>
        )}
      </div>

      {/* ---- Bottom Actions ---- */}
      <div className="shrink-0 px-5 pb-5 pt-3 flex items-center gap-3">
        <button
          className="
            flex-1 flex items-center justify-center gap-2
            h-[52px] rounded-2xl
            border-[1.5px] border-[#E5E7EB] bg-transparent
            text-[0.9rem] font-semibold text-[#6B7280]
            active:scale-[0.97] transition-transform duration-200 ease-out
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
          "
          onClick={() => router.push("/strategy")}
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>{"Back to Options"}</span>
        </button>
        <button
          className="
            flex-1 flex items-center justify-center gap-2
            h-[52px] rounded-2xl
            text-[0.9rem] font-bold text-white
            active:scale-[0.97] transition-transform duration-200 ease-out
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2
          "
          style={{
            backgroundColor: "#10B981",
            boxShadow: "0 2px 12px rgba(16,185,129,0.25)",
          }}
          onClick={() => {
            setRunning(false)
            router.push("/remeasure")
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          <span>{"I'm Done"}</span>
        </button>
      </div>
    </div>
  )
}
