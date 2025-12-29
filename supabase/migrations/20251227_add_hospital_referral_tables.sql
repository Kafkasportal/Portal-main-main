-- Hospital Referral and Treatment Tracking Tables

-- 1. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  specialties TEXT[], -- Array of medical specialties
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'referred' CHECK (status IN ('referred', 'scheduled', 'treated', 'follow-up', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.hospital_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  location TEXT, -- Specific department or room
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TREATMENT COSTS TABLE
CREATE TABLE IF NOT EXISTS public.treatment_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'EUR', 'USD')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid')),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('nakit', 'havale', 'elden')),
  incurred_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. OUTCOMES TABLE
CREATE TABLE IF NOT EXISTS public.treatment_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.hospital_appointments(id) ON DELETE SET NULL,
  diagnosis TEXT,
  treatment_received TEXT,
  outcome_notes TEXT,
  follow_up_needed BOOLEAN NOT NULL DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON public.hospitals(name);
CREATE INDEX IF NOT EXISTS idx_referrals_beneficiary ON public.referrals(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_referrals_hospital ON public.referrals(hospital_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_appointments_referral ON public.hospital_appointments(referral_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.hospital_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_costs_referral ON public.treatment_costs(referral_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_referral ON public.treatment_outcomes(referral_id);

-- RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_outcomes ENABLE ROW LEVEL SECURITY;

-- POLICIES (Full access for authenticated users for now, matching other tables)
CREATE POLICY "Authenticated users can manage hospitals" ON public.hospitals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage referrals" ON public.referrals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage appointments" ON public.hospital_appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage costs" ON public.treatment_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage outcomes" ON public.treatment_outcomes FOR ALL USING (auth.role() = 'authenticated');

-- TRIGGERS
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.hospital_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_costs_updated_at BEFORE UPDATE ON public.treatment_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_outcomes_updated_at BEFORE UPDATE ON public.treatment_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
