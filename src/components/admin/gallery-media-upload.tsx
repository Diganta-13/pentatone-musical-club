"use client";

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  FileImage,
  FileVideo,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type GalleryMediaUploadProps = {
  programId: number;
};

const MAX_FILES = 10;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export default function GalleryMediaUpload({
  programId,
}: GalleryMediaUploadProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [files, setFiles] =
    useState<File[]>([]);

  const [caption, setCaption] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * ==============================
   * OPEN FILE PICKER
   * ==============================
   */

  function openFilePicker() {
    if (loading) return;

    inputRef.current?.click();
  }

  /*
   * ==============================
   * FILE VALIDATION
   * ==============================
   */

  function validateFile(
    file: File,
  ) {
    const isImage =
      allowedImageTypes.includes(
        file.type,
      );

    const isVideo =
      allowedVideoTypes.includes(
        file.type,
      );

    if (!isImage && !isVideo) {
      return `"${file.name}" is not a supported image or video file.`;
    }

    if (
      isImage &&
      file.size > MAX_IMAGE_SIZE
    ) {
      return `"${file.name}" is larger than 10 MB.`;
    }

    if (
      isVideo &&
      file.size > MAX_VIDEO_SIZE
    ) {
      return `"${file.name}" is larger than 100 MB.`;
    }

    return null;
  }

  /*
   * ==============================
   * SELECT FILES
   * ==============================
   */

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setError("");
    setSuccess("");

    const selectedFiles =
      Array.from(
        event.target.files || [],
      );

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    const combinedFiles = [
      ...files,
      ...selectedFiles,
    ];

    if (
      combinedFiles.length >
      MAX_FILES
    ) {
      setError(
        `You can upload maximum ${MAX_FILES} files at a time.`,
      );

      event.target.value = "";

      return;
    }

    for (
      const file
      of selectedFiles
    ) {
      const validationError =
        validateFile(file);

      if (validationError) {
        setError(
          validationError,
        );

        event.target.value = "";

        return;
      }
    }

    /*
     * Remove exact duplicate selections
     */

    const uniqueFiles =
      combinedFiles.filter(
        (
          file,
          index,
          array,
        ) =>
          array.findIndex(
            (item) =>
              item.name ===
                file.name &&
              item.size ===
                file.size &&
              item.lastModified ===
                file.lastModified,
          ) === index,
      );

    setFiles(uniqueFiles);

    event.target.value = "";
  }

  /*
   * ==============================
   * REMOVE ONE FILE
   * ==============================
   */

  function removeFile(
    index: number,
  ) {
    if (loading) return;

    setError("");
    setSuccess("");

    setFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index,
      ),
    );
  }

  /*
   * ==============================
   * CLEAR ALL
   * ==============================
   */

  function clearFiles() {
    if (loading) return;

    setFiles([]);
    setError("");
    setSuccess("");

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  }

  /*
   * ==============================
   * UPLOAD
   * ==============================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (files.length === 0) {
      setError(
        "Please select at least one photo or video.",
      );

      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      for (
        const file
        of files
      ) {
        formData.append(
          "files",
          file,
        );
      }

      formData.append(
        "caption",
        caption.trim(),
      );

      const response =
        await fetch(
          `/api/admin/gallery/${programId}/media`,
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
            "Unable to upload media.",
        );
      }

      setFiles([]);
      setCaption("");

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }

      setSuccess(
        data.message ||
          "Media uploaded successfully.",
      );

      /*
       * Reload Server Component data
       * so media counts and gallery
       * items update immediately.
       */

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to upload media.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* ============================== */}
      {/* HIDDEN FILE INPUT */}
      {/* ============================== */}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        onChange={
          handleFileChange
        }
        disabled={loading}
        className="hidden"
      />

      {/* ============================== */}
      {/* UPLOAD BOX */}
      {/* ============================== */}

      <div
        className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-red-300 hover:bg-red-50/30"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Upload className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-sm font-bold text-slate-900">
          Select Photos & Videos
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500">
          Add up to 10 files at
          once. Images can be up
          to 10 MB each and videos
          up to 100 MB each.
        </p>

        <button
          type="button"
          onClick={
            openFilePicker
          }
          disabled={loading}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />

          Choose Files
        </button>

        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
          JPG, PNG, WEBP, GIF,
          MP4, WEBM, MOV
        </p>
      </div>

      {/* ============================== */}
      {/* SELECTED FILES */}
      {/* ============================== */}

      {files.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Selected Files
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {files.length} of{" "}
                {MAX_FILES} selected
              </p>
            </div>

            <button
              type="button"
              onClick={
                clearFiles
              }
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-red-600 transition hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />

              Clear All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {files.map(
              (file, index) => {
                const isImage =
                  allowedImageTypes.includes(
                    file.type,
                  );

                return (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    {/* File Icon */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                        isImage
                          ? "bg-red-50 text-red-600"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {isImage ? (
                        <FileImage className="h-5 w-5" />
                      ) : (
                        <FileVideo className="h-5 w-5" />
                      )}
                    </div>

                    {/* File Info */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {file.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.06em] text-slate-400">
                        <span>
                          {isImage
                            ? "Photo"
                            : "Video"}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {formatFileSize(
                            file.size,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(
                          index,
                        )
                      }
                      disabled={
                        loading
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* CAPTION */}
      {/* ============================== */}

      <div>
        <label
          htmlFor="gallery-caption"
          className="text-xs font-bold text-slate-700"
        >
          Caption
          <span className="ml-2 font-normal text-slate-400">
            Optional
          </span>
        </label>

        <input
          id="gallery-caption"
          type="text"
          maxLength={255}
          value={caption}
          onChange={(event) =>
            setCaption(
              event.target.value,
            )
          }
          disabled={loading}
          placeholder="Example: Pentatone performance at CSE Fest 2026"
          className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
        />

        <div className="mt-1.5 text-right text-[10px] text-slate-400">
          {caption.length}/255
        </div>
      </div>

      {/* ============================== */}
      {/* ERROR */}
      {/* ============================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ============================== */}
      {/* SUCCESS */}
      {/* ============================== */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* ============================== */}
      {/* ACTION */}
      {/* ============================== */}

      <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
        <p className="text-xs leading-5 text-slate-500">
          Uploaded files will be
          stored under this
          gallery program.
        </p>

        <button
          type="submit"
          disabled={
            loading ||
            files.length === 0
          }
          className="inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />

              Upload Media
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/*
 * ==============================
 * FILE SIZE FORMAT
 * ==============================
 */

function formatFileSize(
  bytes: number,
) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes /
    Math.pow(
      1024,
      index,
    );

  return `${value.toFixed(
    index === 0 ? 0 : 1,
  )} ${units[index]}`;
}