"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Loader2,
  Pencil,
  Save,
  X,
} from "lucide-react";

type GalleryMediaEditButtonProps = {
  programId: number;
  mediaId: number;
  currentCaption: string | null;
};

export default function GalleryMediaEditButton({
  programId,
  mediaId,
  currentCaption,
}: GalleryMediaEditButtonProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [caption, setCaption] =
    useState(
      currentCaption || "",
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =====================================
   * OPEN MODAL
   * =====================================
   */

  function openModal() {
    if (loading) {
      return;
    }

    setCaption(
      currentCaption || "",
    );

    setError("");

    setOpen(true);
  }

  /*
   * =====================================
   * CLOSE MODAL
   * =====================================
   */

  function closeModal() {
    if (loading) {
      return;
    }

    setError("");

    setOpen(false);
  }

  /*
   * =====================================
   * UPDATE CAPTION
   * =====================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    try {
      setLoading(true);

      const response =
        await fetch(
          `/api/admin/gallery/${programId}/media`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              mediaId,

              caption:
                caption.trim(),
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update caption.",
        );
      }

      /*
       * IMPORTANT:
       *
       * Close modal first.
       * Then refresh server data.
       *
       * This prevents the visible
       * screen shake / layout jump.
       */

      setOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update caption.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ================================= */}
      {/* EDIT BUTTON */}
      {/* ================================= */}

      <button
        type="button"
        onClick={openModal}
        disabled={loading}
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-700 transition-colors duration-150 hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" />

        Edit Caption
      </button>

      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-[2px]">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* ============================= */}
            {/* HEADER */}
            {/* ============================= */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                  Gallery Media
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Edit Caption
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                aria-label="Close edit caption"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ============================= */}
            {/* FORM */}
            {/* ============================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 px-6 py-6"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor={`caption-${mediaId}`}
                    className="text-xs font-bold text-slate-700"
                  >
                    Caption
                  </label>

                  <span className="text-[10px] text-slate-400">
                    {caption.length}
                    /255
                  </span>
                </div>

                <textarea
                  id={`caption-${mediaId}`}
                  rows={4}
                  maxLength={255}
                  value={caption}
                  onChange={(
                    event,
                  ) =>
                    setCaption(
                      event.target
                        .value,
                    )
                  }
                  disabled={loading}
                  placeholder="Write a caption for this photo or video..."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Leave the caption
                  empty if you want
                  to remove the
                  existing caption.
                </p>
              </div>

              {/* ============================= */}
              {/* ERROR */}
              {/* ============================= */}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* ============================= */}
              {/* ACTIONS */}
              {/* ============================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    loading
                  }
                  className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold uppercase text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="inline-flex h-11 min-w-[155px] items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />

                      Save Caption
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}