-- =========================================================
-- 007 - AUDITION DECIMAL SCORES
-- =========================================================
-- Allow audition evaluators to use decimal scores
-- such as 7.5, 8.5, 9.5.
--
-- Existing integer scores remain valid:
-- 8 -> 8.0
-- 9 -> 9.0
-- =========================================================

ALTER TABLE audition_evaluations
  MODIFY technical_skill DECIMAL(3,1) NOT NULL,
  MODIFY rhythm_timing DECIMAL(3,1) NOT NULL,
  MODIFY creativity DECIMAL(3,1) NOT NULL,
  MODIFY stage_presence DECIMAL(3,1) NOT NULL,
  MODIFY overall_performance DECIMAL(3,1) NOT NULL;