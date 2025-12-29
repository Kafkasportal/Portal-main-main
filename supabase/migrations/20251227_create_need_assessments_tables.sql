-- =============================================
-- NEED ASSESSMENTS TABLE (İhtiyaç Değerlendirmesi)
-- =============================================

CREATE TABLE IF NOT EXISTS public.need_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  
  -- Assessment Metadata
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  assessment_type TEXT NOT NULL DEFAULT 'initial' CHECK (assessment_type IN ('initial', 'follow-up', 'review', 'updated')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'in-progress', 'completed', 'archived')),
  
  -- Family Composition
  household_size INTEGER NOT NULL,
  dependent_count INTEGER NOT NULL DEFAULT 0,
  children_count INTEGER NOT NULL DEFAULT 0,
  elderly_count INTEGER NOT NULL DEFAULT 0,
  disabled_count INTEGER NOT NULL DEFAULT 0,
  orphans_count INTEGER NOT NULL DEFAULT 0,
  
  -- Income Documentation
  monthly_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  income_sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of income sources
  income_verified BOOLEAN DEFAULT FALSE,
  income_documentation TEXT, -- Path or reference to income docs
  
  -- Expense Documentation
  monthly_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  rent_expense DECIMAL(12, 2) DEFAULT 0,
  utilities_expense DECIMAL(12, 2) DEFAULT 0,
  food_expense DECIMAL(12, 2) DEFAULT 0,
  health_expense DECIMAL(12, 2) DEFAULT 0,
  education_expense DECIMAL(12, 2) DEFAULT 0,
  other_expenses DECIMAL(12, 2) DEFAULT 0,
  
  -- Housing & Living Situation
  housing_type TEXT NOT NULL DEFAULT 'rented' CHECK (housing_type IN ('owned', 'rented', 'shared', 'shelter', 'informal')),
  housing_condition TEXT DEFAULT 'fair' CHECK (housing_condition IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  has_utilities BOOLEAN DEFAULT FALSE,
  
  -- Specific Needs & Challenges
  health_issues TEXT[] DEFAULT ARRAY[]::TEXT[], -- Health challenges
  education_needs TEXT[] DEFAULT ARRAY[]::TEXT[], -- Educational support needs
  employment_status TEXT DEFAULT 'unemployed' CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'student', 'retired', 'disabled')),
  specific_needs JSONB DEFAULT '{}'::JSONB, -- Flexible field for specific needs
  
  -- Priority Scoring
  priority_score INTEGER DEFAULT 0, -- Calculated based on criteria (0-100)
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('critical', 'high', 'medium', 'low')),
  
  -- Recommendations
  recommended_aid_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_aid_amount DECIMAL(12, 2) DEFAULT 0,
  assessment_notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- NEED ASSESSMENT DEPENDENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessment_dependents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.need_assessments(id) ON DELETE CASCADE,
  
  -- Dependent Information
  name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- e.g., 'child', 'parent', 'sibling', 'spouse'
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  
  -- Status
  health_status TEXT DEFAULT 'healthy', -- e.g., 'healthy', 'chronic-illness', 'disabled', 'elderly'
  education_status TEXT DEFAULT 'not-applicable', -- e.g., 'student', 'not-attending', 'completed'
  employment_status TEXT DEFAULT 'none', -- e.g., 'employed', 'student', 'unemployed', 'none'
  
  -- Support Needs
  support_needs TEXT[] DEFAULT ARRAY[]::TEXT[],
  monthly_cost DECIMAL(12, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ASSESSMENT DOCUMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessment_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.need_assessments(id) ON DELETE CASCADE,
  
  -- Document Info
  document_type TEXT NOT NULL, -- e.g., 'income-proof', 'expense-proof', 'health-record', 'housing-photo'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ASSESSMENT HISTORY VIEW
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.need_assessments(id) ON DELETE CASCADE,
  
  -- Historical tracking
  assessment_date DATE NOT NULL,
  priority_level TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  household_size INTEGER NOT NULL,
  monthly_income DECIMAL(12, 2) NOT NULL,
  monthly_expenses DECIMAL(12, 2) NOT NULL,
  recommended_aid_amount DECIMAL(12, 2),
  assessor_name TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_assessments_beneficiary ON public.need_assessments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON public.need_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.need_assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_priority ON public.need_assessments(priority_level);
CREATE INDEX IF NOT EXISTS idx_assessments_assessor ON public.need_assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_dependents_assessment ON public.assessment_dependents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_documents_assessment ON public.assessment_documents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_history_beneficiary ON public.assessment_history(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON public.assessment_history(assessment_date DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.need_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_history ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view/manage assessments
CREATE POLICY "Authenticated users can manage assessments" ON public.need_assessments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assessment dependents" ON public.assessment_dependents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assessment documents" ON public.assessment_documents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view assessment history" ON public.assessment_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.need_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- FUNCTION: Calculate Priority Score
-- =============================================

CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_household_size INTEGER,
  p_monthly_income DECIMAL,
  p_monthly_expenses DECIMAL,
  p_dependent_count INTEGER,
  p_disabled_count INTEGER,
  p_health_issues_count INTEGER,
  p_housing_condition TEXT
)
RETURNS TABLE(score INTEGER, priority_level TEXT) AS $$
DECLARE
  v_score INTEGER := 0;
  v_priority_level TEXT;
BEGIN
  -- Income-to-expense ratio (base: 30 points)
  IF p_monthly_expenses > 0 THEN
    v_score := v_score + LEAST(30, (p_monthly_expenses::DECIMAL / NULLIF(p_monthly_income, 0))::INTEGER * 15);
  ELSE
    v_score := v_score + 30;
  END IF;
  
  -- Household size (base: 20 points)
  v_score := v_score + LEAST(20, p_household_size * 4);
  
  -- Dependents (base: 20 points)
  v_score := v_score + LEAST(20, p_dependent_count * 5);
  
  -- Disabled/health issues (base: 15 points)
  v_score := v_score + (p_disabled_count * 5) + (p_health_issues_count * 2);
  
  -- Housing condition (base: 15 points)
  CASE p_housing_condition
    WHEN 'critical' THEN v_score := v_score + 15
    WHEN 'poor' THEN v_score := v_score + 12
    WHEN 'fair' THEN v_score := v_score + 8
    WHEN 'good' THEN v_score := v_score + 3
    ELSE v_score := v_score + 0
  END CASE;
  
  -- Cap at 100
  v_score := LEAST(v_score, 100);
  
  -- Determine priority level
  IF v_score >= 80 THEN
    v_priority_level := 'critical';
  ELSIF v_score >= 60 THEN
    v_priority_level := 'high';
  ELSIF v_score >= 40 THEN
    v_priority_level := 'medium';
  ELSE
    v_priority_level := 'low';
  END IF;
  
  RETURN QUERY SELECT v_score, v_priority_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
