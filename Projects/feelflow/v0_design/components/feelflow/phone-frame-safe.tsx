export function PhoneFrameSafe({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#C5D8E8] p-4">
      <div className="relative w-[390px] h-[844px] rounded-[50px] bg-[#1A1A2E] shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)] p-[10px] overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[34px] bg-[#1A1A2E] rounded-b-[20px] z-30" />

        {/* Screen */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-[#F0F7FF]">
          {/* Status bar — dark text on light-blue bg */}
          <div className="relative z-10 flex items-center justify-between px-8 pt-[14px] pb-1">
            <span className="text-[0.8rem] font-semibold text-[#1A1A2E] tracking-tight">
              {"9:41"}
            </span>
            <div className="flex items-center gap-[6px]">
              {/* Cellular */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="#1A1A2E" aria-hidden="true">
                <rect x="0" y="8" width="3" height="4" rx="0.75" opacity="0.35" />
                <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.75" opacity="0.55" />
                <rect x="9" y="3" width="3" height="9" rx="0.75" opacity="0.75" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.75" />
              </svg>
              {/* Wifi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="#1A1A2E" aria-hidden="true">
                <path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" opacity="1" />
                <path d="M4.5 8.5a5 5 0 017 0" stroke="#1A1A2E" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
                <path d="M2 5.5a8.5 8.5 0 0112 0" stroke="#1A1A2E" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.45" />
              </svg>
              {/* Battery */}
              <svg width="27" height="12" viewBox="0 0 27 12" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="#1A1A2E" strokeWidth="1" opacity="0.35" />
                <rect x="2" y="2" width="16" height="8" rx="1.5" fill="#1A1A2E" />
                <rect x="23.5" y="3.5" width="2.5" height="5" rx="1" fill="#1A1A2E" opacity="0.35" />
              </svg>
            </div>
          </div>

          {/* App content — scrollable for crisis resources */}
          <div className="relative z-[1] h-[calc(100%-32px)] overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
