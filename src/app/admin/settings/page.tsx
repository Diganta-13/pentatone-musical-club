import { redirect } from "next/navigation";

import {
  Building2,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import AdminSettingsForm from "@/components/admin/admin-settings-form";

import { getCurrentUser } from "@/lib/current-user";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

/*
 * =====================================
 * ADMIN SETTINGS PAGE
 * =====================================
 */

export default async function AdminSettingsPage() {
  /*
   * =====================================
   * CURRENT ADMIN
   * =====================================
   */

  const user =
    await getCurrentUser();

  /*
   * Extra safety.
   * Admin layout already protects this
   * route, but we keep this here too.
   */

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  return (
    <main className="px-7 py-7 xl:px-10">

      <div className="mx-auto max-w-[1180px]">

        {/* ================================= */}
        {/* BREADCRUMB */}
        {/* ================================= */}

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">

          <span>
            Admin Portal
          </span>

          <span>
            /
          </span>

          <span className="text-red-600">
            Settings
          </span>

        </div>

        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <section className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Settings className="h-5 w-5" />
              </div>

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-red-600">
                  Administration
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-[34px]">
                  Settings
                </h1>

              </div>

            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Manage administrator profile
              information and account security
              settings for the Pentatone Musical
              Club portal.
            </p>

          </div>

        </section>

        {/* ================================= */}
        {/* QUICK SUMMARY */}
        {/* ================================= */}

        <section className="mt-8 grid gap-4 md:grid-cols-3">

          {/* CLUB */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Building2 className="h-5 w-5" />
              </div>

              <span className="rounded-full bg-green-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-green-700">
                Active
              </span>

            </div>

            <p className="mt-5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
              Club
            </p>

            <h2 className="mt-1 text-sm font-black text-slate-950">
              Pentatone Musical Club
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Sylhet Engineering College
            </p>

          </div>

          {/* ADMIN */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-slate-700">
                <UserRound className="h-5 w-5" />
              </div>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-red-600">
                Administrator
              </span>

            </div>

            <p className="mt-5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
              Signed In As
            </p>

            <h2 className="mt-1 text-sm font-black text-slate-950">
              {user.fullName}
            </h2>

            <p className="mt-2 truncate text-xs text-slate-500">
              {user.email}
            </p>

          </div>

          {/* SECURITY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <span className="rounded-full bg-green-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-green-700">
                Protected
              </span>

            </div>

            <p className="mt-5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
              Account Security
            </p>

            <h2 className="mt-1 text-sm font-black text-slate-950">
              Password Protection
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Change your password securely.
            </p>

          </div>

        </section>

        {/* ================================= */}
        {/* SETTINGS FORM */}
        {/* ================================= */}

        <section className="mt-7 pb-10">

          <AdminSettingsForm
            admin={{
              fullName:
                user.fullName,

              email:
                user.email,

              role:
                user.role,
            }}
          />

        </section>

      </div>

    </main>
  );
}