"use client";

import {
  BookOpen,
  CheckCircle2,
  FileText,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Star,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
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

type ResourceCategory =
  | "PRACTICE_NOTES"
  | "MUSIC_THEORY"
  | "VOCAL_TRAINING"
  | "INSTRUMENT_GUIDES";

type ResourceType =
  | "PDF"
  | "VIDEO"
  | "LINK";

type ResourceLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "ALL_LEVELS";

/*
 * =====================================
 * CONSTANTS
 * =====================================
 */

const MAX_COVER_SIZE =
  10 * 1024 * 1024;

const MAX_RESOURCE_SIZE =
  20 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/*
 * =====================================
 * FILE SIZE FORMATTER
 * =====================================
 */

function formatFileSize(
  bytes: number,
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

/*
 * =====================================
 * MAIN COMPONENT
 * =====================================
 */

export default function ResourceCreateForm() {
  const router =
    useRouter();

  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const resourceInputRef =
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
    loading,
    setLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

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
    useState<ResourceCategory>(
      "PRACTICE_NOTES",
    );

  const [
    resourceType,
    setResourceType,
  ] =
    useState<ResourceType>(
      "PDF",
    );

  const [level, setLevel] =
    useState<ResourceLevel>(
      "ALL_LEVELS",
    );

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    resourceUrl,
    setResourceUrl,
  ] = useState("");

  /*
   * =====================================
   * RESOURCE FILE
   * =====================================
   */

  const [
    resourceFile,
    setResourceFile,
  ] =
    useState<File | null>(
      null,
    );

  /*
   * =====================================
   * COVER IMAGE
   * =====================================
   */

  const [
    coverImage,
    setCoverImage,
  ] =
    useState<File | null>(
      null,
    );

  const [
    coverPreview,
    setCoverPreview,
  ] = useState("");

  /*
   * =====================================
   * VISIBILITY STATE
   * =====================================
   */

  const [
    isFeatured,
    setIsFeatured,
  ] = useState(false);

  const [
    isPublished,
    setIsPublished,
  ] = useState(true);

  /*
   * =====================================
   * RESET FORM
   * =====================================
   */

  function resetForm() {
    setTitle("");

    setCategory(
      "PRACTICE_NOTES",
    );

    setResourceType(
      "PDF",
    );

    setLevel(
      "ALL_LEVELS",
    );

    setDescription("");

    setResourceUrl("");

    setResourceFile(null);

    setCoverImage(null);

    if (coverPreview) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    setCoverPreview("");

    setIsFeatured(false);

    setIsPublished(true);

    setError("");

    setSuccess("");

    if (
      coverInputRef.current
    ) {
      coverInputRef.current.value =
        "";
    }

    if (
      resourceInputRef.current
    ) {
      resourceInputRef.current.value =
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

    setSuccess("");

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
   * RESOURCE TYPE CHANGE
   * =====================================
   */

  function changeResourceType(
    nextType: ResourceType,
  ) {
    setResourceType(
      nextType,
    );

    setError("");

    if (
      nextType === "PDF"
    ) {
      setResourceUrl("");
    } else {
      setResourceFile(null);

      if (
        resourceInputRef.current
      ) {
        resourceInputRef.current.value =
          "";
      }
    }
  }

  /*
   * =====================================
   * PDF FILE CHANGE
   * =====================================
   */

  function handleResourceFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    setError("");

    if (!file) {
      setResourceFile(null);

      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      setError(
        "Resource file must be a PDF.",
      );

      setResourceFile(null);

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_RESOURCE_SIZE
    ) {
      setError(
        "PDF file cannot exceed 20 MB.",
      );

      setResourceFile(null);

      event.target.value =
        "";

      return;
    }

    setResourceFile(file);
  }

  /*
   * =====================================
   * REMOVE PDF
   * =====================================
   */

  function removeResourceFile() {
    setResourceFile(null);

    if (
      resourceInputRef.current
    ) {
      resourceInputRef.current.value =
        "";
    }
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
      return;
    }

    if (
      !allowedImageTypes.includes(
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

    if (coverPreview) {
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

  /*
   * =====================================
   * REMOVE COVER
   * =====================================
   */

  function removeCoverImage() {
    if (coverPreview) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    setCoverImage(null);

    setCoverPreview("");

    if (
      coverInputRef.current
    ) {
      coverInputRef.current.value =
        "";
    }
  }

  /*
   * =====================================
   * URL VALIDATION
   * =====================================
   */

  function validHttpUrl(
    value: string,
  ) {
    try {
      const url =
        new URL(value);

      return (
        url.protocol ===
          "http:" ||
        url.protocol ===
          "https:"
      );
    } catch {
      return false;
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
     * BASIC VALIDATION
     */

    if (
      title.trim().length <
      3
    ) {
      setError(
        "Resource title must be at least 3 characters.",
      );

      return;
    }

    if (
      description.length >
      1000
    ) {
      setError(
        "Description cannot exceed 1000 characters.",
      );

      return;
    }

    /*
     * PDF VALIDATION
     */

    if (
      resourceType ===
        "PDF" &&
      !resourceFile
    ) {
      setError(
        "Please upload a PDF resource file.",
      );

      return;
    }

    /*
     * VIDEO / LINK VALIDATION
     */

    if (
      (resourceType ===
        "VIDEO" ||
        resourceType ===
          "LINK") &&
      !validHttpUrl(
        resourceUrl.trim(),
      )
    ) {
      setError(
        resourceType ===
          "VIDEO"
          ? "Please provide a valid video URL."
          : "Please provide a valid resource URL.",
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * FORM DATA
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
        "resourceType",
        resourceType,
      );

      formData.append(
        "level",
        level,
      );

      formData.append(
        "description",
        description.trim(),
      );

      formData.append(
        "resourceUrl",
        resourceUrl.trim(),
      );

      formData.append(
        "isFeatured",
        String(
          isFeatured,
        ),
      );

      formData.append(
        "isPublished",
        String(
          isPublished,
        ),
      );

      if (
        resourceType ===
          "PDF" &&
        resourceFile
      ) {
        formData.append(
          "resourceFile",
          resourceFile,
        );
      }

      if (coverImage) {
        formData.append(
          "coverImage",
          coverImage,
        );
      }

      /*
       * REQUEST
       */

      const response =
        await fetch(
          "/api/admin/resources",
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
            "Unable to create resource.",
        );
      }

      /*
       * SUCCESS
       */

      setSuccess(
        "Resource created successfully.",
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
          : "Unable to create resource.",
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
      {/* CREATE BUTTON */}

      <button
        type="button"
        onClick={openModal}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-5 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-700"
      >
        <Plus className="h-4 w-4" />

        Create Resource
      </button>

      {/* MODAL */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Resource"
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

            {/* HEADER */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 sm:px-7">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                  Resource Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Create New Resource
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-8 px-6 py-7 sm:px-7"
            >

              {/* BASIC INFORMATION */}

              <section>

                <SectionHeading
                  title="Basic Information"
                  description="Main details about this learning resource."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  {/* TITLE */}

                  <div className="md:col-span-2">

                    <label className="text-xs font-bold text-slate-700">
                      Resource Title{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      required
                      maxLength={
                        180
                      }
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
                      placeholder="Example: Guitar Basic Chords"
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />

                  </div>

                  {/* CATEGORY */}

                  <div>

                    <label className="text-xs font-bold text-slate-700">
                      Resource Category{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </label>

                    <select
                      value={
                        category
                      }
                      onChange={(
                        event,
                      ) =>
                        setCategory(
                          event
                            .target
                            .value as ResourceCategory,
                        )
                      }
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="PRACTICE_NOTES">
                        Practice Notes
                      </option>

                      <option value="MUSIC_THEORY">
                        Music Theory
                      </option>

                      <option value="VOCAL_TRAINING">
                        Vocal Training
                      </option>

                      <option value="INSTRUMENT_GUIDES">
                        Instrument Guides
                      </option>
                    </select>

                  </div>

                  {/* LEVEL */}

                  <div>

                    <label className="text-xs font-bold text-slate-700">
                      Learning Level
                    </label>

                    <select
                      value={
                        level
                      }
                      onChange={(
                        event,
                      ) =>
                        setLevel(
                          event
                            .target
                            .value as ResourceLevel,
                        )
                      }
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="ALL_LEVELS">
                        All Levels
                      </option>

                      <option value="BEGINNER">
                        Beginner
                      </option>

                      <option value="INTERMEDIATE">
                        Intermediate
                      </option>

                      <option value="ADVANCED">
                        Advanced
                      </option>
                    </select>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="md:col-span-2">

                    <div className="flex items-center justify-between gap-3">

                      <label className="text-xs font-bold text-slate-700">
                        Description
                      </label>

                      <span className="text-[10px] text-slate-400">
                        {
                          description.length
                        }
                        /1000
                      </span>

                    </div>

                    <textarea
                      rows={4}
                      maxLength={
                        1000
                      }
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
                      placeholder="Describe what students can learn from this resource..."
                      className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />

                  </div>

                </div>

              </section>

              {/* RESOURCE TYPE */}

              <section className="border-t border-slate-100 pt-7">

                <SectionHeading
                  title="Resource Type"
                  description="Choose whether this is a PDF, video tutorial or external resource."
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-3">

                  <ResourceTypeButton
                    active={
                      resourceType ===
                      "PDF"
                    }
                    icon={
                      <FileText />
                    }
                    title="PDF"
                    description="Downloadable notes"
                    onClick={() =>
                      changeResourceType(
                        "PDF",
                      )
                    }
                  />

                  <ResourceTypeButton
                    active={
                      resourceType ===
                      "VIDEO"
                    }
                    icon={
                      <Video />
                    }
                    title="Video"
                    description="Tutorial or lesson"
                    onClick={() =>
                      changeResourceType(
                        "VIDEO",
                      )
                    }
                  />

                  <ResourceTypeButton
                    active={
                      resourceType ===
                      "LINK"
                    }
                    icon={
                      <Link2 />
                    }
                    title="External Link"
                    description="Online learning material"
                    onClick={() =>
                      changeResourceType(
                        "LINK",
                      )
                    }
                  />

                </div>

                {/* PDF FILE INPUT */}

                {resourceType ===
                  "PDF" && (
                  <div className="mt-5">

                    <input
                      ref={
                        resourceInputRef
                      }
                      type="file"
                      accept="application/pdf"
                      onChange={
                        handleResourceFileChange
                      }
                      className="hidden"
                    />

                    {!resourceFile ? (
                      <button
                        type="button"
                        onClick={() =>
                          resourceInputRef.current?.click()
                        }
                        className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-[#fafbff] px-5 text-center transition hover:border-red-300 hover:bg-red-50/20"
                      >
                        <UploadCloud className="h-7 w-7 text-red-600" />

                        <p className="mt-3 text-sm font-bold text-slate-900">
                          Choose PDF file
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          PDF only.
                          Maximum 20 MB.
                        </p>
                      </button>
                    ) : (
                      <div className="rounded-xl border border-green-200 bg-green-50/60 p-5">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">

                              <div className="flex items-center gap-2">

                                <CheckCircle2 className="h-4 w-4 text-green-600" />

                                <span className="text-[10px] font-black uppercase tracking-[0.08em] text-green-700">
                                  File Selected
                                </span>

                              </div>

                              <p className="mt-1 truncate text-sm font-bold text-slate-900">
                                {
                                  resourceFile.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  formatFileSize(
                                    resourceFile.size,
                                  )
                                }
                              </p>

                            </div>

                          </div>

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                resourceInputRef.current?.click()
                              }
                              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600"
                            >
                              Change
                            </button>

                            <button
                              type="button"
                              onClick={
                                removeResourceFile
                              }
                              aria-label="Remove PDF"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </button>

                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* VIDEO / LINK URL */}

                {(resourceType ===
                  "VIDEO" ||
                  resourceType ===
                    "LINK") && (
                  <div className="mt-5">

                    <label className="text-xs font-bold text-slate-700">

                      {resourceType ===
                      "VIDEO"
                        ? "Video URL"
                        : "Resource URL"}

                      {" "}

                      <span className="text-red-600">
                        *
                      </span>

                    </label>

                    <input
                      type="url"
                      required
                      value={
                        resourceUrl
                      }
                      onChange={(
                        event,
                      ) =>
                        setResourceUrl(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder={
                        resourceType ===
                        "VIDEO"
                          ? "https://youtube.com/..."
                          : "https://example.com/resource"
                      }
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />

                  </div>
                )}

              </section>

              {/* COVER IMAGE */}

              <section className="border-t border-slate-100 pt-7">

                <SectionHeading
                  title="Cover Image"
                  description="Optional image used for featured resources and resource cards."
                />

                <input
                  ref={
                    coverInputRef
                  }
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
                      coverInputRef.current?.click()
                    }
                    className="mt-5 flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-[#fafbff] px-6 text-center transition hover:border-red-300 hover:bg-red-50/20"
                  >
                    <UploadCloud className="h-7 w-7 text-red-600" />

                    <p className="mt-3 text-sm font-bold text-slate-900">
                      Choose cover image
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG, WEBP
                      or GIF. Maximum
                      10 MB.
                    </p>
                  </button>
                ) : (
                  <div className="mt-5 overflow-hidden rounded-xl border border-green-200 bg-green-50/40">

                    <div className="relative">

                      {/* eslint-disable-next-line @next/next/no-img-element */}

                      <img
                        src={
                          coverPreview
                        }
                        alt="Resource cover preview"
                        className="h-64 w-full object-cover"
                      />

                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.07em] text-white shadow-md">

                        <CheckCircle2 className="h-3.5 w-3.5" />

                        Cover Selected

                      </div>

                    </div>

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                          <ImageIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-900">
                            {
                              coverImage
                                ?.name
                            }
                          </p>

                          {coverImage && (
                            <p className="mt-1 text-xs text-slate-500">
                              {
                                formatFileSize(
                                  coverImage.size,
                                )
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            coverInputRef.current?.click()
                          }
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600"
                        >
                          Change
                        </button>

                        <button
                          type="button"
                          onClick={
                            removeCoverImage
                          }
                          aria-label="Remove cover image"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>

                      </div>

                    </div>

                  </div>
                )}

              </section>

              {/* VISIBILITY */}

              <section className="border-t border-slate-100 pt-7">

                <SectionHeading
                  title="Visibility & Featured"
                  description="Control where and how this resource appears."
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">

                  {/* PUBLISHED */}

                  <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 bg-[#fafbff] p-5">

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

                    <div>

                      <div className="flex items-center gap-2">

                        <BookOpen className="h-4 w-4 text-red-600" />

                        <p className="text-sm font-bold text-slate-900">
                          Publish Resource
                        </p>

                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Published
                        resources will
                        appear on the
                        public Resources
                        page.
                      </p>

                    </div>

                  </label>

                  {/* FEATURED */}

                  <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 bg-[#fafbff] p-5">

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

                    <div>

                      <div className="flex items-center gap-2">

                        <Star className="h-4 w-4 text-red-600" />

                        <p className="text-sm font-bold text-slate-900">
                          Featured Resource
                        </p>

                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Show this resource
                        prominently in the
                        Resources hero
                        section.
                      </p>

                    </div>

                  </label>

                </div>

              </section>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">

                  <CheckCircle2 className="h-5 w-5 shrink-0" />

                  {success}

                </div>
              )}

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    loading
                  }
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-xs font-bold uppercase tracking-[0.06em] text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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

                      Create Resource
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

/*
 * =====================================
 * RESOURCE TYPE BUTTON
 * =====================================
 */

function ResourceTypeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;

  icon: ReactNode;

  title: string;

  description: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-5 text-left transition ${
        active
          ? "border-red-500 bg-red-50"
          : "border-slate-200 bg-[#fafbff] hover:border-red-200"
      }`}
    >

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${
          active
            ? "bg-red-600 text-white"
            : "bg-white text-red-600"
        }`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-black text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </button>
  );
}