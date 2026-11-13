import type { Metadata } from 'next'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { FocusHero } from '@/components/public/FocusHero'
import { FocusThePractice } from '@/components/public/FocusThePractice'
import { FocusTheJourney } from '@/components/public/FocusTheJourney'
import { FocusReflection } from '@/components/public/FocusReflection'

export const metadata: Metadata = {
  title: 'TRACK — Focus Room',
  description:
    'Find your rhythm. Settle into focus with ambient sound, timed intervals, and a quiet space to do what matters.',
}

export default function FocusRoomPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#172536] text-[#F4EFE4]">
      <PublicNav current="focus-room" theme="ink" />

      <main className="flex-1 w-full">
        {/* 1. Hero Section */}
        <FocusHero />

        {/* 2. Section 01: The Practice */}
        <FocusThePractice />

        {/* 3. Section 02: The Journey */}
        <FocusTheJourney />

        {/* 4. Section 03: Reflection */}
        <FocusReflection />
      </main>

      <PublicFooter current="focus-room" />
    </div>
  )
}
