import Navbar from "@/components/layout/navbar";
import EventsHero from "@/components/events/events-hero";
import FeaturedSpotlight from "@/components/events/featured-spotlight";
import EventCalendar from "@/components/events/event-calendar";
import MemoriesSection from "@/components/events/memories-section";

export default function EventsPage() {
  return (
    <>
      <Navbar />

      <main>
        <EventsHero />
        <FeaturedSpotlight />
        <EventCalendar />
        <MemoriesSection />
      </main>
    </>
  );
}