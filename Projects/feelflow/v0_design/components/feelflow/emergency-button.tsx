"use client"

import { useRouter } from "next/navigation"

export function EmergencyFab() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push("/emergency")}
      className="
        absolute z-30 right-5 bottom-[88px]
        flex items-center justify-center
        w-[52px] h-[52px] rounded-full
        animate-fab-pulse
        active:scale-[0.93] transition-transform duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] focus-visible:ring-offset-2
      "
      style={{
        background: 'linear-gradient(135deg, #FF6B6B, #E17055)',
      }}
      aria-label="SOS - emergency support"
    >
      <span className="text-white font-extrabold text-[0.7rem] tracking-wide">{"SOS"}</span>
    </button>
  )
}
