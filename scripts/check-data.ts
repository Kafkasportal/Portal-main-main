import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkData() {
  console.log('Checking database data...')

  const { data: members } = await supabase.from('members').select('*')
  console.log('Members:', members?.length || 0, 'records')
  if (members?.length) {
    members.forEach((m) =>
      console.log('  -', m.ad, m.soyad, '(' + m.tc_kimlik_no + ')')
    )
  }

  const { data: beneficiaries } = await supabase
    .from('beneficiaries')
    .select('*')
  console.log('Beneficiaries:', beneficiaries?.length || 0, 'records')
  if (beneficiaries?.length) {
    beneficiaries.forEach((b) =>
      console.log('  -', b.ad, b.soyad, '(' + b.tc_kimlik_no + ')')
    )
  }

  const { data: donations } = await supabase.from('donations').select('*')
  console.log('Donations:', donations?.length || 0, 'records')
  if (donations?.length) {
    donations.forEach((d) =>
      console.log('  -', d.bagisci_adi, d.tutar, d.currency)
    )
  }
}

checkData().catch(console.error)
