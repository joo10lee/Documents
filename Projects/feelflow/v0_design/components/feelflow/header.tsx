export function Header() {
  const today = new Date()
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  return (
    <header className="px-5 pt-2 pb-2">
      {/* Top bar: weather + XP */}
      <div className="flex items-center justify-between mb-3">
        {/* Weather pill */}
        <div className="flex items-center gap-1.5 rounded-full px-3 py-[5px]" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <span className="text-sm" role="img" aria-label="Partly cloudy">{"🌤️"}</span>
          <span className="text-[0.8rem] font-semibold text-[#6B7280]">{"68°F"}</span>
        </div>

        {/* XP badge */}
        <div className="flex items-center gap-1.5 rounded-full px-3 py-[5px]" style={{ background: '#FEF3C7' }}>
          <span className="text-sm" role="img" aria-label="Star">{"⭐"}</span>
          <span className="text-[0.85rem] font-bold font-mono tracking-tight text-[#D97706]">{"2,450 XP"}</span>
        </div>
      </div>

      {/* Greeting — single line */}
      <h1 className="text-[1.6rem] font-extrabold text-[#1A1A2E] leading-tight tracking-[-0.02em]">
        {"Good Morning, Jason!"}
      </h1>

      {/* Date + Streak in one row */}
      <div className="flex items-center gap-3 mt-1">
        <span className="text-[0.8rem] text-[#9CA3AF]">{dateStr}</span>
        <div className="flex items-center gap-1 rounded-full px-2.5 py-0.5" style={{ background: '#FFF7ED' }}>
          <span className="text-[0.7rem]" role="img" aria-label="Fire">{"🔥"}</span>
          <span className="text-[0.75rem] font-bold text-[#EA580C]">{"7-Day Streak"}</span>
        </div>
      </div>
    </header>
  )
}
