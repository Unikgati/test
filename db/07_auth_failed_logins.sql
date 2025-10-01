-- 07_auth_failed_logins.sql
-- Optional table for logging failed admin login attempts

CREATE TABLE IF NOT EXISTS public.auth_failed_logins (
  id bigserial PRIMARY KEY,
  ip inet,
  email text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb
);
