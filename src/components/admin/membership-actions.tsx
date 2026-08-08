"use client";

import {
  Check,
  Loader2,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MembershipActionsProps = {
  requestId: number;
  compact?: boolean;
};

export default function MembershipActions({
  requestId,
  compact = false,
}: MembershipActionsProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState<
      "APPROVE" | "REJECT" | null
    >(null);

  const [rejectOpen, setRejectOpen] =
    useState(false);

  const [note, setNote] =
    useState("");

  const [error, setError] =
    useState("");

  async function updateRequest(
    action:
      | "APPROVE"
      | "REJECT",
    adminNote?: string,
  ) {
    setError("");
    setLoading(action);

    try {
      const response = await fetch(
        `/api/admin/membership/${requestId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action,
            note: adminNote,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update application.",
        );
      }

      setRejectOpen(false);
      setNote("");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(null);
    }
  }

  function approve() {
    const confirmed =
      window.confirm(
        "Approve this membership application?",
      );

    if (!confirmed) return;

    void updateRequest(
      "APPROVE",
    );
  }

  function reject() {
    if (note.trim().length < 3) {
      setError(
        "Please provide a short rejection reason.",
      );

      return;
    }

    void updateRequest(
      "REJECT",
      note.trim(),
    );
  }

  return (
    <>
      {compact ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={approve}
            disabled={loading !== null}
            title="Approve"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-[#d90000] text-white transition hover:bg-[#b90000] disabled:opacity-50"
          >
            {loading ===
            "APPROVE" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setRejectOpen(true);
            }}
            disabled={loading !== null}
            title="Reject"
            className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-slate-900 bg-white text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={approve}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-md bg-[#d90000] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#b90000] disabled:opacity-50"
          >
            {loading ===
            "APPROVE" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}

            Approve
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setRejectOpen(true);
            }}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-md border-2 border-slate-900 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 transition hover:bg-slate-900 hover:text-white"
          >
            <X className="h-4 w-4" />

            Reject
          </button>
        </div>
      )}

      {error && !rejectOpen && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Reject modal */}

      {rejectOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-5">
          <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">
              Membership Review
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              Reject Application
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Give the applicant a clear
              reason so they can correct
              the information and apply
              again.
            </p>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value,
                )
              }
              rows={5}
              maxLength={1000}
              placeholder="Example: Student ID document is unclear."
              className="mt-5 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            {error && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectOpen(false);
                  setError("");
                }}
                disabled={loading !== null}
                className="rounded-md border border-slate-300 px-5 py-2.5 text-xs font-bold uppercase text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={reject}
                disabled={
                  loading !== null
                }
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 text-xs font-bold uppercase text-white disabled:opacity-50"
              >
                {loading ===
                "REJECT" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}

                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}