import { ChevronRight } from "lucide-react"

export function DailyQuests() {
  const done = 3
  const total = 5
  const progress = done / total

  // SVG ring parameters
  const size = 32
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <section aria-label="Daily quest summary">
      <button
        className="
          flex items-center w-full h-[52px] rounded-2xl bg-white px-4
          transition-all duration-200 ease-out
          active:scale-[0.98]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]
        "
        style={{
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
        aria-label={`Daily Quest: ${done} of ${total} done. Tap to view.`}
      >
        {/* Sword icon */}
        <span className="text-[1.2rem] mr-3" role="img" aria-hidden="true">{"⚔️"}</span>

        {/* Text */}
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-[0.9rem] font-bold text-[#1A1A2E] leading-tight">{"Daily Quest"}</span>
          <span className="text-[0.8rem] font-normal text-[#6B7280] leading-tight">{`${done} of ${total} done`}</span>
        </div>

        {/* Progress ring */}
        <div className="relative flex items-center justify-center mr-2">
          <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#6C5CE7"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute text-[0.6rem] font-bold font-mono text-[#6C5CE7]">
            {`${done}/${total}`}
          </span>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" aria-hidden="true" />
      </button>
    </section>
  )
}
