-- Update Dashboard Stats Function with Comparison Data
-- Purpose: Add growth rates and previous period comparisons

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  
  -- Current stats
  active_members_count INT;
  pending_applications_count INT;
  monthly_aid_total NUMERIC;
  monthly_donation_total NUMERIC;
  
  -- Previous stats for comparison
  prev_members_count INT;
  prev_month_aid_total NUMERIC;
  prev_month_donation_total NUMERIC;
  
  -- Growth rates
  members_growth NUMERIC;
  aid_growth NUMERIC;
  donation_growth NUMERIC;
  
  aid_distribution JSON;
  recent_applications JSON;
  recent_members JSON;
  beneficiary_counts JSON;
  
  current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  prev_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
BEGIN
  -- 1. MEMBERS
  -- Current active members
  SELECT COUNT(*)::INT INTO active_members_count
  FROM public.members
  WHERE uyelik_durumu = 'aktif';
  
  -- Previous active members (approximate by created_at for simplicity, ideally needs historical snapshot)
  -- For now, we compare new members this month vs last month as a proxy for growth momentum
  SELECT COUNT(*)::INT INTO members_growth
  FROM public.members
  WHERE created_at >= current_month_start;
  
  SELECT COUNT(*)::INT INTO prev_members_count
  FROM public.members
  WHERE created_at >= prev_month_start AND created_at < current_month_start;

  -- 2. PENDING APPLICATIONS
  SELECT COUNT(*)::INT INTO pending_applications_count
  FROM public.social_aid_applications
  WHERE durum = 'beklemede';

  -- 3. MONTHLY AID
  -- Current month
  SELECT COALESCE(SUM(tutar), 0) INTO monthly_aid_total
  FROM public.social_aid_payments
  WHERE odeme_tarihi >= current_month_start
    AND odeme_tarihi < current_month_start + INTERVAL '1 month'
    AND durum = 'odendi';
    
  -- Previous month
  SELECT COALESCE(SUM(tutar), 0) INTO prev_month_aid_total
  FROM public.social_aid_payments
  WHERE odeme_tarihi >= prev_month_start
    AND odeme_tarihi < current_month_start
    AND durum = 'odendi';

  -- 4. MONTHLY DONATIONS
  -- Current month
  SELECT COALESCE(SUM(tutar), 0) INTO monthly_donation_total
  FROM public.donations
  WHERE tarih >= current_month_start
    AND tarih < current_month_start + INTERVAL '1 month';
    
  -- Previous month
  SELECT COALESCE(SUM(tutar), 0) INTO prev_month_donation_total
  FROM public.donations
  WHERE tarih >= prev_month_start
    AND tarih < current_month_start;

  -- CALCULATE GROWTH RATES
  -- Aid Growth
  IF prev_month_aid_total > 0 THEN
    aid_growth := ((monthly_aid_total - prev_month_aid_total) / prev_month_aid_total) * 100;
  ELSE
    aid_growth := 0;
  END IF;
  
  -- Donation Growth
  IF prev_month_donation_total > 0 THEN
    donation_growth := ((monthly_donation_total - prev_month_donation_total) / prev_month_donation_total) * 100;
  ELSE
    donation_growth := 0;
  END IF;

  -- 5. AID DISTRIBUTION (unchanged)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', CASE yardim_turu
        WHEN 'egitim' THEN 'Eğitim'
        WHEN 'saglik' THEN 'Sağlık'
        WHEN 'gida' THEN 'Gıda'
        WHEN 'barinma' THEN 'Barınma'
        WHEN 'diger' THEN 'Diğer'
        ELSE yardim_turu
      END,
      'value', total_amount,
      'count', payment_count,
      'color', CASE yardim_turu
        WHEN 'egitim' THEN '#3b82f6'
        WHEN 'saglik' THEN '#10b981'
        WHEN 'gida' THEN '#f59e0b'
        WHEN 'barinma' THEN '#8b5cf6'
        ELSE '#6b7280'
      END
    )
  ) INTO aid_distribution
  FROM (
    SELECT
      yardim_turu,
      SUM(tutar) as total_amount,
      COUNT(*) as payment_count
    FROM public.social_aid_payments
    WHERE odeme_tarihi >= CURRENT_DATE - INTERVAL '6 months'
      AND durum = 'odendi'
    GROUP BY yardim_turu
    ORDER BY total_amount DESC
  ) subquery;

  -- 6. RECENT APPLICATIONS (unchanged)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', a.id,
      'basvuranKisi', JSON_BUILD_OBJECT(
        'ad', b.ad,
        'soyad', b.soyad
      ),
      'talepEdilenTutar', a.talep_edilen_tutar,
      'durum', a.durum,
      'createdAt', a.created_at
    )
    ORDER BY a.created_at DESC
  ) INTO recent_applications
  FROM public.social_aid_applications a
  INNER JOIN public.beneficiaries b ON a.basvuran_id = b.id
  WHERE a.durum = 'beklemede'
  ORDER BY a.created_at DESC
  LIMIT 5;

  -- 7. RECENT MEMBERS (unchanged)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', id,
      'ad', ad,
      'soyad', soyad,
      'uyeNo', uye_no,
      'uyeTuru', uye_turu,
      'createdAt', created_at
    )
    ORDER BY created_at DESC
  ) INTO recent_members
  FROM public.members
  ORDER BY created_at DESC
  LIMIT 5;

  -- 8. BENEFICIARY COUNTS (unchanged)
  SELECT JSON_BUILD_OBJECT(
    'aktif', COALESCE(SUM(CASE WHEN durum = 'aktif' THEN 1 ELSE 0 END), 0),
    'pasif', COALESCE(SUM(CASE WHEN durum = 'pasif' THEN 1 ELSE 0 END), 0),
    'tamamlandi', COALESCE(SUM(CASE WHEN durum = 'tamamlandi' THEN 1 ELSE 0 END), 0)
  ) INTO beneficiary_counts
  FROM public.beneficiaries;

  -- Build final result with comparison data
  result := JSON_BUILD_OBJECT(
    'activeMembers', active_members_count,
    'membersGrowth', members_growth, -- New members count this month
    'pendingApplications', pending_applications_count,
    'monthlyAid', monthly_aid_total,
    'aidGrowth', ROUND(aid_growth, 1),
    'monthlyDonations', monthly_donation_total,
    'donationGrowth', ROUND(donation_growth, 1),
    'aidDistribution', COALESCE(aid_distribution, '[]'::JSON),
    'recentApplications', COALESCE(recent_applications, '[]'::JSON),
    'recentMembers', COALESCE(recent_members, '[]'::JSON),
    'beneficiaryCounts', beneficiary_counts
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
