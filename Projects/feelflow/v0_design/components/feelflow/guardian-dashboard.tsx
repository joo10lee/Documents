"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Settings, X, Send } from "lucide-react"

/* ── Static data ── */

const CHART_DATA = [
  { day: "Mon", val: 6 },
  { day: "Tue", val: 7 },
  { day: "Wed", val: 5 },
  { day: "Thu", val: 8 },
  { day: "Fri", val: 4 },
  { day: "Sat", val: 3 },
  { day: "Sun", val: 4 },
]

const RECENT_ACTIVITY = [
  { emoji: "\uD83D\uDE22", name: "Sad", strategy: "Worry Dump", time: "2:30 PM", lv: 9 },
  { emoji: "\uD83D\uDE30", name: "Anxious", strategy: "Box Breathing", time: "9:15 AM", lv: 7 },
  { emoji: "\uD83D\uDE0A", name: "Happy", strategy: null, time: "8:00 AM", lv: 3 },
  { emoji: "\uD83D\uDE2B", name: "Tired", strategy: "Calm Music", time: "Yesterday", lv: 5 },
  { emoji: "\uD83D\uDE0C", name: "Calm", strategy: null, time: "Yesterday", lv: 2 },
]

const QUICK_MESSAGES = [
  "Great job! \uD83C\uDF1F",
  "I'm proud of you \u2764\uFE0F",
  "Keep going! \uD83D\uDCAA",
  "Love you \uD83E\uDD17",
]

/* ── Toggle Switch ── */

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative shrink-0 w-[44px] h-[26px] rounded-full transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-1"
      style={{ background: on ? "#10B981" : "#D1D5DB" }}
    >
      <div
        className="absolute top-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-all duration-200 ease-out"
        style={{ left: on ? "20px" : "2px" }}
      />
    </button>
  )
}

/* ── SVG Line Chart ── */

function WeekChart() {
  const w = 310
  const h = 160
  const padX = 28
  const padTop = 10
  const padBot = 22
  const plotW = w - padX * 2
  const plotH = h - padTop - padBot

  const points = CHART_DATA.map((d, i) => ({
    x: padX + (plotW / (CHART_DATA.length - 1)) * i,
    y: padTop + plotH - (d.val / 10) * plotH,
  }))

  // Smooth curve
  const line = points
    .map((p, i) => {
      if (i === 0) return `M${p.x},${p.y}`
      const prev = points[i - 1]
      const cpx1 = prev.x + (p.x - prev.x) * 0.4
      const cpx2 = p.x - (p.x - prev.x) * 0.4
      return `C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`
    })
    .join(" ")

  const areaPath = `${line} L${points[points.length - 1].x},${h - padBot} L${points[0].x},${h - padBot} Z`

  const gridLines = [2, 4, 6, 8, 10]

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {gridLines.map((v) => {
        const y = padTop + plotH - (v / 10) * plotH
        return (
          <line key={v} x1={padX} y1={y} x2={w - padX} y2={y} stroke="#F1F5F9" strokeWidth="1" />
        )
      })}

      {/* Fill */}
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#chartFill)" />

      {/* Line */}
      <path d={line} fill="none" stroke="#6C5CE7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#6C5CE7" strokeWidth="2" />
      ))}

      {/* X labels */}
      {CHART_DATA.map((d, i) => (
        <text
          key={d.day}
          x={points[i].x}
          y={h - 4}
          textAnchor="middle"
          fontSize="10"
          fill="#9CA3AF"
          fontFamily="var(--font-jakarta), Plus Jakarta Sans, sans-serif"
          fontWeight="500"
        >
          {d.day}
        </text>
      ))}
    </svg>
  )
}

/* ── Intensity color helper ── */

function lvColor(lv: number) {
  if (lv >= 7) return "#EF4444"
  if (lv >= 4) return "#F59E0B"
  return "#10B981"
}

/* ── Main Component ── */

