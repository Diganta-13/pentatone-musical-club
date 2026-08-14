"use client";

import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
} from "lucide-react";

import {
  type FormEvent,
  useState,
} from "react";

export default function ContactForm() {
  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      fullName.trim().length < 2
    ) {
      setError(
        "Please enter your full name.",
      );

      return;
    }

    if (
      !email.trim()
    ) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    if (
      subject.trim().length < 3
    ) {
      setError(
        "Please enter a subject.",
      );

      return;
    }

    if (
      message.trim().length < 10
    ) {
      setError(
        "Message must be at least 10 characters.",
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/contact",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              fullName:
                fullName.trim(),

              email:
                email.trim(),

              phone:
                phone.trim(),

              subject:
                subject.trim(),

              message:
                message.trim(),
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send your message.",
        );
      }

      setSuccess(
        "Your message has been sent successfully. Pentatone will get back to you soon.",
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send your message.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-5"
    >

      {/* NAME + EMAIL */}

      <div className="grid gap-5 md:grid-cols-2">

        {/* FULL NAME */}

        <div>

          <label className="text-[10px] font-black uppercase tracking-[0.09em] text-slate-600">
            Full Name{" "}
            <span className="text-red-600">
              *
            </span>
          </label>

          <div className="relative mt-2">

            <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={
                fullName
              }
              onChange={(
                event,
              ) =>
                setFullName(
                  event.target
                    .value,
                )
              }
              maxLength={120}
              placeholder="Your full name"
              className="h-12 w-full rounded-lg border border-slate-200 bg-[#f6f7fc] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            />

          </div>

        </div>

        {/* EMAIL */}

        <div>

          <label className="text-[10px] font-black uppercase tracking-[0.09em] text-slate-600">
            Email Address{" "}
            <span className="text-red-600">
              *
            </span>
          </label>

          <div className="relative mt-2">

            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              maxLength={180}
              placeholder="you@example.com"
              className="h-12 w-full rounded-lg border border-slate-200 bg-[#f6f7fc] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            />

          </div>

        </div>

      </div>

      {/* PHONE + SUBJECT */}

      <div className="grid gap-5 md:grid-cols-2">

        {/* PHONE */}

        <div>

          <label className="text-[10px] font-black uppercase tracking-[0.09em] text-slate-600">
            Phone Number
          </label>

          <div className="relative mt-2">

            <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={phone}
              onChange={(
                event,
              ) =>
                setPhone(
                  event.target
                    .value,
                )
              }
              maxLength={30}
              placeholder="+880 1XXXXXXXXX"
              className="h-12 w-full rounded-lg border border-slate-200 bg-[#f6f7fc] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            />

          </div>

        </div>

        {/* SUBJECT */}

        <div>

          <label className="text-[10px] font-black uppercase tracking-[0.09em] text-slate-600">
            Subject{" "}
            <span className="text-red-600">
              *
            </span>
          </label>

          <div className="relative mt-2">

            <MessageSquareText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={subject}
              onChange={(
                event,
              ) =>
                setSubject(
                  event.target
                    .value,
                )
              }
              maxLength={180}
              placeholder="How can we help?"
              className="h-12 w-full rounded-lg border border-slate-200 bg-[#f6f7fc] pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            />

          </div>

        </div>

      </div>

      {/* MESSAGE */}

      <div>

        <div className="flex items-center justify-between gap-3">

          <label className="text-[10px] font-black uppercase tracking-[0.09em] text-slate-600">
            Message{" "}
            <span className="text-red-600">
              *
            </span>
          </label>

          <span className="text-[9px] text-slate-400">
            {message.length}
            /5000
          </span>

        </div>

        <textarea
          rows={7}
          value={message}
          onChange={(
            event,
          ) =>
            setMessage(
              event.target
                .value,
            )
          }
          maxLength={5000}
          placeholder="Write your message here..."
          className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-[#f6f7fc] px-4 py-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
        />

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">

          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <span>
            {success}
          </span>

        </div>
      )}

      {/* SUBMIT */}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >

        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />

            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />

            Send Message
          </>
        )}

      </button>

    </form>
  );
}