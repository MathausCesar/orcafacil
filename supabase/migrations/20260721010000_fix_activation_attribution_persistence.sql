BEGIN;

-- Profile writes are column-scoped. These fields were added after the original
-- allowlist, so authenticated onboarding requests could not persist them.
GRANT INSERT (intended_plan, first_attribution, last_attribution)
ON TABLE public.profiles TO authenticated;

GRANT UPDATE (intended_plan, first_attribution, last_attribution)
ON TABLE public.profiles TO authenticated;

-- Recover attribution that reached onboarding and was already retained inside
-- quote_settings before the dedicated profile-column update was rejected.
WITH recovered AS (
  SELECT
    id,
    CASE
      WHEN jsonb_typeof(quote_settings #> '{activation,attribution}') = 'object'
        AND quote_settings #> '{activation,attribution}' <> '{}'::jsonb
        THEN quote_settings #> '{activation,attribution}'
      ELSE NULL
    END AS attribution,
    CASE
      WHEN quote_settings #>> '{activation,intendedPlan}' IN ('monthly', 'yearly')
        THEN quote_settings #>> '{activation,intendedPlan}'
      ELSE NULL
    END AS intended_plan
  FROM public.profiles
)
UPDATE public.profiles AS profiles
SET
  intended_plan = COALESCE(profiles.intended_plan, recovered.intended_plan),
  first_attribution = COALESCE(NULLIF(profiles.first_attribution, '{}'::jsonb), recovered.attribution),
  last_attribution = COALESCE(NULLIF(profiles.last_attribution, '{}'::jsonb), recovered.attribution)
FROM recovered
WHERE profiles.id = recovered.id
  AND (
    (recovered.intended_plan IS NOT NULL AND profiles.intended_plan IS NULL)
    OR (
      recovered.attribution IS NOT NULL
      AND (
        profiles.first_attribution IS NULL
        OR profiles.first_attribution = '{}'::jsonb
        OR profiles.last_attribution IS NULL
        OR profiles.last_attribution = '{}'::jsonb
      )
    )
  );

COMMIT;
