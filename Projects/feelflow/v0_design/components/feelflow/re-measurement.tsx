"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronRight } from "lucide-react"

const EMOTION_COLOR = "#8B5CF6"
const ORIGINAL_VALUE = 7

export function ReMeasurement() {
  const [value, setValue] = useState(ORIGINAL_VALUE)
  const [hasMoved, setHasMoved] = useState(false)
  const router = useRouter()

  const fillPct = ((value - 1) / 9) * 100
  const markerPct = ((ORIGINAL_VALUE - 1) / 9) * 100

  // Dynamic feedback based on comparison
  const feedback = useMemo(() => {
    if (!hasMoved) return null
    if (value < ORIGINAL_VALUE) {
      return { text: "That's progress!", icon: "\u{1F4C9}", color: "#10B981" }
    }
    if (value === ORIGINAL_VALUE) {
      return { text: "That's okay! Every try counts", icon: "\u{1F4AA}", color: "#6B7280" }
    }
    return { text: "It's okay. Sometimes feelings need more time", icon: "\u{2764}\u{FE0F}", color: "#6B7280" }
  }, [value, hasMoved])

  return (
    <div className="flex flex-col h-full">
      {/* ---- Top Bar (48px) ---- */}
      <div className="flex items-center justify-center px-4 h-12 shrink-0">
        <div className="flex items-center gap-2" role="group" aria-label="Step 4 of 5">
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
        </div>
      </div>

      {/* ---- Completion Badge ---- */}
      <div className="flex flex-col items-center pt-3 pb-4 shrink-0">
        {/* Green checkmark circle */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            backgroundColor: "#ECFDF5",
            border: "2px solid #10B981",
          }}
        >
          <span className="text-[1.3rem] font-extrabold text-[#10B981] leading-none select-none">
            {"\u2713"}
          </span>
        </div>
        <h1 className="text-[1.3rem] font-extrabold text-[#1A1A2E] mt-3">
          {"Nice work!"}
        </h1>
        <p className="text-[0.9rem] text-[#6B7280] mt-0.5">
          {"You completed Box Breathing \u{1FAC1}"}
        </p>
      </div>

      {/* ---- Before -> Now Comparison Card ---- */}
      <div className="px-5 shrink-0">
        <div
          className="w-full rounded-[24px] bg-white p-5 flex items-center"
          style={{ boxShadow: "0 2px 16px rgba(0, 0, 0, 0.05)" }}
        >
          {/* Before column */}
          <div className="flex-1 flex flex-col items-center opacity-60">
            <span className="text-[0.7rem] font-bold tracking-[1px] text-[#9CA3AF] uppercase">
              {"Before"}
            </span>
            <span className="text-[1.5rem] mt-1" aria-hidden="true">{"\u{1F630}"}</span>
            <span
              className="font-mono font-bold text-[1.5rem] text-[#EF4444] mt-1"
            >
              {ORIGINAL_VALUE}
            </span>
          </div>

          {/* Arrow divider */}
          <div className="flex items-center justify-center px-3">
            <ChevronRight size={20} className="text-[#9CA3AF]" strokeWidth={2} />
          </div>

          {/* Now column */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[0.7rem] font-bold tracking-[1px] text-[#6C5CE7] uppercase">
              {"Now"}
            </span>
            <span className="text-[1.5rem] mt-1 relative" aria-hidden="true">
              {"\u{1F630}"}
              {!hasMoved && (
                <span className="absolute -top-1 -right-2 text-[0.7rem] font-bold text-[#9CA3AF]">
                  {"?"}
                </span>
              )}
            </span>
            <span
              className="font-mono font-bold text-[1.5rem] mt-1"
              style={{ color: hasMoved ? EMOTION_COLOR : "#9CA3AF" }}
            >
              {hasMoved ? value : "?"}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Slider Area ---- */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-3">
        {/* Question */}
        <p className="text-[0.95rem] font-semibold text-[#6B7280] text-center">
          {"How strong is this feeling now?"}
        </p>

        {/* Number circle */}
        <div
          className="flex items-center justify-center transition-all duration-300 ease-out"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: `${EMOTION_COLOR}1A`,
            border: `2px solid ${EMOTION_COLOR}4D`,
          }}
        >
          <span
            className="font-mono font-bold text-[2rem] leading-none"
            style={{ color: EMOTION_COLOR }}
          >
            {hasMoved ? value : "-"}
          </span>
        </div>

        {/* Slider with reference marker */}
        <div className="w-full relative mt-1">
          {/* Track background */}
          <div className="absolute top-1/2 left-0 right-0 h-[6px] -translate-y-1/2 rounded-full bg-[#F1F5F9] pointer-events-none" />
          {/* Fill track */}
          <div
            className="absolute top-1/2 left-0 h-[6px] -translate-y-1/2 rounded-full pointer-events-none transition-[width] duration-100 ease-out"
            style={{
              width: hasMoved ? `${fillPct}%` : "0%",
              background: `linear-gradient(90deg, rgba(139,92,246,0.4), ${EMOTION_COLOR})`,
            }}
          />
          {/* Reference diamond at original value */}
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-[5]"
            style={{ left: `${markerPct}%`, marginLeft: -4 }}
          >
            <div
              className="w-2 h-2 rotate-45 rounded-[1px]"
              style={{ backgroundColor: "#D1D5DB" }}
            />
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={value}
            onChange={(e) => {
              setValue(Number(e.target.value))
              if (!hasMoved) setHasMoved(true)
            }}
            className="intensity-slider relative z-10 w-full"
            style={{ "--thumb-color": EMOTION_COLOR } as React.CSSProperties}
            aria-label={`Current intensity level ${value} out of 10`}
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={value}
          />
        </div>

        {/* Reference label below marker */}
        <div
          className="relative w-full pointer-events-none"
          style={{ marginTop: -2 }}
        >
          <span
            className="absolute text-[0.7rem] text-[#9CA3AF] -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${markerPct}%` }}
          >
            {`Before: ${ORIGINAL_VALUE}`}
          </span>
          {/* Min / Max labels */}
          <span className="absolute left-0 text-[0.8rem] text-[#9CA3AF]">{"Mild"}</span>
          <span className="absolute right-0 text-[0.8rem] font-semibold" style={{ color: EMOTION_COLOR }}>
            {"Strong"}
          </span>
        </div>

        {/* Dynamic feedback */}
        <div className="h-7 flex items-center justify-center mt-6">
          {feedback && (
            <span
              className="text-[0.9rem] font-bold transition-all duration-300 ease-out"
              style={{ color: feedback.color }}
            >
              {`${feedback.icon} ${feedback.text}`}
            </span>
          )}
        </div>
      </div>

      {/* ---- Bottom CTA ---- */}
      <div className="shrink-0 px-5 pb-5 pt-2">
        <button
          className="
            flex items-center justify-center gap-2
            w-full h-[52px] rounded-2xl
            bg-[#6C5CE7] text-white font-bold text-[1rem]
            transition-all duration-200 ease-out
            active:scale-[0.97]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
            disabled:opacity-50 disabled:active:scale-100
          "
          disabled={!hasMoved}
          onClick={() => router.push("/complete")}
        >
          <span>{"Finish"}</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
