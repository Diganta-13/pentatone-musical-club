"use client";

import {
  CheckCircle2,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useState } from "react";

type MessageActionsProps = {
  messageId: number;

  status:
    | "UNREAD"
    | "READ";
};

export default function MessageActions({
  messageId,
  status,
}: MessageActionsProps) {
  const router =
    useRouter();

  const [updating, setUpdating] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =====================================
   * CHANGE STATUS
   * =====================================
   */

  async function handleStatusChange() {
    if (
      updating ||
      deleting
    ) {
      return;
    }

    setError("");

    const newStatus =
      status === "UNREAD"
        ? "READ"
        : "UNREAD";

    try {
      setUpdating(true);

      const response =
        await fetch(
          `/api/admin/messages/${messageId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status:
                newStatus,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update message.",
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update message.",
      );
    } finally {
      setUpdating(false);
    }
  }

  /*
   * =====================================
   * DELETE
   * =====================================
   */

  async function handleDelete() {
    if (
      updating ||
      deleting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this message? This action cannot be undone.",
      );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      setDeleting(true);

      const response =
        await fetch(
          `/api/admin/messages/${messageId}`,
          {
            method: "DELETE",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete message.",
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete message.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-2">

      <div className="flex flex-wrap items-center gap-2">

        {/* STATUS */}

        <button
          type="button"
          onClick={
            handleStatusChange
          }
          disabled={
            updating ||
            deleting
          }
          className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[10px] font-black uppercase tracking-[0.05em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
            status === "UNREAD"
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {updating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : status ===
            "UNREAD" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Mail className="h-3.5 w-3.5" />
          )}

          {updating
            ? "Updating"
            : status ===
                "UNREAD"
              ? "Mark Read"
              : "Mark Unread"}
        </button>

        {/* DELETE */}

        <button
          type="button"
          onClick={
            handleDelete
          }
          disabled={
            deleting ||
            updating
          }
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-[10px] font-black uppercase tracking-[0.05em] text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}

          {deleting
            ? "Deleting"
            : "Delete"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}