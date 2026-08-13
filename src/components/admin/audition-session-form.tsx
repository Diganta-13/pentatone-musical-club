"use client";

import {
  CalendarDays,
  Clock3,
  ImageIcon,
  Loader2,
  MapPin,
  Mic2,
  Plus,
  Save,
  UploadCloud,
  X,
} from "lucide-react";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

/*
 * =====================================
 * CONSTANTS
 * =====================================
 */

const MAX_COVER_SIZE =
  10 * 1024 * 1024;

const allowedCoverTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type SessionStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "COMPLETED";

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function AuditionSessionForm() {
  const router =
    useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  /*
   * =====================================
   * MODAL
   * =====================================
   */

  const [open, setOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /*
   * =====================================
   * FORM
   * =====================================
   */

  const [title, setTitle] =
    useState("");

  const [
    shortDescription,
    setShortDescription,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    requirements,
    setRequirements,
  ] = useState("");

  const [
    auditionDate,
    setAuditionDate,
  ] = useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    endTime,
    setEndTime,
  ] = useState("");

  const [
    applicationDeadline,
    setApplicationDeadline,
  ] = useState("");

  const [venue, setVenue] =
    useState("");

  const [status, setStatus] =
    useState<SessionStatus>(
      "DRAFT",
    );

  const [
    isPublished,
    setIsPublished,
  ] = useState(false);

  /*
   * =====================================
   * COVER
   * =====================================
   */

  const [
    coverImage,
    setCoverImage,
  ] = useState<File | null>(
    null,
  );

  const [
    coverPreview,
    setCoverPreview,
  ] = useState("");

  /*
   * =====================================
   * SCROLL LOCK
   * =====================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    const previousPaddingRight =
      document.body.style
        .paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    document.body.style.overflow =
      "hidden";

    if (
      scrollbarWidth > 0
    ) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
        !saving
      ) {
        closeModal();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;

      document.body.style.paddingRight =
        previousPaddingRight;
    };
  }, [open, saving]);

  /*
   * =====================================
   * BLOB CLEANUP
   * =====================================
   */

  useEffect(() => {
    return () => {
      if (
        coverPreview
      ) {
        URL.revokeObjectURL(
          coverPreview,
        );
      }
    };
  }, [coverPreview]);

  /*
   * =====================================
   * SAFE RESPONSE
   * =====================================
   */

  async function readResponse(
    response: Response,
  ) {
    const text =
      await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(
        text,
      );
    } catch {
      throw new Error(
        `Server returned an unexpected response (${response.status}).`,
      );
    }
  }

  /*
   * =====================================
   * RESET
   * =====================================
   */

  function resetForm() {
    setTitle("");

    setShortDescription("");

    setDescription("");

    setRequirements("");

    setAuditionDate("");

    setStartTime("");

    setEndTime("");

    setApplicationDeadline("");

    setVenue("");

    setStatus(
      "DRAFT",
    );

    setIsPublished(false);

    setError("");

    if (
      coverPreview
    ) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    setCoverPreview("");

    setCoverImage(null);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /*
   * =====================================
   * OPEN
   * =====================================
   */

  function openModal() {
    setError("");

    setOpen(true);
  }

  /*
   * =====================================
   * CLOSE
   * =====================================
   */

  function closeModal() {
    if (saving) {
      return;
    }

    setOpen(false);

    setError("");
  }

  /*
   * =====================================
   * COVER
   * =====================================
   */

  function handleCoverChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    setError("");

    if (!file) {
      return;
    }

    if (
      !allowedCoverTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Cover image must be JPG, PNG, WEBP or GIF.",
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_COVER_SIZE
    ) {
      setError(
        "Cover image cannot exceed 10 MB.",
      );

      event.target.value =
        "";

      return;
    }

    if (
      coverPreview
    ) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    const preview =
      URL.createObjectURL(
        file,
      );

    setCoverImage(file);

    setCoverPreview(
      preview,
    );
  }

  function removeCover() {
    if (
      coverPreview
    ) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    setCoverImage(null);

    setCoverPreview("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /*
   * =====================================
   * SUBMIT
   * =====================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");

    /*
     * TITLE
     */

    if (
      title.trim().length <
      3
    ) {
      setError(
        "Session title must be at least 3 characters.",
      );

      return;
    }

    /*
     * DATE
     */

    if (
      !auditionDate
    ) {
      setError(
        "Please select an audition date.",
      );

      return;
    }

    /*
     * TIME
     */

    if (
      startTime &&
      endTime &&
      endTime <=
        startTime
    ) {
      setError(
        "End time must be later than start time.",
      );

      return;
    }

    /*
     * DEADLINE
     */

    if (
      applicationDeadline
    ) {
      const auditionStart =
        `${auditionDate}T${
          startTime ||
          "23:59"
        }`;

      if (
        applicationDeadline >
        auditionStart
      ) {
        setError(
          "Application deadline cannot be after the audition starts.",
        );

        return;
      }
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim(),
      );

      formData.append(
        "shortDescription",
        shortDescription.trim(),
      );

      formData.append(
        "description",
        description.trim(),
      );

      formData.append(
        "requirements",
        requirements.trim(),
      );

      formData.append(
        "auditionDate",
        auditionDate,
      );

      formData.append(
        "startTime",
        startTime,
      );

      formData.append(
        "endTime",
        endTime,
      );

      formData.append(
        "applicationDeadline",
        applicationDeadline,
      );

      formData.append(
        "venue",
        venue.trim(),
      );

      formData.append(
        "status",
        status,
      );

      formData.append(
        "isPublished",
        String(
          isPublished,
        ),
      );

      if (
        coverImage
      ) {
        formData.append(
          "coverImage",
          coverImage,
        );
      }

      const response =
        await fetch(
          "/api/admin/auditions/sessions",
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
            "Unable to create audition session.",
        );
      }

      resetForm();

      setOpen(false);

      setSuccessMessage(
        "Audition session created successfully.",
      );

      router.refresh();

      window.setTimeout(
        () => {
          setSuccessMessage(
            "",
          );
        },
        2500,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create audition session.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <>
      {/* ================================= */}
      {/* TRIGGER */}
      {/* ================================= */}

      <button
        type="button"
        onClick={
          openModal
        }
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-[10px] font-bold uppercase tracking-[0.07em] text-white shadow-[0_10px_25px_rgba(212,0,0,0.18)] transition hover:bg-[#b80000]"
      >
        <Plus className="h-4 w-4" />

        New Audition Session
      </button>

      {/* ================================= */}
      {/* SUCCESS TOAST */}
      {/* ================================= */}

      {successMessage && (
        <div className="fixed right-6 top-6 z-[220] rounded-xl border border-green-200 bg-white px-5 py-4 shadow-xl">
          <p className="text-xs font-bold text-green-700">
            {
              successMessage
            }
          </p>
        </div>
      )}

      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Audition Session"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
        >
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                  Audition Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Create New Audition Session
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ================================= */}
            {/* FORM */}
            {/* ================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-7 px-6 py-7 sm:px-7"
            >
              {/* ================================= */}
              {/* BASIC */}
              {/* ================================= */}

              <section>
                <SectionHeading
                  title="Basic Information"
                  description="Create the public information for this audition session."
                />

                <div className="mt-5 space-y-5">
                  {/* TITLE */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Session Title{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={180}
                      value={
                        title
                      }
                      onChange={(
                        event,
                      ) =>
                        setTitle(
                          event
                            .target
                            .value,
                        )
                      }
                      disabled={
                        saving
                      }
                      placeholder="Example: Pentatone Fall Audition 2026"
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* SHORT */}

                  <div>
                    <div className="flex justify-between gap-3">
                      <label className="text-xs font-bold text-slate-700">
                        Short Description
                      </label>

                      <span className="text-[10px] text-slate-400">
                        {
                          shortDescription.length
                        }
                        /500
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      maxLength={500}
                      value={
                        shortDescription
                      }
                      onChange={(
                        event,
                      ) =>
                        setShortDescription(
                          event
                            .target
                            .value,
                        )
                      }
                      disabled={
                        saving
                      }
                      placeholder="Short summary shown on public audition cards..."
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* FULL */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Full Description
                    </label>

                    <textarea
                      rows={5}
                      maxLength={10000}
                      value={
                        description
                      }
                      onChange={(
                        event,
                      ) =>
                        setDescription(
                          event
                            .target
                            .value,
                        )
                      }
                      disabled={
                        saving
                      }
                      placeholder="Describe the audition session..."
                      className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* REQUIREMENTS */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Audition Requirements
                    </label>

                    <textarea
                      rows={5}
                      maxLength={10000}
                      value={
                        requirements
                      }
                      onChange={(
                        event,
                      ) =>
                        setRequirements(
                          event
                            .target
                            .value,
                        )
                      }
                      disabled={
                        saving
                      }
                      placeholder="Example: Prepare one song, bring your own instrument if required..."
                      className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
              </section>

              {/* ================================= */}
              {/* SCHEDULE */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">
                <SectionHeading
                  title="Schedule"
                  description="Set the audition date, time and application deadline."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  {/* DATE */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Audition Date{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <div className="relative mt-2">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="date"
                        required
                        value={
                          auditionDate
                        }
                        onChange={(
                          event,
                        ) =>
                          setAuditionDate(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          saving
                        }
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* START */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Start Time
                    </label>

                    <div className="relative mt-2">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="time"
                        value={
                          startTime
                        }
                        onChange={(
                          event,
                        ) =>
                          setStartTime(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          saving
                        }
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* END */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      End Time
                    </label>

                    <div className="relative mt-2">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="time"
                        value={
                          endTime
                        }
                        onChange={(
                          event,
                        ) =>
                          setEndTime(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          saving
                        }
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* DEADLINE */}

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Application Deadline
                    </label>

                    <input
                      type="datetime-local"
                      value={
                        applicationDeadline
                      }
                      onChange={(
                        event,
                      ) =>
                        setApplicationDeadline(
                          event
                            .target
                            .value,
                        )
                      }
                      disabled={
                        saving
                      }
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* VENUE */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Venue
                    </label>

                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="text"
                        maxLength={255}
                        value={
                          venue
                        }
                        onChange={(
                          event,
                        ) =>
                          setVenue(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          saving
                        }
                        placeholder="SEC Auditorium"
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ================================= */}
              {/* COVER */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">
                <SectionHeading
                  title="Cover Image"
                  description="Optional image for the public audition page."
                />

                <div className="mt-5">
                  {coverPreview ? (
                    <>
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#101828]">
                        <div className="relative aspect-[16/7]">
                          <img
                            src={
                              coverPreview
                            }
                            alt="Audition session cover preview"
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold text-white">
                            <ImageIcon className="h-3.5 w-3.5" />

                            New Cover
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-4">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-red-600">
                          <UploadCloud className="h-4 w-4" />

                          Change Cover

                          <input
                            ref={
                              fileInputRef
                            }
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={
                              handleCoverChange
                            }
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={
                            removeCover
                          }
                          className="text-xs font-bold text-slate-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#f8f9fd] px-6 py-10 text-center transition hover:border-red-300">
                      <UploadCloud className="h-6 w-6 text-red-600" />

                      <p className="mt-3 text-sm font-bold text-slate-800">
                        Choose Cover Image
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        JPG, PNG, WEBP or GIF. Maximum 10 MB.
                      </p>

                      <input
                        ref={
                          fileInputRef
                        }
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={
                          handleCoverChange
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </section>

              {/* ================================= */}
              {/* STATUS */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">
                <SectionHeading
                  title="Session Status"
                  description="Control whether applications are open and whether the session is publicly visible."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {/* STATUS */}

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Status
                    </label>

                    <select
                      value={
                        status
                      }
                      onChange={(
                        event,
                      ) =>
                        setStatus(
                          event
                            .target
                            .value as SessionStatus,
                        )
                      }
                      disabled={
                        saving
                      }
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="DRAFT">
                        Draft
                      </option>

                      <option value="OPEN">
                        Open for Applications
                      </option>

                      <option value="CLOSED">
                        Applications Closed
                      </option>

                      <option value="COMPLETED">
                        Completed
                      </option>
                    </select>
                  </div>

                  {/* PUBLISH */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-[#f8f9fd] p-4">
                    <input
                      type="checkbox"
                      checked={
                        isPublished
                      }
                      onChange={(
                        event,
                      ) =>
                        setIsPublished(
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
                        Publish Session
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Published sessions can appear on the public Auditions page.
                      </span>
                    </span>
                  </label>
                </div>

                {status ===
                  "OPEN" &&
                  !isPublished && (
                    <p className="mt-3 text-xs text-amber-600">
                      The session is open, but users will not see it publicly until Publish Session is enabled.
                    </p>
                  )}
              </section>

              {/* ================================= */}
              {/* ERROR */}
              {/* ================================= */}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* ================================= */}
              {/* ACTIONS */}
              {/* ================================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                  className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-xs font-bold uppercase tracking-[0.05em] text-white transition hover:bg-[#b80000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />

                      Create Session
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

/*
 * =====================================
 * SECTION HEADING
 * =====================================
 */

function SectionHeading({
  title,
  description,
}: {
  title: string;

  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Mic2 className="h-4 w-4 text-red-600" />

        <h3 className="text-sm font-black text-slate-900">
          {title}
        </h3>
      </div>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}