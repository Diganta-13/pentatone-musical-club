import {
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import ResetPasswordForm from "@/components/auth/reset-password-form";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata = {
  title:
    "Reset Password | Pentatone Musical Club",

  description:
    "Create a new password for your Pentatone Musical Club account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params =
    await searchParams;

  const token =
    typeof params.token ===
    "string"
      ? params.token
      : "";

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] bg-[#f8f8fc]">

        <section className="mx-auto grid min-h-[650px] max-w-[1180px] items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">

          {/* LEFT */}

          <div className="hidden lg:block">

            <span className="inline-flex rounded-full bg-red-50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-[#d40000]">
              Secure Account Recovery
            </span>

            <h2 className="mt-6 max-w-lg text-5xl font-black leading-[1.05] tracking-[-0.04em] text-[#111827]">

              Create Your New{" "}

              <span className="text-[#d40000]">
                Password.
              </span>

            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
              Choose a secure new
              password for your
              Pentatone Musical Club
              account.
            </p>

            <div className="mt-9 space-y-5">

              <Feature
                icon={
                  <ShieldCheck />
                }
                title="Secure Reset"
                description="Your password reset request is verified using a secure one-time token."
              />

              <Feature
                icon={
                  <KeyRound />
                }
                title="One-Time Link"
                description="After your password is changed, the reset link can no longer be used."
              />

              <Feature
                icon={
                  <LockKeyhole />
                }
                title="Encrypted Password"
                description="Your new password is securely hashed before being stored."
              />

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex justify-center lg:justify-end">

            <ResetPasswordForm
              token={token}
            />

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;

  title: string;

  description: string;
}) {
  return (
    <div className="flex max-w-lg gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#d40000] shadow-sm [&>svg]:h-5 [&>svg]:w-5">

        {icon}

      </div>

      <div>

        <h3 className="text-sm font-black text-[#111827]">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}