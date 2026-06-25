import { Sidebar } from "@/src/dashboard/view/sidebar"
import { toDashboardHeader } from "@/src/dashboard/model/dashboard"
import { getOnboardingProfile } from "@/src/dashboard/data/getOnboardingProfile"
import { TestsHubLoader } from "@/src/tests/view/loaders"

export default async function TestsPage() {
  const profile = await getOnboardingProfile()
  const header = toDashboardHeader(profile)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar header={header} active="tests" />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 sm:px-8">
          <TestsHubLoader />
        </main>
      </div>
    </div>
  )
}
