"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const departments = [
  "Computer Science and Engineering",
  "Electrical and Electronic Engineering",
  "Civil Engineering",
];

const musicalSkills = [
  "Vocal",
  "Guitar",
  "Keyboard",
  "Drums",
  "Violin",
  "Flute",
  "Tabla",
  "Other",
];

export default function RegisterForm() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const inputClass =
    "h-14 w-full rounded-xl border border-transparent bg-[#eef1ff] px-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-800";

  function handleSkillChange(skill: string) {
    setSelectedSkills((currentSkills) => {
      if (currentSkills.includes(skill)) {
        return currentSkills.filter((item) => item !== skill);
      }

      return [...currentSkills, skill];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || "",
    );

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Please select at least one musical skill.");
      return;
    }

    setSuccessMessage(
      "Form validation successful. Database connection will be added next.",
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
          Join the community
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#111827] xl:text-5xl">
          Create Your Account
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600">
          Enter your information to register as a member of Pentatone
          Musical Club.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-9">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Full name */}
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              required
              autoComplete="name"
              className={inputClass}
            />
          </div>

          {/* Student ID */}
          <div>
            <label htmlFor="studentId" className={labelClass}>
              Student ID
            </label>

            <input
              id="studentId"
              name="studentId"
              type="text"
              placeholder="Example: 2022331500"
              required
              className={inputClass}
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className={labelClass}>
              Department
            </label>

            <select
              id="department"
              name="department"
              required
              defaultValue=""
              className={`${inputClass} cursor-pointer`}
            >
              <option value="" disabled>
                Select department
              </option>

              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label htmlFor="batch" className={labelClass}>
              Batch
            </label>

            <input
              id="batch"
              name="batch"
              type="text"
              placeholder="Example: 22"
              required
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div className="col-span-2">
            <label htmlFor="email" className={labelClass}>
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          {/* Phone */}
          <div className="col-span-2">
            <label htmlFor="phone" className={labelClass}>
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+880 1XXXXXXXXX"
              required
              autoComplete="tel"
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          {/* Musical skills */}
          <fieldset className="col-span-2">
            <legend className={labelClass}>
              Instrument / Primary Skill
            </legend>

            <div className="grid grid-cols-4 gap-3">
              {musicalSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);

                return (
                  <label
                    key={skill}
                    className={`flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border px-4 transition ${
                      isSelected
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-red-200 bg-white text-slate-700 hover:border-red-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="skills"
                      value={skill}
                      checked={isSelected}
                      onChange={() => handleSkillChange(skill)}
                      className="h-4 w-4 cursor-pointer accent-red-600"
                    />

                    <span className="text-xs font-semibold">
                      {skill}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700"
          >
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          className="mt-8 flex h-15 w-full items-center justify-center rounded-xl bg-[#ed0000] px-8 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-red-200 transition duration-300 hover:-translate-y-1 hover:bg-red-700"
        >
          Create Account
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-red-600 transition hover:text-red-700"
          >
            Login here
          </Link>
        </p>

        <p className="mt-4 text-center text-xs leading-6 text-slate-500">
          By registering, you agree to follow the rules and guidelines of
          Pentatone Musical Club.
        </p>
      </form>
    </div>
  );
}