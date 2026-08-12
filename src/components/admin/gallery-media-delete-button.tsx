"use client";

import {
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type GalleryMediaDeleteButtonProps = {
  programId: number;
  mediaId: number;
};

export default function GalleryMediaDeleteButton({
  programId,
  mediaId,
}: GalleryMediaDeleteButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleDelete() {
    if (loading) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this media file?",
      );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      setLoading(true);

      const response =
        await fetch(
          `/api/admin/gallery/${programId}/media?mediaId=${mediaId}`,
          {
            method: "DELETE",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete media.",
        );
      }

      /*
       * Refresh server component
       * so counts and media list
       * update immediately.
       */

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete media.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-red-600 transition hover:border-red-300 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />

            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="h-3.5 w-3.5" />

            Delete Media
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}