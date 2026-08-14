"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

type ApiResponse = {
  message?: string;
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
  const router = useRouter();

  /*
   * =====================================
   * SCORE STATE
   * =====================================
   */

  const [technicalSkill, setTechnicalSkill] =
    useState(initialTechnicalSkill);

  const [rhythmTiming, setRhythmTiming] =
    useState(initialRhythmTiming);

  const [creativity, setCreativity] =
    useState(initialCreativity);

  const [stagePresence, setStagePresence] =
    useState(initialStagePresence);

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

  const [notes, setNotes] =
    useState(initialNotes);

  /*
   * =====================================
   * DECISION
   * =====================================
   */

  const [
    currentDecision,
    setCurrentDecision,
  ] = useState<Decision | null>(
    initialDecision,
  );

  /*
   * =====================================
   * UI STATE
   * =====================================
   */

  const [saving, setSaving] =
    useState<Decision | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * =====================================
   * FINAL DECISION
   * =====================================
   */

  const isFinalDecision =
    currentDecision === "APPROVED" ||
    currentDecision === "REJECTED";

  /*
   * =====================================
   * SCORE CALCULATION
   * =====================================
   */

  const totalScore =
    Number(technicalSkill) +
    Number(rhythmTiming) +
    Number(creativity) +
    Number(stagePresence) +
    Number(overallPerformance);

  const averageScore =
    totalScore / 5;

  /*
   * =====================================
   * VALIDATION
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
      scores.some((score) => {
        const value =
          Number(score);

        return (
          !Number.isFinite(value) ||
          value < 0 ||
          value > 10
        );
      });

    if (invalid) {
      setError(
        "Each score must be between 0 and 10.",
      );

      return false;
    }

    if (notes.length > 5000) {
      setError(
        "Evaluator notes cannot exceed 5000 characters.",
      );

      return false;
    }

    return true;
  }

  /*
   * =====================================
   * API RESPONSE
   * =====================================
   */

  async function readResponse(
    response: Response,
  ): Promise<ApiResponse> {
    const text =
      await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(
        text,
      ) as ApiResponse;
    } catch {
      throw new Error(
        `Unexpected server response (${response.status}).`,
      );
    }
  }

  /*
   * =====================================
   * SAVE EVALUATION
   * =====================================
   */

  async function saveEvaluation(
    decision: Decision,
  ) {
    if (saving) {
      return;
    }

    /*
     * Once APPROVED or REJECTED,
     * decision is final from the UI.
     */

    if (isFinalDecision) {
      return;
    }

    setError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    /*
     * APPROVE CONFIRMATION
     */

    if (decision === "APPROVED") {
      const confirmed =
        window.confirm(
          "Approve this audition application? This will mark the applicant as selected.",
        );

      if (!confirmed) {
        return;
      }
    }

    /*
     * REJECT CONFIRMATION
     */

    if (decision === "REJECTED") {
      const confirmed =
        window.confirm(
          "Reject this audition application? This will mark the final result as rejected.",
        );

      if (!confirmed) {
        return;
      }
    }

    try {
      setSaving(decision);

      const response =
        await fetch(
          `/api/admin/auditions/applications/${applicationId}/evaluation`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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

      /*
       * Update UI immediately.
       */

      setCurrentDecision(
        decision,
      );

      setSuccess(
        data.message ||
          "Evaluation saved successfully.",
      );

      /*
       * Refresh server data:
       * - applicant status
       * - statistics
       * - scores
       */

      router.refresh();

      window.setTimeout(
        () => {
          setSuccess("");
        },
        2500,
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
      {/* CRITERIA SCORING */}
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
            disabled={
              Boolean(saving) ||
              isFinalDecision
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
            disabled={
              Boolean(saving) ||
              isFinalDecision
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
            disabled={
              Boolean(saving) ||
              isFinalDecision
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
            disabled={
              Boolean(saving) ||
              isFinalDecision
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
            disabled={
              Boolean(saving) ||
              isFinalDecision
            }
          />

        </div>


        {/* ================================= */}
        {/* SCORE SUMMARY */}
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
      {/* EVALUATOR NOTES */}
      {/* ================================= */}

      <section>

        <div className="flex items-center justify-between gap-3">

          <label className="text-[9px] font-black uppercase tracking-[0.12em] text-gray-600">
            Evaluator Notes
          </label>

          <span className="text-[9px] text-gray-400">
            {notes.length}/5000
          </span>

        </div>

        <textarea
          rows={5}
          maxLength={5000}
          value={notes}
          disabled={
            Boolean(saving) ||
            isFinalDecision
          }
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          placeholder="Write detailed feedback here..."
          className="mt-3 w-full resize-y rounded-xl border border-transparent bg-[#eef2ff] px-4 py-3 text-xs leading-5 text-[#344054] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-70"
        />

      </section>


      {/* ================================= */}
      {/* APPROVED RESULT */}
      {/* ================================= */}

      {currentDecision ===
        "APPROVED" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4">

          <div className="flex items-center gap-3">

            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

            <div>

              <p className="text-xs font-black uppercase tracking-[0.06em] text-green-700">
                Audition Approved
              </p>

              <p className="mt-1 text-xs leading-5 text-green-700">
                This applicant has been selected successfully.
              </p>

            </div>

          </div>

        </div>
      )}


      {/* ================================= */}
      {/* UNDER REVIEW RESULT */}
      {/* ================================= */}

      {currentDecision ===
        "UNDER_REVIEW" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">

          <div className="flex items-center gap-3">

            <Clock3 className="h-5 w-5 shrink-0 text-amber-600" />

            <div>

              <p className="text-xs font-black uppercase tracking-[0.06em] text-amber-700">
                Under Review
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                This audition is currently under evaluation.
              </p>

            </div>

          </div>

        </div>
      )}


      {/* ================================= */}
      {/* REJECTED RESULT */}
      {/* ================================= */}

      {currentDecision ===
        "REJECTED" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">

          <div className="flex items-center gap-3">

            <XCircle className="h-5 w-5 shrink-0 text-red-600" />

            <div>

              <p className="text-xs font-black uppercase tracking-[0.06em] text-red-700">
                Application Rejected
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                This applicant was not selected for this audition.
              </p>

            </div>

          </div>

        </div>
      )}


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

        {/* ================================= */}
        {/* FINAL APPROVED */}
        {/* ================================= */}

        {currentDecision ===
          "APPROVED" && (
          <div className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-600 text-[10px] font-black uppercase tracking-[0.06em] text-white">

            <CheckCircle2 className="h-4 w-4" />

            Audition Approved

          </div>
        )}


        {/* ================================= */}
        {/* FINAL REJECTED */}
        {/* ================================= */}

        {currentDecision ===
          "REJECTED" && (
          <div className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-[10px] font-black uppercase tracking-[0.06em] text-white">

            <XCircle className="h-4 w-4" />

            Application Rejected

          </div>
        )}


        {/* ================================= */}
        {/* ACTIONS BEFORE FINAL DECISION */}
        {/* ================================= */}

        {!isFinalDecision && (
          <>

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
                Boolean(saving) ||
                currentDecision ===
                  "UNDER_REVIEW"
              }
              onClick={() =>
                void saveEvaluation(
                  "UNDER_REVIEW",
                )
              }
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-[10px] font-black uppercase tracking-[0.06em] transition disabled:cursor-not-allowed ${
                currentDecision ===
                "UNDER_REVIEW"
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-[#101828] bg-white text-[#101828] hover:bg-[#101828] hover:text-white disabled:opacity-60"
              }`}
            >

              {saving ===
              "UNDER_REVIEW" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : currentDecision ===
                "UNDER_REVIEW" ? (
                <>
                  <Clock3 className="h-4 w-4" />
                  Under Review
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

          </>
        )}

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
  disabled = false,
}: {
  label: string;

  value: number;

  onChange: (
    value: number,
  ) => void;

  disabled?: boolean;
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
          disabled={disabled}
          onChange={(event) => {
            const inputValue =
              event.target.value;

            if (
              inputValue === ""
            ) {
              onChange(0);

              return;
            }

            const score =
              Number(inputValue);

            onChange(
              Number.isFinite(
                score,
              )
                ? score
                : 0,
            );
          }}
          className="h-9 w-16 rounded-md border border-transparent bg-[#e8edfb] px-2 text-center text-sm font-black text-[#101828] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-70"
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
  decision: Decision;
}) {
  const styles = {
    UNDER_REVIEW:
      "bg-amber-50 text-amber-700",

    APPROVED:
      "bg-green-50 text-green-700",

    REJECTED:
      "bg-red-50 text-red-600",
  }[decision];

  const labels = {
    UNDER_REVIEW:
      "Under Review",

    APPROVED:
      "Approved",

    REJECTED:
      "Rejected",
  }[decision];

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${styles}`}
    >
      {labels}
    </span>
  );
}