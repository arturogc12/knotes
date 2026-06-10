-- Campos adicionales para reporte clínico semanal (docs/reporte.md)

alter table public.nudos
  add column if not exists distress_scale smallint check (distress_scale between 1 and 10),
  add column if not exists belief_literal text,
  add column if not exists physiological_symptoms text[],
  add column if not exists behavioral_patterns text[];
