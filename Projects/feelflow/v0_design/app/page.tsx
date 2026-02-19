import { PhoneFrame } from "@/components/feelflow/phone-frame"
import { Header } from "@/components/feelflow/header"
import { EmotionGrid } from "@/components/feelflow/emotion-grid"
import { DailyQuests } from "@/components/feelflow/daily-quests"
import { EmergencyFab } from "@/components/feelflow/emergency-button"
import { BottomNav } from "@/components/feelflow/bottom-nav"

export default function Home() {
  return (
    <PhoneFrame>
      <div className="relative flex flex-col h-full">
        <Header />

        <main className="flex flex-col gap-4 px-5 pt-1">
          <EmotionGrid />
          <DailyQuests />
        </main>

        {/* FAB floats above nav */}
        <EmergencyFab />
        <BottomNav />
      </div>
    </PhoneFrame>
  )
}
