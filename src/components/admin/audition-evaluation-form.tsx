"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";

import {
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

type Decision =
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

type Props = {
  applicationId: number;

  initialTechnicalSkill: number;

  initialRhythmTiming: number;

  initialCreativity: number;

  initialStagePresence: number;

  initialOverallPerformance: number;

  initialNotes: string;

  initialDecision:
    | Decision
    | null;
};

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function AuditionEvaluationForm({
  applicationId,

  initialTechnicalSkill,

  initialRhythmTiming,

  initialCreativity,

  initialStagePresence,

  initialOverallPerformance,

  initialNotes,

  initialDecision,
}: Props) {
  const router =
    useRouter();

  /*
   * =====================================
   * SCORE STATE
   * =====================================
   */

  const [
    technicalSkill,
    setTechnicalSkill,
  ] = useState(
    initialTechnicalSkill,
  );

  const [
    rhythmTiming,
    setRhythmTiming,
  ] = useState(
    initialRhythmTiming,
  );

  const [
    creativity,
    setCreativity,
  ] = useState(
    initialCreativity,
  );

  const [
    stagePresence,
    setStagePresence,
  ] = useState(
    initialStagePresence,
  );

  const [
    overallPerformance,
    setOverallPerformance,
  ] = useState(
    initialOverallPerformance,
  );

  /*
   * =====================================
   * NOTES
   * =====================================
   */

  const [
    notes,
    setNotes,
  ] = useState(
    initialNotes,
  );

  /*
   * =====================================
   * DECISION
   * =====================================
   */

  const [
    currentDecision,
    setCurrentDecision,
  ] =
    useState<Decision | null>(
      initialDecision,
    );

  /*
   * =====================================
   * UI STATE
   * =====================================
   */

  const [
    saving,
    setSaving,
  ] =
    useState<Decision | null>(
      null,
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
   * =====================================
   * TOTAL
   * =====================================
   */

  const totalScore =
    Number(
      technicalSkill,
    ) +
    Number(
      rhythmTiming,
    ) +
    Number(
      creativity,
    ) +
    Number(
      stagePresence,
    ) +
    Number(
      overallPerformance,
    );

  const averageScore =
    totalScore / 5;

  /*
   * =====================================
   * VALIDATE
   * =====================================
   */

  function validate() {
    const scores = [
      technicalSkill,
      rhythmTiming,
      creativity,
      stagePresence,
      overallPerformance,
    ];

    const invalid =
      scores.some(
        (score) =>
          !Number.isFinite(
            Number(score),
          ) ||
          Number(score) <
            0 ||
          Number(score) >
            10,
      );

    if (invalid) {
      setError(
        "Each score must be between 0 and 10.",
      );

      return false;
    }

    if (
      notes.length >
      5000
    ) {
      setError(
        "Evaluator notes cannot exceed 5000 characters.",
      );

      return false;
    }

    return true;
  }

  /*
   * =====================================
   * RESPONSE
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
   * SAVE
   * =====================================
   */

  async function saveEvaluation(
    decision: Decision,
  ) {
    if (saving) {
      return;
    }

    setError("");

    setSuccess("");

    if (!validate()) {
      return;
    }

    /*
     * FINAL DECISION CONFIRM
     */

    if (
      decision ===
      "APPROVED"
    ) {
      const confirmed =
        window.confirm(
          "Approve this audition application?",
        );

      if (!confirmed) {
        return;
      }
    }

    if (
      decision ===
      "REJECTED"
    ) {
      const confirmed =
        window.confirm(
          "Reject this audition application?",
        );

      if (!confirmed) {
        return;
      }
    }

    try {
      setSaving(
        decision,
      );

      const response =
        await fetch(
          `/api/admin/auditions/applications/${applicationId}/evaluation`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                technicalSkill,

                rhythmTiming,

                creativity,

                stagePresence,

                overallPerformance,

                notes,

                decision,
              }),
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save evaluation.",
        );
      }

      setCurrentDecision(
        decision,
      );

      setSuccess(
        data.message ||
          "Evaluation saved successfully.",
      );

      /*
       * Refresh:
       * stats
       * applicant badge
       * score
       */

      router.refresh();

      window.setTimeout(
        () => {
          setSuccess("");
        },
        2200,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save evaluation.",
      );
    } finally {
      setSaving(null);
    }
  }

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* SCORE */}
      {/* ================================= */}

      <section>
        <div className="flex items-center justify-between gap-3 border-b border-red-100 pb-3">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-gray-600">
            Criteria Scoring
          </p>

          {currentDecision && (
            <DecisionBadge
              decision={
                currentDecision
              }
            />
          )}
        </div>

        <div className="mt-4 space-y-3">
          <ScoreInput
            label="Technical Skill"
            value={
              technicalSkill
            }
            onChange={
              setTechnicalSkill
            }
          />

          <ScoreInput
            label="Rhythm & Timing"
            value={
              rhythmTiming
            }
            onChange={
              setRhythmTiming
            }
          />

          <ScoreInput
            label="Creativity"
            value={
              creativity
            }
            onChange={
              setCreativity
            }
          />

          <ScoreInput
            label="Stage Presence"
            value={
              stagePresence
            }
            onChange={
              setStagePresence
            }
          />

          <ScoreInput
            label="Overall Performance"
            value={
              overallPerformance
            }
            onChange={
              setOverallPerformance
            }
          />
        </div>

        {/* ================================= */}
        {/* TOTAL */}
        {/* ================================= */}

        <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#e8edfb] p-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-gray-500">
              Average Score
            </p>

            <p className="mt-1 text-xl font-black text-[#101828]">
              {averageScore.toFixed(
                1,
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-gray-500">
              Total
            </p>

            <p className="mt-1 text-xl font-black text-[#d40000]">
              {totalScore.toFixed(
                1,
              )}
              /50
            </p>
          </div>
        </div>
      </section>

      {/* ================================= */}
      {/* NOTES */}
      {/* ================================= */}

      <section>
        <div className="flex items-center justify-between gap-3">
          <label className="text-[9px] font-black uppercase tracking-[0.12em] text-gray-600">
            Evaluator Notes
          </label>

          <span className="text-[9px] text-gray-400">
            {
              notes.length
            }
            /5000
          </span>
        </div>

        <textarea
          rows={5}
          maxLength={5000}
          value={notes}
          disabled={
            Boolean(saving)
          }
          onChange={(
            event,
          ) =>
            setNotes(
              event.target
                .value,
            )
          }
          placeholder="Write detailed feedback here..."
          className="mt-3 w-full resize-y rounded-xl border border-transparent bg-[#eef2ff] px-4 py-3 text-xs leading-5 text-[#344054] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50 disabled:opacity-60"
        />
      </section>

      {/* ================================= */}
      {/* ERROR */}
      {/* ================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">
          {error}
        </div>
      )}

      {/* ================================= */}
      {/* SUCCESS */}
      {/* ================================= */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium leading-5 text-green-700">
          {success}
        </div>
      )}

      {/* ================================= */}
      {/* ACTIONS */}
      {/* ================================= */}

      <section className="space-y-2">
        {/* APPROVE */}

        <button
          type="button"
          disabled={
            Boolean(saving)
          }
          onClick={() =>
            void saveEvaluation(
              "APPROVED",
            )
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#d40000] text-[10px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-[#b80000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ===
          "APPROVED" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />

              Approve Audition
            </>
          )}
        </button>

        {/* UNDER REVIEW */}

        <button
          type="button"
          disabled={
            Boolean(saving)
          }
          onClick={() =>
            void saveEvaluation(
              "UNDER_REVIEW",
            )
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#101828] bg-white text-[10px] font-black uppercase tracking-[0.06em] text-[#101828] transition hover:bg-[#101828] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ===
          "UNDER_REVIEW" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Saving...
            </>
          ) : (
            <>
              <Clock3 className="h-4 w-4" />

              Keep Under Review
            </>
          )}
        </button>

        {/* REJECT */}

        <button
          type="button"
          disabled={
            Boolean(saving)
          }
          onClick={() =>
            void saveEvaluation(
              "REJECTED",
            )
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-[0.08em] text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ===
          "REJECTED" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Saving...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />

              Reject Application
            </>
          )}
        </button>
      </section>
    </div>
  );
}

/*
 * =====================================
 * SCORE INPUT
 * =====================================
 */

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;

  value: number;

  onChange: (
    value: number,
  ) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-xs font-medium text-[#101828]">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={10}
          step={0.5}
          value={value}
          onChange={(
            event,
          ) => {
            const value =
              event.target
                .value;

            if (
              value === ""
            ) {
              onChange(0);

              return;
            }

            const score =
              Number(value);

            onChange(
              Number.isFinite(
                score,
              )
                ? score
                : 0,
            );
          }}
          className="h-9 w-16 rounded-md border border-transparent bg-[#e8edfb] px-2 text-center text-sm font-black text-[#101828] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50"
        />

        <span className="text-[10px] font-bold text-gray-400">
          /10
        </span>
      </div>
    </div>
  );
}

/*
 * =====================================
 * DECISION BADGE
 * =====================================
 */

function DecisionBadge({
  decision,
}: {
  decision:
    Decision;
}) {
  const styles = {
    UNDER_REVIEW:
      "bg-amber-50 text-amber-700",

    APPROVED:
      "bg-green-50 text-green-700",

    REJECTED:
      "bg-red-50 text-red-600",
  }[decision];

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${styles}`}
    >
      {decision.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}