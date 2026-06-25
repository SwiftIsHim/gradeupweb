import { CoursesLoader } from "@/src/courses/view/loaders";
import { Sidebar } from "@/src/dashboard/view/sidebar";
import { toDashboardHeader } from "@/src/dashboard/model/dashboard";
import { getOnboardingProfile } from "@/src/dashboard/data/getOnboardingProfile";

export default async function CoursesPage() {
  const profile = await getOnboardingProfile();
  const header = toDashboardHeader(profile);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar header={header} active="courses" />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 sm:px-8">
          <CoursesLoader />
        </main>
      </div>
    </div>
  );
}
