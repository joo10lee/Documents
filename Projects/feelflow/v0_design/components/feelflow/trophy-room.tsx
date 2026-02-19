"use client"

import { useState } from "react"
import { BottomNav } from "./bottom-nav"

const UP_NEXT = [
  { emoji: "\u{1F3B5}", name: "Music Practice", xp: "800 XP" },
  { emoji: "\u{1F3C3}", name: "Move Daily", xp: "1,200 XP" },
]

const TROPHIES = [
  { emoji: "\u{1F3A8}", name: "Try Art Class", date: "Jan 28", color: "#F59E0B" },
  { emoji: "\u{1F3C3}", name: "Exercise 3x/Week", date: "Feb 2", color: "#F59E0B" },
  { emoji: "\u{1F4F1}", name: "Screen Time Goal", date: "Feb 10", color: "#F59E0B" },
]

export function TrophyRoom() {
  const [rewardClaimed, setRewardClaimed] = useState(false)

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-3 pb-2">
        <h1 className="text-[1.4rem] font-extrabold text-[#1A1A2E]">
          {"My Goals"}
        </h1>
        <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ backgroundColor: "#FEF3C7" }}>
          <span className="text-[0.85rem]" role="img" aria-label="Star">
            {"\u2B50"}
          </span>
          <span className="font-mono text-[0.85rem] font-bold text-[#D97706]">
            {"2,450"}
          </span>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-5 pb-[92px]">
        <div className="flex flex-col gap-5 pt-2">

          {/* Pending Reward — show unclaimed state */}
          {!rewardClaimed && (
            <button
              type="button"
              onClick={() => setRewardClaimed(true)}
              className="w-full rounded-[20px] p-5 text-center active:scale-[0.98] transition-transform duration-200 ease-out"
              style={{
                background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                border: "1px solid #FCD34D",
              }}
            >
              <span className="inline-block text-[1.5rem] animate-reward-bounce" role="img" aria-label="Party">
                {"\u{1F389}"}
              </span>
              <p className="text-[1.1rem] font-extrabold text-[#92400E] mt-1">
                {"Goal Complete!"}
              </p>
              <p className="text-[0.85rem] font-medium text-[#A16207] mt-0.5">
                {"Tap to claim your reward"}
              </p>
            </button>
          )}

          {/* Active Goal — Hero Card */}
          <div
            className="rounded-[24px] p-6"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
          >
            <p
              className="text-[0.7rem] font-bold text-[#9CA3AF] text-center"
              style={{ letterSpacing: "1.5px" }}
            >
              {"CURRENT MISSION"}
            </p>

            <div className="flex flex-col items-center mt-3">
              <span className="text-[2.5rem]" role="img" aria-label="Book">
                {"\u{1F4D6}"}
              </span>
              <p className="text-[1.2rem] font-extrabold text-[#1A1A2E] mt-1">
                {"Read Every Day"}
              </p>
              <p className="text-[0.9rem] font-semibold text-[#6C5CE7] mt-0.5">
                {"\u{1F381} New Book"}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full h-[10px] rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  className="h-full rounded-full animate-progress-fill"
                  style={{
                    background: "linear-gradient(90deg, #6C5CE7, #A78BFA)",
                    ["--progress-width" as string]: "65%",
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-[0.8rem] font-semibold text-[#6C5CE7]">
                  {"650 XP"}
                </span>
                <span className="font-mono text-[0.8rem] font-semibold text-[#9CA3AF]">
                  {"1,000 XP"}
                </span>
              </div>
              <p className="text-right text-[0.75rem] font-medium text-[#9CA3AF] mt-0.5">
                {"Day 5"}
              </p>
            </div>
          </div>

          {/* Up Next Queue */}
          <section>
            <h2 className="text-[1rem] font-bold text-[#1A1A2E]">
              {"\u{1F680} Up Next"}
            </h2>
            <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-hide pb-1">
              {UP_NEXT.map((item) => (
                <div
                  key={item.name}
                  className="flex-shrink-0 flex flex-col items-center justify-center rounded-[16px] p-3"
                  style={{
                    width: "130px",
                    height: "100px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span className="text-[1.5rem]" aria-hidden="true">{item.emoji}</span>
                  <p className="text-[0.8rem] font-semibold text-[#1A1A2E] text-center mt-1 leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[0.7rem] text-[#9CA3AF] mt-0.5">{item.xp}</p>
                </div>
              ))}
              {/* Empty slot */}
              <div
                className="flex-shrink-0 flex flex-col items-center justify-center rounded-[16px]"
                style={{
                  width: "130px",
                  height: "100px",
                  backgroundColor: "#F9FAFB",
                  border: "1.5px dashed #D1D5DB",
                }}
              >
                <span className="text-[1.5rem] opacity-40" aria-hidden="true">
                  {"\u{1F512}"}
                </span>
                <p className="text-[0.75rem] text-[#9CA3AF] mt-1">{"Empty"}</p>
              </div>
            </div>
          </section>

          {/* Trophy Case */}
          <section>
            <h2 className="text-[1rem] font-bold text-[#1A1A2E]">
              {"Trophy Case \u{1F3C6}"}
            </h2>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {TROPHIES.map((trophy) => (
                <div
                  key={trophy.name}
                  className="rounded-[16px] p-4"
                  style={{
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                    borderTop: `3px solid ${trophy.color}`,
                  }}
                >
                  <span className="text-[1.3rem]" aria-hidden="true">{trophy.emoji}</span>
                  <p className="text-[0.8rem] font-semibold text-[#1A1A2E] mt-1 leading-tight">
                    {trophy.name}
                  </p>
                  <p className="text-[0.7rem] text-[#9CA3AF] mt-0.5">{trophy.date}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Bottom Nav — Trophies active */}
      <BottomNav defaultTab="trophies" />
    </div>
  )
}
