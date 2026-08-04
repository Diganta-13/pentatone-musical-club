import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AuditionApplicationForm from "@/components/auditions/audition-application-form";

export default function AuditionApplicationPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8fc] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="inline-block bg-[#d40000] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
              Fall 2026 Intake
            </p>

            <h1 className="mt-6 text-4xl font-bold text-[#101828] sm:text-5xl">
              Audition Application
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Complete the application form to participate in the Pentatone
              Musical Club audition.
            </p>
          </div>

          <div className="mt-12">
            <AuditionApplicationForm />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}