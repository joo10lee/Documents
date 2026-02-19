"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Phone, MessageCircle, Shield, ChevronDown } from "lucide-react"

function FaqSection({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[0.85rem] font-semibold text-[#3B82F6] active:opacity-70 transition-opacity"
      >
        <span>{question}</span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-xl bg-[#F8FAFC] p-3">
          <p className="text-[0.85rem] text-[#374151] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export function CrisisResources() {
  const router = useRouter()

  return (
    <div className="flex flex-col">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 bg-white"
        style={{
          height: "56px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-12 h-12 -ml-2 active:opacity-60 transition-opacity"
          aria-label="Close crisis resources"
        >
          <X size={22} strokeWidth={1.5} color="#374151" />
        </button>

        {/* Title */}
        <h1 className="font-extrabold text-[1.1rem] text-[#DC2626]">
          {"Crisis Resources"}
        </h1>

        {/* Spacer for balance */}
        <div className="w-12" />
      </div>

      {/* Compassion message */}
      <div className="px-6 pt-6 pb-5 text-center">
        <p className="font-bold text-[1.1rem] text-[#1A1A2E] leading-relaxed">
          {"You are not alone."}
        </p>
        <p className="text-[0.95rem] text-[#6B7280] leading-relaxed mt-1">
          {"There are people who want to help you right now. \uD83D\uDC99"}
        </p>
      </div>

      {/* Resource cards */}
      <div className="flex flex-col gap-4 px-5 pb-16">

        {/* Card A: 988 Lifeline */}
        <div
          className="bg-white rounded-[20px] p-6"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#EFF6FF]">
              <Phone size={24} strokeWidth={2} color="#3B82F6" />
            </div>
          </div>

          {/* Text */}
          <h2 className="font-extrabold text-[1.15rem] text-[#1A1A2E] text-center">
            {"988 Lifeline"}
          </h2>
          <p className="text-[0.85rem] text-[#6B7280] text-center mt-1 leading-relaxed">
            {"Free, confidential, 24/7."}
          </p>
          <p className="text-[0.85rem] text-[#6B7280] text-center leading-relaxed">
            {"Someone will listen."}
          </p>

          {/* FAQ */}
          <FaqSection
            question="What happens when I call?"
            answer="A real person answers. You tell them how you feel. They help you figure out what to do. You can hang up anytime."
          />

          {/* CTA */}
          <a
            href="tel:988"
            className="
              flex items-center justify-center gap-2
              w-full h-12 mt-4
              bg-[#3B82F6] rounded-xl
              text-white font-bold text-[0.95rem]
              active:scale-[0.97] transition-transform duration-200 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2
            "
          >
            <Phone size={16} strokeWidth={2.5} />
            <span>{"Call 988"}</span>
          </a>
        </div>

        {/* Card B: Crisis Text Line */}
        <div
          className="bg-white rounded-[20px] p-6"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#ECFDF5]">
              <MessageCircle size={24} strokeWidth={2} color="#10B981" />
            </div>
          </div>

          {/* Text */}
          <h2 className="font-extrabold text-[1.15rem] text-[#1A1A2E] text-center">
            {"Crisis Text Line"}
          </h2>
          <p className="text-[0.85rem] text-[#6B7280] text-center mt-1 leading-relaxed">
            {"Text HOME to 741741."}
          </p>
          <p className="text-[0.85rem] text-[#6B7280] text-center leading-relaxed">
            {"If you'd rather text than talk."}
          </p>

          {/* FAQ */}
          <FaqSection
            question="What happens when I text?"
            answer="You'll text with a real person. Type as much or as little as you want. They are trained to help."
          />

          {/* CTA */}
          <a
            href="sms:741741?body=HOME"
            className="
              flex items-center justify-center gap-2
              w-full h-12 mt-4
              bg-[#10B981] rounded-xl
              text-white font-bold text-[0.95rem]
              active:scale-[0.97] transition-transform duration-200 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2
            "
          >
            <MessageCircle size={16} strokeWidth={2.5} />
            <span>{"Text 741741"}</span>
          </a>
        </div>

        {/* Card C: Talk to Guardian */}
        <div
          className="bg-white rounded-[20px] p-6"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#F3F0FF]">
              <Shield size={24} strokeWidth={2} color="#6C5CE7" />
            </div>
          </div>

          {/* Text */}
          <h2 className="font-extrabold text-[1.15rem] text-[#1A1A2E] text-center">
            {"Talk to Dad"}
          </h2>
          <p className="text-[0.85rem] text-[#6B7280] text-center mt-1 leading-relaxed">
            {"Let them know you're having a hard time."}
          </p>

          {/* CTA */}
          <button
            type="button"
            className="
              flex items-center justify-center gap-2
              w-full h-12 mt-4
              bg-[#6C5CE7] rounded-xl
              text-white font-bold text-[0.95rem]
              active:scale-[0.97] transition-transform duration-200 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2
            "
          >
            <MessageCircle size={16} strokeWidth={2.5} />
            <span>{"Message Now"}</span>
          </button>

          <p className="text-[0.75rem] text-[#9CA3AF] text-center mt-2">
            {"This will send a notification."}
          </p>
        </div>
      </div>
    </div>
  )
}
