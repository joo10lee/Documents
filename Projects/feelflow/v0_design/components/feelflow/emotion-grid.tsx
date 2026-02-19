"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const emotions = [
  { label: "Happy", emoji: "\u{1F60A}", color: "#F59E0B" },
  { label: "Sad", emoji: "\u{1F622}", color: "#3B82F6" },
  { label: "Anxious", emoji: "\u{1F630}", color: "#8B5CF6" },
  { label: "Angry", emoji: "\u{1F620}", color: "#EF4444" },
  { label: "Calm", emoji: "\u{1F60C}", color: "#10B981" },
  { label: "Tired", emoji: "\u{1F62B}", color: "#94A3B8" },
]

export function EmotionGrid() {
  const [selected, setSelected] = useState<string | null>(null)
  const router = useRouter()

  return (
    <section aria-label="How are you feeling?">
      <h2 className="text-[1rem] font-semibold text-[#6B7280] mb-2">
        {"How are you feeling?"}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {emotions.map((emotion) => {
          const isSelected = selected === emotion.label
          return (
            <button
              key={emotion.label}
              onClick={() => {
                setSelected(emotion.label)
                setTimeout(() => router.push("/triggers"), 250)
              }}
              className={`
                relative flex flex-col items-center justify-center
                h-[85px] rounded-[18px] bg-white
                transition-all duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]
                active:scale-[0.97]
              `}
              style={{
                boxShadow: isSelected
                  ? `0 0 0 2px ${emotion.color}, 0 2px 12px rgba(0,0,0,0.06)`
                  : '0 2px 12px rgba(0,0,0,0.04)',
                transform: isSelected ? 'translateY(-1px)' : undefined,
              }}
              aria-pressed={isSelected}
              aria-label={`I feel ${emotion.label}`}
            >
              {/* Color bar */}
              <div
                className="absolute left-0 top-4 bottom-4 rounded-r-full transition-all duration-200"
                style={{
                  width: isSelected ? '6px' : '4px',
                  backgroundColor: emotion.color,
                }}
                aria-hidden="true"
              />

              <span className="text-[2.2rem] leading-none" role="img" aria-hidden="true">
                {emotion.emoji}
              </span>
              <span className="text-[0.85rem] font-bold text-[#1A1A2E] mt-1.5">
                {emotion.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
