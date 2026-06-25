import { Footer } from "@/src/landing-page/view/footer";
import { Navbar } from "@/src/landing-page/view/navbar";
import { CtaBanner } from "@/src/landing-page/view/cta-banner";
import { Features } from "@/src/landing-page/view/features";
import { Hero } from "@/src/landing-page/view/hero";
import { HowItWorks } from "@/src/landing-page/view/how-it-works";
import { LogoStrip } from "@/src/landing-page/view/logo-strip";
import { StatsStrip } from "@/src/landing-page/view/stats-strip";
import { Testimonials } from "@/src/landing-page/view/testimonials";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#f5f7f3] dark:bg-neutral-950">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <Features />
        <HowItWorks />
        <Testimonials />
        <StatsStrip />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
