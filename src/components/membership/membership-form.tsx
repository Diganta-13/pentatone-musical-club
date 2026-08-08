"use client";

import {
  FileCheck2,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";

type Department = {
  id: number;
  name: string;
  shortName: string;
};

type MembershipFormProps = {
  fullName: string;
  email: string;
  departments: Department[];
  previousRejectionNote?: string | null;
};

const skills = [
  "Vocal",
  "Guitar",
  "Keyboard",
  "Drums",
  "Bass",
  "Violin",
  "Flute",
  "Tabla",
  "Other",
];

export default function MembershipForm({
  fullName,
  email,
  departments,
  previousRejectionNote,
}: MembershipFormProps) {
  const router = useRouter();

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const inputClass =
    "h-14 w-full rounded-xl border border-transparent bg-[#eef1ff] px-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-800";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccess("");

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const proof =
      formData.get("proof");

    if (
      !proof ||
      typeof proof === "string" ||
      proof.size === 0
    ) {
      setError(
        "Please upload your student verification document.",
      );

      return;
    }

    if (
      proof.size >
      4 * 1024 * 1024
    ) {
      setError(
        "Verification document must be smaller than 4 MB.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/membership/apply",
        {
          method: "POST",
          body: formData,
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to submit membership application.",
        );

        return;
      }

      setSuccess(
        "Membership application submitted successfully.",
      );

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Heading */}
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
          Membership Application
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
          Apply To Pentatone
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Provide your student information
          for verification by the Pentatone
          administration.
        </p>
      </div>

      {/* Account */}
      <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-bold text-slate-900">
              Applying as {fullName}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {email}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Your account information is
              automatically taken from your
              authenticated session.
            </p>
          </div>
        </div>
      </div>

      {/* Previous rejection */}
      {previousRejectionNote && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-bold text-red-800">
            Previous application was rejected
          </p>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {previousRejectionNote}
          </p>

          <p className="mt-2 text-xs text-red-600">
            You may submit a corrected
            application.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-9"
      >
        {/* Student info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
              Student Information
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Academic Details
            </h2>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            {/* Student ID */}
            <div>
              <label
                htmlFor="studentId"
                className={labelClass}
              >
                Student ID
              </label>

              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                maxLength={100}
                placeholder="e.g. 2022XXXX"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="departmentId"
                className={labelClass}
              >
                Department
              </label>

              <select
                id="departmentId"
                name="departmentId"
                required
                defaultValue=""
                disabled={isSubmitting}
                className={inputClass}
              >
                <option value="" disabled>
                  Select department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.shortName} —{" "}
                      {department.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Session */}
            <div>
              <label
                htmlFor="session"
                className={labelClass}
              >
                Session / Batch
              </label>

              <input
                id="session"
                name="session"
                type="text"
                required
                maxLength={30}
                placeholder="e.g. 2022-23"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            {/* Semester */}
            <div>
              <label
                htmlFor="currentSemester"
                className={labelClass}
              >
                Current Semester
              </label>

              <select
                id="currentSemester"
                name="currentSemester"
                required
                defaultValue=""
                disabled={isSubmitting}
                className={inputClass}
              >
                <option value="" disabled>
                  Select semester
                </option>

                <option value="1st Semester">
                  1st Semester
                </option>

                <option value="2nd Semester">
                  2nd Semester
                </option>

                <option value="3rd Semester">
                  3rd Semester
                </option>

                <option value="4th Semester">
                  4th Semester
                </option>

                <option value="5th Semester">
                  5th Semester
                </option>

                <option value="6th Semester">
                  6th Semester
                </option>

                <option value="7th Semester">
                  7th Semester
                </option>

                <option value="8th Semester">
                  8th Semester
                </option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className={labelClass}
              >
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={30}
                placeholder="+8801XXXXXXXXX"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            {/* Skill */}
            <div>
              <label
                htmlFor="primarySkill"
                className={labelClass}
              >
                Primary Musical Skill
              </label>

              <select
                id="primarySkill"
                name="primarySkill"
                required
                defaultValue=""
                disabled={isSubmitting}
                className={inputClass}
              >
                <option value="" disabled>
                  Select primary skill
                </option>

                {skills.map((skill) => (
                  <option
                    key={skill}
                    value={skill}
                  >
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex gap-3">
            <FileCheck2 className="mt-1 h-6 w-6 text-red-600" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
                Student Verification
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Verification Document
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Upload a valid SEC student
                document so the club
                administration can manually
                verify your student status.
              </p>
            </div>
          </div>

          {/* Proof type */}
          <div className="mt-7">
            <label
              htmlFor="proofType"
              className={labelClass}
            >
              Proof Type
            </label>

            <select
              id="proofType"
              name="proofType"
              required
              defaultValue=""
              disabled={isSubmitting}
              className={inputClass}
            >
              <option value="" disabled>
                Select proof type
              </option>

              <option value="STUDENT_ID">
                Student ID Card
              </option>

              <option value="REGISTRATION_CARD">
                Registration Card
              </option>

              <option value="OTHER">
                Other Student Document
              </option>
            </select>
          </div>

          {/* Upload */}
          <div className="mt-6">
            <label
              htmlFor="proof"
              className={labelClass}
            >
              Upload Document
            </label>

            <label
              htmlFor="proof"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-9 text-center transition hover:border-red-400 hover:bg-red-50"
            >
              <Upload className="h-7 w-7 text-red-600" />

              <p className="mt-3 text-sm font-bold text-slate-900">
                Choose verification document
              </p>

              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG or PDF — maximum 4 MB
              </p>
            </label>

            <input
              id="proof"
              name="proof"
              type="file"
              required
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={isSubmitting}
              className="mt-3 block w-full text-sm text-slate-600"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-7 flex h-15 w-full items-center justify-center rounded-xl bg-red-600 px-8 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Submitting Application..."
            : "Submit Membership Application"}
        </button>
      </form>
    </div>
  );
}