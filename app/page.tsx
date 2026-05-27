import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { LogoStrip } from "@/components/sections/logo-strip";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#f5f7f3]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <Features />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
