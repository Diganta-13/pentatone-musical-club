import AboutSection from "@/components/home/about-section";
import HeroSection from "@/components/home/hero-section";
import NewsletterSection from "@/components/home/newsletter-section";
import UpcomingEvents from "@/components/home/upcoming-events";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <AboutSection />
        <UpcomingEvents />
        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}