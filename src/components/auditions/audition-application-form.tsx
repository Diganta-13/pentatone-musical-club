"use client";

import {
  CheckCircle2,
  FileVideo2,
  Loader2,
  Mic2,
  Send,
  UploadCloud,
  X,
} from "lucide-react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

/*
 * =====================================
 * TYPES
 * =====================================
 */

type Department = {
  id: number;

  name: string;

  shortName: string;
};

type ExistingApplication = {
  id: number;

  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";
};

type FormLoadResponse = {
  success?: boolean;

  message?: string;

  session?: {
    id: number;

    title: string;

    status:
      | "DRAFT"
      | "OPEN"
      | "CLOSED"
      | "COMPLETED";

    isPublished: boolean;

    deadlinePassed: boolean;
  };

  departments?: Department[];

  defaults?: {
    studentId: string;

    departmentId:
      | number
      | null;
  };

  existingApplication?:
    | ExistingApplication
    | null;
};

type Props = {
  sessionId: number;

  sessionTitle: string;
};

/*
 * =====================================
 * CONSTANTS
 * =====================================
 */

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
];

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function AuditionApplicationForm({
  sessionId,
  sessionTitle,
}: Props) {
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

  const [loading, setLoading] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  /*
   * =====================================
   * SESSION
   * =====================================
   */

  const [
    existingApplication,
    setExistingApplication,
  ] =
    useState<ExistingApplication | null>(
      null,
    );

  /*
   * =====================================
   * DEPARTMENTS
   * =====================================
   */

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>(
    [],
  );

  /*
   * =====================================
   * FORM
   * =====================================
   */

  const [
    studentId,
    setStudentId,
  ] = useState("");

  const [
    departmentId,
    setDepartmentId,
  ] = useState("");

  const [
    instrument,
    setInstrument,
  ] = useState("");

  const [
    experienceYears,
    setExperienceYears,
  ] = useState("");

  const [
    experienceDetails,
    setExperienceDetails,
  ] = useState("");

  const [
    applicantNote,
    setApplicantNote,
  ] = useState("");

  /*
   * =====================================
   * VIDEO
   * =====================================
   */

  const [
    video,
    setVideo,
  ] = useState<File | null>(
    null,
  );

  /*
   * =====================================
   * BODY SCROLL
   * =====================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    const oldPadding =
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

    return () => {
      document.body.style.overflow =
        oldOverflow;

      document.body.style.paddingRight =
        oldPadding;
    };
  }, [open]);

  /*
   * =====================================
   * SAFE JSON
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
   * OPEN APPLICATION
   * =====================================
   */

  async function handleOpen() {
    if (
      loading ||
      submitted
    ) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const response =
        await fetch(
          `/api/auditions/${sessionId}/apply`,
          {
            method:
              "GET",

            cache:
              "no-store",
          },
        );

      /*
       * =====================================
       * LOGIN
       * =====================================
       */

      if (
        response.status ===
        401
      ) {
        router.push(
          "/login",
        );

        return;
      }

      const data =
        (await readResponse(
          response,
        )) as FormLoadResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to open application form.",
        );
      }

      /*
       * =====================================
       * SESSION AVAILABILITY
       * =====================================
       */

      if (
        !data.session
      ) {
        throw new Error(
          "Audition session could not be loaded.",
        );
      }

      if (
        data.session.status !==
          "OPEN" ||
        !data.session
          .isPublished
      ) {
        throw new Error(
          "This audition is no longer accepting applications.",
        );
      }

      if (
        data.session
          .deadlinePassed
      ) {
        throw new Error(
          "The application deadline has passed.",
        );
      }

      /*
       * =====================================
       * EXISTING APPLICATION
       * =====================================
       */

      if (
        data.existingApplication
      ) {
        setExistingApplication(
          data.existingApplication,
        );

        setOpen(true);

        return;
      }

      /*
       * =====================================
       * FORM DATA
       * =====================================
       */

      setDepartments(
        data.departments ||
          [],
      );

      setStudentId(
        data.defaults
          ?.studentId ||
          "",
      );

      setDepartmentId(
        data.defaults
          ?.departmentId
          ? String(
              data.defaults
                .departmentId,
            )
          : "",
      );

      setOpen(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to open application form.",
      );

      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================
   * CLOSE
   * =====================================
   */

  function closeModal() {
    if (submitting) {
      return;
    }

    setOpen(false);

    setError("");
  }

  /*
   * =====================================
   * VIDEO CHANGE
   * =====================================
   */

  function handleVideoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ||
      null;

    setError("");

    if (!file) {
      setVideo(null);

      return;
    }

    /*
     * TYPE
     */

    if (
      !allowedVideoTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Audition video must be MP4, WEBM, MOV or M4V.",
      );

      event.target.value =
        "";

      setVideo(null);

      return;
    }

    /*
     * SIZE
     */

    if (
      file.size >
      MAX_VIDEO_SIZE
    ) {
      setError(
        "Audition video cannot exceed 100 MB.",
      );

      event.target.value =
        "";

      setVideo(null);

      return;
    }

    setVideo(file);
  }

  /*
   * =====================================
   * REMOVE VIDEO
   * =====================================
   */

  function removeVideo() {
    setVideo(null);

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

    if (submitting) {
      return;
    }

    setError("");

    /*
     * STUDENT ID
     */

    if (
      studentId.trim().length <
      2
    ) {
      setError(
        "Please enter your Student ID.",
      );

      return;
    }

    /*
     * DEPARTMENT
     */

    if (!departmentId) {
      setError(
        "Please select your department.",
      );

      return;
    }

    /*
     * INSTRUMENT
     */

    if (
      instrument.trim().length <
      2
    ) {
      setError(
        "Please enter your instrument or musical role.",
      );

      return;
    }

    /*
     * EXPERIENCE
     */

    if (
      experienceYears
    ) {
      const years =
        Number(
          experienceYears,
        );

      if (
        !Number.isFinite(
          years,
        ) ||
        years < 0 ||
        years > 99
      ) {
        setError(
          "Experience must be between 0 and 99 years.",
        );

        return;
      }
    }

    /*
     * VIDEO
     */

    if (!video) {
      setError(
        "Please upload your audition video.",
      );

      return;
    }

    try {
      setSubmitting(true);

      /*
       * =====================================
       * FORM DATA
       * =====================================
       */

      const formData =
        new FormData();

      formData.append(
        "studentId",
        studentId.trim(),
      );

      formData.append(
        "departmentId",
        departmentId,
      );

      formData.append(
        "instrument",
        instrument.trim(),
      );

      formData.append(
        "experienceYears",
        experienceYears,
      );

      formData.append(
        "experienceDetails",
        experienceDetails.trim(),
      );

      formData.append(
        "applicantNote",
        applicantNote.trim(),
      );

      formData.append(
        "video",
        video,
      );

      /*
       * =====================================
       * REQUEST
       * =====================================
       */

      const response =
        await fetch(
          `/api/auditions/${sessionId}/apply`,
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      if (
        response.status ===
        401
      ) {
        router.push(
          "/login",
        );

        return;
      }

      const data =
        await readResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit audition application.",
        );
      }

      /*
       * =====================================
       * SUCCESS
       * =====================================
       */

      setSubmitted(true);

      setExistingApplication({
        id:
          data.application
            ?.id ||
          0,

        status:
          "PENDING",
      });

      /*
       * Refresh public card applicant count.
       */

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit audition application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * =====================================
   * STATUS TEXT
   * =====================================
   */

  const applicationStatus =
    existingApplication
      ?.status;

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <>
      {/* ================================= */}
      {/* APPLY BUTTON */}
      {/* ================================= */}

      <button
        type="button"
        onClick={() =>
          void handleOpen()
        }
        disabled={
          loading ||
          submitted
        }
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-[0.08em] text-white transition ${
          submitted
            ? "cursor-default bg-green-600"
            : "bg-[#d40000] hover:bg-[#b80000]"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />

            Loading...
          </>
        ) : submitted ? (
          <>
            <CheckCircle2 className="h-4 w-4" />

            Application Submitted
          </>
        ) : (
          <>
            <Mic2 className="h-4 w-4" />

            Apply Now
          </>
        )}
      </button>

      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Audition Application"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !submitting
            ) {
              closeModal();
            }
          }}
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
        >
          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 sm:px-7">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d40000]">
                  Pentatone Auditions
                </p>

                <h2 className="mt-1 text-xl font-black text-[#101828]">
                  Audition Application
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {sessionTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ================================= */}
            {/* ALREADY APPLIED */}
            {/* ================================= */}

            {existingApplication ? (
              <div className="px-6 py-14 text-center sm:px-7">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-xl font-black text-[#101828]">
                  Application Already
                  Submitted
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  You have already
                  submitted an
                  application for this
                  audition session.
                </p>

                <div className="mx-auto mt-6 max-w-xs rounded-xl bg-[#f7f8fc] p-4">
                  <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Current Status
                  </p>

                  <p
                    className={`mt-2 text-sm font-black uppercase ${
                      applicationStatus ===
                      "APPROVED"
                        ? "text-green-600"
                        : applicationStatus ===
                            "REJECTED"
                          ? "text-red-600"
                          : applicationStatus ===
                              "UNDER_REVIEW"
                            ? "text-amber-600"
                            : "text-blue-600"
                    }`}
                  >
                    {formatStatus(
                      applicationStatus ||
                        "PENDING",
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="mt-7 h-11 rounded-lg bg-[#101828] px-8 text-[10px] font-black uppercase tracking-[0.08em] text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              /* ================================= */
              /* APPLICATION FORM */
              /* ================================= */

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
                    title="Student Information"
                    description="Provide your academic information for the audition application."
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {/* STUDENT ID */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Student ID{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={
                          studentId
                        }
                        onChange={(
                          event,
                        ) =>
                          setStudentId(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          submitting
                        }
                        placeholder="Example: 2024-1-60-001"
                        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    {/* DEPARTMENT */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Department{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </label>

                      <select
                        required
                        value={
                          departmentId
                        }
                        onChange={(
                          event,
                        ) =>
                          setDepartmentId(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          submitting
                        }
                        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      >
                        <option value="">
                          Select Department
                        </option>

                        {departments.map(
                          (
                            department,
                          ) => (
                            <option
                              key={
                                department.id
                              }
                              value={
                                department.id
                              }
                            >
                              {
                                department.shortName
                              }{" "}
                              —{" "}
                              {
                                department.name
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                </section>

                {/* ================================= */}
                {/* MUSICAL INFO */}
                {/* ================================= */}

                <section className="border-t border-slate-100 pt-7">
                  <SectionHeading
                    title="Musical Profile"
                    description="Tell the evaluators about your musical role and experience."
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {/* INSTRUMENT */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Instrument / Role{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={
                          instrument
                        }
                        onChange={(
                          event,
                        ) =>
                          setInstrument(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          submitting
                        }
                        placeholder="Vocals, Electric Guitar, Drums..."
                        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    {/* EXPERIENCE YEARS */}

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Experience
                        (Years)
                      </label>

                      <input
                        type="number"
                        min={0}
                        max={99}
                        step={0.5}
                        value={
                          experienceYears
                        }
                        onChange={(
                          event,
                        ) =>
                          setExperienceYears(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          submitting
                        }
                        placeholder="Example: 2"
                        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 text-sm text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    {/* EXPERIENCE DETAILS */}

                    <div className="md:col-span-2">
                      <div className="flex justify-between gap-3">
                        <label className="text-xs font-bold text-slate-700">
                          Experience Details
                        </label>

                        <span className="text-[10px] text-slate-400">
                          {
                            experienceDetails.length
                          }
                          /500
                        </span>
                      </div>

                      <textarea
                        rows={4}
                        maxLength={500}
                        value={
                          experienceDetails
                        }
                        onChange={(
                          event,
                        ) =>
                          setExperienceDetails(
                            event
                              .target
                              .value,
                          )
                        }
                        disabled={
                          submitting
                        }
                        placeholder="Bands, stage performances, competitions, training or other relevant experience..."
                        className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>
                </section>

                {/* ================================= */}
                {/* VIDEO */}
                {/* ================================= */}

                <section className="border-t border-slate-100 pt-7">
                  <SectionHeading
                    title="Audition Performance"
                    description="Upload the performance video that will be reviewed by the Pentatone evaluators."
                  />

                  <div className="mt-5">
                    {!video ? (
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#f8f9fd] px-6 py-10 text-center transition hover:border-red-300">
                        <UploadCloud className="h-7 w-7 text-[#d40000]" />

                        <p className="mt-3 text-sm font-black text-[#101828]">
                          Upload Audition
                          Video
                        </p>

                        <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                          MP4, WEBM, MOV
                          or M4V. Maximum
                          file size 100 MB.
                        </p>

                        <input
                          ref={
                            fileInputRef
                          }
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                          onChange={
                            handleVideoChange
                          }
                          disabled={
                            submitting
                          }
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-[#f8f9fd] p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#101828] text-white">
                            <FileVideo2 className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-[#101828]">
                              {
                                video.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatFileSize(
                                video.size,
                              )}
                            </p>

                            <button
                              type="button"
                              onClick={
                                removeVideo
                              }
                              disabled={
                                submitting
                              }
                              className="mt-3 text-[10px] font-black uppercase tracking-[0.05em] text-red-600"
                            >
                              Remove Video
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* ================================= */}
                {/* NOTE */}
                {/* ================================= */}

                <section className="border-t border-slate-100 pt-7">
                  <div className="flex justify-between gap-3">
                    <label className="text-xs font-bold text-slate-700">
                      Additional Note
                    </label>

                    <span className="text-[10px] text-slate-400">
                      {
                        applicantNote.length
                      }
                      /3000
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    maxLength={3000}
                    value={
                      applicantNote
                    }
                    onChange={(
                      event,
                    ) =>
                      setApplicantNote(
                        event
                          .target
                          .value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="Anything else you want the evaluators to know..."
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8f9fd] px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                </section>

                {/* ================================= */}
                {/* ERROR */}
                {/* ================================= */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
                      submitting
                    }
                    className="h-11 rounded-lg border border-slate-200 px-5 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting
                    }
                    className="inline-flex h-11 min-w-[190px] items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-xs font-black uppercase tracking-[0.05em] text-white transition hover:bg-[#b80000] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />

                        Submit Application
                      </>
                    )}
                  </button>
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
      <h3 className="text-sm font-black text-[#101828]">
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
 * STATUS
 * =====================================
 */

function formatStatus(
  status: string,
) {
  return status
    .replaceAll(
      "_",
      " ",
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

/*
 * =====================================
 * FILE SIZE
 * =====================================
 */

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