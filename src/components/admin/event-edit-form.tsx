"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImageIcon,
  Link2,
  Loader2,
  MapPin,
  Pencil,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
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

/*
 * =====================================
 * TYPES
 * =====================================
 */

type EventStatusOverride =
  | "AUTO"
  | "COMPLETED";

type EventEditFormProps = {
  eventId: number;

  variant?:
    | "icon"
    | "button";
};

type EventData = {
  id: number;

  title: string;

  slug: string;

  shortDescription: string;

  description: string;

  eventType: string;

  eventDate: string;

  startTime: string;

  endTime: string;

  venue: string;

  coverImage:
    | string
    | null;

  registrationUrl: string;

  isPublished: boolean;

  isFeatured: boolean;

  statusOverride:
    EventStatusOverride;
};

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function EventEditForm({
  eventId,
  variant = "icon",
}: EventEditFormProps) {
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

  const [
    loadingEvent,
    setLoadingEvent,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    eventLoaded,
    setEventLoaded,
  ] = useState(false);

  const [error, setError] =
    useState("");

  /*
   * =====================================
   * EVENT DATA
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
    eventType,
    setEventType,
  ] = useState("");

  const [
    eventDate,
    setEventDate,
  ] = useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    endTime,
    setEndTime,
  ] = useState("");

  const [venue, setVenue] =
    useState("");

  const [
    registrationUrl,
    setRegistrationUrl,
  ] = useState("");

  const [
    isPublished,
    setIsPublished,
  ] = useState(true);

  const [
    isFeatured,
    setIsFeatured,
  ] = useState(false);

  const [
    statusOverride,
    setStatusOverride,
  ] =
    useState<EventStatusOverride>(
      "AUTO",
    );

  /*
   * =====================================
   * COVER IMAGE
   * =====================================
   */

  const [
    currentCover,
    setCurrentCover,
  ] = useState<
    string | null
  >(null);

  const [
    newCover,
    setNewCover,
  ] = useState<File | null>(
    null,
  );

  const [
    newCoverPreview,
    setNewCoverPreview,
  ] = useState("");

  const [
    removeCover,
    setRemoveCover,
  ] = useState(false);

  /*
   * =====================================
   * BUSY STATE
   * =====================================
   */

  const busy =
    saving ||
    deleting ||
    updatingStatus;

  /*
   * =====================================
   * BODY SCROLL LOCK
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
        previousOverflow;

      document.body.style.paddingRight =
        previousPaddingRight;
    };
  }, [open, busy]);

  /*
   * =====================================
   * BLOB CLEANUP
   * =====================================
   */

  useEffect(() => {
    return () => {
      if (
        newCoverPreview
      ) {
        URL.revokeObjectURL(
          newCoverPreview,
        );
      }
    };
  }, [newCoverPreview]);

  /*
   * =====================================
   * SAFE RESPONSE READER
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
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned an unexpected response (${response.status}).`,
      );
    }
  }

  /*
   * =====================================
   * CLEAR NEW COVER
   * =====================================
   */

  function clearNewCover() {
    if (
      newCoverPreview
    ) {
      URL.revokeObjectURL(
        newCoverPreview,
      );
    }

    setNewCover(null);

    setNewCoverPreview("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /*
   * =====================================
   * POPULATE EVENT
   * =====================================
   */

  function populateEvent(
    event: EventData,
  ) {
    setTitle(
      event.title,
    );

    setShortDescription(
      event.shortDescription ||
        "",
    );

    setDescription(
      event.description ||
        "",
    );

    setEventType(
      event.eventType ||
        "",
    );

    setEventDate(
      event.eventDate ||
        "",
    );

    setStartTime(
      event.startTime ||
        "",
    );

    setEndTime(
      event.endTime ||
        "",
    );

    setVenue(
      event.venue ||
        "",
    );

    setRegistrationUrl(
      event.registrationUrl ||
        "",
    );

    setCurrentCover(
      event.coverImage,
    );

    setIsPublished(
      event.isPublished,
    );

    setIsFeatured(
      event.isFeatured,
    );

    setStatusOverride(
      event.statusOverride ||
        "AUTO",
    );

    setRemoveCover(false);

    clearNewCover();
  }

  /*
   * =====================================
   * LOAD EVENT
   * =====================================
   */

  async function loadEvent() {
    try {
      setLoadingEvent(true);

      setError("");

      setEventLoaded(false);

      const response =
        await fetch(
          `/api/admin/events/${eventId}`,
          {
            method: "GET",

            cache:
              "no-store",
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load event.",
        );
      }

      populateEvent(
        data.event as EventData,
      );

      setEventLoaded(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load event.",
      );
    } finally {
      setLoadingEvent(false);
    }
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

    setOpen(true);

    void loadEvent();
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

    setEventLoaded(false);
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
     * PREVIEW
     */

    if (
      newCoverPreview
    ) {
      URL.revokeObjectURL(
        newCoverPreview,
      );
    }

    const preview =
      URL.createObjectURL(
        file,
      );

    setNewCover(file);

    setNewCoverPreview(
      preview,
    );

    setRemoveCover(false);
  }

  /*
   * =====================================
   * REMOVE CURRENT COVER
   * =====================================
   */

  function removeCurrentCover() {
    clearNewCover();

    setRemoveCover(true);
  }

  /*
   * =====================================
   * RESTORE CURRENT COVER
   * =====================================
   */

  function restoreCurrentCover() {
    clearNewCover();

    setRemoveCover(false);
  }

  /*
   * =====================================
   * MANUAL STATUS UPDATE
   * =====================================
   *
   * This sends only statusOverride.
   * The API keeps all other existing
   * event fields unchanged.
   * =====================================
   */

  async function updateStatus(
    nextStatus:
      EventStatusOverride,
  ) {
    if (busy) {
      return;
    }

    /*
     * CONFIRM MANUAL COMPLETE
     */

    if (
      nextStatus ===
      "COMPLETED"
    ) {
      const confirmed =
        window.confirm(
          `Mark "${title}" as completed?\n\nThis will override the automatic date/time status.`,
        );

      if (!confirmed) {
        return;
      }
    }

    /*
     * CONFIRM RESTORE AUTO
     */

    if (
      nextStatus ===
      "AUTO"
    ) {
      const confirmed =
        window.confirm(
          `Restore automatic status for "${title}"?\n\nThe system will again use the event date and time to determine Upcoming, Ongoing or Completed.`,
        );

      if (!confirmed) {
        return;
      }
    }

    try {
      setUpdatingStatus(true);

      setError("");

      const formData =
        new FormData();

      formData.append(
        "statusOverride",
        nextStatus,
      );

      const response =
        await fetch(
          `/api/admin/events/${eventId}`,
          {
            method: "PATCH",

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
            "Unable to update event status.",
        );
      }

      setStatusOverride(
        nextStatus,
      );

      /*
       * Update admin page stats/table.
       */

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update event status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  /*
   * =====================================
   * SAVE EVENT
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
        "Event title must be at least 3 characters.",
      );

      return;
    }

    /*
     * DATE
     */

    if (!eventDate) {
      setError(
        "Please select an event date.",
      );

      return;
    }

    /*
     * TIME
     */

    if (
      startTime &&
      endTime &&
      endTime <= startTime
    ) {
      setError(
        "End time must be later than start time.",
      );

      return;
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
        "eventType",
        eventType.trim(),
      );

      formData.append(
        "eventDate",
        eventDate,
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
        "venue",
        venue.trim(),
      );

      formData.append(
        "registrationUrl",
        registrationUrl.trim(),
      );

      formData.append(
        "isPublished",
        String(
          isPublished,
        ),
      );

      formData.append(
        "isFeatured",
        String(
          isFeatured,
        ),
      );

      formData.append(
        "removeCover",
        String(
          removeCover,
        ),
      );

      formData.append(
        "statusOverride",
        statusOverride,
      );

      if (newCover) {
        formData.append(
          "coverImage",
          newCover,
        );
      }

      const response =
        await fetch(
          `/api/admin/events/${eventId}`,
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
            "Unable to update event.",
        );
      }

      clearNewCover();

      setOpen(false);

      setEventLoaded(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update event.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =====================================
   * DELETE EVENT
   * =====================================
   */

  async function handleDelete() {
    if (busy) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${title}"?\n\nThis event will be permanently deleted.`,
      );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      setDeleting(true);

      const response =
        await fetch(
          `/api/admin/events/${eventId}`,
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
            "Unable to delete event.",
        );
      }

      clearNewCover();

      setOpen(false);

      setEventLoaded(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete event.",
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * =====================================
   * DISPLAY COVER
   * =====================================
   */

  const displayedCover =
    newCoverPreview ||
    (
      !removeCover
        ? currentCover
        : null
    );

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

      {variant ===
      "button" ? (
        <button
          type="button"
          onClick={
            openModal
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#101828] transition hover:border-red-300 hover:text-[#d40000]"
        >
          <Pencil className="h-3.5 w-3.5" />

          Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={
            openModal
          }
          title="Edit event"
          aria-label="Edit event"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-[#d40000]"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit Event"
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
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
        >
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                  Event Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Edit Event
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  busy
                }
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ================================= */}
            {/* LOADING */}
            {/* ================================= */}

            {loadingEvent && (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-red-600" />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Loading event...
                  </p>
                </div>
              </div>
            )}

            {/* ================================= */}
            {/* LOAD ERROR */}
            {/* ================================= */}

            {!loadingEvent &&
              !eventLoaded &&
              error && (
                <div className="px-7 py-16 text-center">
                  <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    {error}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void loadEvent()
                    }
                    className="mt-5 h-10 rounded-lg bg-[#101828] px-5 text-xs font-bold uppercase text-white"
                  >
                    Try Again
                  </button>
                </div>
              )}

            {/* ================================= */}
            {/* FORM */}
            {/* ================================= */}

            {!loadingEvent &&
              eventLoaded && (
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-7 px-6 py-7 sm:px-7"
                >
                  {/* ================================= */}
                  {/* BASIC INFO */}
                  {/* ================================= */}

                  <section>
                    <SectionHeading
                      title="Basic Information"
                      description="Update the event title, category, venue and description."
                    />

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      {/* TITLE */}

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">
                          Event Title{" "}
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
                          className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                        />
                      </div>

                      {/* TYPE */}

                      <div>
                        <label className="text-xs font-bold text-slate-700">
                          Event Type
                        </label>

                        <input
                          type="text"
                          maxLength={100}
                          value={
                            eventType
                          }
                          onChange={(
                            event,
                          ) =>
                            setEventType(
                              event
                                .target
                                .value,
                            )
                          }
                          disabled={
                            busy
                          }
                          placeholder="Concert, Cultural, Workshop..."
                          className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
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
                              busy
                            }
                            className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {/* SHORT DESCRIPTION */}

                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between gap-3">
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
                            busy
                          }
                          className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                        />
                      </div>

                      {/* DESCRIPTION */}

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">
                          Full Description
                        </label>

                        <textarea
                          rows={6}
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
                          className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
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
                      description="Update the event date and running time."
                    />

                    <div className="mt-5 grid gap-5 md:grid-cols-3">
                      {/* DATE */}

                      <div>
                        <label className="text-xs font-bold text-slate-700">
                          Event Date{" "}
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
                              eventDate
                            }
                            onChange={(
                              event,
                            ) =>
                              setEventDate(
                                event
                                  .target
                                  .value,
                              )
                            }
                            disabled={
                              busy
                            }
                            className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
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
                              busy
                            }
                            className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
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
                              busy
                            }
                            className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ================================= */}
                  {/* STATUS CONTROL */}
                  {/* ================================= */}

                  <section className="border-t border-slate-100 pt-7">
                    <SectionHeading
                      title="Event Status"
                      description="The default status is calculated automatically from the event date and time. Admin can manually mark an event as completed."
                    />

                    <div className="mt-5">
                      {statusOverride ===
                      "AUTO" ? (
                        <div className="rounded-2xl border border-slate-200 bg-[#f8f9fd] p-5">
                          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Clock3 className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="text-sm font-black text-slate-900">
                                  Automatic Status
                                </p>

                                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                                  The system currently determines Upcoming, Ongoing or Completed from the event date and time.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                void updateStatus(
                                  "COMPLETED",
                                )
                              }
                              disabled={
                                busy
                              }
                              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-[10px] font-bold uppercase tracking-[0.05em] text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingStatus ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}

                              Mark as Completed
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-green-200 bg-green-50/70 p-5">
                          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="text-sm font-black text-green-900">
                                  Manually Completed
                                </p>

                                <p className="mt-1 max-w-xl text-xs leading-5 text-green-700/75">
                                  An administrator has overridden the automatic schedule and marked this event as completed.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                void updateStatus(
                                  "AUTO",
                                )
                              }
                              disabled={
                                busy
                              }
                              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-5 text-[10px] font-bold uppercase tracking-[0.05em] text-green-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingStatus ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}

                              Restore Auto Status
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ================================= */}
                  {/* COVER IMAGE */}
                  {/* ================================= */}

                  <section className="border-t border-slate-100 pt-7">
                    <SectionHeading
                      title="Cover Image"
                      description="Change or remove the public event cover image."
                    />

                    <div className="mt-5">
                      {displayedCover ? (
                        <>
                          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                            <div className="relative aspect-[16/7]">
                              <img
                                src={
                                  displayedCover
                                }
                                alt="Event cover"
                                className="h-full w-full object-cover"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                <ImageIcon className="h-3.5 w-3.5" />

                                {newCover
                                  ? "New Cover"
                                  : "Current Cover"}
                              </div>
                            </div>
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

                            {newCover ? (
                              <button
                                type="button"
                                onClick={
                                  restoreCurrentCover
                                }
                                disabled={
                                  busy
                                }
                                className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-50"
                              >
                                Use Current Cover
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={
                                  removeCurrentCover
                                }
                                disabled={
                                  busy
                                }
                                className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
                              >
                                Remove Cover
                              </button>
                            )}
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
                              restoreCurrentCover
                            }
                            disabled={
                              busy
                            }
                            className="mt-3 text-xs font-bold text-amber-700 underline disabled:opacity-50"
                          >
                            Undo removal
                          </button>
                        </div>
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
                  {/* REGISTRATION */}
                  {/* ================================= */}

                  <section className="border-t border-slate-100 pt-7">
                    <SectionHeading
                      title="Registration"
                      description="Optional external event registration URL."
                    />

                    <div className="relative mt-5">
                      <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="url"
                        maxLength={500}
                        value={
                          registrationUrl
                        }
                        onChange={(
                          event,
                        ) =>
                          setRegistrationUrl(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          busy
                        }
                        placeholder="https://example.com/register"
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                      />
                    </div>
                  </section>

                  {/* ================================= */}
                  {/* VISIBILITY */}
                  {/* ================================= */}

                  <section className="border-t border-slate-100 pt-7">
                    <SectionHeading
                      title="Visibility"
                      description="Control public visibility and Featured status."
                    />

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {/* PUBLISHED */}

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
                          <span className="block text-sm font-bold text-slate-800">
                            Publish Event
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Published events can appear on the public Events page.
                          </span>
                        </span>
                      </label>

                      {/* FEATURED */}

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <input
                          type="checkbox"
                          checked={
                            isFeatured
                          }
                          onChange={(
                            event,
                          ) =>
                            setIsFeatured(
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
                          <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <Sparkles className="h-4 w-4 text-red-600" />

                            Featured Event
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Highlight this event in important public event sections.
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
                  {/* ACTIONS */}
                  {/* ================================= */}

                  <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={
                        handleDelete
                      }
                      disabled={
                        busy
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 text-xs font-bold uppercase tracking-[0.05em] text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />

                          Delete Event
                        </>
                      )}
                    </button>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                      {/* CANCEL */}

                      <button
                        type="button"
                        onClick={
                          closeModal
                        }
                        disabled={
                          busy
                        }
                        className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      {/* SAVE */}

                      <button
                        type="submit"
                        disabled={
                          busy
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
                  </div>
                </form>
              )}
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
      <h3 className="text-sm font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}