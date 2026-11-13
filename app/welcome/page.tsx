import type { Metadata } from 'next'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { HomeHero } from '@/components/public/HomeHero'
import { SectionTheIdea } from '@/components/public/SectionTheIdea'
import { SectionToolsForNoticing } from '@/components/public/SectionToolsForNoticing'
import { SectionTheLongView } from '@/components/public/SectionTheLongView'
import { SectionNoteForRoad } from '@/components/public/SectionNoteForRoad'
import { SectionNextPageIsYours } from '@/components/public/SectionNextPageIsYours'

export const metadata: Metadata = {
  title: 'TRACK — Atlas of Everyday',
  description:
    'A quieter space to track your days, notice your progress, and build habits that last. Make Every Day Count.',
}

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE4]">
      <PublicNav current="home" theme="chalk" />

      <main className="flex-1 w-full">
        {/* 1. Hero Section */}
        <HomeHero />

        {/* 2. Section 01: The Idea */}
        <SectionTheIdea />

        {/* 3. Section 02: Tools for Noticing */}
        <SectionToolsForNoticing />

        {/* 4. Section 03: The Long View */}
        <SectionTheLongView />

        {/* 5. Section 04: A Note for the Road */}
        <SectionNoteForRoad />

        {/* 6. Section 05: The Next Page Is Yours */}
        <SectionNextPageIsYours />
      </main>

      <PublicFooter current="home" />
    </div>
  )
}
