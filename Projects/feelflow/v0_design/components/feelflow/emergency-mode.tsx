"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

const ACTIVITIES = [
  {
    emoji: "\uD83E\uDEC1",
    name: "Deep Breathing",
    instructions: [
      "Breathe in for 4 seconds\u2026",
      "Hold for 4 seconds\u2026",
      "Breathe out for 4 seconds\u2026",
    ],
  },
  {
    emoji: "\uD83D\uDC90",
    name: "5-4-3-2-1 Grounding",
    instructions: [
      "Name 5 things you can see\u2026",
      "4 things you can touch\u2026",
      "3 things you can hear\u2026",
      "2 things you can smell\u2026",
      "1 thing you can taste\u2026",
    ],
  },
  {
    emoji: "\u2744\uFE0F",
    name: "Ice Cube Hold",
    instructions: [
      "Hold something cold\u2026",
      "Focus on the sensation\u2026",
      "Notice the temperature\u2026",
      "Let everything else fade\u2026",
    ],
  },
]

export function EmergencyMode() {
  const router = useRouter()
  const [activityIndex, setActivityIndex] = useState(0)
  const activity = ACTIVITIES[activityIndex]

  const tryAnother = useCallback(() => {
    setActivityIndex((prev) => (prev + 1) % ACTIVITIES.length)
  }, [])

  return (
    <div className="flex flex-col h-full px-5">
      {/* Top area */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <h1
          className="font-extrabold text-[1.2rem] leading-tight"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          {"Emergency Mode"}
        </h1>
        <p
          className="mt-1 text-[0.9rem]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {"Let\u2019s calm down together"}
        </p>
      </div>

      {/* Activity card — center of screen */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-4">
        <div
          className="w-full rounded-[24px] p-8 flex flex-col items-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Breathing ring with emoji */}
          <div
            className="flex items-center justify-center w-[100px] h-[100px] rounded-full animate-emergency-glow"
            style={{
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            <span className="text-[3rem] leading-none" role="img" aria-label={activity.name}>
              {activity.emoji}
            </span>
          </div>

          {/* Activity name */}
          <p
            className="mt-5 font-bold text-[1.2rem]"
            style={{ color: "#FFFFFF" }}
          >
            {activity.name}
          </p>

          {/* Instructions — each line separate */}
          <div className="mt-4 flex flex-col items-center gap-0">
            {activity.instructions.map((line) => (
              <p
                key={line}
                className="text-[0.95rem] text-center leading-[1.8]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-6 w-full">
          {/* Try Another */}
          <button
            type="button"
            onClick={tryAnother}
            className="
              flex-1 h-[52px] rounded-2xl
              flex items-center justify-center gap-2
              active:scale-[0.97] transition-transform duration-200 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161627]
            "
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.7)" }} className="text-[0.9rem] font-semibold">
              {"\u21BB Try Another"}
            </span>
          </button>

          {/* I'm Okay */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="
              flex-1 h-[52px] rounded-2xl bg-[#10B981]
              flex items-center justify-center gap-2
              active:scale-[0.97] transition-transform duration-200 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161627]
            "
          >
            <span className="text-white text-[0.9rem] font-bold">
              {"\u2713 I\u2019m Okay"}
            </span>
          </button>
        </div>
      </div>

      {/* Crisis link — bottom area */}
      <div className="flex flex-col items-center pb-10 pt-2 gap-2">
        <p
          className="text-[0.85rem]"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {"Still feeling unsafe?"}
        </p>
        <button
          type="button"
          onClick={() => router.push("/crisis")}
          className="
            rounded-full px-4 py-2
            active:scale-[0.97] transition-transform duration-200 ease-out
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161627]
          "
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span
            className="text-[0.85rem] font-semibold"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {"Get More Help \u2192"}
          </span>
        </button>
      </div>
    </div>
  )
}
