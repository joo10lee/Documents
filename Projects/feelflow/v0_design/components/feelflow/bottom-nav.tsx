"use client"

import { useState } from "react"
import { Home, CheckCircle2, Trophy, CalendarDays } from "lucide-react"

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "routine", icon: CheckCircle2, label: "Routine" },
  { id: "trophies", icon: Trophy, label: "Trophies" },
  { id: "journey", icon: CalendarDays, label: "Journey" },
]

export function BottomNav({ defaultTab = "home" }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-20 bg-white"
      style={{
        height: '72px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-full px-2 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center gap-[3px] min-w-[56px] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] rounded-lg transition-colors duration-200"
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                color={isActive ? "#6C5CE7" : "#9CA3AF"}
                fill={isActive ? "#6C5CE7" : "none"}
                aria-hidden="true"
              />
              <span
                className="text-[0.65rem] font-semibold"
                style={{ color: isActive ? '#6C5CE7' : '#9CA3AF' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="w-1 h-1 rounded-full bg-[#6C5CE7]"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
