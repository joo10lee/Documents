"use client"

import { useRouter } from "next/navigation"

const CONFETTI_DOTS = [
  { color: "#F59E0B", size: 6, left: "12%", delay: 0 },
  { color: "#8B5CF6", size: 4, left: "28%", delay: 0.8 },
  { color: "#10B981", size: 5, left: "45%", delay: 1.6 },
  { color: "#3B82F6", size: 7, left: "62%", delay: 0.4 },
  { color: "#F59E0B", size: 4, left: "78%", delay: 2.0 },
  { color: "#8B5CF6", size: 6, left: "88%", delay: 1.2 },
]

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"]
const ACTIVE_DAYS = 3

export function CheckinComplete() {
  const router = useRouter()

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* ---- Background confetti (slow, ASD-safe) ---- */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        {CONFETTI_DOTS.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: dot.size,
              height: dot.size,
              backgroundColor: dot.color,
              left: dot.left,
              top: -10,
              animation: `confetti-drift 6s ${dot.delay}s ease-in infinite`,
            }}
          />
        ))}
      </div>

      {/* ---- Step dots (5/5 filled) ---- */}
      <div className="flex items-center justify-center px-4 h-12 shrink-0 relative z-10">
        <div className="flex items-center gap-2" role="group" aria-label="Step 5 of 5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          ))}
        </div>
      </div>

      {/* ---- Celebration area ---- */}
      <div className="flex flex-col items-center pt-2 pb-3 shrink-0 relative z-10">
        <span className="animate-sparkle-entrance text-[4rem] leading-none select-none">
          {"\u2728"}
        </span>
        <h1 className="text-[1.5rem] font-extrabold text-[#1A1A2E] mt-2 text-balance text-center">
          {"Great job, Jason!"}
        </h1>

        {/* XP badge */}
        <div
          className="mt-3 inline-flex items-center rounded-full px-4 py-2"
          style={{
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
          }}
        >
          <span className="font-mono font-bold text-[1.1rem] text-[#059669]">
            {"+30 XP Earned!"}
          </span>
        </div>
      </div>

      {/* ---- Session summary card ---- */}
      <div className="px-5 mt-3 shrink-0 relative z-10">
        <div
          className="w-full rounded-[20px] bg-white p-5"
          style={{ boxShadow: "0 2px 16px rgba(0, 0, 0, 0.05)" }}
        >
          <div className="flex flex-col gap-3">
            {/* Row 1: Emotion result */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[1.3rem]" aria-hidden="true">{"\uD83D\uDE30"}</span>
                <span className="text-[0.95rem] font-semibold text-[#1A1A2E]">{"Anxious"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-[0.95rem] text-[#9CA3AF]">{"7"}</span>
                <span className="text-[0.85rem] text-[#9CA3AF]">{"\u2192"}</span>
                <span className="font-mono font-bold text-[0.95rem] text-[#10B981]">{"4"}</span>
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.75rem] font-bold"
                  style={{ backgroundColor: "#ECFDF5", color: "#059669" }}
                >
                  {"\u2193 3"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#F3F4F6]" />

            {/* Row 2: Strategy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[1rem]" aria-hidden="true">{"\uD83E\uDEC1"}</span>
                <span className="text-[0.9rem] font-semibold text-[#1A1A2E]">{"Box Breathing"}</span>
              </div>
              <span className="text-[0.8rem] font-semibold text-[#10B981]">{"\u2713 Completed"}</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#F3F4F6]" />

            {/* Row 3: Triggers */}
            <div className="flex items-center justify-between">
              <span className="text-[0.85rem] text-[#6B7280]">{"Triggers:"}</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.75rem] text-[#6B7280]"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  {"\uD83D\uDCDD Test"}
                </span>
                <span
                  className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.75rem] text-[#6B7280]"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  {"\uD83D\uDCDA Presentation"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Streak section ---- */}
      <div className="flex flex-col items-center mt-4 shrink-0 relative z-10">
        <span className="text-[1rem] font-bold text-[#EA580C]">
          {"\uD83D\uDD25 3-Day Streak!"}
        </span>
        {/* Week dots */}
        <div className="flex items-center gap-[6px] mt-2">
          {WEEK_DAYS.map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 10,
                height: 10,
                backgroundColor: i < ACTIVE_DAYS ? "#6C5CE7" : "#E5E7EB",
              }}
            />
          ))}
        </div>
        {/* Day labels */}
        <div className="flex items-center gap-[6px] mt-1">
          {WEEK_DAYS.map((day, i) => (
            <span
              key={i}
              className="text-[0.65rem] text-[#9CA3AF] text-center"
              style={{ width: 10 }}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* ---- Spacer ---- */}
      <div className="flex-1" />

      {/* ---- Action buttons ---- */}
      <div className="shrink-0 px-5 pb-5 relative z-10">
        {/* Share button */}
        <button
          className="
            flex items-center justify-center gap-2
            w-full h-[52px] rounded-2xl
            bg-[#6C5CE7] text-white font-bold text-[1rem]
            transition-all duration-200 ease-out
            active:scale-[0.97]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
          "
        >
          {"\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66 Share with Family"}
        </button>
        {/* XP bonus label */}
        <p className="text-center text-[0.75rem] font-semibold text-[#6C5CE7] mt-1.5">
          {"+100 XP bonus"}
        </p>
        {/* Finish link */}
        <button
          className="
            block mx-auto mt-2
            text-[0.9rem] font-semibold text-[#6B7280]
            h-[44px] flex items-center justify-center
            transition-opacity duration-200 ease-out
            active:opacity-60
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
          "
          onClick={() => router.push("/")}
        >
          {"Finish"}
        </button>
      </div>
    </div>
  )
}
