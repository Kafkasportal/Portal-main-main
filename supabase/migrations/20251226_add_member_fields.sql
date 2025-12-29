-- Add missing fields to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS kan_grubu TEXT,
ADD COLUMN IF NOT EXISTS meslek TEXT,
ADD COLUMN IF NOT EXISTS il TEXT,
ADD COLUMN IF NOT EXISTS ilce TEXT;

-- Add indexes for the new fields to improve filtering performance
CREATE INDEX IF NOT EXISTS idx_members_kan_grubu ON public.members(kan_grubu);
CREATE INDEX IF NOT EXISTS idx_members_meslek ON public.members(meslek);
CREATE INDEX IF NOT EXISTS idx_members_il ON public.members(il);
