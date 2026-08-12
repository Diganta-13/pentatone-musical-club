import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import GalleryHero from "@/components/gallery/gallery-hero";
import FeaturedMoments from "@/components/gallery/featured-moments";
import ArchiveGallery from "@/components/gallery/archive-gallery";
import VideoMoments from "@/components/gallery/video-moments";
import DynamicGalleryPrograms from "@/components/gallery/dynamic-gallery-programs";
import GalleryCTA from "@/components/gallery/gallery-cta";

export default function GalleryPage() {
  return (
    <>
      <Navbar />

      <main>
        <GalleryHero />

        {/* ================================= */}
        {/* ADMIN CONTROLLED PROGRAMS */}
        {/* ================================= */}

        <DynamicGalleryPrograms />

        {/* ================================= */}
        {/* EXISTING STATIC CONTENT */}
        {/* ================================= */}

        <FeaturedMoments />

        <ArchiveGallery />

        <VideoMoments />

        <GalleryCTA />
      </main>

      <Footer />
    </>
  );
}