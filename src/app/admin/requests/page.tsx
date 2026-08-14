import Link from "next/link";

import type { RowDataPacket } from "mysql2";

import { ExternalLink, FileCheck2 } from "lucide-react";

import MembershipActions from "@/components/admin/membership-actions";

import db from "@/lib/db";

interface RequestRow extends RowDataPacket {
  id: number;

  full_name: string;
  email: string;

  student_id: string;

  department: string;
  short_name: string;

  session: string;
  current_semester: string;

  phone: string;

  primary_skill: string;

  proof_type: string;
  proof_url: string;

  status: "PENDING" | "APPROVED" | "REJECTED";

  admin_note: string | null;

  created_at: Date;
}

export default async function MembershipRequestsPage() {
  const [requests] = await db.execute<RequestRow[]>(
    `
        SELECT
          mr.id,

          u.full_name,
          u.email,

          mr.student_id,

          d.name AS department,
          d.short_name,

          mr.session,
          mr.current_semester,
          mr.phone,

          mr.primary_skill,

          mr.proof_type,
          mr.proof_url,

          mr.status,
          mr.admin_note,

          mr.created_at

        FROM membership_requests mr

        INNER JOIN users u
          ON u.id = mr.user_id

        INNER JOIN departments d
          ON d.id = mr.department_id

        ORDER BY
          CASE
            WHEN mr.status = 'PENDING'
            THEN 0
            ELSE 1
          END,

          mr.created_at DESC
      `,
  );

  return (
    <main className="px-7 py-8 xl:px-10">
      <div className="mx-auto max-w-[1450px]">
        {/* Heading */}

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
            Membership Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Member Requests
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review student information and verification documents before
            approving club membership.
          </p>
        </div>

        {/* Card */}

        <section className="mt-8 overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-red-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Membership Applications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {requests.length} application
                {requests.length === 1 ? "" : "s"}
              </p>
            </div>

            <Link
              href="/admin"
              className="text-xs font-bold uppercase tracking-wider text-red-600"
            >
              Dashboard
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <FileCheck2 className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-4 font-bold text-slate-900">
                No membership requests
              </p>
            </div>
          ) : (
            <div className="divide-y divide-red-100">
              {requests.map((item) => (
                <article key={item.id} className="p-6">
                  <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                    {/* Applicant */}

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-950">
                          {item.full_name}
                        </h3>

                        <StatusBadge status={item.status} />
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.email}
                      </p>
                    </div>

                    {item.status === "PENDING" && (
                      <MembershipActions requestId={item.id} />
                    )}
                  </div>

                  {/* Details */}

                  <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Detail label="Student ID" value={item.student_id} />

                    <Detail
                      label="Department"
                      value={`${item.department} (${item.short_name})`}
                    />

                    <Detail label="Session" value={item.session} />

                    <Detail label="Semester" value={item.current_semester} />

                    <Detail label="Phone" value={item.phone} />

                    <Detail label="Musical Skill" value={item.primary_skill} />

                    <Detail
                      label="Proof Type"
                      value={item.proof_type.replaceAll("_", " ")}
                    />

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Verification Document
                      </p>

                      <Link
                        href={`/api/admin/membership-proof/${item.id}`}
                        target="_blank"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:underline"
                      >
                        View Proof
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {item.admin_note && (
                    <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Admin Note
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {item.admin_note}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "PENDING" | "APPROVED" | "REJECTED";
}) {
  const styles = {
    PENDING: "border-amber-300 bg-amber-50 text-amber-700",

    APPROVED: "border-green-300 bg-green-50 text-green-700",

    REJECTED: "border-red-300 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}
