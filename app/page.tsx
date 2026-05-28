import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LogoStrip } from "@/components/sections/logo-strip";
import { StatsStrip } from "@/components/sections/stats-strip";
import { Testimonials } from "@/components/sections/testimonials";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#f5f7f3]">
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
