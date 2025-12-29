-- Create Donation Analytics Function
-- Purpose: Aggregated donation trends by time period

CREATE OR REPLACE FUNCTION public.get_donation_trends(period_type TEXT)
RETURNS JSON AS $$
DECLARE
  trunc_period TEXT;
  result JSON;
BEGIN
  -- Determine date truncation period
  CASE period_type
    WHEN 'monthly' THEN trunc_period := 'month';
    WHEN 'quarterly' THEN trunc_period := 'quarter';
    WHEN 'yearly' THEN trunc_period := 'year';
    ELSE RAISE EXCEPTION 'Invalid period type: %', period_type;
  END CASE;

  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'period', TO_CHAR(DATE_TRUNC(trunc_period, tarih), 'YYYY-MM-DD'),
      'total_amount', total_amount,
      'count', donation_count
    )
    ORDER BY period_date DESC
  ) INTO result
  FROM (
    SELECT
      DATE_TRUNC(trunc_period, tarih) as period_date,
      SUM(tutar) as total_amount,
      COUNT(*) as donation_count
    FROM public.donations
    WHERE tarih IS NOT NULL
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 24 -- Limit to last 24 periods
  ) subquery;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_donation_trends(TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_donation_trends(TEXT) IS 'Returns aggregated donation trends (total amount, count) grouped by the specified period (monthly, quarterly, yearly).';
