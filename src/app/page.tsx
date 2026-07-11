import Navbar from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        <section className="mx-auto flex min-h-[650px] max-w-[1180px] items-center justify-center px-5 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
              Sylhet Engineering College
            </p>

            <h1 className="mt-4 text-4xl font-bold text-gray-950 md:text-6xl">
              Pentatone Homepage
            </h1>

            <p className="mt-4 text-gray-600">
              Navbar complete. Hero section will be added next.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}