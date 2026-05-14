import { createClient } from './supabase/server'

// Server-side Supabase client (for API routes)
export const getServerClient = () => {
  return createClient()
}
