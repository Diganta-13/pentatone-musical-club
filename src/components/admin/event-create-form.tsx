"use client";

import {
  CalendarDays,
  Clock3,
  ImageIcon,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
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
 * COMPONENT
 * =====================================
 */

export default function EventCreateForm() {
  const router = useRouter();

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

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =====================================
   * BASIC INFORMATION
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

  /*
   * =====================================
   * DATE + TIME
   * =====================================
   */

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

  /*
   * =====================================
   * LOCATION + REGISTRATION
   * =====================================
   */

  const [venue, setVenue] =
    useState("");

  const [
    registrationUrl,
    setRegistrationUrl,
  ] = useState("");

  /*
   * =====================================
   * COVER IMAGE
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
   * VISIBILITY
   * =====================================
   */

  const [
    isPublished,
    setIsPublished,
  ] = useState(true);

  const [
    isFeatured,
    setIsFeatured,
  ] = useState(false);

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

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
        !loading
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
  }, [open, loading]);

  /*
   * =====================================
   * COVER PREVIEW CLEANUP
   * =====================================
   */

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(
          coverPreview,
        );
      }
    };
  }, [coverPreview]);

  /*
   * =====================================
   * RESET FORM
   * =====================================
   */

  function resetForm() {
    setTitle("");

    setShortDescription("");

    setDescription("");

    setEventType("");

    setEventDate("");

    setStartTime("");

    setEndTime("");

    setVenue("");

    setRegistrationUrl("");

    setCoverImage(null);

    setCoverPreview("");

    setIsPublished(true);

    setIsFeatured(false);

    setError("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /*
   * =====================================
   * OPEN MODAL
   * =====================================
   */

  function openModal() {
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

    resetForm();

    setOpen(false);
  }

  /*
   * =====================================
   * COVER IMAGE CHANGE
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
      setCoverImage(null);

      setCoverPreview("");

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

      setCoverImage(null);

      setCoverPreview("");

      event.target.value = "";

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

      setCoverImage(null);

      setCoverPreview("");

      event.target.value = "";

      return;
    }

    /*
     * PREVIEW
     */

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    setCoverImage(file);

    setCoverPreview(
      previewUrl,
    );
  }

  /*
   * =====================================
   * REMOVE COVER
   * =====================================
   */

  function removeCover() {
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

    if (loading) {
      return;
    }

    setError("");

    /*
     * REQUIRED FIELDS
     */

    if (
      title.trim().length < 3
    ) {
      setError(
        "Event title must be at least 3 characters.",
      );

      return;
    }

    if (!eventDate) {
      setError(
        "Please select an event date.",
      );

      return;
    }

    /*
     * TIME VALIDATION
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
      setLoading(true);

      /*
       * =====================================
       * FORM DATA
       * =====================================
       */

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
        String(isPublished),
      );

      formData.append(
        "isFeatured",
        String(isFeatured),
      );

      if (coverImage) {
        formData.append(
          "coverImage",
          coverImage,
        );
      }

      /*
       * =====================================
       * API
       * =====================================
       */

      const response =
        await fetch(
          "/api/admin/events",
          {
            method: "POST",

            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create event.",
        );
      }

      /*
       * =====================================
       * SUCCESS
       * =====================================
       */

      resetForm();

      setOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create event.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ================================= */}
      {/* CREATE BUTTON */}
      {/* ================================= */}

      <button
        type="button"
        onClick={openModal}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-5 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-700"
      >
        <Plus className="h-4 w-4" />

        Create Event
      </button>

      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Event"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !loading
            ) {
              closeModal();
            }
          }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
        >
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                  Event Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Create New Event
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  loading
                }
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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
              {/* BASIC INFORMATION */}
              {/* ================================= */}

              <section>
                <SectionHeading
                  title="Basic Information"
                  description="Main information about the event."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {/* TITLE */}

                  <div className="md:col-span-2">
                    <label
                      htmlFor="event-title"
                      className="text-xs font-bold text-slate-700"
                    >
                      Event Title{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <input
                      id="event-title"
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
                      placeholder="Example: Pentatone Annual Concert 2026"
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* EVENT TYPE */}

                  <div>
                    <label
                      htmlFor="event-type"
                      className="text-xs font-bold text-slate-700"
                    >
                      Event Type
                    </label>

                    <input
                      id="event-type"
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
                      placeholder="Concert, Cultural, Workshop..."
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* VENUE */}

                  <div>
                    <label
                      htmlFor="event-venue"
                      className="text-xs font-bold text-slate-700"
                    >
                      Venue
                    </label>

                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="event-venue"
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
                        placeholder="Example: SEC Auditorium"
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* SHORT DESCRIPTION */}

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="event-short-description"
                        className="text-xs font-bold text-slate-700"
                      >
                        Short
                        Description
                      </label>

                      <span className="text-[10px] text-slate-400">
                        {
                          shortDescription.length
                        }
                        /500
                      </span>
                    </div>

                    <textarea
                      id="event-short-description"
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
                      placeholder="A short summary shown on event cards..."
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* FULL DESCRIPTION */}

                  <div className="md:col-span-2">
                    <label
                      htmlFor="event-description"
                      className="text-xs font-bold text-slate-700"
                    >
                      Full
                      Description
                    </label>

                    <textarea
                      id="event-description"
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
                      placeholder="Write the full event details..."
                      className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
              </section>

              {/* ================================= */}
              {/* DATE + TIME */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">
                <SectionHeading
                  title="Schedule"
                  description="Set the date and time of the event."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  {/* DATE */}

                  <div>
                    <label
                      htmlFor="event-date"
                      className="text-xs font-bold text-slate-700"
                    >
                      Event Date{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <div className="relative mt-2">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="event-date"
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
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* START TIME */}

                  <div>
                    <label
                      htmlFor="event-start-time"
                      className="text-xs font-bold text-slate-700"
                    >
                      Start Time
                    </label>

                    <div className="relative mt-2">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="event-start-time"
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
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* END TIME */}

                  <div>
                    <label
                      htmlFor="event-end-time"
                      className="text-xs font-bold text-slate-700"
                    >
                      End Time
                    </label>

                    <div className="relative mt-2">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="event-end-time"
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
                        className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ================================= */}
              {/* COVER IMAGE */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">
                <SectionHeading
                  title="Cover Image"
                  description="Upload an image for the public event card and detail page."
                />

                <div className="mt-5">
                  {!coverPreview ? (
                    <label
                      htmlFor="event-cover"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#f8f9fd] px-6 py-10 text-center transition hover:border-red-300 hover:bg-red-50/30"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <UploadCloud className="h-5 w-5" />
                      </div>

                      <p className="mt-4 text-sm font-bold text-slate-800">
                        Choose cover
                        image
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        JPG, PNG,
                        WEBP or GIF.
                        Maximum 10 MB.
                      </p>
                    </label>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                      <div className="relative aspect-[16/7]">
                        <img
                          src={
                            coverPreview
                          }
                          alt="Event cover preview"
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        <button
                          type="button"
                          onClick={
                            removeCover
                          }
                          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition hover:bg-red-600"
                          aria-label="Remove cover image"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          <ImageIcon className="h-3.5 w-3.5" />

                          Cover Preview
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    ref={
                      fileInputRef
                    }
                    id="event-cover"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={
                      handleCoverChange
                    }
                    className="hidden"
                  />

                  {coverPreview && (
                    <label
                      htmlFor="event-cover"
                      className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700"
                    >
                      <UploadCloud className="h-4 w-4" />

                      Change Cover
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
                  description="Optional external link for event registration."
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
                    placeholder="https://example.com/register"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </section>

              {/* ================================= */}
              {/* PUBLISH SETTINGS */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">
                <SectionHeading
                  title="Visibility"
                  description="Control how this event will appear publicly."
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {/* PUBLISHED */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-200">
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
                      className="mt-1 h-4 w-4 accent-red-600"
                    />

                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Publish
                        Event
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Published
                        events can
                        appear on the
                        public Events
                        page.
                      </span>
                    </span>
                  </label>

                  {/* FEATURED */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-200">
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
                      className="mt-1 h-4 w-4 accent-red-600"
                    />

                    <span>
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Sparkles className="h-4 w-4 text-red-600" />

                        Featured
                        Event
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Mark this as
                        an important
                        or highlighted
                        event.
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

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    loading
                  }
                  className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold uppercase tracking-[0.05em] text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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

                      Create Event
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
      <h3 className="text-sm font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}