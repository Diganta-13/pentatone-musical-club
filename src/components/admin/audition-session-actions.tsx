"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import type {
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

/*
 * =====================================
 * TYPES
 * =====================================
 */

type SessionStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "COMPLETED";

export type AuditionSessionActionData = {
  id: number;

  title: string;

  shortDescription: string;

  description: string;

  requirements: string;

  auditionDate: string;

  startTime: string;

  endTime: string;

  applicationDeadline: string;

  venue: string;

  coverImage: string | null;

  status: SessionStatus;

  isPublished: boolean;
};

type Props = {
  session: AuditionSessionActionData;
};

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

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function AuditionSessionActions({
  session,
}: Props) {
  const router =
    useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  /*
   * =====================================
   * MODAL STATE
   * =====================================
   */

  const [open, setOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    quickUpdating,
    setQuickUpdating,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =====================================
   * FORM STATE
   * =====================================
   */

  const [title, setTitle] =
    useState(session.title);

  const [
    shortDescription,
    setShortDescription,
  ] = useState(
    session.shortDescription,
  );

  const [
    description,
    setDescription,
  ] = useState(
    session.description,
  );

  const [
    requirements,
    setRequirements,
  ] = useState(
    session.requirements,
  );

  const [
    auditionDate,
    setAuditionDate,
  ] = useState(
    session.auditionDate,
  );

  const [
    startTime,
    setStartTime,
  ] = useState(
    session.startTime,
  );

  const [
    endTime,
    setEndTime,
  ] = useState(
    session.endTime,
  );

  const [
    applicationDeadline,
    setApplicationDeadline,
  ] = useState(
    session.applicationDeadline,
  );

  const [venue, setVenue] =
    useState(session.venue);

  const [status, setStatus] =
    useState<SessionStatus>(
      session.status,
    );

  const [
    isPublished,
    setIsPublished,
  ] = useState(
    session.isPublished,
  );

  /*
   * =====================================
   * COVER STATE
   * =====================================
   */

  const [
    currentCover,
    setCurrentCover,
  ] = useState<string | null>(
    session.coverImage,
  );

  const [
    newCover,
    setNewCover,
  ] = useState<File | null>(
    null,
  );

  const [
    preview,
    setPreview,
  ] = useState("");

  const [
    removeCover,
    setRemoveCover,
  ] = useState(false);

  /*
   * =====================================
   * BUSY
   * =====================================
   */

  const busy =
    saving ||
    quickUpdating ||
    deleting;

  /*
   * =====================================
   * BODY SCROLL LOCK
   * =====================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    const oldPaddingRight =
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
        !busy
      ) {
        setOpen(false);
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
        oldOverflow;

      document.body.style.paddingRight =
        oldPaddingRight;
    };
  }, [open, busy]);

  /*
   * =====================================
   * PREVIEW CLEANUP
   * =====================================
   */

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(
          preview,
        );
      }
    };
  }, [preview]);

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
        `Unexpected server response (${response.status}).`,
      );
    }
  }

  /*
   * =====================================
   * CLEAR NEW COVER
   * =====================================
   */

  function clearNewCover() {
    if (preview) {
      URL.revokeObjectURL(
        preview,
      );
    }

    setPreview("");

    setNewCover(null);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /*
   * =====================================
   * LOAD LATEST SESSION INTO FORM
   * =====================================
   */

  function resetFromSession() {
    setTitle(
      session.title,
    );

    setShortDescription(
      session.shortDescription,
    );

    setDescription(
      session.description,
    );

    setRequirements(
      session.requirements,
    );

    setAuditionDate(
      session.auditionDate,
    );

    setStartTime(
      session.startTime,
    );

    setEndTime(
      session.endTime,
    );

    setApplicationDeadline(
      session.applicationDeadline,
    );

    setVenue(
      session.venue,
    );

    setStatus(
      session.status,
    );

    setIsPublished(
      session.isPublished,
    );

    setCurrentCover(
      session.coverImage,
    );

    setRemoveCover(false);

    clearNewCover();

    setError("");
  }

  /*
   * =====================================
   * OPEN MODAL
   * =====================================
   */

  function openModal() {
    if (busy) {
      return;
    }

    resetFromSession();

    setOpen(true);
  }

  /*
   * =====================================
   * CLOSE MODAL
   * =====================================
   */

  function closeModal() {
    if (busy) {
      return;
    }

    clearNewCover();

    setRemoveCover(false);

    setError("");

    setOpen(false);
  }

  /*
   * =====================================
   * COVER CHANGE
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

    /*
     * TYPE
     */

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

    /*
     * SIZE
     */

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

    /*
     * OLD PREVIEW
     */

    if (preview) {
      URL.revokeObjectURL(
        preview,
      );
    }

    /*
     * NEW PREVIEW
     */

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    setNewCover(file);

    setPreview(
      previewUrl,
    );

    setRemoveCover(false);
  }

  /*
   * =====================================
   * REMOVE COVER
   * =====================================
   */

  function handleRemoveCover() {
    clearNewCover();

    setRemoveCover(true);
  }

  /*
   * =====================================
   * RESTORE COVER
   * =====================================
   */

  function handleRestoreCover() {
    clearNewCover();

    setRemoveCover(false);
  }

  /*
   * =====================================
   * QUICK UPDATE
   * =====================================
   */

  async function quickUpdate(
    values: {
      status?:
        SessionStatus;

      isPublished?:
        boolean;
    },
  ) {
    if (busy) {
      return;
    }

    try {
      setQuickUpdating(true);

      setError("");

      const formData =
        new FormData();

      if (
        values.status !==
        undefined
      ) {
        formData.append(
          "status",
          values.status,
        );
      }

      if (
        values.isPublished !==
        undefined
      ) {
        formData.append(
          "isPublished",
          String(
            values.isPublished,
          ),
        );
      }

      const response =
        await fetch(
          `/api/admin/auditions/sessions/${session.id}`,
          {
            method:
              "PATCH",

            body:
              formData,
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update session.",
        );
      }

      if (
        values.status !==
        undefined
      ) {
        setStatus(
          values.status,
        );
      }

      if (
        values.isPublished !==
        undefined
      ) {
        setIsPublished(
          values.isPublished,
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update session.",
      );
    } finally {
      setQuickUpdating(false);
    }
  }

  /*
   * =====================================
   * SAVE SESSION
   * =====================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) {
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

    if (!auditionDate) {
      setError(
        "Audition date is required.",
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

      formData.append(
        "removeCover",
        String(
          removeCover,
        ),
      );

      if (newCover) {
        formData.append(
          "coverImage",
          newCover,
        );
      }

      const response =
        await fetch(
          `/api/admin/auditions/sessions/${session.id}`,
          {
            method:
              "PATCH",

            body:
              formData,
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save audition session.",
        );
      }

      /*
       * CLOSE FIRST
       */

      clearNewCover();

      setOpen(false);

      /*
       * REFRESH SERVER COMPONENT
       */

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update session.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =====================================
   * DELETE SESSION
   * =====================================
   */

  async function handleDelete() {
    if (busy) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${session.title}"?\n\nAll applications and evaluations for this session will also be deleted.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      setError("");

      const response =
        await fetch(
          `/api/admin/auditions/sessions/${session.id}`,
          {
            method:
              "DELETE",
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete session.",
        );
      }

      clearNewCover();

      setOpen(false);

      router.push(
        "/admin/auditions",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete session.",
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * =====================================
   * DISPLAYED COVER
   * =====================================
   */

  const displayedCover =
    preview ||
    (
      removeCover
        ? null
        : currentCover
    );

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <>
      {/* ================================= */}
      {/* MANAGE TRIGGER */}
      {/* ================================= */}

      <button
        type="button"
        onClick={
          openModal
        }
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[9px] font-black uppercase tracking-[0.05em] text-[#101828] transition hover:border-red-200 hover:text-[#d40000]"
      >
        <Pencil className="h-3.5 w-3.5" />

        Manage
      </button>

      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Manage Audition Session"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !busy
            ) {
              closeModal();
            }
          }}
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
        >
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d40000]">
                  Audition Management
                </p>

                <h2 className="mt-1 text-xl font-black text-[#101828]">
                  Manage Session
                </h2>
              </div>

              <button
                type="button"
                disabled={
                  busy
                }
                onClick={
                  closeModal
                }
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ================================= */}
            {/* CONTENT */}
            {/* ================================= */}

            <div className="space-y-7 px-6 py-7 sm:px-7">
              {/* ================================= */}
              {/* QUICK CONTROLS */}
              {/* ================================= */}

              <section>
                <SectionHeading
                  title="Session Controls"
                  description="Control applications, visibility and session status."
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* ================================= */}
                  {/* CLOSE / REOPEN */}
                  {/* ================================= */}

                  {status ===
                  "OPEN" ? (
                    <button
                      type="button"
                      disabled={
                        busy
                      }
                      onClick={() =>
                        void quickUpdate({
                          status:
                            "CLOSED",
                        })
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 text-[10px] font-bold uppercase tracking-[0.04em] text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      {quickUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}

                      Close Applications
                    </button>
                  ) : status ===
                    "CLOSED" ? (
                    <button
                      type="button"
                      disabled={
                        busy
                      }
                      onClick={() =>
                        void quickUpdate({
                          status:
                            "OPEN",
                        })
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 text-[10px] font-bold uppercase tracking-[0.04em] text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                    >
                      {quickUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}

                      Reopen Applications
                    </button>
                  ) : (
                    <div className="flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-[10px] font-bold uppercase text-gray-400">
                      {status ===
                      "COMPLETED"
                        ? "Session Completed"
                        : "Session Draft"}
                    </div>
                  )}

                  {/* ================================= */}
                  {/* PUBLISH */}
                  {/* ================================= */}

                  <button
                    type="button"
                    disabled={
                      busy
                    }
                    onClick={() =>
                      void quickUpdate({
                        isPublished:
                          !isPublished,
                      })
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.04em] text-[#101828] transition hover:border-red-200 hover:text-[#d40000] disabled:opacity-50"
                  >
                    {quickUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isPublished ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}

                    {isPublished
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                  {/* ================================= */}
                  {/* COMPLETE */}
                  {/* ================================= */}

                  {status !==
                    "COMPLETED" && (
                    <button
                      type="button"
                      disabled={
                        busy
                      }
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Mark "${title}" as completed?`,
                          );

                        if (
                          confirmed
                        ) {
                          void quickUpdate({
                            status:
                              "COMPLETED",
                          });
                        }
                      }}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      {quickUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}

                      Mark Completed
                    </button>
                  )}
                </div>

                {/* STATUS SUMMARY */}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-bold uppercase text-slate-600">
                    Status:{" "}
                    {status}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase ${
                      isPublished
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isPublished
                      ? "Published"
                      : "Not Published"}
                  </span>
                </div>
              </section>

              {/* ================================= */}
              {/* FORM */}
              {/* ================================= */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-7 border-t border-gray-100 pt-7"
              >
                {/* ================================= */}
                {/* BASIC INFO */}
                {/* ================================= */}

                <section>
                  <SectionHeading
                    title="Basic Information"
                    description="Edit the audition session details."
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
                          busy
                        }
                        className="mt-2 h-12 w-full rounded-lg border border-gray-200 bg-[#f8f9fd] px-4 text-sm text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                      />
                    </div>

                    {/* SHORT DESCRIPTION */}

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs font-bold text-slate-700">
                          Short Description
                        </label>

                        <span className="text-[10px] text-gray-400">
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
                          busy
                        }
                        className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                      />
                    </div>

                    {/* DESCRIPTION */}

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
                          busy
                        }
                        className="mt-2 w-full resize-y rounded-lg border border-gray-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                      />
                    </div>

                    {/* REQUIREMENTS */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Requirements
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
                          busy
                        }
                        className="mt-2 w-full resize-y rounded-lg border border-gray-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </section>

                {/* ================================= */}
                {/* SCHEDULE */}
                {/* ================================= */}

                <section className="border-t border-gray-100 pt-7">
                  <SectionHeading
                    title="Schedule"
                    description="Edit audition date, time, deadline and venue."
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    {/* DATE */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Audition Date
                      </label>

                      <FieldBox
                        icon={
                          <CalendarDays />
                        }
                      >
                        <input
                          type="date"
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
                            busy
                          }
                          className="h-12 w-full bg-transparent pl-11 pr-3 text-sm text-[#101828] outline-none disabled:opacity-60"
                        />
                      </FieldBox>
                    </div>

                    {/* START */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Start Time
                      </label>

                      <FieldBox
                        icon={
                          <Clock3 />
                        }
                      >
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
                            busy
                          }
                          className="h-12 w-full bg-transparent pl-11 pr-3 text-sm text-[#101828] outline-none disabled:opacity-60"
                        />
                      </FieldBox>
                    </div>

                    {/* END */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        End Time
                      </label>

                      <FieldBox
                        icon={
                          <Clock3 />
                        }
                      >
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
                            busy
                          }
                          className="h-12 w-full bg-transparent pl-11 pr-3 text-sm text-[#101828] outline-none disabled:opacity-60"
                        />
                      </FieldBox>
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
                          busy
                        }
                        className="mt-2 h-12 w-full rounded-lg border border-gray-200 bg-[#f8f9fd] px-4 text-sm text-[#101828] outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                      />
                    </div>

                    {/* VENUE */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Venue
                      </label>

                      <div className="relative mt-2">
                        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

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
                            busy
                          }
                          className="h-12 w-full rounded-lg border border-gray-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-[#101828] outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ================================= */}
                {/* COVER IMAGE */}
                {/* ================================= */}

                <section className="border-t border-gray-100 pt-7">
                  <SectionHeading
                    title="Cover Image"
                    description="Change, remove or restore the session cover image."
                  />

                  <div className="mt-5">
                    {displayedCover ? (
                      <>
                        <div className="relative aspect-[16/6] overflow-hidden rounded-xl bg-[#101828]">
                          <img
                            src={
                              displayedCover
                            }
                            alt="Audition session cover"
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[9px] font-bold text-white">
                            <ImageIcon className="h-3.5 w-3.5" />

                            {newCover
                              ? "New Cover"
                              : "Current Cover"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4">
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
                              disabled={
                                busy
                              }
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={
                              handleRemoveCover
                            }
                            disabled={
                              busy
                            }
                            className="text-xs font-bold text-gray-500 transition hover:text-red-600 disabled:opacity-50"
                          >
                            Remove Cover
                          </button>
                        </div>
                      </>
                    ) : removeCover &&
                      currentCover ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <p className="text-sm font-bold text-amber-800">
                          Current cover will be removed when you save.
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleRestoreCover
                          }
                          disabled={
                            busy
                          }
                          className="mt-3 text-xs font-bold text-amber-700 underline"
                        >
                          Restore Cover
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-[#f8f9fd] px-6 py-10 text-center transition hover:border-red-300">
                        <UploadCloud className="h-6 w-6 text-red-600" />

                        <span className="mt-3 text-sm font-bold text-[#101828]">
                          Choose Cover
                        </span>

                        <span className="mt-1 text-xs text-gray-500">
                          JPG, PNG, WEBP or GIF. Maximum 10 MB.
                        </span>

                        <input
                          ref={
                            fileInputRef
                          }
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={
                            handleCoverChange
                          }
                          disabled={
                            busy
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

                <section className="border-t border-gray-100 pt-7">
                  <SectionHeading
                    title="Status & Visibility"
                    description="Control the current session state and public visibility."
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
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
                          busy
                        }
                        className="mt-2 h-12 w-full rounded-lg border border-gray-200 bg-[#f8f9fd] px-4 text-sm text-[#101828] outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                      >
                        <option value="DRAFT">
                          Draft
                        </option>

                        <option value="OPEN">
                          Open
                        </option>

                        <option value="CLOSED">
                          Closed
                        </option>

                        <option value="COMPLETED">
                          Completed
                        </option>
                      </select>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-[#f8f9fd] p-4">
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
                          busy
                        }
                        className="mt-1 h-4 w-4 accent-red-600"
                      />

                      <span>
                        <span className="block text-sm font-bold text-[#101828]">
                          Published
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                          Published sessions can appear on the public Auditions page.
                        </span>
                      </span>
                    </label>
                  </div>
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
                {/* FOOTER */}
                {/* ================================= */}

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={
                      handleDelete
                    }
                    disabled={
                      busy
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 text-xs font-bold uppercase tracking-[0.04em] text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />

                        Delete Session
                      </>
                    )}
                  </button>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    {/* CANCEL */}

                    <button
                      type="button"
                      disabled={
                        busy
                      }
                      onClick={
                        closeModal
                      }
                      className="h-11 rounded-lg border border-gray-200 px-5 text-xs font-bold uppercase text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    {/* SAVE */}

                    <button
                      type="submit"
                      disabled={
                        busy
                      }
                      className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:bg-[#b80000] disabled:cursor-not-allowed disabled:opacity-60"
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
                </div>
              </form>
            </div>
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
      <h3 className="text-sm font-black text-[#101828]">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}

/*
 * =====================================
 * FIELD BOX
 * =====================================
 */

function FieldBox({
  icon,
  children,
}: {
  icon: ReactNode;

  children: ReactNode;
}) {
  return (
    <div className="relative mt-2 rounded-lg border border-gray-200 bg-[#f8f9fd] transition focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-100">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>

      {children}
    </div>
  );
}