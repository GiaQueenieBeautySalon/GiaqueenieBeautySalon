// src/hooks/useRealtime.js
import { useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export const useRealtime = (table, callback, dependencies = []) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload) => {
          console.log(`🔄 ${table} changed:`, payload.eventType)
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, ...dependencies])
}