import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oalccaxnnmetckuwaxbl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WHQS8B3aL7hNT33bfS-z9w_J_k6PqFp'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }
})

export const isAdminUser = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error) return false
  return user?.role === 'admin'
}