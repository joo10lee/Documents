"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

const TAG_GROUPS = [
  {
    tags: [
      { emoji: "\u{1F4DA}", label: "Homework" },
      { emoji: "\u{1F3EB}", label: "Test" },
      { emoji: "\u{1F465}", label: "Classmates" },
      { emoji: "\u{1F4DD}", label: "Presentation" },
    ],
  },
  {
    tags: [
      { emoji: "\u{1F3E0}", label: "Chores" },
      { emoji: "\u{1F468}\u200D\u{1F469}\u200D\u{1F466}", label: "Family" },
      { emoji: "\u{1F50A}", label: "Too Loud" },
      { emoji: "\u{1F504}", label: "Change in Plan" },
    ],
  },
  {
    tags: [
      { emoji: "\u{1F4AC}", label: "Argument" },
      { emoji: "\u{1F636}", label: "Left Out" },
      { emoji: "\u{1F44B}", label: "New People" },
      { emoji: "\u{1F4F1}", label: "Online" },
    ],
  },
  {
    tags: [
      { emoji: "\u{1F634}", label: "Tired" },
      { emoji: "\u{1F912}", label: "Sick" },
      { emoji: "\u{1F37D}\uFE0F", label: "Hungry" },
    ],
  },
  {
    tags: [
      { emoji: "\u2753", label: "Don't Know" },
      { emoji: "\u270F\uFE0F", label: "Other" },
    ],
  },
]

const MAX_SELECTION = 3

export function TriggerTags() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [animating, setAnimating] = useState<string | null>(null)
  const router = useRouter()

  const toggle = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else if (next.size < MAX_SELECTION) {
        next.add(label)
      }
      return next
    })
    setAnimating(label)
    setTimeout(() => setAnimating(null), 200)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* ---- Top Bar ---- */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <button
          className="flex items-center justify-center w-12 h-12 -ml-2 text-[#1A1A2E]"
          aria-label="Go back"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>

        {/* Emotion context pill */}
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ background: "rgba(139, 92, 246, 0.1)" }}
        >
          <span className="text-sm leading-none" aria-hidden="true">{"\u{1F630}"}</span>
          <span className="text-[0.85rem] font-semibold text-[#8B5CF6]">{"Anxious"}</span>
        </div>

        {/* Spacer for balance */}
        <div className="w-12" aria-hidden="true" />
      </div>

      {/* ---- Title Area ---- */}
      <div className="px-5 pt-3 pb-2 shrink-0">
        <h1 className="text-[1.4rem] font-extrabold text-[#1A1A2E] leading-tight">
          {"What happened?"}
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[0.9rem] text-[#9CA3AF]">{"Pick up to 3"}</p>
          <span className="text-[0.85rem] font-semibold text-[#6C5CE7]">
            {`${selected.size}/${MAX_SELECTION} selected`}
          </span>
        </div>
      </div>

      {/* ---- Tag Cloud ---- */}
      <div className="flex-1 px-5 pt-1 pb-2 overflow-hidden">
        <div className="flex flex-col gap-3">
          {TAG_GROUPS.map((group, gi) => (
            <div key={gi} className="flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const isSelected = selected.has(tag.label)
                const isAnimating = animating === tag.label
                const isDontKnow = tag.label === "Don't Know"
                return (
                  <button
                    key={tag.label}
                    onClick={() => toggle(tag.label)}
                    className={`
                      flex items-center gap-1.5 h-10 rounded-full transition-all duration-200 ease-out
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]
                      ${isDontKnow ? "px-5" : "px-4"}
                      ${isAnimating ? "animate-tag-pop" : ""}
                    `}
                    style={{
                      background: isSelected ? "#F0EDFF" : "#FFFFFF",
                      border: isSelected
                        ? "1.5px solid #6C5CE7"
                        : "1.5px solid #E5E7EB",
                    }}
                    aria-pressed={isSelected}
                  >
                    <span className="text-[0.85rem] leading-none" aria-hidden="true">
                      {tag.emoji}
                    </span>
                    <span
                      className={`text-[0.85rem] ${
                        isSelected
                          ? "font-bold text-[#6C5CE7]"
                          : "font-semibold text-[#374151]"
                      }`}
                    >
                      {tag.label}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ---- Bottom CTA ---- */}
      <div className="shrink-0 px-5 pb-5 pt-2">
        <button
          className={`
            flex items-center justify-center gap-2
            w-full h-[52px] rounded-2xl
            text-white font-bold text-[1rem]
            transition-all duration-200 ease-out
            active:scale-[0.97]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
            ${selected.size > 0 ? "bg-[#6C5CE7]" : "bg-[#6C5CE7]/40 cursor-not-allowed"}
          `}
          disabled={selected.size === 0}
          onClick={() => selected.size > 0 && router.push("/intensity")}
        >
          <span>{"Next"}</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>

        <button
          className="flex items-center justify-center w-full h-11 mt-1 text-[0.85rem] font-medium text-[#9CA3AF]"
        >
          {"Skip"}
        </button>
      </div>
    </div>
  )
}
