"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CalendarDays,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";

type GalleryProgramActionsProps = {
  programId: number;

  title: string;

  description:
    | string
    | null;

  eventDate: string;

  isPublished: boolean;
};

export default function GalleryProgramActions({
  programId,
  title,
  description,
  eventDate,
  isPublished,
}: GalleryProgramActionsProps) {
  const router =
    useRouter();

  /*
   * =====================================
   * MODAL
   * =====================================
   */

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  /*
   * =====================================
   * FORM STATE
   * =====================================
   */

  const [
    editTitle,
    setEditTitle,
  ] = useState(title);

  const [
    editDescription,
    setEditDescription,
  ] = useState(
    description || "",
  );

  const [
    editEventDate,
    setEditEventDate,
  ] = useState(
    eventDate,
  );

  const [
    editPublished,
    setEditPublished,
  ] = useState(
    isPublished,
  );

  /*
   * =====================================
   * REQUEST STATE
   * =====================================
   */

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
   * =====================================
   * OPEN EDIT MODAL
   * =====================================
   */

  function openEditModal() {
    if (
      saving ||
      deleting
    ) {
      return;
    }

    /*
     * Reset form to latest
     * server values whenever
     * the modal opens.
     */

    setEditTitle(
      title,
    );

    setEditDescription(
      description || "",
    );

    setEditEventDate(
      eventDate,
    );

    setEditPublished(
      isPublished,
    );

    setError("");
    setSuccess("");

    setEditOpen(true);
  }

  /*
   * =====================================
   * CLOSE EDIT MODAL
   * =====================================
   */

  function closeEditModal() {
    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    setEditOpen(false);
  }

  /*
   * =====================================
   * UPDATE PROGRAM
   * =====================================
   */

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    /*
     * Basic client validation
     */

    if (
      editTitle
        .trim()
        .length < 3
    ) {
      setError(
        "Program title must be at least 3 characters.",
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `/api/admin/gallery/programs/${programId}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title:
                  editTitle.trim(),

                description:
                  editDescription.trim(),

                eventDate:
                  editEventDate,

                isPublished:
                  editPublished,
              }),
          },
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
            "Unable to update gallery program.",
        );
      }

      setSuccess(
        data.message ||
          "Gallery program updated successfully.",
      );

      /*
       * Refresh server component
       * so title, date, status and
       * description update.
       */

      router.refresh();

      /*
       * Give the user a short visual
       * success state before closing.
       */

      window.setTimeout(
        () => {
          setEditOpen(
            false,
          );

          setSuccess(
            "",
          );
        },
        500,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update gallery program.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =====================================
   * DELETE PROGRAM
   * =====================================
   */

  async function handleDelete() {
    if (
      deleting ||
      saving
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${title}"?\n\nThis will permanently delete this gallery program and all photos/videos inside it.`,
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setDeleting(true);

      const response =
        await fetch(
          `/api/admin/gallery/programs/${programId}`,
          {
            method:
              "DELETE",
          },
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
            "Unable to delete gallery program.",
        );
      }

      /*
       * Return to gallery list.
       */

      router.push(
        "/admin/gallery",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete gallery program.",
      );

      setDeleting(
        false,
      );
    }
  }

  return (
    <>
      {/* ================================= */}
      {/* ACTION BUTTONS */}
      {/* ================================= */}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={
            openEditModal
          }
          disabled={
            deleting
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-[11px] font-bold uppercase tracking-[0.07em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" />

          Edit Program
        </button>

        <button
          type="button"
          onClick={
            handleDelete
          }
          disabled={
            deleting ||
            saving
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 text-[11px] font-bold uppercase tracking-[0.07em] text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />

              Delete Program
            </>
          )}
        </button>
      </div>

      {/* ================================= */}
      {/* DELETE ERROR */}
      {/* ================================= */}

      {!editOpen &&
        error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

      {/* ================================= */}
      {/* EDIT MODAL */}
      {/* ================================= */}

      {editOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ============================= */}
            {/* MODAL HEADER */}
            {/* ============================= */}

            <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                  Gallery Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Edit Program
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEditModal
                }
                disabled={
                  saving
                }
                aria-label="Close edit program"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ============================= */}
            {/* EDIT FORM */}
            {/* ============================= */}

            <form
              onSubmit={
                handleUpdate
              }
              className="space-y-6 px-7 py-7"
            >
              {/* TITLE */}

              <div>
                <label
                  htmlFor="gallery-edit-title"
                  className="text-xs font-bold text-slate-700"
                >
                  Program / Event Title
                </label>

                <input
                  id="gallery-edit-title"
                  type="text"
                  required
                  maxLength={
                    150
                  }
                  value={
                    editTitle
                  }
                  onChange={(
                    event,
                  ) =>
                    setEditTitle(
                      event
                        .target
                        .value,
                    )
                  }
                  disabled={
                    saving
                  }
                  placeholder="Example: CSE Fest 2026"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                />
              </div>

              {/* EVENT DATE */}

              <div>
                <label
                  htmlFor="gallery-edit-date"
                  className="text-xs font-bold text-slate-700"
                >
                  Event Date
                </label>

                <div className="relative mt-2">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="gallery-edit-date"
                    type="date"
                    value={
                      editEventDate
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditEventDate(
                        event
                          .target
                          .value,
                      )
                    }
                    disabled={
                      saving
                    }
                    className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="gallery-edit-description"
                    className="text-xs font-bold text-slate-700"
                  >
                    Description
                  </label>

                  <span className="text-[10px] text-slate-400">
                    {
                      editDescription.length
                    }
                    /3000
                  </span>
                </div>

                <textarea
                  id="gallery-edit-description"
                  rows={5}
                  maxLength={
                    3000
                  }
                  value={
                    editDescription
                  }
                  onChange={(
                    event,
                  ) =>
                    setEditDescription(
                      event
                        .target
                        .value,
                    )
                  }
                  disabled={
                    saving
                  }
                  placeholder="Short description about this program..."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                />
              </div>

              {/* PUBLISH */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    editPublished
                  }
                  onChange={(
                    event,
                  ) =>
                    setEditPublished(
                      event
                        .target
                        .checked,
                    )
                  }
                  disabled={
                    saving
                  }
                  className="mt-1 h-4 w-4 accent-red-600"
                />

                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    Publish program
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Turn this
                    off to keep
                    the program
                    as a draft.
                  </span>
                </span>
              </label>

              {/* ERROR */}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {success}
                </div>
              )}

              {/* ============================= */}
              {/* ACTIONS */}
              {/* ============================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    saving
                  }
                  className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />

                      Save Changes
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