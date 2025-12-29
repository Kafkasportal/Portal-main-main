-- Create Top Donors Function
-- Purpose: Get top donors by total donation amount

CREATE OR REPLACE FUNCTION public.get_top_donors(limit_count INT DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'donor_name', COALESCE(bagisci_adi, 'İsimsiz'),
      'total_amount', total_amount,
      'donation_count', donation_count,
      'last_donation_date', last_donation
    )
    ORDER BY total_amount DESC
  ) INTO result
  FROM (
    SELECT
      bagisci_adi,
      SUM(tutar) as total_amount,
      COUNT(*) as donation_count,
      MAX(tarih) as last_donation
    FROM public.donations
    WHERE tutar > 0
    GROUP BY bagisci_adi
    ORDER BY total_amount DESC
    LIMIT limit_count
  ) subquery;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_top_donors(INT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_top_donors(INT) IS 'Returns the top donors ranked by total donation amount.';
