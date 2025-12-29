import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('Seeding database...')

  // 1. Create a test member
  const testMember = {
    tc_kimlik_no: '11111111111',
    ad: 'Test',
    soyad: 'Uye',
    telefon: '5551234567',
    cinsiyet: 'erkek',
    uye_turu: 'standart',
    aidat_durumu: 'odendi',
    adres: 'Istanbul, Turkey',
  }

  const { data: member, error: memberError } = await supabase
    .from('members')
    .upsert(testMember, { onConflict: 'tc_kimlik_no' })
    .select()
    .single()

  if (memberError) {
    console.error('Error creating member:', memberError)
  } else {
    console.log('Test member created:', member.ad)
  }

  // 2. Create a test beneficiary
  const testBeneficiary = {
    tc_kimlik_no: '22222222222',
    ad: 'Ihtiyac',
    soyad: 'Sahibi',
    telefon: '5559876543',
    cinsiyet: 'kadin',
    durum: 'aktif',
    ihtiyac_durumu: 'yuksek',
    adres: 'Ankara, Turkey',
    relationship_type: 'İhtiyaç Sahibi Kişi',
  }

  const { data: beneficiary, error: beneficiaryError } = await supabase
    .from('beneficiaries')
    .upsert(testBeneficiary, { onConflict: 'tc_kimlik_no' })
    .select()
    .single()

  if (beneficiaryError) {
    console.error('Error creating beneficiary:', beneficiaryError)
  } else {
    console.log('Test beneficiary created:', beneficiary.ad)
  }

  // 3. Create a test donation (linked to member)
  if (member) {
    const testDonation = {
      bagisci_adi: `${member.ad} ${member.soyad}`,
      tutar: 500,
      currency: 'TRY',
      amac: 'genel',
      odeme_yontemi: 'kredi_karti',
      member_id: member.id,
      durum: 'tamamlandi', // Note: This field might not exist in DB schema based on my previous read, but let's check.
      // Schema says: donations table does NOT have 'durum' column. It has 'tarih', 'aciklama', etc.
      // Wait, let me re-check schema.sql content I just read.
      // Schema: donations (bagisci_adi, tutar, currency, amac, odeme_yontemi, makbuz_no, tarih, aciklama, member_id)
      // No 'durum' column in donations table in schema.sql.
      // BUT types/supabase.ts might have it? Let's check.
      // types/supabase.ts -> donations -> Row -> NO 'durum'.
      // However, src/types/index.ts -> Bagis interface -> HAS 'durum'.
      // This means 'durum' is likely derived or I missed it.
      // Ah, mapDonation function in supabase-service.ts hardcodes `durum: 'tamamlandi'`.
      // So I should NOT insert 'durum'.
    }

    // Removing 'durum' from insert object
    const { bagisci_adi, tutar, currency, amac, odeme_yontemi, member_id } =
      testDonation as Record<string, unknown>

    const { error: donationError } = await supabase.from('donations').insert({
      bagisci_adi,
      tutar,
      currency,
      amac,
      odeme_yontemi,
      member_id,
    })

    if (donationError) {
      console.error('Error creating donation:', donationError)
    } else {
      console.log('Test donation created.')
    }
  }

  console.log('Seeding completed.')
}

seed().catch(console.error)