export function GuardianDashboard() {
  const router = useRouter()
  const [showAlert, setShowAlert] = useState(true)
  const [activeTab, setActiveTab] = useState("week")
  const [alerts, setAlerts] = useState([true, true, true])
  const [message, setMessage] = useState("")

  const toggleAlert = useCallback((idx: number) => {
    setAlerts((prev) => prev.map((v, i) => (i === idx ? !v : v)))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-4 px-5 pt-3 pb-10">

          {/* ═══ 1. HEADER ═══ */}
          <header>
            <div className="flex items-center justify-between">
              <h1 className="text-[1.3rem] font-extrabold text-[#1A1A2E] tracking-[-0.01em]">
                {"Guardian Dashboard"}
              </h1>
              <button
                type="button"
                className="flex items-center justify-center w-[44px] h-[44px] rounded-xl text-[#6B7280] active:scale-95 transition-transform duration-200 ease-out"
                aria-label="Settings"
              >
                <Settings size={22} strokeWidth={1.8} />
              </button>
            </div>
            <div className="mt-1">
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.8rem] font-semibold"
                style={{ background: "#ECFDF5", color: "#059669" }}
              >
                {"Jason is doing well"}{" "}
                <span aria-hidden="true">{"\uD83D\uDC9A"}</span>
              </span>
            </div>
          </header>

          {/* ═══ 2. ALERT CARD ═══ */}
          {showAlert && (
            <div
              className="relative rounded-[20px] p-5 pl-7 overflow-hidden"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
              }}
            >
              {/* Left bar */}
              <div className="absolute left-0 top-3 bottom-3 w-[4px] rounded-r-full bg-[#EF4444]" />

              {/* Close */}
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                aria-label="Dismiss alert"
              >
                <X size={16} strokeWidth={2} />
              </button>

              <p className="text-[0.95rem] font-bold text-[#991B1B]">
                {"\uD83D\uDEA8 High Intensity Alert"}
              </p>
              <p className="text-[0.85rem] text-[#7F1D1D] mt-1 pr-6 leading-relaxed">
                {"Jason reported Sadness at intensity 9, 15 minutes ago"}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="flex-1 h-[40px] rounded-xl bg-white border border-[#FECACA] text-[0.8rem] font-semibold text-[#DC2626] active:scale-[0.97] transition-transform duration-200 ease-out"
                >
                  {"\uD83D\uDCAC Send Message"}
                </button>
                <button
                  type="button"
                  className="flex-1 h-[40px] rounded-xl bg-white border border-[#FECACA] text-[0.8rem] font-semibold text-[#DC2626] active:scale-[0.97] transition-transform duration-200 ease-out"
                >
                  {"\u2764\uFE0F Encourage"}
                </button>
              </div>
            </div>
          )}

          {/* ═══ 3. EMOTION WEATHER CHART ═══ */}
          <div
            className="rounded-[20px] p-5"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
          >
            {/* Tabs */}
            <div className="flex items-center h-[32px] rounded-full p-[3px] mb-4" style={{ background: "#F1F5F9" }}>
              {["today", "week", "2months"].map((tab) => {
                const label = tab === "2months" ? "2 Months" : tab.charAt(0).toUpperCase() + tab.slice(1)
                const active = activeTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 h-full rounded-full text-[0.8rem] transition-all duration-200 ease-out ${
                      active
                        ? "bg-white font-bold text-[#1A1A2E]"
                        : "font-medium text-[#9CA3AF]"
                    }`}
                    style={active ? { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : undefined}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Chart */}
            <div className="w-full">
              <WeekChart />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3">
              {[
                { emoji: "\uD83D\uDE0A", label: "Happy", color: "#F59E0B" },
                { emoji: "\uD83D\uDE22", label: "Sad", color: "#3B82F6" },
                { emoji: "\uD83D\uDE30", label: "Anxious", color: "#8B5CF6" },
              ].map((e) => (
                <div key={e.label} className="flex items-center gap-1.5">
                  <div className="w-[8px] h-[8px] rounded-full" style={{ background: e.color }} />
                  <span className="text-[0.7rem] font-medium text-[#6B7280]">{e.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ 4. AI INSIGHT ═══ */}
          <div
            className="relative rounded-[16px] p-4 pl-6 overflow-hidden"
            style={{ background: "#F0F7FF", borderLeft: "4px solid #0EA5E9" }}
          >
            <p className="text-[0.8rem] font-bold text-[#0369A1]">
              {"\uD83E\uDD16 AI Insight"}
            </p>
            <p className="text-[0.85rem] text-[#334155] mt-1.5 leading-[1.6]">
              {"Jason\u2019s anxiety peaks on weekday mornings, often triggered by school-related events. Box Breathing has been the most effective strategy this week (73% intensity reduction). Consider discussing morning preparation routines."}
            </p>
            <p className="text-[0.7rem] text-[#9CA3AF] mt-2">{"Updated 2h ago"}</p>
          </div>

          {/* ═══ 5. GOAL TRACKER ═══ */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.9rem] font-bold text-[#1A1A2E]">
                {"\uD83C\uDFC6 Current Goal"}
              </span>
              <button type="button" className="text-[0.8rem] font-semibold text-[#6C5CE7]">
                {"Edit"}
              </button>
            </div>

            <p className="text-[0.9rem] font-semibold text-[#1A1A2E] mt-2">
              {"\uD83D\uDCD6 Read Every Day"}
            </p>

            {/* Progress bar */}
            <div className="mt-2 h-[6px] w-full rounded-full bg-[#F1F5F9] overflow-hidden">
              <div
                className="h-full rounded-full animate-progress-fill"
                style={{ background: "#6C5CE7", "--progress-width": "65%" } as React.CSSProperties}
              />
            </div>
            <p className="text-[0.75rem] font-mono font-semibold text-[#6B7280] mt-1">
              {"650 / 1,000 XP"}
            </p>

            <button type="button" className="text-[0.8rem] font-semibold text-[#6C5CE7] mt-2">
              {"+ Add New Goal"}
            </button>
          </div>

          {/* ═══ 6. ALERT SETTINGS ═══ */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[0.9rem] font-bold text-[#1A1A2E] mb-3">
              {"\uD83D\uDD14 Alert Levels"}
            </p>

            <div className="flex flex-col gap-3">
              {[
                { icon: "\uD83D\uDCF1", title: "In-app notification", sub: "When intensity \u2265 5" },
                { icon: "\uD83D\uDCAC", title: "SMS alert", sub: "When intensity \u2265 7" },
                { icon: "\uD83D\uDEA8", title: "Emergency call", sub: "When intensity \u2265 9 or \uD83C\uDD98 used" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.85rem] font-medium text-[#374151]">{`${row.icon} ${row.title}`}</p>
                    <p className="text-[0.75rem] text-[#9CA3AF]">{row.sub}</p>
                  </div>
                  <Toggle on={alerts[i]} onToggle={() => toggleAlert(i)} />
                </div>
              ))}
            </div>
          </div>

          {/* ═══ 7. ENCOURAGEMENT TEMPLATES ═══ */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[0.9rem] font-bold text-[#1A1A2E] mb-3">
              {"\uD83D\uDCAC Send Jason a Message"}
            </p>

            {/* Template pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  type="button"
                  onClick={() => setMessage(msg)}
                  className="rounded-full bg-[#F3F4F6] px-3 py-2 text-[0.8rem] font-semibold text-[#374151] active:scale-[0.97] transition-transform duration-200 ease-out"
                >
                  {msg}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 h-[44px] rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] px-3 text-[0.85rem] text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                className="flex items-center justify-center w-[44px] h-[44px] rounded-xl text-[#6C5CE7] active:scale-95 transition-transform duration-200 ease-out"
                aria-label="Send message"
              >
                <Send size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ═══ 8. RECENT ACTIVITY ═══ */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[0.9rem] font-bold text-[#1A1A2E] mb-3">
              {"\uD83D\uDD52 Recent Activity"}
            </p>

            <div className="flex flex-col gap-2">
              {RECENT_ACTIVITY.map((entry, i) => (
                <div key={i} className="flex items-center h-[40px] gap-2">
                  {/* Emotion */}
                  <div className="flex items-center gap-1 w-[80px] shrink-0">
                    <span className="text-[1rem]">{entry.emoji}</span>
                    <span className="text-[0.8rem] font-semibold text-[#1A1A2E] truncate">{entry.name}</span>
                  </div>

                  {/* Strategy */}
                  <span className="flex-1 text-[0.8rem] text-[#6B7280] truncate">
                    {entry.strategy || "\u2014"}
                  </span>

                  {/* Time */}
                  <span className="text-[0.75rem] text-[#9CA3AF] shrink-0 w-[60px] text-right">
                    {entry.time}
                  </span>

                  {/* Intensity pill */}
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-bold font-mono text-white"
                    style={{ background: lvColor(entry.lv) }}
                  >
                    {`Lv.${entry.lv}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ 9. BACK LINK ═══ */}
          <div className="flex justify-center pt-2 pb-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-[0.9rem] font-semibold text-[#6C5CE7] active:scale-95 transition-transform duration-200 ease-out"
            >
              {"\u2190 Back to Home"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
