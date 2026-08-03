import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import AuditionsHero from "@/components/auditions/auditions-hero";
import TalentCategories from "@/components/auditions/talent-categories";
import AuditionProcess from "@/components/auditions/audition-process";
import AuditionDetails from "@/components/auditions/audition-details";
import AuditionGallery from "@/components/auditions/audition-gallery";
import AuditionsCTA from "@/components/auditions/auditions-cta";

export default function AuditionsPage() {
  return (
    <>
      <Navbar />

      <main>
        <AuditionsHero />
        <TalentCategories />
        <AuditionProcess />
        <AuditionDetails />
        <AuditionGallery />
        <AuditionsCTA />
      </main>

      <Footer />
    </>
  );
}