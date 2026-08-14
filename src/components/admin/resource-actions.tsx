"use client";

import {
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

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

type ResourceData = {
  id: number;
  title: string;
  category: ResourceCategory;
  resourceType: ResourceType;
  level: ResourceLevel;
  description: string | null;
  resourceUrl: string | null;
  filePath: string | null;
  coverImage: string | null;
  isFeatured: boolean;
  isPublished: boolean;
};

export default function ResourceActions({
  resource,
}: {
  resource: ResourceData;
}) {
  const router = useRouter();

  const pdfInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [title, setTitle] =
    useState(resource.title);

  const [
    category,
    setCategory,
  ] =
    useState<ResourceCategory>(
      resource.category,
    );

  const [
    resourceType,
    setResourceType,
  ] =
    useState<ResourceType>(
      resource.resourceType,
    );

  const [level, setLevel] =
    useState<ResourceLevel>(
      resource.level,
    );

  const [
    description,
    setDescription,
  ] = useState(
    resource.description ?? "",
  );

  const [
    resourceUrl,
    setResourceUrl,
  ] = useState(
    resource.resourceUrl ?? "",
  );

  const [
    replacementPdf,
    setReplacementPdf,
  ] = useState<File | null>(
    null,
  );

  const [
    coverImage,
    setCoverImage,
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

  const [
    isFeatured,
    setIsFeatured,
  ] = useState(
    resource.isFeatured,
  );

  const [
    isPublished,
    setIsPublished,
  ] = useState(
    resource.isPublished,
  );

  function resetForm() {
    setTitle(resource.title);

    setCategory(
      resource.category,
    );

    setResourceType(
      resource.resourceType,
    );

    setLevel(
      resource.level,
    );

    setDescription(
      resource.description ?? "",
    );

    setResourceUrl(
      resource.resourceUrl ?? "",
    );

    setReplacementPdf(null);

    setCoverImage(null);

    if (newCoverPreview) {
      URL.revokeObjectURL(
        newCoverPreview,
      );
    }

    setNewCoverPreview("");

    setRemoveCover(false);

    setIsFeatured(
      resource.isFeatured,
    );

    setIsPublished(
      resource.isPublished,
    );

    setError("");

    setSuccess("");

    if (pdfInputRef.current) {
      pdfInputRef.current.value =
        "";
    }

    if (
      coverInputRef.current
    ) {
      coverInputRef.current.value =
        "";
    }
  }

  function closeModal() {
    if (loading) {
      return;
    }

    resetForm();

    setOpen(false);
  }

  function formatFileSize(
    bytes: number,
  ) {
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

  function handlePdfChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    setError("");

    if (!file) {
      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      setError(
        "Resource file must be a PDF.",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      20 * 1024 * 1024
    ) {
      setError(
        "PDF cannot exceed 20 MB.",
      );

      event.target.value = "";

      return;
    }

    setReplacementPdf(file);
  }

  function handleCoverChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    setError("");

    if (!file) {
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !allowed.includes(
        file.type,
      )
    ) {
      setError(
        "Cover image must be JPG, PNG, WEBP or GIF.",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Cover image cannot exceed 10 MB.",
      );

      event.target.value = "";

      return;
    }

    if (newCoverPreview) {
      URL.revokeObjectURL(
        newCoverPreview,
      );
    }

    const preview =
      URL.createObjectURL(file);

    setCoverImage(file);

    setNewCoverPreview(
      preview,
    );

    setRemoveCover(false);
  }

  function removeCoverImage() {
    if (newCoverPreview) {
      URL.revokeObjectURL(
        newCoverPreview,
      );
    }

    setNewCoverPreview("");

    setCoverImage(null);

    setRemoveCover(true);

    if (
      coverInputRef.current
    ) {
      coverInputRef.current.value =
        "";
    }
  }

  function changeType(
    type: ResourceType,
  ) {
    setResourceType(type);

    setError("");

    if (type === "PDF") {
      setResourceUrl("");
    } else {
      setReplacementPdf(null);

      if (pdfInputRef.current) {
        pdfInputRef.current.value =
          "";
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      title.trim().length < 3
    ) {
      setError(
        "Title must be at least 3 characters.",
      );

      return;
    }

    if (
      (resourceType ===
        "VIDEO" ||
        resourceType ===
          "LINK") &&
      !resourceUrl.trim()
    ) {
      setError(
        "Please provide the resource URL.",
      );

      return;
    }

    try {
      setLoading(true);

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
        String(isFeatured),
      );

      formData.append(
        "isPublished",
        String(isPublished),
      );

      formData.append(
        "removeCover",
        String(removeCover),
      );

      if (
        resourceType ===
          "PDF" &&
        replacementPdf
      ) {
        formData.append(
          "resourceFile",
          replacementPdf,
        );
      }

      if (coverImage) {
        formData.append(
          "coverImage",
          coverImage,
        );
      }

      const response =
        await fetch(
          `/api/admin/resources/${resource.id}`,
          {
            method: "PATCH",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update resource.",
        );
      }

      setSuccess(
        "Resource updated successfully.",
      );

      router.refresh();

      window.setTimeout(
        () => {
          setOpen(false);
        },
        600,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update resource.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Delete "${resource.title}"?\n\nThis will permanently remove the resource and uploaded files.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response =
        await fetch(
          `/api/admin/resources/${resource.id}`,
          {
            method: "DELETE",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete resource.",
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete resource.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const displayedCover =
    newCoverPreview ||
    (!removeCover
      ? resource.coverImage
      : null);

  return (
    <>
      <div className="flex items-center gap-2">

        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-black uppercase tracking-[0.05em] text-slate-700 transition hover:border-red-200 hover:text-red-600"
        >
          <Pencil className="h-3.5 w-3.5" />

          Edit
        </button>

        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[9px] font-black uppercase tracking-[0.05em] text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}

          Delete
        </button>

      </div>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-600">
                  Resource Management
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Edit Resource
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-7 p-6"
            >

              {/* TITLE */}

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Resource Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event.target
                        .value,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-red-300"
                />
              </div>

              {/* CATEGORY + LEVEL */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(
                      event,
                    ) =>
                      setCategory(
                        event.target
                          .value as ResourceCategory,
                      )
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm"
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

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Level
                  </label>

                  <select
                    value={level}
                    onChange={(
                      event,
                    ) =>
                      setLevel(
                        event.target
                          .value as ResourceLevel,
                      )
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm"
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

              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  maxLength={1000}
                  value={description}
                  onChange={(
                    event,
                  ) =>
                    setDescription(
                      event.target
                        .value,
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-red-300"
                />
              </div>

              {/* RESOURCE TYPE */}

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Resource Type
                </label>

                <div className="mt-3 grid grid-cols-3 gap-3">

                  {(
                    [
                      "PDF",
                      "VIDEO",
                      "LINK",
                    ] as ResourceType[]
                  ).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          changeType(
                            type,
                          )
                        }
                        className={`rounded-lg border px-4 py-3 text-xs font-black ${
                          resourceType ===
                          type
                            ? "border-red-500 bg-red-50 text-red-600"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {type ===
                        "LINK"
                          ? "EXTERNAL LINK"
                          : type}
                      </button>
                    ),
                  )}

                </div>
              </div>

              {/* PDF */}

              {resourceType ===
                "PDF" && (
                <div>

                  <input
                    ref={
                      pdfInputRef
                    }
                    type="file"
                    accept="application/pdf"
                    onChange={
                      handlePdfChange
                    }
                    className="hidden"
                  />

                  {replacementPdf ? (
                    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">

                      <div className="flex items-center gap-3">

                        <FileText className="h-5 w-5 text-red-600" />

                        <div>
                          <p className="text-xs font-bold text-green-700">
                            New PDF Selected
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {
                              replacementPdf.name
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            {
                              formatFileSize(
                                replacementPdf.size,
                              )
                            }
                          </p>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReplacementPdf(
                            null,
                          );

                          if (
                            pdfInputRef.current
                          ) {
                            pdfInputRef.current.value =
                              "";
                          }
                        }}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                      {resource.filePath && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-green-700">

                          <CheckCircle2 className="h-4 w-4" />

                          Current PDF already uploaded

                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          pdfInputRef.current?.click()
                        }
                        className="inline-flex items-center gap-2 text-xs font-bold text-red-600"
                      >
                        <UploadCloud className="h-4 w-4" />

                        Replace PDF
                      </button>

                    </div>
                  )}

                </div>
              )}

              {/* VIDEO / LINK */}

              {(resourceType ===
                "VIDEO" ||
                resourceType ===
                  "LINK") && (
                <div>

                  <label className="text-xs font-bold text-slate-700">
                    {resourceType ===
                    "VIDEO"
                      ? "Video URL"
                      : "Resource URL"}
                  </label>

                  <input
                    type="url"
                    value={
                      resourceUrl
                    }
                    onChange={(
                      event,
                    ) =>
                      setResourceUrl(
                        event.target
                          .value,
                      )
                    }
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-red-300"
                  />

                </div>
              )}

              {/* COVER */}

              <div>

                <label className="text-xs font-bold text-slate-700">
                  Cover Image
                </label>

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

                {displayedCover ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        displayedCover
                      }
                      alt="Resource cover"
                      className="h-52 w-full object-cover"
                    />

                    <div className="flex gap-2 p-4">

                      <button
                        type="button"
                        onClick={() =>
                          coverInputRef.current?.click()
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold"
                      >
                        Change Cover
                      </button>

                      <button
                        type="button"
                        onClick={
                          removeCoverImage
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600"
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      coverInputRef.current?.click()
                    }
                    className="mt-3 flex h-28 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs font-bold text-red-600"
                  >
                    <UploadCloud className="h-4 w-4" />

                    Choose Cover Image
                  </button>
                )}

              </div>

              {/* SETTINGS */}

              <div className="grid gap-4 sm:grid-cols-2">

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">

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
                    className="accent-red-600"
                  />

                  <span className="text-xs font-bold">
                    Published
                  </span>

                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">

                  <input
                    type="checkbox"
                    checked={
                      isFeatured
                    }
                    onChange={(
                      event,
                    ) =>
                      setIsFeatured(
                        event.target
                          .checked,
                      )
                    }
                    className="accent-red-600"
                  />

                  <span className="text-xs font-bold">
                    Featured
                  </span>

                </label>

              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    loading
                  }
                  className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-6 text-xs font-bold text-white disabled:opacity-50"
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {loading
                    ? "Updating..."
                    : "Update Resource"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}