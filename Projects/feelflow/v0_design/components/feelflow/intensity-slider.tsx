"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

const EMOTION_COLOR = "#8B5CF6" // Anxious
const EMOTION_LABEL = "Anxious"
const EMOTION_EMOJI = "\u{1F630}"
const TRIGGERS = [
  { emoji: "\u{1F4DD}", label: "Test" },
  { emoji: "\u{1F4DA}", label: "Presentation" },
]

export function IntensitySlider() {
  const [value, setValue] = useState(5)
  const router = useRouter()

  // Dynamic scale: 1.0 at 1 -> 1.15 at 10
  const circleScale = useMemo(() => 1 + (value - 1) * (0.15 / 9), [value])

  // Background wash opacity: 0 at 1 -> 0.04 at 10
  const bgWashOpacity = useMemo(() => ((value - 1) / 9) * 0.04, [value])

  // Slider fill percentage
  const fillPct = ((value - 1) / 9) * 100

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: `rgba(139, 92, 246, ${bgWashOpacity})`,
        transition: "background-color 300ms ease-out",
      }}
    >
      {/* ---- Top Bar (48px) ---- */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        {/* Back arrow */}
        <button
          className="flex items-center justify-center w-12 h-12 -ml-2 text-[#1A1A2E]"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2" role="group" aria-label="Step 2 of 3">
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
        </div>

        {/* Spacer */}
        <div className="w-12" aria-hidden="true" />
      </div>

      {/* ---- Emotion Display ---- */}
      <div className="flex flex-col items-center pt-4 pb-4 shrink-0">
        {/* Floating emoji */}
        <span className="text-[4rem] leading-none animate-emoji-float" aria-hidden="true">
          {EMOTION_EMOJI}
        </span>

        {/* Emotion name */}
        <span className="text-[1.3rem] font-extrabold text-[#1A1A2E] mt-2">
          {EMOTION_LABEL}
        </span>

        {/* Trigger pills */}
        <div className="flex items-center gap-1.5 mt-2">
          {TRIGGERS.map((t) => (
            <span
              key={t.label}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 bg-[#F3F4F6] text-[0.75rem] text-[#6B7280]"
            >
              <span aria-hidden="true">{t.emoji}</span>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* ---- Intensity Card (main focus) ---- */}
      <div className="flex-1 flex items-start justify-center px-5 pt-2">
        <div
          className="w-full rounded-[24px] bg-white px-6 py-7 flex flex-col items-center"
          style={{ boxShadow: "0 2px 16px rgba(0, 0, 0, 0.05)" }}
        >
          {/* Question */}
          <p className="text-[0.95rem] font-semibold text-[#6B7280] text-center">
            {"How strong is this feeling?"}
          </p>

          {/* Big number circle */}
          <div
            className="flex items-center justify-center mt-5 mb-6 transition-transform duration-300 ease-out"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: `rgba(139, 92, 246, 0.1)`,
              border: `2px solid rgba(139, 92, 246, 0.3)`,
              transform: `scale(${circleScale})`,
            }}
          >
            <span
              className="font-mono font-bold text-[2.2rem] leading-none"
              style={{ color: EMOTION_COLOR }}
            >
              {value}
            </span>
          </div>

          {/* Range slider */}
          <div className="w-full relative">
            {/* Custom track background */}
            <div className="absolute top-1/2 left-0 right-0 h-[6px] -translate-y-1/2 rounded-full bg-[#F1F5F9] pointer-events-none" />
            {/* Fill track */}
            <div
              className="absolute top-1/2 left-0 h-[6px] -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, rgba(139, 92, 246, 0.4), ${EMOTION_COLOR})`,
              }}
            />
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="intensity-slider relative z-10 w-full"
              style={
                {
                  "--thumb-color": EMOTION_COLOR,
                } as React.CSSProperties
              }
              aria-label={`Intensity level ${value} out of 10`}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={value}
            />
          </div>

          {/* Min / Max labels */}
          <div className="flex items-center justify-between w-full mt-2">
            <span className="text-[0.8rem] text-[#9CA3AF]">{"Mild"}</span>
            <span className="text-[0.8rem] font-semibold" style={{ color: EMOTION_COLOR }}>
              {"Strong"}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Bottom CTA ---- */}
      <div className="shrink-0 px-5 pb-5 pt-3">
        <button
          className="
            flex items-center justify-center gap-2
            w-full h-[52px] rounded-2xl
            bg-[#6C5CE7] text-white font-bold text-[1rem]
            transition-all duration-200 ease-out
            active:scale-[0.97]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
          "
          onClick={() => router.push("/strategy")}
        >
          <span>{"Next"}</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>

        <button
          className="flex items-center justify-center gap-1 w-full h-11 mt-1 text-[0.85rem] font-medium text-[#9CA3AF]"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          <span>{"Back"}</span>
        </button>
      </div>
    </div>
  )
}
