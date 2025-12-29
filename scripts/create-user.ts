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

async function createUser() {
  console.log('Creating test user...')

  const email = 'demo@kafkasder.org'
  const password = 'demo123456'

  // Check if user exists first?
  // admin.createUser will return error if exists or we can list users.
  // But createUser with upsert? No.
  // Just try to create.

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      ad: 'Demo',
      soyad: 'Kullanici',
      role: 'admin',
    },
  })

  if (error) {
    console.error('Error creating user:', error.message)
    // If user already exists, that's fine for our purpose
  } else {
    console.log('User created:', data.user.id)
  }
}

createUser().catch(console.error)
