import * as mockService from './mock-service'
import * as supabaseService from './supabase-service'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

const service = USE_MOCK ? mockService : supabaseService

export default service
