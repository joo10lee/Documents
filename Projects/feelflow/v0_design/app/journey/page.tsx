import { PhoneFrame } from "@/components/feelflow/phone-frame"
import { JourneyTimeline } from "@/components/feelflow/journey-timeline"
import { BottomNav } from "@/components/feelflow/bottom-nav"

export default function JourneyPage() {
  return (
    <PhoneFrame>
      <div className="relative flex flex-col h-full">
        <JourneyTimeline />
        <BottomNav defaultTab="journey" />
      </div>
    </PhoneFrame>
  )
}
