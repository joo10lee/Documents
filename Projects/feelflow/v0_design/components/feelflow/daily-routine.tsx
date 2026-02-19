"use client"

import { useState, useCallback } from "react"
import { Check } from "lucide-react"
import { BottomNav } from "./bottom-nav"

interface Task {
  id: string
  emoji: string
  label: string
  owner: "guardian" | "child"
  done: boolean
}

const MORNING_TASKS: Task[] = [
  { id: "m1", emoji: "\u2600\uFE0F", label: "Wake Up Routine", owner: "guardian", done: true },
  { id: "m2", emoji: "\uD83E\uDEB4", label: "Brush Teeth", owner: "guardian", done: true },
  { id: "m3", emoji: "\uD83C\uDF92", label: "Pack Backpack", owner: "guardian", done: true },
  { id: "m4", emoji: "\uD83D\uDCD6", label: "Morning Reading", owner: "guardian", done: false },
  { id: "m5", emoji: "\uD83E\uDDD8", label: "Breathing Exercise", owner: "child", done: false },
]

const EVENING_TASKS: Task[] = [
  { id: "e1", emoji: "\uD83D\uDCDD", label: "Homework", owner: "guardian", done: true },
  { id: "e2", emoji: "\uD83D\uDEB6", label: "Evening Walk", owner: "child", done: false },
  { id: "e3", emoji: "\uD83D\uDEBF", label: "Shower", owner: "guardian", done: false },
  { id: "e4", emoji: "\uD83D\uDCF1", label: "Screen Time Off", owner: "guardian", done: false },
  { id: "e5", emoji: "\uD83D\uDCA4", label: "Wind Down", owner: "child", done: false },
]

export function DailyRoutine() {
  const [period, setPeriod] = useState<"am" | "pm">("am")
  const [morningTasks, setMorningTasks] = useState(MORNING_TASKS)
  const [eveningTasks, setEveningTasks] = useState(EVENING_TASKS)
  const [animatingId, setAnimatingId] = useState<string | null>(null)

  const tasks = period === "am" ? morningTasks : eveningTasks
  const setTasks = period === "am" ? setMorningTasks : setEveningTasks
  const doneCount = tasks.filter((t) => t.done).length

  const toggleTask = useCallback(
    (id: string) => {
      setAnimatingId(id)
      setTimeout(() => setAnimatingId(null), 200)
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      )
    },
    [setTasks]
  )

  // Progress ring math
  const radius = 38
  const stroke = 6
  const circ = 2 * Math.PI * radius
  const progress = doneCount / tasks.length
  const dashOffset = circ * (1 - progress)

  return (
    <div className="relative flex flex-col h-full">
      {/* HEADER */}
      <header className="flex items-center justify-between px-5 pt-3 pb-2">
        <h1 className="text-[1.4rem] font-extrabold text-[#1A1A2E] tracking-[-0.01em]">
          {"Daily Routine"}
        </h1>

        {/* AM / PM toggle */}
        <div
          className="relative flex items-center w-[160px] h-[36px] rounded-full p-[3px]"
          style={{ background: "#F1F5F9" }}
        >
          <button
            type="button"
            onClick={() => setPeriod("am")}
            className={`
              relative z-10 flex-1 h-full flex items-center justify-center gap-1 rounded-full
              text-[0.8rem] transition-all duration-200 ease-out
              ${period === "am" ? "font-bold text-[#1A1A2E]" : "font-medium text-[#9CA3AF]"}
            `}
          >
            <span className="text-[0.75rem]">{"\u2600\uFE0F"}</span>
            {"AM"}
          </button>
          <button
            type="button"
            onClick={() => setPeriod("pm")}
            className={`
              relative z-10 flex-1 h-full flex items-center justify-center gap-1 rounded-full
              text-[0.8rem] transition-all duration-200 ease-out
              ${period === "pm" ? "font-bold text-[#1A1A2E]" : "font-medium text-[#9CA3AF]"}
            `}
          >
            <span className="text-[0.75rem]">{"\uD83C\uDF19"}</span>
            {"PM"}
          </button>
          {/* Sliding pill */}
          <div
            className="absolute top-[3px] h-[30px] w-[calc(50%-3px)] rounded-full bg-white transition-all duration-200 ease-out"
            style={{
              left: period === "am" ? "3px" : "calc(50%)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          />
        </div>
      </header>

      {/* PROGRESS RING */}
      <div className="flex flex-col items-center py-3">
        <div className="relative w-[88px] h-[88px]">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            {/* Background ring */}
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={stroke}
            />
            {/* Progress ring */}
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke="#6C5CE7"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 600ms ease-out" }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[1.3rem] font-bold text-[#6C5CE7]">
              {`${doneCount}/${tasks.length}`}
            </span>
          </div>
        </div>
        <span className="text-[0.8rem] font-medium text-[#9CA3AF] mt-1">{"tasks done"}</span>
      </div>

      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-2">
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              className={`
                flex items-center h-[56px] bg-white rounded-[16px] px-4 gap-3
                active:scale-[0.98] transition-all duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-1
                ${animatingId === task.id ? "animate-check-bounce" : ""}
              `}
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}
            >
              {/* Checkbox */}
              <div
                className={`
                  flex items-center justify-center w-7 h-7 rounded-lg shrink-0
                  transition-all duration-200 ease-out
                  ${task.done
                    ? "bg-[#10B981] border-none"
                    : "bg-white border-2 border-[#D1D5DB]"
                  }
                `}
              >
                {task.done && (
                  <Check size={15} strokeWidth={3} color="white" aria-hidden="true" />
                )}
              </div>

              {/* Task text */}
              <span
                className={`
                  flex-1 text-left text-[0.9rem] font-semibold truncate
                  transition-all duration-200 ease-out
                  ${task.done
                    ? "text-[#9CA3AF] line-through opacity-70"
                    : "text-[#1A1A2E]"
                  }
                `}
              >
                {`${task.emoji} ${task.label}`}
              </span>

              {/* Ownership badge */}
              <span className="text-[0.6rem] opacity-40 shrink-0" aria-hidden="true">
                {task.owner === "guardian" ? "\uD83D\uDEE1\uFE0F" : "\u270F\uFE0F"}
              </span>
            </button>
          ))}

          {/* Add task row */}
          <button
            type="button"
            className="
              flex items-center justify-center h-[52px] rounded-[16px]
              border-[1.5px] border-dashed border-[#D1D5DB]
              text-[0.85rem] font-semibold text-[#6C5CE7]
              active:scale-[0.98] transition-transform duration-200 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-1
            "
          >
            {"+ Add my own task"}
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav defaultTab="routine" />
    </div>
  )
}
