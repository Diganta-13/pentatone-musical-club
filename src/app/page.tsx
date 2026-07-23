import HeroSection from "@/components/home/hero-section";
import Navbar from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="bg-white">
        <HeroSection />
      </main>
    </>
  );
}