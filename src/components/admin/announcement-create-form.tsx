"use client";

import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  MapPin,
  Megaphone,
  Pin,
  Plus,
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

type AnnouncementCategory =
  | "EVENTS"
  | "AUDITIONS"
  | "PRACTICE"
  | "GENERAL_NOTICE";

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function AnnouncementCreateForm() {
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

  const [success, setSuccess] =
    useState("");

  /*
   * =====================================
   * FORM STATE
   * =====================================
   */

  const [title, setTitle] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState<AnnouncementCategory>(
      "GENERAL_NOTICE",
    );

  const [
    shortDescription,
    setShortDescription,
  ] = useState("");

  const [content, setContent] =
    useState("");

  const [venue, setVenue] =
    useState("");

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
    isPinned,
    setIsPinned,
  ] = useState(false);

  const [
    isPublished,
    setIsPublished,
  ] = useState(true);

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
      document.body.style.overflow;

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
        event.key === "Escape" &&
        !loading
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
  }, [open, loading]);

  /*
   * =====================================
   * PREVIEW CLEANUP
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
   * RESET
   * =====================================
   */

  function resetForm() {
    setTitle("");

    setCategory(
      "GENERAL_NOTICE",
    );

    setShortDescription("");

    setContent("");

    setVenue("");

    setCoverImage(null);

    if (coverPreview) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    setCoverPreview("");

    setIsPinned(false);

    setIsPublished(true);

    setError("");

    setSuccess("");

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
    setSuccess("");

    setOpen(true);
  }

  /*
   * =====================================
   * CLOSE
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
   * COVER IMAGE
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
     * TYPE CHECK
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
     * SIZE CHECK
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
     * CLEAN OLD PREVIEW
     */

    if (coverPreview) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    /*
     * NEW PREVIEW
     */

    const previewUrl =
      URL.createObjectURL(file);

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
    if (coverPreview) {
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

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    /*
     * VALIDATION
     */

    if (
      title.trim().length < 3
    ) {
      setError(
        "Announcement title must be at least 3 characters.",
      );

      return;
    }

    if (
      content.trim().length < 5
    ) {
      setError(
        "Please write the announcement content.",
      );

      return;
    }

    if (
      shortDescription.length >
      500
    ) {
      setError(
        "Short description cannot exceed 500 characters.",
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
        "category",
        category,
      );

      formData.append(
        "shortDescription",
        shortDescription.trim(),
      );

      formData.append(
        "content",
        content.trim(),
      );

      formData.append(
        "venue",
        venue.trim(),
      );

      formData.append(
        "isPinned",
        String(isPinned),
      );

      formData.append(
        "isPublished",
        String(isPublished),
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
          "/api/admin/announcements",
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
            "Unable to create announcement.",
        );
      }

      /*
       * =====================================
       * SUCCESS
       * =====================================
       */

      setSuccess(
        "Announcement created successfully.",
      );

      router.refresh();

      window.setTimeout(
        () => {
          resetForm();

          setOpen(false);
        },
        700,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create announcement.",
      );
    } finally {
      setLoading(false);
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
      {/* CREATE BUTTON */}
      {/* ================================= */}

      <button
        type="button"
        onClick={openModal}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-5 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-700"
      >
        <Plus className="h-4 w-4" />

        Create Announcement
      </button>


      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Announcement"
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
                  Announcement Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Create New Announcement
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
              className="space-y-8 px-6 py-7 sm:px-7"
            >

              {/* ================================= */}
              {/* BASIC INFORMATION */}
              {/* ================================= */}

              <section>

                <SectionHeading
                  title="Basic Information"
                  description="Main information shown on the announcement page."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  {/* TITLE */}

                  <div className="md:col-span-2">

                    <label
                      htmlFor="announcement-title"
                      className="text-xs font-bold text-slate-700"
                    >
                      Announcement Title{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <input
                      id="announcement-title"
                      type="text"
                      required
                      minLength={3}
                      maxLength={180}
                      value={title}
                      onChange={(
                        event,
                      ) =>
                        setTitle(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Example: Audition Registration Open"
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />

                  </div>


                  {/* CATEGORY */}

                  <div>

                    <label
                      htmlFor="announcement-category"
                      className="text-xs font-bold text-slate-700"
                    >
                      Category{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <select
                      id="announcement-category"
                      value={category}
                      onChange={(
                        event,
                      ) =>
                        setCategory(
                          event.target
                            .value as AnnouncementCategory,
                        )
                      }
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="GENERAL_NOTICE">
                        General Notice
                      </option>

                      <option value="EVENTS">
                        Events
                      </option>

                      <option value="AUDITIONS">
                        Auditions
                      </option>

                      <option value="PRACTICE">
                        Practice
                      </option>
                    </select>

                  </div>


                  {/* VENUE */}

                  <div>

                    <label
                      htmlFor="announcement-venue"
                      className="text-xs font-bold text-slate-700"
                    >
                      Venue
                    </label>

                    <div className="relative mt-2">

                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="announcement-venue"
                        type="text"
                        maxLength={255}
                        value={venue}
                        onChange={(
                          event,
                        ) =>
                          setVenue(
                            event.target
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
                        htmlFor="announcement-short-description"
                        className="text-xs font-bold text-slate-700"
                      >
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
                      id="announcement-short-description"
                      rows={3}
                      maxLength={500}
                      value={
                        shortDescription
                      }
                      onChange={(
                        event,
                      ) =>
                        setShortDescription(
                          event.target
                            .value,
                        )
                      }
                      placeholder="A short summary that will appear on announcement cards..."
                      className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />

                  </div>


                  {/* CONTENT */}

                  <div className="md:col-span-2">

                    <div className="flex items-center justify-between gap-3">

                      <label
                        htmlFor="announcement-content"
                        className="text-xs font-bold text-slate-700"
                      >
                        Full Announcement{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </label>

                      <span className="text-[10px] text-slate-400">
                        {
                          content.length
                        }
                        /10000
                      </span>

                    </div>

                    <textarea
                      id="announcement-content"
                      rows={7}
                      required
                      minLength={5}
                      maxLength={10000}
                      value={content}
                      onChange={(
                        event,
                      ) =>
                        setContent(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Write the full announcement details..."
                      className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />

                  </div>

                </div>

              </section>


              {/* ================================= */}
              {/* COVER IMAGE */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">

                <SectionHeading
                  title="Cover Image"
                  description="Optional image for pinned announcements and announcement details."
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={
                    handleCoverChange
                  }
                  className="hidden"
                />


                {!coverPreview ? (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-5 flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#fafbff] px-6 text-center transition hover:border-red-300 hover:bg-red-50/30"
                  >

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">

                      <UploadCloud className="h-6 w-6" />

                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-900">
                      Choose cover image
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG, WEBP or
                      GIF. Maximum 10 MB.
                    </p>

                  </button>
                ) : (
                  <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200">

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        coverPreview
                      }
                      alt="Announcement cover preview"
                      className="h-64 w-full object-cover"
                    />

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-5 pb-5 pt-14">

                      <div className="flex items-center gap-2 text-white">

                        <ImageIcon className="h-4 w-4" />

                        <span className="text-xs font-semibold">
                          {
                            coverImage
                              ?.name
                          }
                        </span>

                      </div>

                      <button
                        type="button"
                        onClick={
                          removeCover
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-600 transition hover:bg-white"
                        aria-label="Remove cover image"
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>

                  </div>
                )}

              </section>


              {/* ================================= */}
              {/* VISIBILITY */}
              {/* ================================= */}

              <section className="border-t border-slate-100 pt-7">

                <SectionHeading
                  title="Visibility & Priority"
                  description="Control how this announcement appears publicly."
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">

                  {/* PUBLISH */}

                  <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 bg-[#fafbff] p-5 transition hover:border-red-200">

                    <input
                      type="checkbox"
                      checked={
                        isPublished
                      }
                      onChange={(
                        event,
                      ) =>
                        setIsPublished(
                          event.target
                            .checked,
                        )
                      }
                      className="mt-1 h-4 w-4 accent-red-600"
                    />

                    <div>

                      <div className="flex items-center gap-2">

                        <Megaphone className="h-4 w-4 text-red-600" />

                        <p className="text-sm font-bold text-slate-900">
                          Publish Announcement
                        </p>

                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Published announcements
                        can appear on the
                        public Announcements
                        page.
                      </p>

                    </div>

                  </label>


                  {/* PIN */}

                  <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 bg-[#fafbff] p-5 transition hover:border-red-200">

                    <input
                      type="checkbox"
                      checked={
                        isPinned
                      }
                      onChange={(
                        event,
                      ) =>
                        setIsPinned(
                          event.target
                            .checked,
                        )
                      }
                      className="mt-1 h-4 w-4 accent-red-600"
                    />

                    <div>

                      <div className="flex items-center gap-2">

                        <Pin className="h-4 w-4 text-red-600" />

                        <p className="text-sm font-bold text-slate-900">
                          Pin Announcement
                        </p>

                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Highlight this as
                        an important priority
                        announcement.
                      </p>

                    </div>

                  </label>

                </div>

              </section>


              {/* ================================= */}
              {/* ERROR */}
              {/* ================================= */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}


              {/* ================================= */}
              {/* SUCCESS */}
              {/* ================================= */}

              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">

                  <CheckCircle2 className="h-5 w-5 shrink-0" />

                  {success}

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
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-xs font-bold uppercase tracking-[0.06em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />

                      Create Announcement
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