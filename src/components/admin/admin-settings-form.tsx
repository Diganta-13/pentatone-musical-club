"use client";

import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type AdminSettingsFormProps = {
  admin: {
    fullName: string;
    email: string;
    role: string;
  };
};

export default function AdminSettingsForm({
  admin,
}: AdminSettingsFormProps) {
  const router = useRouter();

  /*
   * =====================================
   * PROFILE
   * =====================================
   */

  const [
    fullName,
    setFullName,
  ] = useState(
    admin.fullName,
  );

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState("");

  /*
   * =====================================
   * PASSWORD
   * =====================================
   */

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");

  /*
   * =====================================
   * INITIALS
   * =====================================
   */

  const initials =
    admin.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase(),
      )
      .join("") || "PA";

  /*
   * =====================================
   * UPDATE PROFILE
   * =====================================
   */

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    if (
      fullName.trim().length <
      2
    ) {
      setProfileError(
        "Full name must be at least 2 characters.",
      );

      return;
    }

    try {
      setProfileLoading(true);

      const response =
        await fetch(
          "/api/admin/settings",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action:
                "profile",

              fullName:
                fullName.trim(),
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update profile.",
        );
      }

      setProfileSuccess(
        "Admin profile updated successfully.",
      );

      router.refresh();
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update profile.",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  /*
   * =====================================
   * CHANGE PASSWORD
   * =====================================
   */

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError(
        "Current password is required.",
      );

      return;
    }

    if (
      newPassword.length < 8
    ) {
      setPasswordError(
        "New password must contain at least 8 characters.",
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        "New password and confirm password do not match.",
      );

      return;
    }

    try {
      setPasswordLoading(true);

      const response =
        await fetch(
          "/api/admin/settings",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action:
                "password",

              currentPassword,

              newPassword,

              confirmPassword,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change password.",
        );
      }

      setPasswordSuccess(
        "Password changed successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to change password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* ================================= */}
      {/* CLUB INFORMATION */}
      {/* ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">

        <div className="border-t-[3px] border-red-600 px-6 py-6 sm:px-7">

          <div className="flex items-center gap-3">

            <Building2 className="h-5 w-5 text-red-600" />

            <div>

              <h2 className="text-lg font-black text-slate-950">
                Club Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Basic information about Pentatone Musical Club.
              </p>

            </div>

          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">

            <ReadOnlyField
              label="Club Name"
              value="Pentatone Musical Club"
            />

            <ReadOnlyField
              label="Institution"
              value="Sylhet Engineering College"
            />

            <ReadOnlyField
              label="Club Type"
              value="Student Musical Club"
            />

            <ReadOnlyField
              label="Administration"
              value="Pentatone Admin Portal"
            />

          </div>

          <div className="mt-5 rounded-xl bg-[#f4f6fd] p-5">

            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
              Club Description
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Pentatone Musical Club is the
              official musical community of
              Sylhet Engineering College,
              bringing students together to
              learn, practice, perform and
              celebrate music.
            </p>

          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* ADMIN PROFILE */}
      {/* ================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-7">

        <div className="flex items-center gap-3">

          <UserRound className="h-5 w-5 text-red-600" />

          <div>

            <h2 className="text-lg font-black text-slate-950">
              Admin Profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage your administrator account information.
            </p>

          </div>

        </div>

        {/* ADMIN SUMMARY */}

        <div className="mt-6 flex flex-col gap-5 rounded-xl bg-[#eef2ff] p-5 sm:flex-row sm:items-center">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white">
            {initials}
          </div>

          <div>

            <h3 className="text-lg font-black text-slate-950">
              {admin.fullName}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-red-600 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-white">
                Club Administrator
              </span>

              <span className="text-xs text-slate-500">
                Active administrator account
              </span>

            </div>

          </div>

        </div>

        {/* PROFILE FORM */}

        <form
          onSubmit={
            handleProfileSubmit
          }
          className="mt-7"
        >

          <div className="grid gap-5 md:grid-cols-2">

            {/* FULL NAME */}

            <div>

              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">
                Full Name
              </label>

              <div className="relative mt-2">

                <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={fullName}
                  onChange={(
                    event,
                  ) =>
                    setFullName(
                      event.target
                        .value,
                    )
                  }
                  maxLength={120}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-[#f4f6fd] pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div>

              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">
                Admin Email
              </label>

              <div className="relative mt-2">

                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={
                    admin.email
                  }
                  readOnly
                  className="h-12 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm text-slate-500"
                />

              </div>

            </div>

            {/* ROLE */}

            <div>

              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">
                Role
              </label>

              <div className="relative mt-2">

                <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={
                    admin.role
                  }
                  readOnly
                  className="h-12 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm font-bold uppercase text-slate-500"
                />

              </div>

            </div>

          </div>

          {profileError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">

              <CheckCircle2 className="h-5 w-5 shrink-0" />

              {profileSuccess}

            </div>
          )}

          <div className="mt-6 flex justify-end">

            <button
              type="submit"
              disabled={
                profileLoading
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-[10px] font-black uppercase tracking-[0.07em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {profileLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Saving...
                </>
              ) : (
                <>
                  <UserRound className="h-4 w-4" />

                  Save Profile
                </>
              )}

            </button>

          </div>

        </form>

      </section>

      {/* ================================= */}
      {/* SECURITY */}
      {/* ================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-7">

        <div className="flex items-center gap-3">

          <ShieldCheck className="h-5 w-5 text-red-600" />

          <div>

            <h2 className="text-lg font-black text-slate-950">
              Security
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Change your administrator account password.
            </p>

          </div>

        </div>

        <div className="mt-6 rounded-xl border border-red-100 bg-red-50/40 p-5">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <div>

              <h3 className="text-sm font-black text-slate-900">
                Password Security
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Enter your current password before
                setting a new password.
              </p>

            </div>

          </div>

        </div>

        <form
          onSubmit={
            handlePasswordSubmit
          }
          className="mt-7"
        >

          <div className="grid gap-5">

            {/* CURRENT PASSWORD */}

            <PasswordField
              label="Current Password"
              value={
                currentPassword
              }
              onChange={
                setCurrentPassword
              }
              visible={
                showCurrentPassword
              }
              onToggle={() =>
                setShowCurrentPassword(
                  (previous) =>
                    !previous,
                )
              }
            />

            <div className="grid gap-5 md:grid-cols-2">

              {/* NEW PASSWORD */}

              <PasswordField
                label="New Password"
                value={
                  newPassword
                }
                onChange={
                  setNewPassword
                }
                visible={
                  showNewPassword
                }
                onToggle={() =>
                  setShowNewPassword(
                    (previous) =>
                      !previous,
                  )
                }
              />

              {/* CONFIRM */}

              <PasswordField
                label="Confirm New Password"
                value={
                  confirmPassword
                }
                onChange={
                  setConfirmPassword
                }
                visible={
                  showConfirmPassword
                }
                onToggle={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous,
                  )
                }
              />

            </div>

          </div>

          <p className="mt-4 text-[10px] leading-5 text-slate-400">
            New password must contain at least
            8 characters.
          </p>

          {passwordError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">

              <CheckCircle2 className="h-5 w-5 shrink-0" />

              {passwordSuccess}

            </div>
          )}

          <div className="mt-6 flex justify-end">

            <button
              type="submit"
              disabled={
                passwordLoading
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#111827] px-6 text-[10px] font-black uppercase tracking-[0.07em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Changing...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />

                  Change Password
                </>
              )}

            </button>

          </div>

        </form>

      </section>

    </div>
  );
}

/*
 * =====================================
 * READ ONLY FIELD
 * =====================================
 */

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex min-h-12 items-center rounded-lg bg-[#eef2ff] px-4 text-sm font-medium text-slate-800">
        {value}
      </div>

    </div>
  );
}

/*
 * =====================================
 * PASSWORD FIELD
 * =====================================
 */

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div>

      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">
        {label}
      </label>

      <div className="relative mt-2">

        <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(
            event,
          ) =>
            onChange(
              event.target
                .value,
            )
          }
          autoComplete="new-password"
          className="h-12 w-full rounded-lg border border-slate-200 bg-[#f4f6fd] pl-11 pr-12 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-600"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

      </div>

    </div>
  );
}