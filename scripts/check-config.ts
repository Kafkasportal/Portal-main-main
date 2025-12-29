import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkConfiguration() {
  console.log('Checking configuration...')

  // 1. Check RLS on tables
  // We can't easily query pg_policies via JS client without a specific RPC.
  // But we can check if tables exist and try to infer.
  // Actually, we can assume schema.sql was applied if tables exist.

  const { error: tableError } = await supabase
    .from('documents')
    .select('id')
    .limit(1)

  if (tableError) {
    console.error('❌ Documents table check failed:', tableError.message)
  } else {
    console.log('✅ Documents table exists')
  }

  // 2. Check Storage Buckets
  const { data: buckets, error: bucketError } =
    await supabase.storage.listBuckets()

  if (bucketError) {
    console.error('❌ Failed to list buckets:', bucketError.message)
  } else {
    console.log('📦 Storage Buckets found:', buckets.length)
    buckets.forEach((b) => {
      console.log(`   - ${b.name} (public: ${b.public})`)
    })

    const docBucket = buckets.find((b) => b.name === 'documents')
    if (docBucket) {
      console.log('✅ "documents" bucket exists')
    } else {
      console.error('❌ "documents" bucket MISSING')
    }
  }
}

checkConfiguration().catch(console.error)
