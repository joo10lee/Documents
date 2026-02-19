"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

/* ─── Emotion Palette ─── */
const EMOTIONS: Record<string, { emoji: string; color: string }> = {
  Happy:   { emoji: "\u{1F60A}", color: "#F59E0B" },
  Sad:     { emoji: "\u{1F622}", color: "#3B82F6" },
  Anxious: { emoji: "\u{1F630}", color: "#8B5CF6" },
  Angry:   { emoji: "\u{1F621}", color: "#EF4444" },
  Calm:    { emoji: "\u{1F60C}", color: "#10B981" },
  Tired:   { emoji: "\u{1F62B}", color: "#94A3B8" },
}

/* ─── Strategy usage stats ─── */
const STRATEGY_STATS = [
  { emoji: "\u{1FAC1}", label: "Breathing", uses: 12, fill: 80, color: "#6C5CE7" },
  { emoji: "\u{1F3B5}", label: "Music", uses: 8, fill: 55, color: "#A78BFA" },
]

/* ─── Filter chips ─── */
const FILTERS = [
  { id: "all", label: "All" },
  { id: "week", label: "This Week" },
  { id: "happy", label: "\u{1F60A}" },
  { id: "sad", label: "\u{1F622}" },
  { id: "anxious", label: "\u{1F630}" },
  { id: "angry", label: "\u{1F621}" },
  { id: "calm", label: "\u{1F60C}" },
  { id: "tired", label: "\u{1F62B}" },
]

/* ─── Timeline entries ─── */
interface TimelineEntry {
  id: string
  date: string
  time: string
  emotion: string
  intensity: number
  strategy?: string
  strategyEmoji?: string
  afterIntensity?: number
  note?: string
}

const ENTRIES: TimelineEntry[] = [
  {
    id: "1",
    date: "Feb 18",
    time: "9:15 AM",
    emotion: "Anxious",
    intensity: 7,
    strategy: "Box Breathing",
    strategyEmoji: "\u{1FAC1}",
    afterIntensity: 4,
    note: "Felt nervous about the test but breathing helped",
  },
  {
    id: "2",
    date: "Feb 17",
    time: "3:30 PM",
    emotion: "Happy",
    intensity: 3,
  },
  {
    id: "3",
    date: "Feb 17",
    time: "8:00 AM",
    emotion: "Tired",
    intensity: 5,
    strategy: "Calm Playlist",
    strategyEmoji: "\u{1F3B5}",
    afterIntensity: 3,
  },
  {
    id: "4",
    date: "Feb 16",
    time: "7:45 PM",
    emotion: "Calm",
    intensity: 2,
  },
]

/* ─── Component ─── */
export function JourneyTimeline() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [insightOpen, setInsightOpen] = useState(true)

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <h1 className="text-[1.4rem] font-extrabold text-[#1A1A2E] tracking-tight">
          {"My Journey"}
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-[80px] px-5">
        {/* Insight Card */}
        <button
          type="button"
          onClick={() => setInsightOpen((o) => !o)}
          className="w-full bg-white rounded-[20px] p-4 text-left mb-3 active:scale-[0.98] transition-transform duration-200"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
          aria-expanded={insightOpen}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[0.85rem]" aria-hidden="true">{"\u{1F4A1}"}</span>
              <span className="text-[0.9rem] font-bold text-[#1A1A2E]">{"What Works"}</span>
            </div>
            {insightOpen ? (
              <ChevronUp size={16} color="#9CA3AF" aria-hidden="true" />
            ) : (
              <ChevronDown size={16} color="#9CA3AF" aria-hidden="true" />
            )}
          </div>

          {insightOpen && (
            <div className="mt-3 flex flex-col gap-2.5">
              <p className="text-[0.8rem] text-[#6B7280]">{"Your top strategies:"}</p>
              {STRATEGY_STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <span className="text-[0.85rem] w-5 text-center" aria-hidden="true">{s.emoji}</span>
                  <span className="text-[0.8rem] font-semibold text-[#1A1A2E] w-[72px] shrink-0">{s.label}</span>
                  <div className="flex-1 h-[6px] rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${s.fill}%`,
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}CC)`,
                      }}
                    />
                  </div>
                  <span className="text-[0.7rem] text-[#9CA3AF] font-medium w-[44px] text-right shrink-0">
                    {`used ${s.uses}\u00D7`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </button>

        {/* Filter chips */}
        <div className="relative mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ maskImage: "linear-gradient(to right, black 88%, transparent)", WebkitMaskImage: "linear-gradient(to right, black 88%, transparent)" }}>
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`
                    shrink-0 h-9 rounded-full px-3 text-[0.8rem] font-medium
                    transition-all duration-200 ease-out
                    active:scale-[0.95]
                    ${isActive
                      ? "bg-[#6C5CE7] text-white font-semibold"
                      : "bg-white text-[#6B7280] border border-[#E5E7EB]"
                    }
                  `}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[5px] top-[6px] bottom-[6px] w-[2px] rounded-full"
            style={{ backgroundColor: "#F1F5F9" }}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-4">
            {ENTRIES.map((entry) => {
              const em = EMOTIONS[entry.emotion] ?? { emoji: "?", color: "#9CA3AF" }
              const diff = entry.afterIntensity != null
                ? entry.intensity - entry.afterIntensity
                : null

              return (
                <div key={entry.id} className="relative flex items-start gap-0">
                  {/* Timeline dot + connector */}
                  <div className="relative flex items-center shrink-0" style={{ width: 40 }}>
                    {/* Dot */}
                    <div
                      className="absolute left-0 top-[18px] w-3 h-3 rounded-full border-2 border-white z-[2]"
                      style={{ backgroundColor: em.color }}
                      aria-hidden="true"
                    />
                    {/* Horizontal line */}
                    <div
                      className="absolute left-3 top-[23px] h-[1px]"
                      style={{ width: 16, backgroundColor: "#E5E7EB" }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 bg-white rounded-[16px] p-4"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                  >
                    {/* Date + time */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[0.8rem] font-bold text-[#1A1A2E]">{entry.date}</span>
                      <span className="text-[0.8rem] text-[#9CA3AF]">{entry.time}</span>
                    </div>

                    {/* Emotion + intensity */}
                    <div className="flex items-center gap-2">
                      <span className="text-[1.3rem]" aria-hidden="true">{em.emoji}</span>
                      <span className="text-[0.9rem] font-semibold text-[#1A1A2E]">{entry.emotion}</span>
                      <span
                        className="text-[0.7rem] font-semibold rounded-full px-2 py-0.5"
                        style={{
                          backgroundColor: `${em.color}18`,
                          color: em.color,
                        }}
                      >
                        {`Lv.${entry.intensity}`}
                      </span>
                    </div>

                    {/* Strategy result */}
                    {entry.strategy && entry.afterIntensity != null && (
                      <div className="flex items-center gap-1 mt-2 text-[0.8rem] text-[#6B7280]">
                        <span aria-hidden="true">{entry.strategyEmoji}</span>
                        <span>{entry.strategy}</span>
                        <span className="text-[#9CA3AF]">{"\u2192"}</span>
                        <span className="font-mono font-bold text-[0.75rem] text-[#1A1A2E]">
                          {`${entry.intensity}\u2192${entry.afterIntensity}`}
                        </span>
                        {diff != null && diff > 0 && (
                          <span className="font-semibold text-[#10B981]">
                            {`\u2193${diff}`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Note */}
                    {entry.note && (
                      <p
                        className="mt-2 text-[0.8rem] italic text-[#6B7280] rounded-lg p-2"
                        style={{ backgroundColor: "#F9FAFB" }}
                      >
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
