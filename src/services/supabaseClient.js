import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oalccaxnnmetckuwaxbl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WHQS8B3aL7hNT33bfS-z9w_J_k6PqFp'

// Custom storage with error handling to prevent corruption
const customStorage = {
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key)
      if (!value) return null
      return JSON.parse(value)
    } catch (error) {
      console.error('Storage getItem error:', error)
      // Remove corrupted item
      localStorage.removeItem(key)
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage setItem error:', error)
      // If storage is full, clear old items
      if (error.name === 'QuotaExceededError') {
        const keys = Object.keys(localStorage)
        for (const k of keys) {
          if (k.includes('sb-') && !k.includes('current')) {
            localStorage.removeItem(k)
          }
        }
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (e) {
          console.error('Still cannot save to storage')
        }
      }
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage removeItem error:', error)
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorage, // Use custom storage with error handling
    storageKey: 'giaqueenie-auth', // Custom key to avoid conflicts
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper to check and fix auth state
export const checkAndFixAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth session error:', error)
      // Clear potentially corrupted session
      await supabase.auth.signOut()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Auth check error:', error)
    return null
  }
}

export const isAdminUser = async (userId) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) return false
    return user?.role === 'admin'
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}

// Add a method to completely reset auth state if stuck
export const resetAuthState = async () => {
  console.log('🔄 Resetting auth state...')
  
  try {
    // Sign out
    await supabase.auth.signOut()
    
    // Clear all supabase-related storage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('giaqueenie'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Clear session storage
    sessionStorage.clear()
    
    console.log('✅ Auth state reset complete')
    return true
  } catch (error) {
    console.error('Error resetting auth:', error)
    return false
  }
}

// Export this to window for debugging
if (typeof window !== 'undefined') {
  window.resetGiaqueenie = resetAuthState
}