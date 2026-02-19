"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"

const EMOTION_COLOR = "#8B5CF6"
const EMOTION_EMOJI = "\u{1F630}"

const STRATEGIES = [
  {
    id: "breathing",
    emoji: "\u{1FAC1}",
    title: "Box Breathing",
    description: "Breathe in a calming square pattern",
    duration: "3 min",
    traits: ["Breathing", "Quiet"],
  },
  {
    id: "playlist",
    emoji: "\u{1F3B5}",
    title: "Calm Playlist",
    description: "Listen to soothing sounds",
    duration: "5 min",
    traits: ["Music", "Headphones"],
  },
  {
    id: "worry-dump",
    emoji: "\u{270D}\u{FE0F}",
    title: "Worry Dump",
    description: "Write down what\u2019s on your mind",
    duration: "3 min",
    traits: ["Writing", "Quiet"],
  },
]

export function StrategySelection() {
  const [tappedId, setTappedId] = useState<string | null>(null)
  const router = useRouter()

  const handleCardTap = (id: string) => {
    setTappedId(id)
    // Navigate after brief visual feedback
    setTimeout(() => {
      router.push("/activity")
    }, 300)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ---- Top Bar (48px) ---- */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <button
          className="flex items-center justify-center w-12 h-12 -ml-2 text-[#1A1A2E]"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>

        {/* Progress dots -- step 3 of 4 */}
        <div className="flex items-center gap-2" role="group" aria-label="Step 3 of 4">
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
        </div>

        <div className="w-12" aria-hidden="true" />
      </div>

      {/* ---- Context Strip ---- */}
      <div className="px-5 pt-1 shrink-0">
        <div
          className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5"
          style={{ boxShadow: "0 1px 8px rgba(0, 0, 0, 0.04)" }}
        >
          <span className="text-[1rem]" aria-hidden="true">{EMOTION_EMOJI}</span>
          <span
            className="w-[6px] h-[6px] rounded-full shrink-0"
            style={{ backgroundColor: EMOTION_COLOR }}
            aria-hidden="true"
          />
          <span className="text-[0.8rem] font-semibold text-[#6B7280]">
            {"Anxious"}
          </span>
          <span className="text-[0.75rem] text-[#9CA3AF]" aria-hidden="true">{"\u00B7"}</span>
          <span className="text-[0.8rem] font-semibold text-[#6B7280]">
            {"Intensity 7"}
          </span>
          <span className="text-[0.75rem] text-[#9CA3AF]" aria-hidden="true">{"\u00B7"}</span>
          <span className="text-[0.8rem] text-[#6B7280]">
            {"\u{1F4DD} Test"}
          </span>
        </div>
      </div>

      {/* ---- Title ---- */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <h1 className="text-[1.3rem] font-extrabold text-[#1A1A2E] leading-tight">
          {"Let\u2019s try something"}
        </h1>
        <p className="text-[0.85rem] text-[#9CA3AF] mt-0.5">
          {"Pick one that feels right"}
        </p>
      </div>

      {/* ---- Strategy Cards ---- */}
      <div className="flex flex-col gap-3 px-5 flex-1">
        {STRATEGIES.map((strategy) => {
          const isActive = tappedId === strategy.id
          return (
            <button
              key={strategy.id}
              onClick={() => handleCardTap(strategy.id)}
              className="
                relative w-full rounded-[20px] bg-white text-left
                transition-all duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
                overflow-hidden
              "
              style={{
                boxShadow: isActive
                  ? "0 4px 20px rgba(0, 0, 0, 0.08)"
                  : "0 2px 16px rgba(0, 0, 0, 0.05)",
                transform: isActive ? "translateY(-2px)" : "translateY(0)",
              }}
              aria-label={`${strategy.title}: ${strategy.description}`}
            >
              {/* Left color bar -- appears on active */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px] transition-opacity duration-200"
                style={{
                  backgroundColor: EMOTION_COLOR,
                  opacity: isActive ? 1 : 0,
                }}
                aria-hidden="true"
              />

              <div className="flex items-center gap-4 px-4 py-4">
                {/* Icon circle */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: `${EMOTION_COLOR}15`,
                  }}
                >
                  <span className="text-[1.5rem] leading-none" aria-hidden="true">
                    {strategy.emoji}
                  </span>
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[0.95rem] font-bold text-[#1A1A2E] leading-tight">
                    {strategy.title}
                  </p>
                  <p className="text-[0.78rem] text-[#9CA3AF] mt-0.5 leading-snug">
                    {strategy.description}
                  </p>
                  {/* Duration + traits -- single row */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-bold"
                      style={{
                        backgroundColor: `${EMOTION_COLOR}12`,
                        color: EMOTION_COLOR,
                      }}
                    >
                      {strategy.duration}
                    </span>
                    <span className="text-[0.7rem] text-[#9CA3AF]" aria-hidden="true">{"\u00B7"}</span>
                    <span className="text-[0.75rem] text-[#6B7280] truncate">
                      {strategy.traits.join(" \u00B7 ")}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight
                  size={20}
                  className="shrink-0 text-[#9CA3AF]"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* ---- Bottom ---- */}
      <div className="shrink-0 px-5 pb-5 pt-3 flex justify-center">
        <button
          className="flex items-center justify-center gap-1 h-11 text-[0.85rem] font-medium text-[#9CA3AF]"
          onClick={() => router.back()}
        >
          <ArrowLeft size={14} strokeWidth={2} />
          <span>{"Back"}</span>
        </button>
      </div>
    </div>
  )
}
