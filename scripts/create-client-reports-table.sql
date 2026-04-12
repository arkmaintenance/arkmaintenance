ALTER TABLE IF EXISTS public.client_reports
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

UPDATE public.client_reports
SET contact_person = COALESCE(contact_person, prepared_for)
WHERE COALESCE(contact_person, '') = ''
  AND COALESCE(prepared_for, '') <> '';

UPDATE public.client_reports AS report
SET client_name = COALESCE(report.client_name, client.company_name, client.contact_name)
FROM public.clients AS client
WHERE report.client_id = client.id
  AND COALESCE(report.client_name, '') = '';

UPDATE public.client_reports AS report
SET address = COALESCE(
  NULLIF(report.address, ''),
  NULLIF(TRIM(CONCAT_WS(', ', client.address, client.city, client.parish)), '')
)
FROM public.clients AS client
WHERE report.client_id = client.id;

UPDATE public.client_reports AS report
SET sections = COALESCE(
  (
    SELECT jsonb_agg(section_data.section_value)
    FROM (
      SELECT jsonb_build_object(
        'heading', 'Observations',
        'points', to_jsonb(regexp_split_to_array(regexp_replace(report.observations, E'\\r', '', 'g'), E'\\n+'))
      ) AS section_value
      WHERE NULLIF(BTRIM(COALESCE(report.observations, '')), '') IS NOT NULL

      UNION ALL

      SELECT jsonb_build_object(
        'heading', 'Root Cause',
        'points', to_jsonb(regexp_split_to_array(regexp_replace(report.root_cause, E'\\r', '', 'g'), E'\\n+'))
      ) AS section_value
      WHERE NULLIF(BTRIM(COALESCE(report.root_cause, '')), '') IS NOT NULL

      UNION ALL

      SELECT jsonb_build_object(
        'heading', 'Recommendations',
        'points', to_jsonb(regexp_split_to_array(regexp_replace(report.recommendations, E'\\r', '', 'g'), E'\\n+'))
      ) AS section_value
      WHERE NULLIF(BTRIM(COALESCE(report.recommendations, '')), '') IS NOT NULL

      UNION ALL

      SELECT jsonb_build_object(
        'heading', 'Conclusion',
        'points', to_jsonb(regexp_split_to_array(regexp_replace(report.conclusion, E'\\r', '', 'g'), E'\\n+'))
      ) AS section_value
      WHERE NULLIF(BTRIM(COALESCE(report.conclusion, '')), '') IS NOT NULL
    ) AS section_data
  ),
  '[]'::jsonb
)
WHERE report.sections IS NULL
   OR report.sections = '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_client_reports_user_created_at
  ON public.client_reports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_reports_client_id
  ON public.client_reports (client_id);

ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_reports'
      AND policyname = 'client_reports_select'
  ) THEN
    CREATE POLICY client_reports_select
      ON public.client_reports
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_reports'
      AND policyname = 'client_reports_insert'
  ) THEN
    CREATE POLICY client_reports_insert
      ON public.client_reports
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_reports'
      AND policyname = 'client_reports_update'
  ) THEN
    CREATE POLICY client_reports_update
      ON public.client_reports
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_reports'
      AND policyname = 'client_reports_delete'
  ) THEN
    CREATE POLICY client_reports_delete
      ON public.client_reports
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;
