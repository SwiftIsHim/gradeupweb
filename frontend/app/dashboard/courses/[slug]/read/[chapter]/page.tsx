import { notFound } from "next/navigation"

import { Sidebar } from "@/src/dashboard/view/sidebar"
import { toDashboardHeader } from "@/src/dashboard/model/dashboard"
import { getOnboardingProfile } from "@/src/dashboard/data/getOnboardingProfile"
import { ChapterLoader } from "@/src/courses/view/loaders"

export default async function ChapterReadPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>
}) {
  const { slug, chapter } = await params
  const chapterNumber = Number(chapter)
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    notFound()
  }

  const profile = await getOnboardingProfile()
  const header = toDashboardHeader(profile)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar header={header} active="courses" />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 sm:px-8">
          <ChapterLoader slug={slug} chapterNumber={chapterNumber} />
        </main>
      </div>
    </div>
  )
}
