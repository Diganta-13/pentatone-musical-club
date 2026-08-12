"use client";

import {
  CalendarDays,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function GalleryProgramForm() {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [eventDate, setEventDate] =
    useState("");

  const [
    isPublished,
    setIsPublished,
  ] = useState(true);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEventDate("");
    setIsPublished(true);
    setError("");
  }

  function closeModal() {
    if (loading) return;

    resetForm();
    setOpen(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/admin/gallery/programs",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title,
              description,
              eventDate,
              isPublished,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create program.",
        );
      }

      resetForm();

      setOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create program.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-red-700"
      >
        <Plus className="h-4 w-4" />

        Create Program
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                  Gallery Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Create New Program
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6 px-7 py-7"
            >
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Program / Event
                  Title
                </label>

                <input
                  type="text"
                  required
                  maxLength={150}
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Example: CSE Fest 2026"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Event Date
                </label>

                <div className="relative mt-2">
                  <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={eventDate}
                    onChange={(event) =>
                      setEventDate(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={5}
                  maxLength={3000}
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Short description about this program..."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Published */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    isPublished
                  }
                  onChange={(event) =>
                    setIsPublished(
                      event.target
                        .checked,
                    )
                  }
                  className="mt-1 h-4 w-4 accent-red-600"
                />

                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    Publish program
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Published
                    programs can
                    later appear on
                    the public
                    Gallery page.
                  </span>
                </span>
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    loading
                  }
                  className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />

                      Create Program
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