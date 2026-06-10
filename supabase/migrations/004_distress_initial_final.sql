-- Intensidad emocional reportada por el usuario al inicio y al final del chat (escala 1-10)

alter table public.nudos
  add column if not exists distress_initial smallint check (distress_initial between 1 and 10),
  add column if not exists distress_final smallint check (distress_final between 1 and 10);
