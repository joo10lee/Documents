export function PhoneFrameDark({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D0D1A] p-4">
      <div className="relative w-[390px] h-[844px] rounded-[50px] bg-[#1A1A2E] shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)] p-[10px] overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[34px] bg-[#1A1A2E] rounded-b-[20px] z-30" />

        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[40px] overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 35%, rgba(108,92,231,0.08) 0%, transparent 60%), #161627',
          }}
        >
          {/* Status bar — light text for dark bg */}
          <div className="relative z-10 flex items-center justify-between px-8 pt-[14px] pb-1">
            <span className="text-[0.8rem] font-semibold text-white/80 tracking-tight">
              {"9:41"}
            </span>
            <div className="flex items-center gap-[6px]">
              {/* Cellular */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="white" fillOpacity="0.8" aria-hidden="true">
                <rect x="0" y="8" width="3" height="4" rx="0.75" opacity="0.35" />
                <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.75" opacity="0.55" />
                <rect x="9" y="3" width="3" height="9" rx="0.75" opacity="0.75" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.75" />
              </svg>
              {/* Wifi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="white" fillOpacity="0.8" aria-hidden="true">
                <path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" opacity="1" />
                <path d="M4.5 8.5a5 5 0 017 0" stroke="white" strokeOpacity="0.6" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <path d="M2 5.5a8.5 8.5 0 0112 0" stroke="white" strokeOpacity="0.4" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </svg>
              {/* Battery */}
              <svg width="27" height="12" viewBox="0 0 27 12" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
                <rect x="2" y="2" width="16" height="8" rx="1.5" fill="white" fillOpacity="0.8" />
                <rect x="23.5" y="3.5" width="2.5" height="5" rx="1" fill="white" fillOpacity="0.3" />
              </svg>
            </div>
          </div>

          {/* App content */}
          <div className="relative z-[1] h-[calc(100%-32px)] overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
