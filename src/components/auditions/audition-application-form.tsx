"use client";

import { FormEvent, useState } from "react";

const inputStyles =
  "mt-2 h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm text-[#101828] outline-none transition placeholder:text-gray-400 focus:border-[#d40000] focus:ring-2 focus:ring-[#d40000]/10";

const textareaStyles =
  "mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition placeholder:text-gray-400 focus:border-[#d40000] focus:ring-2 focus:ring-[#d40000]/10";

export default function AuditionApplicationForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "The form design is working. Database submission will be connected with MySQL later."
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-10">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-[#101828] sm:text-3xl">
          Applicant Information
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Complete all required fields carefully. Information marked with an
          asterisk is required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Personal information */}
        <fieldset>
          <legend className="text-lg font-bold text-[#101828]">
            Personal Information
          </legend>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="text-sm font-semibold text-[#101828]"
              >
                Full Name <span className="text-[#d40000]">*</span>
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Enter your full name"
                className={inputStyles}
              />
            </div>

            <div>
              <label
                htmlFor="studentId"
                className="text-sm font-semibold text-[#101828]"
              >
                Student ID <span className="text-[#d40000]">*</span>
              </label>

              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                placeholder="Example: 2022331501"
                className={inputStyles}
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="text-sm font-semibold text-[#101828]"
              >
                Department <span className="text-[#d40000]">*</span>
              </label>

              <select
                id="department"
                name="department"
                required
                defaultValue=""
                className={inputStyles}
              >
                <option value="" disabled>
                  Select your department
                </option>
                <option value="CSE">
                  Computer Science and Engineering
                </option>
                <option value="EEE">
                  Electrical and Electronic Engineering
                </option>
                <option value="CE">Civil Engineering</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="semester"
                className="text-sm font-semibold text-[#101828]"
              >
                Current Semester <span className="text-[#d40000]">*</span>
              </label>

              <select
                id="semester"
                name="semester"
                required
                defaultValue=""
                className={inputStyles}
              >
                <option value="" disabled>
                  Select your semester
                </option>
                <option value="1-1">1st Year, 1st Semester</option>
                <option value="1-2">1st Year, 2nd Semester</option>
                <option value="2-1">2nd Year, 1st Semester</option>
                <option value="2-2">2nd Year, 2nd Semester</option>
                <option value="3-1">3rd Year, 1st Semester</option>
                <option value="3-2">3rd Year, 2nd Semester</option>
                <option value="4-1">4th Year, 1st Semester</option>
                <option value="4-2">4th Year, 2nd Semester</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-[#101828]"
              >
                Email Address <span className="text-[#d40000]">*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className={inputStyles}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-semibold text-[#101828]"
              >
                Phone Number <span className="text-[#d40000]">*</span>
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+880 1XXXXXXXXX"
                className={inputStyles}
              />
            </div>
          </div>
        </fieldset>

        {/* Audition information */}
        <fieldset className="border-t border-gray-200 pt-8">
          <legend className="text-lg font-bold text-[#101828]">
            Audition Information
          </legend>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="text-sm font-semibold text-[#101828]"
              >
                Talent Category <span className="text-[#d40000]">*</span>
              </label>

              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className={inputStyles}
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Vocal">Vocal</option>
                <option value="Guitar">Guitar</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Drums">Drums</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="instrument"
                className="text-sm font-semibold text-[#101828]"
              >
                Instrument or Specialty
              </label>

              <input
                id="instrument"
                name="instrument"
                type="text"
                placeholder="Example: Acoustic guitar"
                className={inputStyles}
              />
            </div>

            <div>
              <label
                htmlFor="experienceLevel"
                className="text-sm font-semibold text-[#101828]"
              >
                Experience Level <span className="text-[#d40000]">*</span>
              </label>

              <select
                id="experienceLevel"
                name="experienceLevel"
                required
                defaultValue=""
                className={inputStyles}
              >
                <option value="" disabled>
                  Select experience level
                </option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="preferredPiece"
                className="text-sm font-semibold text-[#101828]"
              >
                Audition Song or Piece
              </label>

              <input
                id="preferredPiece"
                name="preferredPiece"
                type="text"
                placeholder="Enter the song or piece name"
                className={inputStyles}
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="previousExperience"
              className="text-sm font-semibold text-[#101828]"
            >
              Previous Performance Experience
            </label>

            <textarea
              id="previousExperience"
              name="previousExperience"
              rows={4}
              placeholder="Briefly describe your previous musical or stage experience."
              className={textareaStyles}
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="reason"
              className="text-sm font-semibold text-[#101828]"
            >
              Why do you want to join Pentatone?{" "}
              <span className="text-[#d40000]">*</span>
            </label>

            <textarea
              id="reason"
              name="reason"
              rows={5}
              required
              placeholder="Tell us about your interest in music and why you want to join the club."
              className={textareaStyles}
            />
          </div>
        </fieldset>

        {/* Agreement */}
        <div className="border-t border-gray-200 pt-8">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="agreement"
              required
              className="mt-1 h-4 w-4 accent-[#d40000]"
            />

            <span className="text-sm leading-6 text-gray-600">
              I confirm that the information provided is correct, and I agree
              to follow the rules and audition procedures of Pentatone Musical
              Club.
            </span>
          </label>
        </div>

        {/* Temporary frontend message */}
        {message && (
          <div
            role="status"
            className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
          >
            {message}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:justify-end">
          <button
            type="reset"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#101828] px-8 text-sm font-bold text-[#101828] transition hover:bg-[#101828] hover:text-white"
          >
            Reset Form
          </button>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#d40000] px-9 text-sm font-bold text-white shadow-[0_10px_24px_rgba(212,0,0,0.22)] transition hover:bg-[#b80000]"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}