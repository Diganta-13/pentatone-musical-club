import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import AboutHero from "@/components/about/about-hero";
import OurJourney from "@/components/about/our-journey";
import MissionVision from "@/components/about/mission-vision";
import WhatWeDo from "@/components/about/what-we-do";
import AboutCTA from "@/components/about/about-cta";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <AboutHero />
        <OurJourney />
        <MissionVision />
        <WhatWeDo />
        <AboutCTA />
      </main>

      <Footer />
    </>
  );
}