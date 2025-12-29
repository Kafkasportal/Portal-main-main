-- Create Donation Source Distribution Function
-- Purpose: Aggregated donation stats by source (Donations + Kumbara)

CREATE OR REPLACE FUNCTION public.get_donation_source_distribution()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'source', source_name,
      'total_amount', total_amount,
      'count', tx_count
    )
    ORDER BY total_amount DESC
  ) INTO result
  FROM (
    -- Donations grouped by payment method
    SELECT
      CASE odeme_yontemi
        WHEN 'havale' THEN 'Havale/EFT'
        WHEN 'kredi_karti' THEN 'Kredi Kartı'
        WHEN 'nakit' THEN 'Elden/Nakit'
        WHEN 'mobil_odeme' THEN 'Mobil Ödeme'
        ELSE COALESCE(odeme_yontemi, 'Diğer')
      END as source_name,
      SUM(tutar) as total_amount,
      COUNT(*) as tx_count
    FROM public.donations
    WHERE tutar > 0
    GROUP BY 1

    UNION ALL

    -- Kumbara collections
    SELECT
      'Kumbara' as source_name,
      COALESCE(SUM(toplam_toplanan), 0) as total_amount,
      COUNT(*) as tx_count
    FROM public.kumbaras
    WHERE durum = 'toplandi'
      AND toplam_toplanan > 0
    GROUP BY 1
  ) combined_stats;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_donation_source_distribution() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_donation_source_distribution() IS 'Returns donation statistics grouped by source (Payment Method and Kumbara).';
